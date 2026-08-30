import { useEffect, useRef, useState } from "react";
import { Loader2, Mic, MicOff, Send, Volume2, VolumeX } from "lucide-react";
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

export function VoiceAssistant({ result }: { result: AnalysisResult | null }) {
  const [turns, setTurns] = useState<Turn[]>([
    { role: "assistant", text: "Hi, I'm your LifeGuard voice assistant. Ask about your BMI, risks or next steps." },
  ]);
  const [value, setValue] = useState("");
  const [listening, setListening] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [speakEnabled, setSpeakEnabled] = useState(true);
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const w = window as any;
    const Recognition = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Recognition) return;
    setSupported(true);
    const recognition = new Recognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript as string;
      setListening(false);
      void ask(transcript);
    };
    recognition.onerror = () => {
      setListening(false);
      toast.error("Microphone unavailable — type your question instead.");
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    return () => recognition.abort?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function speak(text: string) {
    if (!speakEnabled || typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.02;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }

  async function ask(question: string) {
    if (!question.trim() || thinking) return;
    setTurns((prev) => [...prev, { role: "user", text: question }]);
    setValue("");
    setThinking(true);
    try {
      const answer = await apiAskAssistant(question, result);
      setTurns((prev) => [...prev, { role: "assistant", text: answer }]);
      speak(answer);
    } catch {
      toast.error("The assistant is unavailable right now.");
    } finally {
      setThinking(false);
    }
  }

  function toggleMic() {
    if (!supported) {
      toast.error("Voice input isn't supported in this browser — type instead.");
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
    }
  }

  return (
    <GlassPanel className="flex flex-col p-6">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-xl font-bold">Voice assistant</h3>
          <p className="truncate text-sm text-muted-foreground">Speak or type — answers read aloud</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 rounded-full"
          aria-label={speakEnabled ? "Mute spoken replies" : "Unmute spoken replies"}
          onClick={() => {
            setSpeakEnabled((prev) => !prev);
            window.speechSynthesis?.cancel();
          }}
        >
          {speakEnabled ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
        </Button>
      </div>

      <div className="mt-5 flex-1 space-y-3 overflow-y-auto pr-1" style={{ maxHeight: 300 }}>
        {turns.map((turn, index) => (
          <div
            key={index}
            className={cn(
              "max-w-[88%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
              turn.role === "user"
                ? "ml-auto bg-brand text-primary-foreground"
                : "border border-border/70 bg-background/50",
            )}
          >
            {turn.text}
          </div>
        ))}
        {thinking ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Thinking…
          </div>
        ) : null}
      </div>

      <form
        className="mt-5 flex items-center gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          void ask(value);
        }}
      >
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={toggleMic}
          aria-label={listening ? "Stop listening" : "Start voice input"}
          className={cn("shrink-0 rounded-full", listening && "animate-pulse-ring border-vital text-vital")}
        >
          {listening ? <MicOff className="size-4" /> : <Mic className="size-4" />}
        </Button>
        <Input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          maxLength={300}
          placeholder={listening ? "Listening…" : "Ask about your results"}
        />
        <Button type="submit" size="icon" disabled={thinking} className="shrink-0 rounded-full bg-brand text-primary-foreground">
          <Send className="size-4" />
        </Button>
      </form>
    </GlassPanel>
  );
}

