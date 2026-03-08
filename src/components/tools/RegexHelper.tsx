import { useState, useMemo } from "react";
import { Copy, Check, AlertCircle, Wand2 } from "lucide-react";
import { toast } from "sonner";


const COMMON_PATTERNS = [
  { label: "Email", pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}", desc: "Matches email addresses" },
  { label: "URL", pattern: "https?:\\/\\/[\\w\\-]+(\\.[\\w\\-]+)+[\\/\\w\\-.~:?#\\[\\]@!$&'()*+,;=%]*", desc: "Matches HTTP/HTTPS URLs" },
  { label: "Phone (US)", pattern: "\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}", desc: "US phone numbers" },
  { label: "IPv4", pattern: "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b", desc: "IPv4 addresses" },
  { label: "Date (YYYY-MM-DD)", pattern: "\\d{4}-\\d{2}-\\d{2}", desc: "ISO date format" },
  { label: "Hex Color", pattern: "#[0-9a-fA-F]{3,8}", desc: "Hex color codes" },
  { label: "HTML Tag", pattern: "<\\/?[a-zA-Z][^>]*>", desc: "HTML tags" },
  { label: "Digits Only", pattern: "^\\d+$", desc: "Only digits" },
  { label: "Alphanumeric", pattern: "^[a-zA-Z0-9]+$", desc: "Letters and numbers only" },
  { label: "Password (Strong)", pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$", desc: "Min 8 chars, upper, lower, digit, special" },
];

const RegexHelper = () => {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState("g");
  const [testText, setTestText] = useState("Hello world!\nEmail: user@example.com\nURL: https://example.com\nPhone: (555) 123-4567\nDate: 2024-03-15\nIP: 192.168.1.1");
  const [copied, setCopied] = useState(false);
  const [replaceWith, setReplaceWith] = useState("");
  const [showReplace, setShowReplace] = useState(false);

  const regexResult = useMemo(() => {
    if (!pattern) return { valid: true, matches: [], highlighted: testText, replaced: testText, error: "" };
    try {
      const regex = new RegExp(pattern, flags);
      const matches: { match: string; index: number; groups?: Record<string, string> }[] = [];

      if (flags.includes("g")) {
        let m;
        const r = new RegExp(pattern, flags);
        while ((m = r.exec(testText)) !== null) {
          matches.push({ match: m[0], index: m.index, groups: m.groups });
          if (!m[0]) break; // prevent infinite loop on zero-width
        }
      } else {
        const m = regex.exec(testText);
        if (m) matches.push({ match: m[0], index: m.index, groups: m.groups });
      }

      // Highlight
      let highlighted = testText;
      try {
        highlighted = testText.replace(new RegExp(pattern, flags), (match) =>
          `<mark class="bg-primary/30 text-foreground rounded px-0.5">${match}</mark>`
        );
      } catch {}

      const replaced = replaceWith ? testText.replace(new RegExp(pattern, flags), replaceWith) : testText;

      return { valid: true, matches, highlighted, replaced, error: "" };
    } catch (e: any) {
      return { valid: false, matches: [], highlighted: testText, replaced: testText, error: e.message };
    }
  }, [pattern, flags, testText, replaceWith]);

  const copyPattern = () => {
    navigator.clipboard.writeText(`/${pattern}/${flags}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    toast.success("Copied!");
  };

  const toggleFlag = (flag: string) => {
    setFlags((f) => f.includes(flag) ? f.replace(flag, "") : f + flag);
  };

  return (
    <div className="space-y-4">
      <h2 className="tool-title">Regex Helper</h2>
      <p className="tool-description">Test, build, and debug regular expressions</p>
      {/* Pattern input */}
      <div className="tool-card !p-4 space-y-3">
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="tool-label">Pattern</label>
            <div className="flex items-center gap-0 rounded-lg border border-input bg-muted/50 overflow-hidden">
              <span className="text-muted-foreground px-3 text-lg font-mono">/</span>
              <input value={pattern} onChange={(e) => setPattern(e.target.value)}
                placeholder="Enter regex pattern..."
                className="flex-1 bg-transparent py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none" />
              <span className="text-muted-foreground px-1 text-lg font-mono">/</span>
              <span className="text-primary font-mono font-semibold pr-3">{flags}</span>
            </div>
          </div>
          <button onClick={copyPattern} disabled={!pattern} className="tool-btn-outline h-[42px] disabled:opacity-40">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {/* Flags */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">Flags:</span>
          {[
            { flag: "g", label: "Global" },
            { flag: "i", label: "Case insensitive" },
            { flag: "m", label: "Multiline" },
            { flag: "s", label: "Dotall" },
          ].map(({ flag, label }) => (
            <button key={flag} onClick={() => toggleFlag(flag)}
              className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium transition-colors ${
                flags.includes(flag) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
              }`} title={label}>
              {flag}
            </button>
          ))}
        </div>

        {!regexResult.valid && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="w-4 h-4" /> {regexResult.error}
          </div>
        )}
      </div>

      {/* Common patterns */}
      <div>
        <label className="tool-label">Common Patterns</label>
        <div className="flex flex-wrap gap-1.5">
          {COMMON_PATTERNS.map((p) => (
            <button key={p.label} onClick={() => setPattern(p.pattern)} title={p.desc}
              className="px-2.5 py-1 rounded-lg text-xs bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors">
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Test text */}
      <div>
        <label className="tool-label">Test String</label>
        <textarea value={testText} onChange={(e) => setTestText(e.target.value)}
          className="tool-textarea min-h-[120px]" />
      </div>

      {/* Replace */}
      <div>
        <button onClick={() => setShowReplace(!showReplace)} className="text-xs text-primary hover:underline mb-1">
          {showReplace ? "Hide" : "Show"} Replace
        </button>
        {showReplace && (
          <input value={replaceWith} onChange={(e) => setReplaceWith(e.target.value)}
            placeholder="Replace with..." className="tool-input font-mono" />
        )}
      </div>

      {/* Results */}
      {pattern && regexResult.valid && (
        <div className="space-y-3">
          {/* Highlighted preview */}
          <div className="tool-card !p-4">
            <label className="tool-label">Matches ({regexResult.matches.length})</label>
            <div className="font-mono text-sm whitespace-pre-wrap break-all leading-relaxed"
              dangerouslySetInnerHTML={{ __html: regexResult.highlighted }} />
          </div>

          {/* Match details */}
          {regexResult.matches.length > 0 && (
            <div className="tool-card !p-3 max-h-48 overflow-y-auto space-y-1">
              {regexResult.matches.map((m, i) => (
                <div key={i} className="flex items-center gap-3 text-xs font-mono py-1 border-b border-border last:border-0">
                  <span className="text-muted-foreground w-6">#{i + 1}</span>
                  <span className="text-primary font-medium flex-1 break-all">"{m.match}"</span>
                  <span className="text-muted-foreground">@{m.index}</span>
                </div>
              ))}
            </div>
          )}

          {/* Replace result */}
          {showReplace && replaceWith && (
            <div className="tool-card !p-4">
              <label className="tool-label">Replace Result</label>
              <div className="font-mono text-sm whitespace-pre-wrap break-all">{regexResult.replaced}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RegexHelper;
