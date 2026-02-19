/* eslint-disable no-alert */
"use client";

import React, { useState, useEffect } from "react";
import { 
  Settings, ShieldCheck, MapPin, Save, EyeOff, 
  Smartphone, CreditCard, Coffee, Plus, Trash2, Key, Loader2 
} from "lucide-react";
import { getIcebreakers, updateIcebreakers } from "@/utils/icebreakers";
import { getPaymentConfig, updatePaymentConfig } from "@/utils/payment";

export default function AdminSettingsPage() {
  // --- States ---
  const [icebreakers, setIcebreakers] = useState<string[]>([]);
  const [newIcebreaker, setNewIcebreaker] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [publishableKey, setPublishableKey] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [key, setKey] = useState("");
  const [url, setUrl] = useState("");
  const [paymentSaving, setPaymentSaving] = useState(false);

  // --- Fetch Data on Load ---
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [iceResult, paymentResult] = await Promise.all([
        getIcebreakers(),
        getPaymentConfig(),
      ]);
      if (iceResult.success) {
        setIcebreakers(iceResult.messages || []);
      } else {
        console.error("Fetch error:", iceResult.error);
      }
      if (paymentResult.success && paymentResult.data) {
        setPublishableKey(paymentResult.data.publishable_key ?? "");
        setWebhookSecret(paymentResult.data.webhook_secret ?? "");
        setKey(paymentResult.data.key ?? "");
        setUrl(paymentResult.data.url ?? "");
      }
      setLoading(false);
    }
    loadData();
  }, []);

  // --- Handlers ---
  const addIcebreaker = () => {
    if (newIcebreaker.trim()) {
      setIcebreakers([...icebreakers, newIcebreaker.trim()]);
      setNewIcebreaker("");
    }
  };

  const removeIcebreaker = (index: number) => {
    setIcebreakers(icebreakers.filter((_, i) => i !== index));
  };

  const handleGlobalSave = async () => {
    setIsSaving(true);
    const result = await updateIcebreakers(icebreakers);
    if (result.success) {
      alert("Icebreakers updated successfully!");
    } else {
      alert("Failed to save changes: " + result.error);
    }
    setIsSaving(false);
  };

  const handlePaymentSave = async () => {
    setPaymentSaving(true);
    const result = await updatePaymentConfig({
      publishable_key: publishableKey.trim() || null,
      webhook_secret: webhookSecret.trim() || null,
      key: key.trim() || null,
      url: url.trim() || null,
    });
    if (result.success) {
      alert("Payment keys updated in database!");
    } else {
      alert("Failed to save payment keys: " + result.error);
    }
    setPaymentSaving(false);
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] p-4 md:p-10 lg:p-16 font-sans text-zinc-900">
      
      {/* Header */}
      <header className="max-w-5xl mx-auto mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-100">
            <Settings size={24} className="text-white" />
          </div>
          <h1 className="text-4xl font-black tracking-tight">App Settings</h1>
        </div>
        <p className="text-zinc-500 font-medium ml-1">Configure payments and engagement tools.</p>
      </header>

      <div className="max-w-5xl mx-auto space-y-8">
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-indigo-600" size={40} />
            <p className="text-zinc-400 font-bold text-sm tracking-widest uppercase">Loading Database...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Payment Section – Supabase `payment` table se load/save */}
            <section className="bg-white rounded-[32px] p-8 border border-zinc-100 shadow-sm space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard size={18} className="text-blue-500" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Payment Gateway (Stripe)</h3>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-600 flex items-center gap-2">
                    <Key size={12} /> Publishable Key
                  </label>
                  <input 
                    type="password" 
                    placeholder="pk_test_... or pk_live_..."
                    value={publishableKey}
                    onChange={(e) => setPublishableKey(e.target.value)}
                    className="w-full h-11 px-4 bg-zinc-50 rounded-xl border-none text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-600 flex items-center gap-2">
                    <Key size={12} /> Webhook Secret
                  </label>
                  <input 
                    type="password" 
                    placeholder="whsec_..."
                    value={webhookSecret}
                    onChange={(e) => setWebhookSecret(e.target.value)}
                    className="w-full h-11 px-4 bg-zinc-50 rounded-xl border-none text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-600 flex items-center gap-2">
                    <Key size={12} /> Secret Key
                  </label>
                  <input 
                    type="password" 
                    placeholder="sk_test_... or sk_live_..."
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    className="w-full h-11 px-4 bg-zinc-50 rounded-xl border-none text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-600 flex items-center gap-2">
                    <MapPin size={12} /> URL
                  </label>
                  <input 
                    type="text" 
                    placeholder="https://..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full h-11 px-4 bg-zinc-50 rounded-xl border-none text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                </div>
                <button 
                  type="button"
                  onClick={handlePaymentSave}
                  disabled={paymentSaving}
                  className="h-11 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm flex items-center gap-2 disabled:opacity-60"
                >
                  {paymentSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {paymentSaving ? "Saving..." : "Save to table"}
                </button>
              </div>
            </section>

            {/* Moderation Section */}
            <section className="bg-white rounded-[32px] p-8 border border-zinc-100 shadow-sm space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck size={18} className="text-rose-500" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Moderation</h3>
              </div>
              <ToggleRow 
                icon={<EyeOff size={14} />}
                label="Blur Sensitive Content"
                description="Auto-blur explicit photos"
                defaultChecked={true}
              />
            </section>

            {/* Icebreakers Section */}
            <section className="bg-white rounded-[32px] p-8 border border-zinc-100 shadow-sm space-y-6 md:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Coffee size={18} className="text-orange-500" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Match Icebreakers</h3>
                </div>
                <span className="text-[10px] font-bold bg-orange-50 text-orange-600 px-2 py-1 rounded-lg">
                  {icebreakers.length} Active
                </span>
              </div>

              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newIcebreaker}
                  onChange={(e) => setNewIcebreaker(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addIcebreaker()}
                  placeholder="Add a new conversation starter..."
                  className="flex-1 h-12 px-5 bg-zinc-50 rounded-2xl border-none text-sm focus:ring-2 focus:ring-orange-500/20 outline-none font-bold"
                />
                <button 
                  type="button"
                  onClick={addIcebreaker}
                  className="h-12 px-6 bg-zinc-900 text-white rounded-2xl font-bold text-sm hover:bg-zinc-800 transition-all flex items-center gap-2 active:scale-95"
                >
                  <Plus size={18} /> Add
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-4">
                {icebreakers.map((text, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl group border border-transparent hover:border-orange-100 transition-all">
                    <p className="text-xs font-semibold text-zinc-700 truncate mr-2">{text}</p>
                    <button 
                      onClick={() => removeIcebreaker(index)}
                      className="p-2 text-zinc-300 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Footer */}
        <footer className="flex flex-col md:flex-row items-center justify-between gap-6 pt-10 border-t border-zinc-100">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Smartphone size={24} />
            </div>
            <div>
              <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-widest leading-none mb-1">Status</p>
              <p className="text-sm font-black text-zinc-800">
                {isSaving ? "Updating Database..." : "Ready to Sync"}
              </p>
            </div>
          </div>
          <button 
            onClick={handleGlobalSave}
            disabled={isSaving || loading}
            className="w-full md:w-auto group bg-indigo-600 hover:bg-indigo-700 text-white px-12 py-4 rounded-[24px] font-black text-sm shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:bg-zinc-400"
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} 
            {isSaving ? "Saving..." : "Save All Changes"}
          </button>
        </footer>
      </div>
    </div>
  );
}

function ToggleRow({ label, description, defaultChecked, icon }: any) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex gap-3 text-zinc-900">
        <div className="mt-1 text-zinc-400">{icon}</div>
        <div>
          <p className="text-sm font-bold">{label}</p>
          <p className="text-[10px] text-zinc-400 font-medium">{description}</p>
        </div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" defaultChecked={defaultChecked} className="sr-only peer" />
        <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600" />
      </label>
    </div>
  );
}