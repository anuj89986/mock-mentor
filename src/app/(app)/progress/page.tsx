"use client";

import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Target,
  Brain,
  MessageSquareText,
  Users,
  Calendar,
  ArrowLeft, // Added for mobile header nav
} from "lucide-react";
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
} from "recharts";
import { StatCard } from "@/components/cards/StatCard";
import { SessionCard } from "@/components/cards/SessionCard";

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

type ScoreHistory = {
  number: string;
  overall: number;
  technical: number;
  communication: number;
  confidence: number;
};

// Colorful yet elegant palette that contrasts well against the light cream background
const COLORS = [
  "#2A9D8F", // Teal (Technical)
  "#E76F51", // Coral (Communication)
  "#6D597A", // Muted Purple (Confidence)
  "#F4A261", // Sandy Gold
  "#8C5A3C", // Terracotta (Brand)
];

export default function ProgressPage() {
  const [sessions, setSessions] = useState<SessionWithReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/session");
        const sessionsWithReports = response.data.sessions || [];
        setSessions(
          sessionsWithReports.filter(
            (s: SessionWithReport) =>
              s.report && s.report?.overallScore !== undefined,
          ),
        );
      } catch (err) {
        setError("Failed to load progress data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const calculateStats = () => {
    if (sessions.length === 0) {
      return {
        avgOverall: 0,
        avgTechnical: 0,
        avgCommunication: 0,
        avgConfidence: 0,
        totalSessions: 0,
      };
    }

    const overallScores = sessions
      .map((s) => s.report?.overallScore || 0)
      .filter((score) => score > 0);
    const technicalScores = sessions
      .map((s) => s.report?.technicalScore || 0)
      .filter((score) => score > 0);
    const communicationScores = sessions
      .map((s) => s.report?.communicationScore || 0)
      .filter((score) => score > 0);
    const confidenceScores = sessions
      .map((s) => s.report?.confidenceScore || 0)
      .filter((score) => score > 0);

    return {
      avgOverall:
        overallScores.length > 0
          ? Math.round(
              overallScores.reduce((a, b) => a + b, 0) / overallScores.length,
            )
          : 0,
      avgTechnical:
        technicalScores.length > 0
          ? Math.round(
              technicalScores.reduce((a, b) => a + b, 0) /
                technicalScores.length,
            )
          : 0,
      avgCommunication:
        communicationScores.length > 0
          ? Math.round(
              communicationScores.reduce((a, b) => a + b, 0) /
                communicationScores.length,
            )
          : 0,
      avgConfidence:
        confidenceScores.length > 0
          ? Math.round(
              confidenceScores.reduce((a, b) => a + b, 0) /
                confidenceScores.length,
            )
          : 0,
      totalSessions: sessions.length,
    };
  };
  const stats = calculateStats();

  const scoreHistory: ScoreHistory[] = useMemo(() => {
    return sessions
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      )
      .map((session, index) => ({
        number: `Session ${index + 1}`,
        overall: session.report?.overallScore || 0,
        technical: session.report?.technicalScore || 0,
        communication: session.report?.communicationScore || 0,
        confidence: session.report?.confidenceScore || 0,
      }));
  }, [sessions]);

  const categoryBreakdown = useMemo(() => {
    return [
      {
        name: "Technical",
        value: stats.avgTechnical,
      },
      {
        name: "Communication",
        value: stats.avgCommunication,
      },
      {
        name: "Confidence",
        value: stats.avgConfidence,
      },
    ].filter((item) => item.value > 0);
  }, [stats]);

  if (loading) {
    return (
      // Changed: min-h-screen to min-h-[100dvh]
      <div className="flex min-h-dvh items-center justify-center bg-[#F3EBDD] text-[#5C5147] font-sans selection:bg-[#8C5A3C] selection:text-[#FFFDF8]">
        <div className="p-8 md:p-10 rounded-2xl bg-[#FFFDF8] border border-[#D8CDBD] shadow-sm flex flex-col items-center gap-5">
          <div className="flex w-12 h-12 items-center justify-center rounded-xl bg-[#FBF7EF] border border-[#D8CDBD]">
            <TrendingUp className="w-5 h-5 text-[#8C5A3C] animate-pulse" />
          </div>
          <p className="text-lg font-medium text-[#2B2118]">
            Loading your progress...
          </p>
        </div>
      </div>
    );
  }

  return (
    // Changed: min-h-[100dvh] and removed overflow-auto
    <div className="flex flex-col min-h-dvh w-full bg-[#F3EBDD] text-[#5C5147] font-sans selection:bg-[#8C5A3C] selection:text-[#FFFDF8]">
      
      {/* Slim Sticky Header */}
      <header className="sticky top-0 z-20 w-full bg-[#FBF7EF]/95 backdrop-blur-xl border-b border-[#D8CDBD] py-3 md:py-4 transition-all duration-200 shadow-sm">
        <div className="flex items-center justify-between px-4 md:px-12 max-w-7xl mx-auto gap-4">
          <Button
            asChild
            variant="outline"
            className="border-[#D8CDBD] bg-[#FFFDF8] text-[#5C5147] hover:bg-[#FBF7EF] hover:text-[#2B2118] rounded-full sm:rounded-2xl shadow-sm transition-all h-9 px-3 sm:px-4 shrink-0"
          >
            <Link href="/dashboard" className="flex items-center">
              <ArrowLeft className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
          </Button>

          {/* Mobile-only page title */}
          <span className="text-sm font-medium text-[#2B2118] sm:hidden truncate">
            Analytics
          </span>

          {/* Invisible spacer to perfectly center the mobile title */}
          <div className="w-15 sm:hidden pointer-events-none" />
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-6 md:py-10 pb-12">
        
        {/* Page Titles - Moved out of the sticky header */}
        <div className="mb-8 md:mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 rounded-full border border-[#D8CDBD] bg-[#FFFDF8] text-[10px] md:text-xs font-medium uppercase tracking-widest text-[#8C5A3C] shadow-sm">
            <TrendingUp className="w-3.5 h-3.5" />
            Progress & Analytics
          </div>
          <h1 className="text-2xl md:text-4xl font-medium tracking-tight text-[#2B2118] mb-1 md:mb-2">
            Your interview journey
          </h1>
          <p className="text-[#8D8175] text-sm md:text-base font-normal max-w-2xl">
            Track your performance, identify patterns, and see how you're improving over time.
          </p>
        </div>

        {error && (
          <div className="mb-8 p-5 rounded-2xl border border-[#D8CDBD] bg-[#FBF7EF] shadow-sm">
            <p className="text-sm text-[#8C5A3C] font-medium">{error}</p>
          </div>
        )}

        {sessions.length === 0 ? (
          <div className="p-10 md:p-16 rounded-2xl bg-[#FFFDF8] border border-[#D8CDBD] shadow-sm text-center flex flex-col items-center">
            <div className="flex w-16 h-16 items-center justify-center rounded-xl bg-[#FBF7EF] border border-[#D8CDBD] mb-6 text-[#8C5A3C]">
              <Calendar className="w-7 h-7" />
            </div>
            <h3 className="text-xl md:text-2xl font-medium text-[#2B2118] mb-3">
              No sessions yet
            </h3>
            <p className="text-[#8D8175] max-w-md mb-8 text-sm md:text-base font-normal">
              Start your first interview session to begin tracking your
              progress and performance.
            </p>
            <Button asChild className="bg-[#8C5A3C] hover:bg-[#A06A47] text-[#FFFDF8] rounded-2xl px-8 py-6 shadow-md transition-all duration-200 ease-out font-medium">
              <Link href="/interview">Start an Interview</Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <section className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              <StatCard
                label="Average Overall"
                value={stats.avgOverall}
                isPercent={true}
                icon={Target}
              />
              <StatCard
                label="Technical"
                value={stats.avgTechnical}
                isPercent={true}
                icon={Brain}
              />
              <StatCard
                label="Communication"
                value={stats.avgCommunication}
                isPercent={true}
                icon={MessageSquareText}
              />
              <StatCard
                label="Confidence"
                value={stats.avgConfidence}
                isPercent={true}
                icon={Users}
              />
              <StatCard
                label="Total Sessions"
                value={stats.totalSessions}
                icon={Calendar}
              />
            </section>

            {/* Charts */}
            <section className="mb-10 grid gap-6 lg:grid-cols-3">
              {/* Score Trend Chart */}
              <Card className="col-span-2 rounded-2xl border border-[#D8CDBD] bg-[#FFFDF8] shadow-sm">
                <CardHeader className="border-b border-[#D8CDBD] pb-5 pt-6 px-5 sm:px-6 md:px-8">
                  <CardTitle className="text-lg md:text-xl font-medium text-[#2B2118]">Score Trends</CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-[#8D8175] mt-1">
                    Your performance across all metrics over time.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-8 pb-6 px-2 sm:px-4 md:px-8 overflow-hidden">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={scoreHistory}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#D8CDBD"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="number"
                        stroke="#8D8175"
                        tick={{ fill: '#8D8175', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        dy={10}
                      />
                      <YAxis
                        stroke="#8D8175"
                        tick={{ fill: '#8D8175', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        dx={-10}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#FBF7EF",
                          border: "1px solid #D8CDBD",
                          borderRadius: "12px",
                          color: "#2B2118",
                          boxShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.05)"
                        }}
                        itemStyle={{ fontSize: "14px", fontWeight: 500 }}
                        formatter={(value) => `${value}%`}
                      />
                      <Legend wrapperStyle={{ paddingTop: "20px" }} />
                      <Line
                        type="monotone"
                        dataKey="overall"
                        stroke="#8C5A3C"
                        name="Overall"
                        strokeWidth={3}
                        dot={{ r: 4, strokeWidth: 2 }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="technical"
                        stroke="#2A9D8F"
                        name="Technical"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="communication"
                        stroke="#E76F51"
                        name="Communication"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="confidence"
                        stroke="#6D597A"
                        name="Confidence"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Category Breakdown */}
              <Card className="rounded-2xl border border-[#D8CDBD] bg-[#FFFDF8] shadow-sm">
                <CardHeader className="border-b border-[#D8CDBD] pb-5 pt-6 px-5 sm:px-6 md:px-8">
                  <CardTitle className="text-lg md:text-xl font-medium text-[#2B2118]">Category Breakdown</CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-[#8D8175] mt-1">
                    Average performance by category.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-8 pb-6 px-4 overflow-hidden">
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
                          innerRadius={50}
                          dataKey="value"
                          stroke="#FFFDF8"
                          strokeWidth={2}
                        >
                          {categoryBreakdown.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#FBF7EF",
                            border: "1px solid #D8CDBD",
                            borderRadius: "12px",
                            color: "#2B2118",
                            boxShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.05)"
                          }}
                          formatter={(value) => `${value}%`}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-75 items-center justify-center">
                      <p className="text-center text-sm text-[#8D8175]">
                        No data available
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>

            {/* Score Distribution */}
            <section className="mb-12">
              <Card className="rounded-2xl border border-[#D8CDBD] bg-[#FFFDF8] shadow-sm">
                <CardHeader className="border-b border-[#D8CDBD] pb-5 pt-6 px-5 sm:px-6 md:px-8">
                  <CardTitle className="text-lg md:text-xl font-medium text-[#2B2118]">Score Distribution</CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-[#8D8175] mt-1">
                    Comparison of average scores across all metrics.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-8 pb-6 px-2 sm:px-4 md:px-8 overflow-hidden">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={categoryBreakdown} margin={{ top: 20 }}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#D8CDBD"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="name"
                        stroke="#8D8175"
                        tick={{ fill: '#8D8175', fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                        dy={10}
                        interval={0} // forces all labels to show on mobile
                      />
                      <YAxis
                        stroke="#8D8175"
                        tick={{ fill: '#8D8175', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        dx={-10}
                      />
                      <Tooltip
                        cursor={{ fill: '#FBF7EF' }}
                        contentStyle={{
                          backgroundColor: "#FBF7EF",
                          border: "1px solid #D8CDBD",
                          borderRadius: "12px",
                          color: "#2B2118",
                          boxShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.05)"
                        }}
                        formatter={(value) => `${value}%`}
                      />
                      <Bar
                        dataKey="value"
                        radius={[6, 6, 0, 0]}
                        barSize={40}
                      >
                        {categoryBreakdown.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </section>

            {/* Recent Sessions */}
            <section className="space-y-6">
              <div>
                <h2 className="text-lg md:text-xl font-medium text-[#2B2118] mb-1">
                  Recent Sessions
                </h2>
                <p className="text-sm text-[#8D8175]">
                  Click on any session to view detailed feedback and recommendations.
                </p>
              </div>

              <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
                {sessions
                  .sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime(),
                  )
                  .map((session) => (
                    <SessionCard key={session._id} session={session} />
                  ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}