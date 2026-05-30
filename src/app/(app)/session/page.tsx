'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {useState , useEffect} from 'react'
import axios from 'axios'
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Filter,
  PlayCircle,
  Plus,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  BookOpen,
} from 'lucide-react'

import { Button } from '@/components/ui/button'

interface Session {
  _id: string,
  status: string
}

export default function Page() {
  const { data: session } = useSession()
  const router = useRouter()
  const [sessions, setSessions] = useState<Session[]>([])

  useEffect(()=>{
    const fetchSessionsId = async()=>{
      try{
        const response = await axios.get('/api/session')
        setSessions(response.data.sessions)
        console.log(response.data.sessions)
      } catch (error) {
        console.error('Error fetching sessions:', error)
      }
    }
    fetchSessionsId();
  }
  ,[])

  if (!session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black px-4 text-center text-white">
        <p className="text-lg">Please sign in to view your sessions.</p>
        <Button onClick={() => router.push('/')}>Go to Home</Button>
      </div>
    )
  }

  const totalSessions = sessions.length
  const activeSessions = sessions.filter(s => s.status === 'active').length
  const completedSessions = sessions.filter(s => s.status === 'completed').length
  // const averageScore = sessions.reduce((acc, s) => acc + (s.score || 0), 0) / totalSessions

  return (
    <div className="relative flex-1 overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_35%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0))] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
      </div>

      <main className="relative mx-auto min-h-screen w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <header className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground shadow-sm backdrop-blur">
              <Sparkles className="size-3.5 text-blue-400" />
              Session library
            </div>

            <div className="space-y-3">
              <h1 className="font-heading text-4xl leading-tight font-semibold tracking-tight text-balance text-foreground sm:text-5xl">
                Your interview sessions
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                Review past mock interviews, open any session to continue, and
                keep track of your progress over time.
              </p>
            </div>
          </div>

          <Button asChild className="shrink-0 gap-2 bg-blue-600 hover:bg-blue-700">
            <Link href="/interview">
              <Plus className="size-4" />
              New Session
            </Link>
          </Button>
        </header>

        <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-border/70 bg-card/70 p-5 shadow-sm backdrop-blur">
            <div className="mb-4 flex items-center justify-between text-muted-foreground">
              <span className="text-sm">Total Sessions</span>
              <BookOpen className="size-4 text-blue-400" />
            </div>
            <div className="text-3xl font-semibold text-foreground">{totalSessions}</div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card/70 p-5 shadow-sm backdrop-blur">
            <div className="mb-4 flex items-center justify-between text-muted-foreground">
              <span className="text-sm">Active</span>
              <PlayCircle className="size-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-semibold text-foreground">{activeSessions}</div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card/70 p-5 shadow-sm backdrop-blur">
            <div className="mb-4 flex items-center justify-between text-muted-foreground">
              <span className="text-sm">Completed</span>
              <Target className="size-4 text-green-400" />
            </div>
            <div className="text-3xl font-semibold text-foreground">{completedSessions}</div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card/70 p-5 shadow-sm backdrop-blur">
            <div className="mb-4 flex items-center justify-between text-muted-foreground">
              <span className="text-sm">Average Score</span>
              <TrendingUp className="size-4 text-amber-400" />
            </div>
            <div className="text-3xl font-semibold text-foreground">
              {/* {Number.isFinite(averageScore) ? `${Math.round(averageScore)}%` : 'N/A'} */}
            </div>
          </div>
        </section>

        <section className="mb-8 rounded-3xl border border-border/70 bg-card/70 p-4 shadow-sm backdrop-blur sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search sessions"
                className="h-12 w-full rounded-2xl border border-border/70 bg-background/60 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none transition focus:border-blue-500/50"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="gap-2 border-border/70 bg-card/70">
                <Filter className="size-4" />
                Filter
              </Button>
              <Button variant="outline" className="gap-2 border-border/70 bg-card/70">
                <CalendarDays className="size-4" />
                Sort by Date
              </Button>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Recent Sessions</h2>
          </div>

          {sessions.length === 0 ? (
            <div className="rounded-3xl border border-border/70 bg-card/70 p-10 text-center shadow-sm backdrop-blur">
              <h3 className="mb-2 text-xl font-semibold text-foreground">No sessions yet</h3>
              <p className="mb-6 text-sm text-muted-foreground">
                Start your first interview session to see it appear here.
              </p>
              <Button asChild className="gap-2 bg-blue-600 hover:bg-blue-700">
                <Link href="/interview">
                  <Plus className="size-4" />
                  Start Interview
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {sessions.map((item,idx) => (
                <article
                  key={item._id}
                  className="group rounded-3xl border border-border/70 bg-card/70 p-5 shadow-sm transition hover:border-blue-500/40 hover:bg-card/80 hover:shadow-lg hover:shadow-blue-500/5 backdrop-blur"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        {/* <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
                          {item.style}
                        </span> */}
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            item.status === 'Completed'
                              ? 'bg-green-500/10 text-green-400'
                              : 'bg-amber-500/10 text-amber-400'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>

                      <h3 className="truncate text-xl font-semibold text-foreground">
                        Session {idx + 1}
                      </h3>

                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                        {/* <span className="inline-flex items-center gap-2">
                          <CalendarDays className="size-4 text-blue-400" />
                          {item.date}
                        </span> */}
                        {/* <span className="inline-flex items-center gap-2">
                          <Clock3 className="size-4 text-cyan-400" />
                          {item.time}
                        </span> */}
                        {/* <span className="inline-flex items-center gap-2">
                          <Users className="size-4 text-emerald-400" />
                          {item.questions} questions
                        </span> */}
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <div className="rounded-2xl border border-border/70 bg-background/60 px-4 py-3 text-center">
                        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                          Score
                        </div>
                        {/* <div className="text-2xl font-semibold text-foreground">
                          {item.score === null ? '—' : `${item.score}%`}
                        </div> */}
                      </div>

                      <Button asChild className="gap-2 bg-blue-600 hover:bg-blue-700">
                        <Link href={`/session/${item._id}/report`}>
                          View Report
                          <ArrowRight className="size-4" />
                        </Link>
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