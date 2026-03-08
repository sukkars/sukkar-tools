import { useState } from "react";

const conversions: Record<string, Record<string, Record<string, number>>> = {
  Length: {
    meter: { meter: 1, kilometer: 0.001, centimeter: 100, millimeter: 1000, mile: 0.000621371, yard: 1.09361, foot: 3.28084, inch: 39.3701 },
    kilometer: { meter: 1000, kilometer: 1, centimeter: 100000, millimeter: 1e6, mile: 0.621371, yard: 1093.61, foot: 3280.84, inch: 39370.1 },
    centimeter: { meter: 0.01, kilometer: 0.00001, centimeter: 1, millimeter: 10, mile: 6.2137e-6, yard: 0.0109361, foot: 0.0328084, inch: 0.393701 },
    mile: { meter: 1609.34, kilometer: 1.60934, centimeter: 160934, millimeter: 1.609e6, mile: 1, yard: 1760, foot: 5280, inch: 63360 },
    foot: { meter: 0.3048, kilometer: 0.0003048, centimeter: 30.48, millimeter: 304.8, mile: 0.000189394, yard: 0.333333, foot: 1, inch: 12 },
    inch: { meter: 0.0254, kilometer: 2.54e-5, centimeter: 2.54, millimeter: 25.4, mile: 1.5783e-5, yard: 0.0277778, foot: 0.0833333, inch: 1 },
    yard: { meter: 0.9144, kilometer: 0.0009144, centimeter: 91.44, millimeter: 914.4, mile: 0.000568182, yard: 1, foot: 3, inch: 36 },
    millimeter: { meter: 0.001, kilometer: 1e-6, centimeter: 0.1, millimeter: 1, mile: 6.2137e-7, yard: 0.00109361, foot: 0.00328084, inch: 0.0393701 },
  },
  Weight: {
    kilogram: { kilogram: 1, gram: 1000, milligram: 1e6, pound: 2.20462, ounce: 35.274 },
    gram: { kilogram: 0.001, gram: 1, milligram: 1000, pound: 0.00220462, ounce: 0.035274 },
    milligram: { kilogram: 1e-6, gram: 0.001, milligram: 1, pound: 2.2046e-6, ounce: 3.5274e-5 },
    pound: { kilogram: 0.453592, gram: 453.592, milligram: 453592, pound: 1, ounce: 16 },
    ounce: { kilogram: 0.0283495, gram: 28.3495, milligram: 28349.5, pound: 0.0625, ounce: 1 },
  },
  Temperature: {},
};

const UnitConverter = () => {
  const [category, setCategory] = useState("Length");
  const [fromUnit, setFromUnit] = useState("meter");
  const [toUnit, setToUnit] = useState("kilometer");
  const [value, setValue] = useState("");

  const units = category === "Temperature" ? ["celsius", "fahrenheit", "kelvin"] : Object.keys(conversions[category] || {});

  const convert = () => {
    const v = parseFloat(value);
    if (isNaN(v)) return "";
    if (category === "Temperature") {
      if (fromUnit === toUnit) return v.toFixed(4);
      if (fromUnit === "celsius" && toUnit === "fahrenheit") return (v * 9 / 5 + 32).toFixed(4);
      if (fromUnit === "celsius" && toUnit === "kelvin") return (v + 273.15).toFixed(4);
      if (fromUnit === "fahrenheit" && toUnit === "celsius") return ((v - 32) * 5 / 9).toFixed(4);
      if (fromUnit === "fahrenheit" && toUnit === "kelvin") return ((v - 32) * 5 / 9 + 273.15).toFixed(4);
      if (fromUnit === "kelvin" && toUnit === "celsius") return (v - 273.15).toFixed(4);
      if (fromUnit === "kelvin" && toUnit === "fahrenheit") return ((v - 273.15) * 9 / 5 + 32).toFixed(4);
    }
    const factor = conversions[category]?.[fromUnit]?.[toUnit];
    return factor != null ? (v * factor).toFixed(6).replace(/\.?0+$/, "") : "";
  };

  const result = convert();

  return (
    <div className="animate-fade-in">
      <h1 className="tool-title">Unit Converter</h1>
      <p className="tool-description mb-6">Convert between length, weight, and temperature units.</p>

      <div className="tool-card space-y-4">
        <div className="flex gap-2">
          {["Length", "Weight", "Temperature"].map((c) => (
            <button
              key={c}
              onClick={() => { setCategory(c); setFromUnit(c === "Temperature" ? "celsius" : Object.keys(conversions[c])[0]); setToUnit(c === "Temperature" ? "fahrenheit" : Object.keys(conversions[c])[1]); setValue(""); }}
              className={category === c ? "tool-btn" : "tool-btn-outline"}
            >{c}</button>
          ))}
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label className="tool-label">Value</label>
            <input type="number" value={value} onChange={(e) => setValue(e.target.value)} className="tool-input" placeholder="0" />
          </div>
          <div>
            <label className="tool-label">From</label>
            <select value={fromUnit} onChange={(e) => setFromUnit(e.target.value)} className="tool-input">
              {units.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div>
            <label className="tool-label">To</label>
            <select value={toUnit} onChange={(e) => setToUnit(e.target.value)} className="tool-input">
              {units.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </div>

        {result && (
          <div className="rounded-lg bg-muted/50 border border-border p-4 text-center">
            <span className="text-3xl font-bold text-primary">{result}</span>
            <span className="text-sm text-muted-foreground ml-2">{toUnit}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnitConverter;
