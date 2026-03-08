import { useState } from "react";
import { Plus, Trash2, Download } from "lucide-react";

const CsvGenerator = () => {
  const [headers, setHeaders] = useState(["Name", "Email", "Phone"]);
  const [rows, setRows] = useState<string[][]>([["", "", ""]]);

  const addColumn = () => {
    setHeaders([...headers, `Column ${headers.length + 1}`]);
    setRows(rows.map((r) => [...r, ""]));
  };

  const removeColumn = (i: number) => {
    if (headers.length <= 1) return;
    setHeaders(headers.filter((_, idx) => idx !== i));
    setRows(rows.map((r) => r.filter((_, idx) => idx !== i)));
  };

  const addRow = () => setRows([...rows, Array(headers.length).fill("")]);

  const removeRow = (i: number) => setRows(rows.filter((_, idx) => idx !== i));

  const updateHeader = (i: number, val: string) => {
    const h = [...headers];
    h[i] = val;
    setHeaders(h);
  };

  const updateCell = (ri: number, ci: number, val: string) => {
    const r = rows.map((row) => [...row]);
    r[ri][ci] = val;
    setRows(r);
  };

  const escCsv = (v: string) => {
    if (v.includes(",") || v.includes('"') || v.includes("\n")) return `"${v.replace(/"/g, '""')}"`;
    return v;
  };

  const downloadCsv = () => {
    const lines = [headers.map(escCsv).join(","), ...rows.map((r) => r.map(escCsv).join(","))];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "data.csv";
    a.click();
  };

  return (
    <div className="animate-fade-in">
      <h1 className="tool-title">CSV Generator</h1>
      <p className="tool-description mb-6">Build and download CSV files with a visual editor.</p>

      <div className="tool-card space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="w-8" />
                {headers.map((h, i) => (
                  <th key={i} className="px-1 pb-2">
                    <div className="flex items-center gap-1">
                      <input
                        className="tool-input text-xs font-medium py-1.5"
                        value={h}
                        onChange={(e) => updateHeader(i, e.target.value)}
                      />
                      {headers.length > 1 && (
                        <button onClick={() => removeColumn(i)} className="text-muted-foreground hover:text-destructive flex-shrink-0">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </th>
                ))}
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri}>
                  <td className="text-[10px] text-muted-foreground text-center pr-1">{ri + 1}</td>
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-1 py-0.5">
                      <input
                        className="tool-input text-xs py-1.5"
                        value={cell}
                        onChange={(e) => updateCell(ri, ci, e.target.value)}
                      />
                    </td>
                  ))}
                  <td>
                    <button onClick={() => removeRow(ri)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap gap-2">
          <button className="tool-btn-outline text-xs" onClick={addRow}>
            <Plus className="w-3.5 h-3.5" /> Add Row
          </button>
          <button className="tool-btn-outline text-xs" onClick={addColumn}>
            <Plus className="w-3.5 h-3.5" /> Add Column
          </button>
          <button className="tool-btn" onClick={downloadCsv}>
            <Download className="w-4 h-4" /> Download CSV
          </button>
        </div>
      </div>
    </div>
  );
};

export default CsvGenerator;
