import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number;
  isPercent?: boolean;
  icon: LucideIcon;
}

export function StatCard({ label, value, isPercent, icon: Icon }: StatCardProps) {
  return (
    <Card className="rounded-2xl border border-[#D8CDBD] bg-[#FFFDF8] shadow-sm overflow-hidden transition-all hover:border-[#8C5A3C]/30">
      <CardContent className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] md:text-xs font-medium uppercase tracking-widest text-[#8D8175] mb-2 truncate">
              {label}
            </p>
            <p className="text-2xl md:text-3xl font-medium text-[#8C5A3C]">
              {value}{isPercent ? "%" : ""}
            </p>
          </div>
          <div className="flex w-12 h-12 shrink-0 items-center justify-center rounded-xl bg-[#FBF7EF] border border-[#D8CDBD] text-[#8C5A3C]">
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}