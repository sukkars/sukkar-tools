import { useState } from "react";
import { Copy, Check } from "lucide-react";

const Base64Tool = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const encode = () => {
    try {
      setOutput(btoa(unescape(encodeURIComponent(input))));
      setError("");
    } catch { setError("Failed to encode"); }
  };

  const decode = () => {
    try {
      setOutput(decodeURIComponent(escape(atob(input))));
      setError("");
    } catch { setError("Invalid Base64 string"); }
  };

  const copy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="animate-fade-in">
      <h1 className="tool-title">Base64 Encoder / Decoder</h1>
      <p className="tool-description mb-6">Encode text to Base64 or decode Base64 to text.</p>

      <div className="tool-card space-y-4">
        <div>
          <label className="tool-label">Input</label>
          <textarea className="tool-textarea" placeholder="Enter text or Base64 string..." value={input} onChange={(e) => setInput(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <button className="tool-btn" onClick={encode}>Encode</button>
          <button className="tool-btn-outline" onClick={decode}>Decode</button>
        </div>
        {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}
        {output && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-foreground">Output</label>
              <button onClick={copy} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <textarea className="tool-textarea" readOnly value={output} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Base64Tool;
