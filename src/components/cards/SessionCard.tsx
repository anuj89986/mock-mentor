import { Card, CardContent } from '@/components/ui/card'
import {CheckCircle2} from 'lucide-react'
import Link from 'next/link'

interface SessionWithReport{
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

export function SessionCard({ session }: { session: SessionWithReport }) {
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