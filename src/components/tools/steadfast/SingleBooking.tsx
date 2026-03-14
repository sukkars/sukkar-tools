import { useState } from "react";
import { Send, RotateCcw, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { parseMessage, generateInvoice, createOrder, hasKeys, type OrderData } from "./utils";

const SingleBooking = () => {
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ invoice: "", name: "", address: "", phone: "", cod: 0, item: "", note: "", deliveryType: 0 });
  const [result, setResult] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(false);
  const [parseError, setParseError] = useState(false);

  const processMessage = () => {
    const parsed = parseMessage(message);
    if (!parsed) {
      setParseError(true);
      setForm({ invoice: "", name: "", address: "", phone: "", cod: 0, item: "", note: "", deliveryType: 0 });
      return;
    }
    setParseError(false);
    setForm({
      invoice: generateInvoice("INV"),
      name: parsed.name,
      address: parsed.address,
      phone: parsed.phone,
      cod: parsed.cod,
      item: "",
      note: "",
      deliveryType: 0,
    });
    setResult(null);
  };

  const clearAll = () => {
    setMessage("");
    setForm({ invoice: "", name: "", address: "", phone: "", cod: 0, item: "", note: "", deliveryType: 0 });
    setResult(null);
    setParseError(false);
  };

  const confirmBooking = async () => {
    if (!hasKeys()) { toast.error("API কী অনুপস্থিত"); return; }
    if (!form.invoice) { toast.error("প্রথমে মেসেজ প্রসেস করুন"); return; }
    setLoading(true);
    try {
      const order: OrderData = {
        invoice: form.invoice,
        name: form.name,
        address: form.address,
        phone: form.phone,
        cod: form.cod,
        note: form.note,
        item: form.item,
        deliveryType: form.deliveryType,
        status: "processing",
      };
      const res = await createOrder(order);
      setResult(res);
      if (res.status === "success") toast.success("বুকিং সফল!");
      else toast.error(res.errorMsg || "বুকিং ব্যর্থ");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const copyParcelId = (id: string | undefined) => {
    if (!id) return;
    const text = `Parcel Id : #${id}`;
    const html = `<span style="font-family:'Poppins', sans-serif; font-size:16pt; font-weight:bold; color:#000; background: linear-gradient(transparent 60%, #cfcfcf 60%); padding: 0 2px;">${text}</span>`;

    const blob = new Blob([html], { type: "text/html" });
    const textBlob = new Blob([text], { type: "text/plain" });

    if (navigator.clipboard && window.ClipboardItem) {
      navigator.clipboard.write([
        new ClipboardItem({
          "text/html": blob,
          "text/plain": textBlob,
        }),
      ]).then(() => {
        toast.success("Parcel ID copied with formatting!");
      }).catch((err) => {
        console.error("Clipboard write failed:", err);
        navigator.clipboard.writeText(text);
        toast.success("Parcel ID copied!");
      });
    } else {
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      toast.success("Parcel ID copied!");
    }
  };

  return (
    <div className="space-y-4">
      {/* Message Input */}
      <div className="tool-card !p-4 space-y-3">
        <label className="tool-label font-semibold">অর্ডারের ডেটা মেসেজ (৩-৪ লাইনে)</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={"Customer Name (নাম)\nAddress Example, Dhaka. (ঠিকানা)\n01312345678 (মোবাইল)\n500 (সিওডি টাকা)"}
          className="tool-textarea !min-h-[90px]"
        />
        <div className="flex gap-2">
          <button onClick={processMessage} className="tool-btn text-xs">মেসেজ প্রসেস করুন</button>
          <button onClick={clearAll} className="tool-btn-outline text-xs">ক্লিয়ার</button>
        </div>
      </div>

      {parseError && <div className="text-sm text-destructive bg-destructive/10 rounded-lg p-3">মেসেজ প্যাটার্ন ভুল। কমপক্ষে ৩ লাইন দিন।</div>}

      {/* Form */}
      <div className="tool-card !p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="tool-label">ইনভয়েস (Auto)</label>
            <input value={form.invoice} readOnly className="tool-input bg-muted/30" />
          </div>
          <div>
            <label className="tool-label">ডেলিভারি ধরন</label>
            <select value={form.deliveryType} onChange={(e) => setForm({ ...form, deliveryType: Number(e.target.value) })} className="tool-input">
              <option value={0}>0. হোম ডেলিভারি</option>
              <option value={1}>1. পয়েন্ট পিকআপ</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="tool-label">ক্রেতার নাম</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="tool-input" />
          </div>
          <div className="sm:col-span-2">
            <label className="tool-label">ক্রেতার ঠিকানা</label>
            <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="tool-input" />
          </div>
          <div>
            <label className="tool-label">ক্রেতার ফোন</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="tool-input" />
          </div>
          <div>
            <label className="tool-label">COD টাকার পরিমাণ</label>
            <input type="number" min={0} value={form.cod} onChange={(e) => setForm({ ...form, cod: Number(e.target.value) })} className="tool-input" />
          </div>
          <div>
            <label className="tool-label">পণ্যের বিবরণ (optional)</label>
            <input value={form.item} onChange={(e) => setForm({ ...form, item: e.target.value })} className="tool-input" />
          </div>
          <div>
            <label className="tool-label">নোট (optional)</label>
            <input
              id="commonNote"
              name="common_note"
              autoComplete="on"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              className="tool-input"
            />
          </div>
        </div>

        <button
          onClick={confirmBooking}
          disabled={!form.invoice || !hasKeys() || loading}
          className="tool-btn w-full disabled:opacity-50"
        >
          {loading ? "প্রসেস হচ্ছে..." : <><Send className="w-4 h-4" /> বুকিং কনফার্ম</>}
        </button>
      </div>

      {/* Response */}
      {result && (
        <div className="tool-card !p-3">
          {result.status === "success" ? (
            <div className="space-y-2">
              <div className="text-[12px] font-medium text-primary flex items-center gap-1.5">✅ Consignment created successfully.</div>

              <div
                onClick={() => copyParcelId(result.parcelId)}
                className="bg-[#f7f7f7] border border-[#eee] rounded-md p-2 flex items-center justify-between cursor-pointer hover:bg-[#f0f0f0] transition-colors group"
                title="Click to copy Parcel ID"
              >
                <span className="font-bold text-sm font-poppins">Parcel Id : #{result.parcelId}</span>
                <span className="text-[10px] bg-white border border-[#ddd] px-1.5 py-0.5 rounded text-muted-foreground group-hover:text-primary group-hover:border-primary transition-colors">
                  <Copy className="w-2.5 h-2.5 inline mr-1" />Copy
                </span>
              </div>

              {result.trackingCode && (
                <div className="bg-muted/20 border border-muted/10 rounded-md p-2 flex items-center justify-between">
                  <span className="font-bold text-xs">Tracking: {result.trackingCode}</span>
                  <a href={`https://steadfast.com.bd/t/${result.trackingCode}`} target="_blank" rel="noopener"
                    className="text-[10px] bg-background border border-border px-1.5 py-0.5 rounded hover:bg-muted transition-colors flex items-center gap-1">
                    <ExternalLink className="w-2.5 h-2.5" /> View
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-destructive">❌ বুকিং ব্যর্থ: {result.errorMsg}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SingleBooking;
