import { useState, useCallback } from "react";
import { Copy, Check, RefreshCw } from "lucide-react";

const PasswordGenerator = () => {
  const [password, setPassword] = useState("");
  const [length, setLength] = useState(16);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [copied, setCopied] = useState(false);

  const generate = useCallback(() => {
    let chars = "";
    if (uppercase) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (lowercase) chars += "abcdefghijklmnopqrstuvwxyz";
    if (numbers) chars += "0123456789";
    if (symbols) chars += "!@#$%^&*()_+-=[]{}|;:,.<>?";
    if (!chars) return;
    const arr = new Uint32Array(length);
    crypto.getRandomValues(arr);
    setPassword(Array.from(arr, (n) => chars[n % chars.length]).join(""));
  }, [length, uppercase, lowercase, numbers, symbols]);

  const copy = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const strength = () => {
    let score = 0;
    if (length >= 12) score++;
    if (length >= 20) score++;
    if (uppercase && lowercase) score++;
    if (numbers) score++;
    if (symbols) score++;
    if (score <= 2) return { label: "Weak", color: "bg-destructive" };
    if (score <= 3) return { label: "Medium", color: "bg-yellow-500" };
    return { label: "Strong", color: "bg-primary" };
  };

  const s = strength();

  const Toggle = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) => (
    <label className="flex items-center gap-2 cursor-pointer">
      <div
        className={`w-10 h-5 rounded-full transition-colors relative ${checked ? "bg-primary" : "bg-muted"}`}
        onClick={() => onChange(!checked)}
      >
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-card shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
      </div>
      <span className="text-sm text-foreground">{label}</span>
    </label>
  );

  return (
    <div className="animate-fade-in">
      <h1 className="tool-title">Password Generator</h1>
      <p className="tool-description mb-6">Generate secure random passwords with custom rules.</p>

      <div className="tool-card space-y-5">
        {password && (
          <div className="flex items-center gap-2 rounded-lg bg-muted/50 border border-border p-4">
            <code className="flex-1 text-lg font-mono break-all text-foreground">{password}</code>
            <button onClick={copy} className="tool-btn-outline p-2">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        )}
        {password && (
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
              <div className={`h-full rounded-full transition-all ${s.color}`} style={{ width: s.label === "Weak" ? "33%" : s.label === "Medium" ? "66%" : "100%" }} />
            </div>
            <span className="text-xs font-medium text-muted-foreground">{s.label}</span>
          </div>
        )}

        <div>
          <label className="tool-label">Length: {length}</label>
          <input type="range" min={4} max={64} value={length} onChange={(e) => setLength(+e.target.value)} className="w-full accent-primary" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Toggle label="Uppercase (A-Z)" checked={uppercase} onChange={setUppercase} />
          <Toggle label="Lowercase (a-z)" checked={lowercase} onChange={setLowercase} />
          <Toggle label="Numbers (0-9)" checked={numbers} onChange={setNumbers} />
          <Toggle label="Symbols (!@#)" checked={symbols} onChange={setSymbols} />
        </div>

        <button className="tool-btn w-full" onClick={generate}>
          <RefreshCw className="w-4 h-4" /> Generate Password
        </button>
      </div>
    </div>
  );
};

export default PasswordGenerator;
