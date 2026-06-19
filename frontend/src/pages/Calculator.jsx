import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import BodyFatModal from "../components/BodyFatModal";

export default function Calculator() {
  const navigate = useNavigate();

  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [gender, setGender] = useState("male");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [disclaimer, setDisclaimer] = useState("");
  const [openModal, setOpenModal] = useState(false);

  const handleSubmit = async () => {
    if (!height || !weight || !bodyFat || !gender) {
      setError("Please fill all fields before calculating.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const payload = {
        height_cm: Number(height),
        weight_kg: Number(weight),
        body_fat_percent: Number(bodyFat),
        gender,
      };

      const response = await api.post("/calculator/match", payload);

      localStorage.setItem("matchResult", JSON.stringify(response.data));

      localStorage.setItem(
        "calculatorInput",
        JSON.stringify({
          height,
          weight,
          bodyFat,
          gender,
        })
      );

      navigate("/results");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to calculate match");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBodyFatModal = () => {
    setError("");
    setOpenModal(true);
  };

  return (
    <div className="min-h-screen bg-[#050816] relative overflow-hidden text-white px-4 py-24 flex items-center justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,0.18),transparent_32%),radial-gradient(circle_at_85%_70%,rgba(6,182,212,0.14),transparent_30%)]" />

      <div className="relative z-10 w-full max-w-xl rounded-3xl border border-white/10 bg-white/[0.04] p-8 md:p-10 shadow-2xl shadow-purple-500/20 backdrop-blur-xl">
        <div className="mb-8 text-center">
          <p className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/5 px-4 py-2 text-sm text-cyan-300">
            BODY ANALYSIS
          </p>

          <h1 className="mt-5 text-3xl md:text-4xl font-black tracking-tight">
            Anime Physique Calculator
          </h1>

          <p className="mt-3 text-slate-400">
            Enter your stats and discover your closest anime physique match.
          </p>
        </div>

        <div className="space-y-5">
          <input
            type="number"
            placeholder="Height (cm)"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black/30 p-4 text-white outline-none transition focus:border-cyan-300/50"
          />

          <input
            type="number"
            placeholder="Weight (kg)"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black/30 p-4 text-white outline-none transition focus:border-cyan-300/50"
          />

          <div>
            <input
              type="number"
              placeholder="Body Fat %"
              value={bodyFat}
              onChange={(e) => setBodyFat(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/30 p-4 text-white outline-none transition focus:border-cyan-300/50"
            />

            <div className="mt-3 flex items-center justify-between gap-4">
              <p className="text-sm text-slate-400">
                Don&apos;t know your body fat?
              </p>

              <button
                type="button"
                onClick={handleOpenBodyFatModal}
                className="text-sm font-semibold text-cyan-300 transition hover:text-cyan-200"
              >
                Calculate for me
              </button>
            </div>

            {disclaimer && (
              <p className="mt-3 rounded-2xl border border-yellow-400/20 bg-yellow-400/5 p-3 text-sm leading-6 text-yellow-200">
                ⚠ {disclaimer}
              </p>
            )}
          </div>

          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black/30 p-4 text-white outline-none transition focus:border-cyan-300/50"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>

          {error && (
            <p className="rounded-2xl border border-red-400/20 bg-red-400/5 p-3 text-sm text-red-300">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full rounded-2xl bg-cyan-400 py-4 font-bold text-[#050816] shadow-[0_0_35px_rgba(34,211,238,0.25)] transition hover:scale-[1.01] hover:bg-cyan-300 disabled:opacity-50"
          >
            {loading ? "Calculating..." : "Calculate Match"}
          </button>
        </div>
      </div>

      <BodyFatModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        initialHeight={height}
        initialWeight={weight}
        initialGender={gender}
        onEstimate={(data) => {
          setBodyFat(data.estimated_body_fat_percent);
          setDisclaimer(data.disclaimer);
          setGender(data.gender || gender);

          localStorage.setItem(
            "bodyFatEstimateData",
            JSON.stringify({
              age: data.age,
              gender: data.gender || gender,
            })
          );
        }}
      />
    </div>
  );
}