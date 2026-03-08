import { useState, useCallback } from "react";
import { ArrowRightLeft, Copy, Check } from "lucide-react";
import { toast } from "sonner";

type Format = "base16" | "base32" | "base64" | "base85" | "binary" | "url" | "decimal";

const FORMATS: { id: Format; label: string }[] = [
  { id: "base16", label: "Base16 (Hex)" },
  { id: "base32", label: "Base32" },
  { id: "base64", label: "Base64" },
  { id: "base85", label: "Base85 / Ascii85" },
  { id: "binary", label: "Binary" },
  { id: "url", label: "URL Encode" },
  { id: "decimal", label: "Decimal" },
];

// ─── Base32 ───
const B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
function base32Encode(buf: Uint8Array): string {
  let bits = 0, val = 0, out = "";
  for (const b of buf) {
    val = (val << 8) | b; bits += 8;
    while (bits >= 5) { bits -= 5; out += B32[(val >>> bits) & 31]; }
  }
  if (bits > 0) out += B32[(val << (5 - bits)) & 31];
  while (out.length % 8) out += "=";
  return out;
}
function base32Decode(s: string): Uint8Array {
  s = s.replace(/=+$/, "").toUpperCase();
  let bits = 0, val = 0; const bytes: number[] = [];
  for (const c of s) {
    const i = B32.indexOf(c); if (i < 0) continue;
    val = (val << 5) | i; bits += 5;
    if (bits >= 8) { bits -= 8; bytes.push((val >>> bits) & 255); }
  }
  return new Uint8Array(bytes);
}

// ─── Base85 / Ascii85 ───
function base85Encode(buf: Uint8Array): string {
  let out = "<~";
  for (let i = 0; i < buf.length; i += 4) {
    let val = 0;
    const chunk = Math.min(4, buf.length - i);
    for (let j = 0; j < 4; j++) val = (val * 256) + (j < chunk ? buf[i + j] : 0);
    if (chunk === 4 && val === 0) { out += "z"; continue; }
    const chars: string[] = [];
    for (let j = 4; j >= 0; j--) { chars[j] = String.fromCharCode(33 + (val % 85)); val = Math.floor(val / 85); }
    out += chars.slice(0, chunk + 1).join("");
  }
  return out + "~>";
}
function base85Decode(s: string): Uint8Array {
  s = s.replace(/^<~/, "").replace(/~>$/, "").replace(/\s/g, "");
  const bytes: number[] = [];
  let i = 0;
  while (i < s.length) {
    if (s[i] === "z") { bytes.push(0, 0, 0, 0); i++; continue; }
    const chunk: number[] = [];
    for (let j = 0; j < 5 && i < s.length; j++, i++) chunk.push(s.charCodeAt(i) - 33);
    while (chunk.length < 5) chunk.push(84); // pad with 'u'
    let val = 0;
    for (const c of chunk) val = val * 85 + c;
    const n = chunk.length < 5 ? chunk.length - 1 : 4;
    for (let j = 3; j >= 4 - n; j--) bytes.push((val >>> (j * 8)) & 255);
  }
  return new Uint8Array(bytes);
}

// ─── Encode/Decode dispatcher ───
function encode(input: string, fmt: Format): string {
  const buf = new TextEncoder().encode(input);
  switch (fmt) {
    case "base16": return Array.from(buf).map((b) => b.toString(16).padStart(2, "0")).join(" ").toUpperCase();
    case "base32": return base32Encode(buf);
    case "base64": return btoa(String.fromCharCode(...buf));
    case "base85": return base85Encode(buf);
    case "binary": return Array.from(buf).map((b) => b.toString(2).padStart(8, "0")).join(" ");
    case "url": return encodeURIComponent(input);
    case "decimal": return Array.from(buf).map((b) => b.toString(10)).join(" ");
  }
}

function decode(input: string, fmt: Format): string {
  try {
    switch (fmt) {
      case "base16": {
        const hex = input.replace(/\s+/g, "");
        const bytes = new Uint8Array(hex.match(/.{1,2}/g)?.map((h) => parseInt(h, 16)) || []);
        return new TextDecoder().decode(bytes);
      }
      case "base32": return new TextDecoder().decode(base32Decode(input));
      case "base64": {
        const bin = atob(input.trim());
        return bin;
      }
      case "base85": return new TextDecoder().decode(base85Decode(input));
      case "binary": {
        const bytes = input.trim().split(/\s+/).map((b) => parseInt(b, 2));
        return new TextDecoder().decode(new Uint8Array(bytes));
      }
      case "url": return decodeURIComponent(input);
      case "decimal": {
        const bytes = input.trim().split(/\s+/).map((d) => parseInt(d, 10));
        return new TextDecoder().decode(new Uint8Array(bytes));
      }
    }
  } catch {
    return "⚠ Invalid input for this format";
  }
}

const DataEncoder = () => {
  const [text, setText] = useState("");
  const [format, setFormat] = useState<Format>("base64");
  const [direction, setDirection] = useState<"encode" | "decode">("encode");
  const [copied, setCopied] = useState(false);

  const result = useCallback(() => {
    if (!text.trim()) return "";
    return direction === "encode" ? encode(text, format) : decode(text, format);
  }, [text, format, direction]);

  const output = result();

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    toast.success("Copied!");
    setTimeout(() => setCopied(false), 1500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setText(reader.result as string);
    reader.readAsText(file);
  };

  return (
    <div className="animate-fade-in space-y-4">
      <h1 className="tool-title">Data Encoder / Decoder</h1>
      <p className="tool-description">Encode or decode text & file data in multiple formats — all processed in your browser.</p>

      {/* Format selection */}
      <div className="flex flex-wrap gap-1.5">
        {FORMATS.map((f) => (
          <button key={f.id} onClick={() => setFormat(f.id)}
            className={format === f.id ? "tool-btn text-xs" : "tool-btn-outline text-xs"}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Direction toggle */}
      <div className="flex items-center gap-2">
        <button onClick={() => setDirection(direction === "encode" ? "decode" : "encode")}
          className="tool-btn-outline text-xs gap-1.5">
          <ArrowRightLeft className="w-3.5 h-3.5" />
          {direction === "encode" ? "Encode" : "Decode"}
        </button>
        <span className="text-xs text-muted-foreground">
          {direction === "encode" ? "Text → Encoded" : "Encoded → Text"}
        </span>
        <label className="ml-auto tool-btn-outline text-xs cursor-pointer">
          Upload File
          <input type="file" accept=".txt,.csv,.json,.xml,.html,.md,.log" className="hidden" onChange={handleFileUpload} />
        </label>
      </div>

      {/* Input */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">
          {direction === "encode" ? "Input Text" : `${FORMATS.find((f) => f.id === format)?.label} Input`}
        </label>
        <textarea className="tool-textarea font-mono min-h-[120px]" value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={direction === "encode" ? "Type or paste text here..." : "Paste encoded data here..."} />
      </div>

      {/* Output */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-medium text-muted-foreground">
            {direction === "encode" ? `${FORMATS.find((f) => f.id === format)?.label} Output` : "Decoded Text"}
          </label>
          {output && (
            <button onClick={handleCopy} className="tool-btn-outline text-[11px]">
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>
        <div className="tool-card !p-3 font-mono text-sm min-h-[80px] break-all whitespace-pre-wrap select-all">
          {output || <span className="text-muted-foreground">Output will appear here...</span>}
        </div>
      </div>
    </div>
  );
};

export default DataEncoder;
