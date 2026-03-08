import { useState } from "react";
import { Copy, Check } from "lucide-react";

const htmlToBBCode = (html: string): string => {
  let bb = html;
  // Bold
  bb = bb.replace(/<(strong|b)>(.*?)<\/(strong|b)>/gi, "[b]$2[/b]");
  // Italic
  bb = bb.replace(/<(em|i)>(.*?)<\/(em|i)>/gi, "[i]$2[/i]");
  // Underline
  bb = bb.replace(/<u>(.*?)<\/u>/gi, "[u]$1[/u]");
  // Strikethrough
  bb = bb.replace(/<(s|strike|del)>(.*?)<\/(s|strike|del)>/gi, "[s]$2[/s]");
  // Links
  bb = bb.replace(/<a\s+href="(.*?)".*?>(.*?)<\/a>/gi, "[url=$1]$2[/url]");
  // Images
  bb = bb.replace(/<img\s+[^>]*src="(.*?)"[^>]*\/?>/gi, "[img]$1[/img]");
  // Headings
  bb = bb.replace(/<h[1-3][^>]*>(.*?)<\/h[1-3]>/gi, "[b][size=5]$1[/size][/b]");
  bb = bb.replace(/<h[4-6][^>]*>(.*?)<\/h[4-6]>/gi, "[b][size=4]$1[/size][/b]");
  // Lists
  bb = bb.replace(/<ul[^>]*>/gi, "[list]");
  bb = bb.replace(/<\/ul>/gi, "[/list]");
  bb = bb.replace(/<ol[^>]*>/gi, "[list=1]");
  bb = bb.replace(/<\/ol>/gi, "[/list]");
  bb = bb.replace(/<li[^>]*>(.*?)<\/li>/gi, "[*]$1");
  // Blockquote
  bb = bb.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, "[quote]$1[/quote]");
  // Code
  bb = bb.replace(/<code[^>]*>(.*?)<\/code>/gi, "[code]$1[/code]");
  bb = bb.replace(/<pre[^>]*>(.*?)<\/pre>/gis, "[code]$1[/code]");
  // Line breaks & paragraphs
  bb = bb.replace(/<br\s*\/?>/gi, "\n");
  bb = bb.replace(/<\/p>/gi, "\n\n");
  bb = bb.replace(/<p[^>]*>/gi, "");
  bb = bb.replace(/<div[^>]*>/gi, "");
  bb = bb.replace(/<\/div>/gi, "\n");
  // Font color
  bb = bb.replace(/<span[^>]*color:\s*(#?\w+)[^>]*>(.*?)<\/span>/gi, "[color=$1]$2[/color]");
  // Font size
  bb = bb.replace(/<font[^>]*size="(\d+)"[^>]*>(.*?)<\/font>/gi, "[size=$1]$2[/size]");
  // Strip remaining tags
  bb = bb.replace(/<[^>]+>/g, "");
  // Decode entities
  bb = bb.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ");
  // Clean extra newlines
  bb = bb.replace(/\n{3,}/g, "\n\n").trim();
  return bb;
};

const HtmlBBCodeConverter = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const convert = () => setOutput(htmlToBBCode(input));

  const copy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="animate-fade-in">
      <h1 className="tool-title">HTML to BBCode Converter</h1>
      <p className="tool-description mb-6">Convert HTML markup to BBCode for forums and message boards.</p>

      <div className="tool-card space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="tool-label">HTML Input</label>
            <textarea
              className="tool-textarea min-h-[250px]"
              placeholder='<b>Hello</b> <a href="https://example.com">Link</a>'
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-foreground">BBCode Output</label>
              {output && (
                <button onClick={copy} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              )}
            </div>
            <textarea className="tool-textarea min-h-[250px]" readOnly value={output} placeholder="BBCode output will appear here..." />
          </div>
        </div>
        <button className="tool-btn" onClick={convert}>Convert to BBCode</button>
      </div>
    </div>
  );
};

export default HtmlBBCodeConverter;
