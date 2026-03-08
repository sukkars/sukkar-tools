import { useState, useRef, useEffect } from "react";
import { Play, Pause, RotateCcw, Flag } from "lucide-react";

const StopwatchTimer = () => {
  const [mode, setMode] = useState<"stopwatch" | "timer">("stopwatch");
  const [ms, setMs] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const [timerInput, setTimerInput] = useState(300); // 5min default
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const startRef = useRef(0);

  useEffect(() => () => clearInterval(intervalRef.current), []);

  const start = () => {
    if (mode === "timer" && ms === 0) setMs(timerInput * 1000);
    startRef.current = Date.now() - (mode === "stopwatch" ? ms : 0);
    setRunning(true);
  };

  useEffect(() => {
    if (!running) { clearInterval(intervalRef.current); return; }
    intervalRef.current = setInterval(() => {
      if (mode === "stopwatch") {
        setMs(Date.now() - startRef.current);
      } else {
        setMs((prev) => {
          const next = prev - 100;
          if (next <= 0) { clearInterval(intervalRef.current); setRunning(false); return 0; }
          return next;
        });
      }
    }, 100);
    return () => clearInterval(intervalRef.current);
  }, [running, mode]);

  const pause = () => setRunning(false);
  const reset = () => { clearInterval(intervalRef.current); setRunning(false); setMs(0); setLaps([]); };
  const lap = () => setLaps((l) => [...l, ms]);

  const formatTime = (milliseconds: number) => {
    const totalSec = Math.floor(Math.abs(milliseconds) / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    const centis = Math.floor((Math.abs(milliseconds) % 1000) / 10);
    return `${h > 0 ? h.toString().padStart(2, "0") + ":" : ""}${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${centis.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-4">
      <h2 className="tool-title">Stopwatch & Timer</h2>

      <div className="flex gap-2">
        <button onClick={() => { reset(); setMode("stopwatch"); }} className={mode === "stopwatch" ? "tool-btn text-xs" : "tool-btn-outline text-xs"}>Stopwatch</button>
        <button onClick={() => { reset(); setMode("timer"); }} className={mode === "timer" ? "tool-btn text-xs" : "tool-btn-outline text-xs"}>Timer</button>
      </div>

      {mode === "timer" && !running && ms === 0 && (
        <div className="flex gap-2 items-center">
          <label className="text-sm text-muted-foreground">Minutes:</label>
          <input type="number" min={1} max={999} value={Math.round(timerInput / 60)}
            onChange={(e) => setTimerInput(Number(e.target.value) * 60)}
            className="tool-input w-24" />
        </div>
      )}

      <div className="tool-card !p-8 text-center">
        <div className="text-6xl font-mono font-bold tracking-wider">{formatTime(ms)}</div>
      </div>

      <div className="flex gap-2 justify-center">
        {!running ? (
          <button onClick={start} className="tool-btn"><Play className="w-4 h-4" /> Start</button>
        ) : (
          <button onClick={pause} className="tool-btn-outline"><Pause className="w-4 h-4" /> Pause</button>
        )}
        {mode === "stopwatch" && running && (
          <button onClick={lap} className="tool-btn-outline"><Flag className="w-4 h-4" /> Lap</button>
        )}
        <button onClick={reset} className="tool-btn-outline"><RotateCcw className="w-4 h-4" /> Reset</button>
      </div>

      {laps.length > 0 && (
        <div className="tool-card !p-3 space-y-1 max-h-48 overflow-y-auto">
          {laps.map((l, i) => (
            <div key={i} className="flex justify-between text-sm font-mono">
              <span className="text-muted-foreground">Lap {i + 1}</span>
              <span>{formatTime(l)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StopwatchTimer;
