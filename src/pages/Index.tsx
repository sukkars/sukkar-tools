import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { tools, categories } from "@/lib/tools";
import { Menu, X, Wrench, Search, Home, HelpCircle, ChevronDown, ChevronUp, Settings2, Key, AlertTriangle, Sun, Moon, Clock, Trash2, Mail } from "lucide-react";
import TextCaseConverter from "@/components/tools/TextCaseConverter";
import WordCounter from "@/components/tools/WordCounter";
import PasswordGenerator from "@/components/tools/PasswordGenerator";
import JsonFormatter from "@/components/tools/JsonFormatter";
import Base64Tool from "@/components/tools/Base64Tool";
import ColorPicker from "@/components/tools/ColorPicker";
import LoremIpsumGenerator from "@/components/tools/LoremIpsumGenerator";
import UnitConverter from "@/components/tools/UnitConverter";
import AgeCalculator from "@/components/tools/AgeCalculator";
import QrCodeGenerator from "@/components/tools/QrCodeGenerator";
import MarkdownPreview from "@/components/tools/MarkdownPreview";
import UuidGenerator from "@/components/tools/UuidGenerator";
import HtmlBBCodeConverter from "@/components/tools/HtmlBBCodeConverter";
import WhatsAppLinkGenerator from "@/components/tools/WhatsAppLinkGenerator";
import FreshNotes from "@/components/tools/FreshNotes";
import WooCsvGenerator from "@/components/tools/WooCsvGenerator";
import SoundVisualizer from "@/components/tools/SoundVisualizer";
import Calculator from "@/components/tools/Calculator";
import BmiCalculator from "@/components/tools/BmiCalculator";
import TextToSpeech from "@/components/tools/TextToSpeech";
import SpeechToText from "@/components/tools/SpeechToText";
import TypingTest from "@/components/tools/TypingTest";
import DiffChecker from "@/components/tools/DiffChecker";
import StopwatchTimer from "@/components/tools/StopwatchTimer";
import HashGenerator from "@/components/tools/HashGenerator";
import BarcodeGenerator from "@/components/tools/BarcodeGenerator";
import ImageResizer from "@/components/tools/ImageResizer";
import InvoiceGenerator from "@/components/tools/InvoiceGenerator";
import RegexHelper from "@/components/tools/RegexHelper";
import M3uPlayer from "@/components/tools/M3uPlayer";
import DataEncoder from "@/components/tools/DataEncoder";
import SteadfastBooking from "@/components/tools/steadfast/SteadfastBooking";
import UrlShortener from "@/components/tools/UrlShortener";

const toolComponents: Record<string, React.FC> = {
  "text-case": TextCaseConverter,
  "word-counter": WordCounter,
  password: PasswordGenerator,
  json: JsonFormatter,
  base64: Base64Tool,
  "data-encoder": DataEncoder,
  color: ColorPicker,
  lorem: LoremIpsumGenerator,
  units: UnitConverter,
  age: AgeCalculator,
  qr: QrCodeGenerator,
  markdown: MarkdownPreview,
  uuid: UuidGenerator,
  "html-bbcode": HtmlBBCodeConverter,
  whatsapp: WhatsAppLinkGenerator,
  notes: FreshNotes,
  "woo-csv": WooCsvGenerator,
  "sound-viz": SoundVisualizer,
  calculator: Calculator,
  bmi: BmiCalculator,
  tts: TextToSpeech,
  stt: SpeechToText,
  typing: TypingTest,
  diff: DiffChecker,
  stopwatch: StopwatchTimer,
  hash: HashGenerator,
  barcode: BarcodeGenerator,
  "image-resize": ImageResizer,
  invoice: InvoiceGenerator,
  regex: RegexHelper,
  m3u: M3uPlayer,
  steadfast: SteadfastBooking,
  "url-shortener": UrlShortener,
};

/* ─── How To Use (inline collapsible) ─── */
const HowToUseSection = ({ stepsBn, stepsEn }: { stepsBn: string[]; stepsEn: string[] }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-8 rounded-lg border border-border overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium hover:bg-muted/50 transition-colors"
      >
        <span className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-primary" />
          কিভাবে ব্যবহার করবেন? (⁉️ How to use?)
        </span>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      {open && (
        <div className="px-4 pb-3 pt-2 border-t border-border bg-muted/20 space-y-3">
          <ol className="list-decimal list-inside space-y-1.5 text-sm text-muted-foreground">
            {stepsBn.map((step, i) => <li key={i}>{step}</li>)}
          </ol>
          <hr className="border-border" />
          <ol className="list-decimal list-inside space-y-1.5 text-sm text-muted-foreground/70">
            {stepsEn.map((step, i) => <li key={i}>{step}</li>)}
          </ol>
        </div>
      )}
    </div>
  );
};

/* ─── API Settings Panel ─── */
const ApiSettingsPanel = ({ onClose }: { onClose: () => void }) => {
  const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem("geminiApiKey_user") || "");
  const [model, setModel] = useState(() => localStorage.getItem("geminiModel_user") || "gemini-2.5-flash-lite");

  const save = () => {
    localStorage.setItem("geminiApiKey_user", geminiKey.trim());
    localStorage.setItem("geminiModel_user", model);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-foreground/30 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-background border border-border rounded-xl shadow-2xl w-full max-w-md p-5 space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-2">
          <Key className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-lg">API Settings</h3>
        </div>
        <p className="text-xs text-muted-foreground">Some tools use Google Gemini AI. Your key is stored locally in your browser and never sent to our servers.</p>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium flex items-center gap-1.5 mb-1">Google Gemini API Key <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">AI Features</span></label>
            <input value={geminiKey} onChange={e => setGeminiKey(e.target.value)} placeholder="AIza..." className="tool-input w-full text-sm" type="password" />
            <p className="text-[11px] text-muted-foreground mt-0.5">Get a free key: <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener" className="text-primary hover:underline">aistudio.google.com</a></p>
          </div>
          <div>
            <label className="text-sm font-medium flex items-center gap-1.5 mb-1">AI Model</label>
            <select value={model} onChange={e => setModel(e.target.value)} className="tool-input w-full text-sm">
              <option value="gemini-2.5-flash-lite">Gemini 2.5 Flash Lite (Fast, High Limit)</option>
              <option value="gemini-3-flash-preview">Gemini 3.0 Flash Preview (Smarter, Low Limit)</option>
            </select>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground">💡 Steadfast API keys are configured separately inside the Steadfast Booking tool.</p>

        <div className="flex gap-2 pt-1">
          <button onClick={save} className="tool-btn flex-1">Save</button>
          <button onClick={onClose} className="tool-btn-outline flex-1">Cancel</button>
        </div>
      </div>
    </div>
  );
};

/* ─── API Note below tool ─── */
const ApiNote = ({ tool }: { tool: typeof tools[0] }) => {
  if (!tool.requiresApi) return null;
  const hasKey = !!localStorage.getItem(tool.requiresApi.key);
  return (
    <div className={`mt-3 flex items-center gap-2 text-xs rounded-lg px-3 py-2 border ${hasKey ? "border-primary/20 bg-primary/5 text-primary" : "border-yellow-500/20 bg-yellow-500/5 text-yellow-600 dark:text-yellow-400"}`}>
      {hasKey ? <Key className="w-3.5 h-3.5 flex-shrink-0" /> : <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />}
      <span>{hasKey ? `${tool.requiresApi.name} key সেট আছে।` : `এই টুলের জন্য ${tool.requiresApi.name} প্রয়োজন। উপরের ⚙️ Settings থেকে সেট করুন।`}</span>
    </div>
  );
};


const FeedbackSection = () => {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    const mailto = `mailto:wapmahmud@duck.com?subject=${encodeURIComponent(subject || "Sukkar Toolbox Feedback")}&body=${encodeURIComponent(body)}`;
    window.open(mailto, "_blank");
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div className="tool-card !p-5 space-y-3">
      <h3 className="font-semibold flex items-center gap-2">
        <Mail className="w-4 h-4" /> Feedback / যোগাযোগ
      </h3>
      <p className="text-xs text-muted-foreground">আপনার মতামত বা পরামর্শ জানান। আপনার ইমেইল ক্লায়েন্ট খুলে মেইল পাঠাতে পারবেন।</p>
      <input
        type="text"
        placeholder="বিষয় (Subject)"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="tool-input w-full"
      />
      <textarea
        placeholder="আপনার মতামত লিখুন..."
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="tool-textarea min-h-[80px]"
      />
      <button onClick={handleSend} disabled={!body.trim()} className="tool-btn text-sm">
        {sent ? "✓ মেইল ক্লায়েন্ট ওপেন হয়েছে" : "মেইল পাঠান"}
      </button>
    </div>
  );
};

const ToolFooter = ({ toolTitle }: { toolTitle?: string }) => {
  return (
    <footer className="mt-8 pt-4 border-t border-border text-center space-y-2">
      <div className="flex items-center justify-center gap-2 flex-wrap text-sm">
        <a href="/" className="hover:text-primary transition-colors">🛠️ Tools</a>
        <span className="text-muted-foreground">|</span>
        <a href="https://sukkarshop.com" target="_blank" rel="noopener" className="hover:text-primary transition-colors">🏠 Homepage</a>
      </div>
      <p className="text-xs text-muted-foreground">
        <strong>{toolTitle || "Sukkar Toolbox"}</strong> v1.0 | Powered by{" "}
        <a href="https://sukkarshop.com" target="_blank" rel="noopener" className="hover:text-primary">sukkarshop.com</a>
      </p>
      <p className="text-[11px] text-muted-foreground/70">
        All tools run entirely in your browser — no data is sent to any server. Use at your own responsibility.
      </p>
    </footer>
  );
};

const Index = () => {
  const { toolId } = useParams();
  const navigate = useNavigate();
  const [activeTool, setActiveTool] = useState<string | null>(toolId || null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved) return saved === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  // Sync activeTool with URL params
  useEffect(() => {
    setActiveTool(toolId || null);
  }, [toolId]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  // Recent tools (last 30 days)
  const LS_RECENT = "recentTools";
  const ONE_MONTH = 30 * 24 * 60 * 60 * 1000;

  const getRecent = (): { id: string; ts: number }[] => {
    try {
      const raw = JSON.parse(localStorage.getItem(LS_RECENT) || "[]");
      const now = Date.now();
      return raw.filter((r: { ts: number }) => now - r.ts < ONE_MONTH);
    } catch { return []; }
  };

  const [recentEntries, setRecentEntries] = useState(getRecent);

  const trackRecent = (toolId: string) => {
    const now = Date.now();
    const filtered = getRecent().filter(r => r.id !== toolId);
    const updated = [{ id: toolId, ts: now }, ...filtered].slice(0, 20);
    localStorage.setItem(LS_RECENT, JSON.stringify(updated));
    setRecentEntries(updated);
  };

  const clearRecent = () => {
    localStorage.removeItem(LS_RECENT);
    setRecentEntries([]);
  };

  const recentTools = recentEntries
    .map(r => tools.find(t => t.id === r.id))
    .filter(Boolean) as typeof tools;

  const ActiveComponent = activeTool ? toolComponents[activeTool] : null;
  const activeToolDef = activeTool ? tools.find(t => t.id === activeTool) : null;

  const filteredTools = tools.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase())
  );

  const goHome = () => { setActiveTool(null); setSearch(""); };

  const selectTool = (id: string) => {
    setActiveTool(id);
    setSidebarOpen(false);
    trackRecent(id);
  };

  return (
    <div className="flex min-h-screen">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-foreground/20 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 z-50 lg:z-auto h-screen w-64 flex-shrink-0 bg-sidebar overflow-y-auto transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-sidebar-border">
          <button onClick={goHome} className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--gradient-primary)" }}>
              <Wrench className="w-4 h-4 text-sidebar-primary-foreground" />
            </div>
            <span className="text-base font-bold text-sidebar-accent-foreground tracking-tight">Sukkar Toolbox</span>
          </button>
          <button className="ml-auto lg:hidden text-sidebar-foreground" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-3 space-y-5">
          {/* Home button */}
          <button
            onClick={goHome}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${!activeTool ? "bg-sidebar-accent text-sidebar-primary font-medium" : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"}`}
          >
            <Home className="w-4 h-4 flex-shrink-0" />
            <span>All Tools</span>
          </button>

          {categories.map((cat) => (
            <div key={cat.id}>
              <div className="px-2 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                {cat.label}
              </div>
              <div className="space-y-0.5">
                {tools.filter((t) => t.category === cat.id).map((tool) => {
                  const Icon = tool.icon;
                  const isActive = activeTool === tool.id;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => selectTool(tool.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? "bg-sidebar-accent text-sidebar-primary font-medium" : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"}`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span>{tool.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center gap-3 px-4 sm:px-6 py-3 border-b border-border bg-background/80 backdrop-blur-sm">
          <button className="lg:hidden text-foreground" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <button onClick={goHome} className="flex items-center gap-2 lg:hidden">
            <Wrench className="w-4 h-4 text-primary" />
            <span className="font-bold text-sm">Sukkar Toolbox</span>
          </button>
          {activeTool ? (
            <div className="text-sm text-muted-foreground hidden sm:block">
              <button onClick={goHome} className="hover:text-foreground">All Tools</button>
              <span className="mx-1.5">/</span>
              <span className="text-foreground font-medium">{activeToolDef?.title}</span>
            </div>
          ) : (
            <div className="flex-1 max-w-md ml-auto sm:ml-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search tools..."
                  className="tool-input !pl-10 !py-2"
                />
              </div>
            </div>
          )}
          <button onClick={() => setDark(!dark)} className="ml-auto p-2 rounded-lg hover:bg-muted transition-colors" title={dark ? "Light mode" : "Dark mode"}>
            {dark ? <Sun className="w-4 h-4 text-muted-foreground" /> : <Moon className="w-4 h-4 text-muted-foreground" />}
          </button>
          <button onClick={() => setShowSettings(true)} className="p-2 rounded-lg hover:bg-muted transition-colors" title="API Settings">
            <Settings2 className="w-4 h-4 text-muted-foreground" />
          </button>
        </header>
        {showSettings && <ApiSettingsPanel onClose={() => setShowSettings(false)} />}
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          {ActiveComponent ? (
            <div className="max-w-4xl">
              <ActiveComponent />
              {/* How To Use below every tool */}
              {activeToolDef && <HowToUseSection stepsBn={activeToolDef.howToUse} stepsEn={activeToolDef.howToUseEn} />}
              {/* Footer */}
              <ToolFooter toolTitle={activeToolDef?.title} />
            </div>
          ) : (
            /* Home grid */
            <div className="space-y-8">
              <div className="text-center max-w-2xl mx-auto">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                  <span style={{ backgroundImage: "var(--gradient-primary)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Sukkar Toolbox</span>
                </h1>
                <p className="text-muted-foreground mt-2">
                  {tools.length} free tools — all running in your browser, no data leaves your device.
                </p>
              </div>

              {/* Recently Used */}
              {recentTools.length > 0 && !search && (
                <div>
                  <div className="flex items-center justify-between mb-3 px-1">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> Recently Used
                    </h2>
                    <button onClick={clearRecent} className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors">
                      <Trash2 className="w-3 h-3" /> Clear
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {recentTools.map((tool) => {
                      const Icon = tool.icon;
                      return (
                        <button
                          key={tool.id}
                          onClick={() => selectTool(tool.id)}
                          className="tool-card !p-4 text-left hover:border-primary/30 hover:-translate-y-0.5 transition-all group cursor-pointer"
                        >
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"
                            style={{ background: "var(--gradient-primary)" }}>
                            <Icon className="w-5 h-5 text-primary-foreground" />
                          </div>
                          <div className="font-semibold text-sm">{tool.title}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{tool.description}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {categories.map((cat) => {
                const catTools = filteredTools.filter((t) => t.category === cat.id);
                if (catTools.length === 0) return null;
                return (
                  <div key={cat.id}>
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-1">
                      {cat.label}
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {catTools.map((tool) => {
                        const Icon = tool.icon;
                        return (
                          <button
                            key={tool.id}
                            onClick={() => selectTool(tool.id)}
                            className="tool-card !p-4 text-left hover:border-primary/30 hover:-translate-y-0.5 transition-all group cursor-pointer"
                          >
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"
                              style={{ background: "var(--gradient-primary)" }}>
                              <Icon className="w-5 h-5 text-primary-foreground" />
                            </div>
                            <div className="font-semibold text-sm">{tool.title}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{tool.description}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {filteredTools.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No tools found for "{search}"
                </div>
              )}

              {/* Feedback section */}
              <FeedbackSection />

              {/* Home footer */}
              <ToolFooter />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
