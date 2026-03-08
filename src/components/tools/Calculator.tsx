import { useState } from "react";

const Calculator = () => {
  const [display, setDisplay] = useState("0");
  const [previousOperand, setPreviousOperand] = useState("");
  const [operation, setOperation] = useState<string | null>(null);
  const [resetNext, setResetNext] = useState(false);
  const [isScientific, setIsScientific] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const inputDigit = (digit: string) => {
    if (resetNext) {
      setDisplay(digit);
      setResetNext(false);
    } else {
      setDisplay(display === "0" ? digit : display + digit);
    }
  };

  const inputDecimal = () => {
    if (resetNext) { setDisplay("0."); setResetNext(false); return; }
    if (!display.includes(".")) setDisplay(display + ".");
  };

  const clear = () => { setDisplay("0"); setPreviousOperand(""); setOperation(null); };

  const handleOperation = (op: string) => {
    const current = parseFloat(display);
    if (operation && !resetNext) {
      const prev = parseFloat(previousOperand);
      const result = calculate(prev, current, operation);
      setDisplay(String(result));
      setPreviousOperand(String(result));
    } else {
      setPreviousOperand(display);
    }
    setOperation(op);
    setResetNext(true);
  };

  const calculate = (a: number, b: number, op: string): number => {
    switch (op) {
      case "+": return a + b;
      case "-": return a - b;
      case "×": return a * b;
      case "÷": return b !== 0 ? a / b : NaN;
      case "^": return Math.pow(a, b);
      default: return b;
    }
  };

  const handleEquals = () => {
    if (!operation) return;
    const prev = parseFloat(previousOperand);
    const current = parseFloat(display);
    const result = calculate(prev, current, operation);
    const expr = `${previousOperand} ${operation} ${display} = ${result}`;
    setHistory((h) => [expr, ...h.slice(0, 9)]);
    setDisplay(String(result));
    setOperation(null);
    setPreviousOperand("");
    setResetNext(true);
  };

  const handleScientific = (fn: string) => {
    const val = parseFloat(display);
    let result: number;
    switch (fn) {
      case "sin": result = Math.sin((val * Math.PI) / 180); break;
      case "cos": result = Math.cos((val * Math.PI) / 180); break;
      case "tan": result = Math.tan((val * Math.PI) / 180); break;
      case "√": result = Math.sqrt(val); break;
      case "log": result = Math.log10(val); break;
      case "ln": result = Math.log(val); break;
      case "x²": result = val * val; break;
      case "x³": result = val * val * val; break;
      case "1/x": result = val !== 0 ? 1 / val : NaN; break;
      case "π": result = Math.PI; break;
      case "e": result = Math.E; break;
      case "!": result = factorial(Math.round(val)); break;
      case "%": result = val / 100; break;
      case "±": result = -val; break;
      case "abs": result = Math.abs(val); break;
      default: return;
    }
    setDisplay(String(result));
    setResetNext(true);
  };

  const factorial = (n: number): number => {
    if (n < 0) return NaN;
    if (n <= 1) return 1;
    let r = 1;
    for (let i = 2; i <= n; i++) r *= i;
    return r;
  };

  const btnClass = "flex items-center justify-center rounded-lg text-lg font-semibold transition-all active:scale-95 h-14";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="tool-title">Calculator</h2>
        <button onClick={() => setIsScientific(!isScientific)} className="tool-btn-outline text-xs">
          {isScientific ? "Basic" : "Scientific"}
        </button>
      </div>

      <div className="tool-card !p-4 space-y-3">
        {/* Display */}
        <div className="bg-muted rounded-xl p-4 text-right min-h-[80px] flex flex-col justify-end">
          <div className="text-sm text-muted-foreground h-5">
            {previousOperand} {operation}
          </div>
          <div className="text-3xl font-mono font-bold text-foreground truncate">{display}</div>
        </div>

        {/* Scientific buttons */}
        {isScientific && (
          <div className="grid grid-cols-5 gap-1.5">
            {["sin", "cos", "tan", "π", "e", "√", "x²", "x³", "log", "ln", "!", "1/x", "abs", "±", "^"].map((fn) => (
              <button key={fn} onClick={() => fn === "^" ? handleOperation("^") : handleScientific(fn)}
                className={`${btnClass} bg-accent/10 text-accent-foreground hover:bg-accent/20 text-sm h-10`}>
                {fn}
              </button>
            ))}
          </div>
        )}

        {/* Main buttons */}
        <div className="grid grid-cols-4 gap-2">
          <button onClick={clear} className={`${btnClass} bg-destructive/10 text-destructive hover:bg-destructive/20 col-span-2`}>AC</button>
          <button onClick={() => handleScientific("%")} className={`${btnClass} bg-muted text-foreground hover:bg-muted/80`}>%</button>
          <button onClick={() => handleOperation("÷")} className={`${btnClass} bg-primary/10 text-primary hover:bg-primary/20`}>÷</button>

          {["7","8","9"].map(d => <button key={d} onClick={() => inputDigit(d)} className={`${btnClass} bg-muted text-foreground hover:bg-muted/80`}>{d}</button>)}
          <button onClick={() => handleOperation("×")} className={`${btnClass} bg-primary/10 text-primary hover:bg-primary/20`}>×</button>

          {["4","5","6"].map(d => <button key={d} onClick={() => inputDigit(d)} className={`${btnClass} bg-muted text-foreground hover:bg-muted/80`}>{d}</button>)}
          <button onClick={() => handleOperation("-")} className={`${btnClass} bg-primary/10 text-primary hover:bg-primary/20`}>−</button>

          {["1","2","3"].map(d => <button key={d} onClick={() => inputDigit(d)} className={`${btnClass} bg-muted text-foreground hover:bg-muted/80`}>{d}</button>)}
          <button onClick={() => handleOperation("+")} className={`${btnClass} bg-primary/10 text-primary hover:bg-primary/20`}>+</button>

          <button onClick={() => handleScientific("±")} className={`${btnClass} bg-muted text-foreground hover:bg-muted/80`}>±</button>
          <button onClick={() => inputDigit("0")} className={`${btnClass} bg-muted text-foreground hover:bg-muted/80`}>0</button>
          <button onClick={inputDecimal} className={`${btnClass} bg-muted text-foreground hover:bg-muted/80`}>.</button>
          <button onClick={handleEquals} className={`${btnClass} bg-primary text-primary-foreground hover:opacity-90`}>=</button>
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="tool-card !p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">History</span>
            <button onClick={() => setHistory([])} className="text-xs text-muted-foreground hover:text-foreground">Clear</button>
          </div>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {history.map((h, i) => (
              <div key={i} className="text-sm font-mono text-muted-foreground">{h}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Calculator;
