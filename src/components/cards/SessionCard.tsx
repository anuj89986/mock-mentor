import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ChevronRight, Calendar } from "lucide-react";

interface SessionWithReport {
  _id: string;
  status: string;
  createdAt: string;
  report?: {
    overallScore?: number;
    technicalScore?: number;
    communicationScore?: number;
    confidenceScore?: number;
    resumeConsistencyScore?: number;
  };
}

export function SessionCard({ session }: { session: SessionWithReport }) {
  const score = session.report?.overallScore || 0;

  return (
    <Link href={`/session/${session._id}/report`} className="block h-full">
      <Card className="h-full rounded-2xl border border-[#D8CDBD] bg-[#FFFDF8] shadow-sm hover:border-[#8C5A3C]/50 hover:bg-[#FBF7EF] transition-all duration-200 ease-out group cursor-pointer">
        <CardContent className="p-5 md:p-6 flex items-center justify-between gap-4 h-full">
          <div className="flex items-center gap-4 min-w-0">
            {/* Score Bubble */}
            <div className="flex w-12 h-12 shrink-0 items-center justify-center rounded-full bg-[#FBF7EF] border border-[#D8CDBD] text-[#8C5A3C] group-hover:bg-[#FFFDF8] group-hover:border-[#8C5A3C]/30 transition-all">
               <span className="text-sm font-medium">{score}%</span>
            </div>
            
            {/* Session Info */}
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-[#2B2118] mb-1 group-hover:text-[#8C5A3C] transition-colors truncate">
                Session {session._id.slice(-6).toUpperCase()}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-[#8D8175]">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(session.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric"
                })}
              </div>
            </div>
          </div>
          
          <ChevronRight className="w-5 h-5 text-[#D8CDBD] group-hover:text-[#8C5A3C] transition-colors shrink-0" />
        </CardContent>
      </Card>
    </Link>
  );
}