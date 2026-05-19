import { useState, useRef, ChangeEvent, FC, useEffect, ClipboardEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Languages, 
  Sparkles, 
  AlertCircle, 
  Check, 
  Copy,
  Zap,
  Loader2,
  ArrowRight,
  Image as ImageIcon,
  Camera,
  X,
  FileImage
} from 'lucide-react';
import { TransformationResult } from '../types.ts';
import { useNavigate } from 'react-router-dom';

const CopyButton = ({ text, label }: { text: string; label: string }) => {
// ... existing CopyButton ...
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

const WordToken: FC<{ 
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

const ChatMessageBubble: FC<{ 
  message: any; 
  uiLang: 'id' | 'en';
  tokenContextLabel: string;
}> = ({ message, uiLang, tokenContextLabel }) => {
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

export const Translator: FC<{
  uiLang: 'id' | 'en'; 
  setUiLang: (lang: 'id' | 'en') => void;
  input: string;
  setInput: (val: string) => void;
  result: TransformationResult | null;
  setResult: (res: TransformationResult | null) => void;
  toneLevel: number;
  setToneLevel: (level: number) => void;
}> = ({ 
  uiLang, 
  setUiLang,
  input,
  setInput,
  result,
  setResult,
  toneLevel,
  setToneLevel
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setError(uiLang === 'id' ? 'Gambar terlalu besar (maks 10MB)' : 'Image too large (max 10MB)');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePaste = (e: ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          processFile(file);
          // Prevent pasting the image as text if supported
          e.preventDefault();
        }
      }
    }
  };

  const clearImage = () => {
    setImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleTransform = async (currentLevel = toneLevel) => {
    if (!input.trim() && !image) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/transform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: input, 
          tone: currentLevel, 
          lang: uiLang,
          image: image // base64 string
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Transformation failed');
      }
      
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const ui = {
    en: {
      tagline: "Native Tongue? // No Problem!",
      sidebar1: "Daily Bridge",
      // sidebar2: "Cultural Insight",
      inputLabel: "Your Local Input",
      inputTitle: "What's the Meaning?",
      inputPlaceholder: "Enter slang, local greetings, or dialect here...",
      charCount: "characters",
      transformBtn: "Translate Meaning",
      processing: "Analyzing Dialect...",
      politeLabel: "Balanced & Polite",
      assertiveLabel: "Precise & Clear",
      casualLabel: "Casual & Friendly",
      dailyLabel: "Everyday Indonesian",
      awaiting: "Awaiting Your Input",
      awaitingDesc: "Type in any regional slang or dialect to see its universal translation and cultural meaning.",
      contextLabel: "Situation",
      toneLabelOutput: "Vibe",
      copy: "Copy",
      tryExample: "Try this:",
      riskTitle: "Word Meanings",
      footerEngine: "Hartikeun v5.1.0",
      footerPrivacy: "Privacy",
      footerEnterprise: "Developers",
      tokenContextLabel: "Context & Meaning",
      imageBtn: "Add Image",
      imageDesc: "Upload or take a screenshot",
      removeBtn: "Remove"
    },
    id: {
      tagline: "Bahasa Daerah? // Bukan lagi masalah!",
      sidebar1: "Terjemahkan",
      // sidebar2: "Wawasan Budaya",
      inputLabel: "Masukin Bahasa Lokal Kamu",
      inputTitle: "Translate ke bahasa biasa",
      inputPlaceholder: "Kalimat bahasa daerah atau paste screenshot...",
      charCount: "karakter",
      transformBtn: "Artinya",
      processing: "Menganalisis Dialek...",
      politeLabel: "Seimbang & Sopan",
      assertiveLabel: "Tepat & Jelas",
      casualLabel: "Santai & Akrab",
      dailyLabel: "Bahasa Sehari-hari",
      awaiting: "Nungguin input kamu",
      awaitingDesc: "Ketik slang atau dialek daerah untuk melihat terjemahan universal dan makna setiap katanya.",
      contextLabel: "Situasi",
      toneLabelOutput: "Vibe",
      copy: "Salin",
      tryExample: "Coba ini:",
      riskTitle: "Makna Kata",
      footerEngine: "Hartikeun v5.1.0",
      footerPrivacy: "Privasi",
      footerEnterprise: "Pengembang",
      tokenContextLabel: "Konteks & Makna",
      imageBtn: "Tambah Gambar",
      imageDesc: "Unggah atau ambil tangkapan layar",
      removeBtn: "Hapus"
    }
  };

  const currentUi = ui[uiLang];
  const isActive = !!(loading || result);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col min-h-screen lg:h-screen w-full bg-surface-base text-slate-200 font-sans"
    >
      {/* Header */}
      <header className="px-6 sm:px-8 py-4 bg-surface-base/50 backdrop-blur-sm shrink-0">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate('/')}
          >
            <div className="w-10 h-10 bg-brand-amber/20 border border-brand-amber/50 flex items-center justify-center shrink-0 group-hover:bg-brand-amber/30 transition-colors">
              <span className="text-brand-amber font-serif font-bold text-xl">H</span>
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-serif font-semibold tracking-wide text-white uppercase">Hartikeun // ID</h1>
              <p className="text-[9px] sm:text-[10px] text-brand-amber/70 tracking-[0.2em] uppercase font-bold">{currentUi.tagline}</p>
            </div>
          </div>
          <div className="flex gap-4 sm:gap-8 text-[10px] sm:text-[11px] uppercase tracking-widest font-medium items-center">
            <div className="flex items-center gap-2 px-2 py-1 bg-white/5 rounded border border-white/10">
              <button 
                onClick={() => setUiLang('en')} 
                className={`px-2 py-0.5 rounded transition-colors ${uiLang === 'en' ? 'bg-brand-amber text-black' : 'text-slate-500 hover:text-slate-300'}`}
              >
                EN
              </button>
              <button 
                onClick={() => setUiLang('id')} 
                className={`px-2 py-0.5 rounded transition-colors ${uiLang === 'id' ? 'bg-brand-amber text-black' : 'text-slate-500 hover:text-slate-300'}`}
              >
                ID
              </button>
            </div>
            <span className="text-white border-b border-brand-amber pb-1 cursor-default">{currentUi.sidebar1}</span>
          </div>
        </div>
      </header>

      {/* Main Workspace with Floating UI layout */}
      <div className={`flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 transition-all duration-500 ${!isActive ? 'flex items-center justify-center' : ''}`}>
        <main className={`w-full mx-auto grid grid-cols-12 gap-0 bg-surface-subtle sm:rounded-3xl border border-white/5 shadow-2xl relative transition-all duration-700 ${isActive ? 'max-w-5xl h-full lg:h-[calc(100vh-200px)] overflow-hidden lg:overflow-hidden' : 'max-w-2xl h-auto rounded-[2rem]'}`}>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
          
          {/* Left Pane: Input */}
          <section className={`col-span-12 transition-all duration-700 ease-[0.16,1,0.3,1] p-8 sm:p-12 flex flex-col bg-surface-base/40 backdrop-blur-md relative z-10 ${isActive ? 'lg:col-span-5 border-b lg:border-b-0 lg:border-r border-white/5 overflow-y-auto' : ''}`}>
          <div className={`mb-6 flex justify-between items-end ${!isActive ? 'text-center' : ''}`}>
            <div className="flex-1">
              <label className="text-[9px] sm:text-[10px] text-brand-amber/80 uppercase tracking-widest font-bold block mb-2 underline decoration-brand-amber/30 underline-offset-4">{currentUi.inputLabel}</label>
              <h2 className="text-xl sm:text-2xl font-serif text-white italic">{currentUi.inputTitle}</h2>
            </div>
          </div>

          <div className={`relative flex flex-col group ${isActive ? 'flex-1 min-h-[300px] lg:min-h-0' : 'h-64 sm:h-80'}`}>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageUpload} 
            />

            <AnimatePresence mode="wait">
              {image && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="mb-6 relative group/img"
                >
                  <img 
                    src={image} 
                    alt="Uploaded snippet" 
                    className="w-full max-h-64 object-cover rounded-xl border border-brand-amber/30" 
                  />
                  <button
                    onClick={clearImage}
                    className="absolute top-2 right-2 p-2 bg-black/60 text-white rounded-full hover:bg-red-500 transition-colors border border-white/10"
                  >
                    <X size={16} />
                  </button>
                  <div className="absolute inset-0 bg-brand-amber/5 pointer-events-none rounded-xl" />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-4 mb-6">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-3 p-4 bg-surface-elevated border border-white/5 rounded-xl hover:border-brand-amber/30 transition-all text-slate-400 hover:text-white"
              >
                <ImageIcon size={18} className="text-brand-amber" />
                <div className="text-left">
                  <div className="text-[10px] font-bold uppercase tracking-widest">{(currentUi as any).imageBtn}</div>
                  <div className="text-[8px] text-slate-500">{(currentUi as any).imageDesc}</div>
                </div>
              </button>
            </div>

            <AnimatePresence mode="wait">
              {result && !isFocused ? (
                <motion.div 
                  key="overlay"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="flex-1 flex flex-col"
                >
                    <div 
                      onClick={() => setIsFocused(true)}
                      className="flex-1 p-6 bg-surface-elevated border border-brand-amber/30 rounded-xl leading-loose text-base sm:text-lg relative cursor-text hover:border-brand-amber/50 transition-colors whitespace-pre-wrap"
                    >
                      <div className="absolute top-2 right-2 flex items-center gap-2">
                         <span className="text-[8px] uppercase font-bold text-brand-amber/40 font-mono tracking-widest">Click to Edit</span>
                         <Zap size={10} className="text-brand-amber/40 animate-pulse" />
                      </div>
                      {input.split(/(\s+)/).map((part, i) => {
                        if (/\s+/.test(part)) {
                          return part;
                        }
                        const word = part;
                        const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").toLowerCase();
                        const match = result.vocabulary_breakdown.find(v => 
                          v.original_word.toLowerCase() === cleanWord || 
                          word.toLowerCase().includes(v.original_word.toLowerCase())
                        );
                        
                        return (
                          <WordToken 
                            key={i} 
                            word={word} 
                            context={match?.meaning_and_context} 
                            label={currentUi.tokenContextLabel}
                            isProperName={match?.is_proper_name}
                          />
                        );
                      })}
                    </div>

                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-6 p-4 sm:p-6 bg-surface-elevated border border-white/5 rounded-xl"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <h4 className="text-[10px] uppercase tracking-widest font-bold text-brand-amber underline underline-offset-8 decoration-brand-amber/30">
                        Meaning Guide
                      </h4>
                      <div className="h-px flex-1 bg-white/5"></div>
                    </div>

                    <div className="flex gap-4 mb-6 border-b border-white/5 pb-4">
                      <div className="flex-1">
                        <span className="text-[9px] uppercase font-bold text-slate-500 block mb-1">{(currentUi as any).contextLabel}</span>
                        <p className="text-xs text-white italic">"{result.analysis.context}"</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3">
                      {result.vocabulary_breakdown.filter(item => !item.is_proper_name).map((item, i) => (
                        <div key={i} className="p-4 bg-surface-base border border-white/5 rounded-xl hover:border-brand-amber/30 transition-all group flex gap-4">
                          <div className="w-8 h-8 rounded bg-brand-amber/10 border border-brand-amber/20 flex items-center justify-center shrink-0 text-brand-amber font-mono text-xs font-bold">
                            {i + 1}
                          </div>
                          <div>
                            <span className="text-brand-amber font-mono text-[11px] block mb-1 uppercase tracking-wider font-bold">{item.original_word}</span>
                            <p className="text-[11px] text-slate-300 leading-relaxed font-sans italic">
                              {item.meaning_and_context}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div 
                  key="editor"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col relative"
                >
                  <motion.textarea
                    ref={textareaRef}
                    spellCheck={false}
                    autoFocus={isFocused}
                    value={input}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => {
                        // Tiny delay to allow state to settle before hiding
                        setTimeout(() => setIsFocused(false), 200);
                    }}
                    onPaste={handlePaste}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={currentUi.inputPlaceholder}
                    animate={!input && !loading && !isFocused ? { 
                      boxShadow: [
                        "0 0 0 0px rgba(212, 175, 55, 0)",
                        "0 0 15px 2px rgba(212, 175, 55, 0.1)",
                        "0 0 0 0px rgba(212, 175, 55, 0)"
                      ],
                      borderColor: [
                        "rgba(255, 255, 255, 0.1)",
                        "rgba(212, 175, 55, 0.3)",
                        "rgba(255, 255, 255, 0.1)"
                      ]
                    } : {}}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                    className="w-full flex-1 bg-surface-elevated border border-white/10 rounded-xl p-6 text-base sm:text-lg text-slate-300 placeholder:text-white/10 focus:outline-none focus:border-brand-amber/50 resize-none leading-relaxed transition-all font-sans"
                  />
                  
                  {input.length > 0 && (
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <span className="text-[10px] px-2 py-1 bg-black/60 text-slate-500 rounded border border-white/5 uppercase font-mono">{input.length} {currentUi.charCount}</span>
                    </div>
                  )}

                  {result && (
                    <div className="mt-6 flex items-center gap-2 text-brand-amber/40">
                       <Check size={12} />
                       <span className="text-[9px] uppercase tracking-widest font-bold">Analysis Locked // Tap off to view diagnostic</span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            
            <button
              onClick={() => handleTransform()}
              disabled={loading || (!input.trim() && !image)}
              className="mt-6 w-full py-4 bg-brand-amber text-black font-bold uppercase tracking-widest text-[10px] sm:text-xs hover:bg-white transition-all active:scale-[0.98] disabled:opacity-30 disabled:scale-100 flex items-center justify-center gap-3 shrink-0"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {currentUi.processing}
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  {currentUi.transformBtn}
                </>
              )}
            </button>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-red-500/5 border-l-2 border-red-500 flex items-start gap-3 text-red-400 text-xs italic"
            >
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </motion.div>
          )}
        </section>

          {isActive && (
            <section className="col-span-12 lg:col-span-7 flex flex-col bg-surface-base/20 border-l border-white/5 overflow-y-auto min-h-[400px] lg:min-h-0 relative z-10">
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col h-full space-y-px"
                  >
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="p-6 sm:p-8 border-b border-white/5 bg-surface-subtle/20 animate-pulse">
                        <div className="h-3 w-32 bg-white/10 rounded mb-6"></div>
                        <div className="space-y-3">
                          <div className="h-6 w-full bg-white/5 rounded"></div>
                          <div className="h-6 w-4/5 bg-white/5 rounded"></div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                ) : result ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col h-full"
                  >
                    {result.is_gibberish ? (
                      <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-surface-base">
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="max-w-md"
                        >
                          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <X size={32} className="text-red-500" />
                          </div>
                          <h3 className="text-xl font-serif italic text-white mb-2">
                            {uiLang === 'id' ? 'Waduh, ini bahasa apa ya?' : 'Wait, what language is this?'}
                          </h3>
                          <p className="text-sm text-slate-400 leading-relaxed">
                            {result.error_message || (uiLang === 'id' ? 'Input kamu kayaknya kurang jelas atau cuma ketikan asal. Coba masukin kalimat yang bener ya!' : 'Your input seems unclear or just random typing. Try entering a real sentence!')}
                          </p>
                          <button 
                            onClick={() => {
                              setResult(null);
                              setInput('');
                            }}
                            className="mt-8 px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] uppercase font-black tracking-widest text-slate-400 hover:text-white transition-all"
                          >
                            Try Again
                          </button>
                        </motion.div>
                      </div>
                    ) : result.is_chat && result.messages ? (
                        <div className="flex-1 flex flex-col p-4 sm:p-8 bg-[#0a0a0b] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
                          <div className="mb-6 flex justify-between items-center border-b border-white/5 pb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-brand-amber/20 border border-brand-amber/50 flex items-center justify-center shrink-0">
                                 <Sparkles size={14} className="text-brand-amber" />
                              </div>
                              <h3 className="text-[10px] uppercase font-black text-white tracking-[0.2em]">Conversation Analysis</h3>
                            </div>
                            <div className="text-[8px] uppercase font-bold text-slate-500 bg-white/5 px-2 py-1 rounded">
                              {result.messages.length} Messages Detected
                            </div>
                          </div>
                          <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {result.messages.map((msg, i) => (
                              <ChatMessageBubble 
                                key={i} 
                                message={msg} 
                                uiLang={uiLang} 
                                tokenContextLabel={currentUi.tokenContextLabel} 
                              />
                            ))}
                          </div>
                          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-amber shadow-[0_0_8px_rgba(212,175,55,0.5)] animate-pulse" />
                            <span className="text-[9px] uppercase font-black text-slate-600 tracking-widest italic font-serif">Tap bubbles to reveal cultural diagnostics</span>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-0">
                          <div className="p-6 sm:p-8 border-b border-white/5 relative group bg-surface-base">
                            <div className="flex justify-between items-center mb-6 gap-4">
                              <h3 className="text-[10px] sm:text-xs text-white uppercase tracking-[0.2em] font-semibold border-l-2 border-blue-400 pl-3">Formal Indonesian (Baku)</h3>
                              <CopyButton text={result.translations.formal_indonesian} label={currentUi.copy} />
                            </div>
                            <p className="text-xl sm:text-2xl font-serif text-slate-100 leading-normal italic whitespace-pre-wrap">
                              "{result.translations.formal_indonesian}"
                            </p>
                          </div>
    
                          <div className="p-6 sm:p-8 border-b border-white/5 relative group bg-surface-subtle/30">
                            <div className="flex justify-between items-center mb-6 gap-4">
                              <h3 className="text-[10px] sm:text-xs text-white uppercase tracking-[0.2em] font-semibold border-l-2 border-amber-400 pl-3">{currentUi.dailyLabel}</h3>
                              <CopyButton text={result.translations.daily_indonesian} label={currentUi.copy} />
                            </div>
                            <p className="text-xl sm:text-2xl font-serif text-slate-100 leading-normal italic whitespace-pre-wrap">
                              "{result.translations.daily_indonesian}"
                            </p>
                          </div>
    
                          <div className="p-6 sm:p-8 bg-surface-subtle group border-b border-white/5">
                            <div className="flex justify-between items-center mb-6 gap-4">
                              <h3 className="text-[10px] sm:text-xs text-white uppercase tracking-[0.2em] font-semibold border-l-2 border-emerald-400 pl-3">Clear English</h3>
                              <CopyButton text={result.translations.professional_english} label={currentUi.copy} />
                            </div>
                            <p className="text-xl sm:text-2xl font-serif text-slate-100 leading-normal italic whitespace-pre-wrap">
                              "{result.translations.professional_english}"
                            </p>
                          </div>
                        </div>
                      )}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </section>
          )}
      </main>
      </div>

      {/* Footer Status Bar */}
      <footer className="px-8 py-4 bg-surface-base shrink-0">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 text-[10px] text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
              {currentUi.footerEngine}
            </span>
          </div>
          <div className="flex gap-6">
            <button className="text-[9px] text-slate-500 uppercase tracking-widest hover:text-white transition-colors">{currentUi.footerPrivacy}</button>
            <button className="text-[9px] text-slate-500 uppercase tracking-widest hover:text-white transition-colors">{currentUi.footerEnterprise}</button>
          </div>
        </div>
      </footer>
    </motion.div>
  );
};
