import { useState, useRef, useCallback } from "react";
import { Copy, Check, Upload, X, Pipette } from "lucide-react";

const ColorPicker = () => {
  const [hex, setHex] = useState("#2a9d8f");
  const [copied, setCopied] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [pickMode, setPickMode] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

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

  const rgbToHex = (r: number, g: number, b: number) =>
    "#" + [r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("");

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      setImage(url);
      drawImageToCanvas(img);
    };
    img.src = url;
  };

  const drawImageToCanvas = (img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const maxW = canvas.parentElement?.clientWidth || 600;
    const scale = Math.min(maxW / img.width, 400 / img.height, 1);
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;
    const ctx = canvas.getContext("2d");
    ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
  };

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) * (canvas.width / rect.width));
    const y = Math.round((e.clientY - rect.top) * (canvas.height / rect.height));
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    setHex(rgbToHex(pixel[0], pixel[1], pixel[2]));
  }, []);

  const clearImage = () => {
    if (image) URL.revokeObjectURL(image);
    setImage(null);
    imgRef.current = null;
  };

  return (
    <div className="animate-fade-in">
      <h1 className="tool-title">Color Picker & Converter</h1>
      <p className="tool-description mb-6">Pick a color, or upload an image to extract colors from it.</p>

      <div className="tool-card space-y-6">
        <div className="flex items-center gap-4">
          <input type="color" value={hex} onChange={(e) => setHex(e.target.value)}
            className="w-20 h-20 rounded-xl cursor-pointer border-2 border-border" />
          <div className="flex-1 h-20 rounded-xl border border-border" style={{ backgroundColor: hex }} />
        </div>

        {/* Image picker */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <label className="tool-btn-outline flex-1 cursor-pointer text-center">
              <Upload className="w-4 h-4" /> Upload Image to Pick Color
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
            {image && (
              <button onClick={clearImage} className="tool-btn-outline !px-3" title="Remove image">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {image && (
            <div className="relative border border-border rounded-xl overflow-hidden">
              <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 bg-background/80 backdrop-blur-sm text-xs px-2.5 py-1.5 rounded-lg border border-border">
                <Pipette className="w-3.5 h-3.5 text-primary" />
                Click image to pick a color
              </div>
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                className="w-full cursor-crosshair"
              />
            </div>
          )}
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
