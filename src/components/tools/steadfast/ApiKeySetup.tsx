import { useState, useEffect } from "react";
import { Key, Check, X, Settings, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { LS_KEY, LS_SECRET, hasKeys } from "./utils";

const ApiKeySetup = () => {
  const [expanded, setExpanded] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const c = hasKeys();
    setConnected(c);
    if (!c) setExpanded(true);
  }, []);

  const save = () => {
    if (!apiKey.trim() || !secretKey.trim()) {
      toast.error("API কী ও Secret কী প্রদান করুন।");
      return;
    }
    localStorage.setItem(LS_KEY, apiKey.trim());
    localStorage.setItem(LS_SECRET, secretKey.trim());
    setConnected(true);
    setExpanded(false);
    toast.success("API কী সেভ হয়েছে!");
  };

  const clear = () => {
    localStorage.removeItem(LS_KEY);
    localStorage.removeItem(LS_SECRET);
    setConnected(false);
    setApiKey("");
    setSecretKey("");
    setExpanded(true);
    toast.success("API কী মুছে ফেলা হয়েছে।");
  };

  if (!expanded && connected) {
    return (
      <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20">
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <Check className="w-4 h-4" />
          <span>✅ API কী লোড হয়েছে।</span>
        </div>
        <button onClick={() => setExpanded(true)} className="tool-btn-outline !px-2 !py-1 text-xs">
          <Settings className="w-3 h-3" /> পরিবর্তন
        </button>
      </div>
    );
  }

  return (
    <div className="tool-card !p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Key className="w-4 h-4" /> Steadfast API Key সেটআপ
        </h3>
        {connected && (
          <button onClick={() => setExpanded(false)} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {!connected && (
        <div className="text-sm text-destructive bg-destructive/10 rounded-lg p-2.5 flex items-center gap-2">
          ❌ API কী সেভ করা নেই।
          <a href="https://steadfast.com.bd/user/api" target="_blank" rel="noopener"
            className="underline flex items-center gap-1">সংগ্রহ করুন <ExternalLink className="w-3 h-3" /></a>
        </div>
      )}

      <div className="space-y-2">
        <div>
          <label className="tool-label">API Key</label>
          <input
            value={connected ? "**********" : apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            readOnly={connected}
            placeholder="আপনার API Key"
            className="tool-input"
          />
        </div>
        <div>
          <label className="tool-label">Secret Key</label>
          <input
            value={connected ? "**********" : secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            readOnly={connected}
            placeholder="আপনার Secret Key"
            className="tool-input"
          />
        </div>
        <div className="flex gap-2">
          {!connected && <button onClick={save} className="tool-btn text-xs">সেভ</button>}
          <button onClick={clear} className="tool-btn-outline text-xs">মুছে ফেলুন</button>
        </div>
        <p className="text-xs text-muted-foreground">⚠️ কীগুলি আপনার ব্রাউজারের লোকাল স্টোরেজে সেভ থাকবে।</p>
      </div>
    </div>
  );
};

export default ApiKeySetup;
