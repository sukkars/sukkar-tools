import { useState } from "react";
import { Copy, Check, RefreshCw } from "lucide-react";

const UuidGenerator = () => {
  const [uuids, setUuids] = useState<string[]>([]);
  const [count, setCount] = useState(5);
  const [copied, setCopied] = useState(-1);

  const generate = () => {
    setUuids(Array.from({ length: count }, () => crypto.randomUUID()));
  };

  const copy = (uuid: string, i: number) => {
    navigator.clipboard.writeText(uuid);
    setCopied(i);
    setTimeout(() => setCopied(-1), 1500);
  };

  const copyAll = () => {
    navigator.clipboard.writeText(uuids.join("\n"));
    setCopied(-2);
    setTimeout(() => setCopied(-1), 1500);
  };

  return (
    <div className="animate-fade-in">
      <h1 className="tool-title">UUID Generator</h1>
      <p className="tool-description mb-6">Generate random UUIDs (v4) for your projects.</p>

      <div className="tool-card space-y-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="tool-label">Count</label>
            <input type="number" min={1} max={50} value={count} onChange={(e) => setCount(+e.target.value)} className="tool-input w-24" />
          </div>
          <button className="tool-btn" onClick={generate}>
            <RefreshCw className="w-4 h-4" /> Generate
          </button>
          {uuids.length > 0 && (
            <button className="tool-btn-outline" onClick={copyAll}>
              {copied === -2 ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied === -2 ? "Copied All!" : "Copy All"}
            </button>
          )}
        </div>

        {uuids.length > 0 && (
          <div className="space-y-2">
            {uuids.map((uuid, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg bg-muted/30 border border-border px-4 py-2">
                <code className="flex-1 font-mono text-sm text-foreground">{uuid}</code>
                <button onClick={() => copy(uuid, i)} className="text-muted-foreground hover:text-foreground">
                  {copied === i ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UuidGenerator;
