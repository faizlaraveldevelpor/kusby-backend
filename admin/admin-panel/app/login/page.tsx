"use client";

import React, { useState } from "react";
import { ShieldCheck, Phone, ArrowRight, Loader2, KeyRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { handleAdminLogin, verifyAdminOtp } from "@/utils/auth";

export default function AdminLoginPage() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // 1: Number Input, 2: OTP Input
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    let onlyNums = value.replace(/[^0-9]/g, "");
    if (onlyNums.startsWith("0")) {
      onlyNums = onlyNums.substring(1);
    }
    if (onlyNums.length <= 10) {
      setPhone(onlyNums);
    }
  };

  // --- Step 1: Request OTP ---
  const handleSubmitPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }

    setLoading(true);
    const fullPhone = `+92${phone}`;
    console.log(fullPhone);
    
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
    const fullPhone = `+92${phone}`;
    
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
              ? "Enter your number (excluding starting 0)" 
              : `Code sent to +92 ${phone}`}
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-zinc-100 ring-1 ring-zinc-200/50">
          <form onSubmit={step === 1 ? handleSubmitPhone : handleSubmitOtp} className="space-y-6">
            
            {step === 1 ? (
              // Phone Input
              <div>
                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3 ml-1">
                  Phone Number
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 border-r pr-3 border-zinc-100">
                    <Phone size={16} className="text-zinc-400 group-focus-within:text-rose-500 transition-colors" />
                    <span className="text-sm font-bold text-zinc-400">+92</span>
                  </div>
                  <input 
                    type="text"
                    inputMode="numeric"
                    placeholder="300 1234567"
                    value={phone}
                    onChange={handlePhoneChange}
                    className="w-full h-14 pl-20 pr-4 bg-zinc-50 border-none rounded-2xl ring-1 ring-zinc-200 focus:ring-2 focus:ring-rose-500 outline-none transition-all font-bold text-zinc-900"
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