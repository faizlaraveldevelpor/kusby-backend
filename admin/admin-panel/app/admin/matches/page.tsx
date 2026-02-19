/* eslint-disable no-alert */
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Heart, Zap, MessageCircle, Search, MoreHorizontal, 
  Flame, Clock, ChevronLeft, ChevronRight, UserCircle 
} from "lucide-react";
import { getAllMatches } from "@/utils/Matches";

export default function AdminMatchesPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [query, setQuery] = useState("");
  const pageSize = 6;

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    try {
      const { data, count } = await getAllMatches(currentPage, pageSize);
      setMatches(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error("Match Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  // --- SEARCH LOGIC (Client Side) ---
  const filteredMatches = useMemo(() => {
    if (!query.trim()) return matches;
    const q = query.toLowerCase();
    return matches.filter(match => 
      match.user_1?.full_name?.toLowerCase().includes(q) || 
      match.user_2?.full_name?.toLowerCase().includes(q)
    );
  }, [matches, query]);

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <div className="min-h-screen bg-[#fcfcfd] p-4 md:p-10 lg:p-16 font-sans text-zinc-900">
      
      {/* Header Section */}
      <div className="max-w-6xl mx-auto mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-rose-500 rounded-2xl shadow-lg shadow-rose-200">
                <Heart size={24} className="text-white fill-white" />
              </div>
              <h1 className="text-4xl font-black tracking-tight">Connections</h1>
            </div>
            <p className="text-zinc-500 font-medium ml-1">
              {loading ? "Syncing..." : `Monitoring ${totalCount} live matches`}
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-rose-500 transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Search by name..."
              className="w-full h-12 pl-12 pr-4 rounded-2xl border-none bg-white shadow-sm ring-1 ring-zinc-200 focus:ring-2 focus:ring-rose-500/20 outline-none transition-all font-medium"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                // Search karte waqt page 1 par wapas jana behtar hai agar API search ho
                // setCurrentPage(1); 
              }}
            />
          </div>
        </div>
      </div>

      {/* Matches Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-zinc-100 animate-pulse rounded-[32px]" />
          ))
        ) : filteredMatches.length > 0 ? (
          filteredMatches.map((match) => (
            <div key={match.id} className="bg-white rounded-[32px] p-6 border border-zinc-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              
              <div className="flex justify-between items-center mb-8">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-zinc-100 text-zinc-500">
                  <Clock size={12} /> Live Match
                </span>
                <button className="text-zinc-300 hover:text-zinc-900 transition-colors">
                  <MoreHorizontal size={20} />
                </button>
              </div>

              <div className="flex items-center justify-between gap-4 mb-8">
                {/* User 1 */}
                <div className="flex flex-col items-center gap-3 flex-1 overflow-hidden">
                  <div className="h-16 w-16 md:h-20 md:w-20 rounded-[24px] bg-zinc-100 overflow-hidden shadow-lg transform -rotate-3 group-hover:rotate-0 transition-transform flex-shrink-0 border-2 border-white">
                    {match.user_1?.avatar_url ? (
                      <img src={match.user_1.avatar_url} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-rose-100 text-rose-500 font-bold text-xl uppercase">
                        {match.user_1?.full_name?.charAt(0) || "?"}
                      </div>
                    )}
                  </div>
                  <div className="text-center w-full">
                    <p className="font-bold text-sm truncate px-2">{match.user_1?.full_name}</p>
                  </div>
                </div>

                {/* Heart Divider */}
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center">
                    <div className="h-[2px] w-4 md:w-10 bg-gradient-to-r from-transparent to-rose-200" />
                    <Heart size={24} className="text-rose-500 fill-rose-500 mx-1 md:mx-2 animate-pulse" />
                    <div className="h-[2px] w-4 md:w-10 bg-gradient-to-l from-transparent to-rose-200" />
                  </div>
                  <div className="bg-rose-50 px-2 py-0.5 rounded-lg flex items-center gap-1">
                     <Zap size={10} className="text-rose-500 fill-rose-500" />
                     <span className="text-[11px] font-black text-rose-600 uppercase tracking-tighter">Active</span>
                  </div>
                </div>

                {/* User 2 */}
                <div className="flex flex-col items-center gap-3 flex-1 overflow-hidden">
                  <div className="h-16 w-16 md:h-20 md:w-20 rounded-[24px] bg-zinc-100 overflow-hidden shadow-lg transform rotate-3 group-hover:rotate-0 transition-transform flex-shrink-0 border-2 border-white">
                    {match.user_2?.avatar_url ? (
                      <img src={match.user_2.avatar_url} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-white font-bold text-xl uppercase">
                        {match.user_2?.full_name?.charAt(0) || "?"}
                      </div>
                    )}
                  </div>
                  <div className="text-center w-full">
                    <p className="font-bold text-sm truncate px-2">{match.user_2?.full_name}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-zinc-50">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Clock size={14} />
                  <span className="text-xs font-bold">{new Date(match.created_at).toLocaleDateString()}</span>
                </div>
                <button className="px-5 py-2.5 rounded-xl bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all active:scale-95">
                  View Chat
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-20 bg-white rounded-[40px] border border-dashed border-zinc-200">
            <p className="text-zinc-400 font-bold italic">No matches found for "{query}"</p>
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {!loading && totalCount > pageSize && (
        <div className="max-w-6xl mx-auto mt-12 flex items-center justify-between border-t pt-8 border-zinc-200">
          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
            Showing {filteredMatches.length} of {totalCount}
          </span>
          <div className="flex gap-3">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="p-3 rounded-2xl bg-white border border-zinc-200 disabled:opacity-30 hover:border-rose-500 transition-all hover:bg-zinc-50 shadow-sm"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="p-3 rounded-2xl bg-white border border-zinc-200 disabled:opacity-30 hover:border-rose-500 transition-all hover:bg-zinc-50 shadow-sm"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}