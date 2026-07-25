'use client'
import React, { useState } from 'react'
import {
  BookOpen,
  Brain,
  Zap,
  Menu,
  X,
  BarChart3,
  TrendingUp,
  FileText,
  LogOut
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const Navbar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { data: session } = useSession();
  const pathname = usePathname();

  if (!session) return null;

  const navItems = [
    { icon: BarChart3, label: 'Dashboard', href: '/dashboard' },
    { icon: Zap, label: 'New Interview', href: '/interview' },
    { icon: BookOpen, label: 'Sessions', href: '/session' },
    { icon: TrendingUp, label: 'Progress', href: '/progress' },
    { icon: FileText, label: 'Resume', href: '/resume' }, // Changed to FileText to match the Resume theme
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside 
        className={`hidden md:flex flex-col h-screen sticky top-0 bg-[#FFFDF8] border-r border-[#D8CDBD] transition-all duration-300 z-50 shadow-sm ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="p-6 border-b border-[#D8CDBD] flex items-center justify-between min-h-21.25">
          {sidebarOpen && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#8C5A3C] flex items-center justify-center shadow-sm">
                <Brain className="w-5 h-5 text-[#FFFDF8]" />
              </div>
              <span className="font-semibold text-lg text-[#2B2118] tracking-tight">Mentor</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 hover:bg-[#FBF7EF] text-[#8D8175] hover:text-[#8C5A3C] rounded-lg transition-colors"
            title="Toggle Sidebar"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-[#8C5A3C]/10 text-[#8C5A3C] font-medium'
                    : 'text-[#5C5147] hover:bg-[#FBF7EF] hover:text-[#2B2118]'
                }`}
                title={!sidebarOpen ? item.label : undefined}
              >
                <item.icon 
                  className={`w-5 h-5 shrink-0 transition-colors ${
                    isActive ? 'text-[#8C5A3C]' : 'text-[#8D8175] group-hover:text-[#8C5A3C]'
                  }`} 
                />
                {sidebarOpen && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#D8CDBD]">
          <button 
            onClick={() => signOut({ callbackUrl: '/' })}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 text-[#5C5147] hover:bg-red-50 hover:text-red-600 group ${
              !sidebarOpen ? 'justify-center' : ''
            }`}
            title={!sidebarOpen ? "Sign Out" : undefined}
          >
            <LogOut className="w-5 h-5 shrink-0 text-[#8D8175] group-hover:text-red-500 transition-colors" />
            {sidebarOpen && <span className="truncate">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#FFFDF8] border-t border-[#D8CDBD] shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] pb-2 pt-1 px-1">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex flex-col items-center justify-center p-2 min-w-14 rounded-xl transition-colors ${
                  isActive
                    ? 'text-[#8C5A3C]'
                    : 'text-[#8D8175] hover:text-[#5C5147]'
                }`}
              >
                <div className={`flex items-center justify-center w-8 h-8 rounded-full mb-0.5 transition-all ${
                  isActive ? 'bg-[#8C5A3C]/10' : ''
                }`}>
                  <item.icon className={`w-5 h-5 ${isActive ? 'fill-[#8C5A3C]/20 text-[#8C5A3C]' : ''}`} />
                </div>
                <span className={`text-[9px] font-medium tracking-wide ${
                  isActive ? 'text-[#8C5A3C]' : 'text-[#8D8175]'
                }`}>
                  {item.label.replace('New ', '')} {/* Shorten 'New Interview' to 'Interview' on mobile */}
                </span>
              </Link>
            );
          })}
          
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex flex-col items-center justify-center p-2 min-w-14 rounded-xl text-[#8D8175] hover:text-red-600 transition-colors"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full mb-0.5">
              <LogOut className="w-5 h-5" />
            </div>
            <span className="text-[9px] font-medium tracking-wide">
              Sign Out
            </span>
          </button>
        </div>
      </nav>
    </>
  ) 
}

export default Navbar