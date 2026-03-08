import { useState, useEffect, useRef } from "react";
import { Play, Pause, Square, Volume2 } from "lucide-react";

const TextToSpeech = () => {
  const [text, setText] = useState("");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState(0);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const loadVoices = () => {
      const v = speechSynthesis.getVoices();
      setVoices(v);
    };
    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
    return () => { speechSynthesis.cancel(); };
  }, []);

  const speak = () => {
    if (!text.trim()) return;
    speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    if (voices[selectedVoice]) utter.voice = voices[selectedVoice];
    utter.rate = rate;
    utter.pitch = pitch;
    utter.onend = () => { setIsSpeaking(false); setIsPaused(false); };
    utterRef.current = utter;
    speechSynthesis.speak(utter);
    setIsSpeaking(true);
    setIsPaused(false);
  };

  const pause = () => { speechSynthesis.pause(); setIsPaused(true); };
  const resume = () => { speechSynthesis.resume(); setIsPaused(false); };
  const stop = () => { speechSynthesis.cancel(); setIsSpeaking(false); setIsPaused(false); };

  return (
    <div className="space-y-4">
      <h2 className="tool-title">Text to Speech</h2>
      <p className="tool-description">Convert text to spoken audio using your browser</p>

      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Type or paste text here..."
        className="tool-textarea min-h-[150px]" />

      <div className="tool-card space-y-4">
        <div>
          <label className="tool-label">Voice</label>
          <select value={selectedVoice} onChange={(e) => setSelectedVoice(Number(e.target.value))} className="tool-input">
            {voices.map((v, i) => (
              <option key={i} value={i}>{v.name} ({v.lang})</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between">
              <label className="tool-label">Rate</label>
              <span className="text-xs text-muted-foreground font-mono">{rate}x</span>
            </div>
            <input type="range" min="0.25" max="4" step="0.25" value={rate} onChange={(e) => setRate(Number(e.target.value))}
              className="w-full h-2 rounded-full bg-muted appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary" />
          </div>
          <div>
            <div className="flex justify-between">
              <label className="tool-label">Pitch</label>
              <span className="text-xs text-muted-foreground font-mono">{pitch}</span>
            </div>
            <input type="range" min="0" max="2" step="0.1" value={pitch} onChange={(e) => setPitch(Number(e.target.value))}
              className="w-full h-2 rounded-full bg-muted appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary" />
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        {!isSpeaking ? (
          <button onClick={speak} className="tool-btn flex-1"><Play className="w-4 h-4" /> Speak</button>
        ) : isPaused ? (
          <button onClick={resume} className="tool-btn flex-1"><Volume2 className="w-4 h-4" /> Resume</button>
        ) : (
          <button onClick={pause} className="tool-btn-outline flex-1"><Pause className="w-4 h-4" /> Pause</button>
        )}
        <button onClick={stop} disabled={!isSpeaking} className="tool-btn-outline disabled:opacity-40"><Square className="w-4 h-4" /></button>
      </div>
    </div>
  );
};

export default TextToSpeech;
