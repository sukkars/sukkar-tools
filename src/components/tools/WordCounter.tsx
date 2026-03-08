import { useState, useMemo } from "react";

const WordCounter = () => {
  const [text, setText] = useState("");

  const stats = useMemo(() => {
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, "").length;
    const sentences = trimmed ? (trimmed.match(/[.!?]+/g) || []).length || (trimmed.length > 0 ? 1 : 0) : 0;
    const paragraphs = trimmed ? trimmed.split(/\n\s*\n/).filter(Boolean).length || (trimmed.length > 0 ? 1 : 0) : 0;
    const readingTime = Math.ceil(words / 200);
    const speakingTime = Math.ceil(words / 130);
    return { words, chars, charsNoSpace, sentences, paragraphs, readingTime, speakingTime };
  }, [text]);

  const StatCard = ({ label, value }: { label: string; value: number | string }) => (
    <div className="rounded-lg border border-border bg-muted/30 p-4 text-center">
      <div className="text-2xl font-bold text-primary">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <h1 className="tool-title">Word & Character Counter</h1>
      <p className="tool-description mb-6">Get detailed text statistics in real time.</p>

      <div className="tool-card space-y-4">
        <textarea
          className="tool-textarea min-h-[200px]"
          placeholder="Start typing or paste your text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Words" value={stats.words} />
          <StatCard label="Characters" value={stats.chars} />
          <StatCard label="No Spaces" value={stats.charsNoSpace} />
          <StatCard label="Sentences" value={stats.sentences} />
          <StatCard label="Paragraphs" value={stats.paragraphs} />
          <StatCard label="Read Time" value={`${stats.readingTime}m`} />
          <StatCard label="Speak Time" value={`${stats.speakingTime}m`} />
        </div>
      </div>
    </div>
  );
};

export default WordCounter;
