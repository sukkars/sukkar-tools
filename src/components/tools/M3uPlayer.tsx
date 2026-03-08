import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Upload, Trash2, List, Radio } from "lucide-react";
import { toast } from "sonner";

interface Channel {
  name: string;
  url: string;
  group?: string;
  logo?: string;
}

function parseM3U(text: string): Channel[] {
  const lines = text.split("\n").map((l) => l.trim());
  const channels: Channel[] = [];
  let current: Partial<Channel> = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("#EXTINF:")) {
      const nameMatch = line.match(/,(.+)$/);
      const logoMatch = line.match(/tvg-logo="([^"]*)"/) ;
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
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideo, setIsVideo] = useState(false);

  const activeChannel = activeIdx >= 0 ? channels[activeIdx] : null;
  const currentUrl = mode === "single" ? streamUrl : activeChannel?.url || "";

  const playStream = useCallback((url: string) => {
    setError("");
    const isVid = /\.(mp4|mkv|ts|m3u8)(\?|$)/i.test(url) || url.includes("video");
    setIsVideo(isVid);

    // Try loading with appropriate element
    setTimeout(() => {
      const el = isVid ? videoRef.current : audioRef.current;
      if (!el) return;
      el.src = url;
      el.volume = volume / 100;
      el.muted = muted;
      el.play().then(() => setPlaying(true)).catch((e) => {
        // If audio fails, try video and vice versa
        setError(`Playback error: ${e.message}`);
        setPlaying(false);
      });
    }, 50);
  }, [volume, muted]);

  const handlePlay = () => {
    if (!currentUrl) return;
    playStream(currentUrl);
  };

  const handlePause = () => {
    audioRef.current?.pause();
    videoRef.current?.pause();
    setPlaying(false);
  };

  const selectChannel = (idx: number) => {
    setActiveIdx(idx);
    audioRef.current?.pause();
    videoRef.current?.pause();
    playStream(channels[idx].url);
  };

  const prev = () => { if (channels.length > 0) selectChannel((activeIdx - 1 + channels.length) % channels.length); };
  const next = () => { if (channels.length > 0) selectChannel((activeIdx + 1) % channels.length); };

  useEffect(() => {
    const a = audioRef.current;
    const v = videoRef.current;
    if (a) { a.volume = volume / 100; a.muted = muted; }
    if (v) { v.volume = volume / 100; v.muted = muted; }
  }, [volume, muted]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseM3U(text);
      if (parsed.length === 0) { toast.error("No channels found in file"); return; }
      setChannels(parsed);
      setMode("playlist");
      toast.success(`Loaded ${parsed.length} channels`);
    };
    reader.readAsText(file);
  };

  const handleUrlLoad = async () => {
    if (!streamUrl.endsWith(".m3u") && !streamUrl.endsWith(".m3u8") && !streamUrl.includes("m3u")) {
      // Single stream mode
      playStream(streamUrl);
      return;
    }
    try {
      const res = await fetch(streamUrl);
      const text = await res.text();
      const parsed = parseM3U(text);
      if (parsed.length > 0) {
        setChannels(parsed);
        setMode("playlist");
        toast.success(`Loaded ${parsed.length} channels`);
      } else {
        playStream(streamUrl);
      }
    } catch {
      // Treat as direct stream
      playStream(streamUrl);
    }
  };

  const filteredChannels = channels.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.group || "").toLowerCase().includes(search.toLowerCase())
  );

  const groups = [...new Set(channels.map((c) => c.group).filter(Boolean))];

  return (
    <div className="space-y-4">
      <h2 className="tool-title">M3U Player</h2>
      <p className="tool-description">Play single streams or load M3U playlists</p>

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
          className="tool-input flex-1" />
        <button onClick={handleUrlLoad} className="tool-btn !px-4">
          <Play className="w-4 h-4" />
        </button>
      </div>

      {/* File upload */}
      <label className="tool-btn-outline w-full cursor-pointer text-center block">
        <Upload className="w-4 h-4 inline mr-2" /> Load M3U File
        <input type="file" accept=".m3u,.m3u8,.txt" onChange={handleFileUpload} className="hidden" />
      </label>

      {/* Error */}
      {error && <div className="text-sm text-destructive bg-destructive/10 rounded-lg p-3">{error}</div>}

      {/* Video player */}
      <video ref={videoRef} controls={isVideo && playing} className={`w-full rounded-xl ${isVideo && playing ? "block" : "hidden"}`} />

      {/* Audio element (hidden) */}
      <audio ref={audioRef} onEnded={next} onError={() => setError("Stream failed to load")} />

      {/* Now playing & controls */}
      <div className="tool-card !p-4 space-y-3">
        <div className="text-center">
          <div className="text-sm text-muted-foreground">Now Playing</div>
          <div className="font-semibold truncate">
            {playing ? (activeChannel?.name || streamUrl || "—") : "—"}
          </div>
        </div>

        <div className="flex items-center justify-center gap-3">
          {mode === "playlist" && (
            <button onClick={prev} disabled={channels.length === 0} className="p-2 rounded-lg hover:bg-muted disabled:opacity-40">
              <SkipBack className="w-5 h-5" />
            </button>
          )}
          {playing ? (
            <button onClick={handlePause} className="tool-btn !rounded-full !p-3">
              <Pause className="w-5 h-5" />
            </button>
          ) : (
            <button onClick={handlePlay} disabled={!currentUrl} className="tool-btn !rounded-full !p-3 disabled:opacity-40">
              <Play className="w-5 h-5" />
            </button>
          )}
          {mode === "playlist" && (
            <button onClick={next} disabled={channels.length === 0} className="p-2 rounded-lg hover:bg-muted disabled:opacity-40">
              <SkipForward className="w-5 h-5" />
            </button>
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
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search channels..." className="tool-input flex-1" />
            <button onClick={() => { setChannels([]); setActiveIdx(-1); handlePause(); }}
              className="tool-btn-outline !px-3" title="Clear playlist">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="text-xs text-muted-foreground">{channels.length} channels{groups.length > 0 ? ` · ${groups.length} groups` : ""}</div>

          <div className="tool-card !p-0 max-h-80 overflow-y-auto divide-y divide-border">
            {filteredChannels.map((ch, i) => {
              const realIdx = channels.indexOf(ch);
              return (
                <button key={i} onClick={() => selectChannel(realIdx)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-muted/50 ${
                    realIdx === activeIdx ? "bg-primary/10" : ""
                  }`}>
                  {ch.logo ? (
                    <img src={ch.logo} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  ) : (
                    <div className="w-8 h-8 rounded bg-muted flex items-center justify-center flex-shrink-0">
                      <Radio className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className={`text-sm truncate ${realIdx === activeIdx ? "font-semibold text-primary" : ""}`}>
                      {ch.name}
                    </div>
                    {ch.group && <div className="text-xs text-muted-foreground truncate">{ch.group}</div>}
                  </div>
                  {realIdx === activeIdx && playing && (
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse flex-shrink-0" />
                  )}
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
