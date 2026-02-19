/* eslint-disable no-alert */
"use client";

import React, { useState, useEffect } from "react"; // 1. useEffect aur useState add kiya

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, Users, Heart, ShieldAlert, Settings, 
  LogOut, Flame, ChevronRight, Bell 
} from "lucide-react";
import Image from "next/image";
import { logout } from "./logout";

// Fake Auth logic
function requireAdmin() {
  return true;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const ok = requireAdmin();
  const router=useRouter()
  // 2. Real Date State
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    // Client-side par date set karna (Hydration error se bachne ke liye)
    const date = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    setCurrentDate(date);
  }, []);

  if (!ok) {
    console.log("Redirecting...");
  }

  return (
    <div className="min-h-screen flex bg-[#fcfcfd] font-sans text-zinc-900">
      
      {/* 1. Sidebar */}
      <aside className="w-72 bg-zinc-900 text-zinc-100 flex flex-col sticky top-0 h-screen shadow-2xl z-50 overflow-hidden">
        
        {/* Branding */}
        <div className="p-8 mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-rose-500 p-2 rounded-2xl shadow-lg shadow-rose-500/20">
              <Image src={`/logo.jpeg`} width={50} height={50} alt="Logo"/>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2">
          <NavItem 
            href="/admin" 
            label="Dashboard" 
            icon={<LayoutDashboard size={20} />} 
            active={pathname === "/admin"} 
          />
          <NavItem 
            href="/admin/users" 
            label="User Base" 
            icon={<Users size={20} />} 
            active={pathname === "/admin/users"} 
          />
          <NavItem 
            href="/admin/matches" 
            label="Live Matches" 
            icon={<Heart size={20} />} 
            active={pathname === "/admin/matches"} 
          />
          <NavItem 
            href="/admin/reports" 
            label="Safety Hub" 
            icon={<ShieldAlert size={20} />} 
            active={pathname === "/admin/reports"} 
          />
          <NavItem 
            href="/admin/settings" 
            label="App Config" 
            icon={<Settings size={20} />} 
            active={pathname === "/admin/settings"} 
          />
        </nav>

        {/* User Profile / Logout */}
        <div className="p-4 mt-auto border-t border-zinc-800/50 bg-zinc-950/30">
          <div className="flex items-center gap-3 p-3 mb-4 bg-zinc-800/40 rounded-2xl border border-zinc-700/30">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-rose-500 to-orange-400 flex items-center justify-center font-black text-white shadow-lg">
              A
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold truncate">Admin User</p>
              <p className="text-[10px] text-zinc-500 font-medium">Super Admin</p>
            </div>
            <button className="text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer" onClick={()=>{
              logout()
             router.push("/login")
            }}>
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-zinc-100 flex items-center px-8 justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
              <div className="md:hidden p-2 bg-zinc-100 rounded-lg">
                <ChevronRight size={20} />
              </div>
              <div>
                <h2 className="text-sm font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Current Section</h2>
                <p className="text-lg font-bold text-zinc-900 capitalize">
                 {pathname === "/admin" ? "Overview" : pathname.split('/').pop()?.replace('-', ' ')}
                </p>
              </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="h-8 w-px bg-zinc-100 hidden sm:block" />
            <div className="hidden sm:block text-right">
              {/* Dynamic Date Render */}
              <p className="text-xs font-black text-zinc-900">{currentDate || "Loading..."}</p>
              <p className="text-[10px] text-zinc-400 font-bold uppercase">System Status: OK</p>
            </div>
          </div>
        </header>

        {/* Main Section */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="p-2 md:p-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function NavItem({ href, label, icon, active }: { href: string; label: string; icon: React.ReactNode; active: boolean }) {
  return (
    <Link
      href={href}
      className={`
        flex items-center justify-between group px-4 py-3.5 rounded-2xl transition-all duration-300
        ${active 
          ? "bg-rose-500 text-white shadow-xl shadow-rose-500/20 translate-x-1" 
          : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
        }
      `}
    >
      <div className="flex items-center gap-3">
        <span className={`${active ? "text-white" : "group-hover:text-rose-400 transition-colors"}`}>
          {icon}
        </span>
        <span className="text-sm font-bold tracking-tight">{label}</span>
      </div>
      {active && <ChevronRight size={16} className="text-rose-200" />}
    </Link>
  );
}