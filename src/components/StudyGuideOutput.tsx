import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { BookOpen, Loader2 } from "lucide-react";

interface StudyGuideOutputProps {
  content: string;
  isLoading: boolean;
}

export function StudyGuideOutput({ content, isLoading }: StudyGuideOutputProps) {
  if (!content && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <BookOpen className="h-12 w-12 mb-4 opacity-40" />
        <p className="font-display text-lg">Your study guide will appear here</p>
        <p className="text-sm mt-1">Paste your syllabus and hit generate</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isLoading && !content && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 font-display text-lg text-muted-foreground">
            Generating your study guide...
          </span>
        </div>
      )}
      {content && (
        <div className="prose-study">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
      )}
      {isLoading && content && (
        <div className="flex items-center gap-2 text-primary py-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Still generating...</span>
        </div>
      )}
    </div>
  );
}
