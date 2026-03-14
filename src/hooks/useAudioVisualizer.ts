import { useRef, useState, useCallback, useEffect } from "react";

export type VisualizerStyle =
  | "bars"
  | "circles"
  | "wave"
  | "bidirectional"
  | "rounded"
  | "particles"
  | "spectrum"
  | "radial"
  | "plain";

export type ThemeName = "ocean" | "emerald" | "sunset" | "cyberpunk" | "aurora" | "blood" | "galaxy" | "neon" | "light" | "plain";
export type Orientation = "landscape" | "portrait";

interface AudioState {
  isActive: boolean;
  isRecording: boolean;
  isPip: boolean;
  status: string;
  statusType: "idle" | "active" | "error";
}

const THEME_COLORS: Record<ThemeName, { accentStart: string; accentEnd: string; bgFrom: string; bgTo: string; glow: string }> = {
  ocean:    { accentStart: "#3b82f6", accentEnd: "#9333ea", bgFrom: "#0a0e1a", bgTo: "#111827", glow: "#3b82f6" },
  emerald:  { accentStart: "#10b981", accentEnd: "#059669", bgFrom: "#022c22", bgTo: "#064e3b", glow: "#10b981" },
  sunset:   { accentStart: "#f97316", accentEnd: "#ef4444", bgFrom: "#1c0a00", bgTo: "#1a0a0a", glow: "#f97316" },
  cyberpunk:{ accentStart: "#ec4899", accentEnd: "#a855f7", bgFrom: "#0d0015", bgTo: "#1a002e", glow: "#ec4899" },
  aurora:   { accentStart: "#2dd4bf", accentEnd: "#22d3ee", bgFrom: "#042f2e", bgTo: "#083344", glow: "#2dd4bf" },
  blood:    { accentStart: "#dc2626", accentEnd: "#7f1d1d", bgFrom: "#1a0000", bgTo: "#0a0000", glow: "#dc2626" },
  galaxy:   { accentStart: "#8b5cf6", accentEnd: "#6366f1", bgFrom: "#0c0020", bgTo: "#030014", glow: "#8b5cf6" },
  neon:     { accentStart: "#84cc16", accentEnd: "#22c55e", bgFrom: "#0a1a00", bgTo: "#001a0a", glow: "#84cc16" },
  // Light theme: white/light-gray background, vivid blue accent
  light:    { accentStart: "#2563eb", accentEnd: "#2563eb", bgFrom: "#f8fafc", bgTo: "#e2e8f0", glow: "#2563eb" },
  // Plain theme: flat neutral background, flat accent (no glow)
  plain:    { accentStart: "#6366f1", accentEnd: "#6366f1", bgFrom: "#1e1e2e", bgTo: "#1e1e2e", glow: "#6366f1" },
};

export function useAudioVisualizer() {
  const [state, setState] = useState<AudioState>({
    isActive: false,
    isRecording: false,
    isPip: false,
    status: "Mic inactive",
    statusType: "idle",
  });
  const [sensitivity, setSensitivity] = useState(100);
  const [smoothness, setSmoothness] = useState(5);
  const [currentStyle, setCurrentStyle] = useState<VisualizerStyle>("bars");
  const [theme, setTheme] = useState<ThemeName>("ocean");
  const [orientation, setOrientation] = useState<Orientation>("landscape");

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationIdRef = useRef<number>(0);
  const lastValuesRef = useRef<number[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pipCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const pipVideoRef = useRef<HTMLVideoElement | null>(null);
  const centerImageObjRef = useRef<HTMLImageElement | null>(null);
  const drawRef = useRef<(canvas: HTMLCanvasElement) => void>(() => {});

  const getThemeColors = useCallback(() => THEME_COLORS[theme], [theme]);

  const applySmoothing = useCallback(
    (newValue: number, index: number) => {
      if (lastValuesRef.current[index] === undefined) {
        lastValuesRef.current[index] = newValue;
        return newValue;
      }
      const smoothed = lastValuesRef.current[index] + (newValue - lastValuesRef.current[index]) / smoothness;
      lastValuesRef.current[index] = smoothed;
      return smoothed;
    },
    [smoothness]
  );

  const drawVisualization = useCallback(
    (canvas: HTMLCanvasElement) => {
      const ctx = canvas.getContext("2d");
      const analyser = analyserRef.current;
      const dataArray = dataArrayRef.current;
      if (!ctx || !analyser || !dataArray) return;

      analyser.getByteFrequencyData(dataArray);
      const w = canvas.width;
      const h = canvas.height;
      const colors = getThemeColors();

      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, colors.bgFrom);
      bgGrad.addColorStop(1, colors.bgTo);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      const sens = sensitivity / 100;

      if (currentStyle === "bars") {
        const barCount = 40;
        const barWidth = w / barCount - 4;
        for (let i = 0; i < barCount; i++) {
          const idx = Math.floor(i * (dataArray.length / barCount));
          const raw = dataArray[idx] / 255;
          const val = applySmoothing(raw * sens, i);
          const barH = val * h * 0.9;
          const x = i * (barWidth + 4) + 2;
          const grad = ctx.createLinearGradient(x, h, x, h - barH);
          grad.addColorStop(0, colors.accentStart);
          grad.addColorStop(1, colors.accentEnd);
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(x, h - barH, barWidth, barH, [4, 4, 0, 0]);
          ctx.fill();
          ctx.shadowColor = colors.accentStart;
          ctx.shadowBlur = val * 20;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      } else if (currentStyle === "circles") {
        for (let i = 0; i < dataArray.length; i += 4) {
          const val = dataArray[i] / 255;
          if (val > 0.15) {
            const x = (i / dataArray.length) * w;
            const y = h / 2 + Math.sin(i * 0.1 + Date.now() * 0.002) * h * 0.3;
            const radius = 3 + val * 40 * sens;
            const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
            grad.addColorStop(0, colors.accentStart);
            grad.addColorStop(1, "transparent");
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      } else if (currentStyle === "wave") {
        ctx.beginPath();
        const segW = w / (dataArray.length - 1);
        for (let i = 0; i < dataArray.length; i++) {
          const raw = dataArray[i] / 255;
          const val = applySmoothing(raw * sens, i);
          const y = h - val * h * 0.8;
          if (i === 0) ctx.moveTo(0, y);
          else {
            const prevX = (i - 1) * segW;
            const cpX = prevX + segW / 2;
            ctx.quadraticCurveTo(cpX, y, i * segW, y);
          }
        }
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();
        const grad = ctx.createLinearGradient(0, 0, w, 0);
        grad.addColorStop(0, colors.accentStart);
        grad.addColorStop(1, colors.accentEnd);
        ctx.fillStyle = grad;
        ctx.globalAlpha = 0.6;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = colors.accentStart;
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (currentStyle === "bidirectional") {
        const segW = w / (dataArray.length - 1);
        const midY = h / 2;
        ctx.beginPath();
        ctx.moveTo(0, midY);
        for (let i = 0; i < dataArray.length; i++) {
          const raw = dataArray[i] / 255;
          const val = applySmoothing(raw * sens, i);
          ctx.lineTo(i * segW, midY - val * midY * 0.85);
        }
        ctx.lineTo(w, midY);
        ctx.closePath();
        const grad1 = ctx.createLinearGradient(0, 0, w, 0);
        grad1.addColorStop(0, colors.accentStart);
        grad1.addColorStop(1, colors.accentEnd);
        ctx.fillStyle = grad1;
        ctx.globalAlpha = 0.7;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.moveTo(0, midY);
        for (let i = 0; i < dataArray.length; i++) {
          const raw = dataArray[i] / 255;
          const val = applySmoothing(raw * sens, i + 200);
          ctx.lineTo(i * segW, midY + val * midY * 0.85);
        }
        ctx.lineTo(w, midY);
        ctx.closePath();
        ctx.fillStyle = grad1;
        ctx.globalAlpha = 0.5;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = colors.accentStart;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.moveTo(0, midY);
        ctx.lineTo(w, midY);
        ctx.stroke();
        ctx.globalAlpha = 1;
      } else if (currentStyle === "rounded") {
        const cx = w / 2;
        const cy = h / 2;
        const baseRadius = Math.min(w, h) * 0.25;
        const numPoints = dataArray.length;
        ctx.beginPath();
        for (let i = 0; i <= numPoints; i++) {
          const idx = i % numPoints;
          const raw = dataArray[idx] / 255;
          const val = applySmoothing(raw * sens, idx);
          const angle = (i / numPoints) * Math.PI * 2 - Math.PI / 2;
          const r = baseRadius + val * baseRadius * 0.8;
          const x = cx + r * Math.cos(angle);
          const y = cy + r * Math.sin(angle);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseRadius * 2);
        grad.addColorStop(0, colors.accentStart);
        grad.addColorStop(1, colors.accentEnd);
        ctx.fillStyle = grad;
        ctx.globalAlpha = 0.5;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = colors.accentStart;
        ctx.lineWidth = 2;
        ctx.stroke();
        const avgVal = dataArray.reduce((s, v) => s + v, 0) / dataArray.length / 255;
        const innerR = baseRadius * 0.4 * (1 + avgVal * 0.3);
        if (centerImageObjRef.current?.complete) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(centerImageObjRef.current, cx - innerR, cy - innerR, innerR * 2, innerR * 2);
          ctx.restore();
          ctx.strokeStyle = colors.accentStart;
          ctx.lineWidth = 3;
          ctx.shadowColor = colors.glow;
          ctx.shadowBlur = 20 + avgVal * 30;
          ctx.beginPath();
          ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
          ctx.stroke();
          ctx.shadowBlur = 0;
        } else {
          const innerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, innerR);
          innerGrad.addColorStop(0, colors.accentEnd);
          innerGrad.addColorStop(1, colors.accentStart);
          ctx.fillStyle = innerGrad;
          ctx.beginPath();
          ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowColor = colors.glow;
          ctx.shadowBlur = 30;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      } else if (currentStyle === "particles") {
        for (let i = 0; i < dataArray.length; i += 2) {
          const val = dataArray[i] / 255;
          if (val > 0.08) {
            const x = (i / dataArray.length) * w;
            const baseY = h / 2;
            const offsetY = Math.sin(Date.now() * 0.003 + i * 0.2) * val * h * 0.3;
            const y = baseY + offsetY;
            const size = 2 + val * 12 * sens;
            const hue = 200 + (i / dataArray.length) * 160;
            ctx.fillStyle = `hsla(${hue}, 80%, 60%, ${0.3 + val * 0.7})`;
            ctx.shadowColor = `hsla(${hue}, 80%, 60%, 0.5)`;
            ctx.shadowBlur = size;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      } else if (currentStyle === "spectrum") {
        const lineCount = 128;
        const lineWidth = w / lineCount;
        for (let i = 0; i < lineCount; i++) {
          const idx = Math.floor(i * (dataArray.length / lineCount));
          const raw = dataArray[idx] / 255;
          const val = applySmoothing(raw * sens, i);
          const lineH = val * h * 0.9;
          const hue = 200 + (i / lineCount) * 160;
          ctx.fillStyle = `hsla(${hue}, 80%, 60%, ${0.4 + val * 0.6})`;
          ctx.fillRect(i * lineWidth, h - lineH, lineWidth - 1, lineH);
        }
      } else if (currentStyle === "radial") {
        const cx = w / 2;
        const cy = h / 2;
        const barCount = 64;
        const baseRadius = Math.min(w, h) * 0.15;
        for (let i = 0; i < barCount; i++) {
          const idx = Math.floor(i * (dataArray.length / barCount));
          const raw = dataArray[idx] / 255;
          const val = applySmoothing(raw * sens, i);
          const angle = (i / barCount) * Math.PI * 2 - Math.PI / 2;
          const barLen = val * Math.min(w, h) * 0.3;
          const hue = 240 + (i / barCount) * 120;
          const x1 = cx + baseRadius * Math.cos(angle);
          const y1 = cy + baseRadius * Math.sin(angle);
          const x2 = cx + (baseRadius + barLen) * Math.cos(angle);
          const y2 = cy + (baseRadius + barLen) * Math.sin(angle);
          ctx.strokeStyle = `hsla(${hue}, 80%, 60%, ${0.4 + val * 0.6})`;
          ctx.lineWidth = 3;
          ctx.lineCap = "round";
          ctx.shadowColor = `hsla(${hue}, 80%, 60%, 0.5)`;
          ctx.shadowBlur = val * 15;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
        const avgVal = dataArray.reduce((s, v) => s + v, 0) / dataArray.length / 255;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseRadius);
        grad.addColorStop(0, colors.accentEnd);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.globalAlpha = 0.3 + avgVal * 0.5;
        ctx.beginPath();
        ctx.arc(cx, cy, baseRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      } else if (currentStyle === "plain") {
        const cx = w / 2;
        const cy = h / 2;
        const avgVal = dataArray.reduce((s, v) => s + v, 0) / dataArray.length / 255;
        const smoothedAvg = applySmoothing(avgVal * sens, 999);
        const baseRadius = Math.min(w, h) * 0.18;
        for (let ring = 3; ring >= 1; ring--) {
          const ringRadius = baseRadius + ring * 35 + smoothedAvg * 30 * ring;
          const alpha = 0.08 + (smoothedAvg * 0.12) / ring;
          ctx.strokeStyle = colors.accentStart;
          ctx.lineWidth = 2;
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
        const outerR = baseRadius + 20 + smoothedAvg * 40;
        ctx.fillStyle = colors.bgTo;
        ctx.beginPath();
        ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = colors.accentStart;
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.6 + smoothedAvg * 0.4;
        ctx.beginPath();
        ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
        const innerR = baseRadius * 0.8;
        if (centerImageObjRef.current?.complete) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(centerImageObjRef.current, cx - innerR, cy - innerR, innerR * 2, innerR * 2);
          ctx.restore();
          ctx.strokeStyle = colors.accentStart;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          ctx.fillStyle = colors.accentStart;
          ctx.globalAlpha = 0.15;
          ctx.beginPath();
          ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
          ctx.strokeStyle = colors.accentStart;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
          ctx.stroke();
        }
        const barCount = 32;
        for (let i = 0; i < barCount; i++) {
          const idx = Math.floor(i * (dataArray.length / barCount));
          const raw = dataArray[idx] / 255;
          const val = applySmoothing(raw * sens, i + 1000);
          const angle = (i / barCount) * Math.PI * 2 - Math.PI / 2;
          const barLen = val * 25;
          const x1 = cx + (outerR + 5) * Math.cos(angle);
          const y1 = cy + (outerR + 5) * Math.sin(angle);
          const x2 = cx + (outerR + 5 + barLen) * Math.cos(angle);
          const y2 = cy + (outerR + 5 + barLen) * Math.sin(angle);
          ctx.strokeStyle = colors.accentStart;
          ctx.lineWidth = 2;
          ctx.globalAlpha = 0.4 + val * 0.6;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }
    },
    [currentStyle, sensitivity, applySmoothing, getThemeColors]
  );

  useEffect(() => {
    drawRef.current = drawVisualization;
  }, [drawVisualization]);

  const visualize = useCallback(() => {
    if (!analyserRef.current || !dataArrayRef.current) return;
    const canvas = canvasRef.current;
    if (canvas) drawRef.current(canvas);
    const pipCanvas = pipCanvasRef.current;
    if (pipCanvas && canvas) {
      const pipCtx = pipCanvas.getContext("2d");
      if (pipCtx) {
        pipCtx.clearRect(0, 0, pipCanvas.width, pipCanvas.height);
        // Draw with aspect-ratio preserving letterbox/pillarbox
        const sw = canvas.width, sh = canvas.height;
        const dw = pipCanvas.width, dh = pipCanvas.height;
        const scale = Math.min(dw / sw, dh / sh);
        const ox = (dw - sw * scale) / 2;
        const oy = (dh - sh * scale) / 2;
        pipCtx.fillStyle = "#000";
        pipCtx.fillRect(0, 0, dw, dh);
        pipCtx.drawImage(canvas, ox, oy, sw * scale, sh * scale);
      }
    }
    animationIdRef.current = requestAnimationFrame(visualize);
  }, []);

  const startMic = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const audioCtx = new AudioContext();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
      lastValuesRef.current = [];
      setState((s) => ({ ...s, isActive: true, status: "Microphone active", statusType: "active" }));
      visualize();
    } catch {
      setState((s) => ({ ...s, status: "Microphone access denied", statusType: "error" }));
    }
  }, [visualize]);

  const stopMic = useCallback(() => {
    if (state.isRecording) mediaRecorderRef.current?.stop();
    cancelAnimationFrame(animationIdRef.current);
    if (audioContextRef.current?.state !== "closed") audioContextRef.current?.close();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setState({ isActive: false, isRecording: false, isPip: false, status: "Mic inactive", statusType: "idle" });
    const canvas = canvasRef.current;
    if (canvas) canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
  }, [state.isRecording]);

  const toggleRecording = useCallback(() => {
    if (state.isRecording) {
      mediaRecorderRef.current?.stop();
      setState((s) => ({ ...s, isRecording: false }));
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const canvasStream = canvas.captureStream(30);
    if (streamRef.current) streamRef.current.getAudioTracks().forEach((t) => canvasStream.addTrack(t));
    const recorder = new MediaRecorder(canvasStream, { mimeType: "video/webm;codecs=vp9" });
    chunksRef.current = [];
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `visualizer-${Date.now()}.webm`;
      a.click();
      URL.revokeObjectURL(url);
    };
    recorder.start();
    mediaRecorderRef.current = recorder;
    setState((s) => ({ ...s, isRecording: true }));
  }, [state.isRecording]);

  const exportAudioOnly = useCallback(() => {
    if (!streamRef.current) return;
    const audioStream = new MediaStream(streamRef.current.getAudioTracks());
    const recorder = new MediaRecorder(audioStream, { mimeType: "audio/webm" });
    const audioChunks: Blob[] = [];
    recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunks.push(e.data); };
    recorder.onstop = () => {
      const blob = new Blob(audioChunks, { type: "audio/webm" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audio-${Date.now()}.webm`;
      a.click();
      URL.revokeObjectURL(url);
    };
    recorder.start();
    return recorder;
  }, []);

  const togglePip = useCallback(async () => {
    const pipCanvas = pipCanvasRef.current;
    const pipVideo = pipVideoRef.current;
    if (!pipCanvas || !pipVideo) return;
    if (state.isPip) {
      try { if (document.pictureInPictureElement) await document.exitPictureInPicture(); } catch {}
      setState((s) => ({ ...s, isPip: false }));
      return;
    }
    try {
      const stream = pipCanvas.captureStream(30);
      pipVideo.srcObject = stream;
      await pipVideo.play();
      await pipVideo.requestPictureInPicture();
      setState((s) => ({ ...s, isPip: true }));
    } catch { console.error("PiP not supported"); }
  }, [state.isPip]);

  const setCenterImage = useCallback((url: string) => {
    if (url) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = url;
      img.onload = () => { centerImageObjRef.current = img; };
    } else {
      centerImageObjRef.current = null;
    }
  }, []);

  return {
    state, sensitivity, setSensitivity, smoothness, setSmoothness,
    currentStyle, setCurrentStyle, theme, setTheme,
    orientation, setOrientation,
    canvasRef, pipCanvasRef, pipVideoRef, setCenterImage,
    startMic, stopMic, toggleRecording, togglePip, exportAudioOnly,
  };
}
