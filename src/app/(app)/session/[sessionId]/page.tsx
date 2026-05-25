"use client";
import axios from "axios";
import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  MessageSquare,
  Sparkles,
  Send,
  SparklesIcon,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useState, use, useEffect } from "react";

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
  question : string;
  response : string;
  questionType : 'initial' | 'followUp';
}

const page = ({ params }: PageProps) => {
  const { sessionId } = use(params);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [initialQuestions, setInitialQuestions] = useState<IQuestion[]>([]);
  const [initialQuestionCounter, setInitialQuestionCounter] =
    useState<number>(1);
  const [isInterviewCompleted, setisInterviewCompleted] =
    useState<Boolean>(false);
  const [answer, setAnswer] = useState<string>("");
  const [followUpCounter, setFollowUpCounter] = useState<number>(0);
  const [initialResponse, setInitialResponse] = useState<string>("");
  const [allResponses, setAllResponses] = useState<IResponse[]>([]);
  const [followUpQuestion,setFollowUpQuestion] = useState<string>("");

  useEffect(() => {
    const fetchInitialQuestions = async () => {
      try {
        const res = await axios.get(
          `/api/session/${sessionId}/initial-question`,
        );
        const questions: IQuestion[] = res.data.initialQuestions;
        setInitialQuestions(questions);
        if (questions.length > 0) {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              title: "Mock Mentor",
              content: questions[0].questionText,
            },
          ]);
        }
      } catch (error) {
        console.error("Error fetching initial questions:", error);
      }
    };
    fetchInitialQuestions();
  }, []);

  const fetchfollowUpQuestion = async (
    originalQuestion: string,
    userAnswer: string,
    followUpCount: number,
  ) => {
    try {
      const res = await axios.post(
        `/api/session/${sessionId}/followup-question`,
        { originalQuestion, userAnswer, followUpCount },
      );
      const question = res.data.followUpQuestion;
      return question.followUpQuestion;
    } catch (error) {
      console.log(error);
    }
  };

  const handleResponse = async (response: { text: string }) => {
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        title: "You",
        content: response.text,
      },
    ]);
    setAnswer("");
    const currentAnswer = response.text;
    if(followUpCounter == 0) {
      setAllResponses((prev)=>[...prev,{
          question : initialQuestions[initialQuestionCounter - 1].questionText,
          response : currentAnswer,
          questionType : 'initial'
        }])
    }
    else{
      setAllResponses((prev)=>[...prev,{
        question : followUpQuestion,
        response : currentAnswer,
        questionType : 'followUp'
      }])
    }
    if (followUpCounter < 2) {
      const baseAnswer = followUpCounter == 0 ? currentAnswer : initialResponse;

      const question = await fetchfollowUpQuestion(
        initialQuestions[initialQuestionCounter - 1].questionText,
        baseAnswer,
        followUpCounter,
      );

      if (followUpCounter == 0) setInitialResponse(currentAnswer);

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
    } else {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          title: "Mock Mentor",
          content: "Interview is Over Now You can Exit",
        },
      ]);
      setisInterviewCompleted(true);
    }
  };

  return (
    <div className="relative flex-1 overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_35%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0))]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
      </div>

      <main className="mx-auto min-h-screen max-w-6xl px-4 py-8">
        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground shadow-sm backdrop-blur">
              <Sparkles className="size-3.5 text-blue-400" />
              Interview chat session
            </div>

            <div className="space-y-3">
              <h1 className="font-heading text-4xl leading-tight font-semibold tracking-tight text-balance text-foreground sm:text-5xl">
                Chat with your mock mentor
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                A focused, conversational interview space with the same visual
                tone as the rest of the app.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-3 py-1 text-xs text-muted-foreground shadow-sm backdrop-blur">
                <MessageSquare className="size-3.5 text-blue-400" />
                Session {sessionId}
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-3 py-1 text-xs text-muted-foreground shadow-sm backdrop-blur">
                <SparklesIcon className="size-3.5 text-cyan-400" />
                Chat-first design
              </div>
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

        <Card className="min-h-[calc(100vh-11rem)] border-border/70 bg-card/70 shadow-[0_24px_70px_-32px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <CardHeader className="border-b border-border/60 pb-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Bot className="size-4 text-blue-400" />
              Live conversation
            </div>
            <CardTitle className="text-lg">Mock Mentor</CardTitle>
            <CardDescription>
              Static chat layout only for now. No sending, no state, just the
              visual shell.
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-1 flex-col">
            <div className="flex-1 space-y-4 overflow-y-auto">
              {messages.map((message, idx) => {
                const isAssistant = message.role === "assistant";

                return (
                  <div
                    key={idx}
                    className={`flex items-start gap-3 ${
                      isAssistant ? "justify-start" : "justify-end"
                    }`}
                  >
                    {isAssistant && (
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-400 shadow-sm">
                        <Bot className="size-4" />
                      </div>
                    )}

                    <div
                      className={`max-w-[min(34rem,85%)] rounded-3xl border px-4 py-3 shadow-sm ${
                        isAssistant
                          ? "border-border/70 bg-card/80 text-foreground"
                          : "border-blue-500/20 bg-blue-500/10 text-foreground"
                      }`}
                    >
                      <div className="mb-1 flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold">{message.title}</p>
                        {/* <span className="text-[11px] text-muted-foreground">
                          {message.time}
                        </span> */}
                      </div>
                      <p className="text-sm leading-6 text-muted-foreground">
                        {message.content}
                      </p>
                    </div>

                    {!isAssistant && (
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border/70 bg-card/80 text-cyan-400 shadow-sm">
                        <User className="size-4" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 rounded-3xl border border-border/70 bg-card/80 p-4 shadow-lg backdrop-blur-xl">
              <div className="space-y-3">
                {isInterviewCompleted ? (
                  <div className="flex items-center gap-2 text-green-500">
                    <SparklesIcon className="size-4" />
                    <p>Interview completed!</p>
                  </div>
                ) : (
                  <div>
                    <Textarea
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="Type your answer here..."
                      className="min-h-28 rounded-2xl border-border/70 bg-background/60 px-4 py-3 text-sm shadow-inner shadow-black/5 placeholder:text-muted-foreground/70"
                      value={answer}
                    />
                    <Button
                      onClick={() =>
                        handleResponse({
                          text: answer,
                        })
                      }
                      className="gap-2 self-end sm:self-auto"
                    >
                      <Send className="size-4" />
                      Send
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};
export default page;
