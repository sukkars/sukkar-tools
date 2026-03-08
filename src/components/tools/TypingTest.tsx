import { useState, useRef, useEffect, useCallback } from "react";
import { RotateCcw } from "lucide-react";

interface SampleText {
  label: string;
  lang: "en" | "bn";
  text: string;
}

const SAMPLES: SampleText[] = [
  // English — longer children's stories / passages
  {
    label: "The Tortoise and the Hare",
    lang: "en",
    text: "Once upon a time there was a hare who was very proud of how fast he could run. He would laugh at the tortoise for being so slow. One day the tortoise challenged the hare to a race. The hare thought it was a joke but agreed. When the race began the hare sprinted ahead and soon was far in front. Feeling confident he decided to take a nap under a tree. Meanwhile the tortoise kept walking slowly but steadily without stopping. When the hare woke up he saw the tortoise was almost at the finish line. He ran as fast as he could but it was too late. The tortoise crossed the finish line first and won the race. The moral of the story is that slow and steady wins the race."
  },
  {
    label: "The Boy Who Cried Wolf",
    lang: "en",
    text: "There was once a shepherd boy who watched over the village sheep on a hill near a dark forest. He was bored sitting there all day so he decided to play a trick. He ran down to the village shouting wolf wolf a wolf is chasing the sheep. The villagers came running up the hill to help but when they arrived they found no wolf. The boy laughed at the sight of their angry faces. A few days later the boy played the same trick again and once more the villagers rushed up the hill only to find no wolf. Then one evening a real wolf did come out of the forest and began attacking the sheep. The boy ran toward the village crying wolf wolf please help. But the villagers thought he was tricking them again so nobody came. The wolf ate many sheep that night. The boy learned that nobody believes a liar even when he tells the truth."
  },
  {
    label: "The Ant and the Grasshopper",
    lang: "en",
    text: "In a field on a warm summer day a grasshopper was hopping about chirping and singing to its heart's content. An ant passed by carrying a large grain of corn to its nest. Why not come and chat with me said the grasshopper instead of working so hard. I am helping to store food for the winter said the ant and I suggest you do the same. Why bother about winter said the grasshopper we have plenty of food right now. The ant went on its way and continued to work hard. When winter came the grasshopper had no food and was very hungry. He went to the ant's house and asked for something to eat. The ant said what were you doing all summer while I was working. I was busy singing said the grasshopper. Well then said the ant you can dance all winter now. The grasshopper learned that it is best to prepare for the days ahead."
  },
  {
    label: "The Lion and the Mouse",
    lang: "en",
    text: "A lion was sleeping peacefully in the forest when a little mouse accidentally ran across his nose. The mighty lion woke up and caught the tiny mouse in his huge paw. Please let me go said the mouse and someday I will surely repay you. The lion laughed at the idea of a mouse being able to help him but he let the mouse go anyway. Some days later the lion was caught in a hunter's net. He roared and struggled but could not free himself. The little mouse heard the lion's roars and came running. She began to gnaw at the ropes of the net with her sharp teeth. Before long she had made a hole large enough for the lion to escape. You laughed when I said I would repay you said the mouse. Now you see that even a small friend can be a great help. The lion thanked the mouse and they became the best of friends from that day forward."
  },
  {
    label: "Jack and the Beanstalk (excerpt)",
    lang: "en",
    text: "Jack was a young boy who lived with his mother in a small cottage. They were very poor and had nothing left to sell except their old cow. Jack's mother sent him to the market to sell the cow. On the way Jack met a strange old man who offered him five magic beans in exchange for the cow. Jack took the beans and went home. His mother was furious and threw the beans out the window. The next morning Jack woke up to find an enormous beanstalk growing up through the clouds. He climbed and climbed until he reached a land high above the earth. There he found a giant's castle filled with gold coins a hen that laid golden eggs and a magical harp that played beautiful music all by itself. Jack took the treasures and climbed back down the beanstalk as fast as he could. When the giant followed him down Jack chopped the beanstalk with an axe and the giant tumbled to the ground. Jack and his mother lived happily ever after and never went hungry again."
  },
  // Bangla — longer rhymes & passages
  {
    label: "আমাদের ছোট নদী — রবীন্দ্রনাথ ঠাকুর",
    lang: "bn",
    text: "আমাদের ছোট নদী চলে বাঁকে বাঁকে বৈশাখ মাসে তার হাঁটু জল থাকে। পার হয়ে যায় গরু চরে যায় ছাগল ধারে ধারে কাশবন ফুলে ফুলে হয় সকাল বিকাল। বর্ষা এলে নদী ভরে উঠে দুই কূল পানিতে ডুবে যায় তীরের সব ফুল। কোথা নেই চর কোথা নেই কূল ভরা স্রোতে ছুটে চলে নদী হয়ে যায় অতুল। নদীর কিনারে বসে মাঝি গান গায় সোনা রোদে জলে ঝিলিমিলি খেলে যায়। ছোট ছোট ছেলেমেয়ে নদীতে নামিয়া জলকেলি করে তারা আনন্দে মাতিয়া।"
  },
  {
    label: "বৃষ্টি পড়ে টাপুর টুপুর — শিশুপাঠ",
    lang: "bn",
    text: "বৃষ্টি পড়ে টাপুর টুপুর নদেয় এলো বান শিউলি তলায় ভোরবেলায় ঝরে ফুল কতোখান। মেঘ করে এলো গগনেতে কালো আকাশে বিজলি চমকায় বাতাসে হাওয়া দোলে পাতায় পাতায় বৃষ্টির ফোঁটা ঝরে পড়ে সারাটা দুপুরবেলায়। ব্যাঙ ডাকে ঘ্যাঙর ঘ্যাঙ মাঠে জল জমে যায় কাদা মাটি পিচ্ছিল পথে হেঁটে যায় যারা তায়। বৃষ্টি থামলে রোদ ওঠে আবার হাসে ফুল পাখি গায় গান ডালে ডালে মিষ্টি সুরে অতুল। ইন্দ্রধনু রঙে রঙে সাজায় আকাশটায় ছোট ছোট ছেলেমেয়ে দৌড়ে যায় মাঠের মাঝে গায়।"
  },
  {
    label: "খোকা যায় স্কুলেতে — বাংলা ছড়া",
    lang: "bn",
    text: "সকাল বেলা ঘুম ভেঙেছে খোকা চোখ কচলায় মা ডেকে বলে ওঠ খোকা স্কুলে যাবার সময় হলো আবার। দাঁত মেজে মুখ ধুয়ে জামা পরে তৈরি হলো ব্যাগ কাঁধে জুতো পায়ে বইয়ের বোঝা বহন করলো। রাস্তায় দেখে বন্ধু সবাই হাসি মুখে চলে একসাথে হেঁটে যায় সবাই ইস্কুলের পথে ভোলে সব খেলা। ক্লাসে বসে পড়া শোনে স্যারের কথা মানে অঙ্ক করে বাংলা পড়ে ইংরেজি গান গায় প্রাণে। টিফিনে খায় রুটি ডিম খেলে মাঠে দৌড়ায় স্কুল শেষে বাড়ি ফেরে মায়ের কোলে গিয়ে জুড়ায়। পড়াশোনা খেলাধুলা দুটোই সমান চলে প্রতিদিন এইভাবে খোকার স্কুলের পালে।"
  },
  {
    label: "হাট্টিমাটিম — নির্মলেন্দু গুণ স্টাইল",
    lang: "bn",
    text: "হাট্টিমাটিম টিম তারা মাঠে পাড়ে ডিম তাদের খাড়া দুটো শিং তাদের মাথায় নেই চুল এক পায়ে হেঁটে চলে যমুনার এক কূল। নদীর ওপারে আছে গ্রাম সবুজ ধানের মাঠ আম জাম কাঁঠাল লিচু ফলে ভরা বাগানের হাট। সকালে কুয়াশা ভেজা ঘাস শিশির বিন্দু ঝরে পাখি গায় ভোরের গান বাতাস বইছে ধীরে। মাঠের আলে বসে আছে রাখাল ছেলে দুটি বাঁশি বাজায় সুরে সুরে গরু চরে নদীর কূলে। সন্ধ্যা নামে গ্রামে আবার জোনাকি আলো জ্বলে ঝিঁঝি পোকা ডাকে রাতে তারায় ভরা আকাশটা দোলে। এই তো বাংলার রূপ এই তো আমার দেশ সবুজ শ্যামল সোনার বাংলা সুখে দুখে একাকার বেশ।"
  },
  {
    label: "রবীন্দ্রনাথের কবিতা — মনে পড়া",
    lang: "bn",
    text: "মনে পড়া সেই দিনগুলোর কথা যখন ছিলাম ছোট মাঠে মাঠে খেলে বেড়াতাম সারাদিন ধরে পায়ে কাদা মাখা শরীরে ঘামের গন্ধ নিয়ে বাড়ি ফিরে আসতাম সন্ধ্যায়। মা বকতেন রাগ করে বাবা হাসতেন চুপে চুপে দিদি বলতো আয় খেতে বস ভাত বেড়ে দিয়েছি তোর পাতে। সেই সব দিন আর ফিরে আসে না কিন্তু মনের গহীনে সেই স্মৃতি রয়ে গেছে চিরকাল। ছোটবেলার সেই মিষ্টি দিনগুলো ভুলবো না কোনোদিন সেই নদীর তীরে বসে দেখা সূর্যাস্তের রঙ সেই গাছের ছায়ায় বসে পড়া বই সেই বন্ধুদের সাথে হাসি ঠাট্টা সব মিলিয়ে এক অপূর্ব জীবন ছিলো সেই ছোটবেলায়।"
  },
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
    }
    setInput(val);
    if (val.length >= targetText.length) {
      clearInterval(timerRef.current);
      setFinished(true);
      setElapsed(Math.round((Date.now() - startTime) / 1000) || 1);
    }
  };

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
            {[60, 120, 300].map((d) => (
              <button key={d} onClick={() => { setDuration(d); setInput(""); setStarted(false); setFinished(false); setElapsed(0); clearInterval(timerRef.current); }}
                className={d === duration ? "tool-btn text-xs !px-3 !py-1" : "tool-btn-outline text-xs !px-3 !py-1"}>
                {d >= 60 ? `${d / 60}m` : `${d}s`}
              </button>
            ))}
          </div>

          <div className="tool-card !p-4 font-mono text-base leading-relaxed select-none max-h-[250px] overflow-y-auto">
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
