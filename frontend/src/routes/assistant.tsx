import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { GlassPanel } from "@/components/glass-panel";
import { VoiceAssistant } from "@/components/dashboard/voice-assistant";
import { useHealthStore } from "@/lib/health-store";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "AI Health Assistant — LifeGuard AI" },
      {
        name: "description",
        content:
          "Chat or speak with the LifeGuard AI health assistant to ask health questions and have your risk predictions explained.",
      },
      { property: "og:title", content: "AI Health Assistant — LifeGuard AI" },
      {
        property: "og:description",
        content: "Chatbot and voice support that explains your health results.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AssistantPage,
});


const PROMPTS = [
  "Explain my BMI in simple terms",
  "Which risk should I fix first?",
  "How much sleep do I actually need?",
  "Turn my plan into a weekly schedule",
];



async function askAssistant(question: string) {
  try {
    const response = await fetch(
      "http://127.0.0.1:8000/assistant/chat",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question,
        }),
      }
    );


    const data = await response.json();

    return data.answer;

  } catch (error) {

    console.error(
      "Assistant API error:",
      error
    );

    return "Unable to connect with LifeGuard AI assistant.";
  }
}



function AssistantPage() {

  const { result } = useHealthStore();


  return (
    <AppShell
      title="AI health assistant"
      description="Type or speak your question. The assistant reads your health questions and provides guidance."
    >

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,340px)]">


        <VoiceAssistant
          result={result}
          onAsk={askAssistant}
        />


        <div className="space-y-6">


          <GlassPanel className="p-6">

            <h2 className="text-lg font-bold">
              Try asking
            </h2>


            <ul className="mt-4 space-y-2">

              {PROMPTS.map((prompt) => (

                <li
                  key={prompt}
                  className="rounded-xl border border-border/70 bg-background/45 px-3 py-2 text-sm"
                >
                  “{prompt}”
                </li>

              ))}

            </ul>

          </GlassPanel>



          <GlassPanel className="p-6">

            <h2 className="text-lg font-bold">
              Voice support
            </h2>


            <p className="mt-2 text-sm text-muted-foreground">

              Tap the microphone to dictate a question — replies are read back aloud.
              Voice input requires a browser with the Web Speech API (Chrome, Edge, Safari).

            </p>

          </GlassPanel>



          <GlassPanel className="p-6">

            <h2 className="text-lg font-bold">
              Boundaries
            </h2>


            <p className="mt-2 text-sm text-muted-foreground">

              The assistant provides general health guidance and explains health information.
              It does not replace professional medical advice or emergency services.

            </p>

          </GlassPanel>


        </div>

      </div>

    </AppShell>
  );
}