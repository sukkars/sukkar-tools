import { useState } from "react";
import { tools, categories } from "@/lib/tools";
import { Menu, X, Wrench, Search, Home, HelpCircle, ChevronDown, ChevronUp, Settings2, Key, AlertTriangle } from "lucide-react";
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
};

/* ─── How To Use (inline collapsible) ─── */
const HowToUseSection = ({ steps }: { steps: string[] }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-6 rounded-lg border border-border overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium hover:bg-muted/50 transition-colors"
      >
        <span className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-primary" />
          কিভাবে ব্যবহার করবেন?
        </span>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      {open && (
        <div className="px-4 pb-3 pt-1 border-t border-border bg-muted/20">
          <ol className="list-decimal list-inside space-y-1.5 text-sm text-muted-foreground">
            {steps.map((step, i) => <li key={i}>{step}</li>)}
          </ol>
        </div>
      )}
    </div>
  );
};

/* ─── Footer ─── */
const ToolFooter = ({ toolTitle }: { toolTitle?: string }) => {
  const [showGuide, setShowGuide] = useState(false);
  const activeTool = toolTitle ? tools.find(t => t.title === toolTitle) : null;

  return (
    <footer className="mt-8 pt-4 border-t border-border text-center space-y-2">
      <div className="flex items-center justify-center gap-2 flex-wrap text-sm">
        <a href="/" className="hover:text-primary transition-colors">🛠️ Tools</a>
        <span className="text-muted-foreground">|</span>
        <a href="https://sukkarshop.com" target="_blank" rel="noopener" className="hover:text-primary transition-colors">🏠 Homepage</a>
        {activeTool && (
          <>
            <span className="text-muted-foreground">|</span>
            <button onClick={() => setShowGuide(!showGuide)} className="hover:text-primary transition-colors">⁉️ How to use?</button>
          </>
        )}
      </div>
      {showGuide && activeTool && (
        <div className="text-left max-w-lg mx-auto bg-muted/20 border border-border rounded-lg p-3 mt-2">
          <ol className="list-decimal list-inside space-y-1.5 text-sm text-muted-foreground">
            {activeTool.howToUse.map((step, i) => <li key={i}>{step}</li>)}
          </ol>
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        <strong>{toolTitle || "Sukkar Toolbox"}</strong> v1.0 | Powered by{" "}
        <a href="https://sukkarshop.com" target="_blank" rel="noopener" className="hover:text-primary">sukkarshop.com</a>
      </p>
      <p className="text-[11px] text-muted-foreground/70">
        সব টুল আপনার ব্রাউজারে চলে — কোনো ডেটা সার্ভারে পাঠানো হয় না। ব্যবহার সম্পূর্ণ আপনার দায়িত্বে।
      </p>
    </footer>
  );
};

const Index = () => {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");

  const ActiveComponent = activeTool ? toolComponents[activeTool] : null;
  const activeToolDef = activeTool ? tools.find(t => t.id === activeTool) : null;

  const filteredTools = tools.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase())
  );

  const goHome = () => { setActiveTool(null); setSearch(""); };

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
                      onClick={() => { setActiveTool(tool.id); setSidebarOpen(false); }}
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
        </header>

        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          {ActiveComponent ? (
            <div className="max-w-4xl">
              <ActiveComponent />
              {/* How To Use below every tool */}
              {activeToolDef && <HowToUseSection steps={activeToolDef.howToUse} />}
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
                            onClick={() => setActiveTool(tool.id)}
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
