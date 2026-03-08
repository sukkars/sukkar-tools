import { useState } from "react";
import { differenceInYears, differenceInMonths, differenceInDays, format } from "date-fns";

const AgeCalculator = () => {
  const [birthDate, setBirthDate] = useState("");
  const [result, setResult] = useState<{ years: number; months: number; days: number; nextBirthday: string; totalDays: number } | null>(null);

  const calculate = () => {
    if (!birthDate) return;
    const birth = new Date(birthDate);
    const now = new Date();
    if (birth > now) return;

    const years = differenceInYears(now, birth);
    const months = differenceInMonths(now, birth) % 12;
    const lastBirthday = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
    if (lastBirthday > now) lastBirthday.setFullYear(lastBirthday.getFullYear() - 1);
    const nextMonth = new Date(lastBirthday);
    nextMonth.setMonth(nextMonth.getMonth() + months);
    const days = differenceInDays(now, nextMonth);
    const totalDays = differenceInDays(now, birth);

    const nextBday = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
    if (nextBday <= now) nextBday.setFullYear(nextBday.getFullYear() + 1);

    setResult({ years, months, days, nextBirthday: format(nextBday, "MMMM d, yyyy"), totalDays });
  };

  return (
    <div className="animate-fade-in">
      <h1 className="tool-title">Age Calculator</h1>
      <p className="tool-description mb-6">Calculate your exact age and days until next birthday.</p>

      <div className="tool-card space-y-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="tool-label">Date of Birth</label>
            <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="tool-input" />
          </div>
          <button className="tool-btn" onClick={calculate}>Calculate</button>
        </div>

        {result && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-lg border border-border bg-muted/30 p-4 text-center">
              <div className="text-3xl font-bold text-primary">{result.years}</div>
              <div className="text-xs text-muted-foreground">Years</div>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-4 text-center">
              <div className="text-3xl font-bold text-primary">{result.months}</div>
              <div className="text-xs text-muted-foreground">Months</div>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-4 text-center">
              <div className="text-3xl font-bold text-primary">{result.days}</div>
              <div className="text-xs text-muted-foreground">Days</div>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-4 text-center">
              <div className="text-3xl font-bold text-foreground">{result.totalDays.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Total Days</div>
            </div>
            <div className="col-span-full rounded-lg bg-primary/10 border border-primary/20 p-3 text-center text-sm text-foreground">
              🎂 Next birthday: <strong>{result.nextBirthday}</strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgeCalculator;
