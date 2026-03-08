import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, RotateCcw, Flag, PictureInPicture2, ExternalLink, X } from "lucide-react";

const StopwatchTimer = () => {
  const [mode, setMode] = useState<"stopwatch" | "timer">("stopwatch");
  const [ms, setMs] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const [timerInput, setTimerInput] = useState(300);
  const [pipOpen, setPipOpen] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const startRef = useRef(0);
  const popupWindowRef = useRef<Window | null>(null);
  const pipCanvasRef = useRef<HTMLCanvasElement>(null);
  const pipVideoRef = useRef<HTMLVideoElement>(null);
  const msRef = useRef(ms);

  useEffect(() => { msRef.current = ms; }, [ms]);

  useEffect(() => () => {
    clearInterval(intervalRef.current);
    popupWindowRef.current?.close();
  }, []);

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

  /* ─── True PiP using Canvas ─── */
  const pipAnimRef = useRef<number>();

  const drawPipCanvas = useCallback(() => {
    const canvas = pipCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#ffffff60";
    ctx.font = "12px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(mode === "stopwatch" ? "STOPWATCH" : "TIMER", canvas.width / 2, 30);

    ctx.fillStyle = "#eeeeee";
    ctx.font = "bold 36px monospace";
    ctx.fillText(formatTime(msRef.current), canvas.width / 2, 75);

    ctx.fillStyle = running ? "#4ade80" : "#facc15";
    ctx.font = "11px system-ui";
    ctx.fillText(running ? "● Running" : "❚❚ Paused", canvas.width / 2, 100);

    pipAnimRef.current = requestAnimationFrame(drawPipCanvas);
  }, [mode, running]);

  const openPip = useCallback(async () => {
    try {
      const canvas = pipCanvasRef.current;
      const video = pipVideoRef.current;
      if (!canvas || !video) return;

      canvas.width = 300;
      canvas.height = 120;

      const stream = canvas.captureStream(30);
      video.srcObject = stream;
      await video.play();
      await (video as any).requestPictureInPicture();

      pipAnimRef.current = requestAnimationFrame(drawPipCanvas);
      setPipOpen(true);

      video.addEventListener("leavepictureinpicture", () => {
        cancelAnimationFrame(pipAnimRef.current!);
        video.srcObject = null;
        setPipOpen(false);
      }, { once: true });
    } catch {
      // PiP not supported, silently fail
    }
  }, [drawPipCanvas]);

  const closePip = useCallback(() => {
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture();
    }
    cancelAnimationFrame(pipAnimRef.current!);
    setPipOpen(false);
  }, []);

  // Update draw loop when running/mode changes
  useEffect(() => {
    if (pipOpen) {
      cancelAnimationFrame(pipAnimRef.current!);
      pipAnimRef.current = requestAnimationFrame(drawPipCanvas);
    }
  }, [pipOpen, running, mode, drawPipCanvas]);

  /* ─── Popup Window ─── */
  const openPopup = useCallback(() => {
    const w = window.open("", "stopwatch_popup", "width=320,height=200,top=100,left=100,toolbar=no,menubar=no,resizable=yes");
    if (!w) return;
    popupWindowRef.current = w;
    w.document.write(`
      <!DOCTYPE html><html><head><title>Stopwatch</title>
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family: system-ui, sans-serif; background: #1a1a2e; color: #eee; display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; user-select:none; }
        #pip-time { font-size: 3rem; font-weight: 700; font-variant-numeric: tabular-nums; letter-spacing: 2px; }
        #pip-status { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 3px; opacity: 0.6; margin-top: 4px; }
        .label { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 2px; opacity: 0.4; margin-bottom: 8px; }
      </style></head><body>
        <div class="label">${mode === "stopwatch" ? "Stopwatch" : "Timer"}</div>
        <div id="pip-time">${formatTime(ms)}</div>
        <div id="pip-status">${running ? "Running" : "Paused"}</div>
      </body></html>
    `);
    w.document.close();
    w.addEventListener("beforeunload", () => setPopupOpen(false));
    setPopupOpen(true);
  }, [mode, ms, running]);

  const closePopup = () => {
    popupWindowRef.current?.close();
    popupWindowRef.current = null;
    setPopupOpen(false);
  };

  // Update popup window
  useEffect(() => {
    if (!popupOpen || !popupWindowRef.current) return;
    const w = popupWindowRef.current;
    const id = setInterval(() => {
      try {
        const el = w.document.getElementById("pip-time");
        if (el) el.textContent = formatTime(msRef.current);
        const statusEl = w.document.getElementById("pip-status");
        if (statusEl) statusEl.textContent = running ? "Running" : "Paused";
      } catch { /* window closed */ }
    }, 100);
    return () => clearInterval(id);
  }, [popupOpen, running]);

  return (
    <div className="space-y-4">
      {/* Hidden elements for true PiP */}
      <canvas ref={pipCanvasRef} className="hidden" />
      <video ref={pipVideoRef} className="hidden" muted playsInline />

      <div className="flex items-center justify-between">
        <h2 className="tool-title">Stopwatch & Timer</h2>
        <div className="flex gap-1.5">
          <button onClick={pipOpen ? closePip : openPip} className={pipOpen ? "tool-btn text-xs" : "tool-btn-outline text-xs"} title="Picture-in-Picture (overlay)">
            {pipOpen ? <><X className="w-3 h-3" /> PiP</> : <><PictureInPicture2 className="w-3.5 h-3.5" /> PiP</>}
          </button>
          <button onClick={popupOpen ? closePopup : openPopup} className={popupOpen ? "tool-btn text-xs" : "tool-btn-outline text-xs"} title="Open in popup window">
            {popupOpen ? <><X className="w-3 h-3" /> Popup</> : <><ExternalLink className="w-3.5 h-3.5" /> Popup</>}
          </button>
        </div>
      </div>

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
