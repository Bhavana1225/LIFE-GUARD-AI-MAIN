import { useEffect, useRef, useState } from "react";
import {
  Bot,
  Loader2,
  Mic,
  MicOff,
  RotateCcw,
  Send,
  Volume2,
  VolumeX,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassPanel } from "@/components/glass-panel";
import { apiAskAssistant, type AnalysisResult } from "@/lib/api";
import { cn } from "@/lib/healthUtils";

interface Turn {
  role: "user" | "assistant";
  text: string;
}

interface VoiceAssistantProps {
  result: AnalysisResult | null;
  onAsk?: (question: string) => Promise<string>;
}

const INITIAL_MESSAGE =
  "Hi, I'm your LifeGuard AI assistant. I can explain your health results, discuss common symptoms, and help you understand possible next steps. What would you like to know?";

export function VoiceAssistant({
  result,
  onAsk,
}: VoiceAssistantProps) {
  const [turns, setTurns] = useState<Turn[]>([
    { role: "assistant", text: INITIAL_MESSAGE },
  ]);
  const [value, setValue] = useState("");
  const [listening, setListening] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [speakEnabled, setSpeakEnabled] = useState(true);
  const [supported, setSupported] = useState(false);

  const recognitionRef = useRef<any>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const w = window as any;
    const Recognition =
      w.SpeechRecognition ?? w.webkitSpeechRecognition;

    if (!Recognition) {
      return;
    }

    setSupported(true);

    const recognition = new Recognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript =
        event.results?.[0]?.[0]?.transcript?.trim();

      setListening(false);

      if (transcript) {
        void ask(transcript);
      }
    };

    recognition.onerror = (event: any) => {
      setListening(false);

      if (event?.error !== "aborted") {
        toast.error(
          "Microphone unavailable — type your question instead.",
        );
      }
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.abort?.();
      } catch {
        // Ignore cleanup errors.
      }
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [turns, thinking]);

  function speak(text: string) {
    if (
      !speakEnabled ||
      typeof window === "undefined" ||
      !window.speechSynthesis
    ) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.02;
    utterance.pitch = 1;

    window.speechSynthesis.speak(utterance);
  }

  async function ask(question: string) {
    const trimmed = question.trim();

    if (!trimmed || thinking) {
      return;
    }

    const userTurn: Turn = {
      role: "user",
      text: trimmed,
    };

    const updatedTurns = [...turns, userTurn];

    setTurns(updatedTurns);
    setValue("");
    setThinking(true);

    try {
      let answer: string;

      if (onAsk) {
        answer = await onAsk(trimmed);
      } else {
        const context = {
          analysis: result,
          conversation: updatedTurns.slice(-10),
        };

        answer = await apiAskAssistant(trimmed, context);
      }

      setTurns((prev) => [
        ...prev,
        { role: "assistant", text: answer },
      ]);

      speak(answer);
    } catch (error) {
      console.error("LifeGuard assistant error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "The assistant is unavailable right now.",
      );
    } finally {
      setThinking(false);
    }
  }

  function toggleMic() {
    if (!supported) {
      toast.error(
        "Voice input isn't supported in this browser — type instead.",
      );
      return;
    }

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    try {
      recognitionRef.current?.start();
      setListening(true);
    } catch {
      setListening(false);
      toast.error("Unable to start the microphone.");
    }
  }

  function clearConversation() {
    window.speechSynthesis?.cancel();

    setTurns([
      {
        role: "assistant",
        text: INITIAL_MESSAGE,
      },
    ]);

    setValue("");
  }

  return (
    <GlassPanel className="flex min-h-[520px] flex-col overflow-hidden p-0">
      {/* Header */}
      <div className="border-b border-border/60 px-5 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-brand">
              <Bot className="size-6" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-lg font-bold">
                  LifeGuard AI
                </h3>

                <span className="rounded-full bg-vital/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-vital">
                  Online
                </span>
              </div>

              <p className="truncate text-xs text-muted-foreground">
                Health guidance • Voice enabled
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              aria-label="Clear conversation"
              title="Clear conversation"
              onClick={clearConversation}
            >
              <RotateCcw className="size-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              aria-label={
                speakEnabled
                  ? "Mute spoken replies"
                  : "Unmute spoken replies"
              }
              title={
                speakEnabled
                  ? "Mute spoken replies"
                  : "Unmute spoken replies"
              }
              onClick={() => {
                setSpeakEnabled((prev) => !prev);
                window.speechSynthesis?.cancel();
              }}
            >
              {speakEnabled ? (
                <Volume2 className="size-4" />
              ) : (
                <VolumeX className="size-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        className="flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-6"
        style={{ maxHeight: 390 }}
        aria-live="polite"
      >
        {turns.map((turn, index) => {
          const isUser = turn.role === "user";

          return (
            <div
              key={`${turn.role}-${index}`}
              className={cn(
                "flex items-end gap-2.5",
                isUser ? "justify-end" : "justify-start",
              )}
            >
              {!isUser && (
                <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <Bot className="size-4" />
                </div>
              )}

              <div
                className={cn(
                  "max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
                  isUser
                    ? "rounded-br-md bg-brand text-primary-foreground"
                    : "rounded-bl-md border border-border/70 bg-background/60",
                )}
              >
                {turn.text}
              </div>
            </div>
          );
        })}

        {thinking && (
          <div className="flex items-end gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <Bot className="size-4" />
            </div>

            <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-border/70 bg-background/60 px-4 py-3 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              <span>Thinking…</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Disclaimer */}
      <div className="px-5 pb-2 text-[11px] leading-relaxed text-muted-foreground sm:px-6">
        LifeGuard AI provides general health information and is not a
        substitute for a doctor or emergency services. For severe or
        life-threatening symptoms, seek emergency medical help immediately.
      </div>

      {/* Input */}
      <form
        className="border-t border-border/60 p-4 sm:p-5"
        onSubmit={(event) => {
          event.preventDefault();
          void ask(value);
        }}
      >
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={toggleMic}
            disabled={thinking}
            aria-label={
              listening ? "Stop listening" : "Start voice input"
            }
            title={
              listening ? "Stop listening" : "Start voice input"
            }
            className={cn(
              "shrink-0 rounded-full",
              listening &&
                "animate-pulse-ring border-vital text-vital",
            )}
          >
            {listening ? (
              <MicOff className="size-4" />
            ) : (
              <Mic className="size-4" />
            )}
          </Button>

          <Input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            maxLength={300}
            disabled={thinking}
            placeholder={
              listening
                ? "Listening…"
                : "Ask about your health results"
            }
            className="min-w-0 rounded-full"
          />

          <Button
            type="submit"
            size="icon"
            disabled={thinking || !value.trim()}
            className="shrink-0 rounded-full bg-brand text-primary-foreground"
            aria-label="Send question"
          >
            {thinking ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </Button>
        </div>

        <p className="mt-2 text-center text-[10px] text-muted-foreground">
          {supported
            ? "You can type or use the microphone."
            : "Voice input is not available in this browser."}
        </p>
      </form>
    </GlassPanel>
  );
}
