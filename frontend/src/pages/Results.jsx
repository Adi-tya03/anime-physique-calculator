import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Results() {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);

  useEffect(() => {
    const savedResult = localStorage.getItem("matchResult");

    if (!savedResult) {
      navigate("/calculator");
      return;
    }

    setResult(JSON.parse(savedResult));
  }, [navigate]);

  if (!result) {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center text-white">
        Loading results...
      </div>
    );
  }

  const bestMatch = result.best_match;
  const topMatches = result.top_matches || [];

  return (
    <div className="min-h-screen bg-[#050816] relative overflow-hidden text-white px-6 py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,0.18),transparent_32%),radial-gradient(circle_at_85%_70%,rgba(6,182,212,0.14),transparent_30%)]" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="mb-10 text-center">
          <p className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/5 px-4 py-2 text-sm text-cyan-300">
            MATCH ANALYSIS COMPLETE
          </p>

          <h1 className="mt-5 text-4xl md:text-6xl font-black tracking-tight">
            Your Anime Physique Match
          </h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-stretch">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-8 shadow-2xl shadow-cyan-500/10 overflow-hidden">
            <div className="relative h-[450px] flex items-center justify-center overflow-hidden rounded-[2rem]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.35),transparent_42%)]" />
              <div className="absolute h-[420px] w-[420px] rounded-full bg-cyan-400/35 blur-[85px]" />
              <div className="absolute h-[320px] w-[320px] rounded-full bg-violet-500/35 blur-[90px]" />
              <div className="absolute bottom-8 h-[90px] w-[340px] rounded-full bg-cyan-300/25 blur-[45px]" />

              {bestMatch.image_url ? (
                <img
                  src={bestMatch.image_url}
                  alt={bestMatch.character_name}
                  className="float-character relative z-20 max-h-[430px] object-contain drop-shadow-[0_0_55px_rgba(34,211,238,0.95)] transition-all duration-500 hover:scale-105"
                />
              ) : (
                <div className="relative z-20 text-7xl">⚔️</div>
              )}
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-black/25 p-5">
              <h2 className="text-4xl font-black">
                {bestMatch.character_name}
              </h2>

              <p className="mt-2 text-slate-400">{bestMatch.anime}</p>

              <div className="mt-6 flex items-center gap-4">
                <div className="rounded-2xl bg-cyan-400 px-5 py-3 text-[#050816] font-black text-2xl">
                  {bestMatch.match_percent}%
                </div>

                <p className="text-slate-300 font-semibold">Match Score</p>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="grid sm:grid-cols-3 gap-5">
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                <p className="text-slate-400">BMI</p>
                <h3 className="mt-2 text-3xl font-black text-cyan-300">
                  {result.bmi}
                </h3>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                <p className="text-slate-400">FFMI</p>
                <h3 className="mt-2 text-3xl font-black text-violet-300">
                  {result.ffmi}
                </h3>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                <p className="text-slate-400">Difficulty</p>
                <h3 className="mt-2 text-2xl font-black text-white capitalize">
                  {bestMatch.difficulty}
                </h3>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <h3 className="text-2xl font-black mb-5">Top Matches</h3>

              <div className="space-y-4">
                {topMatches.map((character, index) => (
                  <div
                    key={character.character_id}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/25 p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-black text-cyan-300">
                        {index + 1}
                      </div>

                      <div>
                        <h4 className="font-bold">
                          {character.character_name}
                        </h4>

                        <p className="text-sm text-slate-400">
                          {character.anime}
                        </p>
                      </div>
                    </div>

                    <p className="font-black text-cyan-300">
                      {character.match_percent}%
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <button
                onClick={() => navigate("/roadmap")}
                className="rounded-2xl bg-cyan-400 px-6 py-4 font-bold text-[#050816] shadow-[0_0_35px_rgba(34,211,238,0.25)] transition hover:scale-[1.01] hover:bg-cyan-300"
              >
                Generate AI Roadmap
              </button>

              <button
                onClick={() => navigate("/calculator")}
                className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 font-semibold text-white transition hover:bg-white/10"
              >
                Calculate Again
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}