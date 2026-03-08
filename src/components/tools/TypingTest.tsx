import { useState, useRef, useEffect, useCallback } from "react";
import { RotateCcw } from "lucide-react";

const TEXTS = [
  "The quick brown fox jumps over the lazy dog near the river bank on a warm summer afternoon while birds sing melodiously.",
  "Programming is the art of telling a computer what to do through carefully structured instructions and logical thinking patterns.",
  "Technology continues to reshape how we communicate and work together across different time zones and cultural boundaries worldwide.",
  "A good developer writes code that humans can understand while machines execute it efficiently and reliably every single time.",
  "The internet has connected billions of people making information accessible to anyone with a device and network connection available.",
];

const TypingTest = () => {
  const [targetText, setTargetText] = useState(TEXTS[0]);
  const [input, setInput] = useState("");
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(60);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const reset = useCallback(() => {
    clearInterval(timerRef.current);
    setInput("");
    setStarted(false);
    setFinished(false);
    setElapsed(0);
    setTargetText(TEXTS[Math.floor(Math.random() * TEXTS.length)]);
    inputRef.current?.focus();
  }, []);

  useEffect(() => () => clearInterval(timerRef.current), []);

  const handleInput = (val: string) => {
    if (finished) return;
    if (!started) {
      setStarted(true);
      setStartTime(Date.now());
      timerRef.current = setInterval(() => {
        const e = (Date.now() - Date.now()) / 1000; // placeholder, fixed below
        setElapsed((prev) => {
          const newE = prev + 1;
          if (newE >= duration) {
            clearInterval(timerRef.current);
            setFinished(true);
          }
          return newE;
        });
      }, 1000);
    }
    setInput(val);
    if (val.length >= targetText.length) {
      clearInterval(timerRef.current);
      setFinished(true);
      setElapsed(Math.round((Date.now() - startTime) / 1000) || 1);
    }
  };

  // Fix timer to use actual startTime
  useEffect(() => {
    if (started && !finished) {
      clearInterval(timerRef.current);
      const st = Date.now();
      timerRef.current = setInterval(() => {
        const e = Math.round((Date.now() - st) / 1000);
        setElapsed(e);
        if (e >= duration) {
          clearInterval(timerRef.current);
          setFinished(true);
        }
      }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, finished, duration]);

  const correctChars = input.split("").filter((c, i) => c === targetText[i]).length;
  const totalTyped = input.length;
  const accuracy = totalTyped > 0 ? Math.round((correctChars / totalTyped) * 100) : 0;
  const minutes = elapsed / 60 || 1 / 60;
  const wpm = Math.round((correctChars / 5) / minutes);
  const timeLeft = Math.max(0, duration - elapsed);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="tool-title">Typing Speed Test</h2>
        <button onClick={reset} className="tool-btn-outline text-xs"><RotateCcw className="w-3 h-3" /> Reset</button>
      </div>

      <div className="flex gap-2 items-center">
        <label className="text-sm text-muted-foreground">Duration:</label>
        {[30, 60, 120].map((d) => (
          <button key={d} onClick={() => { setDuration(d); reset(); }}
            className={d === duration ? "tool-btn text-xs !px-3 !py-1" : "tool-btn-outline text-xs !px-3 !py-1"}>
            {d}s
          </button>
        ))}
      </div>

      {/* Target text display */}
      <div className="tool-card !p-4 font-mono text-base leading-relaxed select-none">
        {targetText.split("").map((char, i) => {
          let cls = "text-muted-foreground";
          if (i < input.length) {
            cls = input[i] === char ? "text-green-500" : "text-red-500 underline";
          } else if (i === input.length) {
            cls = "bg-primary/20 text-foreground";
          }
          return <span key={i} className={cls}>{char}</span>;
        })}
      </div>

      <textarea ref={inputRef} value={input} onChange={(e) => handleInput(e.target.value)}
        disabled={finished} placeholder={finished ? "Test complete!" : "Start typing here..."}
        className="tool-textarea font-mono min-h-[80px]" autoFocus />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Time Left", value: `${timeLeft}s` },
          { label: "WPM", value: String(started ? wpm : 0) },
          { label: "Accuracy", value: `${started ? accuracy : 100}%` },
          { label: "Characters", value: `${correctChars}/${totalTyped}` },
        ].map(({ label, value }) => (
          <div key={label} className="tool-card !p-3 text-center">
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="text-xl font-bold font-mono">{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TypingTest;
