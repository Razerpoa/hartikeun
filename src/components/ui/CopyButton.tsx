import { useState, FC } from 'react';
import { Check, Copy } from 'lucide-react';

export const CopyButton: FC<{ text: string; label: string }> = ({ text, label }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      onClick={handleCopy}
      className={`text-[10px] uppercase px-4 py-1.5 rounded transition-all border flex items-center gap-2 ${
        copied 
          ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' 
          : 'bg-white/5 border-white/5 hover:bg-white/10 text-slate-400 hover:text-white'
      }`}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? 'Copied' : label}
    </button>
  );
};
