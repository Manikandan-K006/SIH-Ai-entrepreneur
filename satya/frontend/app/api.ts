import { Language } from "./translations";

const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
const API_BASE = RAW_API_URL.endsWith("/api/v1")
  ? RAW_API_URL
  : `${RAW_API_URL.replace(/\/$/, "")}/api/v1`;

interface FetchOptions extends RequestInit {
  token?: string;
}

export function getLanguage(): Language {
  if (typeof window !== "undefined") {
    return (localStorage.getItem("satya_lang") as Language) || "en";
  }
  return "en";
}

export function setLanguage(lang: Language) {
  if (typeof window !== "undefined") {
    localStorage.setItem("satya_lang", lang);
    window.dispatchEvent(new Event("languageChanged"));
  }
}

export function getToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("satya_token");
  }
  return null;
}

export function getUserRole(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("satya_role");
  }
  return null;
}

export function getUserName(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("satya_name");
  }
  return null;
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("satya_token");
    localStorage.removeItem("satya_refresh_token");
    localStorage.removeItem("satya_role");
    localStorage.removeItem("satya_name");
    localStorage.removeItem("satya_user_id");
    window.location.href = "/login";
  }
}

async function request<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });
  } catch (err: any) {
    throw new Error(
      `Unable to connect to backend server at ${API_BASE}. Please ensure the backend server is running.`
    );
  }

  if (response.status === 401) {
    // Session expired
    logout();
    throw new Error("Session expired. Please login again.");
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: "An error occurred" }));
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Auth
  async login(email: string, password: string) {
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    let res: Response;
    try {
      res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData,
      });
    } catch (err: any) {
      throw new Error(
        `Unable to connect to backend server at ${API_BASE}. Please ensure the backend server is running.`
      );
    }

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ detail: "Incorrect login details" }));
      throw new Error(errorData.detail || "Authentication failed");
    }

    const data = await res.json();
    localStorage.setItem("satya_token", data.access_token);
    localStorage.setItem("satya_refresh_token", data.refresh_token);
    localStorage.setItem("satya_role", data.role);
    localStorage.setItem("satya_name", data.full_name);
    localStorage.setItem("satya_user_id", data.user_id.toString());
    return data;
  },

  async register(email: string, password: string, fullName: string, role: string, lang: Language) {
    const data: any = await request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, full_name: fullName, role, preferred_language: lang }),
    });
    localStorage.setItem("satya_token", data.access_token);
    localStorage.setItem("satya_refresh_token", data.refresh_token);
    localStorage.setItem("satya_role", data.role);
    localStorage.setItem("satya_name", data.full_name);
    localStorage.setItem("satya_user_id", data.user_id.toString());
    return data;
  },

  async getMe() {
    return request("/auth/me");
  },

  // Onboarding & Profile
  async getProfile() {
    return request<any>("/profile/entrepreneur");
  },

  async updateProfile(profileData: any) {
    return request<any>("/profile/entrepreneur", {
      method: "POST",
      body: JSON.stringify(profileData),
    });
  },

  // SATYA AI Chat
  async sendMessage(content: string, sessionId?: string, language?: Language) {
    return request<any>("/ai/chat", {
      method: "POST",
      body: JSON.stringify({
        content,
        session_id: sessionId,
        language: language || getLanguage(),
      }),
    });
  },

  async getConversations() {
    return request<any[]>("/ai/conversations");
  },

  async getConversationMessages(sessionId: string) {
    return request<any[]>(`/ai/conversations/${sessionId}/messages`);
  },

  // Business AI
  async analyzeBusiness(businessIdea: string, location: string, capital: number, skills: string[], resources?: string) {
    return request<any>("/business/analyze", {
      method: "POST",
      body: JSON.stringify({
        business_idea: businessIdea,
        location,
        capital,
        skills,
        resources,
        language: getLanguage(),
      }),
    });
  },

  async generateBusinessPlan(businessIdea: string, location: string, capital: number, skills: string[], resources?: string, teamSize: number = 1) {
    return request<any>("/business/plan/generate", {
      method: "POST",
      body: JSON.stringify({
        business_idea: businessIdea,
        location,
        capital,
        skills,
        resources,
        team_size: teamSize,
        language: getLanguage(),
      }),
    });
  },

  async getBusinessPlans() {
    return request<any[]>("/business/plans");
  },

  async getBusinessPlan(id: number) {
    return request<any>(`/business/plans/${id}`);
  },

  async getBusinessProfile() {
    return request<any>("/business/profile");
  },

  // Financial Planner
  async calculateFinancial(input: any) {
    return request<any>("/financial/calculate", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async getFinancialPlans() {
    return request<any[]>("/financial/plans");
  },

  async getFinancialPlan(id: number) {
    return request<any>(`/financial/plans/${id}`);
  },

  // Government Schemes
  async searchSchemes(query: string, category?: string, state?: string) {
    let url = `/schemes/search?query=${encodeURIComponent(query)}`;
    if (category) url += `&business_category=${encodeURIComponent(category)}`;
    if (state) url += `&state=${encodeURIComponent(state)}`;
    return request<any>(url);
  },

  async listSchemes(category?: string, state?: string) {
    let url = "/schemes/list";
    const params: string[] = [];
    if (category) params.push(`category=${encodeURIComponent(category)}`);
    if (state) params.push(`state=${encodeURIComponent(state)}`);
    if (params.length) url += `?${params.join("&")}`;
    return request<any[]>(url);
  },

  async getScheme(id: number) {
    return request<any>(`/schemes/${id}`);
  },

  // Network Directory & Matches
  async getMatches() {
    return request<any>("/network/matches");
  },

  async getMarketAnalysis(state: string, district: string, category: string) {
    return request<any>(`/network/market?state=${encodeURIComponent(state)}&district=${encodeURIComponent(district)}&business_category=${encodeURIComponent(category)}`);
  },

  async listMentors(category?: string, state?: string) {
    let url = "/network/mentors";
    const params: string[] = [];
    if (category) params.push(`category=${encodeURIComponent(category)}`);
    if (state) params.push(`state=${encodeURIComponent(state)}`);
    if (params.length) url += `?${params.join("&")}`;
    return request<any[]>(url);
  },

  async listSuppliers(category?: string, state?: string) {
    let url = "/network/suppliers";
    const params: string[] = [];
    if (category) params.push(`category=${encodeURIComponent(category)}`);
    if (state) params.push(`state=${encodeURIComponent(state)}`);
    if (params.length) url += `?${params.join("&")}`;
    return request<any[]>(url);
  },

  async listBuyers(state?: string) {
    let url = "/network/buyers";
    if (state) url += `?state=${encodeURIComponent(state)}`;
    return request<any[]>(url);
  },

  async listOrganizations(state?: string, orgType?: string) {
    let url = "/network/organizations";
    const params: string[] = [];
    if (state) params.push(`state=${encodeURIComponent(state)}`);
    if (orgType) params.push(`org_type=${encodeURIComponent(orgType)}`);
    if (params.length) url += `?${params.join("&")}`;
    return request<any[]>(url);
  },

  // Communication
  async sendConnectionRequest(data: any) {
    return request<any>("/communication/connect", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getConnections() {
    return request<any>("/communication/connections");
  },

  async respondToConnection(requestId: number, action: "accept" | "reject") {
    return request<any>(`/communication/connections/${requestId}/respond?action=${action}`, {
      method: "PUT",
    });
  },

  async sendMessageToUser(receiverId: number, content: string) {
    return request<any>("/communication/messages/send", {
      method: "POST",
      body: JSON.stringify({ receiver_id: receiverId, content }),
    });
  },

  async getMessagesWithUser(otherUserId: number) {
    return request<any[]>(`/communication/messages/${otherUserId}`);
  },

  async getNotifications(unreadOnly = false) {
    return request<any[]>(`/communication/notifications?unread_only=${unreadOnly}`);
  },

  async markAllNotificationsRead() {
    return request<any>("/communication/notifications/read-all", {
      method: "PUT",
    });
  },

  // Admin
  async getAdminStats() {
    return request<any>("/admin/stats");
  },

  async listUsers() {
    return request<any[]>("/admin/users");
  },

  async toggleUserActive(userId: number) {
    return request<any>(`/admin/users/${userId}/toggle-active`, {
      method: "PUT",
    });
  },

  async getAILogs() {
    return request<any[]>("/admin/ai-logs");
  },

  // Customer Portal & AI Search
  async getCustomerProfile() {
    return request<any>("/customer/profile");
  },

  async updateCustomerProfile(data: any) {
    return request<any>("/customer/profile", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async aiCustomerSearch(query: string, location?: string) {
    let url = `/customer/search/ai?query=${encodeURIComponent(query)}`;
    if (location) url += `&location=${encodeURIComponent(location)}`;
    return request<any>(url);
  },

  async submitReview(businessProfileId: number, rating: number, comment?: string) {
    return request<any>("/customer/reviews", {
      method: "POST",
      body: JSON.stringify({ business_profile_id: businessProfileId, rating, comment }),
    });
  },

  async toggleSaveBusiness(businessProfileId: number) {
    return request<any>(`/customer/saved/${businessProfileId}`, {
      method: "POST",
    });
  },

  // Marketplace
  async listMarketplaceProducts(category?: string, businessId?: number) {
    let url = "/marketplace/products";
    const params: string[] = [];
    if (category) params.push(`category=${encodeURIComponent(category)}`);
    if (businessId) params.push(`business_id=${businessId}`);
    if (params.length) url += `?${params.join("&")}`;
    return request<any[]>(url);
  },

  async addProduct(productData: any) {
    return request<any>("/marketplace/products", {
      method: "POST",
      body: JSON.stringify(productData),
    });
  },

  async deleteProduct(productId: number) {
    return request<any>(`/marketplace/products/${productId}`, {
      method: "DELETE",
    });
  },

  async createOrder(orderData: any) {
    return request<any>("/marketplace/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    });
  },

  async getOrders() {
    return request<any>("/marketplace/orders");
  },

  async updateOrderStatus(orderId: number, status: string) {
    return request<any>(`/marketplace/orders/${orderId}/status?status=${status}`, {
      method: "PUT",
    });
  },

  // AI Marketing Assistant
  async generateMarketing(data: { product_or_business: string; location?: string; budget?: number; target_audience?: string; language?: string }) {
    return request<any>("/marketing/generate", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Paid Promotions
  async createPromotion(promoData: any) {
    return request<any>("/promotions/campaigns", {
      method: "POST",
      body: JSON.stringify(promoData),
    });
  },

  async getMyPromotions() {
    return request<any[]>("/promotions/campaigns");
  },

  async getActivePromotions(category?: string, district?: string) {
    let url = "/promotions/active";
    const params: string[] = [];
    if (category) params.push(`category=${encodeURIComponent(category)}`);
    if (district) params.push(`district=${encodeURIComponent(district)}`);
    if (params.length) url += `?${params.join("&")}`;
    return request<any[]>(url);
  },

  // Digital Business Card
  async getMyDigitalCard() {
    return request<any>("/card/my-card");
  },

  async getPublicDigitalCard(shareCode: string) {
    return request<any>(`/card/public/${shareCode}`);
  },

  // Voice Helpline & IVR
  async startIVR(callerNumber = "+919876543210") {
    return request<any>("/voice/ivr-start", {
      method: "POST",
      body: JSON.stringify({ caller_number: callerNumber }),
    });
  },

  async sendDTMF(sessionId: string, keyPressed: string) {
    return request<any>("/voice/dtmf", {
      method: "POST",
      body: JSON.stringify({ session_id: sessionId, key_pressed: keyPressed }),
    });
  },

  async sendSpeechInput(sessionId: string, speechText: string, language = "ta") {
    return request<any>("/voice/process-speech", {
      method: "POST",
      body: JSON.stringify({ session_id: sessionId, speech_text: speechText, language }),
    });
  },

  async triggerMissedCall(callerNumber = "+919876543210") {
    return request<any>("/voice/missed-call", {
      method: "POST",
      body: JSON.stringify({ caller_number: callerNumber }),
    });
  },

  async sendSMSFallback(phone: string, text: string) {
    return request<any>(`/voice/sms-fallback?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(text)}`, {
      method: "POST",
    });
  },

  // Farmer & Agri-Entrepreneur Hub
  async getFarmerProfile() {
    return request<any>("/farmer/profile");
  },

  async updateFarmerProfile(data: any) {
    return request<any>("/farmer/profile", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async analyzeAgriEnterprise(data: { business_idea: string; location?: string; capital?: number; required_investment?: number; resources?: string; skills?: string }) {
    return request<any>("/farmer/analyze", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async recordAgriFinancials(data: { month_year: string; sales_revenue: number; input_cost: number; transport_cost: number; labour_cost: number; equipment_cost: number; other_expense: number }) {
    return request<any>("/farmer/financial-records", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getAgriFinancialRecords() {
    return request<any[]>("/farmer/financial-records");
  },

  // Funding Gap & Loan Readiness Assessment (0-100)
  async calculateFundingGap(projectCost: number, availableCapital: number) {
    return request<any>("/financial/funding-gap", {
      method: "POST",
      body: JSON.stringify({ project_cost: projectCost, available_capital: availableCapital }),
    });
  },

  async assessLoanReadiness(data: { business_idea?: string; project_cost: number; available_capital: number; monthly_expenses: number; expected_revenue: number; has_identity_doc?: boolean; has_address_proof?: boolean; experience_years?: number }) {
    return request<any>("/financial/loan-readiness", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async compareVerifiedLoans(category?: string) {
    return request<any[]>("/financial/compare-loans", {
      method: "POST",
      body: JSON.stringify({ category }),
    });
  },

  async prepareApplicationPackage(data: { business_name: string; business_type: string; project_cost: number; available_capital: number; monthly_revenue: number; monthly_expenses: number; scheme_id?: number }) {
    return request<any>("/financial/prepare-application", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getNextStepsRoadmap() {
    return request<any>("/business/next-steps");
  }
};
