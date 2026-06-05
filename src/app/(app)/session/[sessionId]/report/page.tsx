'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'
import {
AlertTriangle,
ArrowLeft,
BadgeCheck,
Brain,
CheckCircle2,
ChevronDown,
ChevronRight,
Clock3,
FileText,
GraduationCap,
MessageSquareText,
ShieldCheck,
Sparkles,
Target,
TrendingUp,
Users
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

type QuestionAnalysis = {
  question?: string
  questionType?: string
  analysis?: string
  score?: number
}

type Report = {
  _id?: string
  sessionId?: string
  userId?: string
  overallScore?: number
  technicalScore?: number
  communicationScore?: number
  confidenceScore?: number
  resumeConsistencyScore?: number
  strengths?: string[]
  weaknesses?: string[]
  summary?: string
  hireRecommendation?: {
    decision?: string
    level?: string
    recommendedConfidence?: number
  }
  improvements?: string[]
  resumeAnalysis?: {
    claimedSkills?: string[]
    validatedSkills?: string[]
    missingDepthAreas?: string[]
    strongAreas?: string[]
  }
  questionAnalysis?: QuestionAnalysis[]
  finalVerdict?: string
  createdAt?: string
}

function scoreTone(score?: number) {
  if (typeof score !== 'number') return 'text-muted-foreground'
  if (score >= 85) return 'text-emerald-400'
  if (score >= 70) return 'text-blue-400'
  if (score >= 50) return 'text-amber-400'
  return 'text-red-400'
}

function scoreBg(score?: number) {
  if (typeof score !== 'number') return 'bg-white/5'
  if (score >= 85) return 'bg-emerald-500/10'
  if (score >= 70) return 'bg-blue-500/10'
  if (score >= 50) return 'bg-amber-500/10'
  return 'bg-red-500/10'
}

function normalizeList(value?: string[]) {
  return Array.isArray(value) ? value.filter(Boolean) : []
}

function PillList({
  items,
  tone = 'blue',
}: {
  items?: string[]
  tone?: 'blue' | 'green' | 'amber' | 'red'
}) {
  const colors = {
    blue: 'border-blue-500/20 bg-blue-500/10 text-blue-300',
    green: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
    amber: 'border-amber-500/20 bg-amber-500/10 text-amber-300',
    red: 'border-red-500/20 bg-red-500/10 text-red-300',
  }

  const list = normalizeList(items)

  if (!list.length) {
    return <p className="text-sm text-muted-foreground">No data available.</p>
  }

  return (
    <div className="flex flex-wrap gap-2">
      {list.map((item) => (
        <span
          key={item}
          className={`rounded-full border px-3 py-1 text-xs font-medium ${colors[tone]}`}
        >
          {item}
        </span>
      ))}
    </div>
  )
}

function MetricCard({
  label,
  value,
  icon: Icon,
  score,
}: {
  label: string
  value?: number
  icon: React.ElementType
  score?: number
}) {
  return (
    <Card className={`border-border/70 bg-card/70 shadow-sm backdrop-blur ${scoreBg(score)}`}>
      <CardContent className="pt-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{label}</p>
          <Icon className={`size-4 ${scoreTone(score)}`} />
        </div>
        <div className={`text-3xl font-semibold ${scoreTone(score)}`}>
          {typeof value === 'number' ? `${value}%` : 'N/A'}
        </div>
      </CardContent>
    </Card>
  )
}

export default function ReportPage() {
  const params = useParams<{ sessionId: string }>()
  const router = useRouter()
  const sessionId = params?.sessionId

  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`/api/session/${sessionId}/get-report`)
        setReport(response.data.report)
      } catch (err) {
        setError('Report not found or could not be loaded.')
      } finally {
        setLoading(false)
      }
    }

    if (sessionId) fetchReport()
  }, [sessionId])

  const overallScore = report?.overallScore
  const technicalScore = report?.technicalScore
  const communicationScore = report?.communicationScore
  const confidenceScore = report?.confidenceScore
  const resumeConsistencyScore = report?.resumeConsistencyScore

  const reportDate = useMemo(() => {
    if (!report?.createdAt) return 'Recently generated'
    return new Date(report.createdAt).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }, [report?.createdAt])

  if (loading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_35%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0))] text-white">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
        </div>
        <div className="relative flex min-h-screen items-center justify-center px-4">
          <Card className="border-border/70 bg-card/80 shadow-[0_24px_70px_-32px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <CardContent className="flex flex-col items-center gap-4 px-8 py-10">
              <div className="flex size-12 items-center justify-center rounded-full bg-blue-500/10">
                <Sparkles className="size-5 animate-pulse text-blue-400" />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-foreground">Generating report view</p>
                <p className="text-sm text-muted-foreground">Loading your interview feedback.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_35%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0))] text-white">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
        </div>
        <main className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center px-4 py-10">
          <Card className="w-full border-border/70 bg-card/80 shadow-[0_24px_70px_-32px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <CardContent className="flex flex-col items-center gap-4 px-8 py-10 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-red-500/10">
                <AlertTriangle className="size-6 text-red-400" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-semibold text-foreground">Report unavailable</h1>
                <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                  {error || 'No report data was returned for this session.'}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Button variant="outline" asChild className="border-border/70 bg-card/70">
                  <Link href={`/session/${sessionId}`}>
                    <ArrowLeft className="size-4" />
                    Back to Session
                  </Link>
                </Button>
                <Button onClick={() => router.push('/dashboard')} className="bg-blue-600 hover:bg-blue-700">
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const strengths = normalizeList(report.strengths)
  const weaknesses = normalizeList(report.weaknesses)
  const improvements = normalizeList(report.improvements)
  const claimedSkills = normalizeList(report.resumeAnalysis?.claimedSkills)
  const validatedSkills = normalizeList(report.resumeAnalysis?.validatedSkills)
  const missingDepthAreas = normalizeList(report.resumeAnalysis?.missingDepthAreas)
  const strongAreas = normalizeList(report.resumeAnalysis?.strongAreas)
  const questionAnalysis = Array.isArray(report.questionAnalysis) ? report.questionAnalysis : []

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_35%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0))] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
      </div>

      <main className="relative mx-auto min-h-screen w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <header className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground shadow-sm backdrop-blur">
              <Sparkles className="size-3.5 text-blue-400" />
              Interview report
            </div>

            <div className="space-y-3">
              <h1 className="font-heading text-4xl leading-tight font-semibold tracking-tight text-balance text-foreground sm:text-5xl">
                Your session report
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                A complete breakdown of performance, resume alignment, hiring
                recommendation, and question-level feedback.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/60 px-3 py-1">
                <Clock3 className="size-3.5 text-blue-400" />
                {reportDate}
              </span>
              {report.finalVerdict ? (
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-emerald-300">
                  <BadgeCheck className="size-3.5" />
                  {report.finalVerdict}
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="outline" asChild className="border-border/70 bg-card/70 shadow-sm backdrop-blur">
              <Link href={`/session/${sessionId}`}>
                <ArrowLeft className="size-4" />
                Back to Session
              </Link>
            </Button>
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/dashboard">
                Dashboard
                <ChevronRight className="size-4" />
              </Link>
            </Button>
          </div>
        </header>

        <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <MetricCard label="Overall Score" value={overallScore} icon={Target} score={overallScore} />
          <MetricCard label="Technical" value={technicalScore} icon={Brain} score={technicalScore} />
          <MetricCard label="Communication" value={communicationScore} icon={MessageSquareText} score={communicationScore} />
          <MetricCard label="Confidence" value={confidenceScore} icon={Users} score={confidenceScore} />
          <MetricCard label="Resume Match" value={resumeConsistencyScore} icon={FileText} score={resumeConsistencyScore} />
        </section>

        <section className="mb-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <Card className="border-border/70 bg-card/80 shadow-[0_24px_70px_-32px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <CardHeader className="border-b border-border/60 pb-5">
              <CardTitle className="text-xl">Summary</CardTitle>
              <CardDescription>
                High-level overview of the session outcome and interviewer-style feedback.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <p className="text-sm leading-6 text-foreground/90">
                {report.summary || 'No summary was generated for this report.'}
              </p>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <CheckCircle2 className="size-4 text-emerald-400" />
                    Strengths
                  </div>
                  <PillList items={strengths} tone="green" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <AlertTriangle className="size-4 text-amber-400" />
                    Weaknesses
                  </div>
                  <PillList items={weaknesses} tone="amber" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <TrendingUp className="size-4 text-blue-400" />
                  Improvements
                </div>
                <PillList items={improvements} tone="blue" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/80 shadow-[0_24px_70px_-32px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <CardHeader className="border-b border-border/60 pb-5">
              <CardTitle className="text-xl">Hire Recommendation</CardTitle>
              <CardDescription>Decision, confidence, and placement level.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div className="rounded-2xl border border-border/70 bg-background/40 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Decision</p>
                <p className="mt-2 text-lg font-semibold text-foreground">
                  {report.hireRecommendation?.decision || 'Not specified'}
                </p>
              </div>

              <div className="rounded-2xl border border-border/70 bg-background/40 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Level</p>
                <p className="mt-2 text-lg font-semibold text-foreground">
                  {report.hireRecommendation?.level || 'Not specified'}
                </p>
              </div>

              <div className="rounded-2xl border border-border/70 bg-background/40 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Recommended Confidence</p>
                <div className="mt-3 flex items-end justify-between gap-4">
                  <p className={`text-3xl font-semibold ${scoreTone(report.hireRecommendation?.recommendedConfidence)}`}>
                    {typeof report.hireRecommendation?.recommendedConfidence === 'number'
                      ? `${report.hireRecommendation.recommendedConfidence}%`
                      : 'N/A'}
                  </p>
                  <ShieldCheck className="size-5 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mb-8 grid gap-6 lg:grid-cols-2">
          <Card className="border-border/70 bg-card/80 shadow-[0_24px_70px_-32px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <CardHeader className="border-b border-border/60 pb-5">
              <CardTitle className="text-xl">Resume Analysis</CardTitle>
              <CardDescription>How the interview matched the candidate profile.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div className="space-y-3">
                <p className="text-sm font-semibold text-foreground">Claimed Skills</p>
                <PillList items={claimedSkills} tone="blue" />
              </div>
              <div className="space-y-3">
                <p className="text-sm font-semibold text-foreground">Validated Skills</p>
                <PillList items={validatedSkills} tone="green" />
              </div>
              <div className="space-y-3">
                <p className="text-sm font-semibold text-foreground">Missing Depth Areas</p>
                <PillList items={missingDepthAreas} tone="amber" />
              </div>
              <div className="space-y-3">
                <p className="text-sm font-semibold text-foreground">Strong Areas</p>
                <PillList items={strongAreas} tone="green" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/80 shadow-[0_24px_70px_-32px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <CardHeader className="border-b border-border/60 pb-5">
              <CardTitle className="text-xl">Final Verdict</CardTitle>
              <CardDescription>End-state evaluation and closing summary.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div className="rounded-2xl border border-border/70 bg-linear-to-br from-blue-600/15 to-cyan-600/10 p-5">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <GraduationCap className="size-4 text-blue-400" />
                  Final Verdict
                </div>
                <p className="text-sm leading-6 text-foreground/90">
                  {report.finalVerdict || 'No final verdict available.'}
                </p>
              </div>

              <div className="rounded-2xl border border-border/70 bg-background/40 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Session ID</p>
                <p className="mt-2 break-all text-sm text-foreground/90">
                  {report.sessionId || sessionId}
                </p>
              </div>

              <div className="rounded-2xl border border-border/70 bg-background/40 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">User ID</p>
                <p className="mt-2 break-all text-sm text-foreground/90">
                  {report.userId || 'Not available'}
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <MessageSquareText className="size-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-foreground">Question Analysis</h2>
          </div>

          {questionAnalysis.length === 0 ? (
            <Card className="border-border/70 bg-card/80 shadow-sm backdrop-blur-xl">
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                No per-question analysis was included in this report.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {questionAnalysis.map((item, index) => (
                <Card
                  key={`${item.question || 'question'}-${index}`}
                  className="border-border/70 bg-card/80 shadow-sm backdrop-blur-xl"
                >
                  <CardHeader className="border-b border-border/60 pb-4">
                    <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <CardTitle className="text-base">
                          Question {index + 1}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {item.questionType || 'General'}
                        </CardDescription>
                      </div>
                      <div className={`rounded-full px-3 py-1 text-sm font-semibold ${scoreBg(item.score)} ${scoreTone(item.score)}`}>
                        {typeof item.score === 'number' ? `${item.score}%` : 'N/A'}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-5">
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Question</p>
                      <p className="text-sm leading-6 text-foreground/90">
                        {item.question || 'No question text available.'}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Analysis</p>
                      <p className="text-sm leading-6 text-foreground/90">
                        {item.analysis || 'No analysis available.'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}