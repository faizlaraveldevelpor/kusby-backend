"use client";

import React, { useState } from "react";
import { ShieldCheck, Phone, ArrowRight, Loader2, KeyRound, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { handleAdminLogin, verifyAdminOtp } from "@/utils/auth";

const COUNTRY_CODES = [
  { code: "92", country: "Pakistan", flag: "🇵🇰" },
  { code: "91", country: "India", flag: "🇮🇳" },
  { code: "1", country: "US / Canada", flag: "🇺🇸" },
  { code: "44", country: "UK", flag: "🇬🇧" },
  { code: "971", country: "UAE", flag: "🇦🇪" },
  { code: "966", country: "Saudi Arabia", flag: "🇸🇦" },
  { code: "973", country: "Bahrain", flag: "🇧🇭" },
  { code: "965", country: "Kuwait", flag: "🇰🇼" },
  { code: "974", country: "Qatar", flag: "🇶🇦" },
  { code: "968", country: "Oman", flag: "🇴🇲" },
  { code: "20", country: "Egypt", flag: "🇪🇬" },
  { code: "27", country: "South Africa", flag: "🇿🇦" },
  { code: "49", country: "Germany", flag: "🇩🇪" },
  { code: "33", country: "France", flag: "🇫🇷" },
  { code: "61", country: "Australia", flag: "🇦🇺" },
  { code: "81", country: "Japan", flag: "🇯🇵" },
  { code: "86", country: "China", flag: "🇨🇳" },
  { code: "90", country: "Turkey", flag: "🇹🇷" },
  { code: "62", country: "Indonesia", flag: "🇮🇩" },
  { code: "60", country: "Malaysia", flag: "🇲🇾" },
  { code: "65", country: "Singapore", flag: "🇸🇬" },
  { code: "234", country: "Nigeria", flag: "🇳🇬" },
  { code: "232", country: "Sierra Leone", flag: "🇸🇱" },
  { code: "254", country: "Kenya", flag: "🇰🇪" },
  { code: "55", country: "Brazil", flag: "🇧🇷" },
  { code: "52", country: "Mexico", flag: "🇲🇽" },
];

export default function AdminLoginPage() {
  const [countryCode, setCountryCode] = useState("92");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // 1: Number Input, 2: OTP Input
  const [loading, setLoading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const router = useRouter();

  const selectedCountry = COUNTRY_CODES.find((c) => c.code === countryCode) || COUNTRY_CODES[0];

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    let onlyNums = value.replace(/[^0-9]/g, "");
    if (countryCode !== "1" && onlyNums.startsWith("0")) {
      onlyNums = onlyNums.substring(1);
    }
    if (onlyNums.length <= 15) setPhone(onlyNums);
  };

  // --- Step 1: Request OTP ---
  const handleSubmitPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    const minLen = countryCode === "1" ? 10 : 10;
    if (!phone || phone.length < minLen) {
      alert(`Please enter a valid phone number (at least ${minLen} digits).`);
      return;
    }

    setLoading(true);
    const fullPhone = `+${countryCode}${phone}`;
    
    const result = await handleAdminLogin(fullPhone);

    if (result.success) {
      setStep(2); // Move to OTP step
    } else {
      alert(result.error || "Failed to send OTP. Are you an admin?");
    }
    setLoading(false);
  };

  // --- Step 2: Verify OTP ---
  const handleSubmitOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      alert("Please enter the 6-digit code.");
      return;
    }

    setLoading(true);
    const fullPhone = `+${countryCode}${phone}`;
    
    const result = await verifyAdminOtp(fullPhone, otp);
   console.log(result);
   
    if (result.success) {
      // Refresh to ensure middleware picks up the new cookie
      router.refresh();
      router.push("/admin");
    } else {
      alert(result.error || "Invalid OTP code.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] flex items-center justify-center p-4 font-sans text-zinc-900">
      <div className="w-full max-w-md">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex p-4 bg-zinc-900 rounded-[2.5rem] shadow-2xl shadow-zinc-200 mb-6">
            <ShieldCheck size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-2">
            {step === 1 ? "Admin Access" : "Verify OTP"}
          </h1>
          <p className="text-zinc-500 font-medium">
            {step === 1 
              ? "Select country and enter your number" 
              : `Code sent to +${countryCode} ${phone}`}
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-zinc-100 ring-1 ring-zinc-200/50">
          <form onSubmit={step === 1 ? handleSubmitPhone : handleSubmitOtp} className="space-y-6">
            
            {step === 1 ? (
              // Phone Input with Country Code Picker
              <div>
                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3 ml-1">
                  Phone Number
                </label>
                <div className="relative group flex rounded-2xl ring-1 ring-zinc-200 focus-within:ring-2 focus-within:ring-rose-500 bg-zinc-50 transition-all">
                  <div className="flex items-center gap-1.5 pl-4 pr-2 border-r border-zinc-200">
                    <Phone size={16} className="text-zinc-400 group-focus-within:text-rose-500 shrink-0" />
                    <button
                      type="button"
                      onClick={() => setPickerOpen((o) => !o)}
                      className="flex items-center gap-1.5 py-2 min-w-[72px] text-left"
                    >
                      <span className="text-lg" aria-hidden>{selectedCountry.flag}</span>
                      <span className="text-sm font-bold text-zinc-700">+{countryCode}</span>
                      <ChevronDown size={14} className={`text-zinc-400 shrink-0 transition-transform ${pickerOpen ? "rotate-180" : ""}`} />
                    </button>
                  </div>
                  {pickerOpen && (
                    <>
                      <div className="fixed inset-0 z-10" aria-hidden onClick={() => setPickerOpen(false)} />
                      <div className="absolute left-0 top-full mt-1 w-64 max-h-56 overflow-y-auto bg-white rounded-2xl shadow-xl border border-zinc-100 z-20 py-1">
                        {COUNTRY_CODES.map((c) => (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => {
                              setCountryCode(c.code);
                              setPickerOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-zinc-50 ${c.code === countryCode ? "bg-rose-50 text-rose-700" : "text-zinc-800"}`}
                          >
                            <span className="text-xl">{c.flag}</span>
                            <span className="font-medium text-sm">{c.country}</span>
                            <span className="ml-auto text-sm font-bold text-zinc-500">+{c.code}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                  <input 
                    type="text"
                    inputMode="numeric"
                    placeholder={countryCode === "1" ? "202 555 0123" : "300 1234567"}
                    value={phone}
                    onChange={handlePhoneChange}
                    className="flex-1 h-14 pl-3 pr-4 bg-transparent border-none rounded-r-2xl outline-none font-bold text-zinc-900 min-w-0"
                  />
                </div>
              </div>
            ) : (
              // OTP Input
              <div>
                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3 ml-1">
                  Security Code
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 border-r pr-3 border-zinc-100">
                    <KeyRound size={16} className="text-zinc-400 group-focus-within:text-rose-500 transition-colors" />
                  </div>
                  <input 
                    type="text"
                    inputMode="numeric"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                    className="w-full h-14 pl-16 pr-4 bg-zinc-50 border-none rounded-2xl ring-1 ring-zinc-200 focus:ring-2 focus:ring-rose-500 outline-none transition-all font-bold text-zinc-900 tracking-widest"
                  />
                </div>
                <button 
                  type="button" 
                  onClick={() => setStep(1)}
                  className="mt-3 text-[10px] font-bold text-rose-500 uppercase hover:underline"
                >
                  Change Number?
                </button>
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-400 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all shadow-xl shadow-zinc-200"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  {step === 1 ? "SEND OTP CODE" : "VERIFY & ENTER"}
                  <ArrowRight size={18} />
                </>
              )}
            </button>

          </form>

          <div className="mt-8 pt-8 border-t border-zinc-100 text-center">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">
              Restricted Area • Authorized Personnel Only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}