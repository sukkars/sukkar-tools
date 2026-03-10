import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Upload, Trash2, List, Radio, PictureInPicture2, Maximize2, Minimize2, Settings, ExternalLink, Search, ChevronRight, Tv } from "lucide-react";
import { toast } from "sonner";
import Hls from "hls.js";

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
      const nameMatch = line.match(/tvg-name="([^"]*)"/) || line.match(/,(.+)$/);
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
  const [mode, setMode] = useState<"single" | "playlist">("playlist");
  const [streamUrl, setStreamUrl] = useState("");
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [fullscreen, setFullscreen] = useState(false);
  const [showQuality, setShowQuality] = useState(false);
  const [activeQuality, setActiveQuality] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [hlsLevels, setHlsLevels] = useState<any[]>([]);
  const [currentLevel, setCurrentLevel] = useState(-1);

  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeChannel = activeIdx >= 0 ? channels[activeIdx] : null;
  const currentUrl = mode === "single" ? streamUrl : (activeChannel?.qualities ? activeChannel.qualities[activeQuality].url : activeChannel?.url || "");

  const stopStream = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.src = "";
      videoRef.current.load();
    }
    setPlaying(false);
    setHlsLevels([]);
    setCurrentLevel(-1);
  }, []);

  const playStream = useCallback((url: string) => {
    if (!url) return;
    stopStream();
    setError("");

    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported() && url.includes(".m3u8")) {
      const hls = new Hls({
        capLevelToPlayerSize: true,
        autoStartLoad: true
      });
      hlsRef.current = hls;
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setHlsLevels(hls.levels);
        video.play().catch(e => {
            if (e.name !== "AbortError") setError(`Playback error: ${e.message}`);
        });
      });
      hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
        setCurrentLevel(data.level);
      });
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setError("Network error, trying to recover...");
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setError("Media error, trying to recover...");
              hls.recoverMediaError();
              break;
            default:
              setError("An unrecoverable error occurred");
              stopStream();
              break;
          }
        }
      });
    } else {
      video.src = url;
      video.play().catch(e => {
        if (e.name !== "AbortError") setError(`Playback error: ${e.message}`);
      });
    }
    setPlaying(true);
  }, [stopStream]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (playing) {
        videoRef.current.pause();
        setPlaying(false);
      } else {
        videoRef.current.play().then(() => setPlaying(true));
      }
    }
  };

  const selectChannel = (idx: number, qualityIdx = 0) => {
    setActiveIdx(idx);
    setActiveQuality(qualityIdx);
    const ch = channels[idx];
    const url = ch.qualities ? ch.qualities[qualityIdx].url : ch.url;
    playStream(url);
  };

  const switchHlsQuality = (level: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = level;
      setCurrentLevel(level);
      setShowQuality(false);
    }
  };

  const prev = () => { if (channels.length > 0) selectChannel((activeIdx - 1 + channels.length) % channels.length); };
  const next = () => { if (channels.length > 0) selectChannel((activeIdx + 1) % channels.length); };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume / 100;
      videoRef.current.muted = muted;
      videoRef.current.playbackRate = playbackRate;
    }
  }, [volume, muted, playbackRate]);

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
      if (parsed.length > 0) selectChannel(0);
    };
    reader.readAsText(file);
  };

  const loadUrl = async (url: string) => {
    if (!url) return;
    const isPlaylist = url.endsWith(".m3u") || url.includes("m3u");
    if (isPlaylist) {
      try {
        const res = await fetch(url);
        const text = await res.text();
        const parsed = groupChannels(parseM3U(text));
        if (parsed.length > 0) {
          setChannels(parsed); setMode("playlist");
          toast.success(`Loaded ${parsed.length} channels`);
          selectChannel(0);
        } else { playStream(url); }
      } catch { playStream(url); }
    } else { playStream(url); }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setFullscreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const handler = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => {
        document.removeEventListener("fullscreenchange", handler);
        stopStream();
    };
  }, [stopStream]);

  const filteredChannels = channels.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.group || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="tool-title">M3U Player Pro</h2>
          <p className="tool-description">High-performance stream player with HLS support and sidebar</p>
        </div>
        <div className="flex gap-2">
            <label className="tool-btn-outline cursor-pointer text-xs py-2">
                <Upload className="w-3.5 h-3.5 mr-2" /> Load M3U
                <input type="file" accept=".m3u,.m3u8,.txt" onChange={handleFileUpload} className="hidden" />
            </label>
            <button onClick={() => { setStreamUrl(DEMO_URL); loadUrl(DEMO_URL); }} className="tool-btn text-xs py-2">
                <Tv className="w-3.5 h-3.5 mr-2" /> Try Demo
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-card border border-border rounded-2xl overflow-hidden shadow-xl min-h-[600px]">
        {/* Main Player Section */}
        <div className="lg:col-span-8 flex flex-col bg-black/5">
            <div ref={containerRef} className={`relative aspect-video bg-black group ${fullscreen ? "fixed inset-0 z-[100] w-full h-full" : ""}`}>
                <video ref={videoRef} className="w-full h-full" onClick={handlePlayPause} playsInline />
                
                {/* Connecting overlay */}
                {!playing && mode === "playlist" && channels.length > 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10 pointer-events-none">
                        <div className="text-center">
                            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-white font-medium">Connecting Stream...</p>
                        </div>
                    </div>
                )}

                {/* Player Controls Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-4">
                        <button onClick={handlePlayPause} className="text-white hover:text-primary transition-colors">
                            {playing ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                        </button>
                        <div className="flex-1">
                            <div className="text-white text-sm font-medium truncate">
                                {activeChannel?.name || "No Channel Selected"}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Live</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Quality Selector */}
                            {(hlsLevels.length > 0) && (
                                <div className="relative">
                                    <button onClick={() => setShowQuality(!showQuality)} className="text-gray-300 hover:text-white flex items-center gap-1 text-[10px] font-bold">
                                        {currentLevel === -1 ? "AUTO" : `${hlsLevels[currentLevel]?.height}P`}
                                        <Settings className="w-3.5 h-3.5" />
                                    </button>
                                    {showQuality && (
                                        <div className="absolute bottom-full right-0 mb-2 bg-popover border border-border rounded-xl shadow-2xl py-2 min-w-[120px] z-50 overflow-hidden">
                                            <div className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground uppercase border-b border-border/50 mb-1">Quality</div>
                                            <button onClick={() => switchHlsQuality(-1)} className={`w-full text-left px-4 py-2 text-xs hover:bg-muted ${currentLevel === -1 ? "text-primary font-bold" : ""}`}>Auto</button>
                                            {hlsLevels.map((l, i) => (
                                                <button key={i} onClick={() => switchHlsQuality(i)} className={`w-full text-left px-4 py-2 text-xs hover:bg-muted ${currentLevel === i ? "text-primary font-bold" : ""}`}>{l.height}p</button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                            <button onClick={() => videoRef.current?.requestPictureInPicture()} className="text-gray-300 hover:text-white"><PictureInPicture2 className="w-5 h-5" /></button>
                            <button onClick={toggleFullscreen} className="text-gray-300 hover:text-white">
                                {fullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Info and Volume */}
            <div className="p-6 space-y-4 flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center border border-border group overflow-hidden shadow-inner">
                            {activeChannel?.logo ? (
                                <img src={activeChannel.logo} className="w-full h-full object-contain" alt="" onError={e => (e.target as any).style.display='none'} />
                            ) : (
                                <Tv className="w-6 h-6 text-muted-foreground" />
                            )}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">{activeChannel?.name || "Select a channel"}</h3>
                            <p className="text-xs text-muted-foreground">{activeChannel?.group || "General"}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-muted/30 p-2 rounded-xl border border-border/50">
                        <button onClick={() => setMuted(!muted)} className="p-2 hover:bg-muted rounded-lg transition-colors">
                            {muted || volume === 0 ? <VolumeX className="w-4 h-4 text-muted-foreground" /> : <Volume2 className="w-4 h-4 text-primary" />}
                        </button>
                        <input type="range" min="0" max="100" value={muted ? 0 : volume} onChange={e => {setVolume(Number(e.target.value)); setMuted(false);}} 
                            className="w-24 h-1.5 rounded-full bg-muted appearance-none cursor-pointer accent-primary" />
                        <span className="text-[10px] font-mono w-8 text-right text-muted-foreground">{muted ? 0 : volume}%</span>
                    </div>
                </div>

                <div className="flex gap-2">
                    <input value={streamUrl} onChange={e => setStreamUrl(e.target.value)} placeholder="Paste stream URL or M3U link..." 
                        className="tool-input flex-1 text-sm h-11" onKeyDown={e => e.key === "Enter" && loadUrl(streamUrl)} />
                    <button onClick={() => loadUrl(streamUrl)} className="tool-btn !h-11 px-6">Play</button>
                </div>

                {error && <div className="text-xs text-red-500 bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full" /> {error}
                </div>}
            </div>
        </div>

        {/* Sidebar Directory */}
        <div className="lg:col-span-4 flex flex-col border-l border-border bg-muted/10 h-full">
            <div className="p-4 border-b border-border bg-card">
                <div className="flex items-center justify-between mb-3">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Directory</h4>
                    <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">{channels.length} CH</span>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search channels..." 
                        className="tool-input !pl-10 !py-2 text-sm !bg-muted/50 focus:!bg-card" />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
                {channels.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center h-full opacity-50">
                        <Tv className="w-12 h-12 mb-3" />
                        <p className="text-sm font-medium">Your playlist is empty</p>
                        <p className="text-[10px]">Load a file or paste a link to start</p>
                    </div>
                ) : (
                    filteredChannels.map((ch, idx) => {
                        const originalIdx = channels.indexOf(ch);
                        const isActive = originalIdx === activeIdx;
                        return (
                            <button key={originalIdx} onClick={() => selectChannel(originalIdx)}
                                className={`w-full group flex items-center gap-3 p-2.5 rounded-xl text-left transition-all ${isActive ? "bg-primary/10 border border-primary/20 shadow-sm" : "hover:bg-muted border border-transparent"}`}>
                                <div className={`w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center border transition-all ${isActive ? "bg-primary border-primary" : "bg-card border-border/50 group-hover:border-primary/30"}`}>
                                    {ch.logo ? (
                                        <img src={ch.logo} className="w-full h-full object-contain p-1" alt="" onError={e => (e.target as any).style.display='none'} />
                                    ) : (
                                        <Tv className={`w-4 h-4 ${isActive ? "text-white" : "text-muted-foreground"}`} />
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className={`text-sm font-semibold truncate ${isActive ? "text-primary" : "text-card-foreground"}`}>{ch.name}</p>
                                    <p className="text-[10px] text-muted-foreground truncate opacity-70">{ch.group || "General"}</p>
                                </div>
                                {isActive ? (
                                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                    </div>
                                ) : (
                                    <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                )}
                            </button>
                        );
                    })
                )}
            </div>

            {channels.length > 0 && (
                <div className="p-3 border-t border-border bg-card/50">
                    <button onClick={() => { setChannels([]); setActiveIdx(-1); stopStream(); }} 
                        className="w-full py-2 flex items-center justify-center gap-2 text-[10px] font-bold text-muted-foreground hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-all">
                        <Trash2 className="w-3.5 h-3.5" /> Clear Playlist
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default M3uPlayer;
