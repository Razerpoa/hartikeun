import { useState, FC } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { WordToken } from './WordToken';

export const ChatMessageBubble: FC<{ 
  message: any; 
  tokenContextLabel: string;
}> = ({ message, tokenContextLabel }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`flex flex-col mb-4 w-full ${message.sender_type === 'self' ? 'items-end' : 'items-start'}`}>
      <div 
        onClick={() => setExpanded(!expanded)}
        className={`max-w-[85%] p-4 rounded-3xl cursor-pointer transition-all shadow-xl group/bubble ${
          message.sender_type === 'self' 
            ? 'bg-brand-amber text-black rounded-tr-none' 
            : 'bg-surface-elevated border border-white/10 text-slate-200 rounded-tl-none'
        } ${expanded ? 'scale-[1.02] ring-2 ring-brand-amber/30' : 'hover:scale-[1.01]'}`}
      >
        <div className="flex items-center gap-2 mb-2 opacity-40 group-hover/bubble:opacity-100 transition-opacity">
          <div className={`w-1.5 h-1.5 rounded-full ${message.sender_type === 'self' ? 'bg-black' : 'bg-brand-amber'}`} />
          <span className={`text-[8px] uppercase font-black tracking-widest ${message.sender_type === 'self' ? 'text-black' : 'text-slate-500'}`}>
            {message.sender_type === 'self' ? 'You' : 'Friend'}
          </span>
        </div>
        <div className="text-sm leading-relaxed whitespace-pre-wrap font-medium">
          {message.original_text.split(/(\s+)/).map((part: string, i: number) => {
            if (/\s+/.test(part)) return part;
            const word = part;
            const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").toLowerCase();
            const match = message.vocabulary_breakdown.find((v: any) => 
              v.original_word.toLowerCase() === cleanWord || 
              word.toLowerCase().includes(v.original_word.toLowerCase())
            );
            return (
              <WordToken 
                key={i} 
                word={word} 
                context={match?.meaning_and_context} 
                label={tokenContextLabel}
                isProperName={match?.is_proper_name}
                variant={message.sender_type === 'self' ? 'inverted' : 'default'}
              />
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            className={`mt-2 w-full max-w-[90%] z-20 ${message.sender_type === 'self' ? 'flex justify-end' : 'flex justify-start'}`}
          >
            <div className="p-4 bg-[#141416] border border-white/5 rounded-2xl space-y-4 shadow-2xl w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <h4 className={`text-[8px] uppercase font-black text-slate-500 tracking-widest mb-2 flex items-center gap-2`}>
                    <div className="w-1 h-1 bg-emerald-500 rounded-full" />
                    Formal Translation
                  </h4>
                  <p className="text-xs text-white italic leading-relaxed">{message.translations.formal_indonesian}</p>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <h4 className="text-[8px] uppercase font-black text-slate-500 tracking-widest mb-2 flex items-center gap-2">
                    <div className="w-1 h-1 bg-blue-500 rounded-full" />
                    Clear English
                  </h4>
                  <p className="text-xs text-white italic leading-relaxed">{message.translations.professional_english}</p>
                </div>
              </div>

              {message.vocabulary_breakdown.filter((v: any) => !v.is_proper_name).length > 0 && (
                <div className="pt-2 border-t border-white/5">
                  <h4 className="text-[8px] uppercase font-black text-brand-amber/60 tracking-widest mb-3">Vocabulary Breakdown</h4>
                  <div className="flex flex-wrap gap-2">
                    {message.vocabulary_breakdown.filter((v: any) => !v.is_proper_name).map((v: any, idx: number) => (
                      <div key={idx} className="px-3 py-1.5 bg-brand-amber/10 border border-brand-amber/20 rounded-lg text-[10px] text-brand-amber flex items-center gap-2">
                        <span className="font-bold underline decoration-brand-amber/30">{v.original_word}</span>
                        <ArrowRight size={8} />
                        <span className="italic opacity-80">{v.meaning_and_context}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
