import { useState, useRef, useEffect } from "react";
import { Download } from "lucide-react";

const BarcodeGenerator = () => {
  const [text, setText] = useState("123456789012");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawBarcode = () => {
    const canvas = canvasRef.current;
    if (!canvas || !text.trim()) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Simple Code 128-like barcode rendering
    const data = text.trim();
    const barWidth = 2;
    const height = 100;
    const padding = 20;
    const totalWidth = padding * 2 + data.length * barWidth * 11 + barWidth * 13; // approx

    canvas.width = Math.max(totalWidth, 300);
    canvas.height = height + 40;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Generate pseudo-barcode from character codes
    let x = padding;
    // Start pattern
    const drawBar = (w: number, black: boolean) => {
      if (black) {
        ctx.fillStyle = "#000000";
        ctx.fillRect(x, 10, w, height);
      }
      x += w;
    };

    // Start bars
    drawBar(barWidth * 2, true);
    drawBar(barWidth, false);
    drawBar(barWidth, true);
    drawBar(barWidth, false);

    for (let i = 0; i < data.length; i++) {
      const code = data.charCodeAt(i);
      // Generate bar pattern from character code
      const pattern = code.toString(2).padStart(8, "0");
      for (const bit of pattern) {
        drawBar(barWidth, bit === "1");
      }
      drawBar(barWidth, false); // gap
    }

    // End bars
    drawBar(barWidth * 2, true);
    drawBar(barWidth, false);
    drawBar(barWidth, true);

    // Text label
    ctx.fillStyle = "#000000";
    ctx.font = "14px monospace";
    ctx.textAlign = "center";
    ctx.fillText(data, canvas.width / 2, height + 30);
  };

  useEffect(() => { drawBarcode(); }, [text]);

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `barcode-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="space-y-4">
      <h2 className="tool-title">Barcode Generator</h2>
      <p className="tool-description">Generate barcodes from text or numbers</p>

      <div>
        <label className="tool-label">Text / Number</label>
        <input type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="Enter text or number"
          className="tool-input" />
      </div>

      <div className="tool-card !p-4 flex justify-center">
        <canvas ref={canvasRef} className="max-w-full" />
      </div>

      <button onClick={download} className="tool-btn w-full"><Download className="w-4 h-4" /> Download PNG</button>
    </div>
  );
};

export default BarcodeGenerator;
