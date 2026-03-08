import {
  Type, Hash, Lock, Braces, Binary, Palette, FileText, Ruler, Calendar, QrCode, Eye, Fingerprint,
  Code, MessageCircle, StickyNote, Table, AudioWaveform, Calculator, Heart, Volume2, Mic, Keyboard,
  GitCompare, Timer, ShieldCheck, Barcode, ImageDown, Receipt, Regex, Radio, FileCode2, Package
} from "lucide-react";

export interface ToolDef {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  category: "text" | "dev" | "converters" | "generators" | "productivity" | "media" | "calculators";
  howToUse: string[];
  howToUseEn: string[];
  requiresApi?: { name: string; key: string; optional?: boolean; description: string };
}

export const tools: ToolDef[] = [
  // Text
  { id: "text-case", title: "Text Case", description: "Convert text case", icon: Type, category: "text",
    howToUse: ["Type or paste your text in the input box.", "Click on a case button (UPPER, lower, Title, etc.).", "Click Copy to copy the converted result."] },
  { id: "word-counter", title: "Word Counter", description: "Count words & chars", icon: Hash, category: "text",
    howToUse: ["Type or paste text into the text box.", "Word, character, sentence, and paragraph counts update automatically.", "Reading time and speaking time are also displayed."] },
  { id: "markdown", title: "Markdown Preview", description: "Live markdown editor", icon: Eye, category: "text",
    howToUse: ["Write Markdown on the left panel.", "See the live rendered preview on the right.", "Supports headers (#), bold (**), links, lists, and more."] },
  { id: "lorem", title: "Lorem Ipsum", description: "Placeholder text", icon: FileText, category: "text",
    howToUse: ["Select how many paragraphs you need.", "Click Generate.", "Click Copy to copy the placeholder text."] },
  { id: "diff", title: "Diff Checker", description: "Compare two texts", icon: GitCompare, category: "text",
    howToUse: ["Paste the original text in the left box.", "Paste the modified text in the right box.", "Differences are highlighted in color automatically."] },
  { id: "typing", title: "Typing Test", description: "Test typing speed", icon: Keyboard, category: "text",
    howToUse: ["Choose a language filter and select a sample text.", "Start typing — WPM and accuracy are tracked in real-time.", "View your final results when finished."] },

  // Developer
  { id: "json", title: "JSON Formatter", description: "Prettify & minify", icon: Braces, category: "dev",
    howToUse: ["Paste your JSON data.", "Click Prettify to format it nicely.", "Click Minify to compress it into one line."] },
  { id: "base64", title: "Base64", description: "Encode & decode", icon: Binary, category: "dev",
    howToUse: ["Type or paste your text.", "Click Encode to convert to Base64.", "Click Decode to convert Base64 back to plain text."] },
  { id: "data-encoder", title: "Data Encoder", description: "Base16/32/64/85, Binary, URL", icon: FileCode2, category: "dev",
    howToUse: ["Select an encoding format (Base16, Base32, Base64, Base85, Binary, URL, Decimal).", "Type text or upload a file.", "Click Encode or Decode, then Copy the result."] },
  { id: "uuid", title: "UUID Generator", description: "Random UUIDs", icon: Fingerprint, category: "dev",
    howToUse: ["Click Generate to create a new UUID.", "Click Copy to copy it to clipboard.", "You can generate multiple UUIDs at once."] },
  { id: "html-bbcode", title: "HTML → BBCode", description: "Convert HTML to BBCode", icon: Code, category: "dev",
    howToUse: ["Paste your HTML code.", "BBCode output is generated automatically.", "Click Copy to copy the BBCode."] },
  { id: "woo-csv", title: "WooCommerce CSV", description: "WooCommerce product import CSV", icon: Table, category: "generators",
    howToUse: ["Click 'Add Product' to add a new product entry.", "Choose Simple or Variable product type.", "Fill in product details (name, SKU, price, category).", "For Variable products, add weight/price variations.", "Click 'Generate CSV' to download the file.", "Upload the CSV in WordPress → WooCommerce → Products → Import."] },
  { id: "hash", title: "Hash Generator", description: "SHA-1, SHA-256, SHA-512", icon: ShieldCheck, category: "dev",
    howToUse: ["Type or paste your text.", "Select a hash algorithm (SHA-1, SHA-256, SHA-512).", "The hash is generated automatically. Click Copy to copy it."] },
  { id: "regex", title: "Regex Helper", description: "Test & build regex", icon: Regex, category: "dev",
    howToUse: ["Enter your regex pattern (without slashes).", "Add flags (g, i, m, s) as needed.", "Type test text — matches are highlighted in real-time.", "Use the Common Patterns section for quick starts."] },

  // Converters
  { id: "color", title: "Color Picker", description: "HEX, RGB, HSL", icon: Palette, category: "converters",
    howToUse: ["Pick a color using the color picker.", "View values in HEX, RGB, and HSL formats.", "Paste any format value and the others update automatically."] },
  { id: "units", title: "Unit Converter", description: "Length, weight, temp", icon: Ruler, category: "converters",
    howToUse: ["Select a category (Length, Weight, Temperature, etc.).", "Choose the From and To units.", "Enter a value — the result updates instantly."] },
  { id: "image-resize", title: "Image Resizer", description: "Resize & convert images", icon: ImageDown, category: "converters",
    howToUse: ["Upload an image.", "Set the new width and height.", "Select output format (PNG, JPEG, WebP).", "Click Download to save the resized image."] },

  // Generators
  { id: "password", title: "Password Gen", description: "Secure passwords", icon: Lock, category: "generators",
    howToUse: ["Set the password length.", "Toggle uppercase, lowercase, numbers, and symbols.", "Click Generate, then Copy to copy the password."] },
  { id: "qr", title: "QR Code", description: "Generate QR codes", icon: QrCode, category: "generators",
    howToUse: ["Enter text or a URL.", "The QR code is generated automatically.", "Click Download to save it as a PNG image."] },
  { id: "barcode", title: "Barcode", description: "Generate barcodes", icon: Barcode, category: "generators",
    howToUse: ["Enter the barcode data.", "Select a barcode format.", "Click Download to save the barcode image."] },
  { id: "whatsapp", title: "WhatsApp Link", description: "Generate WA links", icon: MessageCircle, category: "generators",
    howToUse: ["Enter the phone number (with country code).", "Type a message (optional).", "Copy the generated link or open it directly in WhatsApp."] },
  { id: "invoice", title: "Invoice Maker", description: "Create & print invoices", icon: Receipt, category: "generators",
    howToUse: ["Select a template (Classic, Modern, Minimal, Bold).", "Choose an accent color.", "Fill in From, Bill To, Invoice #, and Date.", "Add line items (Description, Qty, Price).", "Set Tax %.", "Click Print / Save PDF to print or save the invoice."] },

  // Calculators
  { id: "calculator", title: "Calculator", description: "Basic & scientific", icon: Calculator, category: "calculators",
    howToUse: ["Click buttons or use your keyboard to calculate.", "Switch between Basic and Scientific mode.", "Press = to see the result."] },
  { id: "age", title: "Age Calculator", description: "Calculate exact age", icon: Calendar, category: "calculators",
    howToUse: ["Select your date of birth.", "Your exact age in years, months, and days is shown.", "Also shows days until your next birthday."] },
  { id: "bmi", title: "BMI Calculator", description: "Body mass index", icon: Heart, category: "calculators",
    howToUse: ["Enter your weight (kg) and height (cm or feet).", "BMI is calculated automatically.", "See your BMI category (Underweight, Normal, Overweight, Obese)."] },

  // Media
  { id: "tts", title: "Text to Speech", description: "Read text aloud", icon: Volume2, category: "media",
    howToUse: ["Type or paste text in the text box.", "Select a voice and speed.", "Click Play to hear the text read aloud."] },
  { id: "stt", title: "Speech to Text", description: "Voice to text", icon: Mic, category: "media",
    howToUse: ["Click Start and allow microphone access.", "Speak — live text appears on screen.", "Click Stop, then Copy to copy the transcribed text."] },
  { id: "sound-viz", title: "Sound Visualizer", description: "Mic visualizer & recorder", icon: AudioWaveform, category: "media",
    howToUse: ["Click 'Start Mic' to enable your microphone.", "Choose a visualization style (Bars, Wave, Circles) and color theme.", "Click Record to capture video, or Audio Record for audio only."] },
  { id: "m3u", title: "M3U Player", description: "Stream & playlist player", icon: Radio, category: "media",
    howToUse: ["Paste a stream URL and click Play, or enter an M3U playlist URL to load channels.", "Click 'Load M3U File' to upload a local .m3u file.", "Browse and search channels from the loaded playlist.", "Hover over the video for PiP, fullscreen, and speed controls.", "For channels with multiple sources, use the Quality button to switch."] },

  // Productivity
  { id: "notes", title: "Fresh Notes", description: "Quick local notepad", icon: StickyNote, category: "productivity",
    howToUse: ["Start typing — everything is auto-saved.", "Your notes persist even after closing the browser (localStorage).", "Click Clear to delete all notes."] },
  { id: "stopwatch", title: "Stopwatch & Timer", description: "Track time", icon: Timer, category: "productivity",
    howToUse: ["In Stopwatch mode, use Start / Stop / Reset.", "Click Lap to record lap times.", "In Timer mode, set a duration and press Start.", "Click PiP Mode for a small floating timer window."] },
  { id: "steadfast", title: "Steadfast Booking", description: "Courier booking tool", icon: Package, category: "productivity",
    requiresApi: { name: "Steadfast API", key: "steadfast_api_key", description: "Steadfast courier API key" },
    howToUse: ["First, set up your Steadfast API Key & Secret Key in the tool's API setup section.", "Single mode: Paste a customer message → Process → Confirm booking.", "Bulk mode: Separate multiple orders with --- and submit them all at once.", "AI Bulk mode: Paste messy Messenger messages → AI extracts customer info automatically.", "⚠️ Requires: Steadfast API Key (set inside this tool). AI Bulk also needs a Google Gemini API Key (set via ⚙️ Settings in the header)."] },
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