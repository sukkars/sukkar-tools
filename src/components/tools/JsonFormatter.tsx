import { useState } from "react";
import { Copy, Check } from "lucide-react";

const JsonFormatter = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const format = () => {
    try {
      setOutput(JSON.stringify(JSON.parse(input), null, 2));
      setError("");
    } catch (e: any) {
      setError(e.message);
      setOutput("");
    }
  };

  const minify = () => {
    try {
      setOutput(JSON.stringify(JSON.parse(input)));
      setError("");
    } catch (e: any) {
      setError(e.message);
      setOutput("");
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="animate-fade-in">
      <h1 className="tool-title">JSON Formatter</h1>
      <p className="tool-description mb-6">Prettify or minify JSON data with validation.</p>

      <div className="tool-card space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="tool-label">Input</label>
            <textarea
              className="tool-textarea min-h-[300px]"
              placeholder='{"key": "value"}'
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-foreground">Output</label>
              {output && (
                <button onClick={copy} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              )}
            </div>
            <textarea
              className="tool-textarea min-h-[300px]"
              readOnly
              value={output}
              placeholder="Formatted output will appear here..."
            />
          </div>
        </div>
        {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}
        <div className="flex gap-2">
          <button className="tool-btn" onClick={format}>Prettify</button>
          <button className="tool-btn-outline" onClick={minify}>Minify</button>
        </div>
      </div>
    </div>
  );
};

export default JsonFormatter;
