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
}

export const tools: ToolDef[] = [
  // Text
  { id: "text-case", title: "Text Case", description: "Convert text case", icon: Type, category: "text",
    howToUse: ["ইনপুট বক্সে টেক্সট লিখুন বা পেস্ট করুন।", "নিচের বাটন থেকে case সিলেক্ট করুন (UPPER, lower, Title, etc.)।", "রেজাল্ট অটো কপি বাটনে ক্লিক করে কপি করুন।"] },
  { id: "word-counter", title: "Word Counter", description: "Count words & chars", icon: Hash, category: "text",
    howToUse: ["টেক্সট বক্সে লিখুন বা পেস্ট করুন।", "Words, characters, sentences, paragraphs স্বয়ংক্রিয়ভাবে গণনা হবে।", "Reading time ও speaking time ও দেখানো হবে।"] },
  { id: "markdown", title: "Markdown Preview", description: "Live markdown editor", icon: Eye, category: "text",
    howToUse: ["বাম পাশে Markdown লিখুন।", "ডান পাশে লাইভ প্রিভিউ দেখুন।", "Headers (#), bold (**), links, lists ইত্যাদি সাপোর্ট করে।"] },
  { id: "lorem", title: "Lorem Ipsum", description: "Placeholder text", icon: FileText, category: "text",
    howToUse: ["কতগুলো paragraph চান সিলেক্ট করুন।", "Generate বাটনে ক্লিক করুন।", "Copy বাটনে ক্লিক করে placeholder text কপি করুন।"] },
  { id: "diff", title: "Diff Checker", description: "Compare two texts", icon: GitCompare, category: "text",
    howToUse: ["বাম বক্সে Original text দিন।", "ডান বক্সে Modified text দিন।", "পার্থক্যগুলো রঙ দিয়ে হাইলাইট হয়ে দেখাবে।"] },
  { id: "typing", title: "Typing Test", description: "Test typing speed", icon: Keyboard, category: "text",
    howToUse: ["English বা বাংলা ফিল্টার করুন, তারপর একটি sample text সিলেক্ট করুন।", "টাইপিং শুরু করুন — WPM ও accuracy ট্র্যাক হবে।", "শেষে আপনার রেজাল্ট দেখুন।"] },

  // Developer
  { id: "json", title: "JSON Formatter", description: "Prettify & minify", icon: Braces, category: "dev",
    howToUse: ["JSON ডেটা পেস্ট করুন।", "Prettify বাটনে ক্লিক করলে সুন্দরভাবে ফরম্যাট হবে।", "Minify বাটনে ক্লিক করলে compressed হবে।"] },
  { id: "base64", title: "Base64", description: "Encode & decode", icon: Binary, category: "dev",
    howToUse: ["টেক্সট লিখুন বা পেস্ট করুন।", "Encode বাটনে ক্লিক করলে Base64-এ কনভার্ট হবে।", "Decode বাটনে ক্লিক করলে আবার আসল টেক্সটে ফিরে আসবে।"] },
  { id: "data-encoder", title: "Data Encoder", description: "Base16/32/64/85, Binary, URL", icon: FileCode2, category: "dev",
    howToUse: ["এনকোডিং ফরম্যাট সিলেক্ট করুন (Base16, Base32, Base64, Base85, Binary, URL, Decimal)।", "টেক্সট লিখুন বা ফাইল আপলোড করুন।", "Encode বা Decode বাটনে ক্লিক করুন।", "Copy বাটনে ক্লিক করে রেজাল্ট কপি করুন।"] },
  { id: "uuid", title: "UUID Generator", description: "Random UUIDs", icon: Fingerprint, category: "dev",
    howToUse: ["Generate বাটনে ক্লিক করুন।", "নতুন UUID তৈরি হবে।", "Copy বাটনে ক্লিক করে কপি করুন। একাধিক UUID একসাথে তৈরি করতে পারবেন।"] },
  { id: "html-bbcode", title: "HTML → BBCode", description: "Convert HTML to BBCode", icon: Code, category: "dev",
    howToUse: ["HTML কোড পেস্ট করুন।", "স্বয়ংক্রিয়ভাবে BBCode-এ কনভার্ট হবে।", "Copy বাটনে ক্লিক করে BBCode কপি করুন।"] },
  { id: "woo-csv", title: "WooCommerce CSV", description: "WooCommerce product import CSV", icon: Table, category: "generators",
    howToUse: ["'Add Product' বাটনে ক্লিক করে নতুন প্রোডাক্ট যোগ করুন।", "Simple বা Variable প্রোডাক্ট টাইপ সিলেক্ট করুন।", "প্রোডাক্টের তথ্য (নাম, SKU, দাম, ক্যাটেগরি) পূরণ করুন।", "Variable প্রোডাক্টে ভিন্ন ওজন ও দামের variation যোগ করুন।", "'Generate CSV' বাটনে ক্লিক করে ফাইল ডাউনলোড করুন।", "WordPress → WooCommerce → Products → Import-এ CSV ফাইল আপলোড করুন।"] },
  { id: "hash", title: "Hash Generator", description: "SHA-1, SHA-256, SHA-512", icon: ShieldCheck, category: "dev",
    howToUse: ["টেক্সট লিখুন বা পেস্ট করুন।", "Hash algorithm সিলেক্ট করুন (SHA-1, SHA-256, SHA-512)।", "Hash স্বয়ংক্রিয়ভাবে তৈরি হবে। Copy বাটনে ক্লিক করে কপি করুন।"] },
  { id: "regex", title: "Regex Helper", description: "Test & build regex", icon: Regex, category: "dev",
    howToUse: ["Pattern ফিল্ডে regex লিখুন (/ ছাড়া)।", "Flags (g, i, m, s) প্রয়োজন অনুযায়ী যোগ করুন।", "Test string-এ টেক্সট দিন — ম্যাচ রিয়েল-টাইমে হাইলাইট হবে।", "Common patterns থেকে দ্রুত শুরু করতে পারেন।"] },

  // Converters
  { id: "color", title: "Color Picker", description: "HEX, RGB, HSL", icon: Palette, category: "converters",
    howToUse: ["কালার পিকার থেকে রঙ সিলেক্ট করুন।", "HEX, RGB, HSL ফরম্যাটে ভ্যালু দেখুন।", "যেকোনো ফরম্যাটে ভ্যালু পেস্ট করলে বাকিগুলো অটো আপডেট হবে।"] },
  { id: "units", title: "Unit Converter", description: "Length, weight, temp", icon: Ruler, category: "converters",
    howToUse: ["ক্যাটেগরি সিলেক্ট করুন (Length, Weight, Temperature, etc.)।", "From ও To ইউনিট সিলেক্ট করুন।", "ভ্যালু দিন — রেজাল্ট স্বয়ংক্রিয়ভাবে দেখাবে।"] },
  { id: "image-resize", title: "Image Resizer", description: "Resize & convert images", icon: ImageDown, category: "converters",
    howToUse: ["ছবি আপলোড করুন।", "নতুন width/height সেট করুন।", "Output format সিলেক্ট করুন (PNG, JPEG, WebP)।", "Download বাটনে ক্লিক করে resized ছবি ডাউনলোড করুন।"] },

  // Generators
  { id: "password", title: "Password Gen", description: "Secure passwords", icon: Lock, category: "generators",
    howToUse: ["পাসওয়ার্ডের length সেট করুন।", "Uppercase, lowercase, numbers, symbols অন/অফ করুন।", "Generate বাটনে ক্লিক করুন। Copy বাটনে কপি করুন।"] },
  { id: "qr", title: "QR Code", description: "Generate QR codes", icon: QrCode, category: "generators",
    howToUse: ["টেক্সট বা URL লিখুন।", "QR কোড স্বয়ংক্রিয়ভাবে তৈরি হবে।", "Download বাটনে ক্লিক করে PNG হিসেবে সেভ করুন।"] },
  { id: "barcode", title: "Barcode", description: "Generate barcodes", icon: Barcode, category: "generators",
    howToUse: ["বারকোডের ডেটা লিখুন।", "Barcode format সিলেক্ট করুন।", "Download বাটনে ক্লিক করে ছবি সেভ করুন।"] },
  { id: "whatsapp", title: "WhatsApp Link", description: "Generate WA links", icon: MessageCircle, category: "generators",
    howToUse: ["ফোন নম্বর দিন (কান্ট্রি কোড সহ)।", "মেসেজ লিখুন (optional)।", "Generated link কপি করুন বা সরাসরি WhatsApp-এ পাঠান।"] },
  { id: "invoice", title: "Invoice Maker", description: "Create & print invoices", icon: Receipt, category: "generators",
    howToUse: ["Template সিলেক্ট করুন (Classic, Modern, Minimal, Bold)।", "Accent color বেছে নিন।", "From, Bill To, Invoice #, Date পূরণ করুন।", "Items যোগ করুন (Description, Qty, Price)।", "Tax % সেট করুন।", "Print / Save PDF বাটনে ক্লিক করে ইনভয়েস প্রিন্ট বা PDF সেভ করুন।"] },

  // Calculators
  { id: "calculator", title: "Calculator", description: "Basic & scientific", icon: Calculator, category: "calculators",
    howToUse: ["বাটনে ক্লিক করে বা কিবোর্ড দিয়ে হিসাব করুন।", "Basic ও Scientific মোড সুইচ করতে পারবেন।", "= বাটনে ক্লিক করলে রেজাল্ট দেখাবে।"] },
  { id: "age", title: "Age Calculator", description: "Calculate exact age", icon: Calendar, category: "calculators",
    howToUse: ["জন্ম তারিখ সিলেক্ট করুন।", "বছর, মাস, দিনে আপনার সঠিক বয়স দেখুন।", "পরবর্তী জন্মদিন কত দিন পরে তাও দেখাবে।"] },
  { id: "bmi", title: "BMI Calculator", description: "Body mass index", icon: Heart, category: "calculators",
    howToUse: ["আপনার ওজন (kg) ও উচ্চতা (cm/feet) দিন।", "BMI স্বয়ংক্রিয়ভাবে ক্যালকুলেট হবে।", "আপনার BMI ক্যাটেগরি (Underweight, Normal, Overweight, Obese) দেখুন।"] },

  // Media
  { id: "tts", title: "Text to Speech", description: "Read text aloud", icon: Volume2, category: "media",
    howToUse: ["টেক্সট বক্সে লিখুন বা পেস্ট করুন।", "Voice ও speed সিলেক্ট করুন।", "Play বাটনে ক্লিক করলে টেক্সট পড়ে শোনাবে।"] },
  { id: "stt", title: "Speech to Text", description: "Voice to text", icon: Mic, category: "media",
    howToUse: ["Start বাটনে ক্লিক করুন ও মাইক্রোফোনের অনুমতি দিন।", "কথা বলুন — লাইভ টেক্সট দেখুন।", "Stop বাটনে ক্লিক করে কপি করুন।"] },
  { id: "sound-viz", title: "Sound Visualizer", description: "Mic visualizer & recorder", icon: AudioWaveform, category: "media",
    howToUse: ["'Start Mic' বাটনে ক্লিক করে মাইক্রোফোন চালু করুন।", "Visualization style (Bars, Wave, Circles) ও color theme বেছে নিন।", "Record বাটনে ক্লিক করে ভিডিও রেকর্ড করুন।", "Audio Record বাটনে শুধু অডিও রেকর্ড করুন।"] },
  { id: "m3u", title: "M3U Player", description: "Stream & playlist player", icon: Radio, category: "media",
    howToUse: ["Stream URL পেস্ট করে Play করুন, অথবা M3U playlist URL দিয়ে চ্যানেল লোড করুন।", "'Load M3U File' বাটনে লোকাল .m3u ফাইল আপলোড করুন।", "Playlist থেকে চ্যানেল ব্রাউজ ও সার্চ করুন।", "ভিডিও স্ট্রিমে hover করলে PiP, fullscreen, speed কন্ট্রোল পাবেন।", "একাধিক source আছে এমন চ্যানেলে Quality বাটন থেকে সুইচ করুন।"] },

  // Productivity
  { id: "notes", title: "Fresh Notes", description: "Quick local notepad", icon: StickyNote, category: "productivity",
    howToUse: ["টাইপ শুরু করুন — সব কিছু অটো সেভ হয়।", "ব্রাউজার বন্ধ করলেও নোট থাকবে (localStorage)।", "Clear বাটনে ক্লিক করলে সব মুছে যাবে।"] },
  { id: "stopwatch", title: "Stopwatch & Timer", description: "Track time", icon: Timer, category: "productivity",
    howToUse: ["Stopwatch মোডে Start/Stop/Reset করুন।", "Lap বাটনে ক্লিক করে ল্যাপ টাইম রেকর্ড করুন।", "Timer মোডে সময় সেট করে Start করুন।", "PiP Mode বাটনে ক্লিক করলে ছোট floating window-তে টাইমার দেখাবে।"] },
  { id: "steadfast", title: "Steadfast Booking", description: "Courier booking tool", icon: Package, category: "productivity",
    howToUse: ["প্রথমে Steadfast API Key ও Secret Key সেট করুন।", "Single মোডে: কাস্টমারের মেসেজ পেস্ট করুন → প্রসেস → বুকিং কনফার্ম।", "Bulk মোডে: একাধিক অর্ডার --- দিয়ে আলাদা করে দিন → একসাথে বুকিং।", "AI Bulk মোডে: মেসেঞ্জারের অগোছালো মেসেজ পেস্ট করুন → AI তথ্য বের করবে।", "AI মোডের জন্য Google Gemini API Key প্রয়োজন (ফ্রি)।"] },
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
