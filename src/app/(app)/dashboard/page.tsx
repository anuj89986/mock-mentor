"use client";

import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import axios from "axios";

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();

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

  const [sessions, setSessions] = useState<SessionWithReport[]>();

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await axios.get("/api/session");
        if (res.status === 200) {
          setSessions(res.data.sessions);
        }
      } catch (err) {
        console.error("Error fetching sessions:", err);
      }
    };

    fetchSessions();
  }, [session?.user?.id]);

  const calculateAverageScore: number = useMemo(() => {
    if (sessions?.length === 0) return 0;

    const validScores =
      sessions
        ?.map((s) => s?.report?.overallScore || 0)
        .filter((score) => score > 0) || [];

    return validScores?.length > 0
      ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
      : 0;
  }, [sessions]);

  const recentSessions = useMemo(() => {
    if (!sessions) return [];
    return sessions
      ?.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 3)
      .map((s) => ({
        id: s._id,
        title: `Session ${s._id.slice(-6).toUpperCase()}`,
        date: new Date(s.createdAt).toLocaleDateString(),
        score: s.report?.overallScore || 0,
        status: s.status,
      }));
  }, [sessions]);

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F3EBDD] p-6 gap-6 text-[#5C5147]">
        <div className="text-base md:text-lg font-medium tracking-wide text-center text-[#2B2118]">
          Please sign in to access your dashboard.
        </div>
        <Button
          onClick={() => router.push("/")}
          className="bg-[#8C5A3C] hover:bg-[#A06A47] text-[#FFFDF8] font-medium rounded-2xl px-8 py-6 transition-all duration-200 ease-out w-full sm:w-auto shadow-sm"
        >
          Go to Home
        </Button>
      </div>
    );
  }

  const stats = [
    {
      label: "Total Interviews",
      value: sessions?.length || 0,
    },
    {
      label: "Average Score",
      value: `${calculateAverageScore}%` || 0,
    },
  ];

  return (
    <div className="flex h-screen w-full bg-[#F3EBDD] text-[#5C5147] font-sans overflow-hidden selection:bg-[#8C5A3C] selection:text-[#FFFDF8]">
      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-10">
        
        {/* Top Bar - Paper Layer: #FBF7EF */}
        <div className="sticky top-0 z-10 w-full bg-[#FBF7EF]/95 backdrop-blur-xl border-b border-[#D8CDBD] pt-6 pb-4 md:pt-8 transition-all duration-200 shadow-sm">
          <div className="flex items-center justify-between px-5 md:px-12 max-w-5xl mx-auto gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl md:text-3xl font-medium tracking-tight text-[#2B2118] truncate">
                Welcome back, {session.user?.name?.split(" ")[0]}
              </h1>
              <p className="text-[#8D8175] mt-1 md:mt-2 text-xs md:text-sm font-normal truncate">
                Track your progress and continue practicing.
              </p>
            </div>
            <div className="flex items-center gap-3 md:gap-6 shrink-0">
              {/* Button Layer: #8C5A3C */}
              <Button
                asChild
                className="bg-[#8C5A3C] hover:bg-[#A06A47] text-[#FFFDF8] rounded-2xl px-4 md:px-6 shadow-md transition-all duration-200 ease-out font-medium"
              >
                <Link href="/interview" className="flex items-center">
                  <Plus className="w-5 h-5 md:w-4 md:h-4 md:mr-2 opacity-90" />
                  <span className="hidden md:inline">New Interview</span>
                </Link>
              </Button>
              {/* Avatar uses Cards Layer for contrast against Paper header */}
              <div className="w-10 h-10 rounded-full bg-[#FFFDF8] border border-[#D8CDBD] flex items-center justify-center text-[#8C5A3C] shrink-0 shadow-sm">
                <span className="font-medium text-sm">
                  {session.user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="px-5 md:px-12 py-8 md:py-10 max-w-5xl mx-auto space-y-8 md:space-y-12">
          
          {/* Stats Grid - Cards Layer: #FFFDF8 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="p-6 md:p-8 rounded-2xl bg-[#FFFDF8] border border-[#D8CDBD] hover:border-[#8C5A3C]/50 transition-all duration-200 ease-out shadow-sm relative overflow-hidden"
              >
                <h3 className="text-[#8D8175] text-xs font-medium uppercase tracking-widest mb-2 md:mb-3">
                  {stat.label}
                </h3>
                <p className="text-3xl md:text-4xl font-normal text-[#8C5A3C]">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-8 md:gap-10">
            {/* Recent Sessions */}
            <div>
              <div className="flex items-baseline justify-between mb-4 md:mb-6">
                <h2 className="text-base md:text-lg font-medium text-[#2B2118] tracking-wide">
                  Recent Activity
                </h2>
                <Link
                  href="/session"
                  className="text-[10px] md:text-xs font-medium uppercase tracking-widest text-[#8C5A3C] hover:text-[#A06A47] transition-all duration-200 ease-out border-b border-transparent hover:border-[#A06A47] pb-0.5"
                >
                  View all
                </Link>
              </div>

              {/* Cards Layer: #FFFDF8 */}
              <div className="bg-[#FFFDF8] rounded-2xl border border-[#D8CDBD] overflow-hidden shadow-sm">
                {recentSessions?.length > 0 ? (
                  <div className="divide-y divide-[#D8CDBD]">
                    {recentSessions.map((session) => (
                      <div
                        key={session.id}
                        // Hover steps down to Paper Layer: #FBF7EF to show depth
                        className="flex items-center justify-between p-5 md:p-6 hover:bg-[#FBF7EF] transition-all duration-200 ease-out group"
                      >
                        <div className="min-w-0 pr-4">
                          <h3 className="font-medium text-[#2B2118] mb-1 transition-colors truncate group-hover:text-[#8C5A3C]">
                            {session.title}
                          </h3>
                          <p className="text-xs md:text-sm text-[#8D8175] font-normal">
                            {new Date(session.date).toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-lg md:text-xl font-medium text-[#8C5A3C] group-hover:text-[#A06A47] transition-colors">
                            {session.score}%
                          </p>
                          <p className="text-[9px] md:text-[10px] text-[#8D8175] mt-1 uppercase tracking-widest">
                            Score
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 md:p-12 text-center">
                    <p className="text-sm md:text-base text-[#8D8175] font-normal tracking-wide">
                      No sessions yet. Start your first interview to see progress here.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Tips - Paper Layer: #FBF7EF (contrasts against Background & Cards) */}
          <div className="p-6 md:p-8 rounded-2xl bg-[#FBF7EF] border border-[#D8CDBD] relative overflow-hidden shadow-sm">
            {/* Primary Accent for visual flair */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#8C5A3C] rounded-l-2xl"></div>
            
            <h3 className="text-[10px] md:text-xs font-medium uppercase tracking-widest text-[#8C5A3C] mb-2 md:mb-3 pl-2 md:pl-0">
              Note
            </h3>
            <p className="text-sm md:text-base text-[#5C5147] font-normal leading-relaxed max-w-3xl pl-2 md:pl-0">
              Practice consistently for better results. Try mixing technical and
              behavioral sessions to build well-rounded skills. Regular feedback
              review helps identify patterns in your performance.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}