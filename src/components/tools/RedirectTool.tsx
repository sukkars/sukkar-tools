import { useEffect } from "react";
import { ExternalLink } from "lucide-react";

interface RedirectToolProps {
  url: string;
  title: string;
}

const RedirectTool = ({ url, title }: RedirectToolProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.open(url, "_blank", "noopener,noreferrer");
    }, 1500);
    return () => clearTimeout(timer);
  }, [url]);

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 animate-pulse">
        <ExternalLink className="w-8 h-8 text-primary" />
      </div>
      <h1 className="text-2xl font-bold mb-2">Redirecting to {title}...</h1>
      <p className="text-muted-foreground mb-8">
        We're taking you to the external tool. If it doesn't open automatically, click the button below.
      </p>
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="tool-btn inline-flex items-center gap-2"
      >
        <ExternalLink className="w-4 h-4" />
        Open {title}
      </a>
    </div>
  );
};

export default RedirectTool;
