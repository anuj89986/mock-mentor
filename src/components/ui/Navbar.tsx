'use client'
import React, { useState } from 'react'
import {BookOpen, Brain, Zap, Menu, X, BarChart3, TrendingUp, Download, Settings, LogOut} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';


const Navbar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    session ?
    <div>
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white/5 border-r border-white/10 transition-all duration-300 flex flex-col h-screen sticky top-0`}>
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-blue-500" />
              <span className="font-bold">Mentor</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-white/10 rounded-lg transition"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {[
            { icon: BarChart3, label: 'Dashboard',href: '/dashboard' },
            { icon: Zap, label: 'New Interview', href: '/interview' },
            { icon: BookOpen, label: 'Sessions', href: '/session' },
            { icon: TrendingUp, label: 'Progress', href: '/progress' },
            { icon: Download, label: 'Resume',href: '/resume' },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                pathname.startsWith(item.href)
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-white/5'
              }`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-white/5 rounded-lg transition">
            <LogOut className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span onClick={()=>signOut({callbackUrl: '/'})}>Sign Out</span>}
          </button>
        </div>
      </aside>
    </div> : null
  ) 
}

export default Navbar