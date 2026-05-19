import { FC, useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Volume2, 
  BookOpen, 
  Layers, 
  MessageCircle, 
  Zap,
  Sparkles,
  Loader2,
  AlertCircle,
  MapPin
} from 'lucide-react';

interface WordDetailData {
  word: string;
  pronunciation: string;
  origin_and_culture: string;
  usage_examples: {
    sentence: string;
    translation: string;
    context: string;
    dialect: string;
  }[];
  synonyms: string[];
  antonyms: string[];
}

interface WordDetailsProps {
  uiLang: 'id' | 'en';
}

const HypnoticLinguistLoader: FC<{ text: string }> = ({ text }) => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center relative min-h-[400px]">
      {/* Dynamic Particle Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              opacity: 0, 
              x: Math.random() * 400 - 200, 
              y: Math.random() * 400 - 200 
            }}
            animate={{ 
              opacity: [0, 0.2, 0],
              x: Math.random() * 800 - 400,
              y: Math.random() * 800 - 400,
              rotate: 360
            }}
            transition={{ 
              duration: 10 + Math.random() * 10, 
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute text-[10px] font-mono text-brand-amber/20"
          >
            {characters[Math.floor(Math.random() * characters.length)]}
          </motion.div>
        ))}
      </div>

      {/* Central Rotating Mandala */}
      <div className="relative mb-24 transform scale-150 sm:scale-[1.8]">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="w-24 h-24 relative"
        >
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute inset-0 border border-brand-amber/10 rounded-full"
              style={{ rotate: i * 45 }}
              animate={{ 
                scale: [1, 1.2, 1],
                borderColor: ["rgba(255, 191, 0, 0.1)", "rgba(255, 191, 0, 0.4)", "rgba(255, 191, 0, 0.1)"]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                delay: i * 0.2,
                ease: "easeInOut"
              }}
            />
          ))}
          
          <motion.div
            className="absolute inset-4 border-2 border-brand-amber/40 border-t-transparent rounded-full"
            animate={{ rotate: -360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />

          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ scale: [0.8, 1.1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles className="text-brand-amber" size={20} />
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4 relative z-10"
      >
        <div className="flex gap-1 justify-center">
          {text.split("").map((char, i) => (
            <motion.span
              key={i}
              animate={{ 
                y: [0, -5, 0],
                color: ["#94a3b8", "#fbbf24", "#94a3b8"]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                delay: i * 0.1,
                ease: "easeInOut"
              }}
              className="text-xs uppercase tracking-[0.2em] font-bold"
            >
              {char}
            </motion.span>
          ))}
        </div>
        <p className="text-[10px] text-slate-600 italic tracking-widest uppercase">Connecting dialects and culture...</p>
      </motion.div>
    </div>
  );
};

export const WordDetails: FC<WordDetailsProps> = ({ uiLang }) => {
  const { word } = useParams<{ word: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState<WordDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const queryParams = new URLSearchParams(location.search);
  const contextHint = queryParams.get('context') || '';

  const t = {
    id: {
      back: "Kembali",
      pronunciation: "Cara Pengucapan",
      origins: "Asal-usul & Budaya",
      examples: "Contoh Penggunaan",
      synonyms: "Sinonim",
      antonyms: "Antonim",
      deepDive: "Deep Dive Linguistik",
      loading: "Menganalisis kata...",
      error: "Gagal memuat detail kata.",
      dialectBadge: "Dialek",
      contextBadge: "Situasi"
    },
    en: {
      back: "Back",
      pronunciation: "Pronunciation Guide",
      origins: "Origins & Culture",
      examples: "Usage Examples",
      synonyms: "Synonyms",
      antonyms: "Antonyms",
      deepDive: "Linguistic Deep Dive",
      loading: "Analyzing word...",
      error: "Failed to load word details.",
      dialectBadge: "Dialect",
      contextBadge: "Scenario"
    }
  }[uiLang];

  useEffect(() => {
    const fetchDetails = async () => {
      if (!word) return;
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/word-details', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            word, 
            lang: uiLang,
            context: contextHint
          }),
        });
        if (!response.ok) throw new Error('Failed to fetch');
        const json = await response.json();
        setData(json);
      } catch (err) {
        setError(t.error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [word, uiLang, t.error, contextHint]);

  const [playing, setPlaying] = useState(false);

  const playPronunciation = async (text: string) => {
    if (playing) return;
    setPlaying(true);
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: `Say carefully: ${text}`, voice: 'Kore' }),
      });
      
      if (!response.ok) throw new Error('TTS failed');
      const { audio } = await response.json();
      
      // Convert base64 to ArrayBuffer
      const binaryString = atob(audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // The TTS model returns raw PCM 16-bit little-endian at 24000Hz
      const sampleRate = 24000;
      const numberOfChannels = 1;
      const dataView = new DataView(bytes.buffer);
      const sampleCount = bytes.length / 2;
      const audioBuffer = audioCtx.createBuffer(numberOfChannels, sampleCount, sampleRate);
      const channelData = audioBuffer.getChannelData(0);
      
      for (let i = 0; i < sampleCount; i++) {
        // Divide by 32768 to normalize to [-1, 1]
        channelData[i] = dataView.getInt16(i * 2, true) / 32768;
      }
      
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);
      source.onended = () => {
        setPlaying(false);
        audioCtx.close();
      };
      source.start();
    } catch (err) {
      console.error('Audio playback error:', err);
      setPlaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-base text-slate-200 selection:bg-brand-amber/30">
      {/* Background Ornaments */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-10">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-amber/10 blur-[150px] rounded-full" />
      </div>

      <header className="sticky top-0 z-50 px-6 sm:px-8 py-6 border-b border-white/5 bg-surface-base/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-slate-500 hover:text-white transition-colors group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            {t.back}
          </button>
          
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-brand-amber/10 border border-brand-amber/30 flex items-center justify-center">
                <span className="text-brand-amber font-serif font-bold">H</span>
             </div>
             <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-600">Word // Explorer</span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-8 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-elevated/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] p-6 sm:p-12 overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none" />
          
          <AnimatePresence mode="wait">
            {loading ? (
              <HypnoticLinguistLoader text={t.loading} />
            ) : error ? (
              <motion.div 
                key="error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-24 text-center"
              >
                <AlertCircle size={32} className="text-red-500 mb-4" />
                <p className="text-red-400 italic text-sm">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-6 px-6 py-2 border border-white/10 hover:border-white/30 text-[10px] uppercase tracking-widest font-bold"
                >
                  Retry
                </button>
              </motion.div>
            ) : data && (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-12 relative z-10"
              >
                {/* Word Header */}
                <div className="border-l-4 border-brand-amber pl-8 py-4">
                  <span className="text-brand-amber font-mono text-xs uppercase tracking-[0.3em] font-bold block mb-2">{t.deepDive}</span>
                  <h1 className="text-5xl sm:text-7xl font-serif text-white italic leading-tight mb-4">
                    {data.word}
                  </h1>
                  <div className="flex items-center gap-4 text-slate-400">
                    <button 
                      onClick={() => playPronunciation(data.word)}
                      disabled={playing}
                      className={`flex items-center justify-center w-10 h-10 rounded-full border border-brand-amber/20 hover:bg-brand-amber/10 transition-all ${playing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'}`}
                    >
                      {playing ? (
                        <Loader2 size={18} className="text-brand-amber animate-spin" />
                      ) : (
                        <Volume2 size={18} className="text-brand-amber" />
                      )}
                    </button>
                    <span className="text-lg font-mono italic">[{data.pronunciation}]</span>
                  </div>
                </div>

                {/* Grid Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Origin */}
                  <div className="p-8 bg-surface-base/40 border border-white/5 rounded-2xl space-y-4">
                    <div className="flex items-center gap-3 text-brand-amber">
                      <Sparkles size={18} />
                      <h2 className="text-[10px] uppercase tracking-widest font-bold">{t.origins}</h2>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed font-sans italic">
                      {data.origin_and_culture}
                    </p>
                  </div>

                  {/* Synonyms & Antonyms */}
                  <div className="p-8 bg-surface-base/40 border border-white/5 rounded-2xl space-y-6">
                    <div>
                      <div className="flex items-center gap-3 text-brand-amber mb-4">
                        <Layers size={18} />
                        <h2 className="text-[10px] uppercase tracking-widest font-bold">{t.synonyms}</h2>
                      </div>
                      <div className="flex flex-wrap gap-2">
                         {data.synonyms.map((s, i) => (
                           <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 text-[10px] text-slate-400 font-mono italic">
                             {s}
                           </span>
                         ))}
                      </div>
                    </div>

                    {data.antonyms.length > 0 && (
                      <div>
                        <div className="flex items-center gap-3 text-brand-amber mb-4">
                          <Zap size={18} />
                          <h2 className="text-[10px] uppercase tracking-widest font-bold">{t.antonyms}</h2>
                        </div>
                        <div className="flex flex-wrap gap-2">
                           {data.antonyms.map((a, i) => (
                             <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 text-[10px] text-slate-400 font-mono italic">
                               {a}
                             </span>
                           ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Usage Examples - Full Width */}
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <BookOpen size={20} className="text-brand-amber" />
                    <h2 className="text-[10px] uppercase tracking-widest font-bold text-slate-400">{t.examples}</h2>
                    <div className="h-px flex-1 bg-white/5"></div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {data.usage_examples.map((ex, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-6 bg-surface-base/30 border border-white/5 group hover:border-brand-amber/30 transition-all rounded-2xl"
                      >
                        <div className="flex flex-col sm:flex-row gap-6">
                          <div className="w-10 h-10 rounded bg-white/5 flex items-center justify-center shrink-0 text-brand-amber font-mono text-sm underline decoration-brand-amber/30 font-bold group-hover:bg-brand-amber group-hover:text-black transition-colors">
                            {i + 1}
                          </div>
                          <div className="flex-1 space-y-4">
                            <div className="flex flex-wrap gap-2">
                              <span className="flex items-center gap-1 px-2 py-0.5 bg-brand-amber/20 border border-brand-amber/30 text-brand-amber text-[8px] uppercase tracking-widest font-bold rounded">
                                <MapPin size={8} />
                                {ex.dialect}
                              </span>
                              <span className="flex items-center gap-1 px-2 py-0.5 bg-white/5 border border-white/10 text-slate-500 text-[8px] uppercase tracking-widest font-bold rounded">
                                <MessageCircle size={8} />
                                {ex.context}
                              </span>
                            </div>

                            <div>
                              <p className="text-lg sm:text-2xl font-serif italic text-white leading-relaxed mb-2">
                                "{ex.sentence}"
                              </p>
                              <p className="text-sm text-slate-400 italic pl-4 border-l-2 border-brand-amber/20">{ex.translation}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>

      <footer className="py-12 flex flex-col items-center">
         <div className="flex items-center gap-2 opacity-20 mb-2">
            <div className="w-2 h-2 rounded-full bg-brand-amber" />
            <span className="text-[9px] uppercase tracking-[0.3em] font-bold">Linguistic Discovery</span>
         </div>
         <p className="text-[8px] text-slate-700 uppercase tracking-widest italic">Built for the cultural bridge</p>
      </footer>
    </div>
  );
};
