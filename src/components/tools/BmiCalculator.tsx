import { useState } from "react";

const BmiCalculator = () => {
  const [weight, setWeight] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [feet, setFeet] = useState("");
  const [inches, setInches] = useState("");
  const [unit, setUnit] = useState<"cm" | "ft">("cm");
  const [result, setResult] = useState<{ bmi: number; category: string; color: string } | null>(null);

  const calculate = () => {
    const w = parseFloat(weight);
    let h: number;
    if (unit === "cm") {
      h = parseFloat(heightCm) / 100;
    } else {
      h = (parseFloat(feet || "0") * 12 + parseFloat(inches || "0")) * 0.0254;
    }
    if (!w || !h || h <= 0) return;
    const bmi = w / (h * h);
    let category: string, color: string;
    if (bmi < 18.5) { category = "Underweight"; color = "text-blue-500"; }
    else if (bmi < 25) { category = "Normal"; color = "text-green-500"; }
    else if (bmi < 30) { category = "Overweight"; color = "text-yellow-500"; }
    else { category = "Obese"; color = "text-red-500"; }
    setResult({ bmi: Math.round(bmi * 10) / 10, category, color });
  };

  return (
    <div className="space-y-4 max-w-md">
      <h2 className="tool-title">BMI Calculator</h2>
      <p className="tool-description">Calculate your Body Mass Index</p>

      <div className="tool-card space-y-4">
        <div>
          <label className="tool-label">Weight (kg)</label>
          <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="e.g. 70" className="tool-input" />
        </div>

        <div className="flex gap-2">
          <button onClick={() => setUnit("cm")} className={unit === "cm" ? "tool-btn text-xs" : "tool-btn-outline text-xs"}>Centimeters</button>
          <button onClick={() => setUnit("ft")} className={unit === "ft" ? "tool-btn text-xs" : "tool-btn-outline text-xs"}>Feet & Inches</button>
        </div>

        {unit === "cm" ? (
          <div>
            <label className="tool-label">Height (cm)</label>
            <input type="number" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} placeholder="e.g. 175" className="tool-input" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="tool-label">Feet</label>
              <input type="number" value={feet} onChange={(e) => setFeet(e.target.value)} placeholder="5" className="tool-input" />
            </div>
            <div>
              <label className="tool-label">Inches</label>
              <input type="number" value={inches} onChange={(e) => setInches(e.target.value)} placeholder="9" className="tool-input" />
            </div>
          </div>
        )}

        <button onClick={calculate} className="tool-btn w-full">Calculate BMI</button>

        {result && (
          <div className="text-center p-4 rounded-xl bg-muted">
            <div className="text-4xl font-bold font-mono">{result.bmi}</div>
            <div className={`text-lg font-semibold mt-1 ${result.color}`}>{result.category}</div>
            <div className="text-xs text-muted-foreground mt-2">
              Underweight: &lt;18.5 · Normal: 18.5–24.9 · Overweight: 25–29.9 · Obese: ≥30
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BmiCalculator;
