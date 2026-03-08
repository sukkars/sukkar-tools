import { useState } from "react";
import ReactMarkdown from "react-markdown";

const MarkdownPreview = () => {
  const [md, setMd] = useState(`# Hello World

This is a **markdown** preview tool. Try editing this text!

## Features
- Real-time preview
- Supports all common markdown syntax
- Clean rendering

\`\`\`js
const greeting = "Hello!";
console.log(greeting);
\`\`\`

> Blockquotes work too!

| Feature | Status |
|---------|--------|
| Bold    | ✅     |
| Links   | ✅     |
| Tables  | ✅     |
`);

  return (
    <div className="animate-fade-in">
      <h1 className="tool-title">Markdown Preview</h1>
      <p className="tool-description mb-6">Write markdown and preview it in real time.</p>

      <div className="tool-card">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="tool-label">Markdown</label>
            <textarea
              className="tool-textarea min-h-[400px]"
              value={md}
              onChange={(e) => setMd(e.target.value)}
            />
          </div>
          <div>
            <label className="tool-label">Preview</label>
            <div className="rounded-lg border border-border bg-muted/30 p-4 min-h-[400px] prose prose-sm max-w-none text-foreground prose-headings:text-foreground prose-strong:text-foreground prose-code:text-primary prose-blockquote:border-primary/30 prose-a:text-primary">
              <ReactMarkdown>{md}</ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarkdownPreview;
