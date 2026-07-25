"use client";

import axios from "axios";
import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  Mic,
  RefreshCw,
  Sparkles,
  SparklesIcon,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import useTextToSpeech from "@/hooks/useTextToSpeech";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { CodeEditor } from "@/components/ui/CodeEditor";

interface PageProps {
  params: Promise<{
    sessionId: string;
  }>;
}

interface IQuestion {
  questionNumber: number;
  questionText: string;
  questionType: string;
}

interface IMessage {
  role: "assistant" | "user";
  title: string;
  content: string | undefined;
}

interface IResponse {
  question: string;
  response: string;
  questionType: "initial" | "followUp";
}
type Language = "java" | "javascript" | "python" | "cpp" | "none";

const page = ({ params }: PageProps) => {
  const { sessionId } = use(params);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [initialQuestions, setInitialQuestions] = useState<IQuestion[]>([]);
  const [initialQuestionCounter, setInitialQuestionCounter] =
    useState<number>(1);
  const [isInterviewCompleted, setIsInterviewCompleted] =
    useState<boolean>(false);
  const [followUpCounter, setFollowUpCounter] = useState<number>(0);
  const [initialResponse, setInitialResponse] = useState<string>("");
  const [allResponses, setAllResponses] = useState<IResponse[]>([]);
  const [followUpQuestion, setFollowUpQuestion] = useState<string>("");
  const [generatingReport, setGeneratingReport] = useState<boolean>(false);
  const [fetchingFollowUp, setFetchingFollowUp] = useState<boolean>(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );
  const audioChunks = useRef<Blob[]>([]);
  const router = useRouter();
  const [isListening, setIsListening] = useState<boolean>(false);
  const [latestAssistantText, setLatestAssistantText] = useState<string>("");
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const { speak, stop, isSpeaking } = useTextToSpeech();
  const [iscodeEditorReq, setIsCodeEditorReq] = useState<boolean>(false);
  const [sessionScore, setSessionScore] = useState<{
    overallScore: number;
    technicalScore: number;
    communicationScore: number;
    strength: string;
    weakness: string;
  }>(null as any);
  const [dynamicQuestionCount, setDynamicQuestionCount] = useState(0);
  const MAX_DYNAMIC_QUESTIONS = 1;

  const defaultCode = {
    java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,

    javascript: `function main() {
    console.log("Hello, World!");
}

main();`,

    python: `def main():
    print("Hello, World!")

if __name__ == "__main__":
    main()`,

    cpp: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,
    none: `// Pseudo Code
`,
  };
  const [code, setCode] = useState<Record<Language, string>>(defaultCode);
  const [codeLanguage, setCodeLanguage] = useState<Language>("java");
  const [iscodeEditorOpen, setIsCodeEditorOpen] = useState<boolean>(false);
  const [currentMainQuestion, setCurrentMainQuestion] = useState<string>(
    initialQuestions[0]?.questionText || "",
  );
  const [cycleScore, setCycleScore] = useState<(typeof sessionScore)[]>([]);

  useEffect(() => {
    const fetchInitialQuestions = async () => {
      try {
        const res = await axios.get(
          `/api/session/${sessionId}/initial-question`,
        );
        const questions: IQuestion[] = res.data.initialQuestions;
        setInitialQuestions(questions);
        if (questions[0].questionType === "coding") {
          setIsCodeEditorReq(true);
        }
        if (questions.length > 0) {
          setMessages((prev) =>
            prev.length
              ? prev
              : [
                  {
                    role: "assistant",
                    title: "Mock Mentor",
                    content: questions[0].questionText,
                  },
                ],
          );
          setCurrentMainQuestion(questions[0].questionText || "");
          setLatestAssistantText(questions[0].questionText);
        }
      } catch (error) {
        console.error("Error fetching initial questions:", error);
      }
    };
    fetchInitialQuestions();
  }, [sessionId]);

  useEffect(() => {
    if (!latestAssistantText) {
      return;
    }
    speak(latestAssistantText);

    return () => {
      stop();
    };
  }, [latestAssistantText]);

  const handleRelisten = () => {
    if (!latestAssistantText) return;
    speak(latestAssistantText);
  };

  const fetchFollowUpQuestion = async (
    originalQuestion: string,
    originalAnswer: string,
    followUpCount: number,
    previousFollowUpQuestion: string,
    latestAnswer: string,
  ) => {
    try {
      setFetchingFollowUp(true);
      const res = await axios.post(
        `/api/session/${sessionId}/followup-question`,
        {
          originalQuestion,
          originalAnswer,
          followUpCount,
          previousFollowUpQuestion,
          latestAnswer,
        },
      );
      if (res.data.followUpQuestion?.followUpType === "coding") {
        setIsCodeEditorReq(true);
      } else {
        setIsCodeEditorReq(false);
      }
      return {
        question: res.data.followUpQuestion?.followUpQuestion as string,
        score: res.data.score ?? null,
      };
    } catch (error) {
      console.error("Error fetching follow-up question:", error);
      return { question: "", score: null };
    } finally {
      setFetchingFollowUp(false);
    }
  };

  const handleResponse = async (response: { text: string }) => {
    if (!response.text.trim() || fetchingFollowUp) return;

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        title: "You",
        content: response.text,
      },
    ]);

    const currentAnswer = response.text;

    const newResponse: IResponse = {
      question: followUpCounter === 0 ? currentMainQuestion : followUpQuestion,
      response: currentAnswer,
      questionType: followUpCounter === 0 ? "initial" : "followUp",
    };

    setAllResponses((prev) => [...prev, newResponse]);

    if (followUpCounter < 2) {
      const baseAnswer =
        followUpCounter === 0 ? currentAnswer : initialResponse;

      const { question, score } = await fetchFollowUpQuestion(
        currentMainQuestion,
        baseAnswer,
        followUpCounter,
        followUpCounter === 0 ? "" : followUpQuestion,
        followUpCounter === 0 ? "" : currentAnswer,
      );
      if (score) {
        setSessionScore(score);
        setCycleScore((prev) => [...prev, score]);
      }

      if (followUpCounter === 0) setInitialResponse(currentAnswer);

      if (question) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            title: "Mock Mentor",
            content: question,
          },
        ]);
        setFollowUpQuestion(question);
        setLatestAssistantText(question);
        setFollowUpCounter((prev) => prev + 1);
      }
    } else if (followUpCounter > 1) {
      if (dynamicQuestionCount >= MAX_DYNAMIC_QUESTIONS) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            title: "Mock Mentor",
            content: "Interview is Over. You can now exit.",
          },
        ]);
        setIsInterviewCompleted(true);
        return;
      }

      setFetchingFollowUp(true);

      try {
        const allScores = cycleScore;
        const avgScore = {
          overallScore: Math.round(
            allScores.reduce((s, c) => s + c.overallScore, 0) /
              allScores.length,
          ),
          technicalScore: Math.round(
            allScores.reduce((s, c) => s + c.technicalScore, 0) /
              allScores.length,
          ),
          communicationScore: Math.round(
            allScores.reduce((s, c) => s + c.communicationScore, 0) /
              allScores.length,
          ),
          strength: allScores[allScores.length - 1].strength,
          weakness: allScores[allScores.length - 1].weakness,
        };
        const res = await axios.post(
          `/api/session/${sessionId}/next-question`,
          {
            sessionId,
            sessionScore: avgScore,
          },
        );
        const nextQ = res.data.question;

        setIsCodeEditorReq(nextQ.questionType === "coding");
        setCycleScore([]);

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            title: "Mock Mentor",
            content: nextQ.questionText,
          },
        ]);

        setCurrentMainQuestion(nextQ.questionText);
        setLatestAssistantText(nextQ.questionText);
        setFollowUpCounter(0);
        setInitialResponse("");
        setDynamicQuestionCount((prev) => prev + 1);
      } catch (error) {
        console.error("Error fetching next question:", error);
      } finally {
        setFetchingFollowUp(false);
      }
    }
  };

  const startListening = async () => {
    if (isListening) return;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);

    recorder.ondataavailable = (event) => {
      audioChunks.current.push(event.data);
    };

    recorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
      audioChunks.current = [];
      const formData = new FormData();
      formData.append("audio", audioBlob, "response.webm");
      setIsTranscribing(true);
      try {
        const res = await axios.post("/api/transcribe", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        const data = await res.data;
        if (data.text) {
          await handleResponse({ text: data.text });
        }
      } catch (error) {
        console.error("Error transcribing audio:", error);
      } finally {
        setIsTranscribing(false);
      }
    };
    recorder.start();
    setMediaRecorder(recorder);
    setIsListening(true);
  };

  const stopListening = () => {
    mediaRecorder?.stop();
    setMediaRecorder(null);
    setIsListening(false);
  };

  const handleStopListening = () => {
    stopListening();
  };

  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    try {
      await axios.post(`/api/session/${sessionId}/generate-report`, {
        interviewData: allResponses,
      });
      router.push(`/session/${sessionId}/report`);
    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleCodeSubmit = async () => {
    if (fetchingFollowUp) return;
    handleResponse({ text: code[codeLanguage] });
    setIsCodeEditorReq(false);
    setCode(defaultCode);
    setIsCodeEditorOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-[#F3EBDD] text-[#5C5147] font-sans overflow-auto selection:bg-[#8C5A3C] selection:text-[#FFFDF8]">
      
      {/* Top Header - Paper Layer */}
      <div className="sticky top-0 z-10 w-full bg-[#FBF7EF]/95 backdrop-blur-xl border-b border-[#D8CDBD] pt-6 pb-4 md:pt-8 transition-all duration-200 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-5 md:px-12 max-w-6xl mx-auto gap-4">
          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 rounded-full border border-[#D8CDBD] bg-[#FFFDF8] text-[10px] md:text-xs font-medium uppercase tracking-widest text-[#8C5A3C] shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              Voice interview session
            </div>
            <h1 className="text-2xl md:text-3xl font-medium tracking-tight text-[#2B2118] truncate mb-1 md:mb-2">
              Speak with your mock mentor
            </h1>
            <p className="text-[#8D8175] text-xs md:text-sm font-normal truncate max-w-2xl">
              Listen to each question, answer by voice, and continue the interview flow.
            </p>
          </div>
          <Button
            asChild
            variant="outline"
            className="shrink-0 border-[#D8CDBD] bg-[#FFFDF8] text-[#5C5147] hover:bg-[#FBF7EF] hover:text-[#2B2118] rounded-2xl shadow-sm transition-all self-start sm:self-auto"
          >
            <Link href="/interview">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
        </div>
      </div>

      <main className="mx-auto flex w-full max-w-6xl flex-col px-5 md:px-12 py-8 md:py-10 flex-1">
        
        {generatingReport ? (
          <div className="flex flex-1 flex-col items-center justify-center p-8 md:p-10 rounded-2xl bg-[#FFFDF8] border border-[#D8CDBD] shadow-sm mt-4">
            <Sparkles className="w-8 h-8 text-[#8C5A3C] animate-pulse mb-4" />
            <p className="text-lg font-medium text-[#2B2118]">
              Generating your detailed report...
            </p>
            <p className="text-sm text-[#8D8175] mt-2">
              This will just take a moment.
            </p>
          </div>
        ) : (
          <Card className="flex flex-col min-h-125 flex-1 overflow-hidden rounded-2xl border border-[#D8CDBD] bg-[#FFFDF8] shadow-sm">
            <CardHeader className="border-b border-[#D8CDBD] bg-[#FBF7EF] pb-5 pt-6 px-6 md:px-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest font-medium text-[#8D8175]">
                    <span className="flex size-7 items-center justify-center rounded-lg border border-[#D8CDBD] bg-[#FFFDF8] shadow-sm">
                      <Bot className="size-3.5 text-[#8C5A3C]" />
                    </span>
                    Live voice conversation
                  </div>
                  <div>
                    <CardTitle className="text-lg md:text-xl font-medium text-[#2B2118]">Mock Mentor</CardTitle>
                    <CardDescription className="text-sm text-[#8D8175] mt-1.5 max-w-sm">
                      The mentor speaks automatically. Use relisten whenever you need the prompt again.
                    </CardDescription>
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 rounded-full border border-[#D8CDBD] bg-[#FFFDF8] px-3.5 py-1.5 text-xs font-medium text-[#5C5147] shadow-sm shrink-0">
                  <span
                    className={`size-2.5 rounded-full ${
                      isListening
                        ? "bg-[#2A9D8F] shadow-[0_0_12px_rgba(42,157,143,0.6)]" // Teal for Listening
                        : isSpeaking
                          ? "bg-[#8C5A3C] shadow-[0_0_12px_rgba(140,90,60,0.6)]" // Terracotta for Speaking
                          : isTranscribing
                            ? "bg-[#F4A261] shadow-[0_0_12px_rgba(244,162,97,0.6)]" // Gold for transcribing
                            : "bg-[#D8CDBD]" // Taupe for ready
                    }`}
                  />
                  {fetchingFollowUp
                    ? "Preparing"
                    : isListening
                      ? "Listening"
                      : isSpeaking
                        ? "Speaking"
                        : isTranscribing
                          ? "Transcribing"
                          : "Ready"}
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col items-center justify-center gap-8 p-6 md:p-10 text-center">
              
              {/* Central Visualization Area */}
              <div className="relative flex w-full max-w-3xl flex-col items-center rounded-[2rem] border border-[#D8CDBD] bg-[#FBF7EF] px-5 py-10 shadow-sm sm:px-10 overflow-hidden">
                
                {/* Decorative subtle lines */}
                <div className="pointer-events-none absolute inset-x-8 top-8 h-px bg-linear-to-r from-transparent via-[#8C5A3C]/20 to-transparent" />
                <div className="pointer-events-none absolute inset-x-8 bottom-8 h-px bg-linear-to-r from-transparent via-[#8C5A3C]/20 to-transparent" />

                {/* Main Avatar / Mic Circle */}
                <div className="relative mb-10 flex size-32 items-center justify-center rounded-full border border-[#8C5A3C]/20 bg-[#8C5A3C]/5 text-[#8C5A3C] shadow-[0_0_0_12px_rgba(140,90,60,0.03),0_20px_60px_-20px_rgba(140,90,60,0.2)]">
                  <div
                    className={`absolute inset-0 rounded-full border border-[#8C5A3C]/30 ${
                      isSpeaking || isListening ? "animate-ping" : ""
                    }`}
                  />
                  <div className="absolute inset-3 rounded-full border border-[#8C5A3C]/20" />
                  {isSpeaking ? (
                    <Volume2 className="relative size-12 animate-pulse" />
                  ) : (
                    <Bot className="relative size-12" />
                  )}
                </div>

                {/* Audio Visualizer Bars */}
                <div className="mb-10 flex h-24 w-full max-w-2xl items-center justify-center gap-2 rounded-2xl border border-[#D8CDBD] bg-[#FFFDF8] px-4 shadow-sm">
                  <span
                    className={`w-1.5 rounded-full bg-[#8C5A3C]/40 ${isSpeaking || isListening ? "h-8 animate-pulse" : "h-4"}`}
                  />
                  <span
                    className={`w-1.5 rounded-full bg-[#A06A47]/50 ${isSpeaking || isListening ? "h-14 animate-pulse" : "h-8"}`}
                  />
                  <span
                    className={`w-1.5 rounded-full bg-[#8C5A3C]/60 ${isSpeaking || isListening ? "h-10 animate-pulse" : "h-5"}`}
                  />
                  <span
                    className={`w-1.5 rounded-full bg-[#A06A47]/70 ${isSpeaking || isListening ? "h-20 animate-pulse" : "h-10"}`}
                  />
                  <span
                    className={`w-1.5 rounded-full bg-[#8C5A3C]/70 ${isSpeaking || isListening ? "h-12 animate-pulse" : "h-6"}`}
                  />
                  <span
                    className={`w-1.5 rounded-full bg-[#A06A47]/80 ${isSpeaking || isListening ? "h-16 animate-pulse" : "h-9"}`}
                  />
                  <span
                    className={`w-1.5 rounded-full bg-[#8C5A3C]/80 ${isSpeaking || isListening ? "h-9 animate-pulse" : "h-5"}`}
                  />
                  <span
                    className={`w-1.5 rounded-full bg-[#A06A47]/70 ${isSpeaking || isListening ? "h-20 animate-pulse" : "h-11"}`}
                  />
                  <span
                    className={`w-1.5 rounded-full bg-[#8C5A3C]/70 ${isSpeaking || isListening ? "h-12 animate-pulse" : "h-7"}`}
                  />
                  <span
                    className={`w-1.5 rounded-full bg-[#A06A47]/60 ${isSpeaking || isListening ? "h-16 animate-pulse" : "h-8"}`}
                  />
                  <span
                    className={`w-1.5 rounded-full bg-[#8C5A3C]/55 ${isSpeaking || isListening ? "h-10 animate-pulse" : "h-5"}`}
                  />
                  <span
                    className={`w-1.5 rounded-full bg-[#A06A47]/45 ${isSpeaking || isListening ? "h-14 animate-pulse" : "h-7"}`}
                  />
                  <span
                    className={`w-1.5 rounded-full bg-[#8C5A3C]/40 ${isSpeaking || isListening ? "h-8 animate-pulse" : "h-4"}`}
                  />
                </div>

                <div className="max-w-xl space-y-3">
                  <p className="text-xs font-medium uppercase tracking-widest text-[#8D8175]">
                    {fetchingFollowUp
                      ? "Preparing follow-up"
                      : isSpeaking
                        ? "Mentor speaking"
                        : isTranscribing
                          ? "Transcribing your answer"
                          : isListening
                            ? "You are answering"
                            : "Waiting for your answer"}
                  </p>
                  <h2 className="text-2xl font-medium tracking-tight text-[#2B2118] sm:text-3xl">
                    Voice-only interview
                  </h2>
                  <p className="min-h-12 text-sm leading-relaxed text-[#5C5147] sm:text-base">
                    {fetchingFollowUp
                      ? "Please wait while the next question is generated."
                      : isListening
                        ? "Listening to your response..."
                        : "Start listening when you are ready to answer."}
                  </p>
                </div>
              </div>

              {/* Action Controls */}
              {isInterviewCompleted ? (
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <div className="inline-flex h-12 items-center gap-2 rounded-full border border-[#2A9D8F]/30 bg-[#2A9D8F]/10 px-5 text-[#2A9D8F] font-medium">
                    <SparklesIcon className="w-4 h-4" />
                    <p>Interview completed!</p>
                  </div>
                  <Button
                    onClick={handleGenerateReport}
                    className="h-12 rounded-full px-6 bg-[#8C5A3C] hover:bg-[#A06A47] text-[#FFFDF8] shadow-md transition-all font-medium"
                  >
                    Generate Report
                  </Button>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <Button
                    onClick={handleRelisten}
                    disabled={!latestAssistantText || isSpeaking}
                    type="button"
                    variant="outline"
                    className="h-12 rounded-full border-[#D8CDBD] bg-[#FFFDF8] text-[#5C5147] hover:bg-[#FBF7EF] hover:text-[#2B2118] px-6 shadow-sm transition-all"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Relisten
                  </Button>

                  {!iscodeEditorReq && (
                    <Button
                      onClick={
                        isListening ? handleStopListening : startListening
                      }
                      disabled={
                        fetchingFollowUp || isSpeaking || isTranscribing
                      }
                      type="button"
                      className="h-12 rounded-full px-6 bg-[#8C5A3C] hover:bg-[#A06A47] text-[#FFFDF8] shadow-md transition-all font-medium"
                    >
                      <Mic className="w-4 h-4 mr-2" />
                      {isListening ? "Submit Answer" : "Start Answer"}
                    </Button>
                  )}
                  
                  <Dialog
                    open={iscodeEditorOpen}
                    onOpenChange={setIsCodeEditorOpen}
                  >
                    {iscodeEditorReq && (
                      <DialogTrigger asChild>
                        <Button className="h-12 rounded-full px-6 bg-[#8C5A3C] hover:bg-[#A06A47] text-[#FFFDF8] shadow-md transition-all font-medium">
                          Open Editor
                        </Button>
                      </DialogTrigger>
                    )}

                    <DialogContent className="w-full h-[80vh] flex flex-col bg-[#FFFDF8] border-[#D8CDBD]">
                      <DialogHeader>
                        <DialogTitle className="text-[#2B2118]">Coding Challenge</DialogTitle>
                        <DialogDescription className="text-[#8D8175]">
                          Use the editor below to solve the coding problem. You
                          can submit your answer at any time.
                        </DialogDescription>
                      </DialogHeader>

                      {/* Editor Area */}
                      <div className="flex-1 overflow-hidden rounded-xl border border-[#D8CDBD] p-4 bg-[#FBF7EF]">
                        {/* Replace this with Monaco Editor */}
                        <CodeEditor
                          code={code}
                          onChange={setCode}
                          setLanguage={setCodeLanguage}
                        />
                      </div>

                      <DialogFooter className="mt-4">
                        <DialogClose asChild>
                          <Button variant="outline" className="border-[#D8CDBD] text-[#5C5147] hover:bg-[#FBF7EF] hover:text-[#2B2118]">Close</Button>
                        </DialogClose>

                        <Button onClick={handleCodeSubmit} className="bg-[#8C5A3C] hover:bg-[#A06A47] text-[#FFFDF8]">Submit</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default page;