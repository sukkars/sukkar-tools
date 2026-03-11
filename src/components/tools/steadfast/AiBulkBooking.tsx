import { useState } from "react";
import { Sparkles, Send, Trash2, RotateCcw, Copy, Settings } from "lucide-react";
import { toast } from "sonner";
import { createOrder, hasKeys, LS_AI_KEY, LS_MODEL_KEY, type OrderData, cleanNumberString, cleanPrefixes } from "./utils";

const AI_MODELS = [
  { value: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite (Fast, High Limit)" },
  { value: "gemini-3-flash-preview", label: "Gemini 3.0 Flash Preview (Smarter, Low Limit)" },
];

const AiBulkBooking = () => {
  const [input, setInput] = useState("");
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [commonNote, setCommonNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [aiKey, setAiKey] = useState(localStorage.getItem(LS_AI_KEY) || "");
  const [model, setModel] = useState(localStorage.getItem(LS_MODEL_KEY) || "gemini-2.5-flash-lite");

  const hasAiKey = !!localStorage.getItem(LS_AI_KEY);
  const hasSteadfastKeys = hasKeys();

  const saveAiSettings = () => {
    localStorage.setItem(LS_AI_KEY, aiKey.trim());
    localStorage.setItem(LS_MODEL_KEY, model);
    setShowSettings(false);
    toast.success("AI Settings সেভ হয়েছে!");
  };

  // Manual extraction
  const manualExtract = () => {
    const chunks = input.split(/---|\n\n/).map(s => s.trim()).filter(Boolean);
    const parsed: OrderData[] = [];
    for (const chunk of chunks) {
      const lines = chunk.split("\n").map(l => l.trim()).filter(Boolean);
      if (lines.length >= 2) {
        parsed.push({
          invoice: "AI-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
          name: cleanPrefixes(lines[0]),
          address: cleanPrefixes(lines[1]),
          phone: cleanNumberString(lines[2] || ""),
          cod: parseFloat(cleanNumberString(lines[3] || "0")) || 0,
          status: "pending",
        });
      }
    }
    if (parsed.length === 0) { toast.error("কোন অর্ডার পাওয়া যায়নি"); return; }
    setOrders(prev => [...prev, ...parsed]);
    toast.success(`${parsed.length}টি অর্ডার এক্সট্র্যাক্ট হয়েছে`);
  };

  // AI extraction
  const aiExtract = async () => {
    const key = localStorage.getItem(LS_AI_KEY);
    if (!key || !input.trim()) { toast.error("API Key এবং টেক্সট দিন।"); return; }

    setAiLoading(true);
    const prompt = `Extract customer order info from text. If multiple orders exist, return them all.
      Rules:
      - name: Customer Name
      - address: Full Address
      - phone: Digits only, MUST BE EXACTLY 11 digits.
      - IMPORTANT: If the customer mentions any courier service name (like Sundarban, SA Paribahan, etc.) or point delivery/hub pick up, set the phone number to '00' to skip booking.
      - cod: Number only (default 0)
      Return ONLY a JSON array of objects.
      Input: ${input}`;

    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" },
        }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error.message);

      let rawText = json.candidates[0].content.parts[0].text;
      rawText = rawText.replace(/```json|```/g, "").trim();
      const data = JSON.parse(rawText);
      const list = Array.isArray(data) ? data : [data];

      const parsed: OrderData[] = list.map((o: any) => ({
        invoice: "AI-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
        name: o.name || "N/A",
        address: o.address || "N/A",
        phone: cleanNumberString(o.phone || ""),
        cod: parseFloat(cleanNumberString(String(o.cod || "0"))) || 0,
        status: "pending" as const,
      }));

      setOrders(prev => [...prev, ...parsed]);
      toast.success(`AI: ${parsed.length}টি অর্ডার পাওয়া গেছে!`);
    } catch (e: any) {
      toast.error("AI Error: " + e.message);
    } finally {
      setAiLoading(false);
    }
  };

  const deleteOrder = (idx: number) => setOrders(orders.filter((_, i) => i !== idx));

  const submitAll = async () => {
    if (!hasSteadfastKeys) { toast.error("Steadfast API কী অনুপস্থিত"); return; }
    setSubmitting(true);
    const updated = [...orders];
    for (let i = 0; i < updated.length; i++) {
      if (updated[i].status !== "pending") continue;
      updated[i] = { ...updated[i], status: "processing" };
      setOrders([...updated]);
      try {
        const res = await createOrder({ ...updated[i], note: commonNote });
        updated[i] = res;
      } catch {
        updated[i] = { ...updated[i], status: "error", errorMsg: "Network error" };
      }
      setOrders([...updated]);
      await new Promise(r => setTimeout(r, 600));
    }
    setSubmitting(false);
    toast.success("সবগুলো প্রসেস শেষ।");
  };

  const copyId = (id: string | undefined) => {
    if (!id) return;
    const text = `Parcel Id : #${id}`;
    const html = `<span style="font-family: 'Poppins', sans-serif; font-size: 16pt; font-weight: bold; color: #000; background-color: #a8a8a8ff; padding: 4px;">${text}</span>`;
    const blob = new Blob([html], { type: "text/html" });
    const textBlob = new Blob([text], { type: "text/plain" });

    if (navigator.clipboard && window.ClipboardItem) {
      navigator.clipboard.write([
        new ClipboardItem({
          "text/html": blob,
          "text/plain": textBlob,
        }),
      ]).then(() => {
        toast.success("ID Copied!");
      }).catch(() => {
        navigator.clipboard.writeText(text);
        toast.success("ID Copied!");
      });
    } else {
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      toast.success("ID Copied!");
    }
  };

  return (
    <div className="space-y-4">
      {/* AI Status */}
      <div className="flex items-center gap-3 text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
        <span>Steadfast: {hasSteadfastKeys ? "🟢" : "🔴"}</span>
        <span>Gemini AI: {hasAiKey ? "🟢" : "🔴"}</span>
        <button onClick={() => setShowSettings(!showSettings)} className="text-primary hover:underline ml-auto flex items-center gap-1">
          <Settings className="w-2.5 h-2.5" /> AI Settings
        </button>
      </div>

      {/* AI Settings */}
      {showSettings && (
        <div className="tool-card !p-4 space-y-3 border-primary/30">
          <h3 className="text-sm font-semibold">⚙️ AI Settings</h3>
          <div>
            <label className="tool-label text-xs">
              Gemini AI Key{" "}
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener" className="text-primary underline">(সংগ্রহ করুন)</a>
            </label>
            <input type="password" value={aiKey} onChange={(e) => setAiKey(e.target.value)} placeholder="Gemini API Key" className="tool-input text-xs" />
          </div>
          <div>
            <label className="tool-label text-xs">AI Model</label>
            <select value={model} onChange={(e) => setModel(e.target.value)} className="tool-input text-xs">
              {AI_MODELS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <button onClick={saveAiSettings} className="tool-btn text-xs !py-1.5">Save</button>
        </div>
      )}

      {/* AI Input */}
      <div className="tool-card !p-3 space-y-2 border-2 border-dashed border-primary/30 bg-primary/5">
        <div className="flex items-center gap-2 text-xs font-bold text-primary">
          <Sparkles className="w-3.5 h-3.5" /> AI Smart Reader
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="মেসেঞ্জারের কাস্টমার মেসেজ এখানে পেস্ট করুন..."
          className="tool-textarea !min-h-[80px] text-xs"
        />
        <div className="flex gap-2 flex-wrap">
          <button onClick={aiExtract} disabled={aiLoading} className="tool-btn text-[11px] !py-1.5 disabled:opacity-50">
            {aiLoading ? "প্রসেসিং..." : <><Sparkles className="w-3 h-3" /> AI দিয়ে তথ্য বের করুন</>}
          </button>
          <button onClick={manualExtract} className="tool-btn-outline text-[11px] !py-1.5">ম্যানুয়াল এন্ট্রি</button>
          <button onClick={() => { setInput(""); setOrders([]); }} className="tool-btn-outline text-[11px] !py-1.5">
            <RotateCcw className="w-3 h-3" /> সব ক্লিয়ার
          </button>
        </div>
      </div>

      {/* Orders Table */}
      {orders.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">অর্ডার লিস্ট ({orders.length})</h3>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-3 py-2 text-left font-medium">#</th>
                  <th className="px-3 py-2 text-left font-medium">নাম</th>
                  <th className="px-3 py-2 text-left font-medium">ঠিকানা</th>
                  <th className="px-3 py-2 text-left font-medium">ফোন</th>
                  <th className="px-3 py-2 text-left font-medium">COD</th>
                  <th className="px-3 py-2 text-left font-medium w-10"></th>
                  <th className="px-3 py-2 text-left font-medium">স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((o, i) => (
                  <tr key={i} className="text-[11px]">
                    <td className="px-3 py-1.5 text-muted-foreground font-bold">{i + 1}</td>
                    <td className="px-3 py-1.5">{o.name}</td>
                    <td className="px-3 py-1.5 max-w-[120px] truncate">{o.address}</td>
                    <td className="px-3 py-1.5 font-mono">{o.phone}</td>
                    <td className="px-3 py-1.5">{o.cod}</td>
                    <td className="px-3 py-1.5">
                      <button onClick={() => deleteOrder(i)} className="text-destructive hover:text-destructive/80">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </td>
                    <td className="px-3 py-1.5">
                      {o.status === "pending" && <span className="text-amber-500 font-medium">⏳ Pending</span>}
                      {o.status === "processing" && <span className="text-blue-500 font-medium">🔄 Proc...</span>}
                      {o.status === "success" && (
                        <div
                          onClick={() => copyId(o.parcelId)}
                          className="inline-flex items-center gap-1 bg-[#f7f7f7] border border-[#eee] rounded px-1.5 py-0.5 cursor-pointer hover:bg-[#f0f0f0] transition-colors group"
                          title="Click to copy"
                        >
                          <span className="font-bold text-[#444]">#{o.parcelId}</span>
                          <Copy className="w-2.5 h-2.5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      )}
                      {o.status === "error" && <span className="text-destructive">❌ {o.errorMsg}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="tool-card !p-4 space-y-3">
            <label className="tool-label font-semibold">কমন নোট</label>
            <input
              id="commonNote"
              name="common_note"
              autoComplete="on"
              value={commonNote}
              onChange={(e) => setCommonNote(e.target.value)}
              placeholder="যেমন: সাবধানে ডেলিভারি করবেন"
              className="tool-input"
            />
            <button onClick={submitAll} disabled={submitting || !hasSteadfastKeys} className="tool-btn w-full disabled:opacity-50">
              {submitting ? "বুকিং চলছে..." : <><Send className="w-4 h-4" /> সবগুলো একসাথে বুকিং দিন</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiBulkBooking;
