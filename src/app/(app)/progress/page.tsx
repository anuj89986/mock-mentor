'use client'

import { useEffect, useState, useMemo } from 'react'
import axios from 'axios'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  TrendingUp,
  Target,
  Brain,
  MessageSquareText,
  Users,
  Calendar,
  CheckCircle2
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { StatCard } from '@/components/cards/StatCard'

type SessionWithReport = {
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

type ScoreHistory = {
  date: string
  overall: number
  technical: number
  communication: number
  confidence: number
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']


function SessionCard({ session }: { session: SessionWithReport }) {
  const overallScore = session.report?.overallScore ?? 0
  const sessionDate = new Date(session.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  function scoreTone(score: number) {
    if (score >= 85) return 'text-emerald-400'
    if (score >= 70) return 'text-blue-400'
    if (score >= 50) return 'text-amber-400'
    return 'text-red-400'
  }

  function scoreBg(score: number) {
    if (score >= 85) return 'bg-emerald-500/10 border-emerald-500/20'
    if (score >= 70) return 'bg-blue-500/10 border-blue-500/20'
    if (score >= 50) return 'bg-amber-500/10 border-amber-500/20'
    return 'bg-red-500/10 border-red-500/20'
  }

  return (
    <Link href={`/session/${session._id}/report`} className="block">
      <Card className="border-border/70 bg-card/70 shadow-sm backdrop-blur transition-all hover:bg-card/85 cursor-pointer">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="space-y-3 flex-1">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Session Report</p>
              <div className="flex items-center gap-3">
                <div className={`rounded-lg border px-4 py-2 ${scoreBg(overallScore)}`}>
                  <p className={`text-2xl font-semibold ${scoreTone(overallScore)}`}>{overallScore}%</p>
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-foreground">Overall Performance</p>
                  <p className="text-xs text-muted-foreground">{sessionDate}</p>
                </div>
              </div>
            </div>
            <CheckCircle2 className={`size-5 ${scoreTone(overallScore)}`} />
          </div>

          {session.report && (
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded border border-border/50 bg-background/40 p-2">
                <p className="text-muted-foreground">Technical</p>
                <p className="font-semibold text-foreground">{session.report.technicalScore}%</p>
              </div>
              <div className="rounded border border-border/50 bg-background/40 p-2">
                <p className="text-muted-foreground">Communication</p>
                <p className="font-semibold text-foreground">{session.report.communicationScore}%</p>
              </div>
              <div className="rounded border border-border/50 bg-background/40 p-2">
                <p className="text-muted-foreground">Confidence</p>
                <p className="font-semibold text-foreground">{session.report.confidenceScore}%</p>
              </div>
              <div className="rounded border border-border/50 bg-background/40 p-2">
                <p className="text-muted-foreground">Resume Match</p>
                <p className="font-semibold text-foreground">{session.report.resumeConsistencyScore}%</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

export default function ProgressPage() {
  const [sessions, setSessions] = useState<SessionWithReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true)
        const response = await axios.get('/api/session')
        const sessionsData = response.data.sessions || []

        // Fetch reports for each session
        const sessionsWithReports = await Promise.all(
          sessionsData.map(async (session: any) => {
            try {
              const reportRes = await axios.get(`/api/session/${session._id}/get-report`)
              return {
                ...session,
                report: reportRes.data.report,
              }
            } catch {
              return session
            }
          })
        )

        setSessions(sessionsWithReports.filter((s: any) => s.report))
      } catch (err) {
        setError('Failed to load progress data.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchSessions()
  }, [])

  const stats = useMemo(() => {
    if (sessions.length === 0) {
      return {
        avgOverall: 0,
        avgTechnical: 0,
        avgCommunication: 0,
        avgConfidence: 0,
        totalSessions: 0,
      }
    }

    const overallScores = sessions
      .map((s) => s.report?.overallScore || 0)
      .filter((score) => score > 0)
    const technicalScores = sessions
      .map((s) => s.report?.technicalScore || 0)
      .filter((score) => score > 0)
    const communicationScores = sessions
      .map((s) => s.report?.communicationScore || 0)
      .filter((score) => score > 0)
    const confidenceScores = sessions
      .map((s) => s.report?.confidenceScore || 0)
      .filter((score) => score > 0)

    return {
      avgOverall: overallScores.length > 0 ? Math.round(overallScores.reduce((a, b) => a + b, 0) / overallScores.length) : 0,
      avgTechnical: technicalScores.length > 0 ? Math.round(technicalScores.reduce((a, b) => a + b, 0) / technicalScores.length) : 0,
      avgCommunication: communicationScores.length > 0 ? Math.round(communicationScores.reduce((a, b) => a + b, 0) / communicationScores.length) : 0,
      avgConfidence: confidenceScores.length > 0 ? Math.round(confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length) : 0,
      totalSessions: sessions.length,
    }
  }, [sessions])

  const scoreHistory = useMemo(() => {
    return sessions
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .map((session, index) => ({
        date: `Session ${index + 1}`,
        overall: session.report?.overallScore || 0,
        technical: session.report?.technicalScore || 0,
        communication: session.report?.communicationScore || 0,
        confidence: session.report?.confidenceScore || 0,
      }))
  }, [sessions])

  const categoryBreakdown = useMemo(() => {
    return [
      {
        name: 'Technical',
        value: stats.avgTechnical,
      },
      {
        name: 'Communication',
        value: stats.avgCommunication,
      },
      {
        name: 'Confidence',
        value: stats.avgConfidence,
      },
    ].filter((item) => item.value > 0)
  }, [stats])

  if (loading) {
    return (
      <div className="relative min-h-screen overflow-hidden w-full bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_35%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0))] text-white">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
        </div>
        <div className="relative flex min-h-screen items-center justify-center px-4">
          <Card className="border-border/70 bg-card/80 shadow-[0_24px_70px_-32px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <CardContent className="flex flex-col items-center gap-4 px-8 py-10">
              <div className="flex size-12 items-center justify-center rounded-full bg-blue-500/10">
                <TrendingUp className="size-5 animate-pulse text-blue-400" />
              </div>
              <p className="text-lg font-semibold text-foreground">Loading your progress</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen w-full bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_35%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0))] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
      </div>

      <main className="relative mx-auto min-h-screen w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <header className="mb-10 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground shadow-sm backdrop-blur">
            <TrendingUp className="size-3.5 text-blue-400" />
            Progress & Analytics
          </div>

          <div className="space-y-3">
            <h1 className="font-heading text-4xl leading-tight font-semibold tracking-tight text-balance text-foreground sm:text-5xl">
              Your interview journey
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              Track your performance across multiple sessions, identify patterns, and see how you're improving over time.
            </p>
          </div>
        </header>

        {error && (
          <Card className="mb-8 border-red-500/30 bg-red-500/10">
            <CardContent className="pt-6">
              <p className="text-sm text-red-300">{error}</p>
            </CardContent>
          </Card>
        )}

        {sessions.length === 0 ? (
          <Card className="border-border/70 bg-card/80 shadow-[0_24px_70px_-32px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <CardContent className="flex flex-col items-center gap-4 px-8 py-16 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-blue-500/10">
                <Calendar className="size-6 text-blue-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground">No sessions yet</h3>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Start your first interview session to begin tracking your progress and performance.
                </p>
              </div>
              <Button asChild className="mt-4 bg-blue-600 hover:bg-blue-700">
                <Link href="/interview">Start an Interview</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Summary Stats */}
            <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <StatCard label="Average Overall" value={stats.avgOverall} icon={Target} />
              <StatCard label="Technical" value={stats.avgTechnical} icon={Brain}  />
              <StatCard label="Communication" value={stats.avgCommunication} icon={MessageSquareText} />
              <StatCard label="Confidence" value={stats.avgConfidence} icon={Users} />
              <StatCard label="Total Sessions" value={stats.totalSessions} icon={Calendar} />
            </section>

            {/* Charts */}
            <section className="mb-8 grid gap-6 lg:grid-cols-3">
              {/* Score Trend Chart */}
              <Card className="col-span-2 border-border/70 bg-card/80 shadow-[0_24px_70px_-32px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                <CardHeader className="border-b border-border/60 pb-5">
                  <CardTitle className="text-xl">Score Trends</CardTitle>
                  <CardDescription>
                    Your performance across all metrics over time.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={scoreHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" style={{ fontSize: '12px' }} />
                      <YAxis stroke="rgba(255,255,255,0.5)" style={{ fontSize: '12px' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(0,0,0,0.8)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                        }}
                        formatter={(value) => `${value}%`}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="overall" stroke="#3b82f6" name="Overall" strokeWidth={2} />
                      <Line type="monotone" dataKey="technical" stroke="#10b981" name="Technical" strokeWidth={2} />
                      <Line
                        type="monotone"
                        dataKey="communication"
                        stroke="#f59e0b"
                        name="Communication"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="confidence"
                        stroke="#8b5cf6"
                        name="Confidence"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Category Breakdown */}
              <Card className="border-border/70 bg-card/80 shadow-[0_24px_70px_-32px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                <CardHeader className="border-b border-border/60 pb-5">
                  <CardTitle className="text-xl">Category Breakdown</CardTitle>
                  <CardDescription>
                    Average performance by category.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {categoryBreakdown.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={categoryBreakdown}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {categoryBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value}%`} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-sm text-muted-foreground">No data available</p>
                  )}
                </CardContent>
              </Card>
            </section>

            {/* Score Distribution */}
            <section className="mb-8">
              <Card className="border-border/70 bg-card/80 shadow-[0_24px_70px_-32px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                <CardHeader className="border-b border-border/60 pb-5">
                  <CardTitle className="text-xl">Score Distribution</CardTitle>
                  <CardDescription>
                    Comparison of average scores across all metrics.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={categoryBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" style={{ fontSize: '12px' }} />
                      <YAxis stroke="rgba(255,255,255,0.5)" style={{ fontSize: '12px' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(0,0,0,0.8)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                        }}
                        formatter={(value) => `${value}%`}
                      />
                      <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </section>

            {/* Recent Sessions */}
            <section className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Recent Sessions</h2>
                <p className="text-sm text-muted-foreground">Click on any session to view detailed feedback and recommendations.</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {sessions
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((session) => (
                    <SessionCard key={session._id} session={session} />
                  ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  )
}
