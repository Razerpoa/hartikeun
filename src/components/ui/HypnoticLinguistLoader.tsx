import { FC } from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

export const HypnoticLinguistLoader: FC<{ text: string }> = ({ text }) => {
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
