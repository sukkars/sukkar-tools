import { useState } from "react";
import { Copy, Check, ExternalLink } from "lucide-react";

const WhatsAppLinkGenerator = () => {
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const generateLink = () => {
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    let url = "https://wa.me/";
    if (cleanPhone) url += cleanPhone;
    if (message) url += `?text=${encodeURIComponent(message)}`;
    return url;
  };

  const link = (phone || message) ? generateLink() : "";

  const copy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="animate-fade-in">
      <h1 className="tool-title">WhatsApp Link Generator</h1>
      <p className="tool-description mb-6">Create clickable WhatsApp links with predefined messages.</p>

      <div className="tool-card space-y-4">
        <div>
          <label className="tool-label">Phone Number (with country code)</label>
          <input
            className="tool-input"
            placeholder="+1234567890"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <p className="text-xs text-muted-foreground mt-1">Include country code without + or spaces (e.g. 1234567890)</p>
        </div>
        <div>
          <label className="tool-label">Pre-filled Message (optional)</label>
          <textarea
            className="tool-textarea"
            placeholder="Hi! I'd like to inquire about..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        {link && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 rounded-lg bg-muted/50 border border-border p-3">
              <code className="flex-1 text-sm font-mono break-all text-foreground">{link}</code>
            </div>
            <div className="flex gap-2">
              <button className="tool-btn" onClick={copy}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy Link"}
              </button>
              <a href={link} target="_blank" rel="noopener noreferrer" className="tool-btn-outline inline-flex items-center gap-2">
                <ExternalLink className="w-4 h-4" /> Open in WhatsApp
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatsAppLinkGenerator;
