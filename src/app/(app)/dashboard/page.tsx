'use client'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { 
  BarChart3, 
  BookOpen, 
  Brain, 
  Clock, 
  Download, 
  LogOut, 
  Plus, 
  Settings, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Zap,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

export default function DashboardPage() {
  const { data: session } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <p className="text-white">Please sign in to access the dashboard.</p>
      </div>
    )
  }

  const stats = [
    { label: 'Total Interviews', value: '12', change: '+3 this month', icon: Brain },
    { label: 'Avg. Score', value: '78%', change: '+5% improvement', icon: TrendingUp },
    { label: 'Practice Hours', value: '24.5', change: '+4.2 this week', icon: Clock },
    { label: 'Interviews Passed', value: '8', change: '67% success rate', icon: CheckCircle },
  ]

  const recentSessions = [
    { id: 1, title: 'Senior Backend Engineer Interview', date: 'May 14, 2026', score: 82, status: 'completed' },
    { id: 2, title: 'Product Manager Behavioral Round', date: 'May 12, 2026', score: 75, status: 'completed' },
    { id: 3, title: 'Full Stack Developer Technical', date: 'May 10, 2026', score: 88, status: 'completed' },
    { id: 4, title: 'System Design Interview', date: 'May 8, 2026', score: 70, status: 'completed' },
  ]

  const recommendedRoles = [
    { title: 'Frontend Engineer', company: 'Tech Company A', difficulty: 'Medium' },
    { title: 'Data Engineer', company: 'Tech Company B', difficulty: 'Hard' },
    { title: 'DevOps Engineer', company: 'Tech Company C', difficulty: 'Medium' },
  ]

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white/5 border-r border-white/10 transition-all duration-300 flex flex-col`}>
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
            { icon: BarChart3, label: 'Dashboard', active: true },
            { icon: Zap, label: 'New Interview' },
            { icon: BookOpen, label: 'Sessions' },
            { icon: TrendingUp, label: 'Progress' },
            { icon: Download, label: 'Resume' },
            { icon: Settings, label: 'Settings' },
          ].map((item) => (
            <button
              key={item.label}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                item.active
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-white/5'
              }`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-white/5 rounded-lg transition">
            <LogOut className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="border-b border-white/10 bg-white/5 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center justify-between p-6">
            <div>
              <h1 className="text-3xl font-bold">Welcome back, {session.user?.name}</h1>
              <p className="text-gray-400 mt-1">Let's practice and ace your next interview</p>
            </div>
            <div className="flex items-center gap-4">
              <Button className="bg-blue-600 hover:bg-blue-700" asChild>
                <Link href="#">
                  <Plus className="w-4 h-4 mr-2" />
                  New Interview
                </Link>
              </Button>
              <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <span className="font-semibold">{session.user?.name?.charAt(0).toUpperCase()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-6 space-y-8">
          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="p-6 rounded-lg bg-white/5 border border-white/10 hover:border-blue-500/30 transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-gray-400 text-sm">{stat.label}</h3>
                  <stat.icon className="w-5 h-5 text-blue-400" />
                </div>
                <p className="text-3xl font-bold mb-2">{stat.value}</p>
                <p className="text-sm text-green-400">{stat.change}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Recent Sessions */}
            <div className="lg:col-span-2 p-6 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                  Recent Sessions
                </h2>
                <Link href="#" className="text-sm text-blue-400 hover:text-blue-300">
                  View All
                </Link>
              </div>

              <div className="space-y-3">
                {recentSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:border-blue-500/30 transition"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{session.title}</h3>
                      <p className="text-sm text-gray-400">{session.date}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-400">{session.score}%</p>
                        <p className="text-xs text-gray-400">Score</p>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions & Stats */}
            <div className="space-y-6">
              {/* Strengths Overview */}
              <div className="p-6 rounded-lg bg-white/5 border border-white/10">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  Your Strengths
                </h3>
                <div className="space-y-3">
                  {['Communication', 'Problem Solving', 'Technical Skills'].map((strength) => (
                    <div key={strength} className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                      <span className="text-sm">{strength}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Areas to Improve */}
              <div className="p-6 rounded-lg bg-white/5 border border-white/10">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-400" />
                  Improve
                </h3>
                <div className="space-y-3">
                  {['Time Management', 'System Design', 'Behavioral Response'].map((area) => (
                    <div key={area} className="flex items-center gap-3">
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="text-sm">{area}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recommended Sessions */}
          <div className="p-6 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-400" />
                Recommended for You
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {recommendedRoles.map((role, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-blue-500/30 transition hover:bg-white/10"
                >
                  <h3 className="font-semibold mb-2">{role.title}</h3>
                  <p className="text-sm text-gray-400 mb-4">{role.company}</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-3 py-1 rounded-full ${
                      role.difficulty === 'Hard' ? 'bg-red-500/20 text-red-400' :
                      role.difficulty === 'Medium' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {role.difficulty}
                    </span>
                    <Button size="sm" variant="outline">
                      Start
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Tips */}
          <div className="p-6 rounded-lg bg-linear-to-r from-blue-600/10 to-cyan-600/10 border border-white/10">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-400" />
              Pro Tip
            </h3>
            <p className="text-gray-300">
              Practice consistently for better results. Try mixing technical and behavioral sessions to build well-rounded skills. 
              Regular feedback review helps identify patterns in your performance.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}