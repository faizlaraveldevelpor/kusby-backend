/* eslint-disable no-alert */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Search, ChevronLeft, ChevronRight, UserCircle, 
  UserMinus, ShieldCheck, Eye, MoreHorizontal, ShieldAlert, ShieldX
} from "lucide-react";

// APIs
import { getAllProfiles, toggleAdminStatus, toggleUserBlock } from "@/utils/profiles";

// --- SUB-COMPONENTS ---

// Updated to use the adminblock boolean
function StatusPill({ isBlocked }: { isBlocked: boolean }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-tight ${
      isBlocked 
        ? "bg-rose-50 text-rose-700 border-rose-100" 
        : "bg-emerald-50 text-emerald-700 border-emerald-100"
    }`}>
      <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${isBlocked ? "bg-rose-600" : "bg-emerald-600"}`} />
      {isBlocked ? "Blocked" : "Active"}
    </span>
  );
}

function RolePill({ isAdmin }: { isAdmin: boolean }) {
  if (isAdmin) {
    return (
      <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1 text-[10px] font-black uppercase text-indigo-700 border border-indigo-100">
        <ShieldCheck size={10} /> Admin
      </span>
    );
  }
  return <span className="inline-flex items-center rounded-lg bg-zinc-100 px-2.5 py-1 text-[10px] font-black uppercase text-zinc-500 border border-zinc-200">User</span>;
}

export default function AdminDashboard() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const pageSize = 10;

  const fetchTableData = useCallback(async () => {
    setTableLoading(true);
    try {
      const { data, count } = await getAllProfiles(currentPage, pageSize, {
        name: query,
        // Yahan aap statusFilter handle kar sakte hain agar backend supported hai
      });
      setProfiles(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setTableLoading(false);
    }
  }, [currentPage, query]);

  useEffect(() => { fetchTableData(); }, [fetchTableData]);

  // --- ACTIONS ---

  // 1. Toggle Admin Role
  const handleAdminToggle = async (user: any) => {
    const action = user.admin ? "Remove Admin" : "Make Admin";
    if (confirm(`Are you sure you want to ${action} for ${user.full_name}?`)) {
      try {
        const { data, error } = await toggleAdminStatus(user.id);
        if (error) throw error;

        setProfiles(prev => prev.map(u => 
          u.id === user.id ? { ...u, admin: data.admin } : u
        ));
      } catch (err) {
        alert("Failed to update admin role");
      }
    }
  };

  // 2. Toggle Block Status (Using toggleUserBlock)
  const handleToggleBlock = async (user: any) => {
    const action = user.adminblock ? "UNBLOCK" : "BLOCK";
    if (confirm(`Are you sure you want to ${action} ${user.full_name}?`)) {
      try {
        const { data, error } = await toggleUserBlock(user.id);
        if (error) throw error;

        // Backend se naya boolean state lekar UI update
        setProfiles(prev => prev.map(u => 
          u.id === user.id ? { ...u, adminblock: data.adminblock } : u
        ));
      } catch (err) {
        alert("Action failed");
        fetchTableData();
      }
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <div className="min-h-screen bg-zinc-50/50 p-4 md:p-10 text-zinc-900 font-sans">
      <div className="mb-6">
        <h1 className="text-2xl font-black tracking-tight text-zinc-900 uppercase">User Management</h1>
        <p className="text-zinc-500 text-sm font-medium">Manage permissions and account status</p>
      </div>

      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-100 flex flex-col lg:flex-row justify-between gap-4 bg-zinc-50/20">
          <h2 className="text-lg font-bold">Directory ({totalCount})</h2>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
              <input
                type="text"
                placeholder="Search name..."
                className="h-10 w-full sm:w-64 rounded-xl border border-zinc-200 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-rose-500/20"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50/50">
              <tr className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {tableLoading ? (
                [...Array(5)].map((_, i) => <tr key={i} className="animate-pulse h-20"><td colSpan={3} className="px-6"></td></tr>)
              ) : profiles.map((user) => (
                <tr key={user.id} className="hover:bg-zinc-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl border">
                        {user.avatar_url ? <img src={user.avatar_url} className="h-full w-full object-cover" alt="" /> : <UserCircle className="text-zinc-300 w-full h-full p-1" />}
                      </div>
                      <div>
                        <p className="font-bold">{user.full_name}</p>
                        <RolePill isAdmin={user.admin} />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {/* UI now depends on adminblock column */}
                    <StatusPill isBlocked={user.adminblock} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      
                      {/* Admin Toggle */}
                      <button 
                        onClick={() => handleAdminToggle(user)}
                        className={`p-2 rounded-lg transition-colors ${user.admin ? 'bg-indigo-600 text-white' : 'bg-zinc-100 text-zinc-500 hover:bg-indigo-50 hover:text-indigo-600'}`}
                        title="Toggle Admin Role"
                      >
                        <ShieldAlert size={16} />
                      </button>

                      {/* Block Toggle (Red button when blocked) */}
                      <button 
                        onClick={() => handleToggleBlock(user)}
                        className={`p-2 rounded-lg transition-all ${user.adminblock ? 'bg-rose-600 text-white shadow-lg shadow-rose-200' : 'bg-zinc-100 text-zinc-600 hover:bg-rose-50 hover:text-rose-600'}`}
                        title="Toggle Block Status"
                      >
                        {user.adminblock ? <ShieldX size={16} /> : <UserMinus size={16} />}
                      </button>

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-6 bg-zinc-50/50 border-t flex items-center justify-between">
          <span className="text-[10px] font-black text-zinc-400 uppercase">Page {currentPage} of {totalPages}</span>
          <div className="flex gap-2">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 rounded-xl border bg-white disabled:opacity-30 hover:bg-zinc-50 transition-all"><ChevronLeft size={16} /></button>
            <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-2 rounded-xl border bg-white disabled:opacity-30 hover:bg-zinc-50 transition-all"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}