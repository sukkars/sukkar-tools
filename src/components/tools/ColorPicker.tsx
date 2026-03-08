import { useState, useEffect } from "react";
import { Copy, Check } from "lucide-react";

const ColorPicker = () => {
  const [hex, setHex] = useState("#2a9d8f");
  const [copied, setCopied] = useState("");

  const hexToRgb = (h: string) => {
    const r = parseInt(h.slice(1, 3), 16);
    const g = parseInt(h.slice(3, 5), 16);
    const b = parseInt(h.slice(5, 7), 16);
    return { r, g, b };
  };

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s: number;
    const l = (max + min) / 2;
    if (max === min) { h = s = 0; } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  };

  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  const formats = [
    { label: "HEX", value: hex.toUpperCase() },
    { label: "RGB", value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
    { label: "HSL", value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
  ];

  const copy = (val: string, label: string) => {
    navigator.clipboard.writeText(val);
    setCopied(label);
    setTimeout(() => setCopied(""), 1500);
  };

  return (
    <div className="animate-fade-in">
      <h1 className="tool-title">Color Picker & Converter</h1>
      <p className="tool-description mb-6">Pick a color and get HEX, RGB, and HSL values.</p>

      <div className="tool-card space-y-6">
        <div className="flex items-center gap-4">
          <input
            type="color"
            value={hex}
            onChange={(e) => setHex(e.target.value)}
            className="w-20 h-20 rounded-xl cursor-pointer border-2 border-border"
          />
          <div className="flex-1 h-20 rounded-xl border border-border" style={{ backgroundColor: hex }} />
        </div>

        <div className="space-y-3">
          {formats.map((f) => (
            <div key={f.label} className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
              <span className="text-xs font-medium text-muted-foreground w-10">{f.label}</span>
              <code className="flex-1 font-mono text-sm text-foreground">{f.value}</code>
              <button onClick={() => copy(f.value, f.label)} className="text-muted-foreground hover:text-foreground">
                {copied === f.label ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ColorPicker;
