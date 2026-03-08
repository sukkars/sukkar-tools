import { useEffect, useRef, useState, useCallback } from "react";
import { Mic, Square, CircleDot, ExternalLink, AlertCircle, CheckCircle2, Info, ImagePlus, X, Music } from "lucide-react";
import { useAudioVisualizer, type VisualizerStyle, type ThemeName } from "@/hooks/useAudioVisualizer";

const STYLES: { id: VisualizerStyle; label: string; icon: string }[] = [
  { id: "bars", label: "Bars", icon: "📊" },
  { id: "circles", label: "Circles", icon: "🔵" },
  { id: "wave", label: "Wave", icon: "🌊" },
  { id: "bidirectional", label: "Bidirectional", icon: "↕️" },
  { id: "rounded", label: "Rounded", icon: "🔴" },
  { id: "particles", label: "Particles", icon: "✨" },
  { id: "spectrum", label: "Spectrum", icon: "📈" },
  { id: "radial", label: "Radial", icon: "🎯" },
  { id: "plain", label: "Plain", icon: "⭕" },
];

const THEMES: { id: ThemeName; label: string; color: string }[] = [
  { id: "ocean", label: "Ocean", color: "bg-blue-500" },
  { id: "emerald", label: "Emerald", color: "bg-emerald-500" },
  { id: "sunset", label: "Sunset", color: "bg-orange-500" },
  { id: "cyberpunk", label: "Cyberpunk", color: "bg-pink-500" },
  { id: "aurora", label: "Aurora", color: "bg-teal-400" },
  { id: "blood", label: "Blood Moon", color: "bg-red-600" },
  { id: "galaxy", label: "Galaxy", color: "bg-violet-500" },
  { id: "neon", label: "Neon", color: "bg-lime-400" },
];

const SoundVisualizer = () => {
  const {
    state, sensitivity, setSensitivity, smoothness, setSmoothness,
    currentStyle, setCurrentStyle, theme, setTheme,
    canvasRef, pipCanvasRef, pipVideoRef, setCenterImage,
    startMic, stopMic, toggleRecording, togglePip, exportAudioOnly,
  } = useAudioVisualizer();

  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [centerImageUrl, setCenterImageUrl] = useState("");
  const audioRecorderRef = useRef<MediaRecorder | null>(null);
  const [isAudioRecording, setIsAudioRecording] = useState(false);

  useEffect(() => {
    const resize = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [canvasRef]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      setCenterImageUrl(url);
      setCenterImage(url);
    };
    reader.readAsDataURL(file);
  };

  const clearCenterImage = () => {
    setCenterImageUrl("");
    setCenterImage("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAudioExport = useCallback(() => {
    if (isAudioRecording) {
      audioRecorderRef.current?.stop();
      audioRecorderRef.current = null;
      setIsAudioRecording(false);
      return;
    }
    const recorder = exportAudioOnly();
    if (recorder) {
      audioRecorderRef.current = recorder;
      setIsAudioRecording(true);
    }
  }, [isAudioRecording, exportAudioOnly]);

  const StatusIcon = state.statusType === "active" ? CheckCircle2 : state.statusType === "error" ? AlertCircle : Info;
  const statusColor = state.statusType === "active" ? "text-emerald-400" : state.statusType === "error" ? "text-red-400" : "text-muted-foreground";
  const showImageUpload = currentStyle === "rounded" || currentStyle === "plain";

  return (
    <div className="space-y-4">
      {/* Status */}
      <div className="flex items-center gap-2">
        {state.isRecording && <span className="text-red-500 font-bold animate-pulse text-sm">● REC</span>}
        {isAudioRecording && <span className="text-orange-400 font-bold animate-pulse text-sm">● AUDIO</span>}
        <StatusIcon className={`w-4 h-4 ${statusColor}`} />
        <span className={`text-sm ${statusColor}`}>{state.status}</span>
      </div>

      {/* Canvas */}
      <div ref={containerRef} className="relative rounded-xl overflow-hidden border border-border" style={{ height: "350px" }}>
        <canvas ref={canvasRef} className="w-full h-full" />
        {showImageUpload && (
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            {centerImageUrl && (
              <button onClick={clearCenterImage} className="bg-red-500/90 text-white p-2 rounded-full hover:bg-red-500 transition-all" title="Remove image">
                <X className="w-4 h-4" />
              </button>
            )}
            <button onClick={() => fileInputRef.current?.click()} className="bg-primary/90 text-primary-foreground p-2.5 rounded-full hover:bg-primary transition-all" title="Upload center image">
              <ImagePlus className="w-5 h-5" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </div>
        )}
      </div>

      {/* Hidden PiP elements */}
      <canvas ref={pipCanvasRef} width={800} height={450} className="hidden" />
      <video ref={pipVideoRef} autoPlay muted playsInline className="absolute w-px h-px opacity-0 pointer-events-none" />

      {/* Controls */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button onClick={startMic} disabled={state.isActive} className="tool-btn flex items-center justify-center gap-1.5 disabled:opacity-40">
          <Mic className="w-4 h-4" /> Start
        </button>
        <button onClick={stopMic} disabled={!state.isActive} className="tool-btn flex items-center justify-center gap-1.5 disabled:opacity-40">
          <Square className="w-4 h-4" /> Stop
        </button>
        <button onClick={toggleRecording} disabled={!state.isActive} className={`tool-btn flex items-center justify-center gap-1.5 disabled:opacity-40 ${state.isRecording ? "!bg-red-500 !text-white" : ""}`}>
          <CircleDot className={`w-4 h-4 ${state.isRecording ? "animate-pulse" : ""}`} />
          {state.isRecording ? "Stop Rec" : "Video"}
        </button>
        <button onClick={handleAudioExport} disabled={!state.isActive} className={`tool-btn flex items-center justify-center gap-1.5 disabled:opacity-40 ${isAudioRecording ? "!bg-orange-500 !text-white" : ""}`}>
          <Music className={`w-4 h-4 ${isAudioRecording ? "animate-pulse" : ""}`} />
          {isAudioRecording ? "Stop" : "Audio"}
        </button>
      </div>

      <button onClick={togglePip} disabled={!state.isActive} className="tool-btn w-full flex items-center justify-center gap-1.5 disabled:opacity-40">
        <ExternalLink className="w-4 h-4" /> Picture-in-Picture
      </button>

      {/* Settings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-muted-foreground">Sensitivity</span>
            <span className="font-mono text-xs">{sensitivity}%</span>
          </div>
          <input type="range" min={10} max={300} value={sensitivity} onChange={(e) => setSensitivity(Number(e.target.value))}
            className="w-full h-2 rounded-full bg-muted appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer" />
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-muted-foreground">Smoothness</span>
            <span className="font-mono text-xs">{smoothness}</span>
          </div>
          <input type="range" min={1} max={20} value={smoothness} onChange={(e) => setSmoothness(Number(e.target.value))}
            className="w-full h-2 rounded-full bg-muted appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer" />
        </div>
      </div>

      {/* Themes */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Theme</div>
        <div className="flex flex-wrap gap-2">
          {THEMES.map((t) => (
            <button key={t.id} onClick={() => setTheme(t.id)} title={t.label}
              className={`w-7 h-7 rounded-full ${t.color} transition-all hover:scale-110 ${theme === t.id ? "ring-2 ring-foreground ring-offset-2 ring-offset-background scale-110" : "opacity-60"}`} />
          ))}
        </div>
      </div>

      {/* Visual Styles */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Visual Style</div>
        <div className="flex flex-wrap gap-1.5">
          {STYLES.map((s) => (
            <button key={s.id} onClick={() => setCurrentStyle(s.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${currentStyle === s.id ? "bg-primary text-primary-foreground scale-105" : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"}`}>
              {s.icon} {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SoundVisualizer;
