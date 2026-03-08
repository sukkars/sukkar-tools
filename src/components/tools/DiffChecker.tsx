import { useState } from "react";

interface DiffPart { type: "equal" | "add" | "remove"; text: string; }

function computeDiff(a: string, b: string): DiffPart[] {
  const linesA = a.split("\n");
  const linesB = b.split("\n");
  const parts: DiffPart[] = [];
  const maxLen = Math.max(linesA.length, linesB.length);

  for (let i = 0; i < maxLen; i++) {
    const lineA = linesA[i];
    const lineB = linesB[i];
    if (lineA === lineB) {
      if (lineA !== undefined) parts.push({ type: "equal", text: lineA });
    } else {
      if (lineA !== undefined) parts.push({ type: "remove", text: lineA });
      if (lineB !== undefined) parts.push({ type: "add", text: lineB });
    }
  }
  return parts;
}

const DiffChecker = () => {
  const [textA, setTextA] = useState("");
  const [textB, setTextB] = useState("");
  const [diff, setDiff] = useState<DiffPart[]>([]);

  const compare = () => setDiff(computeDiff(textA, textB));

  return (
    <div className="space-y-4">
      <h2 className="tool-title">Diff Checker</h2>
      <p className="tool-description">Compare two texts and see differences line by line</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="tool-label">Original</label>
          <textarea value={textA} onChange={(e) => setTextA(e.target.value)} placeholder="Paste original text..."
            className="tool-textarea min-h-[200px]" />
        </div>
        <div>
          <label className="tool-label">Modified</label>
          <textarea value={textB} onChange={(e) => setTextB(e.target.value)} placeholder="Paste modified text..."
            className="tool-textarea min-h-[200px]" />
        </div>
      </div>

      <button onClick={compare} className="tool-btn w-full">Compare</button>

      {diff.length > 0 && (
        <div className="tool-card !p-4 font-mono text-sm space-y-0.5 max-h-[400px] overflow-y-auto">
          {diff.map((part, i) => (
            <div key={i} className={`px-3 py-1 rounded ${
              part.type === "add" ? "bg-green-500/10 text-green-600 dark:text-green-400" :
              part.type === "remove" ? "bg-red-500/10 text-red-600 dark:text-red-400 line-through" :
              "text-muted-foreground"
            }`}>
              <span className="inline-block w-6 opacity-50">
                {part.type === "add" ? "+" : part.type === "remove" ? "−" : " "}
              </span>
              {part.text || " "}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DiffChecker;
