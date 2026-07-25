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
  if (typeof score !== 'number') return '#8D8175' // Neutral Taupe
  if (score >= 85) return '#2A9D8F' // Teal (Excellent)
  if (score >= 70) return '#8C5A3C' // Terracotta (Good)
  if (score >= 50) return '#F4A261' // Sandy Gold (Average)
  return '#E76F51' // Coral (Poor)
}

function normalizeList(value?: string[]): string[] {
  return Array.isArray(value) ? value.filter(Boolean) : []
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PillList({
  items,
  tone = 'terracotta',
}: {
  items?: string[]
  tone?: 'terracotta' | 'teal' | 'gold' | 'coral'
}) {
  const colors: Record<string, string> = {
    terracotta: 'border-[#8C5A3C]/20 bg-[#8C5A3C]/5 text-[#8C5A3C]',
    teal: 'border-[#2A9D8F]/20 bg-[#2A9D8F]/5 text-[#2A9D8F]',
    gold: 'border-[#F4A261]/30 bg-[#F4A261]/10 text-[#D97706]',
    coral: 'border-[#E76F51]/20 bg-[#E76F51]/5 text-[#E76F51]',
  }

  const list = normalizeList(items)

  if (!list.length) {
    return <p className="text-sm text-[#8D8175] italic">No data available.</p>
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

  // The arc starts at 135° (bottom-left) sweeps clockwise 270°
  const cx = 64
  const cy = 64

  return (
    <div className="relative flex items-center justify-center">
      <svg width={128} height={128} viewBox="0 0 128 128" className="overflow-visible" aria-hidden>
        {/* Track */}
        <circle
          cx={cx}
          cy={cy}
          r={R}
          fill="none"
          stroke="#D8CDBD"
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
          style={{ filter: `drop-shadow(0 2px 4px ${color}40)` }}
        />
      </svg>
      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center mt-1">
        <span
          className="text-3xl font-mono font-medium tracking-tight leading-none"
          style={{ color }}
        >
          {typeof score === 'number' ? score : '—'}
        </span>
        <span className="text-[9px] uppercase tracking-[0.2em] text-[#8D8175] mt-1 font-medium">score</span>
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
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm text-[#5C5147] font-medium">
          <Icon className="w-4 h-4 shrink-0" style={{ color }} />
          <span>{label}</span>
        </div>
        <span className="font-mono text-sm font-medium" style={{ color }}>
          {typeof value === 'number' ? `${value}%` : 'N/A'}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-[#F3EBDD] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
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
    <div className="rounded-xl border border-[#D8CDBD] bg-[#FBF7EF] p-4 space-y-1.5">
      <p className="text-[10px] uppercase tracking-[0.22em] text-[#8D8175] font-medium">{label}</p>
      <div className="text-sm font-medium text-[#2B2118] leading-snug">{children}</div>
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
          <div className="p-8 md:p-10 rounded-2xl bg-[#FFFDF8] border border-[#D8CDBD] shadow-sm flex flex-col items-center gap-5">
            <div className="flex w-12 h-12 items-center justify-center rounded-xl bg-[#FBF7EF] border border-[#D8CDBD]">
              <Sparkles className="w-5 h-5 text-[#8C5A3C] animate-pulse" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-lg font-medium text-[#2B2118]">Building your report...</p>
              <p className="text-sm text-[#8D8175]">Loading interview feedback</p>
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
          <Card className="w-full rounded-2xl border border-[#D8CDBD] bg-[#FFFDF8] shadow-sm">
            <CardContent className="flex flex-col items-center gap-5 px-8 py-12 text-center">
              <div className="flex w-14 h-14 items-center justify-center rounded-2xl bg-[#E76F51]/10 border border-[#E76F51]/20">
                <AlertTriangle className="w-6 h-6 text-[#E76F51]" />
              </div>
              <div className="space-y-2">
                <h1 className="text-xl font-medium text-[#2B2118]">Report unavailable</h1>
                <p className="text-sm leading-relaxed text-[#8D8175]">
                  {error || 'No report data was returned for this session.'}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
                <Button variant="outline" asChild className="border-[#D8CDBD] bg-[#FFFDF8] text-[#5C5147] hover:bg-[#FBF7EF] hover:text-[#2B2118] rounded-xl shadow-sm">
                  <Link href={`/session/${sessionId}`}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Session
                  </Link>
                </Button>
                <Button
                  onClick={() => router.push('/dashboard')}
                  className="bg-[#8C5A3C] hover:bg-[#A06A47] text-[#FFFDF8] rounded-xl shadow-sm transition-all"
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
      <main className="mx-auto w-full max-w-5xl px-5 md:px-12 py-8 md:py-12">

        {/* ── Header ── */}
        <header className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D8CDBD] bg-[#FFFDF8] px-3 py-1 text-[10px] md:text-xs font-medium uppercase tracking-widest text-[#8C5A3C] shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              Interview Report
            </div>

            <h1 className="text-3xl font-medium tracking-tight text-[#2B2118] sm:text-4xl">
              Session Report
            </h1>

            <div className="flex flex-wrap items-center gap-2.5 text-sm">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-[#D8CDBD] bg-[#FFFDF8] px-2.5 py-1 text-xs font-medium text-[#8D8175] shadow-sm">
                <Clock3 className="w-3.5 h-3.5 text-[#8C5A3C]" />
                {reportDate}
              </span>
            </div>
          </div>

          <Button asChild className="shrink-0 bg-[#8C5A3C] hover:bg-[#A06A47] text-[#FFFDF8] rounded-2xl px-6 py-5 shadow-md transition-all duration-200 ease-out font-medium">
            <Link href="/dashboard">
              Dashboard
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </header>

        {/* ── Score hero ── */}
        <section className="mb-8">
          <Card className="rounded-2xl border border-[#D8CDBD] bg-[#FFFDF8] shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="grid divide-y divide-[#D8CDBD] lg:grid-cols-[280px_1fr] lg:divide-x lg:divide-y-0">

                {/* Gauge column */}
                <div className="flex flex-col items-center justify-center gap-4 p-8 bg-[#FBF7EF]">
                  <ScoreGauge score={overallScore} />
                  <div className="text-center space-y-1">
                    <p className="text-sm font-medium text-[#2B2118]">Overall Score</p>
                    <p className="text-xs text-[#8D8175]">Composite of all dimensions</p>
                  </div>
                </div>

                {/* Metrics column */}
                <div className="grid gap-6 md:gap-8 p-6 md:p-8 sm:grid-cols-2">
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
          <Card className="rounded-2xl border border-[#D8CDBD] bg-[#FFFDF8] shadow-sm">
            <CardHeader className="border-b border-[#D8CDBD] pb-5 pt-6 px-6 md:px-8">
              <CardTitle className="text-lg md:text-xl font-medium text-[#2B2118]">Summary</CardTitle>
              <CardDescription className="text-sm text-[#8D8175] mt-1">
                High-level overview of the session outcome.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 pt-6 px-6 md:px-8 pb-8">
              <p className="text-sm md:text-base leading-relaxed text-[#5C5147]">
                {report.summary || 'No summary was generated for this report.'}
              </p>

              <Separator className="bg-[#D8CDBD]" />

              <div className="grid gap-8 sm:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-[#8D8175]">
                    <CheckCircle2 className="w-4 h-4 text-[#2A9D8F]" />
                    Strengths
                  </div>
                  <PillList items={strengths} tone="teal" />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-[#8D8175]">
                    <AlertTriangle className="w-4 h-4 text-[#E76F51]" />
                    Weaknesses
                  </div>
                  <PillList items={weaknesses} tone="coral" />
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-[#8D8175]">
                  <TrendingUp className="w-4 h-4 text-[#8C5A3C]" />
                  Areas to Improve
                </div>
                <PillList items={improvements} tone="terracotta" />
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
    <div className="flex flex-col min-h-screen w-full bg-[#F3EBDD] text-[#5C5147] font-sans overflow-auto selection:bg-[#8C5A3C] selection:text-[#FFFDF8]">
      {children}
    </div>
  )
}