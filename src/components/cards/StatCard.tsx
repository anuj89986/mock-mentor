import { Card, CardContent } from '@/components/ui/card'

export function StatCard({
  label,
  value,
  icon: Icon
}: {
  label: string
  value: number | string
  icon: React.ElementType
  trend?: 'up' | 'down' | null
  trendValue?: string
}) {
  return (
    <Card className="border-border/70 bg-card/70 shadow-sm backdrop-blur">
      <CardContent className="pt-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{label}</p>
          <Icon className="size-4 text-blue-400" />
        </div>
        <div className="flex items-end justify-between">
          <div className="text-3xl font-semibold text-foreground">
            {typeof value === 'number' ? `${value}%` : value}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}