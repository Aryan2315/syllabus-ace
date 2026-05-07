import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Sparkles, FileText, X } from "lucide-react";

interface SyllabusInputProps {
  onGenerate: (syllabus: string, subject: string) => void;
  isLoading: boolean;
}

export function SyllabusInput({ onGenerate, isLoading }: SyllabusInputProps) {
  const [syllabus, setSyllabus] = useState("");
  const [subject, setSubject] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsParsing(true);

    if (file.type === "text/plain" || file.name.endsWith(".txt") || file.name.endsWith(".md")) {
      const text = await file.text();
      setSyllabus(text);
      setIsParsing(false);
      return;
    }

    if (file.type === "application/pdf") {
      // For PDF, we read as text (basic extraction) — the AI will handle messy text
      const text = await file.text();
      setSyllabus(`[PDF content from ${file.name}]\n\n${text}`);
      setIsParsing(false);
      return;
    }

    // Fallback: read as text
    const text = await file.text();
    setSyllabus(text);
    setIsParsing(false);
  };

  const clearFile = () => {
    setFileName(null);
    setSyllabus("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!syllabus.trim()) return;
    onGenerate(syllabus, subject);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium mb-1.5 text-foreground">
          Subject
        </label>
        <Input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g., Data Structures, Neural Networks, Linear Algebra"
          className="bg-card border-border font-body"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5 text-foreground">
          Syllabus
        </label>
        <Textarea
          value={syllabus}
          onChange={(e) => setSyllabus(e.target.value)}
          placeholder="Paste your syllabus content here..."
          rows={10}
          className="bg-card border-border font-body resize-y min-h-[200px]"
        />
      </div>

      <div className="flex items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,.md,.doc,.docx"
          onChange={handleFileUpload}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isParsing}
          className="gap-2"
        >
          <Upload className="h-4 w-4" />
          Upload File
        </Button>
        {fileName && (
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground bg-muted px-3 py-1.5 rounded-md">
            <FileText className="h-3.5 w-3.5" />
            {fileName}
            <button type="button" onClick={clearFile} className="ml-1 hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        )}
      </div>

      <Button
        type="submit"
        disabled={!syllabus.trim() || isLoading}
        className="w-full gap-2 h-12 text-base font-medium bg-primary text-primary-foreground hover:bg-primary/90"
      >
        <Sparkles className="h-5 w-5" />
        {isLoading ? "Generating..." : "Generate Study Guide"}
      </Button>
    </form>
  );
}
