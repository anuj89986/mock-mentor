"use client"

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import axios from 'axios'
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  PlayCircle,
  Plus,
  Sparkles,
  Target,
  TrendingUp,
  BookOpen,
  Clock3,
  Trash2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'

interface Session {
  _id: string
  status: string
  createdAt: string
  report?: {
    overallScore?: number
    technicalScore?: number
    communicationScore?: number
    confidenceScore?: number
    resumeConsistencyScore?: number
  }
}

export default function Page() {
  const { data: session } = useSession()
  const router = useRouter()
  const [sessions, setSessions] = useState<Session[]>([])

  useEffect(() => {
    const fetchSessionsId = async () => {
      try {
        const response = await axios.get('/api/session')
        setSessions(response.data.sessions)
      } catch (error) {
        console.error('Error fetching sessions:', error)
      }
    }
    fetchSessionsId()
  }, [])

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await axios.delete('/api/session/delete-session', { data: { sessionId } })
      setSessions((prevSessions) => prevSessions.filter((s) => s._id !== sessionId))
    } catch (error) {
      console.error('Error deleting session:', error)
    }
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh bg-[#F3EBDD] p-6 gap-6 text-[#5C5147] selection:bg-[#8C5A3C] selection:text-[#FFFDF8]">
        <div className="text-base md:text-lg font-medium tracking-wide text-center text-[#2B2118]">
          Please sign in to view your sessions.
        </div>
        <Button
          onClick={() => router.push('/')}
          className="bg-[#8C5A3C] hover:bg-[#A06A47] text-[#FFFDF8] font-medium rounded-2xl px-8 py-6 transition-all duration-200 ease-out w-full sm:w-auto shadow-sm"
        >
          Go to Home
        </Button>
      </div>
    )
  }

  const totalSessions = sessions.length
  const activeSessions = sessions.filter((s) => s.status.toLowerCase() === 'active').length
  const completedSessions = sessions.filter((s) => s.status.toLowerCase() === 'completed').length
  const averageScore =
    sessions.reduce((acc, s) => acc + (s.report?.overallScore || 0), 0) / totalSessions

  return (
    // Changed: Removed overflow-auto and used min-h-[100dvh] for native mobile scroll
    <div className="min-h-dvh flex flex-col w-full bg-[#F3EBDD] text-[#5C5147] font-sans selection:bg-[#8C5A3C] selection:text-[#FFFDF8]">
      
      {/* Slim Sticky Header */}
      <header className="sticky top-0 z-20 w-full bg-[#FBF7EF]/95 backdrop-blur-xl border-b border-[#D8CDBD] py-3 md:py-4 transition-all duration-200 shadow-sm">
        <div className="flex items-center justify-between px-4 md:px-12 max-w-7xl mx-auto gap-4">
          <Button
            asChild
            variant="outline"
            className="border-[#D8CDBD] bg-[#FFFDF8] text-[#5C5147] hover:bg-[#FBF7EF] hover:text-[#2B2118] rounded-full sm:rounded-2xl shadow-sm transition-all h-9 px-3 sm:px-4"
          >
            <Link href="/dashboard" className="flex items-center">
              <ArrowLeft className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
          </Button>

          {/* Mobile-only page title */}
          <span className="text-sm font-medium text-[#2B2118] sm:hidden truncate">
            Sessions
          </span>

          <Button
            asChild
            className="bg-[#8C5A3C] hover:bg-[#A06A47] text-[#FFFDF8] rounded-full sm:rounded-2xl shadow-md transition-all duration-200 ease-out font-medium h-9 px-3 sm:px-4 shrink-0"
          >
            <Link href="/interview">
              <Plus className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">New Session</span>
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-6 md:py-10 pb-12">
        
        {/* Page Titles - Moved into main body to save sticky header space */}
        <div className="mb-8 md:mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 rounded-full border border-[#D8CDBD] bg-[#FFFDF8] text-[10px] md:text-xs font-medium uppercase tracking-widest text-[#8C5A3C] shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            Session library
          </div>
          <h1 className="text-2xl md:text-4xl font-medium tracking-tight text-[#2B2118] mb-1 md:mb-2">
            Your interview sessions
          </h1>
          <p className="text-[#8D8175] text-sm md:text-base font-normal max-w-2xl">
            Review past mock interviews, continue active sessions, and track your progress.
          </p>
        </div>

        {/* Stats Section */}
        <section className="mb-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-[#D8CDBD] bg-[#FFFDF8] shadow-sm p-5 md:p-6 overflow-hidden transition-all hover:border-[#8C5A3C]/30">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[10px] md:text-xs font-medium uppercase tracking-widest text-[#8D8175] mb-2 truncate">
                  Total Sessions
                </p>
                <p className="text-2xl md:text-3xl font-medium text-[#8C5A3C]">{totalSessions}</p>
              </div>
              <div className="flex w-10 h-10 md:w-12 md:h-12 shrink-0 items-center justify-center rounded-xl bg-[#FBF7EF] border border-[#D8CDBD] text-[#8C5A3C]">
                <BookOpen className="w-4 h-4 md:w-5 md:h-5" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#D8CDBD] bg-[#FFFDF8] shadow-sm p-5 md:p-6 overflow-hidden transition-all hover:border-[#8C5A3C]/30">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[10px] md:text-xs font-medium uppercase tracking-widest text-[#8D8175] mb-2 truncate">
                  Active
                </p>
                <p className="text-2xl md:text-3xl font-medium text-[#8C5A3C]">{activeSessions}</p>
              </div>
              <div className="flex w-10 h-10 md:w-12 md:h-12 shrink-0 items-center justify-center rounded-xl bg-[#FBF7EF] border border-[#D8CDBD] text-[#8C5A3C]">
                <PlayCircle className="w-4 h-4 md:w-5 md:h-5" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#D8CDBD] bg-[#FFFDF8] shadow-sm p-5 md:p-6 overflow-hidden transition-all hover:border-[#8C5A3C]/30">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[10px] md:text-xs font-medium uppercase tracking-widest text-[#8D8175] mb-2 truncate">
                  Completed
                </p>
                <p className="text-2xl md:text-3xl font-medium text-[#8C5A3C]">{completedSessions}</p>
              </div>
              <div className="flex w-10 h-10 md:w-12 md:h-12 shrink-0 items-center justify-center rounded-xl bg-[#FBF7EF] border border-[#D8CDBD] text-[#8C5A3C]">
                <Target className="w-4 h-4 md:w-5 md:h-5" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#D8CDBD] bg-[#FFFDF8] shadow-sm p-5 md:p-6 overflow-hidden transition-all hover:border-[#8C5A3C]/30">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[10px] md:text-xs font-medium uppercase tracking-widest text-[#8D8175] mb-2 truncate">
                  Average Score
                </p>
                <p className="text-2xl md:text-3xl font-medium text-[#8C5A3C]">
                  {Number.isFinite(averageScore) ? `${Math.round(averageScore)}%` : 'N/A'}
                </p>
              </div>
              <div className="flex w-10 h-10 md:w-12 md:h-12 shrink-0 items-center justify-center rounded-xl bg-[#FBF7EF] border border-[#D8CDBD] text-[#8C5A3C]">
                <TrendingUp className="w-4 h-4 md:w-5 md:h-5" />
              </div>
            </div>
          </div>
        </section>

        {/* Sessions List */}
        <section className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-medium text-[#2B2118]">Recent Sessions</h2>
          </div>

          {sessions.length === 0 ? (
            <div className="p-10 md:p-16 rounded-2xl bg-[#FFFDF8] border border-[#D8CDBD] shadow-sm text-center flex flex-col items-center">
              <div className="flex w-16 h-16 items-center justify-center rounded-xl bg-[#FBF7EF] border border-[#D8CDBD] mb-6 text-[#8C5A3C]">
                <BookOpen className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-medium text-[#2B2118] mb-2">No sessions yet</h3>
              <p className="text-[#8D8175] max-w-sm mb-8 text-sm font-normal">
                Start your first interview session to see it appear here.
              </p>
              <Button
                asChild
                className="bg-[#8C5A3C] hover:bg-[#A06A47] text-[#FFFDF8] rounded-2xl px-8 py-6 shadow-md transition-all duration-200 ease-out font-medium"
              >
                <Link href="/interview">
                  <Plus className="w-4 h-4 mr-2" />
                  Start Interview
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {sessions
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((item) => (
                  <article
                    key={item._id}
                    className="group rounded-2xl border border-[#D8CDBD] bg-[#FFFDF8] p-4 md:p-6 shadow-sm transition-all duration-200 hover:border-[#8C5A3C]/50 hover:bg-[#FBF7EF]"
                  >
                    <div className="flex flex-col gap-4 sm:gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 md:mb-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-widest border ${
                              item.status.toLowerCase() === 'completed'
                                ? 'bg-[#8C5A3C]/10 text-[#8C5A3C] border-[#8C5A3C]/20'
                                : 'bg-[#FBF7EF] text-[#5C5147] border-[#D8CDBD]'
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>

                        <h3 className="truncate text-base sm:text-lg md:text-xl font-medium text-[#2B2118] group-hover:text-[#8C5A3C] transition-colors">
                          Session {item._id.slice(-6).toUpperCase()}
                        </h3>

                        <div className="mt-1.5 md:mt-2.5 flex flex-wrap gap-x-4 gap-y-2 text-xs md:text-sm text-[#8D8175]">
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays className="w-3.5 h-3.5" />
                            {new Date(item.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Clock3 className="w-3.5 h-3.5" />
                            {new Date(item.createdAt).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-row items-center justify-between sm:justify-end gap-3 mt-2 lg:mt-0 shrink-0">
                        <div className="rounded-xl border border-[#D8CDBD] bg-[#FBF7EF] px-4 py-2 sm:px-5 sm:py-2.5 text-center min-w-20 sm:min-w-22">
                          <div className="text-[10px] uppercase tracking-widest text-[#8D8175] mb-0.5 font-medium">
                            Score
                          </div>
                          <div className="text-base sm:text-lg md:text-xl font-medium text-[#8C5A3C]">
                            {item.report === undefined ? '—' : `${item.report?.overallScore}%`}
                          </div>
                        </div>

                        <Button
                          asChild
                          className="bg-[#8C5A3C] hover:bg-[#A06A47] text-[#FFFDF8] rounded-xl px-5 sm:px-6 py-5 sm:py-0 h-auto sm:h-15 shadow-sm transition-all font-medium flex-1 sm:flex-none"
                        >
                          {item.status.toLowerCase() === 'completed' ? (
                            <Link href={`/session/${item._id}/report`}>
                              View Report
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                          ) : (
                            <Link href={`/session/${item._id}`}>
                              Continue
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                          )}
                        </Button>
                        <Button
                          onClick={() => handleDeleteSession(item._id)}
                          variant="destructive"
                          className="bg-[#FFFDF8] hover:bg-[#FBF7EF] text-[#5C5147] border border-[#D8CDBD] rounded-xl px-5 sm:px-6 py-5 sm:py-0 h-auto sm:h-15 shadow-sm transition-all font-medium flex-1 sm:flex-none"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </article>
                ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}