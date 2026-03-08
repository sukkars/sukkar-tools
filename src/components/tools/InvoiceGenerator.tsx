import { useState } from "react";
import { Plus, Trash2, Download, FileText, ChevronLeft } from "lucide-react";

interface InvoiceItem { description: string; qty: number; price: number; }

type Template = "classic" | "modern" | "minimal" | "bold";

const TEMPLATES: { id: Template; name: string; desc: string }[] = [
  { id: "classic", name: "Classic", desc: "Traditional professional layout" },
  { id: "modern", name: "Modern", desc: "Clean with accent colors" },
  { id: "minimal", name: "Minimal", desc: "Simple & elegant" },
  { id: "bold", name: "Bold", desc: "Strong header with dark accents" },
];

const getTemplateCSS = (t: Template, accent: string) => {
  const styles: Record<Template, string> = {
    classic: `
      body { font-family: Georgia, 'Times New Roman', serif; padding: 40px; max-width: 800px; margin: 0 auto; color: #333; }
      h1 { font-size: 28px; margin: 0 0 5px; color: ${accent}; }
      .header { display: flex; justify-content: space-between; margin-bottom: 30px; border-bottom: 3px solid ${accent}; padding-bottom: 15px; }
      .meta { text-align: right; } .meta p { margin: 2px 0; font-size: 14px; }
      .addresses { display: flex; justify-content: space-between; margin-bottom: 30px; }
      .addr { font-size: 14px; line-height: 1.6; } .addr strong { display: block; margin-bottom: 4px; color: ${accent}; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
      th { background: ${accent}; color: white; text-align: left; padding: 10px; font-size: 13px; text-transform: uppercase; }
      td { padding: 10px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
      .totals { text-align: right; } .totals td { border: none; padding: 4px 10px; }
      .total-row { font-size: 18px; font-weight: bold; color: ${accent}; }
      .footer { margin-top: 40px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 12px; color: #999; text-align: center; }
    `,
    modern: `
      body { font-family: 'Segoe UI', system-ui, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; color: #1a1a1a; }
      h1 { font-size: 32px; margin: 0; font-weight: 300; letter-spacing: 4px; color: ${accent}; }
      .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
      .meta { text-align: right; } .meta p { margin: 2px 0; font-size: 13px; color: #666; }
      .addresses { display: flex; justify-content: space-between; margin-bottom: 35px; background: #f8f9fa; padding: 20px; border-radius: 8px; }
      .addr { font-size: 14px; line-height: 1.6; } .addr strong { display: block; margin-bottom: 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: ${accent}; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
      th { text-align: left; padding: 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: ${accent}; border-bottom: 2px solid ${accent}; }
      td { padding: 12px; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
      .totals { text-align: right; } .totals td { border: none; padding: 6px 12px; }
      .total-row { font-size: 20px; font-weight: 600; color: ${accent}; }
      .footer { margin-top: 40px; font-size: 12px; color: #999; text-align: center; }
    `,
    minimal: `
      body { font-family: system-ui, sans-serif; padding: 50px; max-width: 750px; margin: 0 auto; color: #333; }
      h1 { font-size: 18px; margin: 0; font-weight: 600; text-transform: uppercase; letter-spacing: 3px; }
      .header { display: flex; justify-content: space-between; margin-bottom: 50px; }
      .meta { text-align: right; } .meta p { margin: 2px 0; font-size: 13px; color: #888; }
      .addresses { display: flex; justify-content: space-between; margin-bottom: 40px; }
      .addr { font-size: 13px; line-height: 1.8; color: #555; } .addr strong { display: block; margin-bottom: 4px; color: #333; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
      th { text-align: left; padding: 8px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #aaa; border-bottom: 1px solid #ddd; }
      td { padding: 10px 0; border-bottom: 1px solid #f5f5f5; font-size: 13px; }
      .totals { text-align: right; } .totals td { border: none; padding: 4px 0; font-size: 13px; }
      .total-row { font-size: 16px; font-weight: 600; }
      .footer { margin-top: 50px; font-size: 11px; color: #bbb; text-align: center; }
    `,
    bold: `
      body { font-family: 'Arial Black', 'Helvetica Neue', sans-serif; padding: 0; max-width: 800px; margin: 0 auto; color: #1a1a1a; }
      h1 { font-size: 36px; margin: 0; color: white; }
      .header { display: flex; justify-content: space-between; align-items: center; padding: 30px; background: ${accent}; color: white; margin-bottom: 30px; }
      .meta { text-align: right; color: rgba(255,255,255,0.9); } .meta p { margin: 2px 0; font-size: 14px; }
      .addresses { display: flex; justify-content: space-between; margin: 0 30px 30px; }
      .addr { font-size: 14px; line-height: 1.6; } .addr strong { display: block; margin-bottom: 4px; font-size: 12px; text-transform: uppercase; }
      table { width: calc(100% - 60px); margin: 0 30px 20px; border-collapse: collapse; }
      th { background: #1a1a1a; color: white; text-align: left; padding: 12px; font-size: 12px; text-transform: uppercase; }
      td { padding: 12px; border-bottom: 2px solid #eee; font-size: 14px; }
      .totals { width: calc(100% - 60px); margin: 0 30px; text-align: right; } .totals td { border: none; padding: 6px 12px; }
      .total-row { font-size: 22px; font-weight: 900; color: ${accent}; }
      .footer { margin: 40px 30px 0; padding-top: 15px; border-top: 2px solid #eee; font-size: 12px; color: #999; text-align: center; }
    `,
  };
  return styles[t];
};

const ACCENTS = ["#2563eb", "#059669", "#dc2626", "#7c3aed", "#d97706", "#0891b2", "#1a1a1a"];

const InvoiceGenerator = () => {
  const [template, setTemplate] = useState<Template>("modern");
  const [accent, setAccent] = useState("#2563eb");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [invoiceNo, setInvoiceNo] = useState(`INV-${Date.now().toString(36).toUpperCase()}`);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [items, setItems] = useState<InvoiceItem[]>([{ description: "", qty: 1, price: 0 }]);
  const [tax, setTax] = useState(0);
  const [currency, setCurrency] = useState("$");
  const [note, setNote] = useState("");
  const [step, setStep] = useState<"template" | "form">("template");

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
      <style>${getTemplateCSS(template, accent)} @media print { body { padding: 20px; } .header { -webkit-print-color-adjust: exact; print-color-adjust: exact; } th { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }</style></head><body>
      <div class="header">
        <h1>INVOICE</h1>
        <div class="meta">
          <p><strong>${invoiceNo}</strong></p>
          <p>Date: ${date}</p>
        </div>
      </div>
      <div class="addresses">
        <div class="addr"><strong>From</strong>${from.replace(/\n/g, "<br>")}</div>
        <div class="addr"><strong>Bill To</strong>${to.replace(/\n/g, "<br>")}</div>
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
      ${note ? `<div class="footer">${note}</div>` : ""}
      <script>window.print();</script>
      </body></html>
    `);
    win.document.close();
  };

  if (step === "template") {
    return (
      <div className="space-y-4">
        <h2 className="tool-title">Invoice Maker</h2>
        <p className="tool-description">Choose a template to get started</p>

        <div className="grid grid-cols-2 gap-3">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => { setTemplate(t.id); setStep("form"); }}
              className={`tool-card !p-4 text-left hover:border-primary/40 transition-all cursor-pointer ${template === t.id ? "border-primary ring-1 ring-primary/20" : ""}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-4 h-4 text-primary" />
                <span className="font-semibold text-sm">{t.name}</span>
              </div>
              <p className="text-xs text-muted-foreground">{t.desc}</p>
            </button>
          ))}
        </div>

        <div>
          <label className="tool-label">Accent Color</label>
          <div className="flex gap-2 mt-1">
            {ACCENTS.map((c) => (
              <button
                key={c}
                onClick={() => setAccent(c)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${accent === c ? "border-foreground scale-110" : "border-transparent"}`}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button onClick={() => setStep("template")} className="p-1.5 rounded-lg hover:bg-muted">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="tool-title !mb-0">Invoice Maker</h2>
          <p className="text-xs text-muted-foreground capitalize">{template} template</p>
        </div>
      </div>

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

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="tool-label">Tax %</label>
          <input type="number" min={0} value={tax} onChange={(e) => setTax(Number(e.target.value))} className="tool-input" />
        </div>
        <div>
          <label className="tool-label">Note / Footer</label>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Thank you for your business!" className="tool-input" />
        </div>
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
