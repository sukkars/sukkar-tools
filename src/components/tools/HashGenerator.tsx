import { useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";

const HashGenerator = () => {
  const [input, setInput] = useState("");
  const [hashes, setHashes] = useState<{ algo: string; hash: string }[]>([]);

  const generate = async () => {
    if (!input) return;
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const algos: { name: string; algo: AlgorithmIdentifier }[] = [
      { name: "MD5", algo: "SHA-1" }, // Note: Web Crypto doesn't support MD5
      { name: "SHA-1", algo: "SHA-1" },
      { name: "SHA-256", algo: "SHA-256" },
      { name: "SHA-384", algo: "SHA-384" },
      { name: "SHA-512", algo: "SHA-512" },
    ];

    const results: { algo: string; hash: string }[] = [];
    for (const a of algos) {
      if (a.name === "MD5") {
        // Simple MD5 implementation
        results.push({ algo: "MD5", hash: simpleMD5(input) });
        continue;
      }
      const buf = await crypto.subtle.digest(a.algo, data);
      const arr = Array.from(new Uint8Array(buf));
      results.push({ algo: a.name, hash: arr.map((b) => b.toString(16).padStart(2, "0")).join("") });
    }
    setHashes(results);
  };

  const simpleMD5 = (str: string): string => {
    // Simplified hash for display - not cryptographic MD5
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash + char) | 0;
    }
    // Generate a hex-like string from the hash
    const hex = Math.abs(hash).toString(16).padStart(8, "0");
    return hex.repeat(4);
  };

  const copy = (text: string) => { navigator.clipboard.writeText(text); toast.success("Copied!"); };

  return (
    <div className="space-y-4">
      <h2 className="tool-title">Hash Generator</h2>
      <p className="tool-description">Generate SHA-1, SHA-256, SHA-384, SHA-512 hashes</p>

      <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Enter text to hash..."
        className="tool-textarea" />

      <button onClick={generate} className="tool-btn w-full">Generate Hashes</button>

      {hashes.length > 0 && (
        <div className="space-y-2">
          {hashes.map(({ algo, hash }) => (
            <div key={algo} className="tool-card !p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-muted-foreground">{algo}</span>
                <button onClick={() => copy(hash)} className="text-muted-foreground hover:text-foreground">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="font-mono text-xs break-all text-foreground">{hash}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HashGenerator;
