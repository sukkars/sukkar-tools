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

  const copyParcelId = (id: string) => {
    const text = `Parcel ID: #${id}`;
    const html = `<span style="font-family: 'Poppins', sans-serif; font-size: 16pt; font-weight: bold; color: #000; display: inline-block; background: #f7f7f7;">${text}</span>`;
    const blob = new Blob([html], { type: "text/html" });
    const textBlob = new Blob([text], { type: "text/plain" });
    navigator.clipboard.write([new ClipboardItem({ "text/html": blob, "text/plain": textBlob })]);
    toast.success("কপি হয়েছে!");
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
            <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className="tool-input" />
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
        <div className="tool-card !p-4">
          {result.status === "success" ? (
            <div className="space-y-3">
              <div className="text-sm font-medium text-primary flex items-center gap-2">✅ Consignment created successfully.</div>
              <div className="bg-muted/30 rounded-lg p-3 flex items-center justify-between">
                <span className="font-bold">Parcel Id : #{result.parcelId}</span>
                <button onClick={() => copyParcelId(result.parcelId!)} className="tool-btn-outline !px-2 !py-1 text-xs">
                  <Copy className="w-3 h-3" /> Copy
                </button>
              </div>
              {result.trackingCode && (
                <div className="bg-muted/30 rounded-lg p-3 flex items-center justify-between">
                  <span className="font-bold">Tracking: {result.trackingCode}</span>
                  <a href={`https://steadfast.com.bd/t/${result.trackingCode}`} target="_blank" rel="noopener"
                    className="tool-btn-outline !px-2 !py-1 text-xs">
                    <ExternalLink className="w-3 h-3" /> View
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
