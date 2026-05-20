import { useState, useRef, FC, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SHOW_DELAY = 400; // ms before tooltip appears
const HIDE_DELAY = 200;  // ms before tooltip disappears after leaving both

export const WordToken: FC<{ 
  word: string; 
  context?: string; 
  label: string; 
  isProperName?: boolean;
  variant?: 'default' | 'inverted';
}> = ({ word, context, label, isProperName, variant = 'default' }) => {
  const [shouldShow, setShouldShow] = useState(false);
  const [isTokenHovered, setIsTokenHovered] = useState(false);
  const [isTooltipHovered, setIsTooltipHovered] = useState(false);
  const [alignment, setAlignment] = useState<'left' | 'center' | 'right'>('center');
  const [position, setPosition] = useState<'top' | 'bottom'>('top');

  const tokenRef = useRef<HTMLSpanElement>(null);
  const showTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const hoverRectRef = useRef<DOMRect | null>(null);
  // Refs for latest hover states so timeouts read fresh values
  const isTokenHoveredRef = useRef(false);
  const isTooltipHoveredRef = useRef(false);

  const isDefault = variant === 'default';

  // Sync refs with state
  isTokenHoveredRef.current = isTokenHovered;
  isTooltipHoveredRef.current = isTooltipHovered;

  if (!context || isProperName) {
    return <span className={`inline-block px-0.5 ${isDefault ? 'text-slate-400' : 'text-black/60'}`}>{word}</span>;
  }

  const startHideTimer = useCallback(() => {
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (!isTokenHoveredRef.current && !isTooltipHoveredRef.current) {
        setShouldShow(false);
      }
    }, HIDE_DELAY);
  }, []);

  const handleMouseEnter = () => {
    if (tokenRef.current) {
      const rect = tokenRef.current.getBoundingClientRect();
      hoverRectRef.current = rect;
      const screenWidth = window.innerWidth;
      
      // Horizontal alignment
      if (rect.left < 150) {
        setAlignment('left');
      } else if (screenWidth - rect.right < 150) {
        setAlignment('right');
      } else {
        setAlignment('center');
      }

      // Vertical position (flip if too close to top)
      if (rect.top < 250) {
        setPosition('bottom');
      } else {
        setPosition('top');
      }
    }
    setIsTokenHovered(true);
    clearTimeout(hideTimer.current);
    clearTimeout(showTimer.current);
    showTimer.current = setTimeout(() => setShouldShow(true), SHOW_DELAY);
  };

  const handleMouseLeaveSpan = useCallback(() => {
    setIsTokenHovered(false);
    clearTimeout(showTimer.current);
    startHideTimer();
  }, [startHideTimer]);

  const handleMouseEnterTooltip = useCallback(() => {
    setIsTooltipHovered(true);
    clearTimeout(hideTimer.current);
    clearTimeout(showTimer.current);
    setShouldShow(true);
  }, []);

  const handleMouseLeaveTooltip = useCallback(() => {
    setIsTooltipHovered(false);
    startHideTimer();
  }, [startHideTimer]);

  return (
    <span 
      ref={tokenRef}
      className="relative inline-block cursor-help px-0.5 group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeaveSpan}
    >
      <span className={`
        ${isDefault 
          ? 'text-brand-amber border-b border-brand-amber/30 group-hover:bg-brand-amber/10' 
          : 'text-black font-bold border-b border-black/30 group-hover:bg-black/10'} 
        transition-colors
      `}>
        {word}
      </span>
      
      {shouldShow && hoverRectRef.current && createPortal(
        <TooltipPopup
          word={word}
          context={context}
          label={label}
          alignment={alignment}
          position={position}
          rect={hoverRectRef.current}
          onMouseEnter={handleMouseEnterTooltip}
          onMouseLeave={handleMouseLeaveTooltip}
        />,
        document.body
      )}
    </span>
  );
};

// Extracted to a separate component so hooks (useNavigate) work inside portal
const TooltipPopup: FC<{
  word: string;
  context: string;
  label: string;
  alignment: 'left' | 'center' | 'right';
  position: 'top' | 'bottom';
  rect: DOMRect;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}> = ({ word, context, label, alignment, position, rect, onMouseEnter, onMouseLeave }) => {
  const navigate = useNavigate();

  const tooltipGap = 12; // matches mb-3/mt-3
  const arrowSize = 12;  // w-3 h-3

  // Tooltip dimensions
  const screenSm = 640;
  const tooltipWidth = window.innerWidth >= screenSm ? 256 : Math.floor(window.innerWidth * 0.8);

  // Calculate tooltip position
  // When above (position='top'): tooltip expands UPWARD from the arrow edge (uses `bottom`)
  // When below (position='bottom'): tooltip expands DOWNWARD from the arrow edge (uses `top`)
  const tooltipStyle: React.CSSProperties & Record<string, string | number> = {
    position: 'fixed',
    zIndex: 9999,
    width: tooltipWidth,
  };

  if (position === 'top') {
    // Tooltip faces the word from above — bottom edge at rect.top - gap
    tooltipStyle.bottom = window.innerHeight - rect.top + tooltipGap;
  } else {
    // Tooltip faces the word from below — top edge at rect.bottom + gap
    tooltipStyle.top = rect.bottom + tooltipGap;
  }

  let tooltipLeft: number;
  if (alignment === 'left') {
    tooltipLeft = rect.left;
  } else if (alignment === 'right') {
    tooltipLeft = rect.right - tooltipWidth;
  } else {
    tooltipLeft = rect.left + rect.width / 2 - tooltipWidth / 2;
  }

  // Clamp to viewport
  tooltipLeft = Math.max(8, Math.min(tooltipLeft, window.innerWidth - tooltipWidth - 8));
  tooltipStyle.left = tooltipLeft;

  // Arrow center always tracks word center, clamped within tooltip bounds
  const arrowCenterX = rect.left + rect.width / 2;
  const arrowLeft = Math.max(4, Math.min(
    arrowCenterX - tooltipLeft - arrowSize / 2,
    tooltipWidth - arrowSize - 4
  ));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={tooltipStyle as React.CSSProperties}
      className="p-4 bg-[#111112] border border-brand-amber/40 rounded-xl shadow-2xl pointer-events-auto"
    >
      {/* Arrow — always at the word-facing edge of the tooltip */}
      <div
        style={{
          position: 'absolute',
          width: arrowSize,
          height: arrowSize,
          backgroundColor: '#111112',
          transform: 'rotate(45deg)',
          left: arrowLeft,
          ...(position === 'top'
            ? {
                bottom: -arrowSize / 2,
                borderRight: '1px solid rgba(245, 158, 11, 0.4)',
                borderBottom: '1px solid rgba(245, 158, 11, 0.4)',
              }
            : {
                top: -arrowSize / 2,
                borderLeft: '1px solid rgba(245, 158, 11, 0.4)',
                borderTop: '1px solid rgba(245, 158, 11, 0.4)',
              }),
        }}
      />

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
  );
};
