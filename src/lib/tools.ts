import { Type, Hash, Lock, Braces, Binary, Palette, FileText, Ruler, Calendar, QrCode, Eye, Fingerprint, Code, MessageCircle, StickyNote, Table, AudioWaveform } from "lucide-react";

export interface ToolDef {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  category: "text" | "dev" | "converters" | "generators" | "productivity";
}

export const tools: ToolDef[] = [
  { id: "text-case", title: "Text Case", description: "Convert text case", icon: Type, category: "text" },
  { id: "word-counter", title: "Word Counter", description: "Count words & chars", icon: Hash, category: "text" },
  { id: "markdown", title: "Markdown Preview", description: "Live markdown editor", icon: Eye, category: "text" },
  { id: "lorem", title: "Lorem Ipsum", description: "Placeholder text", icon: FileText, category: "text" },
  { id: "json", title: "JSON Formatter", description: "Prettify & minify", icon: Braces, category: "dev" },
  { id: "base64", title: "Base64", description: "Encode & decode", icon: Binary, category: "dev" },
  { id: "uuid", title: "UUID Generator", description: "Random UUIDs", icon: Fingerprint, category: "dev" },
  { id: "html-bbcode", title: "HTML → BBCode", description: "Convert HTML to BBCode", icon: Code, category: "dev" },
  { id: "csv", title: "CSV Generator", description: "Build & download CSV", icon: Table, category: "dev" },
  { id: "color", title: "Color Picker", description: "HEX, RGB, HSL", icon: Palette, category: "converters" },
  { id: "units", title: "Unit Converter", description: "Length, weight, temp", icon: Ruler, category: "converters" },
  { id: "age", title: "Age Calculator", description: "Calculate exact age", icon: Calendar, category: "converters" },
  { id: "password", title: "Password Gen", description: "Secure passwords", icon: Lock, category: "generators" },
  { id: "qr", title: "QR Code", description: "Generate QR codes", icon: QrCode, category: "generators" },
  { id: "whatsapp", title: "WhatsApp Link", description: "Generate WA links", icon: MessageCircle, category: "generators" },
  { id: "notes", title: "Fresh Notes", description: "Quick local notepad", icon: StickyNote, category: "productivity" },
  { id: "sound-viz", title: "Sound Visualizer", description: "Mic visualizer & recorder", icon: AudioWaveform, category: "productivity" },
];

export const categories = [
  { id: "text", label: "Text Tools" },
  { id: "dev", label: "Developer" },
  { id: "converters", label: "Converters" },
  { id: "generators", label: "Generators" },
  { id: "productivity", label: "Productivity" },
] as const;
