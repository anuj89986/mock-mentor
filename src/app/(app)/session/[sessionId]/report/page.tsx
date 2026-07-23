'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'
import {
  AlertTriangle,
  ArrowLeft,
  Brain,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  MessageSquareText,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

// ─── Types ────────────────────────────────────────────────────────────────────

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
  improvements?: string[]
  createdAt?: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreHex(score?: number): string {
  if (typeof score !== 'number') return '#64748b'
  if (score >= 85) return '#34d399'
  if (score >= 70) return '#a78bfa'
  if (score >= 50) return '#fbbf24'
  return '#f87171'
}

function normalizeList(value?: string[]): string[] {
  return Array.isArray(value) ? value.filter(Boolean) : []
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PillList({
  items,
  tone = 'violet',
}: {
  items?: string[]
  tone?: 'violet' | 'green' | 'amber' | 'red'
}) {
  const colors: Record<string, string> = {
    violet: 'border-violet-500/25 bg-violet-500/10 text-violet-300',
    green: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300',
    amber: 'border-amber-500/25 bg-amber-500/10 text-amber-300',
    red: 'border-red-500/25 bg-red-500/10 text-red-300',
  }

  const list = normalizeList(items)

  if (!list.length) {
    return <p className="text-sm text-slate-500 italic">No data available.</p>
  }

  return (
    <div className="flex flex-wrap gap-2">
      {list.map((item) => (
        <span
          key={item}
          className={`rounded-md border px-2.5 py-1 text-xs font-medium tracking-wide ${colors[tone]}`}
        >
          {item}
        </span>
      ))}
    </div>
  )
}

/** Arc gauge for the overall score hero */
function ScoreGauge({ score }: { score?: number }) {
  const pct = typeof score === 'number' ? Math.min(100, Math.max(0, score)) : 0
  const color = scoreHex(score)

  // SVG arc math: radius=54, circumference calculated from 270° sweep
  const R = 54
  const circumference = 2 * Math.PI * R
  const sweep = circumference * 0.75 // 270° arc
  const filled = sweep * (pct / 100)
  // const gap = sweep - filled

  // The arc starts at 135° (bottom-left) sweeps clockwise 270°
  const cx = 64
  const cy = 64
  // const startAngle = 135 * (Math.PI / 180)

  return (
    <div className="relative flex items-center justify-center">
      <svg width={128} height={128} viewBox="0 0 128 128" className="overflow-visible" aria-hidden>
        {/* Track */}
        <circle
          cx={cx}
          cy={cy}
          r={R}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={10}
          strokeDasharray={`${sweep} ${circumference - sweep}`}
          strokeDashoffset={circumference * 0.25}
          strokeLinecap="round"
          transform={`rotate(90 ${cx} ${cy})`}
        />
        {/* Fill */}
        <circle
          cx={cx}
          cy={cy}
          r={R}
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeDasharray={`${filled} ${circumference - filled}`}
          strokeDashoffset={circumference * 0.25}
          strokeLinecap="round"
          transform={`rotate(90 ${cx} ${cy})`}
          style={{ filter: `drop-shadow(0 0 8px ${color}88)` }}
        />
      </svg>
      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-3xl font-mono font-bold tracking-tight leading-none"
          style={{ color }}
        >
          {typeof score === 'number' ? score : '—'}
        </span>
        <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mt-0.5">score</span>
      </div>
    </div>
  )
}

function MetricBar({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value?: number
  icon: React.ElementType
}) {
  const color = scoreHex(value)
  const pct = typeof value === 'number' ? value : 0

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Icon className="size-3.5 shrink-0" style={{ color }} />
          <span>{label}</span>
        </div>
        <span className="font-mono text-sm font-semibold" style={{ color }}>
          {typeof value === 'number' ? `${value}%` : 'N/A'}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color, boxShadow: `0 0 6px ${color}66` }}
        />
      </div>
    </div>
  )
}

/** Info tile used in Hire Recommendation */
function InfoTile({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-white/6 bg-white/3 p-4 space-y-1.5">
      <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <div className="text-sm font-medium text-slate-100 leading-snug">{children}</div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

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

  // ── Loading ──

  if (loading) {
    return (
      <Shell>
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="flex flex-col items-center gap-5 text-center">
            <div className="relative flex size-16 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-500/10">
              <Sparkles className="size-6 animate-pulse text-violet-400" />
            </div>
            <div className="space-y-1.5">
              <p className="text-lg font-semibold text-slate-100">Building your report</p>
              <p className="text-sm text-slate-500">Loading interview feedback…</p>
            </div>
          </div>
        </div>
      </Shell>
    )
  }

  // ── Error ──

  if (error || !report) {
    return (
      <Shell>
        <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col items-center justify-center px-4 py-10">
          <Card className="w-full border-white/8 bg-white/3 shadow-2xl backdrop-blur-xl">
            <CardContent className="flex flex-col items-center gap-5 px-8 py-12 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="size-6 text-red-400" />
              </div>
              <div className="space-y-2">
                <h1 className="text-xl font-semibold text-slate-100">Report unavailable</h1>
                <p className="text-sm leading-6 text-slate-500">
                  {error || 'No report data was returned for this session.'}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                <Button variant="outline" asChild className="border-white/10 bg-white/5 text-slate-300 hover:bg-white/10">
                  <Link href={`/session/${sessionId}`}>
                    <ArrowLeft className="size-4" />
                    Back to Session
                  </Link>
                </Button>
                <Button
                  onClick={() => router.push('/dashboard')}
                  className="bg-violet-600 hover:bg-violet-700 text-white"
                >
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </Shell>
    )
  }

  // ── Data prep ──

  const strengths = normalizeList(report.strengths)
  const weaknesses = normalizeList(report.weaknesses)
  const improvements = normalizeList(report.improvements)

  // ── Report view ──

  return (
    <Shell>
      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">

        {/* ── Header ── */}
        <header className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-md border border-violet-500/20 bg-violet-500/8 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-violet-400">
              <Sparkles className="size-3" />
              Interview Report
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-slate-50 sm:text-5xl">
              Session Report
            </h1>

            <div className="flex flex-wrap items-center gap-2.5 text-sm">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-white/8 bg-white/4 px-2.5 py-1 text-xs text-slate-400">
                <Clock3 className="size-3 text-violet-400" />
                {reportDate}
              </span>
            </div>
          </div>

          <Button asChild className="shrink-0 bg-violet-600 hover:bg-violet-700 text-white">
            <Link href="/dashboard">
              Dashboard
              <ChevronRight className="size-4" />
            </Link>
          </Button>
        </header>

        {/* ── Score hero ── */}
        <section className="mb-8">
          <Card className="border-white/8 bg-white/3 shadow-2xl backdrop-blur-xl overflow-hidden">
            <CardContent className="p-0">
              <div className="grid divide-y divide-white/6 lg:grid-cols-[280px_1fr] lg:divide-x lg:divide-y-0">

                {/* Gauge column */}
                <div className="flex flex-col items-center justify-center gap-3 p-8 bg-linear-to-br from-violet-950/40 to-transparent">
                  <ScoreGauge score={overallScore} />
                  <div className="text-center space-y-1">
                    <p className="text-sm font-semibold text-slate-200">Overall Score</p>
                    <p className="text-xs text-slate-500">Composite of all dimensions</p>
                  </div>
                </div>

                {/* Metrics column */}
                <div className="grid gap-6 p-8 sm:grid-cols-2">
                  <MetricBar label="Technical" value={technicalScore} icon={Brain} />
                  <MetricBar label="Communication" value={communicationScore} icon={MessageSquareText} />
                  <MetricBar label="Confidence" value={confidenceScore} icon={Users} />
                  <MetricBar label="Resume Match" value={resumeConsistencyScore} icon={FileText} />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ── Summary ── */}
        <section className="mb-8">

          {/* Summary */}
          <Card className="border-white/8 bg-white/3 shadow-xl backdrop-blur-xl">
            <CardHeader className="border-b border-white/6 pb-4">
              <CardTitle className="text-base font-semibold text-slate-100">Summary</CardTitle>
              <CardDescription className="text-slate-500">
                High-level overview of the session outcome.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-5">
              <p className="text-sm leading-7 text-slate-300">
                {report.summary || 'No summary was generated for this report.'}
              </p>

              <Separator className="bg-white/6" />

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
                    <CheckCircle2 className="size-3.5 text-emerald-400" />
                    Strengths
                  </div>
                  <PillList items={strengths} tone="green" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
                    <AlertTriangle className="size-3.5 text-amber-400" />
                    Weaknesses
                  </div>
                  <PillList items={weaknesses} tone="amber" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
                  <TrendingUp className="size-3.5 text-violet-400" />
                  Areas to Improve
                </div>
                <PillList items={improvements} tone="violet" />
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
      </Shell>
  )
}

// ─── Shell ────────────────────────────────────────────────────────────────────

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-[#080C1A] text-white">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-130 w-130 rounded-full bg-violet-700/12 blur-[120px]" />
        <div className="absolute top-1/2 -right-40 h-96 w-96 rounded-full bg-indigo-600/8 blur-[100px]" />
        <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-violet-800/10 blur-[90px]" />
      </div>
      {children}
    </div>
  )
}
