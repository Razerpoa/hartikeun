import { FC, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n';

interface LandingPageProps {
  uiLang: 'id' | 'en';
  setUiLang: (lang: 'id' | 'en') => void;
}

export const LandingPage: FC<LandingPageProps> = ({ uiLang, setUiLang }) => {
  const navigate = useNavigate();
  const [hasAnimated, setHasAnimated] = useState(false);
  const [subjectIndex, setSubjectIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setHasAnimated(true), 1500);
    const interval = setInterval(() => {
      setSubjectIndex((prev) => (prev + 1) % 7);
    }, 4000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  const t = useI18n(uiLang).landing;
  const heroWords = t.hero.split(" ");
  const targetIndex = heroWords.length - 1;

  const subjects = {
    en: ["friends'", "clients", "son's", "others'", "boss'", "date's", "sibling's"],
    id: ["temen", "clients", "putra", "lainnya", "bos", "gebetan", "adik"]
  };

  const bubbleConversations = {
    en: [
      {
        sender: "Bro, your gyatt is so skibidi rizzler, no cap!",
        receiver: "Wait, what does that even mean?"
      },
      {
        sender: "Please action this ASAP, need to align with stakeholders for maximum synergy.",
        receiver: "You mean act quickly and discuss with them?"
      },
      {
        sender: "Dad, I was mewing while watching a Roblox stream, that rizz was Ohio style!",
        receiver: "Mewing? Ohio? Son, talk normal please!"
      },
      {
        sender: "Come here and try some kapurung, it is so delicious!",
        receiver: "Kapurung? Is that a traditional Sulawesi dish?"
      },
      {
        sender: "Hey, let's circle back offline, just a quick sync to action the deliverables.",
        receiver: "Circle back? Action? Can we just talk normal for a second?"
      },
      {
        sender: "He said he'd slide into my DMs but now he's ghosting — red flag bestie!",
        receiver: "Slide? Ghosting? Is this English or a whole new language?"
      },
      {
        sender: "Bro I just clutched a 1v5 in ranked, the whole lobby went crazy!",
        receiver: "Clutched? 1v5? Are you speaking gamer or English?"
      }
    ],
    id: [
      {
        sender: "Maneh gera gera cek khodam, aing mah khodam maung sigma",
        receiver: "Hah?, ngomong apa sih?"
      },
      {
        sender: "Tolong dong ASAP, tolong di-align sama stakeholders biar synergy-nya dapet",
        receiver: "Maksudnya kerja cepat dan didiskusikan?"
      },
      {
        sender: "Piksen mewing mukbang di Roblox kece parah, rizz-nya menyala abangku!",
        receiver: "Roblox apanya? Mewing itu apa lagi?!"
      },
      {
        sender: "Sini ki' makan kapurung, naenaknya kapurung buatan mamaku!",
        receiver: "Kapurung? Makanan khas Sulawesi ya?"
      },
      {
        sender: "Tolong di-CC-in semua stakeholder untuk one-on-one meeting ASAP ya.",
        receiver: "Maksudnya diundang rapat? Ngomongnya dipersingkat dong!"
      },
      {
        sender: "Dia bilang mau chat tapi malah ghosting, red flag banget sih bestie!",
        receiver: "Ghosting? Red flag? Bestie? Kakakmu ini udah tua, sabar ya..."
      },
      {
        sender: "Kak gue baru aja FTL di turnamen, direct message gue di-blast fans!",
        receiver: "FTL? di-blast? Adik, kakak nggak ngerti bahasa internet kamu..."
      }
    ]
  };

  const subjectWordIndex = heroWords.findIndex(
    w => w.toLowerCase().startsWith('friends') || w.toLowerCase() === 'temen'
  );

  const displayHeroWords = [...heroWords];
  if (subjectWordIndex !== -1) {
    displayHeroWords[subjectWordIndex] = subjects[uiLang][subjectIndex];
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
      className="h-screen bg-surface-base text-slate-200 overflow-hidden flex flex-col selection:bg-brand-amber/30"
    >
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div 
          animate={{ 
            x: [0, 50, -50, 0],
            y: [0, -30, 30, 0],
            scale: [1, 1.1, 0.9, 1]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-brand-amber/10 blur-[150px] rounded-full" 
        />
        <motion.div 
          animate={{ 
            x: [0, -40, 40, 0],
            y: [0, 40, -40, 0],
            scale: [1, 0.9, 1.1, 1]
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-brand-amber/5 blur-[150px] rounded-full" 
        />
        
        {/* Ambient Floating Elements */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              opacity: 0, 
              x: Math.random() * 100 + "%", 
              y: Math.random() * 100 + "%" 
            }}
            animate={{ 
              y: [null, "-20%", "20%"],
              opacity: [0, 0.15, 0],
              rotate: [0, 360]
            }}
            transition={{ 
              duration: 15 + Math.random() * 10, 
              repeat: Infinity, 
              ease: "linear",
              delay: i * 2 
            }}
            className="absolute w-24 h-24 border border-brand-amber/10 rounded-lg flex items-center justify-center text-[10px] text-brand-amber/20 font-black uppercase tracking-widest"
          >
            {["Skibidi", "Sigma", "Rizz", "Menyala", "Bray"][i]}
          </motion.div>
        ))}
      </div>

      {/* Language Switcher Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-50 p-6 flex justify-between items-center max-w-7xl mx-auto w-full shrink-0"
      >
        <div className="flex items-center gap-3">
          <motion.div 
            whileHover={{ rotate: 12, scale: 1.1 }}
            className="w-8 h-8 bg-brand-amber/20 border border-brand-amber/50 flex items-center justify-center rotate-3"
          >
            <span className="text-brand-amber font-serif font-bold">H</span>
          </motion.div>
          <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-slate-500">Explorer</span>
        </div>
        
          <div className="flex items-center gap-2 px-1.5 py-1.5 bg-white/5 rounded-lg border border-white/10 backdrop-blur-md">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setUiLang('en')} 
            className={`px-4 py-1.5 rounded-md text-[10px] font-black tracking-[0.2em] transition-all duration-300 ${uiLang === 'en' ? 'bg-brand-amber/90 text-black shadow-lg shadow-brand-amber/20' : 'text-slate-500 hover:text-slate-300'}`}
          >
            EN
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setUiLang('id')} 
            className={`px-4 py-1.5 rounded-md text-[10px] font-black tracking-[0.2em] transition-all duration-300 ${uiLang === 'id' ? 'bg-brand-amber/90 text-black shadow-lg shadow-brand-amber/20' : 'text-slate-500 hover:text-slate-300'}`}
          >
            ID
          </motion.button>
        </div>
      </motion.header>

      {/* Main Container */}
      <section className="relative flex-1 px-6 sm:px-12 lg:px-24 max-w-7xl mx-auto z-10 flex flex-col md:flex-row items-center justify-center md:justify-between gap-12 md:gap-24 w-full py-12 md:py-0">
        
        {/* Left Content Column */}
        <div className="flex-1 flex flex-col items-start text-left w-full">
          <div className="mb-8 md:mb-12 max-w-3xl">
            <h1 className={`text-5xl sm:text-7xl lg:text-8xl font-serif font-black text-white italic leading-[0.9] ${uiLang === 'id' ? 'tracking-tighter' : ''}`}>
              {displayHeroWords.map((word, i) => {
                const styles = [
                  "text-white",
                  "text-white font-sans tracking-tighter not-italic font-black underline decoration-brand-amber/50 underline-offset-[12px]",
                  "text-white font-serif font-light",
                  "text-white italic",
                  "text-brand-amber font-serif",
                ];
                
                // Keep the second word underlined as before
                const underlinedIndex = 1; 
                
                const styleClass = `${i === underlinedIndex ? styles[1] : styles[i > underlinedIndex ? (i % styles.length) : (i % styles.length)]}`;
                
                // 1. Detect if this is the subject word
                if (subjectWordIndex !== -1 && i === subjectWordIndex) {
                  // 2. Render subject word AND next word together
                  const nextWord = displayHeroWords[i + 1];
                  const nextIndex = i + 1;
                  const nextWordStyleClass = `${nextIndex === underlinedIndex ? styles[1] : styles[nextIndex > underlinedIndex ? (nextIndex % styles.length) : (nextIndex % styles.length)]}`;
                  
                  return (
                    <span key={i} className="inline-block whitespace-nowrap">
                      <motion.span 
                        layout
                        initial={hasAnimated ? false : { opacity: 0, y: 40, rotateX: -90, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
                        transition={{ duration: 0.8, delay: hasAnimated ? 0 : 0.4 + (i * 0.1), ease: [0.16, 1, 0.3, 1] }}
                        className={`${styleClass} mr-3 inline-block transform transition-colors cursor-default origin-bottom relative`}
                      >
                        <AnimatePresence mode="wait">
                          <motion.span
                            key={word}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                          >
                            {word}
                          </motion.span>
                        </AnimatePresence>
                        {i === targetIndex && (
                          <motion.span 
                            initial={hasAnimated ? false : { opacity: 0, scale: 0, rotate: -120 }}
                            animate={{ opacity: 1, scale: 1, rotate: 15 }}
                            transition={{ 
                              delay: hasAnimated ? 0 : 1.0, 
                              duration: 1.3, 
                              ease: [0.16, 1, 0.3, 1] 
                            }}
                            style={{ transformOrigin: 'bottom center' }}
                            className="absolute top-1 -right-4 sm:top-2 sm:-right-6 text-4xl sm:text-7xl text-brand-amber font-serif italic select-none z-50"
                          >
                            ?
                          </motion.span>
                        )}
                      </motion.span>
                      
                      {/* Next word */}
                      <motion.span 
                        initial={hasAnimated ? false : { opacity: 0, y: 40, rotateX: -90, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
                        transition={{ duration: 0.8, delay: hasAnimated ? 0 : 0.4 + ((i + 1) * 0.1), ease: [0.16, 1, 0.3, 1] }}
                        className={nextWordStyleClass}
                      >
                        {nextWord}
                      </motion.span>
                    </span>
                  );
                }
                
                // 3. Skip the next word in the loop if it was just rendered
                if (subjectWordIndex !== -1 && i === subjectWordIndex + 1) {
                  return null;
                }
                
                return (
                  <motion.span 
                    key={i} 
                    initial={hasAnimated ? false : { opacity: 0, y: 40, rotateX: -90, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
                    transition={{ 
                      duration: 0.8, 
                      delay: hasAnimated ? 0 : 0.4 + (i * 0.1), 
                      ease: [0.16, 1, 0.3, 1] 
                    }}
                    whileHover={{ 
                      scale: 1.05, 
                      rotate: i % 2 === 0 ? 1 : -1,
                      transition: { duration: 0.2 } 
                    }}
                    className={`${styleClass} mr-3 inline-block transform transition-colors cursor-default origin-bottom relative`}
                  >
                    {word}
                    {i === targetIndex && (
                      <motion.span 
                        initial={hasAnimated ? false : { opacity: 0, scale: 0, rotate: -120 }}
                        animate={{ opacity: 1, scale: 1, rotate: 15 }}
                        transition={{ 
                          delay: hasAnimated ? 0 : 1.0, 
                          duration: 1.3, 
                          ease: [0.16, 1, 0.3, 1] 
                        }}
                        style={{ transformOrigin: 'bottom center' }}
                        className="absolute top-1 -right-4 sm:top-2 sm:-right-6 text-4xl sm:text-7xl text-brand-amber font-serif italic select-none z-50"
                      >
                        ?
                      </motion.span>
                    )}
                  </motion.span>
                );
              })}
            </h1>

            <motion.p
              initial={hasAnimated ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: hasAnimated ? 0 : 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="text-slate-400 text-sm sm:text-base lg:text-lg max-w-xl font-medium mt-6 leading-relaxed border-l-2 border-brand-amber/30 pl-6"
            >
              {(t as any).featureSubtitle}
            </motion.p>
          </div>

          <motion.div
            initial={hasAnimated ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: hasAnimated ? 0 : 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="w-full flex justify-start"
          >
            <button
              onClick={() => navigate('/translate')}
              className="group relative flex items-center justify-between gap-8 px-10 py-6 bg-brand-amber text-black font-black uppercase tracking-[0.25em] text-[10px] sm:text-xs hover:scale-105 transition-all shadow-[0_15px_30px_rgba(212,175,55,0.25)] active:scale-95 sm:w-auto overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative z-10">{t.cta}</span>
              <ArrowRight size={20} className="relative z-10 group-hover:translate-x-2 transition-transform duration-300" />
            </button>
          </motion.div>
        </div>

        {/* Right Content Column - Animated Conversation Snippet */}
        <motion.div
          initial={hasAnimated ? false : { opacity: 0, x: 30, scale: 0.95 }}
          animate={{ 
            opacity: 1, 
            x: 0, 
            scale: 1,
            y: [0, -10, 0]
          }}
          transition={{ 
            opacity: { duration: 1.2, delay: hasAnimated ? 0 : 0.6 },
            x: { duration: 1.2, delay: hasAnimated ? 0 : 0.6 },
            scale: { duration: 1.2, delay: hasAnimated ? 0 : 0.6 },
            y: { duration: 6, repeat: Infinity, ease: "easeInOut" }
          }}
          className="w-full md:flex-1 flex flex-col gap-3 max-w-sm relative self-end md:self-center mt-4 md:mt-0"
        >
          {/* Decorative Glow */}
          <div className="absolute inset-0 bg-brand-amber/5 blur-[100px] -z-10 rounded-full" />
          
          <div className="min-h-[4.5rem] flex items-center justify-start">
            <AnimatePresence mode="wait">
              <motion.div
                key={`sender-${subjectIndex}`}
                initial={{ opacity: 0, x: -20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.95 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="self-start bg-white/5 border border-white/10 px-6 py-4 rounded-3xl rounded-bl-none text-sm text-slate-100 font-medium italic shadow-2xl backdrop-blur-xl"
              >
                "{bubbleConversations[uiLang][subjectIndex].sender}"
              </motion.div>
            </AnimatePresence>
          </div>
          
          <div className="min-h-[3.5rem] flex items-center justify-end">
            <AnimatePresence mode="wait">
              <motion.div
                key={`receiver-${subjectIndex}`}
                initial={{ opacity: 0, x: 20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20, scale: 0.95 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
                className="self-end bg-brand-amber/20 border border-brand-amber/30 px-6 py-4 rounded-3xl rounded-br-none text-sm text-brand-amber font-black shadow-2xl backdrop-blur-xl ml-8"
              >
                "{bubbleConversations[uiLang][subjectIndex].receiver}"
              </motion.div>
            </AnimatePresence>
          </div>

          <motion.div 
            animate={{ 
              opacity: [0.4, 1, 0.4]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="mt-6 flex items-center justify-end gap-2 text-[9px] uppercase tracking-[0.3em] font-black text-slate-500"
          >
            <Sparkles size={12} className="text-brand-amber/60" />
            <span>Culture Insight Engine</span>
          </motion.div>
        </motion.div>
      </section>

      {/* Word Cloud / Marquee - Positioned more subtly */}
      <div className="absolute bottom-24 w-screen overflow-hidden opacity-[0.07] pointer-events-none z-0">
        <motion.div 
          animate={{ x: [0, -1000] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="flex gap-20 whitespace-nowrap text-[80px] sm:text-[140px] font-serif italic font-black text-white/10 uppercase"
        >
          {[...Array(10)].map((_, i) => (
            <span key={i}>Hartikeun Skibidi Sigma Rizz Menyala Abangku Cek Khodam Bray</span>
          ))}
        </motion.div>
      </div>

      {/* Bottom Branding */}
      <footer className="pb-12 px-8 flex flex-col items-center justify-center shrink-0 relative z-10">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-amber shadow-[0_0_10px_rgba(212,175,55,1)] animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.5em] font-bold text-white/40">Hartikeun // Project</span>
          </div>
        </div>
      </footer>
    </motion.div>
  );
};
