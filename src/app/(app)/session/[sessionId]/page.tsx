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
import { use, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import useSpeechRecognition from "@/hooks/useSpeechRecognition";
import useTextToSpeech from "@/hooks/useTextToSpeech";

interface PageProps {
  params: Promise<{
    sessionId: string;
  }>;
}

interface IQuestion {
  questionNumber: number;
  questionText: string;
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
  const router = useRouter();
  const {
    transcript,
    isListening,
    startListening,
    stopListening,
    interimTranscript,
  } = useSpeechRecognition();
  const { speak, stop, isSpeaking } = useTextToSpeech();
  const lastSpokenPromptRef = useRef("");

  const latestAssistantMessage = useMemo(
    () => [...messages].reverse().find((message) => message.role === "assistant"),
    [messages],
  );
  const latestAssistantText = latestAssistantMessage?.content || "";

  useEffect(() => {
    const fetchInitialQuestions = async () => {
      try {
        const res = await axios.get(
          `/api/session/${sessionId}/initial-question`,
        );
        const questions: IQuestion[] = res.data.initialQuestions;
        setInitialQuestions(questions);
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
        }
      } catch (error) {
        console.error("Error fetching initial questions:", error);
      }
    };
    fetchInitialQuestions();
  }, [sessionId]);

  useEffect(() => {
    if (!latestAssistantText || latestAssistantText === lastSpokenPromptRef.current) {
      return;
    }

    lastSpokenPromptRef.current = latestAssistantText;
    stop();
    speak(latestAssistantText);
  }, [latestAssistantText, speak, stop]);

  const handleRelisten = () => {
    if (!latestAssistantText) return;

    stop();
    speak(latestAssistantText);
  };

  const fetchFollowUpQuestion = async (
    originalQuestion: string,
    userAnswer: string,
    followUpCount: number,
    previousFollowUpQuestion: string,
    previousFollowUpAnswer: string,
  ) => {
    try {
      setFetchingFollowUp(true);
      const res = await axios.post(`/api/session/${sessionId}/followup-question`, {
        originalQuestion,
        userAnswer,
        followUpCount,
        previousFollowUpQuestion,
        previousFollowUpAnswer,
      });

      return res.data.followUpQuestion?.followUpQuestion as string;
    } catch (error) {
      console.error("Error fetching follow-up question:", error);
      return "";
    } finally {
      setFetchingFollowUp(false);
    }
  };

  const handleResponse = async (response: { text: string }) => {
    if (!response.text.trim() || fetchingFollowUp) return;

    stop();

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
      question:
        followUpCounter === 0
          ? initialQuestions[initialQuestionCounter - 1]?.questionText || ""
          : followUpQuestion,
      response: currentAnswer,
      questionType: followUpCounter === 0 ? "initial" : "followUp",
    };

    setAllResponses((prev) => [...prev, newResponse]);

    if (followUpCounter < 2) {
      const baseAnswer = followUpCounter === 0 ? currentAnswer : initialResponse;

      const question = await fetchFollowUpQuestion(
        initialQuestions[initialQuestionCounter - 1]?.questionText || "",
        baseAnswer,
        followUpCounter,
        followUpCounter === 0 ? "" : followUpQuestion,
        followUpCounter === 0 ? "" : currentAnswer,
      );

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
        setFollowUpCounter((prev) => prev + 1);
      }
    } else if (initialQuestionCounter < initialQuestions.length && followUpCounter > 1) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          title: "Mock Mentor",
          content: initialQuestions[initialQuestionCounter].questionText,
        },
      ]);
      setInitialQuestionCounter((prev) => prev + 1);
      setFollowUpCounter(0);
    } else {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          title: "Mock Mentor",
          content: "Interview is Over Now You can Exit",
        },
      ]);
      setIsInterviewCompleted(true);
    }
  };

  const handleStopListening = () => {
    stopListening();

    const finalResponse = `${transcript} ${interimTranscript}`.trim();
    if (finalResponse) {
      handleResponse({ text: finalResponse });
    }
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

  return (
    <div className="relative flex-1 overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_35%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0))]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
      </div>

      <main className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-8">
        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground shadow-sm backdrop-blur">
              <Sparkles className="size-3.5 text-blue-400" />
              Voice interview session
            </div>

            <div className="space-y-3">
              <h1 className="font-heading text-4xl leading-tight font-semibold tracking-tight text-balance text-foreground sm:text-5xl">
                Speak with your mock mentor
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                Listen to each question, answer by voice, and continue the same interview flow.
              </p>
            </div>
          </div>

          <Button
            asChild
            variant="outline"
            className="shrink-0 border-border/70 bg-card/70 shadow-sm backdrop-blur"
          >
            <Link href="/interview">
              <ArrowLeft className="size-4" />
              Back
            </Link>
          </Button>
        </header>

        {generatingReport ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-lg font-medium text-muted-foreground">Generating report...</p>
          </div>
        ) : (
          <Card className="flex min-h-[calc(100vh-13rem)] flex-1 flex-col border-border/70 bg-card/70 shadow-[0_24px_70px_-32px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <CardHeader className="border-b border-border/60 pb-5">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Bot className="size-4 text-blue-400" />
                Live voice conversation
              </div>
              <CardTitle className="text-lg">Mock Mentor</CardTitle>
              <CardDescription>
                The mentor speaks automatically. Use relisten whenever you need the prompt again.
              </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col items-center justify-center gap-8 p-6 text-center">
              <div className="flex size-28 items-center justify-center rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-400 shadow-[0_0_0_10px_rgba(59,130,246,0.06)]">
                {isSpeaking ? (
                  <Volume2 className="size-12 animate-pulse" />
                ) : (
                  <Bot className="size-12" />
                )}
              </div>

              <div className="max-w-xl space-y-3">
                <p className="text-sm font-medium uppercase tracking-[0.22em] text-muted-foreground">
                  {fetchingFollowUp ? "Preparing follow-up" : isSpeaking ? "Mentor speaking" : "Ready"}
                </p>
                <h2 className="font-heading text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
                  Voice-only interview
                </h2>
                <p className="text-sm leading-6 text-muted-foreground sm:text-base">
                  {fetchingFollowUp
                    ? "Please wait while the next question is generated."
                    : isListening
                      ? `${transcript} ${interimTranscript}`.trim() || "Listening..."
                      : "Start listening when you are ready to answer."}
                </p>
              </div>

              {isInterviewCompleted ? (
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <div className="inline-flex items-center gap-2 text-green-500">
                    <SparklesIcon className="size-4" />
                    <p>Interview completed!</p>
                  </div>
                  <Button onClick={handleGenerateReport}>
                    Generate Report
                  </Button>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Button
                    onClick={handleRelisten}
                    disabled={!latestAssistantText || isSpeaking}
                    type="button"
                    variant="outline"
                    className="h-12 rounded-full border-border/70 bg-card/80 px-5 shadow-sm"
                  >
                    <RefreshCw className="size-4" />
                    Relisten
                  </Button>

                  <Button
                    onClick={isListening ? handleStopListening : startListening}
                    disabled={fetchingFollowUp || isSpeaking}
                    type="button"
                    className="h-12 rounded-full px-5"
                  >
                    <Mic className="size-4" />
                    {isListening ? "Submit Answer" : "Start Answer"}
                  </Button>
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
