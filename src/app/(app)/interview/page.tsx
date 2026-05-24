"use client";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  CheckCircle2,
  FileText,
  Sparkles,
  Wand2,
  MessageCircle,
  Zap,
  Users,
  Calendar,
  Upload,
  CheckCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast} from "sonner";

interface Resume {
  _id: string;
  userId: string;
  fileUrl: string;
  publicId: string;
  extractedText: string;
  createdAt: Date;
}

const interviewStyles = [
  {
    id: "technical",
    icon: Zap,
    title: "Technical",
    description:
      "Focus on coding problems, system design, and technical concepts",
  },
  {
    id: "behavioral",
    icon: Users,
    title: "Behavioral",
    description:
      "Focus on soft skills, past experiences, and interpersonal scenarios",
  },
  {
    id: "mixed",
    icon: MessageCircle,
    title: "Mixed",
    description:
      "Combination of technical questions and behavioral discussions",
  },
];

const howItWorks = [
  {
    icon: FileText,
    title: "We read your resume",
    description:
      "Our AI analyzes your background and experience from your uploaded resume.",
  },
  {
    icon: Brain,
    title: "Choose interview style",
    description:
      "Select how you want to practice - technical, behavioral, or mixed questions.",
  },
  {
    icon: CheckCircle2,
    title: "Start the session",
    description:
      "Get personalized questions tailored to your profile and chosen style.",
  },
];

export default function InterviewPage() {
  const [uploadedResumes, setUploadedResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [selectedInterviewStyle, setSelectedInterviewStyle] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const res = await axios.get("api/resume/all-resume");
        if (res.status === 200) {
          setUploadedResumes(res.data.resume);
          console.log("Fetched resumes:", res.data.resume);
        } else {
          console.error("Failed to fetch resumes");
        }
      } catch (error) {
        console.error("Error fetching resumes:", error);
      }
    }
    fetchResumes();;
  }, []);

  const onHandleStartSession = async () => {
    if (!selectedResumeId || !selectedInterviewStyle) {
      toast.error("Please select a resume and interview style to start the session.");
      return;
    }
    try {
      const res = await axios.post("/api/session/create-session", {
        resumeId: selectedResumeId,
        interviewStyle: selectedInterviewStyle,
      });
      if (res.status === 201) {
        const { sessionId } = res.data;
        router.push(`/session/${sessionId}`);
      } else {
        console.error("Failed to create session");
      }
    } catch (error) {
      console.error("Error creating session:", error);
    }
  };


  return (
    <div className="relative flex-1 overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_35%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0))]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
      </div>

      <main className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {/* Header */}
        <div className="mb-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground shadow-sm backdrop-blur">
              <Sparkles className="size-3.5 text-blue-400" />
              Start your session
            </div>
            <div className="space-y-3">
              <h1 className="font-heading text-4xl leading-tight font-semibold tracking-tight text-balance text-foreground sm:text-5xl">
                Ready to practice?
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                Select your resume and choose your interview style to get
                personalized questions based on your experience.
              </p>
            </div>
          </div>

          <Button
            asChild
            variant="outline"
            className="shrink-0 border-border/70 bg-card/70 shadow-sm backdrop-blur"
          >
            <Link href="/dashboard">
              <ArrowLeft className="size-4" />
              Back
            </Link>
          </Button>
        </div>

        {/* Main Content */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column: Resume + Style Selection */}
          <div className="lg:col-span-2 space-y-8">
            {/* Resume Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold text-foreground">
                  Select Resume
                </Label>
                <Button variant="outline" size="sm" className="gap-2" onClick={()=> router.push("/resume")}>
                  <Upload className="size-4" />
                  Upload New
                </Button>
              </div>
              <div className="space-y-3">
                {uploadedResumes.map((resume, index) => (
                  <button
                    onClick={() => setSelectedResumeId(resume._id)}
                    key={resume._id}
                    type="button"
                    className={`w-full flex items-start gap-4 rounded-2xl border-2 p-4 transition-all text-left ${
                      resume._id === selectedResumeId
                        ? "border-blue-500/50 bg-blue-500/5 shadow-lg shadow-blue-500/10"
                        : "border-border/70 bg-card/70 hover:border-border/50 hover:bg-card/80"
                    }`}
                  >
                    <div
                      className={`flex size-12 shrink-0 items-center justify-center rounded-xl shadow-sm ring-1 transition-all ${
                        resume._id === selectedResumeId
                          ? "bg-blue-500/20 ring-blue-500/30"
                          : "bg-background ring-border/70 group-hover:bg-blue-500/10"
                      }`}
                    >
                      <FileText className="size-5 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-foreground truncate">
                          resume-{index + 1}.pdf
                        </h3>
                        {resume._id === selectedResumeId && (
                          <CheckCircle className="size-5 shrink-0 text-blue-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3" />
                          {new Date(resume.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="relative h-px bg-linear-to-r from-border/0 via-border/50 to-border/0" />

            {/* Interview Style Selection */}
            <div className="space-y-4">
              <Label className="text-base font-semibold text-foreground">
                Interview Style
              </Label>
              <div className="grid gap-4 md:grid-cols-3">
                {interviewStyles.map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    className={`group relative flex flex-col items-start gap-3 rounded-2xl border-2 p-6 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      selectedInterviewStyle === style.id
                        ? "border-blue-500 bg-blue-500/15 hover:bg-blue-500/20"
                        : "border-border/70 bg-card/70 hover:border-blue-500/50 hover:bg-card/90"
                    }`}
                    onClick={() => setSelectedInterviewStyle(style.id)}
                  >
                    <div className={`flex size-12 items-center justify-center rounded-xl shadow-sm ring-1 ${
                      selectedInterviewStyle === style.id
                        ? "bg-blue-500/20 ring-blue-500/30"
                        : "bg-background ring-border/70 group-hover:bg-blue-500/10"
                    }`}>
                      <style.icon className={`size-5 ${
                        selectedInterviewStyle === style.id
                          ? "text-blue-500"
                          : "text-blue-400"
                      }`} />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-semibold text-foreground">
                        {style.title}
                      </h3>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {style.description}
                      </p>
                    </div>
                    <div className="mt-2 self-end opacity-0 transition-opacity group-hover:opacity-100">
                      <ArrowRight className="size-4 text-blue-400" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <Card className="border-border/70 bg-linear-to-br from-blue-600/20 to-cyan-600/20 shadow-lg backdrop-blur-xl">
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-foreground">
                      Ready to start?
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      You've selected your resume and interview style.
                    </p>
                  </div>
                  <Button type="button" size="lg" className="shrink-0" onClick={onHandleStartSession}>
                    <Wand2 className="size-4" />
                    Start Session
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* How It Works Sidebar */}
          <div className="space-y-6">
            <Card className="border-border/70 bg-card/80 shadow-[0_24px_70px_-32px_rgba(0,0,0,0.45)] backdrop-blur-xl">
              <CardHeader className="border-b border-border/60 pb-5">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="size-4 text-emerald-400" />
                  How it works
                </div>
                <CardTitle className="text-lg">Simple & fast</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4 pt-6">
                {howItWorks.map((step, index) => (
                  <div key={step.title} className="flex gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-background shadow-sm ring-1 ring-border/70">
                      <step.icon className="size-4 text-blue-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                        Step {index + 1}
                      </p>
                      <p className="mt-1 font-medium text-foreground text-sm">
                        {step.title}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
