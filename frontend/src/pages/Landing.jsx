import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

export default function Landing() {
  const heroes = [
    { name: "Goku", image: "/images/goku.png" },
    { name: "Baki", image: "/images/baki.png" },
    { name: "Toji", image: "/images/toji.png" },
    { name: "Broly", image: "/images/broly.png" },
  ];

  const [currentHero, setCurrentHero] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentHero((prev) => (prev + 1) % heroes.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <div className="min-h-screen bg-[#050816] relative overflow-hidden text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,0.22),transparent_32%),radial-gradient(circle_at_85%_70%,rgba(6,182,212,0.18),transparent_30%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:48px_48px]" />

      <Navbar />

      <main className="relative z-10 max-w-7xl mx-auto min-h-screen px-8 pt-32 pb-8 grid md:grid-cols-2 items-center gap-10">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 mb-6 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-4 py-2 text-sm text-cyan-300">
            <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_18px_#22d3ee]" />
            AI POWERED PHYSIQUE MATCHING
          </div>

          <h1 className="max-w-3xl text-4xl md:text-6xl font-black leading-[1.05] tracking-[-0.04em]">
            UNLOCK YOUR
            <br />
            <span className="text-white">ANIME-LEVEL</span>
            <br />
            <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
              PHYSIQUE
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base md:text-lg leading-8 text-slate-300">
            Calculate your body stats, discover your closest anime physique
            match, and generate a personalized AI roadmap to train like your
            target character.
          </p>

          <div className="mt-8">
            <Link to="/calculator">
              <button className="rounded-2xl bg-cyan-400 px-7 py-4 font-bold text-[#050816] shadow-[0_0_35px_rgba(34,211,238,0.35)] transition hover:scale-105 hover:bg-cyan-300">
                Start Analysis
              </button>
            </Link>
          </div>
        </motion.div>

        {/* Character carousel - float animation is on the wrapper, character swap is inside */}
        <div
          className="hidden md:flex justify-center items-center"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Floating wrapper - separate from AnimatePresence */}
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative w-[430px] h-[520px] flex items-center justify-center"
          >
            <div className="absolute bottom-10 w-[320px] h-[90px] rounded-full bg-black/50 blur-2xl scale-x-125" />

            {/* Character swap - clean instant cut on hover, transition when auto-cycling */}
            <AnimatePresence mode="wait">
              <motion.img
                key={heroes[currentHero].name}
                src={heroes[currentHero].image}
                alt={heroes[currentHero].name}
                draggable="false"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.04 }}
                transition={{ duration: isPaused ? 0 : 0.5 }}
                className="relative z-10 h-[500px] object-contain select-none pointer-events-none drop-shadow-[0_35px_45px_rgba(0,0,0,0.65)]"
              />
            </AnimatePresence>

            {/* Dot indicators */}
            <div className="absolute bottom-0 flex gap-2 z-20">
              {heroes.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentHero(i)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i === currentHero
                      ? "bg-cyan-400 w-5"
                      : "bg-white/30 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
