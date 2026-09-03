import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Send, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/data/states";
import { useSession } from "@/hooks/use-session";
import { askAssistant } from "@/lib/ai.functions";

export const Route = createFileRoute("/_authenticated/assistant")({
  head: () => ({
    meta: [
      { title: "AI assistant | VISTARX Hostel360" },
      {
        name: "description",
        content:
          "Ask the operations assistant about students, occupancy, donations, expenses, stock and open issues in your branch.",
      },
      { property: "og:title", content: "AI assistant | VISTARX Hostel360" },
      {
        property: "og:description",
        content:
          "Ask about students, occupancy, donations, expenses, stock and open issues in your branch.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AssistantPage,
});

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "How many students are active right now?",
  "Which inventory items are below their minimum?",
  "Summarise donations received this month.",
  "What are the highest-priority open issues?",
];

function AssistantPage() {
  const { branchId } = useSession();
  const ask = useServerFn(askAssistant);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const mut = useMutation({
    mutationFn: (history: Msg[]) => ask({ data: { branchId, messages: history } }),
    onSuccess: (res) => setMessages((m) => [...m, { role: "assistant", content: res.text }]),
    onError: (e: Error) => toast.error(e.message),
  });

  function send(text: string) {
    const value = text.trim();
    if (!value || mut.isPending) return;
    const next: Msg[] = [...messages, { role: "user", content: value }];
    setMessages(next);
    setInput("");
    mut.mutate(next);
  }

  return (
    <>
      <PageHeader
        title="AI assistant"
        description="Answers come from the live data of the branch you have selected."
      />

      <Card className="flex h-[calc(100vh-16rem)] flex-col">
        <CardContent className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="space-y-3 py-8 text-center">
              <Sparkles className="mx-auto h-8 w-8 text-accent" />
              <p className="text-sm text-muted-foreground">
                Ask anything about this branch — occupancy, students, money, stock or issues.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <Button key={s} size="sm" variant="outline" onClick={() => send(s)}>
                    {s}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, i) => (
              <div
                key={i}
                className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
              >
                <div
                  className={
                    m.role === "user"
                      ? "max-w-[80%] rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground"
                      : "max-w-[85%] rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm"
                  }
                >
                  {m.role === "user" ? (
                    m.content
                  ) : (
                    <div className="prose prose-sm max-w-none dark:prose-invert [&_li]:my-0.5 [&_p]:my-1">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {mut.isPending ? <p className="text-sm text-muted-foreground">Thinking…</p> : null}
          <div ref={endRef} />
        </CardContent>

        <form
          className="flex gap-2 border-t border-border p-3"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your hostel operations…"
            aria-label="Message the assistant"
          />
          <Button type="submit" disabled={!input.trim() || mut.isPending}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </Card>
    </>
  );
}
