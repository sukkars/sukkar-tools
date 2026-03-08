import { useState } from "react";
import { Link2, Copy, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ShortenedUrl {
  original: string;
  short: string;
  service: string;
}

const SERVICES = [
  { id: "isgd", label: "is.gd", shorten: async (url: string) => {
    const res = await fetch(`https://is.gd/create.php?format=json&url=${encodeURIComponent(url)}`);
    const data = await res.json();
    if (data.errorcode) throw new Error(data.errormessage);
    return data.shorturl;
  }},
  { id: "vgd", label: "v.gd", shorten: async (url: string) => {
    const res = await fetch(`https://v.gd/create.php?format=json&url=${encodeURIComponent(url)}`);
    const data = await res.json();
    if (data.errorcode) throw new Error(data.errormessage);
    return data.shorturl;
  }},
];

const UrlShortener = () => {
  const [url, setUrl] = useState("");
  const [service, setService] = useState("isgd");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ShortenedUrl[]>([]);
  const [shortenAll, setShortenAll] = useState(false);

  const shorten = async () => {
    const trimmed = url.trim();
    if (!trimmed) { toast.error("URL দিন"); return; }
    if (!/^https?:\/\/.+/i.test(trimmed)) { toast.error("Valid URL দিন (http:// বা https:// সহ)"); return; }

    setLoading(true);
    try {
      if (shortenAll) {
        const promises = SERVICES.map(async (s) => {
          try {
            const short = await s.shorten(trimmed);
            return { original: trimmed, short, service: s.label };
          } catch {
            return { original: trimmed, short: "Error", service: s.label };
          }
        });
        const all = await Promise.all(promises);
        setResults(prev => [...all, ...prev]);
        toast.success(`${SERVICES.length} সার্ভিসে শর্ট হয়েছে!`);
      } else {
        const svc = SERVICES.find(s => s.id === service)!;
        const short = await svc.shorten(trimmed);
        setResults(prev => [{ original: trimmed, short, service: svc.label }, ...prev]);
        toast.success("URL শর্ট হয়েছে!");
      }
    } catch (e: any) {
      toast.error(e.message || "শর্ট করা যায়নি");
    } finally {
      setLoading(false);
    }
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("কপি হয়েছে!");
  };

  return (
    <div className="space-y-4">
      <h2 className="tool-title">URL Shortener</h2>
      <p className="tool-description">is.gd ও v.gd দিয়ে ফ্রিতে লিংক শর্ট করুন — কোনো সাইন আপ লাগবে না</p>

      <div className="tool-card !p-4 space-y-3">
        <div>
          <label className="tool-label">URL</label>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/very-long-url..."
            className="tool-input"
            onKeyDown={(e) => e.key === "Enter" && shorten()}
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="tool-label !mb-0 text-xs">Service:</label>
            {!shortenAll && (
              <div className="flex gap-1">
                {SERVICES.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setService(s.id)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      service === s.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
            <input type="checkbox" checked={shortenAll} onChange={(e) => setShortenAll(e.target.checked)} className="rounded" />
            সবগুলো দিয়ে শর্ট করুন
          </label>
        </div>

        <button onClick={shorten} disabled={loading} className="tool-btn w-full disabled:opacity-50">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> শর্ট করা হচ্ছে...</> : <><Link2 className="w-4 h-4" /> শর্ট করুন</>}
        </button>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">রেজাল্ট ({results.length})</h3>
            <button onClick={() => setResults([])} className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1">
              <Trash2 className="w-3 h-3" /> ক্লিয়ার
            </button>
          </div>
          <div className="space-y-2">
            {results.map((r, i) => (
              <div key={i} className="tool-card !p-3 flex items-center gap-3">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium flex-shrink-0">{r.service}</span>
                <div className="flex-1 min-w-0">
                  {r.short !== "Error" ? (
                    <a href={r.short} target="_blank" rel="noopener" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                      {r.short} <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-sm text-destructive">Error</span>
                  )}
                  <p className="text-xs text-muted-foreground truncate">{r.original}</p>
                </div>
                {r.short !== "Error" && (
                  <button onClick={() => copy(r.short)} className="tool-btn-outline !px-2 !py-1 text-xs flex-shrink-0">
                    <Copy className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UrlShortener;
