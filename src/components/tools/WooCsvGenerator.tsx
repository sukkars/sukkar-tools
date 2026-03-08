import { useState } from "react";
import { Plus, Trash2, Download, Copy, Edit2, Package, X } from "lucide-react";
import { toast } from "sonner";


interface Variation {
  weight: string;
  price: string;
}

interface Product {
  id: number;
  type: "simple" | "variable";
  sku: string;
  name: string;
  shortDescription: string;
  description: string;
  regularPrice: string;
  salePrice: string;
  stock: string;
  weight: string;
  category: string;
  tags: string;
  imageUrl: string;
  variations: Variation[];
}

const emptyProduct: Omit<Product, "id"> = {
  type: "simple",
  sku: "",
  name: "",
  shortDescription: "",
  description: "",
  regularPrice: "",
  salePrice: "",
  stock: "",
  weight: "",
  category: "",
  tags: "",
  imageUrl: "",
  variations: [],
};

const WooCsvGenerator = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [nextId, setNextId] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Omit<Product, "id">>(emptyProduct);

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...emptyProduct, variations: [] });
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({ ...p, variations: p.variations.map((v) => ({ ...v })) });
    setModalOpen(true);
  };

  const updateField = (key: keyof Omit<Product, "id" | "variations">, val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const addVariation = () =>
    setForm((f) => ({ ...f, variations: [...f.variations, { weight: "", price: "" }] }));

  const removeVariation = (i: number) =>
    setForm((f) => ({ ...f, variations: f.variations.filter((_, idx) => idx !== i) }));

  const updateVariation = (i: number, key: keyof Variation, val: string) =>
    setForm((f) => ({
      ...f,
      variations: f.variations.map((v, idx) => (idx === i ? { ...v, [key]: val } : v)),
    }));

  const saveProduct = () => {
    if (!form.name.trim()) {
      toast.error("Product name is required");
      return;
    }
    if (form.type === "variable" && form.variations.length === 0) {
      toast.error("Add at least one variation for variable products");
      return;
    }

    if (editingId !== null) {
      setProducts((ps) => ps.map((p) => (p.id === editingId ? { ...form, id: editingId } : p)));
      toast.success("Product updated");
    } else {
      setProducts((ps) => [...ps, { ...form, id: nextId }]);
      setNextId((n) => n + 1);
      toast.success("Product added");
    }
    setModalOpen(false);
  };

  const duplicateProduct = (p: Product) => {
    setProducts((ps) => [...ps, { ...JSON.parse(JSON.stringify(p)), id: nextId, name: `${p.name} (Copy)` }]);
    setNextId((n) => n + 1);
    toast.success("Product duplicated");
  };

  const deleteProduct = (id: number) => {
    setProducts((ps) => ps.filter((p) => p.id !== id));
    toast.success("Product deleted");
  };

  const resetAll = () => {
    if (products.length === 0) return;
    setProducts([]);
    setNextId(1);
    toast.success("All products reset");
  };

  const escCsv = (v: string) => {
    if (v.includes(",") || v.includes('"') || v.includes("\n")) return `"${v.replace(/"/g, '""')}"`;
    return v;
  };

  const generateCsv = () => {
    if (products.length === 0) {
      toast.error("No products to export");
      return;
    }

    const headers = [
      "ID","Type","SKU","Name","Published","Is featured?","Visibility in catalog",
      "Short description","Description","Date sale price starts","Date sale price ends",
      "Tax status","Tax class","In stock?","Stock","Backorders","Sold individually?",
      "Weight (kg)","Length (cm)","Width (cm)","Height (cm)","Allow customer reviews?",
      "Purchase note","Sale price","Regular price","Categories","Tags","Shipping class",
      "Images","Download limit","Download expiry days","Parent","Grouped products",
      "Upsells","Cross-sells","External URL","Button text","Position",
      "Attribute 1 name","Attribute 1 value(s)","Attribute 1 visible","Attribute 1 global",
      "Attribute 2 name","Attribute 2 value(s)","Attribute 2 visible","Attribute 2 global",
      "Meta: _wpcom_is_markdown","Download 1 name","Download 1 URL","Download 2 name","Download 2 URL",
    ];

    const rows: string[][] = [];

    products.forEach((p) => {
      if (p.type === "simple") {
        rows.push([
          "","simple",p.sku,p.name,"1","0","visible",
          p.shortDescription,p.description,"","","taxable","",
          p.stock ? "1" : "0",p.stock,"0","0",
          p.weight,"","","","1","",
          p.salePrice,p.regularPrice,
          p.category ? `${p.category}:${p.category}` : "",
          p.tags,"",p.imageUrl,"","","","","","","","0",
          "","","0","0","","","0","0","0","","","","",
        ]);
      } else {
        rows.push([
          "","variable",p.sku,p.name,"1","0","visible",
          p.shortDescription,p.description,"","","taxable","",
          "1","","0","0","","","","","1","","","",
          p.category ? `${p.category}:${p.category}` : "",
          p.tags,"",p.imageUrl,"","","","","","","","0",
          "Weight",p.variations.map((v) => v.weight).join("|"),"1","1",
          "","","0","0","0","","","","",
        ]);
        p.variations.forEach((v, i) => {
          rows.push([
            "","variation",p.sku ? `${p.sku}-${i + 1}` : "",
            `${p.name} (${v.weight}kg)`,"1","0","visible",
            "","","","","taxable","","1","","0","0",
            v.weight,"","","","1","",
            "",v.price,"","","","","","",
            p.name,"","","","","0",
            "Weight",v.weight,"1","1","","","0","0","0","","","","",
          ]);
        });
      }
    });

    const csv = [headers.map(escCsv).join(","), ...rows.map((r) => r.map(escCsv).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "woocommerce_products_import.csv";
    a.click();
    toast.success("CSV downloaded");
  };

  return (
    <div className="animate-fade-in">
      <h1 className="tool-title">WooCommerce CSV Generator</h1>
      <p className="tool-description mb-4">
        Create WooCommerce-compatible CSV files for bulk product import. Supports simple &amp; variable products.
      </p>
      <HowToUse steps={[
        "Click 'Add Product' to create a new product entry.",
        "Choose between Simple (single item) or Variable (with weight/size variations) product type.",
        "Fill in product details: name, SKU, price, category, etc.",
        "For variable products, add variations with different weights and prices.",
        "Review your products in the list, then click 'Generate CSV' to download the file.",
        "Import the CSV file in WordPress → WooCommerce → Products → Import.",
      ]} title="How to use?" />

      {/* Product list */}
      <div className="tool-card mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-sm">Product List</h2>
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              {products.length} products
            </span>
          </div>
          <button className="tool-btn text-xs" onClick={openAdd}>
            <Plus className="w-3.5 h-3.5" /> Add Product
          </button>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <Package className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No products added yet</p>
            <button className="tool-btn text-xs mt-3" onClick={openAdd}>
              <Plus className="w-3.5 h-3.5" /> Add Your First Product
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {products.map((p) => (
              <div key={p.id} className="flex items-start justify-between p-3 rounded-lg border border-border hover:border-primary/20 transition-colors">
                <div className="min-w-0">
                  <div className="font-medium text-sm truncate">{p.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {p.type === "simple" ? "Simple" : "Variable"}
                    {p.sku && ` • SKU: ${p.sku}`}
                    {p.regularPrice && ` • $${p.regularPrice}`}
                  </div>
                  {p.type === "variable" && p.variations.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {p.variations.map((v, i) => (
                        <span key={i} className="text-[10px] bg-muted px-1.5 py-0.5 rounded">
                          {v.weight}kg — ${v.price}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                  <button onClick={() => openEdit(p)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => duplicateProduct(p)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => deleteProduct(p.id)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex justify-end gap-2">
        <button className="tool-btn-outline text-xs" onClick={resetAll}>
          <Trash2 className="w-3.5 h-3.5" /> Reset All
        </button>
        <button className="tool-btn" onClick={generateCsv}>
          <Download className="w-4 h-4" /> Generate CSV
        </button>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative bg-card border border-border rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">{editingId ? "Edit Product" : "Add Product"}</h3>
              <button onClick={() => setModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Product Type</label>
                  <select className="tool-input mt-1" value={form.type} onChange={(e) => updateField("type", e.target.value as "simple" | "variable")}>
                    <option value="simple">Simple</option>
                    <option value="variable">Variable</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">SKU</label>
                  <input className="tool-input mt-1" value={form.sku} onChange={(e) => updateField("sku", e.target.value)} />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Product Name *</label>
                <input className="tool-input mt-1" value={form.name} onChange={(e) => updateField("name", e.target.value)} />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Short Description</label>
                <textarea className="tool-input mt-1 min-h-[60px]" value={form.shortDescription} onChange={(e) => updateField("shortDescription", e.target.value)} />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Description</label>
                <textarea className="tool-input mt-1 min-h-[80px]" value={form.description} onChange={(e) => updateField("description", e.target.value)} />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Regular Price</label>
                  <input type="number" step="0.01" className="tool-input mt-1" value={form.regularPrice} onChange={(e) => updateField("regularPrice", e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Sale Price</label>
                  <input type="number" step="0.01" className="tool-input mt-1" value={form.salePrice} onChange={(e) => updateField("salePrice", e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Stock</label>
                  <input type="number" className="tool-input mt-1" value={form.stock} onChange={(e) => updateField("stock", e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Weight (kg)</label>
                  <input type="number" step="0.01" className="tool-input mt-1" value={form.weight} onChange={(e) => updateField("weight", e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Category Slug</label>
                  <input className="tool-input mt-1" placeholder="e.g. electronics" value={form.category} onChange={(e) => updateField("category", e.target.value)} />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Tags (comma separated)</label>
                <input className="tool-input mt-1" value={form.tags} onChange={(e) => updateField("tags", e.target.value)} />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Image URL</label>
                <input className="tool-input mt-1" value={form.imageUrl} onChange={(e) => updateField("imageUrl", e.target.value)} />
              </div>

              {/* Variations */}
              {form.type === "variable" && (
                <div className="border border-border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-muted-foreground">Weight Variations</label>
                    <button className="tool-btn-outline text-[11px]" onClick={addVariation}>
                      <Plus className="w-3 h-3" /> Add Variation
                    </button>
                  </div>
                  <div className="space-y-2">
                    {form.variations.map((v, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input type="number" step="0.01" placeholder="Weight (kg)" className="tool-input text-xs flex-1" value={v.weight} onChange={(e) => updateVariation(i, "weight", e.target.value)} />
                        <input type="number" step="0.01" placeholder="Price" className="tool-input text-xs flex-1" value={v.price} onChange={(e) => updateVariation(i, "price", e.target.value)} />
                        <button onClick={() => removeVariation(i)} className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    {form.variations.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-2">No variations yet</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button className="tool-btn-outline text-xs" onClick={() => setModalOpen(false)}>Cancel</button>
              <button className="tool-btn" onClick={saveProduct}>Save Product</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WooCsvGenerator;
