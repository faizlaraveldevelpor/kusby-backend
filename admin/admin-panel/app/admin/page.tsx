"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, Zap, ShieldAlert, TrendingUp, Globe, Activity, ArrowUpRight, Bell, UserX 
} from "lucide-react";
import { useRouter } from "next/navigation";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts'; // Chart library imports

import { getDailyStats, getProfilesCount, getRecentProfilesCount } from "@/utils/profiles";
import { getRecentMatchesCount } from "@/utils/Matches";
// --- UI COMPONENTS ---
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-all hover:shadow-md ${className}`}>
      {children}
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalProfiles: 0,
    recentMatches: 0,
    recentProfiles: 0,
  });

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [totalP, recentM, recentP, dailyStats] = await Promise.all([
          getProfilesCount(),
          getRecentMatchesCount(),
          getRecentProfilesCount(),
          getDailyStats() // Fetching graph data
        ]);
        
        setStats({
          totalProfiles: totalP || 0,
          recentMatches: recentM || 0,
          recentProfiles: recentP || 0,
        });
        setChartData(dailyStats);
      } catch (error) {
        console.error("Dashboard Load Error:", error);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const CORE_KPIS = [
    { label: "Total Users", value: stats.totalProfiles.toLocaleString(), icon: Users, color: "text-blue-500" },
    { label: "Recent Matches", value: stats.recentMatches.toLocaleString(), icon: Zap, color: "text-rose-500" },
    { label: "New Users (30d)", value: stats.recentProfiles.toLocaleString(), icon: ArrowUpRight, color: "text-emerald-500" },
  ];

  return (
    <div className="min-h-screen bg-zinc-50/50 p-4 md:p-8 text-zinc-900 font-sans">
      
      {/* Header */}
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Tinder Admin</h1>
          <p className="text-zinc-500 font-medium italic">Real-time Growth Analytics</p>
        </div>
        <button className="rounded-xl bg-zinc-900 px-6 py-2.5 text-sm font-bold text-white shadow-lg">Export Data</button>
      </header>

      {/* 1. Core Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        {CORE_KPIS.map((kpi) => (
          <Card key={kpi.label}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">{kpi.label}</p>
                <h3 className="mt-2 text-3xl font-black">{loading ? "..." : kpi.value}</h3>
              </div>
              <div className={`rounded-lg bg-zinc-100 p-2 ${kpi.color}`}>
                <kpi.icon size={20} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* 2. Main Analytics Graph */}
      <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <div className="mb-6">
            <h3 className="text-lg font-bold">Growth & Match Velocity</h3>
            <p className="text-xs text-zinc-500">Comparison of signups vs matches over the last 30 days</p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorProfiles" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorMatches" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="profiles" 
                  stroke="#10b981" 
                  fillOpacity={1} 
                  fill="url(#colorProfiles)" 
                  strokeWidth={3}
                  name="New Users"
                />
                <Area 
                  type="monotone" 
                  dataKey="matches" 
                  stroke="#f43f5e" 
                  fillOpacity={1} 
                  fill="url(#colorMatches)" 
                  strokeWidth={3}
                  name="Matches"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* 3. Right Side - Conversion Summary */}
        <Card>
          <div className="mb-6 flex items-center gap-2">
            <TrendingUp className="text-zinc-900" size={18} />
            <h3 className="text-lg font-bold">Health Metrics</h3>
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-xs font-bold mb-2">
                <span>Signup Completion</span>
                <span className="text-emerald-500">88%</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-100 rounded-full">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '88%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold mb-2">
                <span>Match Conversion</span>
                <span className="text-rose-500">
                  {stats.totalProfiles > 0 ? Math.round((stats.recentMatches/stats.totalProfiles)*100) : 0}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-zinc-100 rounded-full">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: '24%' }} />
              </div>
            </div>
          </div>
          <div className="mt-8 p-4 bg-zinc-900 rounded-2xl text-white">
             <p className="text-[10px] font-bold uppercase text-zinc-400">Pro Tip</p>
             <p className="text-xs mt-1 leading-relaxed">Recent activity shows a spike in matches. Consider pushing a notification to inactive users to boost engagement.</p>
          </div>
        </Card>
      </div>

    </div>
  );
}