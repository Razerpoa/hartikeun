import { useState, useRef, FC } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const WordToken: FC<{ 
  word: string; 
  context?: string; 
  label: string; 
  isProperName?: boolean;
  variant?: 'default' | 'inverted';
}> = ({ word, context, label, isProperName, variant = 'default' }) => {
  const [isHovered, setIsHovered] = useState(false);
  const tokenRef = useRef<HTMLSpanElement>(null);
  const [alignment, setAlignment] = useState<'left' | 'center' | 'right'>('center');
  const navigate = useNavigate();
  
  const isDefault = variant === 'default';

  if (!context || isProperName) {
    return <span className={`inline-block px-0.5 ${isDefault ? 'text-slate-400' : 'text-black/60'}`}>{word}</span>;
  }

  const handleMouseEnter = () => {
    if (tokenRef.current) {
      const rect = tokenRef.current.getBoundingClientRect();
      const screenWidth = window.innerWidth;
      
      if (rect.left < 150) {
        setAlignment('left');
      } else if (screenWidth - rect.right < 150) {
        setAlignment('right');
      } else {
        setAlignment('center');
      }
    }
    setIsHovered(true);
  };

  const alignmentClasses = {
    left: 'left-0 translate-x-0',
    center: 'left-1/2 -translate-x-1/2',
    right: 'right-0 translate-x-0'
  };

  const arrowClasses = {
    left: 'left-4 translate-x-0',
    center: 'left-1/2 -translate-x-1/2',
    right: 'right-4 translate-x-0'
  };

  return (
    <span 
      ref={tokenRef}
      className="relative inline-block cursor-help px-0.5 group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className={`
        ${isDefault 
          ? 'text-brand-amber border-b border-brand-amber/30 group-hover:bg-brand-amber/10' 
          : 'text-black font-bold border-b border-black/30 group-hover:bg-black/10'} 
        transition-colors
      `}>
        {word}
      </span>
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`absolute bottom-full mb-3 w-[80vw] sm:w-64 p-4 bg-[#111112] border border-brand-amber/40 rounded-xl shadow-2xl z-50 pointer-events-auto ${alignmentClasses[alignment]}`}
          >
            <div className={`absolute bottom-[-6px] w-3 h-3 bg-[#111112] border-b border-r border-brand-amber/40 rotate-45 ${arrowClasses[alignment]}`} />
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-amber animate-pulse" />
              <div className="text-[9px] uppercase font-bold text-brand-amber font-mono tracking-widest">
                {label}
              </div>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-sans font-normal italic mb-3">
              {context}
            </p>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").toLowerCase();
                const params = new URLSearchParams();
                if (context) params.set('context', context);
                navigate(`/word/${cleanWord}${params.toString() ? '?' + params.toString() : ''}`);
              }}
              className="w-full flex items-center justify-between px-3 py-2 bg-brand-amber/10 border border-brand-amber/20 hover:bg-brand-amber hover:text-black transition-all group/btn"
            >
              <span className="text-[9px] uppercase font-bold tracking-widest">Deep Dive</span>
              <ArrowRight size={12} className="group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
};
