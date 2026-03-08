import { useState } from "react";
import { tools, categories } from "@/lib/tools";
import { Menu, X, Wrench } from "lucide-react";
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

const toolComponents: Record<string, React.FC> = {
  "text-case": TextCaseConverter,
  "word-counter": WordCounter,
  password: PasswordGenerator,
  json: JsonFormatter,
  base64: Base64Tool,
  color: ColorPicker,
  lorem: LoremIpsumGenerator,
  units: UnitConverter,
  age: AgeCalculator,
  qr: QrCodeGenerator,
  markdown: MarkdownPreview,
  uuid: UuidGenerator,
};

const Index = () => {
  const [activeTool, setActiveTool] = useState("text-case");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const ActiveComponent = toolComponents[activeTool];

  return (
    <div className="flex min-h-screen">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-foreground/20 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 z-50 lg:z-auto h-screen w-64 flex-shrink-0 bg-sidebar overflow-y-auto transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-sidebar-border">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--gradient-primary)" }}>
            <Wrench className="w-4 h-4 text-sidebar-primary-foreground" />
          </div>
          <span className="text-base font-bold text-sidebar-accent-foreground tracking-tight">Toolbox</span>
          <button className="ml-auto lg:hidden text-sidebar-foreground" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-3 space-y-5">
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
      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 flex items-center gap-3 px-4 sm:px-6 py-3 border-b border-border bg-background/80 backdrop-blur-sm">
          <button className="lg:hidden text-foreground" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="text-sm text-muted-foreground">
            {categories.find((c) => c.id === tools.find((t) => t.id === activeTool)?.category)?.label}
            <span className="mx-1.5">/</span>
            <span className="text-foreground font-medium">{tools.find((t) => t.id === activeTool)?.title}</span>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
          {ActiveComponent && <ActiveComponent />}
        </div>
      </main>
    </div>
  );
};

export default Index;
