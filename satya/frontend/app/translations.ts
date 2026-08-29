export type Language = "en" | "ta" | "hi";

export interface Translations {
  appName: string;
  appSubtitle: string;
  heroTitle: string;
  heroSubtitle: string;
  startJourney: string;
  exploreWorks: string;
  login: string;
  register: string;
  email: string;
  password: string;
  fullName: string;
  role: string;
  entrepreneur: string;
  mentor: string;
  supplier: string;
  buyer: string;
  preferredLanguage: string;
  next: string;
  back: string;
  submit: string;
  dashboard: string;
  askSatya: string;
  analyzeBusiness: string;
  createPlan: string;
  financialPlanner: string;
  govSchemes: string;
  localMarket: string;
  peopleNetwork: string;
  mentors: string;
  suppliers: string;
  buyers: string;
  progressTracker: string;
  adminDashboard: string;
  profile: string;
  settings: string;
  logout: string;
  opportunityScore: string;
  capital: string;
  location: string;
  businessStage: string;
  recommendedNext: string;
  recentMsgs: string;
  demoWarning: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    appName: "SATYA",
    appSubtitle: "Hyper-Local Business & Financial Assistant",
    heroTitle: "Turn Your Business Idea Into a Real Opportunity",
    heroSubtitle: "SATYA uses AI, local intelligence, financial planning, government information, and human connections to help rural entrepreneurs build and grow businesses.",
    startJourney: "Start Your Business Journey",
    exploreWorks: "Explore How SATYA Works",
    login: "Login",
    register: "Register",
    email: "Email Address",
    password: "Password",
    fullName: "Full Name",
    role: "I am a...",
    entrepreneur: "Rural Entrepreneur",
    mentor: "Business Mentor",
    supplier: "Input Supplier",
    buyer: "Product Buyer",
    preferredLanguage: "Preferred Language",
    next: "Next",
    back: "Back",
    submit: "Submit",
    dashboard: "Dashboard",
    askSatya: "Ask SATYA AI",
    analyzeBusiness: "Analyze My Business",
    createPlan: "Create Business Plan",
    financialPlanner: "Financial Planner",
    govSchemes: "Find Government Schemes",
    localMarket: "Analyze Local Market",
    peopleNetwork: "People Network",
    mentors: "Find Mentors",
    suppliers: "Find Suppliers",
    buyers: "Find Buyers",
    progressTracker: "Track Business",
    adminDashboard: "Admin Control",
    profile: "My Profile",
    settings: "Settings",
    logout: "Log Out",
    opportunityScore: "AI Opportunity Score",
    capital: "Available Capital",
    location: "Location",
    businessStage: "Business Stage",
    recommendedNext: "Recommended Next Action",
    recentMsgs: "Recent Messages",
    demoWarning: "Demo Data - For Illustration Only",
  },
  ta: {
    appName: "சத்யா (SATYA)",
    appSubtitle: "உள்ளூர் வணிகம் மற்றும் நிதி உதவியாளர்",
    heroTitle: "உங்கள் வணிக யோசனையை ஒரு உண்மையான வாய்ப்பாக மாற்றுங்கள்",
    heroSubtitle: "சத்யா AI, உள்ளூர் சந்தை அறிவு, நிதி திட்டமிடல், அரசு திட்டங்கள் மற்றும் மனித தொடர்புகளைப் பயன்படுத்தி கிராமப்புற தொழில்முனைவோருக்கு உதவுகிறது.",
    startJourney: "உங்கள் வணிக பயணத்தைத் தொடங்குங்கள்",
    exploreWorks: "சத்யா எவ்வாறு செயல்படுகிறது என்பதை ஆராயுங்கள்",
    login: "உள்நுழைக",
    register: "பதிவு செய்க",
    email: "மின்னஞ்சல் முகவரி",
    password: "கடவுச்சொல்",
    fullName: "முழு பெயர்",
    role: "நான் ஒரு...",
    entrepreneur: "கிராமப்புற தொழில்முனைவோர்",
    mentor: "வணிக வழிகாட்டி",
    supplier: "உள்ளீட்டு சப்ளையர்",
    buyer: "தயாரிப்பு வாங்குபவர்",
    preferredLanguage: "விருப்பமான மொழி",
    next: "அடுத்து",
    back: "பின்னால்",
    submit: "சமர்ப்பி",
    dashboard: "டாஷ்போர்டு",
    askSatya: "சத்யா AI-யிடம் கேளுங்கள்",
    analyzeBusiness: "என் வணிகத்தை பகுப்பாய்வு செய்",
    createPlan: "வணிகத் திட்டம் உருவாக்கு",
    financialPlanner: "நிதி திட்டமிடுபவர்",
    govSchemes: "அரசு திட்டங்களைக் கண்டறி",
    localMarket: "உள்ளூர் சந்தையை பகுப்பாய்வு செய்",
    peopleNetwork: "மக்கள் நெட்வொர்க்",
    mentors: "வழிகாட்டிகளைக் கண்டறி",
    suppliers: "சப்ளையர்களைக் கண்டறி",
    buyers: "வாங்குபவர்களைக் கண்டறி",
    progressTracker: "வணிகத்தை கண்காணிக்கவும்",
    adminDashboard: "நிர்வாகி டாஷ்போர்டு",
    profile: "என் சுயவிவரம்",
    settings: "அமைப்புகள்",
    logout: "வெளியேறு",
    opportunityScore: "AI வாய்ப்பு மதிப்பெண்",
    capital: "கிடைக்கக்கூடிய மூலதனம்",
    location: "இருப்பிடம்",
    businessStage: "வணிக நிலை",
    recommendedNext: "பரிந்துரைக்கப்பட்ட அடுத்த நடவடிக்கை",
    recentMsgs: "சமீபத்திய செய்திகள்",
    demoWarning: "டெமோ தரவு - விளக்கத்திற்காக மட்டுமே",
  },
  hi: {
    appName: "सत्या (SATYA)",
    appSubtitle: "हाइपर-लोकल बिजनेस और वित्तीय सहायक",
    heroTitle: "अपने व्यावसायिक विचार को एक वास्तविक अवसर में बदलें",
    heroSubtitle: "सत्या ग्रामीण उद्यमियों को व्यवसाय बनाने और बढ़ाने में मदद करने के लिए एआई, स्थानीय बाजार ज्ञान, वित्तीय योजना, सरकारी जानकारी और मानवीय संपर्कों का उपयोग करता है।",
    startJourney: "अपनी व्यावसायिक यात्रा शुरू करें",
    exploreWorks: "खोजें कि सत्या कैसे काम करता है",
    login: "लॉग इन करें",
    register: "पंजीकरण करें",
    email: "ईमेल पता",
    password: "पासवर्ड",
    fullName: "पूरा नाम",
    role: "मैं एक...",
    entrepreneur: "ग्रामीण उद्यमी",
    mentor: "बिजनेस मेंटर",
    supplier: "सामग्री आपूर्तिकर्ता (सप्लायर)",
    buyer: "उत्पाद खरीदार (बायर्स)",
    preferredLanguage: "पसंदीदा भाषा",
    next: "अगला",
    back: "पीछे",
    submit: "जमा करें",
    dashboard: "डैशबोर्ड",
    askSatya: "सत्या एआई से पूछें",
    analyzeBusiness: "व्यापार विश्लेषण",
    createPlan: "बिजनेस प्लान बनाएं",
    financialPlanner: "वित्तीय योजनाकार",
    govSchemes: "सरकारी योजनाएं खोजें",
    localMarket: "स्थानीय बाजार विश्लेषण",
    peopleNetwork: "पीपुल नेटवर्क",
    mentors: "मेंटर खोजें",
    suppliers: "सप्लायर्स खोजें",
    buyers: "बायर्स खोजें",
    progressTracker: "व्यवसाय ट्रैक करें",
    adminDashboard: "एडमिन डैशबोर्ड",
    profile: "मेरी प्रोफ़ाइल",
    settings: "सेटिंग्स",
    logout: "लॉग आउट",
    opportunityScore: "एआई अवसर स्कोर",
    capital: "उपलब्ध पूंजी",
    location: "स्थान",
    businessStage: "व्यापार चरण",
    recommendedNext: "अनुशंसित अगला कदम",
    recentMsgs: "हाल के संदेश",
    demoWarning: "डेमो डेटा - केवल चित्रण के लिए",
  }
};
