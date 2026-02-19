"use client";

import React, { useState, useEffect, Suspense } from "react";
import { 
  ArrowLeft, MessageSquare, UserX, ShieldAlert, 
  Calendar, CheckCircle2, Loader2, Music, Check, UserCheck
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { banUserAndResolve, getSingleReportDetails, resolveReportOnly } from "@/utils/Reports";

function ReportDetails() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reportId = searchParams.get("id");

  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function init() {
      if (!reportId) return;
      setLoading(true);
      const data = await getSingleReportDetails(reportId);
      setReport(data);
      setLoading(false);
    }
    init();
  }, [reportId]);

  // --- API Handlers ---

  // Handle Dismiss (Only Resolve)
  const handleDismiss = async () => {
    if (!window.confirm("Mark this report as solved?")) return;
    
    setActionLoading(true);
    const res = await resolveReportOnly(report.id);
    if (res.success) {
      router.back();
    } else {
      alert("Error: " + res.error);
    }
    setActionLoading(false);
  };

  // Toggle Ban/Unban Logic
  const handleBanToggle = async () => {
    const isCurrentlyBanned = report.status === true;
    const confirmMsg = isCurrentlyBanned 
      ? "Are you sure you want to UNBAN this user?" 
      : "Are you sure you want to BAN this user?";

    if (!window.confirm(confirmMsg)) return;

    setActionLoading(true);
    
    // Agar banned hai (true), to status false karne ke liye resolveReportOnly use hoga
    // Agar banned nahi hai (false), to status true karne ke liye banUserAndResolve use hoga
    const res = isCurrentlyBanned 
      ? await resolveReportOnly(report.id) 
      : await banUserAndResolve(report.id);

    if (res.success) {
      // Page refresh ki jagah sirf data update taaki UI foran badle
      const updatedData = await getSingleReportDetails(report.id);
      setReport(updatedData);
    } else {
      alert("Error: " + res.error);
    }
    setActionLoading(false);
  };

  const renderMessageContent = (msg: any) => {
    if (!msg.message_type || msg.message_type === "text") {
      return <p className="leading-relaxed">{msg.content}</p>;
    }
    
    if (msg.message_type === "image") {
      return (
        <div className="space-y-2">
          <img 
            src={msg.content} 
            alt="Evidence" 
            className="rounded-lg max-w-full h-auto border border-zinc-200 w-[200px]"
          />
        </div>
      );
    }

    if (msg.message_type === "video") {
      return (
        <video controls className="rounded-lg max-w-full border border-zinc-200">
          <source src={msg.content} type="video/mp4" />
        </video>
      );
    }

    if (msg.message_type === "audio") {
      return (
        <div className="flex items-center gap-2 p-2 bg-zinc-100 rounded-lg">
          <Music size={16} className="text-zinc-500"  />
          <audio controls className="h-8 w-48"><source src={msg.content} /></audio>
        </div>
      );
    }

    return <p className="italic text-zinc-400">Unsupported type</p>;
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50">
      <Loader2 className="animate-spin text-rose-500 mb-2" size={32} />
      <p className="text-zinc-500 font-bold text-sm">Loading Report Details...</p>
    </div>
  );

  if (!report) return <div className="p-20 text-center font-bold">No report found.</div>;

  return (
    <div className="min-h-screen bg-zinc-50 p-4 md:p-8 lg:px-24 text-zinc-900 font-sans">
      
      <nav className="mb-8 flex items-center justify-between">
        <button className="group flex items-center gap-2 text-zinc-500 hover:text-zinc-900 font-bold text-sm disabled:opacity-50" onClick={() => router.back()} disabled={actionLoading}>
          <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" /> BACK
        </button>
        <div className="flex gap-3">
          <button 
            onClick={handleDismiss}
            disabled={actionLoading}
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-bold hover:bg-zinc-50 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} 
            DISMISS REPORT
          </button>
          
          <button 
            onClick={handleBanToggle}
            disabled={actionLoading}
            className={`rounded-xl px-5 py-2 text-xs font-bold text-white shadow-lg flex items-center gap-2 transition-all disabled:opacity-50 ${
              report.status ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100" : "bg-rose-600 hover:bg-rose-700 shadow-rose-100"
            }`}
          >
            {actionLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : report.status ? (
              <><UserCheck size={14} /> UNBAN USER</>
            ) : (
              <><UserX size={14} /> BAN USER</>
            )}
          </button>
        </div>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="bg-rose-50 text-rose-600 text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest">Evidence</span>
              {report.status && <span className="text-[10px] bg-rose-600 text-white px-2 py-0.5 rounded-full font-bold animate-pulse">BANNED</span>}
            </div>
            <h2 className="text-xl font-black mb-2">{report.reason}</h2>
            <p className="text-sm text-zinc-500 italic border-l-4 border-zinc-100 pl-4">"{report.description}"</p>
            <div className="mt-6 flex items-center gap-2 text-[11px] font-bold text-zinc-400 uppercase">
              <Calendar size={14} /> {new Date(report.created_at).toLocaleString()}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border-2 border-rose-100 bg-rose-50/20 p-5">
              <p className="text-[10px] font-black text-rose-500 uppercase mb-3 flex items-center gap-1"><ShieldAlert size={12} /> Reported Account</p>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-rose-200 flex items-center justify-center font-bold text-rose-700 uppercase">{report.reported_user?.full_name?.[0]}</div>
                <div>
                  <h4 className="font-black text-zinc-900">{report.reported_user?.full_name}</h4>
                  <p className="text-xs text-zinc-500">{report.reported_user?.phone || "No phone linked"}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <p className="text-[10px] font-black text-emerald-600 uppercase mb-3 flex items-center gap-1"><CheckCircle2 size={12} /> Reporter</p>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-zinc-100 flex items-center justify-center font-bold text-zinc-600 uppercase">{report.reporter?.full_name?.[0]}</div>
                <div>
                  <h4 className="font-black text-zinc-900">{report.reporter?.full_name}</h4>
                  <p className="text-xs text-zinc-500 font-medium">ID: {report.reporter_id.slice(0,8)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm flex flex-col h-[700px]">
            <div className="p-5 border-b border-zinc-100 bg-zinc-50/50 rounded-t-2xl flex justify-between items-center">
              <div className="flex items-center gap-2">
                <MessageSquare size={18} className="text-zinc-400" />
                <h3 className="font-bold">Chat History</h3>
              </div>
              <span className="text-[10px] font-bold text-zinc-400 bg-white border px-2 py-1 rounded uppercase tracking-tighter">Verified Transcript</span>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-zinc-50/30">
              {report.chat_history && report.chat_history.length > 0 ? (
                report.chat_history.map((msg: any) => {
                  const isReported = msg.sender_id === report.reported_id;
                  return (
                    <div key={msg.id} className={`flex flex-col ${isReported ? 'items-start' : 'items-end'}`}>
                      <div className="flex items-center gap-2 mb-1 px-1">
                        <span className={`text-[10px] font-bold uppercase ${isReported ? 'text-rose-500' : 'text-zinc-400'}`}>
                          {isReported ? report.reported_user?.full_name : report.reporter?.full_name}
                        </span>
                        <span className="text-[10px] text-zinc-300">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className={`max-w-md px-4 py-3 rounded-2xl text-sm font-medium shadow-sm border ${
                        isReported 
                        ? 'bg-white text-zinc-800 border-zinc-200 rounded-tl-none' 
                        : 'bg-zinc-900 text-white border-zinc-800 rounded-tr-none'
                      }`}>
                        {renderMessageContent(msg)}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-zinc-400 opacity-50 italic">
                  <p>No chat history available.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReportDetails />
    </Suspense>
  );
}