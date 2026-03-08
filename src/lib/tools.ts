import {
  Type, Hash, Lock, Braces, Binary, Palette, FileText, Ruler, Calendar, QrCode, Eye, Fingerprint,
  Code, MessageCircle, StickyNote, Table, AudioWaveform, Calculator, Heart, Volume2, Mic, Keyboard,
  GitCompare, Timer, ShieldCheck, Barcode, ImageDown, Receipt
} from "lucide-react";

export interface ToolDef {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  category: "text" | "dev" | "converters" | "generators" | "productivity" | "media" | "calculators";
}

export const tools: ToolDef[] = [
  // Text
  { id: "text-case", title: "Text Case", description: "Convert text case", icon: Type, category: "text" },
  { id: "word-counter", title: "Word Counter", description: "Count words & chars", icon: Hash, category: "text" },
  { id: "markdown", title: "Markdown Preview", description: "Live markdown editor", icon: Eye, category: "text" },
  { id: "lorem", title: "Lorem Ipsum", description: "Placeholder text", icon: FileText, category: "text" },
  { id: "diff", title: "Diff Checker", description: "Compare two texts", icon: GitCompare, category: "text" },
  { id: "typing", title: "Typing Test", description: "Test typing speed", icon: Keyboard, category: "text" },

  // Developer
  { id: "json", title: "JSON Formatter", description: "Prettify & minify", icon: Braces, category: "dev" },
  { id: "base64", title: "Base64", description: "Encode & decode", icon: Binary, category: "dev" },
  { id: "uuid", title: "UUID Generator", description: "Random UUIDs", icon: Fingerprint, category: "dev" },
  { id: "html-bbcode", title: "HTML → BBCode", description: "Convert HTML to BBCode", icon: Code, category: "dev" },
  { id: "csv", title: "CSV Generator", description: "Build & download CSV", icon: Table, category: "dev" },
  { id: "hash", title: "Hash Generator", description: "SHA-1, SHA-256, SHA-512", icon: ShieldCheck, category: "dev" },

  // Converters
  { id: "color", title: "Color Picker", description: "HEX, RGB, HSL", icon: Palette, category: "converters" },
  { id: "units", title: "Unit Converter", description: "Length, weight, temp", icon: Ruler, category: "converters" },
  { id: "image-resize", title: "Image Resizer", description: "Resize & convert images", icon: ImageDown, category: "converters" },

  // Generators
  { id: "password", title: "Password Gen", description: "Secure passwords", icon: Lock, category: "generators" },
  { id: "qr", title: "QR Code", description: "Generate QR codes", icon: QrCode, category: "generators" },
  { id: "barcode", title: "Barcode", description: "Generate barcodes", icon: Barcode, category: "generators" },
  { id: "whatsapp", title: "WhatsApp Link", description: "Generate WA links", icon: MessageCircle, category: "generators" },
  { id: "invoice", title: "Invoice", description: "Create & print invoices", icon: Receipt, category: "generators" },

  // Calculators
  { id: "calculator", title: "Calculator", description: "Basic & scientific", icon: Calculator, category: "calculators" },
  { id: "age", title: "Age Calculator", description: "Calculate exact age", icon: Calendar, category: "calculators" },
  { id: "bmi", title: "BMI Calculator", description: "Body mass index", icon: Heart, category: "calculators" },

  // Media & Productivity
  { id: "tts", title: "Text to Speech", description: "Read text aloud", icon: Volume2, category: "media" },
  { id: "stt", title: "Speech to Text", description: "Voice to text", icon: Mic, category: "media" },
  { id: "sound-viz", title: "Sound Visualizer", description: "Mic visualizer & recorder", icon: AudioWaveform, category: "media" },

  // Productivity
  { id: "notes", title: "Fresh Notes", description: "Quick local notepad", icon: StickyNote, category: "productivity" },
  { id: "stopwatch", title: "Stopwatch & Timer", description: "Track time", icon: Timer, category: "productivity" },
];

export const categories = [
  { id: "text", label: "Text Tools" },
  { id: "dev", label: "Developer" },
  { id: "converters", label: "Converters" },
  { id: "generators", label: "Generators" },
  { id: "calculators", label: "Calculators" },
  { id: "media", label: "Media" },
  { id: "productivity", label: "Productivity" },
] as const;
