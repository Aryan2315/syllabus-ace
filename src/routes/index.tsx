import { createFileRoute } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import { SyllabusInput } from "@/components/SyllabusInput";
import { StudyGuideOutput } from "@/components/StudyGuideOutput";
import { GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "StudyForge — AI Study Guide Generator" },
      { name: "description", content: "Transform any syllabus into a structured study guide with AI-generated questions at Easy, Medium, and Hard levels." },
    ],
  }),
});

function Index() {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = useCallback(async (syllabus: string, subject: string) => {
    setContent("");
    setIsLoading(true);

    try {
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const resp = await fetch(`${SUPABASE_URL}/functions/v1/generate-study-guide`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({ syllabus, subject }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Failed to generate" }));
        toast.error(err.error || "Something went wrong");
        setIsLoading(false);
        return;
      }

      if (!resp.body) {
        toast.error("No response body");
        setIsLoading(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (delta) {
              accumulated += delta;
              setContent(accumulated);
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to connect. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
            <GraduationCap className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight font-display text-foreground">StudyForge</h1>
            <p className="text-xs text-muted-foreground">AI-Powered Study Guide Generator</p>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Input */}
          <section>
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h2 className="font-display text-lg font-semibold mb-4 text-foreground">
                Input Your Syllabus
              </h2>
              <SyllabusInput onGenerate={handleGenerate} isLoading={isLoading} />
            </div>
          </section>

          {/* Right: Output */}
          <section>
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm min-h-[500px]">
              <h2 className="font-display text-lg font-semibold mb-4 text-foreground">
                Generated Study Guide
              </h2>
              <StudyGuideOutput content={content} isLoading={isLoading} />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
