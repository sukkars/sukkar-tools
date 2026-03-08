import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Download } from "lucide-react";

const QrCodeGenerator = () => {
  const [text, setText] = useState("");
  const [size, setSize] = useState(256);
  const [fg, setFg] = useState("#000000");
  const [bg, setBg] = useState("#ffffff");

  const download = () => {
    const svg = document.getElementById("qr-svg");
    if (!svg) return;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const data = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      const a = document.createElement("a");
      a.download = "qrcode.png";
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(data);
  };

  return (
    <div className="animate-fade-in">
      <h1 className="tool-title">QR Code Generator</h1>
      <p className="tool-description mb-6">Generate QR codes from any text or URL.</p>

      <div className="tool-card space-y-4">
        <div>
          <label className="tool-label">Text or URL</label>
          <input className="tool-input" placeholder="https://example.com" value={text} onChange={(e) => setText(e.target.value)} />
        </div>

        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="tool-label">Size</label>
            <input type="number" min={64} max={512} value={size} onChange={(e) => setSize(+e.target.value)} className="tool-input w-24" />
          </div>
          <div>
            <label className="tool-label">Color</label>
            <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} className="w-10 h-10 rounded cursor-pointer border border-border" />
          </div>
          <div>
            <label className="tool-label">Background</label>
            <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="w-10 h-10 rounded cursor-pointer border border-border" />
          </div>
        </div>

        {text && (
          <div className="flex flex-col items-center gap-4 pt-4">
            <div className="rounded-xl border border-border p-4 bg-card">
              <QRCodeSVG id="qr-svg" value={text} size={size} fgColor={fg} bgColor={bg} />
            </div>
            <button className="tool-btn" onClick={download}>
              <Download className="w-4 h-4" /> Download PNG
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QrCodeGenerator;
