import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { generateRoadmap } from "../api/roadmap";

export default function Roadmap() {
  const navigate = useNavigate();

  const matchResult = JSON.parse(localStorage.getItem("matchResult"));
  const userInput = JSON.parse(localStorage.getItem("calculatorInput"));
  const bodyFatEstimateData = JSON.parse(
    localStorage.getItem("bodyFatEstimateData")
  );

  const [age, setAge] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("beginner");
  const [trainingDays, setTrainingDays] = useState(5);
  const [timeline, setTimeline] = useState(6);

  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (bodyFatEstimateData?.age) {
      setAge(String(bodyFatEstimateData.age));
    }
  }, []);

  if (!matchResult || !userInput) {
    return (
      <div className="min-h-screen bg-[#050816] text-white flex items-center justify-center px-6">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center max-w-md">
          <h1 className="text-3xl font-bold mb-4">No Match Found</h1>

          <p className="text-slate-400 mb-6">
            Please complete the calculator first before generating a roadmap.
          </p>

          <button
            onClick={() => navigate("/calculator")}
            className="rounded-2xl bg-cyan-400 px-6 py-3 font-bold text-[#050816]"
          >
            Go to Calculator
          </button>
        </div>
      </div>
    );
  }

  const bestMatch = matchResult.best_match;

  const handleGenerateRoadmap = async () => {
    if (!age) {
      setError("Please enter your age.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const payload = {
        character_id: bestMatch.character_id,
        user_height_cm: Number(userInput.height),
        user_weight_kg: Number(userInput.weight),
        user_body_fat_percent: Number(userInput.bodyFat),
        user_age: Number(age),
        experience_level: experienceLevel,
        training_days: Number(trainingDays),
        target_timeline_months: Number(timeline),
      };

      const data = await generateRoadmap(payload);
      setRoadmap(data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to generate roadmap");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!roadmap?.roadmap_id) {
      setError("Roadmap ID not found. Generate the roadmap again.");
      return;
    }

    try {
      setDownloadingPdf(true);
      setError("");

      const response = await api.get(
        `/roadmap/download-pdf/${roadmap.roadmap_id}`,
        {
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `${roadmap.character_name}_Roadmap.pdf`;

      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError("Failed to download PDF.");
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] relative overflow-hidden text-white px-6 py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,0.18),transparent_32%),radial-gradient(circle_at_85%_70%,rgba(6,182,212,0.14),transparent_30%)]" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="mb-10 text-center">
          <p className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/5 px-4 py-2 text-sm text-cyan-300">
            AI GENERATED TRAINING PLAN
          </p>

          <h1 className="mt-5 text-4xl md:text-6xl font-black tracking-tight">
            Roadmap to{" "}
            <span className="bg-gradient-to-r from-cyan-300 to-violet-400 bg-clip-text text-transparent">
              {bestMatch.character_name}
            </span>
          </h1>

          <p className="mt-4 text-slate-400">
            Target anime: {bestMatch.anime} • Match: {bestMatch.match_percent}%
          </p>
        </div>

        {!roadmap && (
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-8 shadow-2xl shadow-purple-500/10">
            <h2 className="text-2xl font-bold mb-2">Personalize Your Plan</h2>

            <p className="mb-6 text-slate-400">
              We will automatically decide whether you should cut, lean bulk, or
              recomp based on your stats and target character.
            </p>

            <div className="grid md:grid-cols-2 gap-5">
              <input
                type="number"
                placeholder="Age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/30 p-4 outline-none text-white"
              />

              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/30 p-4 outline-none text-white"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>

              <select
                value={trainingDays}
                onChange={(e) => setTrainingDays(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/30 p-4 outline-none text-white"
              >
                <option value={3}>3 Days / Week</option>
                <option value={4}>4 Days / Week</option>
                <option value={5}>5 Days / Week</option>
                <option value={6}>6 Days / Week</option>
              </select>

              <select
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/30 p-4 outline-none text-white"
              >
                <option value={4}>4 Months</option>
                <option value={6}>6 Months</option>
                <option value={9}>9 Months</option>
                <option value={12}>1 Year</option>
                <option value={24}>2 Years</option>
              </select>
            </div>

            {error && <p className="mt-5 text-red-400">{error}</p>}

            <button
              onClick={handleGenerateRoadmap}
              disabled={loading || !age}
              className="mt-8 w-full rounded-2xl bg-cyan-400 px-7 py-4 font-bold text-[#050816] shadow-[0_0_35px_rgba(34,211,238,0.25)] transition hover:scale-[1.01] hover:bg-cyan-300 disabled:opacity-50"
            >
              {loading ? "Generating Roadmap..." : "Generate AI Roadmap"}
            </button>
          </div>
        )}

        {roadmap && (
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-8 shadow-2xl shadow-cyan-500/10">
            <div className="mb-8">
              <h2 className="text-4xl font-black">{roadmap.character_name}</h2>
              <p className="mt-2 text-slate-400">{roadmap.anime}</p>
            </div>

            <div className="whitespace-pre-wrap leading-8 text-slate-200">
              {roadmap.roadmap_text}
            </div>

            <div className="mt-10 flex flex-wrap gap-4">
              <button
                onClick={handleDownloadPdf}
                disabled={downloadingPdf}
                className="rounded-2xl bg-cyan-400 px-6 py-3 font-bold text-[#050816] transition hover:bg-cyan-300 disabled:opacity-50"
              >
                {downloadingPdf ? "Generating PDF..." : "Download PDF"}
              </button>

              <button
                onClick={() => setRoadmap(null)}
                className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                Generate Another Roadmap
              </button>
            </div>

            {error && <p className="mt-5 text-red-400">{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
}