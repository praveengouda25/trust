import { useMutation } from "@tanstack/react-query";
import { Sparkles, RefreshCw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

/** Reusable "ask the AI" panel used by the donation / expense / stock pages. */
export function AiInsightCard({
  title,
  description,
  run,
  cta = "Generate insights",
}: {
  title: string;
  description: string;
  run: () => Promise<{ text: string }>;
  cta?: string;
}) {
  const mut = useMutation({
    mutationFn: run,
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Sparkles className="h-4 w-4 text-accent" />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Button size="sm" variant="outline" disabled={mut.isPending} onClick={() => mut.mutate()}>
          {mut.isPending ? (
            <RefreshCw className="mr-1 h-3.5 w-3.5 animate-spin" />
          ) : (
            <Sparkles className="mr-1 h-3.5 w-3.5" />
          )}
          {mut.isPending ? "Analysing…" : mut.data ? "Refresh" : cta}
        </Button>
      </CardHeader>
      {mut.data ? (
        <CardContent>
          <div className="prose prose-sm max-w-none dark:prose-invert [&_li]:my-0.5 [&_p]:my-1 [&_strong]:text-foreground text-sm text-muted-foreground">
            <ReactMarkdown>{mut.data.text}</ReactMarkdown>
          </div>
        </CardContent>
      ) : null}
    </Card>
  );
}
