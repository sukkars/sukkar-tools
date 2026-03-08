import { useState } from "react";
import { Package, Layers, Sparkles, HelpCircle, ChevronDown } from "lucide-react";
import ApiKeySetup from "./ApiKeySetup";
import SingleBooking from "./SingleBooking";
import BulkBooking from "./BulkBooking";
import AiBulkBooking from "./AiBulkBooking";


type Tab = "single" | "bulk" | "ai";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "single", label: "Single", icon: Package },
  { id: "bulk", label: "Bulk", icon: Layers },
  { id: "ai", label: "AI Bulk", icon: Sparkles },
];

const SteadfastBooking = () => {
  const [tab, setTab] = useState<Tab>("single");

  return (
    <div className="space-y-4">
      <h2 className="tool-title">Steadfast Booking</h2>
      <p className="tool-description">Steadfast কুরিয়ারে সহজে অর্ডার বুকিং করুন — Single, Bulk ও AI মোডে</p>

      <HowToUse
        steps={[
          "প্রথমে আপনার Steadfast API Key ও Secret Key সেট করুন (নিচের সেটআপ অংশে)।",
          "Single মোডে: কাস্টমারের মেসেজ পেস্ট করুন (নাম, ঠিকানা, ফোন, টাকা) → প্রসেস করুন → বুকিং কনফার্ম।",
          "Bulk মোডে: একাধিক অর্ডার --- দিয়ে আলাদা করে পেস্ট করুন → এক্সট্র্যাক্ট → একসাথে বুকিং।",
          "AI Bulk মোডে: মেসেঞ্জার থেকে কপি করা অগোছালো মেসেজ পেস্ট করুন → AI স্বয়ংক্রিয়ভাবে তথ্য বের করবে।",
          "AI মোডের জন্য Google Gemini API Key প্রয়োজন (ফ্রি - AI Settings থেকে সেট করুন)।",
        ]}
      />

      {/* API Key Setup */}
      <ApiKeySetup />

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/50 p-1 rounded-lg">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                tab === t.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {tab === "single" && <SingleBooking />}
      {tab === "bulk" && <BulkBooking />}
      {tab === "ai" && <AiBulkBooking />}

      <p className="text-xs text-muted-foreground text-center">
        Disclaimer: এটি Steadfast-এর অফিসিয়াল প্রজেক্ট নয়। Powered by sukkarshop.com
      </p>
    </div>
  );
};

export default SteadfastBooking;
