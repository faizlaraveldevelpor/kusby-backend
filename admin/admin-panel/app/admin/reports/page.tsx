/* eslint-disable no-alert */
"use client";

import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  Clock, 
  Filter,
  Loader2,
  CheckCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getReports, resolveReportOnly } from "@/utils/Reports";

export default function AdminReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null); // Specific item loading
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState("All");
  const router = useRouter();
  const PAGE_SIZE = 10;

  const fetchReportsData = async (pageNum: number, isInitial = false) => {
    setLoading(true);
    try {
      const result = await getReports(pageNum, PAGE_SIZE);
      
      if (isInitial) {
        setReports(result.data || []);
      } else {
        setReports(prev => [...prev, ...(result.data || [])]);
      }
      
      if (result.data.length < PAGE_SIZE) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsData(0, true);
  }, []);

  // --- Mark Solved Handler ---
  const handleQuickSolve = async (reportId: string) => {
    if (!window.confirm("Mark this report as solved?")) return;

    setActionLoading(reportId);
    const res = await resolveReportOnly(reportId);
    
    if (res.success) {
      // List mein state update karein taaki page refresh na karna paray
      setReports(prev => prev.map(r => 
        r.id === reportId ? { ...r, solve: true } : r
      ));
    } else {
      alert("Error: " + res.error);
    }
    setActionLoading(null);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchReportsData(nextPage);
  };
  
  const filteredReports = reports.filter(r => {
    if (filter === "Banned") return r.status === true;
    if (filter === "Solved") return r.solve === true;
    if (filter === "Pending") return r.solve === false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#fcfcfd] p-4 md:p-10 lg:p-16 font-sans text-zinc-900">
      
      {/* Header */}
      <header className="max-w-6xl mx-auto mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-zinc-900 rounded-2xl shadow-xl shadow-zinc-200">
              <ShieldAlert size={24} className="text-white" />
            </div>
            <h1 className="text-4xl font-black tracking-tight">Trust & Safety</h1>
          </div>
          <p className="text-zinc-500 font-medium ml-1">Review reports and manage user bans.</p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-48">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
            <select 
              className="w-full h-11 pl-9 pr-4 rounded-2xl border-none bg-white shadow-sm ring-1 ring-zinc-200 text-xs font-bold outline-none appearance-none cursor-pointer"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="All">All Reports</option>
              <option value="Pending">Pending</option>
              <option value="Solved">Solved</option>
              <option value="Banned">Banned Users</option>
            </select>
          </div>
        </div>
      </header>

      {/* Reports List */}
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="grid gap-4">
          {filteredReports.map((report) => (
            <div key={report.id} className={`group bg-white rounded-[28px] p-5 md:p-6 border ${report.status ? 'border-rose-100' : 'border-zinc-100'} shadow-sm hover:shadow-md transition-all`}>
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                
                {/* User Info Section */}
                <div className="flex items-center gap-4 min-w-[250px]">
                  <div className="flex -space-x-3">
                    <div className="h-12 w-12 rounded-2xl bg-zinc-100 border-4 border-white flex items-center justify-center font-black text-zinc-400 text-xs shadow-sm capitalize">
                      {report.reporter?.full_name?.[0] || "?"}
                    </div>
                    <div className={`h-12 w-12 rounded-2xl ${report.status ? 'bg-rose-600' : 'bg-zinc-800'} border-4 border-white flex items-center justify-center font-black text-white text-xs shadow-md capitalize`}>
                      {report.reported_user?.full_name?.[0] || "?"}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-zinc-900">{report.reported_user?.full_name}</p>
                      {report.status && <span className="px-1.5 py-0.5 bg-rose-100 text-rose-600 text-[8px] font-black rounded uppercase">Banned</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                       {report.solve ? (
                         <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold"><CheckCircle size={10}/> Solved</span>
                       ) : (
                         <span className="flex items-center gap-1 text-[10px] text-amber-600 font-bold"><Clock size={10}/> Pending</span>
                       )}
                    </div>
                  </div>
                </div>

                {/* Reason Section */}
                <div className="flex-1">
                  <p className="text-sm font-semibold text-zinc-700 italic">"{report.reason}"</p>
                  <p className="text-[10px] text-zinc-400 mt-1 font-bold">{new Date(report.created_at).toLocaleDateString()} • {new Date(report.created_at).toLocaleTimeString()}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <button 
                      className="h-10 px-4 rounded-xl bg-zinc-900 text-white text-xs font-bold hover:bg-zinc-800 transition-all flex items-center gap-2"
                      onClick={() => router.push(`/singlereport?id=${report.id}`)}
                    >
                      Review Details
                    </button>
                    
                    {!report.solve && (
                      <button 
                        onClick={() => handleQuickSolve(report.id)}
                        disabled={actionLoading === report.id}
                        className="h-10 px-4 rounded-xl bg-emerald-50 text-emerald-600 text-xs font-bold hover:bg-emerald-100 border border-emerald-100 flex items-center justify-center min-w-[100px]"
                      >
                        {actionLoading === report.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : "Mark Solved"}
                      </button>
                    )}
                </div>

              </div>
            </div>
          ))}

          {/* Loading & Pagination */}
          {hasMore && (
            <button 
              onClick={handleLoadMore}
              disabled={loading}
              className="w-full py-4 rounded-2xl border border-dashed border-zinc-300 text-zinc-500 text-xs font-bold hover:bg-zinc-50 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Loading More...
                </>
              ) : "Load More Activity"}
            </button>
          )}

          {!hasMore && reports.length > 0 && (
            <p className="text-center text-zinc-400 text-[10px] font-bold py-4">All reports caught up!</p>
          )}
        </div>
      </div>
    </div>
  );
}