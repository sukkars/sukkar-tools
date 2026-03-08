import { useState } from "react";
import { Copy, Check } from "lucide-react";

const TextCaseConverter = () => {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);

  const convert = (fn: (s: string) => string) => setInput(fn(input));

  const toTitleCase = (s: string) =>
    s.replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.substr(1).toLowerCase());

  const toSentenceCase = (s: string) =>
    s.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());

  const toggleCase = (s: string) =>
    s.split("").map((c) => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase())).join("");

  const copyToClipboard = () => {
    navigator.clipboard.writeText(input);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="animate-fade-in">
      <h1 className="tool-title">Text Case Converter</h1>
      <p className="tool-description mb-6">Transform your text to any case format instantly.</p>

      <div className="tool-card space-y-4">
        <textarea
          className="tool-textarea min-h-[200px]"
          placeholder="Type or paste your text here..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          <button className="tool-btn" onClick={() => convert((s) => s.toUpperCase())}>UPPERCASE</button>
          <button className="tool-btn" onClick={() => convert((s) => s.toLowerCase())}>lowercase</button>
          <button className="tool-btn" onClick={() => convert(toTitleCase)}>Title Case</button>
          <button className="tool-btn" onClick={() => convert(toSentenceCase)}>Sentence case</button>
          <button className="tool-btn" onClick={() => convert(toggleCase)}>tOGGLE cASE</button>
          <button className="tool-btn-outline" onClick={copyToClipboard}>
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied!" : "Copy"}
          </button>
          <button className="tool-btn-outline" onClick={() => setInput("")}>Clear</button>
        </div>
      </div>
    </div>
  );
};

export default TextCaseConverter;
