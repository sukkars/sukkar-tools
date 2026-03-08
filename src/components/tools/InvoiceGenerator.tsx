import { useState } from "react";
import { Plus, Trash2, Download } from "lucide-react";

interface InvoiceItem { description: string; qty: number; price: number; }

const InvoiceGenerator = () => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [invoiceNo, setInvoiceNo] = useState(`INV-${Date.now().toString(36).toUpperCase()}`);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [items, setItems] = useState<InvoiceItem[]>([{ description: "", qty: 1, price: 0 }]);
  const [tax, setTax] = useState(0);
  const [currency, setCurrency] = useState("$");

  const addItem = () => setItems([...items, { description: "", qty: 1, price: 0 }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: keyof InvoiceItem, val: string | number) => {
    const updated = [...items];
    (updated[i] as any)[field] = val;
    setItems(updated);
  };

  const subtotal = items.reduce((s, item) => s + item.qty * item.price, 0);
  const taxAmount = subtotal * (tax / 100);
  const total = subtotal + taxAmount;

  const printInvoice = () => {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html><head><title>Invoice ${invoiceNo}</title>
      <style>
        body { font-family: system-ui, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; color: #333; }
        h1 { font-size: 28px; margin: 0 0 5px; }
        .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .meta { text-align: right; }
        .meta p { margin: 2px 0; font-size: 14px; }
        .addresses { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .addr { font-size: 14px; line-height: 1.6; }
        .addr strong { display: block; margin-bottom: 4px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { background: #f3f4f6; text-align: left; padding: 10px; font-size: 13px; text-transform: uppercase; }
        td { padding: 10px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
        .totals { text-align: right; }
        .totals td { border: none; padding: 4px 10px; }
        .total-row { font-size: 18px; font-weight: bold; }
        @media print { body { padding: 0; } }
      </style></head><body>
      <div class="header">
        <h1>INVOICE</h1>
        <div class="meta">
          <p><strong>${invoiceNo}</strong></p>
          <p>Date: ${date}</p>
        </div>
      </div>
      <div class="addresses">
        <div class="addr"><strong>From:</strong>${from.replace(/\n/g, "<br>")}</div>
        <div class="addr"><strong>To:</strong>${to.replace(/\n/g, "<br>")}</div>
      </div>
      <table>
        <thead><tr><th>Description</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
        <tbody>
          ${items.map(item => `<tr><td>${item.description}</td><td>${item.qty}</td><td>${currency}${item.price.toFixed(2)}</td><td>${currency}${(item.qty * item.price).toFixed(2)}</td></tr>`).join("")}
        </tbody>
      </table>
      <table class="totals">
        <tr><td>Subtotal:</td><td>${currency}${subtotal.toFixed(2)}</td></tr>
        <tr><td>Tax (${tax}%):</td><td>${currency}${taxAmount.toFixed(2)}</td></tr>
        <tr class="total-row"><td>Total:</td><td>${currency}${total.toFixed(2)}</td></tr>
      </table>
      <script>window.print();</script>
      </body></html>
    `);
    win.document.close();
  };

  return (
    <div className="space-y-4">
      <h2 className="tool-title">Invoice Generator</h2>
      <p className="tool-description">Create and print professional invoices</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="tool-label">From</label>
          <textarea value={from} onChange={(e) => setFrom(e.target.value)} placeholder="Your name / company&#10;Address" className="tool-textarea !min-h-[80px]" />
        </div>
        <div>
          <label className="tool-label">Bill To</label>
          <textarea value={to} onChange={(e) => setTo(e.target.value)} placeholder="Client name / company&#10;Address" className="tool-textarea !min-h-[80px]" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="tool-label">Invoice #</label>
          <input value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} className="tool-input" />
        </div>
        <div>
          <label className="tool-label">Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="tool-input" />
        </div>
        <div>
          <label className="tool-label">Currency</label>
          <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="tool-input">
            {["$", "€", "£", "¥", "৳", "₹"].map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-2">
        <label className="tool-label">Items</label>
        {items.map((item, i) => (
          <div key={i} className="grid grid-cols-[1fr_60px_80px_32px] gap-2 items-end">
            <input value={item.description} onChange={(e) => updateItem(i, "description", e.target.value)} placeholder="Description" className="tool-input" />
            <input type="number" min={1} value={item.qty} onChange={(e) => updateItem(i, "qty", Number(e.target.value))} className="tool-input" />
            <input type="number" min={0} step={0.01} value={item.price} onChange={(e) => updateItem(i, "price", Number(e.target.value))} className="tool-input" />
            <button onClick={() => removeItem(i)} className="h-[42px] flex items-center justify-center text-muted-foreground hover:text-destructive">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button onClick={addItem} className="tool-btn-outline text-xs w-full"><Plus className="w-3 h-3" /> Add Item</button>
      </div>

      <div className="w-32">
        <label className="tool-label">Tax %</label>
        <input type="number" min={0} value={tax} onChange={(e) => setTax(Number(e.target.value))} className="tool-input" />
      </div>

      {/* Totals */}
      <div className="tool-card !p-4 text-right space-y-1">
        <div className="text-sm text-muted-foreground">Subtotal: {currency}{subtotal.toFixed(2)}</div>
        <div className="text-sm text-muted-foreground">Tax ({tax}%): {currency}{taxAmount.toFixed(2)}</div>
        <div className="text-xl font-bold">Total: {currency}{total.toFixed(2)}</div>
      </div>

      <button onClick={printInvoice} className="tool-btn w-full"><Download className="w-4 h-4" /> Print / Save PDF</button>
    </div>
  );
};

export default InvoiceGenerator;
