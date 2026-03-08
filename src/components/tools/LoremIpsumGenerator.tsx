import { useState } from "react";
import { Copy, Check } from "lucide-react";

const LOREM_WORDS = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum".split(" ");

const LoremIpsumGenerator = () => {
  const [count, setCount] = useState(3);
  const [type, setType] = useState<"paragraphs" | "sentences" | "words">("paragraphs");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const randomWord = () => LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)];
  const sentence = () => {
    const len = 8 + Math.floor(Math.random() * 12);
    const words = Array.from({ length: len }, randomWord);
    words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
    return words.join(" ") + ".";
  };
  const paragraph = () => Array.from({ length: 4 + Math.floor(Math.random() * 4) }, sentence).join(" ");

  const generate = () => {
    if (type === "words") setOutput(Array.from({ length: count }, randomWord).join(" "));
    else if (type === "sentences") setOutput(Array.from({ length: count }, sentence).join(" "));
    else setOutput(Array.from({ length: count }, paragraph).join("\n\n"));
  };

  const copy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="animate-fade-in">
      <h1 className="tool-title">Lorem Ipsum Generator</h1>
      <p className="tool-description mb-6">Generate placeholder text for your designs.</p>

      <div className="tool-card space-y-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="tool-label">Count</label>
            <input type="number" min={1} max={100} value={count} onChange={(e) => setCount(+e.target.value)} className="tool-input w-24" />
          </div>
          <div>
            <label className="tool-label">Type</label>
            <select value={type} onChange={(e) => setType(e.target.value as any)} className="tool-input">
              <option value="paragraphs">Paragraphs</option>
              <option value="sentences">Sentences</option>
              <option value="words">Words</option>
            </select>
          </div>
          <button className="tool-btn" onClick={generate}>Generate</button>
        </div>

        {output && (
          <div className="relative">
            <button onClick={copy} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
            <textarea className="tool-textarea min-h-[200px]" readOnly value={output} />
          </div>
        )}
      </div>
    </div>
  );
};

export default LoremIpsumGenerator;
