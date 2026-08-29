import { Language } from "./translations";

const API_BASE = "http://localhost:8000/api/v1";

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

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

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

    const res: any = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData,
    });

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
  }
};
