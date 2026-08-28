"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, getLanguage } from "../api";
import { translations, Language } from "../translations";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Compass, User, MapPin, Wrench, Coins, Users, ArrowRight, ArrowLeft, Loader2, ShieldCheck } from "lucide-react";

export default function OnboardingPage() {
  const [lang, setLang] = useState<Language>("en");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const router = useRouter();

  const t = translations[lang];

  // Onboarding fields
  const [age, setAge] = useState<number>(30);
  const [gender, setGender] = useState("prefer_not_to_say");
  const [state, setState] = useState("Tamil Nadu");
  const [district, setDistrict] = useState("Salem");
  const [villageTown, setVillageTown] = useState("");
  const [pincode, setPincode] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationConsent, setLocationConsent] = useState(false);
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("");
  const [education, setEducation] = useState("");
  const [category, setCategory] = useState("Food Processing");
  const [idea, setIdea] = useState("");
  const [existingBusiness, setExistingBusiness] = useState(false);
  const [stage, setStage] = useState("idea");
  const [capital, setCapital] = useState<number>(50000);
  const [investment, setInvestment] = useState<number>(100000);
  const [resources, setResources] = useState("");
  const [familyMembers, setFamilyMembers] = useState<number>(0);
  const [employees, setEmployees] = useState<number>(0);
  const [goals, setGoals] = useState("");
  const [incomeTarget, setIncomeTarget] = useState<number>(15000);

  useEffect(() => {
    setLang(getLanguage());
    const handleLangChange = () => setLang(getLanguage());
    window.addEventListener("languageChanged", handleLangChange);
    return () => window.removeEventListener("languageChanged", handleLangChange);
  }, []);

  const requestGps = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setLocationConsent(true);
        setGpsLoading(false);
      },
      () => {
        alert("Unable to retrieve location. Please check browser permissions.");
        setGpsLoading(false);
      }
    );
  };

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const skillsArray = skills.split(",").map((s) => s.trim()).filter((s) => s.length > 0);

    const profileData = {
      age,
      gender,
      state,
      district,
      village_town: villageTown,
      pincode,
      latitude,
      longitude,
      location_consent: locationConsent,
      skills: skillsArray,
      previous_experience: experience,
      education_level: education,
      business_category: category,
      business_idea: idea,
      is_existing_business: existingBusiness,
      business_stage: stage,
      available_capital: capital,
      expected_investment: investment,
      available_resources: resources,
      family_members_involved: familyMembers,
      employees_count: employees,
      business_goals: goals,
      monthly_income_target: incomeTarget,
      onboarding_completed: true,
    };

    try {
      await api.updateProfile(profileData);
      router.push("/dashboard");
    } catch (err) {
      alert("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-grow max-w-3xl w-full mx-auto px-4 py-12">
        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase mb-2">
            <span>Step {step} of 5</span>
            <span>{Math.round(((step - 1) / 4) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            ></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-border p-6 sm:p-8 shadow-premium space-y-6">
          
          {/* STEP 1: Personal Details */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Personal Details</h2>
                  <p className="text-xs text-gray-500">Tell us a bit about yourself</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Gender (Optional)</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
                  >
                    <option value="prefer_not_to_say">Prefer not to say</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Education Level</label>
                <input
                  type="text"
                  placeholder="e.g. 10th Pass, Diploma, Graduate"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={handleNext}
                  className="btn-interactive inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-xl font-bold shadow-glow"
                >
                  {t.next}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Location */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Your Location</h2>
                  <p className="text-xs text-gray-500">Helping us find hyper-local opportunities</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">State</label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-sm cursor-pointer"
                  >
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Hindi Belt">Hindi Belt (Uttar Pradesh/Bihar)</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">District</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g. Salem, Namakkal, Coimbatore"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Village / Town</label>
                  <input
                    type="text"
                    value={villageTown}
                    onChange={(e) => setVillageTown(e.target.value)}
                    placeholder="e.g. Yercaud"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Pincode</label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="636601"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-sm"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">GPS Location Access</h4>
                    <p className="text-xs text-gray-500">We search for markets & buyers near you. Location is kept private.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={requestGps}
                  disabled={gpsLoading}
                  className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary-hover shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {gpsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : locationConsent ? "Location Saved ✓" : "Grant Access"}
                </button>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="btn-interactive inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 font-bold"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t.back}
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="btn-interactive inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-xl font-bold shadow-glow"
                >
                  {t.next}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Skills & Experience */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Skills & Experience</h2>
                  <p className="text-xs text-gray-500">What skills and experience do you have?</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Your Skills (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. food processing, tailioring, farming, sales"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Previous Experience</label>
                <textarea
                  rows={4}
                  placeholder="Describe your previous work or if you've run a micro-business before."
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                ></textarea>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="btn-interactive inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 font-bold"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t.back}
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="btn-interactive inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-xl font-bold shadow-glow"
                >
                  {t.next}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Business Context */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Business Details</h2>
                  <p className="text-xs text-gray-500">Provide details about your business concept</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Business Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-sm cursor-pointer"
                  >
                    <option value="Food Processing">Food Processing</option>
                    <option value="Agriculture">Agriculture / Farming</option>
                    <option value="Dairy">Dairy & Animal Husbandry</option>
                    <option value="Textile">Textiles & Tailoring</option>
                    <option value="Handicrafts">Handicrafts & Artisanal</option>
                    <option value="Services">Retail & Services</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Stage</label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-sm cursor-pointer"
                  >
                    <option value="idea">Concept / Idea Stage</option>
                    <option value="startup">Just Launched / Under 6 months</option>
                    <option value="existing">Established Business</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Your Business Idea</label>
                <textarea
                  rows={3}
                  placeholder="Describe your business idea in detail (e.g. starting a spice packaging unit in Salem)"
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Available Capital (₹)</label>
                  <input
                    type="number"
                    value={capital}
                    onChange={(e) => setCapital(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Expected Investment (₹)</label>
                  <input
                    type="number"
                    value={investment}
                    onChange={(e) => setInvestment(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Available Resources (Tools, Land etc.)</label>
                <input
                  type="text"
                  placeholder="e.g. Small shed, mixer grinder, packing tables"
                  value={resources}
                  onChange={(e) => setResources(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-sm"
                />
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="btn-interactive inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 font-bold"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t.back}
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="btn-interactive inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-xl font-bold shadow-glow"
                >
                  {t.next}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Goals & Team */}
          {step === 5 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Team & Goals</h2>
                  <p className="text-xs text-gray-500">Tell us what you want to achieve</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Family Members Involved</label>
                  <input
                    type="number"
                    value={familyMembers}
                    onChange={(e) => setFamilyMembers(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Additional Employees</label>
                  <input
                    type="number"
                    value={employees}
                    onChange={(e) => setEmployees(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Business Goals</label>
                <textarea
                  rows={3}
                  placeholder="What are your goals? e.g. Sell locally, employ 3 women, double family income"
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Target Monthly Profit (₹)</label>
                <input
                  type="number"
                  value={incomeTarget}
                  onChange={(e) => setIncomeTarget(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-sm"
                />
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="btn-interactive inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 font-bold"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t.back}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-interactive inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-8 py-2.5 rounded-xl font-bold shadow-glow disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      {t.submit}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </form>
      </main>

      <Footer />
    </div>
  );
}
