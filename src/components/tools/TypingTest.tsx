import { useState, useRef, useEffect, useCallback } from "react";
import { RotateCcw } from "lucide-react";

interface SampleText {
  label: string;
  lang: "en" | "bn";
  text: string;
}

const SAMPLES: SampleText[] = [
  // English
  { label: "The quick brown fox jumps over the lazy dog near the river...", lang: "en", text: "The quick brown fox jumps over the lazy dog near the river bank on a warm summer afternoon while birds sing melodiously in the tall green trees." },
  { label: "Programming is the art of telling a computer what to do...", lang: "en", text: "Programming is the art of telling a computer what to do through carefully structured instructions and logical thinking patterns that solve real world problems." },
  { label: "Technology continues to reshape how we communicate and...", lang: "en", text: "Technology continues to reshape how we communicate and work together across different time zones and cultural boundaries worldwide making the world a smaller place." },
  { label: "A good developer writes code that humans can understand...", lang: "en", text: "A good developer writes code that humans can understand while machines execute it efficiently and reliably every single time without any unexpected errors or failures." },
  { label: "The internet has connected billions of people making...", lang: "en", text: "The internet has connected billions of people making information accessible to anyone with a device and network connection available at any time from anywhere in the world." },
  { label: "Success is not final and failure is not fatal it is the...", lang: "en", text: "Success is not final and failure is not fatal it is the courage to continue that counts so keep working hard every single day and never give up on your dreams no matter what." },
  { label: "Open source software has revolutionized the way developers...", lang: "en", text: "Open source software has revolutionized the way developers build applications by allowing them to collaborate freely share knowledge and create tools that benefit the entire community." },
  // Bangla
  { label: "বাংলাদেশ দক্ষিণ এশিয়ার একটি সুন্দর দেশ যেখানে সবুজ...", lang: "bn", text: "বাংলাদেশ দক্ষিণ এশিয়ার একটি সুন্দর দেশ যেখানে সবুজ প্রকৃতি আর নদীর স্রোত মানুষের জীবনকে সমৃদ্ধ করে তোলে প্রতিটি ঋতুতে।" },
  { label: "প্রযুক্তি আমাদের দৈনন্দিন জীবনকে সহজ করে তুলছে...", lang: "bn", text: "প্রযুক্তি আমাদের দৈনন্দিন জীবনকে সহজ করে তুলছে এবং নতুন নতুন সুযোগ তৈরি করছে যা আগে কখনো সম্ভব ছিল না আমাদের সমাজে।" },
  { label: "শিক্ষা হলো সবচেয়ে শক্তিশালী হাতিয়ার যা দিয়ে...", lang: "bn", text: "শিক্ষা হলো সবচেয়ে শক্তিশালী হাতিয়ার যা দিয়ে পৃথিবীকে বদলে ফেলা যায় তাই প্রতিটি মানুষের উচিত জ্ঞান অর্জনের পথে এগিয়ে যাওয়া।" },
  { label: "বাংলা ভাষা আমাদের মায়ের ভাষা এই ভাষার জন্য আমরা...", lang: "bn", text: "বাংলা ভাষা আমাদের মায়ের ভাষা এই ভাষার জন্য আমরা লড়াই করেছি এবং বিশ্বের কাছে প্রমাণ করেছি যে ভাষার মর্যাদা রক্ষা করা আমাদের অধিকার।" },
  { label: "প্রোগ্রামিং শেখা এখন আর কঠিন নয় কারণ ইন্টারনেটে...", lang: "bn", text: "প্রোগ্রামিং শেখা এখন আর কঠিন নয় কারণ ইন্টারনেটে অসংখ্য ফ্রি রিসোর্স পাওয়া যায় যেগুলো ব্যবহার করে যে কেউ সহজেই কোডিং শিখতে পারে।" },
  { label: "স্বপ্ন দেখো এবং সেই স্বপ্নকে বাস্তবে রূপ দিতে...", lang: "bn", text: "স্বপ্ন দেখো এবং সেই স্বপ্নকে বাস্তবে রূপ দিতে প্রতিদিন কঠোর পরিশ্রম করো কারণ সফলতা তাদেরই কাছে আসে যারা হাল ছাড়ে না কখনো।" },
];

const TypingTest = () => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [langFilter, setLangFilter] = useState<"all" | "en" | "bn">("all");
  const [targetText, setTargetText] = useState("");
  const [input, setInput] = useState("");
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(60);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const filteredSamples = SAMPLES.filter((s) => langFilter === "all" || s.lang === langFilter);

  const selectText = (i: number) => {
    const sample = filteredSamples[i];
    setSelectedIndex(i);
    setTargetText(sample.text);
    setInput("");
    setStarted(false);
    setFinished(false);
    setElapsed(0);
    clearInterval(timerRef.current);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const reset = useCallback(() => {
    clearInterval(timerRef.current);
    setInput("");
    setStarted(false);
    setFinished(false);
    setElapsed(0);
    setSelectedIndex(null);
    setTargetText("");
  }, []);

  useEffect(() => () => clearInterval(timerRef.current), []);

  const handleInput = (val: string) => {
    if (finished) return;
    if (!started) {
      setStarted(true);
      setStartTime(Date.now());
      timerRef.current = setInterval(() => {
        const e = (Date.now() - Date.now()) / 1000; // placeholder, fixed below
        setElapsed((prev) => {
          const newE = prev + 1;
          if (newE >= duration) {
            clearInterval(timerRef.current);
            setFinished(true);
          }
          return newE;
        });
      }, 1000);
    }
    setInput(val);
    if (val.length >= targetText.length) {
      clearInterval(timerRef.current);
      setFinished(true);
      setElapsed(Math.round((Date.now() - startTime) / 1000) || 1);
    }
  };

  // Fix timer to use actual startTime
  useEffect(() => {
    if (started && !finished) {
      clearInterval(timerRef.current);
      const st = Date.now();
      timerRef.current = setInterval(() => {
        const e = Math.round((Date.now() - st) / 1000);
        setElapsed(e);
        if (e >= duration) {
          clearInterval(timerRef.current);
          setFinished(true);
        }
      }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, finished, duration]);

  const correctChars = input.split("").filter((c, i) => c === targetText[i]).length;
  const totalTyped = input.length;
  const accuracy = totalTyped > 0 ? Math.round((correctChars / totalTyped) * 100) : 0;
  const minutes = elapsed / 60 || 1 / 60;
  const wpm = Math.round((correctChars / 5) / minutes);
  const timeLeft = Math.max(0, duration - elapsed);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="tool-title">Typing Speed Test</h2>
        <button onClick={reset} className="tool-btn-outline text-xs"><RotateCcw className="w-3 h-3" /> Reset</button>
      </div>

      {/* Text selection */}
      {!targetText ? (
        <div className="space-y-3">
          <div className="flex gap-2 items-center">
            <label className="text-sm text-muted-foreground">Language:</label>
            {([["all", "All"], ["en", "English"], ["bn", "বাংলা"]] as const).map(([val, label]) => (
              <button key={val} onClick={() => setLangFilter(val)}
                className={val === langFilter ? "tool-btn text-xs !px-3 !py-1" : "tool-btn-outline text-xs !px-3 !py-1"}>
                {label}
              </button>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">Select a text to start typing:</p>
          <div className="space-y-1.5">
            {filteredSamples.map((s, i) => (
              <button key={i} onClick={() => selectText(i)}
                className="w-full text-left tool-card !p-3 hover:border-primary/30 hover:-translate-y-0.5 transition-all cursor-pointer">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground mr-2">
                  {s.lang === "en" ? "EN" : "BN"}
                </span>
                <span className="text-sm">{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="flex gap-2 items-center">
            <label className="text-sm text-muted-foreground">Duration:</label>
            {[30, 60, 120].map((d) => (
              <button key={d} onClick={() => { setDuration(d); setInput(""); setStarted(false); setFinished(false); setElapsed(0); clearInterval(timerRef.current); }}
                className={d === duration ? "tool-btn text-xs !px-3 !py-1" : "tool-btn-outline text-xs !px-3 !py-1"}>
                {d}s
              </button>
            ))}
          </div>

          {/* Target text display */}
          <div className="tool-card !p-4 font-mono text-base leading-relaxed select-none">
            {targetText.split("").map((char, i) => {
              let cls = "text-muted-foreground";
              if (i < input.length) {
                cls = input[i] === char ? "text-green-500" : "text-red-500 underline";
              } else if (i === input.length) {
                cls = "bg-primary/20 text-foreground";
              }
              return <span key={i} className={cls}>{char}</span>;
            })}
          </div>

          <textarea ref={inputRef} value={input} onChange={(e) => handleInput(e.target.value)}
            disabled={finished} placeholder={finished ? "Test complete!" : "Start typing here..."}
            className="tool-textarea font-mono min-h-[80px]" autoFocus />

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Time Left", value: `${timeLeft}s` },
              { label: "WPM", value: String(started ? wpm : 0) },
              { label: "Accuracy", value: `${started ? accuracy : 100}%` },
              { label: "Characters", value: `${correctChars}/${totalTyped}` },
            ].map(({ label, value }) => (
              <div key={label} className="tool-card !p-3 text-center">
                <div className="text-xs text-muted-foreground">{label}</div>
                <div className="text-xl font-bold font-mono">{value}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default TypingTest;
