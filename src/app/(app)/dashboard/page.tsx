"use client";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Brain,
  Clock,
  Plus,
  TrendingUp,
  CheckCircle,
} from "lucide-react";
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

  const recentSessions = useMemo(()=>{
    if(!sessions) return [];
    return sessions?.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0,3).map((s,idx)=>(
      {
        id : s._id,
        title: `Session ${s._id.slice(-6).toUpperCase()}`,
        date: new Date(s.createdAt).toLocaleDateString(),
        score: s.report?.overallScore || 0,
        status: s.status,
      }
    ) 
    )
  }, [sessions])

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black flex-col gap-6">
        <div className="text-white">
          Please sign in to access the dashboard.
        </div>
        <div>
          <Button onClick={() => router.push("/")}>Go to Home</Button>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Total Interviews",
      value: sessions?.length || 0,
      icon: Brain,
    },
    {
      label: "Avg. Score",
      value: `${calculateAverageScore}%`  || 0,
      icon: TrendingUp,
    },
  ];


  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="border-b border-white/10 bg-white/5 backdrop-blur-md sticky top-0 z-10 max-w-screen">
          <div className="flex items-center justify-between p-6">
            <div>
              <h1 className="text-3xl font-bold">
                Welcome back, {session.user?.name}
              </h1>
              <p className="text-gray-400 mt-1">
                Let's practice and ace your next interview
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button className="bg-blue-600 hover:bg-blue-700" asChild>
                <Link href="/interview" className="flex items-center">
                  <Plus className="w-4 h-4 mr-2" />
                  New Interview
                </Link>
              </Button>
              <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <span className="font-semibold">
                  {session.user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-6 space-y-8">
          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 gap-7 px-6">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="p-6 rounded-lg bg-white/5 border border-white/10 hover:border-blue-500/30 transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-gray-400 text-sm">{stat.label}</h3>
                  <stat.icon className="w-5 h-5 text-blue-400" />
                </div>
                <p className="text-3xl font-bold mb-2">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-1 gap-6">
            {/* Recent Sessions */}
            <div className="lg:col-span-2 p-6 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                  Recent Sessions
                </h2>
                <Link
                  href="/session"
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  View All
                </Link>
              </div>

              <div className="space-y-3">
                {recentSessions?.length>0 ? recentSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:border-blue-500/30 transition"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{session.title}</h3>
                      <p className="text-sm text-gray-400">{new Date(session.date).toLocaleDateString("en-In", { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-400">
                          {session.score}%
                        </p>
                        <p className="text-xs text-gray-400">Score</p>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    </div>
                  </div>
                )) : <p className="text-gray-400 text-center py-10">No sessions yet. Start practicing to see your progress here!</p>}
              </div>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="p-6 rounded-lg bg-linear-to-r from-blue-600/10 to-cyan-600/10 border border-white/10">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-400" />
              Pro Tip
            </h3>
            <p className="text-gray-300">
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
