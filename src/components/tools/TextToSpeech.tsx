import { useState, useEffect, useRef } from "react";
import { Play, Pause, Square, Volume2, AlertCircle } from "lucide-react";

interface ExtendedVoice extends SpeechSynthesisVoice {
  isFallback?: boolean;
}

const TextToSpeech = () => {
  const [text, setText] = useState("");
  const [voices, setVoices] = useState<ExtendedVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState(0);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const loadVoices = () => {
      let v = speechSynthesis.getVoices() as ExtendedVoice[];
      
      // Check if Bengali (bn-BD or bn) exists
      const hasBengali = v.some(voice => voice.lang.startsWith("bn"));
      
      if (!hasBengali) {
        // Add a virtual Bengali option if not present
        const fallbackVoice = {
          name: "Bengali (Google TTS Fallback)",
          lang: "bn-BD",
          default: false,
          localService: false,
          voiceURI: "google-tts-bn",
          isFallback: true
        } as ExtendedVoice;
        v = [...v, fallbackVoice];
      }
      
      setVoices(v);
    };
    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
    return () => { 
      speechSynthesis.cancel();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const speak = () => {
    if (!text.trim()) return;
    
    stop();

    const voice = voices[selectedVoice];
    
    if (voice?.isFallback) {
      // Use Google TTS Fallback
      if (text.length > 200) {
        // Google TTS has a limit, typically around 200 chars
        // We'll just alert for now or you could chunk it
      }
      
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=bn&client=tw-ob`;
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.playbackRate = rate;
      
      audio.onplay = () => { setIsSpeaking(true); setIsPaused(false); };
      audio.onpause = () => { setIsPaused(true); };
      audio.onended = () => { setIsSpeaking(false); setIsPaused(false); };
      audio.onerror = () => { 
        setIsSpeaking(false); 
        setIsPaused(false);
        console.error("Audio playback error");
      };

      audio.play();
    } else {
      // Standard SpeechSynthesis
      const utter = new SpeechSynthesisUtterance(text);
      if (voice) utter.voice = voice;
      utter.rate = rate;
      utter.pitch = pitch;
      utter.onend = () => { setIsSpeaking(false); setIsPaused(false); };
      utterRef.current = utter;
      speechSynthesis.speak(utter);
      setIsSpeaking(true);
      setIsPaused(false);
    }
  };

  const pause = () => { 
    if (audioRef.current) {
      audioRef.current.pause();
    } else {
      speechSynthesis.pause(); 
    }
    setIsPaused(true); 
  };

  const resume = () => { 
    if (audioRef.current && voices[selectedVoice]?.isFallback) {
      audioRef.current.play();
    } else {
      speechSynthesis.resume(); 
    }
    setIsPaused(false); 
  };

  const stop = () => { 
    speechSynthesis.cancel(); 
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsSpeaking(false); 
    setIsPaused(false); 
  };

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
              <option key={i} value={i}>{v.name} ({v.lang}){v.isFallback ? " ✨" : ""}</option>
            ))}
          </select>
          {voices[selectedVoice]?.isFallback && (
            <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Using external TTS service for Bengali. Limit: ~200 chars.
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between">
              <label className="tool-label">Rate</label>
              <span className="text-xs text-muted-foreground font-mono">{rate}x</span>
            </div>
            <input type="range" min="0.25" max="2" step="0.25" value={rate} onChange={(e) => setRate(Number(e.target.value))}
              className="w-full h-2 rounded-full bg-muted appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary" />
          </div>
          <div>
            <div className="flex justify-between">
              <label className="tool-label">Pitch</label>
              <span className="text-xs text-muted-foreground font-mono">{pitch}</span>
            </div>
            <input type="range" min="0" max="2" step="0.1" value={pitch} disabled={voices[selectedVoice]?.isFallback} 
              onChange={(e) => setPitch(Number(e.target.value))}
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
