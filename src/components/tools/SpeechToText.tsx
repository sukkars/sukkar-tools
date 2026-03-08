import { useState, useRef } from "react";
import { Mic, Square, Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";

const SpeechToText = () => {
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState("en-US");
  const recognitionRef = useRef<any>(null);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { toast.error("Speech recognition not supported in this browser"); return; }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setText(transcript);
    };

    recognition.onerror = (event: any) => {
      toast.error(`Error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);
    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const copy = () => {
    navigator.clipboard.writeText(text);
    toast.success("Copied!");
  };

  const languages = [
    { code: "en-US", label: "English (US)" },
    { code: "en-GB", label: "English (UK)" },
    { code: "es-ES", label: "Spanish" },
    { code: "fr-FR", label: "French" },
    { code: "de-DE", label: "German" },
    { code: "hi-IN", label: "Hindi" },
    { code: "bn-BD", label: "Bengali" },
    { code: "ar-SA", label: "Arabic" },
    { code: "zh-CN", label: "Chinese" },
    { code: "ja-JP", label: "Japanese" },
  ];

  return (
    <div className="space-y-4">
      <h2 className="tool-title">Speech to Text</h2>
      <p className="tool-description">Convert your voice to text using the microphone</p>

      <div>
        <label className="tool-label">Language</label>
        <select value={language} onChange={(e) => setLanguage(e.target.value)} className="tool-input">
          {languages.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
        </select>
      </div>

      <div className="flex gap-2">
        {!isListening ? (
          <button onClick={startListening} className="tool-btn flex-1"><Mic className="w-4 h-4" /> Start Listening</button>
        ) : (
          <button onClick={stopListening} className="tool-btn flex-1 !bg-red-500"><Square className="w-4 h-4" /> Stop</button>
        )}
      </div>

      {isListening && (
        <div className="flex items-center gap-2 text-sm text-primary font-medium">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          Listening...
        </div>
      )}

      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Speech will appear here..."
        className="tool-textarea min-h-[200px]" />

      <div className="flex gap-2">
        <button onClick={copy} disabled={!text} className="tool-btn-outline flex-1 disabled:opacity-40"><Copy className="w-4 h-4" /> Copy</button>
        <button onClick={() => setText("")} className="tool-btn-outline"><Trash2 className="w-4 h-4" /></button>
      </div>
    </div>
  );
};

export default SpeechToText;
