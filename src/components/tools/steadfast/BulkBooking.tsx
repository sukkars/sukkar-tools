import { useState } from "react";
import { Send, Trash2, RotateCcw, Copy } from "lucide-react";
import { toast } from "sonner";
import { parseMessage, createOrder, hasKeys, type OrderData, cleanPrefixes, cleanNumberString } from "./utils";

const BulkBooking = () => {
  const [input, setInput] = useState("");
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [commonNote, setCommonNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const extractOrders = () => {
    const blocks = input.split("---").map(b => b.trim()).filter(Boolean);
    const parsed: OrderData[] = [];
    for (const block of blocks) {
      const result = parseMessage(block);
      if (result) {
        parsed.push({
          invoice: "B-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
          name: result.name,
          address: result.address,
          phone: result.phone,
          cod: result.cod,
          status: "pending",
        });
      }
    }
    if (parsed.length === 0) { toast.error("কোন অর্ডার পাওয়া যায়নি"); return; }
    setOrders(parsed);
    toast.success(`${parsed.length}টি অর্ডার এক্সট্র্যাক্ট হয়েছে`);
  };

  const deleteOrder = (idx: number) => {
    setOrders(orders.filter((_, i) => i !== idx));
  };

  const submitAll = async () => {
    if (!hasKeys()) { toast.error("API কী অনুপস্থিত"); return; }
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
    toast.success("সবগুলো প্রসেস শেষ হয়েছে।");
  };

  const copyId = (id: string) => {
    const text = `Parcel ID: #${id}`;
    const html = `<span style="font-family: 'Poppins', sans-serif; font-size: 16pt; font-weight: bold; color: #000; display: inline-block; background: #f7f7f7;">${text}</span>`;
    const blob = new Blob([html], { type: "text/html" });
    const textBlob = new Blob([text], { type: "text/plain" });
    navigator.clipboard.write([new ClipboardItem({ "text/html": blob, "text/plain": textBlob })]);
    toast.success("কপি হয়েছে!");
  };

  return (
    <div className="space-y-4">
      <div className="tool-card !p-4 space-y-3">
        <label className="tool-label font-semibold">
          একাধিক মেসেজ দিন (প্রতিটির মাঝে <code className="bg-muted px-1.5 py-0.5 rounded text-xs">---</code> ব্যবহার করুন)
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={"নাম: যায়েদ\nঠিকানা: মিরপুর, ঢাকা\n01700000000 (ফোন)\n500tk (সিওডি)\n---\nহামিদুর রহমান\nনিউমার্কেট, যশোর।\n01800000000\n1000"}
          className="tool-textarea !min-h-[140px]"
        />
        <div className="flex gap-2">
          <button onClick={extractOrders} className="tool-btn text-xs">ডেটা এক্সট্র্যাক্ট করুন</button>
          <button onClick={() => { setInput(""); setOrders([]); }} className="tool-btn-outline text-xs"><RotateCcw className="w-3 h-3" /> ক্লিয়ার</button>
        </div>
      </div>

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
                  <tr key={i} className="text-xs">
                    <td className="px-3 py-2 text-muted-foreground font-bold">{i + 1}</td>
                    <td className="px-3 py-2">{o.name}</td>
                    <td className="px-3 py-2 max-w-[150px] truncate">{o.address}</td>
                    <td className="px-3 py-2 font-mono">{o.phone}</td>
                    <td className="px-3 py-2">{o.cod}</td>
                    <td className="px-3 py-2">
                      <button onClick={() => deleteOrder(i)} className="text-destructive hover:text-destructive/80">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                    <td className="px-3 py-2">
                      {o.status === "pending" && <span className="text-amber-500">⏳ Pending</span>}
                      {o.status === "processing" && <span className="text-blue-500">🔄 Processing...</span>}
                      {o.status === "success" && (
                        <div className="flex items-center gap-1">
                          <span className="text-primary font-semibold">✅ #{o.parcelId}</span>
                          <button onClick={() => copyId(o.parcelId!)} className="p-0.5 hover:bg-muted rounded">
                            <Copy className="w-3 h-3" />
                          </button>
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
            <label className="tool-label font-semibold">কমন নোট (সবগুলো অর্ডারের জন্য)</label>
            <input
              value={commonNote}
              onChange={(e) => setCommonNote(e.target.value)}
              placeholder="যেমন: সাবধানে ডেলিভারি করবেন"
              className="tool-input"
            />
            <button
              onClick={submitAll}
              disabled={submitting || !hasKeys()}
              className="tool-btn w-full disabled:opacity-50"
            >
              {submitting ? "বুকিং চলছে..." : <><Send className="w-4 h-4" /> সবগুলো একসাথে বুকিং দিন</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkBooking;
