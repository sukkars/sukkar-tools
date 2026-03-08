import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Upload, Trash2, List, Radio, PictureInPicture2, Maximize2, Minimize2, Settings, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import HowToUse from "./HowToUse";

interface Channel {
  name: string;
  url: string;
  group?: string;
  logo?: string;
  qualities?: { label: string; url: string }[];
}

interface RawChannel {
  name: string;
  url: string;
  group?: string;
  logo?: string;
}

function parseM3U(text: string): RawChannel[] {
  const lines = text.split("\n").map((l) => l.trim());
  const channels: RawChannel[] = [];
  let current: Partial<RawChannel> = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("#EXTINF:")) {
      const nameMatch = line.match(/,(.+)$/);
      const logoMatch = line.match(/tvg-logo="([^"]*)"/);
      const groupMatch = line.match(/group-title="([^"]*)"/);
      current = {
        name: nameMatch?.[1]?.trim() || `Channel ${channels.length + 1}`,
        logo: logoMatch?.[1] || undefined,
        group: groupMatch?.[1] || undefined,
      };
    } else if (line && !line.startsWith("#")) {
      channels.push({ name: current.name || `Channel ${channels.length + 1}`, url: line, group: current.group, logo: current.logo });
      current = {};
    }
  }
  return channels;
}

// Group same-name channels as quality variants
function groupChannels(raw: RawChannel[]): Channel[] {
  const map = new Map<string, Channel>();
  for (const ch of raw) {
    const key = ch.name.toLowerCase().trim();
    if (map.has(key)) {
      const existing = map.get(key)!;
      if (!existing.qualities) {
        existing.qualities = [{ label: "Source 1", url: existing.url }];
      }
      existing.qualities.push({ label: `Source ${existing.qualities.length + 1}`, url: ch.url });
    } else {
      map.set(key, { ...ch });
    }
  }
  return [...map.values()];
}

const DEMO_URL = "https://peacetv.vercel.app/alltv.m3u";

const M3uPlayer = () => {
  const [mode, setMode] = useState<"single" | "playlist">("single");
  const [streamUrl, setStreamUrl] = useState("");
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [isVideo, setIsVideo] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showQuality, setShowQuality] = useState(false);
  const [activeQuality, setActiveQuality] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeChannel = activeIdx >= 0 ? channels[activeIdx] : null;
  const currentUrl = mode === "single" ? streamUrl : activeChannel?.url || "";

  const playStream = useCallback((url: string) => {
    setError("");
    const isVid = /\.(mp4|mkv|ts|m3u8)(\?|$)/i.test(url) || url.includes("video");
    setIsVideo(isVid);
    setTimeout(() => {
      const el = isVid ? videoRef.current : audioRef.current;
      if (!el) return;
      el.src = url;
      el.volume = volume / 100;
      el.muted = muted;
      el.playbackRate = playbackRate;
      el.play().then(() => setPlaying(true)).catch((e) => {
        setError(`Playback error: ${e.message}`);
        setPlaying(false);
      });
    }, 50);
  }, [volume, muted, playbackRate]);

  const handlePlay = () => { if (!currentUrl) return; playStream(currentUrl); };
  const handlePause = () => { audioRef.current?.pause(); videoRef.current?.pause(); setPlaying(false); };

  const selectChannel = (idx: number, qualityIdx = 0) => {
    setActiveIdx(idx);
    setActiveQuality(qualityIdx);
    audioRef.current?.pause();
    videoRef.current?.pause();
    const ch = channels[idx];
    const url = ch.qualities ? ch.qualities[qualityIdx].url : ch.url;
    playStream(url);
  };

  const switchQuality = (qIdx: number) => {
    if (!activeChannel?.qualities) return;
    setActiveQuality(qIdx);
    setShowQuality(false);
    const url = activeChannel.qualities[qIdx].url;
    audioRef.current?.pause();
    videoRef.current?.pause();
    playStream(url);
  };

  const prev = () => { if (channels.length > 0) selectChannel((activeIdx - 1 + channels.length) % channels.length); };
  const next = () => { if (channels.length > 0) selectChannel((activeIdx + 1) % channels.length); };

  useEffect(() => {
    const a = audioRef.current; const v = videoRef.current;
    if (a) { a.volume = volume / 100; a.muted = muted; }
    if (v) { v.volume = volume / 100; v.muted = muted; }
  }, [volume, muted]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = groupChannels(parseM3U(text));
      if (parsed.length === 0) { toast.error("No channels found"); return; }
      setChannels(parsed); setMode("playlist");
      toast.success(`Loaded ${parsed.length} channels`);
    };
    reader.readAsText(file);
  };

  const loadUrl = async (url: string) => {
    if (!url) return;
    const isM3u = /\.m3u8?/i.test(url) || url.includes("m3u");
    if (!isM3u) { playStream(url); return; }
    try {
      const res = await fetch(url);
      const text = await res.text();
      const parsed = groupChannels(parseM3U(text));
      if (parsed.length > 0) {
        setChannels(parsed); setMode("playlist");
        toast.success(`Loaded ${parsed.length} channels`);
      } else { playStream(url); }
    } catch { playStream(url); }
  };

  const handleUrlLoad = () => loadUrl(streamUrl);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setFullscreen(false)).catch(() => {});
    }
  };

  const openPiP = async () => {
    const v = videoRef.current;
    if (!v || !v.src) { toast.error("PiP requires an active video stream"); return; }
    try {
      await v.requestPictureInPicture();
    } catch (e: any) {
      toast.error("PiP not supported: " + e.message);
    }
  };

  const changeSpeed = () => {
    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const next = speeds[(speeds.indexOf(playbackRate) + 1) % speeds.length];
    setPlaybackRate(next);
    if (audioRef.current) audioRef.current.playbackRate = next;
    if (videoRef.current) videoRef.current.playbackRate = next;
  };

  useEffect(() => {
    const handler = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const filteredChannels = channels.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.group || "").toLowerCase().includes(search.toLowerCase())
  );
  const groups = [...new Set(channels.map((c) => c.group).filter(Boolean))];

  return (
    <div className="space-y-4">
      <h2 className="tool-title">M3U Player</h2>
      <p className="tool-description">Play streams or load M3U playlists with quality selection</p>

      {/* Mode tabs */}
      <div className="flex gap-2">
        <button onClick={() => setMode("single")} className={mode === "single" ? "tool-btn text-xs" : "tool-btn-outline text-xs"}>
          <Radio className="w-3 h-3" /> Single Stream
        </button>
        <button onClick={() => setMode("playlist")} className={mode === "playlist" ? "tool-btn text-xs" : "tool-btn-outline text-xs"}>
          <List className="w-3 h-3" /> Playlist
        </button>
      </div>

      {/* URL input */}
      <div className="flex gap-2">
        <input value={streamUrl} onChange={(e) => setStreamUrl(e.target.value)}
          placeholder="Enter stream URL or M3U playlist URL..."
          className="tool-input flex-1" onKeyDown={(e) => e.key === "Enter" && handleUrlLoad()} />
        <button onClick={handleUrlLoad} className="tool-btn !px-4"><Play className="w-4 h-4" /></button>
      </div>

      {/* Demo suggestion */}
      {channels.length === 0 && (
        <button
          onClick={() => { setStreamUrl(DEMO_URL); loadUrl(DEMO_URL); }}
          className="w-full text-left tool-card !p-3 hover:border-primary/30 transition-colors cursor-pointer flex items-center gap-3"
        >
          <ExternalLink className="w-4 h-4 text-primary flex-shrink-0" />
          <div className="min-w-0">
            <div className="text-sm font-medium">Try this: Peace TV Playlist</div>
            <div className="text-xs text-muted-foreground truncate">{DEMO_URL}</div>
          </div>
        </button>
      )}

      {/* File upload */}
      <label className="tool-btn-outline w-full cursor-pointer text-center block">
        <Upload className="w-4 h-4 inline mr-2" /> Load M3U File
        <input type="file" accept=".m3u,.m3u8,.txt" onChange={handleFileUpload} className="hidden" />
      </label>

      {error && <div className="text-sm text-destructive bg-destructive/10 rounded-lg p-3">{error}</div>}

      {/* Video player container */}
      <div ref={containerRef} className={`relative ${fullscreen ? "bg-black" : ""}`}>
        <video ref={videoRef} controls={false}
          className={`w-full rounded-xl bg-black ${isVideo && playing ? "block" : "hidden"} ${fullscreen ? "h-screen object-contain" : ""}`}
          onClick={() => playing ? handlePause() : handlePlay()} />

        {/* Overlay controls for video */}
        {isVideo && playing && (
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent flex items-center gap-2 rounded-b-xl opacity-0 hover:opacity-100 transition-opacity">
            <button onClick={handlePause} className="text-white p-1"><Pause className="w-5 h-5" /></button>
            <div className="flex-1" />
            <button onClick={changeSpeed} className="text-white text-xs font-mono px-2 py-1 rounded bg-white/20 hover:bg-white/30">{playbackRate}x</button>
            {activeChannel?.qualities && (
              <div className="relative">
                <button onClick={() => setShowQuality(!showQuality)} className="text-white p-1"><Settings className="w-4 h-4" /></button>
                {showQuality && (
                  <div className="absolute bottom-8 right-0 bg-popover border border-border rounded-lg shadow-lg py-1 min-w-[120px] z-10">
                    {activeChannel.qualities.map((q, qi) => (
                      <button key={qi} onClick={() => switchQuality(qi)}
                        className={`w-full text-left px-3 py-1.5 text-sm hover:bg-muted ${qi === activeQuality ? "text-primary font-medium" : ""}`}>
                        {q.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <button onClick={openPiP} className="text-white p-1" title="Picture-in-Picture"><PictureInPicture2 className="w-4 h-4" /></button>
            <button onClick={toggleFullscreen} className="text-white p-1">
              {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>

      <audio ref={audioRef} onEnded={next} onError={() => setError("Stream failed to load")} />

      {/* Controls card */}
      <div className="tool-card !p-4 space-y-3">
        <div className="text-center">
          <div className="text-sm text-muted-foreground">Now Playing</div>
          <div className="font-semibold truncate">{playing ? (activeChannel?.name || streamUrl || "—") : "—"}</div>
          {playing && activeChannel?.qualities && (
            <div className="text-xs text-primary mt-0.5">{activeChannel.qualities[activeQuality]?.label || "Default"}</div>
          )}
        </div>

        <div className="flex items-center justify-center gap-3">
          {mode === "playlist" && <button onClick={prev} disabled={channels.length === 0} className="p-2 rounded-lg hover:bg-muted disabled:opacity-40"><SkipBack className="w-5 h-5" /></button>}
          {playing ? (
            <button onClick={handlePause} className="tool-btn !rounded-full !p-3"><Pause className="w-5 h-5" /></button>
          ) : (
            <button onClick={handlePlay} disabled={!currentUrl} className="tool-btn !rounded-full !p-3 disabled:opacity-40"><Play className="w-5 h-5" /></button>
          )}
          {mode === "playlist" && <button onClick={next} disabled={channels.length === 0} className="p-2 rounded-lg hover:bg-muted disabled:opacity-40"><SkipForward className="w-5 h-5" /></button>}
        </div>

        {/* Extra controls row */}
        <div className="flex items-center justify-center gap-2">
          <button onClick={changeSpeed} className="text-xs font-mono px-2 py-1 rounded-md bg-muted hover:bg-muted/80 transition-colors">{playbackRate}x</button>
          {activeChannel?.qualities && (
            <div className="relative">
              <button onClick={() => setShowQuality(!showQuality)} className="text-xs px-2 py-1 rounded-md bg-muted hover:bg-muted/80 flex items-center gap-1">
                <Settings className="w-3 h-3" /> Quality
              </button>
              {showQuality && (
                <div className="absolute bottom-8 left-0 bg-popover border border-border rounded-lg shadow-lg py-1 min-w-[120px] z-10">
                  {activeChannel.qualities.map((q, qi) => (
                    <button key={qi} onClick={() => switchQuality(qi)}
                      className={`w-full text-left px-3 py-1.5 text-sm hover:bg-muted ${qi === activeQuality ? "text-primary font-medium" : ""}`}>
                      {q.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          {isVideo && playing && (
            <>
              <button onClick={openPiP} className="text-xs px-2 py-1 rounded-md bg-muted hover:bg-muted/80 flex items-center gap-1">
                <PictureInPicture2 className="w-3 h-3" /> PiP
              </button>
              <button onClick={toggleFullscreen} className="text-xs px-2 py-1 rounded-md bg-muted hover:bg-muted/80 flex items-center gap-1">
                {fullscreen ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />} Fullscreen
              </button>
            </>
          )}
        </div>

        {/* Volume */}
        <div className="flex items-center gap-3">
          <button onClick={() => setMuted(!muted)} className="text-muted-foreground hover:text-foreground">
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input type="range" min={0} max={100} value={muted ? 0 : volume}
            onChange={(e) => { setVolume(Number(e.target.value)); setMuted(false); }}
            className="flex-1 h-2 rounded-full bg-muted appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary" />
          <span className="text-xs font-mono text-muted-foreground w-8">{muted ? 0 : volume}%</span>
        </div>
      </div>

      {/* Playlist */}
      {mode === "playlist" && channels.length > 0 && (
        <div className="space-y-2">
          <div className="flex gap-2 items-center">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search channels..." className="tool-input flex-1" />
            <button onClick={() => { setChannels([]); setActiveIdx(-1); handlePause(); }} className="tool-btn-outline !px-3" title="Clear playlist">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <div className="text-xs text-muted-foreground">{channels.length} channels{groups.length > 0 ? ` · ${groups.length} groups` : ""}</div>

          <div className="tool-card !p-0 max-h-80 overflow-y-auto divide-y divide-border">
            {filteredChannels.map((ch, i) => {
              const realIdx = channels.indexOf(ch);
              return (
                <button key={i} onClick={() => selectChannel(realIdx)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-muted/50 ${realIdx === activeIdx ? "bg-primary/10" : ""}`}>
                  {ch.logo ? (
                    <img src={ch.logo} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  ) : (
                    <div className="w-8 h-8 rounded bg-muted flex items-center justify-center flex-shrink-0">
                      <Radio className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className={`text-sm truncate ${realIdx === activeIdx ? "font-semibold text-primary" : ""}`}>{ch.name}</div>
                    <div className="flex items-center gap-2">
                      {ch.group && <span className="text-xs text-muted-foreground truncate">{ch.group}</span>}
                      {ch.qualities && <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">{ch.qualities.length} sources</span>}
                    </div>
                  </div>
                  {realIdx === activeIdx && playing && <span className="w-2 h-2 rounded-full bg-primary animate-pulse flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default M3uPlayer;
