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
import {CodeEditor} from "@/components/ui/CodeEditor";

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
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );
  const audioChunks = useRef<Blob[]>([]);
  const router = useRouter();
  const [isListening, setIsListening] = useState<boolean>(false);
  // const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [latestAssistantText, setLatestAssistantText] = useState<string>("");
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const { speak, stop, isSpeaking } = useTextToSpeech();

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
          setLatestAssistantText(questions[0].questionText);
        }
      } catch (error) {
        console.error("Error fetching initial questions:", error);
      }
    };
    fetchInitialQuestions();
  }, [sessionId]);

  // const speak = async (text: string) => {
  //   setIsSpeaking(true);
  //   try {
  //     const res = await axios.post(
  //       "/api/tts",
  //       { text },
  //       {
  //         responseType: "blob",
  //       },
  //     );
  //     const audioBlob = res.data;
  //     const audioUrl = URL.createObjectURL(audioBlob);
  //     const audio = new Audio(audioUrl);
  //     audio.play();
  //     audio.onended = () => {
  //       setIsSpeaking(false);
  //       URL.revokeObjectURL(audioUrl);
  //     };
  //   } catch (error) {
  //     console.error("Error in text-to-speech:", error);
  //     setIsSpeaking(false);
  //   }
  // };
  useEffect(() => {
    if (!latestAssistantText) {
      return;
    }
    speak(latestAssistantText);

    return () => {
      stop();
    }
  }, [latestAssistantText]);

  const handleRelisten = () => {
    if (!latestAssistantText) return;

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
      const res = await axios.post(
        `/api/session/${sessionId}/followup-question`,
        {
          originalQuestion,
          userAnswer,
          followUpCount,
          previousFollowUpQuestion,
          previousFollowUpAnswer,
        },
      );
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
      const baseAnswer =
        followUpCounter === 0 ? currentAnswer : initialResponse;

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
        setLatestAssistantText(question);
        setFollowUpCounter((prev) => prev + 1);
      }
    } else if (
      initialQuestionCounter < initialQuestions.length &&
      followUpCounter > 1
    ) {
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
      setLatestAssistantText(
        initialQuestions[initialQuestionCounter].questionText,
      );
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
                Listen to each question, answer by voice, and continue the same
                interview flow.
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
            <p className="text-lg font-medium text-muted-foreground">
              Generating report...
            </p>
          </div>
        ) : (
          <Card className="flex min-h-[calc(100vh-13rem)] flex-1 overflow-hidden border-border/70 bg-card/75 shadow-[0_28px_90px_-36px_rgba(0,0,0,0.55)] backdrop-blur-xl">
            <CardHeader className="border-b border-border/60 bg-background/25 pb-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="flex size-8 items-center justify-center rounded-full border border-blue-500/20 bg-blue-500/10">
                      <Bot className="size-4 text-blue-400" />
                    </span>
                    Live voice conversation
                  </div>
                  <div>
                    <CardTitle className="text-xl">Mock Mentor</CardTitle>
                    <CardDescription className="mt-1">
                      The mentor speaks automatically. Use relisten whenever you
                      need the prompt again.
                    </CardDescription>
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/80 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
                  <span
                    className={`size-2 rounded-full ${
                      isListening
                        ? "bg-green-400 shadow-[0_0_18px_rgba(74,222,128,0.75)]"
                        : isSpeaking
                          ? "bg-blue-400 shadow-[0_0_18px_rgba(96,165,250,0.75)]"
                          : isTranscribing
                            ? "bg-yellow-400 shadow-[0_0_18px_rgba(253,224,71,0.75)]"
                            : "bg-gray-400"
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

            <CardContent className="flex flex-1 flex-col items-center justify-center gap-8 p-5 text-center sm:p-8">
              <div className="relative flex w-full max-w-3xl flex-col items-center rounded-[2rem] border border-border/70 bg-background/35 px-5 py-8 shadow-inner sm:px-8">
                <div className="pointer-events-none absolute inset-x-8 top-8 h-px bg-linear-to-r from-transparent via-blue-400/30 to-transparent" />
                <div className="pointer-events-none absolute inset-x-8 bottom-8 h-px bg-linear-to-r from-transparent via-cyan-400/25 to-transparent" />

                <div className="relative mb-8 flex size-32 items-center justify-center rounded-full border border-blue-500/25 bg-blue-500/10 text-blue-400 shadow-[0_0_0_12px_rgba(59,130,246,0.06),0_20px_70px_-28px_rgba(59,130,246,0.9)]">
                  <div
                    className={`absolute inset-0 rounded-full border border-blue-400/30 ${
                      isSpeaking || isListening ? "animate-ping" : ""
                    }`}
                  />
                  <div className="absolute inset-3 rounded-full border border-cyan-400/20" />
                  {isSpeaking ? (
                    <Volume2 className="relative size-12 animate-pulse" />
                  ) : (
                    <Bot className="relative size-12" />
                  )}
                </div>

                <div className="mb-8 flex h-24 w-full max-w-2xl items-center justify-center gap-1.5 rounded-2xl border border-border/60 bg-card/65 px-4 shadow-sm">
                  <span
                    className={`w-1.5 rounded-full bg-blue-400/45 ${isSpeaking || isListening ? "h-8 animate-pulse" : "h-4"}`}
                  />
                  <span
                    className={`w-1.5 rounded-full bg-cyan-400/50 ${isSpeaking || isListening ? "h-14 animate-pulse" : "h-8"}`}
                  />
                  <span
                    className={`w-1.5 rounded-full bg-blue-400/60 ${isSpeaking || isListening ? "h-10 animate-pulse" : "h-5"}`}
                  />
                  <span
                    className={`w-1.5 rounded-full bg-cyan-400/70 ${isSpeaking || isListening ? "h-20 animate-pulse" : "h-10"}`}
                  />
                  <span
                    className={`w-1.5 rounded-full bg-blue-400/70 ${isSpeaking || isListening ? "h-12 animate-pulse" : "h-6"}`}
                  />
                  <span
                    className={`w-1.5 rounded-full bg-cyan-400/80 ${isSpeaking || isListening ? "h-16 animate-pulse" : "h-9"}`}
                  />
                  <span
                    className={`w-1.5 rounded-full bg-blue-400/80 ${isSpeaking || isListening ? "h-9 animate-pulse" : "h-5"}`}
                  />
                  <span
                    className={`w-1.5 rounded-full bg-cyan-400/70 ${isSpeaking || isListening ? "h-20 animate-pulse" : "h-11"}`}
                  />
                  <span
                    className={`w-1.5 rounded-full bg-blue-400/70 ${isSpeaking || isListening ? "h-12 animate-pulse" : "h-7"}`}
                  />
                  <span
                    className={`w-1.5 rounded-full bg-cyan-400/60 ${isSpeaking || isListening ? "h-16 animate-pulse" : "h-8"}`}
                  />
                  <span
                    className={`w-1.5 rounded-full bg-blue-400/55 ${isSpeaking || isListening ? "h-10 animate-pulse" : "h-5"}`}
                  />
                  <span
                    className={`w-1.5 rounded-full bg-cyan-400/45 ${isSpeaking || isListening ? "h-14 animate-pulse" : "h-7"}`}
                  />
                  <span
                    className={`w-1.5 rounded-full bg-blue-400/40 ${isSpeaking || isListening ? "h-8 animate-pulse" : "h-4"}`}
                  />
                </div>

                <div className="max-w-xl space-y-3">
                  <p className="text-sm font-medium uppercase tracking-[0.22em] text-muted-foreground">
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
                  <h2 className="font-heading text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
                    Voice-only interview
                  </h2>
                  <p className="min-h-12 text-sm leading-6 text-muted-foreground sm:text-base">
                    {fetchingFollowUp
                      ? "Please wait while the next question is generated."
                      : isListening
                        ? "Listening..."
                        : "Start listening when you are ready to answer."}
                  </p>
                </div>
              </div>

              {isInterviewCompleted ? (
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <div className="inline-flex h-12 items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-5 text-green-500">
                    <SparklesIcon className="size-4" />
                    <p>Interview completed!</p>
                  </div>
                  <Button
                    onClick={handleGenerateReport}
                    className="h-12 rounded-full px-5"
                  >
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
                    disabled={fetchingFollowUp || isSpeaking || isTranscribing}
                    type="button"
                    className="h-12 rounded-full px-5"
                  >
                    <Mic className="size-4" />
                    {isListening ? "Submit Answer" : "Start Answer"}
                  </Button>
                  <Dialog >
                    <DialogTrigger asChild>
                      <Button>Open Editor</Button>
                    </DialogTrigger>

                    <DialogContent className="w-full h-[80vh] flex flex-col">
                      <DialogHeader>
                        <DialogTitle>Coding Challenge</DialogTitle>
                        <DialogDescription>
                          Use the editor below to solve the coding problem. You
                          can submit your answer at any time.
                        </DialogDescription>
                      </DialogHeader>

                      {/* Editor Area */}
                      <div className="flex-1 overflow-hidden rounded-md border p-4">
                        {/* Replace this with Monaco Editor */}
                        <CodeEditor />
                      </div>

                      <DialogFooter className="mt-4">
                        <DialogClose asChild>
                          <Button variant="outline">Close</Button>
                        </DialogClose>

                        <Button>Submit</Button>
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
