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
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

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
  const [selectedInterviewStyle, setSelectedInterviewStyle] = useState<
    string | null
  >(null);
  const [isCreatingSession, setIsCreatingSession] = useState<boolean>(false);

  const router = useRouter();

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const res = await axios.get("api/resume/all-resume");
        if (res.status === 200) {
          setUploadedResumes(res.data.resume);
        }
      } catch (error) {
        console.error("Error fetching resumes:", error);
      }
    };
    fetchResumes();
  }, []);

  const onHandleStartSession = async () => {
    if (!selectedResumeId || !selectedInterviewStyle) {
      toast.error(
        "Please select a resume and interview style to start the session.",
      );
      return;
    }
    try {
      setIsCreatingSession(true);
      const res = await axios.post("/api/session/create-session", {
        resumeId: selectedResumeId,
        interviewStyle: selectedInterviewStyle,
      });
      if (res.status === 201) {
        const { sessionId } = res.data;
        router.push(`/session/${sessionId}`);
      }
    } catch (error) {
      console.error("Error creating session:", error);
      toast.error("Failed to create session. Please try again.");
    } finally {
      setIsCreatingSession(false);
    }
  };

  return (
    // Changed: Removed h-screen and overflow-hidden. Using min-h-[100dvh] for native body scrolling
    <div className="min-h-dvh flex flex-col w-full bg-[#F3EBDD] text-[#5C5147] font-sans selection:bg-[#8C5A3C] selection:text-[#FFFDF8]">
      {/* Sticky Header - Made slim and minimal for mobile */}
      <header className="sticky top-0 z-20 w-full bg-[#FBF7EF]/95 backdrop-blur-xl border-b border-[#D8CDBD] py-3 md:py-4 transition-all duration-200 shadow-sm">
        <div className="flex items-center justify-between px-4 md:px-12 max-w-6xl mx-auto">
          <Button
            asChild
            variant="outline"
            className="border-[#D8CDBD] bg-[#FFFDF8] text-[#5C5147] hover:bg-[#FBF7EF] hover:text-[#2B2118] rounded-full sm:rounded-2xl shadow-sm transition-all h-9 px-3 sm:px-4"
          >
            <Link href="/dashboard" className="flex items-center">
              <ArrowLeft className="w-4 h-4 sm:mr-2" />
              {/* Hide text on very small screens, show icon only */}
              <span className="hidden sm:inline">Back to Dashboard</span>
            </Link>
          </Button>

          {/* Optional: Mobile-only page title so the header isn't completely empty */}
          <span className="absolute left-1/2 -translate-x-1/2 text-sm font-medium text-[#2B2118] sm:hidden">
            New Session
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-12 py-6 md:py-10 pb-12">
        {/* Page Titles - Moved out of the sticky header so they scroll away smoothly */}
        <div className="mb-8 md:mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 rounded-full border border-[#D8CDBD] bg-[#FFFDF8] text-[10px] md:text-xs font-medium uppercase tracking-widest text-[#8C5A3C] shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            Start your session
          </div>
          <h1 className="text-2xl md:text-4xl font-medium tracking-tight text-[#2B2118]">
            Ready to practice?
          </h1>
          <p className="text-[#8D8175] mt-2 text-sm md:text-base font-normal max-w-2xl">
            Select your resume and choose your interview style to get
            personalized questions.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column: Form Setup */}
          <div className="lg:col-span-2 space-y-10">
            {/* Resume Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base md:text-lg font-medium text-[#2B2118] tracking-wide">
                  Select Resume
                </Label>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#D8CDBD] bg-[#FFFDF8] text-[#5C5147] hover:bg-[#FBF7EF] hover:text-[#2B2118] rounded-2xl shadow-sm gap-2"
                  onClick={() => router.push("/resume")}
                >
                  <Upload className="w-4 h-4" />
                  <span className="hidden sm:inline">Upload New</span>
                  <span className="sm:hidden">Upload</span>
                </Button>
              </div>

              <div className="space-y-3">
                {uploadedResumes.map((resume, index) => (
                  <button
                    onClick={() => setSelectedResumeId(resume._id)}
                    key={resume._id}
                    type="button"
                    className={`w-full flex items-center gap-3 sm:gap-4 rounded-2xl border p-4 transition-all duration-200 ease-out text-left shadow-sm group ${
                      resume._id === selectedResumeId
                        ? "border-[#8C5A3C] bg-[#8C5A3C]/5"
                        : "border-[#D8CDBD] bg-[#FFFDF8] hover:border-[#8C5A3C]/50 hover:bg-[#FBF7EF]"
                    }`}
                  >
                    <div
                      className={`flex w-10 h-10 sm:w-12 sm:h-12 shrink-0 items-center justify-center rounded-xl border transition-all duration-200 ${
                        resume._id === selectedResumeId
                          ? "bg-[#8C5A3C] border-[#8C5A3C] text-[#FFFDF8]"
                          : "bg-[#FBF7EF] border-[#D8CDBD] text-[#8C5A3C] group-hover:border-[#8C5A3C]/30 group-hover:bg-[#FFFDF8]"
                      }`}
                    >
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3
                          className={`font-medium text-sm sm:text-base truncate transition-colors ${resume._id === selectedResumeId ? "text-[#8C5A3C]" : "text-[#2B2118]"}`}
                        >
                          resume-{index + 1}.pdf
                        </h3>
                        {resume._id === selectedResumeId && (
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-[#8C5A3C]" />
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[#8D8175]">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
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

                {uploadedResumes.length === 0 && (
                  <div className="p-8 text-center rounded-2xl bg-[#FFFDF8] border border-[#D8CDBD] border-dashed">
                    <p className="text-sm text-[#8D8175]">
                      No resumes found. Please upload one to continue.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="h-px w-full bg-[#D8CDBD]" />

            {/* Interview Style Selection */}
            <div className="space-y-4">
              <Label className="text-base md:text-lg font-medium text-[#2B2118] tracking-wide">
                Interview Style
              </Label>
              <div className="grid gap-4 sm:grid-cols-3">
                {interviewStyles.map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    className={`group relative flex flex-col items-start gap-3 sm:gap-4 rounded-2xl border p-4 md:p-6 transition-all duration-200 shadow-sm focus-visible:outline-none ${
                      selectedInterviewStyle === style.id
                        ? "border-[#8C5A3C] bg-[#8C5A3C]/5"
                        : "border-[#D8CDBD] bg-[#FFFDF8] hover:border-[#8C5A3C]/50 hover:bg-[#FBF7EF]"
                    }`}
                    onClick={() => setSelectedInterviewStyle(style.id)}
                  >
                    <div
                      className={`flex w-10 h-10 sm:w-12 sm:h-12 items-center justify-center rounded-xl border transition-all duration-200 ${
                        selectedInterviewStyle === style.id
                          ? "bg-[#8C5A3C] border-[#8C5A3C] text-[#FFFDF8]"
                          : "bg-[#FBF7EF] border-[#D8CDBD] text-[#8C5A3C] group-hover:border-[#8C5A3C]/30 group-hover:bg-[#FFFDF8]"
                      }`}
                    >
                      <style.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3
                        className={`font-medium text-sm sm:text-base mb-1 transition-colors ${selectedInterviewStyle === style.id ? "text-[#8C5A3C]" : "text-[#2B2118]"}`}
                      >
                        {style.title}
                      </h3>
                      <p className="text-xs leading-relaxed text-[#8D8175]">
                        {style.description}
                      </p>
                    </div>
                    <div
                      className={`absolute top-4 right-4 sm:top-5 sm:right-5 transition-opacity duration-200 ${selectedInterviewStyle === style.id ? "opacity-100" : "opacity-0 group-hover:opacity-50"}`}
                    >
                      <CheckCircle className="w-4 h-4 text-[#8C5A3C]" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Start Button Container */}
            <div className="p-5 sm:p-6 md:p-8 rounded-2xl bg-[#FFFDF8] border border-[#D8CDBD] shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
              <div>
                <p className="text-base font-medium text-[#2B2118]">
                  Ready to begin?
                </p>
                <p className="mt-1 text-xs sm:text-sm text-[#8D8175]">
                  Double check your settings and start your personalized mock
                  interview.
                </p>
              </div>
              {isCreatingSession ? (
                <Button
                  disabled
                  className="bg-[#8C5A3C]/70 text-[#FFFDF8] w-full sm:w-auto cursor-not-allowed rounded-2xl px-6 sm:px-8 py-5 sm:py-6 font-medium shrink-0"
                >
                  <Spinner className="mr-2 h-4 w-4 text-[#FFFDF8]" />
                  Generating...
                </Button>
              ) : (
                <Button
                  type="button"
                  className="bg-[#8C5A3C] hover:bg-[#A06A47] text-[#FFFDF8] w-full sm:w-auto rounded-2xl px-6 sm:px-8 py-5 sm:py-6 shadow-md transition-all duration-200 ease-out font-medium shrink-0"
                  onClick={onHandleStartSession}
                >
                  <Wand2 className="w-4 h-4 mr-2" />
                  Start Session
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>

          {/* Right Column: How It Works Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="p-6 md:p-8 rounded-2xl bg-[#FBF7EF] border border-[#D8CDBD] relative overflow-hidden shadow-sm">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#8C5A3C] rounded-l-2xl"></div>

              <div className="border-b border-[#D8CDBD] pb-4 mb-6 pl-2">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-[#8C5A3C] mb-2">
                  <CheckCircle2 className="w-4 h-4" />
                  How it works
                </div>
                <h3 className="text-lg font-medium text-[#2B2118]">
                  Simple & fast
                </h3>
              </div>

              <div className="space-y-6 pl-2">
                {howItWorks.map((step, index) => (
                  <div key={step.title} className="flex gap-4">
                    <div className="flex w-10 h-10 shrink-0 items-center justify-center rounded-full bg-[#FFFDF8] border border-[#D8CDBD] shadow-sm text-[#8C5A3C]">
                      <step.icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <p className="text-[10px] font-medium uppercase tracking-widest text-[#8D8175]">
                        Step {index + 1}
                      </p>
                      <p className="mt-1 font-medium text-[#2B2118] text-sm">
                        {step.title}
                      </p>
                      <p className="mt-1.5 text-xs leading-relaxed text-[#5C5147]">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
