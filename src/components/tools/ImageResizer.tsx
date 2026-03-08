import { useState, useRef } from "react";
import { Upload, Download } from "lucide-react";
import { toast } from "sonner";

const ImageResizer = () => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [preview, setPreview] = useState("");
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [origW, setOrigW] = useState(0);
  const [origH, setOrigH] = useState(0);
  const [keepRatio, setKeepRatio] = useState(true);
  const [quality, setQuality] = useState(90);
  const [format, setFormat] = useState("image/jpeg");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      setImage(img);
      setOrigW(img.width);
      setOrigH(img.height);
      setWidth(img.width);
      setHeight(img.height);
      setPreview(img.src);
    };
    img.src = URL.createObjectURL(file);
  };

  const handleWidth = (w: number) => {
    setWidth(w);
    if (keepRatio && origW) setHeight(Math.round((w / origW) * origH));
  };

  const handleHeight = (h: number) => {
    setHeight(h);
    if (keepRatio && origH) setWidth(Math.round((h / origH) * origW));
  };

  const resize = () => {
    if (!image || !canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(image, 0, 0, width, height);
    toast.success("Image resized!");
  };

  const download = () => {
    if (!canvasRef.current) return;
    resize();
    setTimeout(() => {
      const link = document.createElement("a");
      const ext = format === "image/png" ? "png" : format === "image/webp" ? "webp" : "jpg";
      link.download = `resized-${width}x${height}.${ext}`;
      link.href = canvasRef.current!.toDataURL(format, quality / 100);
      link.click();
    }, 100);
  };

  return (
    <div className="space-y-4">
      <h2 className="tool-title">Image Resizer</h2>
      <p className="tool-description">Resize and convert images in your browser</p>

      <label className="tool-btn w-full cursor-pointer">
        <Upload className="w-4 h-4" /> Choose Image
        <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
      </label>

      {preview && (
        <>
          <div className="tool-card !p-3 flex justify-center">
            <img src={preview} alt="Preview" className="max-h-48 rounded-lg object-contain" />
          </div>

          <div className="text-xs text-muted-foreground text-center">
            Original: {origW} × {origH}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="tool-label">Width (px)</label>
              <input type="number" value={width} onChange={(e) => handleWidth(Number(e.target.value))} className="tool-input" />
            </div>
            <div>
              <label className="tool-label">Height (px)</label>
              <input type="number" value={height} onChange={(e) => handleHeight(Number(e.target.value))} className="tool-input" />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={keepRatio} onChange={(e) => setKeepRatio(e.target.checked)}
              className="rounded border-border" />
            Keep aspect ratio
          </label>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="tool-label">Format</label>
              <select value={format} onChange={(e) => setFormat(e.target.value)} className="tool-input">
                <option value="image/jpeg">JPEG</option>
                <option value="image/png">PNG</option>
                <option value="image/webp">WebP</option>
              </select>
            </div>
            <div>
              <label className="tool-label">Quality ({quality}%)</label>
              <input type="range" min={10} max={100} value={quality} onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full h-2 mt-3 rounded-full bg-muted appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary" />
            </div>
          </div>

          <button onClick={download} className="tool-btn w-full"><Download className="w-4 h-4" /> Resize & Download</button>
        </>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default ImageResizer;
