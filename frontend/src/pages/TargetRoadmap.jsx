import { useEffect, useState } from "react";
import api from "../api/axios";
import { getTargetPreview, generateTargetRoadmap } from "../api/targetRoadmap";
import { getCharacters } from "../api/characters";
import BodyFatModal from "../components/BodyFatModal";

export default function TargetRoadmap() {
  const allowedCharacters = [
    "Goku",
    "Toji Fushiguro",
    "Baki Hanma",
    "Broly",
    "Garou",
    "Yujiro Hanma",
    "Roronoa Zoro",
    "Yuji Itadori",
    "Tengen Uzui",
    "Levi Ackerman",
    "Rock Lee",
    "Might Guy",
    "Vegeta",
    "All Might",
    "Eren Yeager",
    "Gojo Satoru",
    "Maki Zenin",
    "Mikasa Ackerman",
    "Mirko",
    "Android 18",
  ];

  const [characters, setCharacters] = useState([]);

  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [gender, setGender] = useState("male");
  const [characterId, setCharacterId] = useState("");

  const [age, setAge] = useState("");
  const [experience, setExperience] = useState("beginner");
  const [trainingDays, setTrainingDays] = useState(5);
  const [timeline, setTimeline] = useState(6);

  const [preview, setPreview] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [error, setError] = useState("");
  const [loadingCharacters, setLoadingCharacters] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [loadingRoadmap, setLoadingRoadmap] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [disclaimer, setDisclaimer] = useState("");

  const filteredCharacters = characters.filter(
    (char) =>
      allowedCharacters.includes(char.name) &&
      String(char.gender).toLowerCase() === gender.toLowerCase()
  );

  const selectedCharacter = filteredCharacters.find(
    (character) => Number(character.id) === Number(characterId)
  );

  const selectedImage = selectedCharacter?.image_url || "/images/hero.png";

  useEffect(() => {
    const loadCharacters = async () => {
      try {
        setLoadingCharacters(true);
        const data = await getCharacters();
        setCharacters(data);
      } catch (err) {
        setError("Failed to load characters.");
      } finally {
        setLoadingCharacters(false);
      }
    };

    loadCharacters();
  }, []);

  useEffect(() => {
    if (filteredCharacters.length > 0) {
      setCharacterId(filteredCharacters[0].id);
    } else {
      setCharacterId("");
    }
  }, [gender, characters]);

  const handlePreview = async () => {
    if (!height || !weight || !bodyFat || !characterId) {
      setError("Please fill height, weight, body fat, and choose a character.");
      return;
    }

    try {
      setLoadingPreview(true);
      setError("");
      setRoadmap(null);

      const data = await getTargetPreview({
        character_id: Number(characterId),
        user_height_cm: Number(height),
        user_weight_kg: Number(weight),
        user_body_fat_percent: Number(bodyFat),
      });

      setPreview(data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to calculate closeness.");
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleGenerateRoadmap = async () => {
    if (!age) {
      setError("Please enter your age.");
      return;
    }

    try {
      setLoadingRoadmap(true);
      setError("");

      const data = await generateTargetRoadmap({
        character_id: Number(characterId),
        user_height_cm: Number(height),
        user_weight_kg: Number(weight),
        user_body_fat_percent: Number(bodyFat),
        user_age: Number(age),
        experience_level: experience,
        training_days: Number(trainingDays),
        target_timeline_months: Number(timeline),
      });

      setRoadmap(data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to generate roadmap.");
    } finally {
      setLoadingRoadmap(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!roadmap?.roadmap_id) {
      setError("Generate a roadmap first.");
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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,0.16),transparent_32%),radial-gradient(circle_at_85%_70%,rgba(6,182,212,0.12),transparent_30%)]" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <p className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/5 px-4 py-2 text-sm text-cyan-300">
            TRAIN LIKE YOUR ANIME HERO
          </p>

          <h1 className="mt-5 text-4xl md:text-6xl font-black tracking-tight">
            Target{" "}
            <span className="bg-gradient-to-r from-cyan-300 to-violet-400 bg-clip-text text-transparent">
              Physique Roadmap
            </span>
          </h1>

          <p className="mt-4 text-slate-400">
            Enter your stats, choose a character, check your closeness, and
            generate a realistic roadmap.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-8 shadow-2xl shadow-purple-500/10">
            <h2 className="text-2xl font-bold mb-6">Your Current Stats</h2>

            <div className="space-y-5">
              <input
                type="number"
                placeholder="Height (cm)"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/30 p-4 outline-none text-white transition focus:border-cyan-300/50"
              />

              <input
                type="number"
                placeholder="Weight (kg)"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/30 p-4 outline-none text-white transition focus:border-cyan-300/50"
              />

              <div>
                <input
                  type="number"
                  placeholder="Body Fat %"
                  value={bodyFat}
                  onChange={(e) => setBodyFat(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/30 p-4 outline-none text-white transition focus:border-cyan-300/50"
                />

                <div className="mt-3 flex items-center justify-between">
                  <p className="text-sm text-slate-400">
                    Don&apos;t know your body fat?
                  </p>

                  <button
                    type="button"
                    onClick={() => setOpenModal(true)}
                    className="text-sm font-semibold text-cyan-300 hover:text-cyan-200"
                  >
                    Calculate for me
                  </button>
                </div>

                {disclaimer && (
                  <p className="mt-3 rounded-2xl border border-yellow-400/20 bg-yellow-400/5 p-3 text-sm text-yellow-200">
                    ⚠ {disclaimer}
                  </p>
                )}
              </div>

              <select
                value={gender}
                onChange={(e) => {
                  setGender(e.target.value);
                  setCharacterId("");
                  setPreview(null);
                  setRoadmap(null);
                }}
                className="w-full rounded-2xl border border-white/10 bg-black/30 p-4 outline-none text-white transition focus:border-cyan-300/50"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>

              <select
                value={characterId}
                onChange={(e) => {
                  setCharacterId(e.target.value);
                  setPreview(null);
                  setRoadmap(null);
                }}
                className="w-full rounded-2xl border border-white/10 bg-black/30 p-4 outline-none text-white transition focus:border-cyan-300/50"
              >
                {loadingCharacters && <option>Loading characters...</option>}

                {!loadingCharacters &&
                  filteredCharacters.map((char) => (
                    <option key={char.id} value={char.id}>
                      {char.name} - {char.anime}
                    </option>
                  ))}

                {!loadingCharacters && filteredCharacters.length === 0 && (
                  <option value="">No characters available</option>
                )}
              </select>

              <button
                onClick={handlePreview}
                disabled={
                  loadingPreview ||
                  !height ||
                  !weight ||
                  !bodyFat ||
                  !characterId
                }
                className="w-full rounded-2xl bg-cyan-400 px-7 py-4 font-bold text-[#050816] transition hover:bg-cyan-300 disabled:opacity-50"
              >
                {loadingPreview ? "Checking Closeness..." : "Check Closeness"}
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-8 shadow-2xl shadow-cyan-500/10 overflow-hidden">
            <h2 className="text-2xl font-bold mb-6">Target Character</h2>

            <div className="relative min-h-[500px] flex items-center justify-center overflow-hidden rounded-3xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.35),transparent_42%)]" />
              <div className="absolute h-[430px] w-[430px] rounded-full bg-cyan-400/35 blur-[85px]" />
              <div className="absolute h-[330px] w-[330px] rounded-full bg-violet-500/35 blur-[90px]" />
              <div className="absolute bottom-8 h-[95px] w-[360px] rounded-full bg-cyan-300/25 blur-[45px]" />

              {selectedCharacter ? (
                <img
                  src={selectedImage}
                  alt={selectedCharacter.name}
                  className="float-character relative z-20 max-h-[470px] object-contain drop-shadow-[0_0_55px_rgba(34,211,238,0.95)] transition-all duration-500 hover:scale-105"
                />
              ) : (
                <p className="relative z-20 text-slate-400">
                  Choose a character
                </p>
              )}
            </div>

            {selectedCharacter && (
              <div className="mt-6 rounded-2xl border border-white/10 bg-black/25 p-5">
                <h3 className="text-2xl font-black">
                  {selectedCharacter.name}
                </h3>

                <p className="mt-1 text-slate-400">
                  {selectedCharacter.anime}
                </p>

                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-slate-400">Difficulty</p>

                  <p className="font-bold capitalize text-cyan-300">
                    {selectedCharacter.difficulty}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {preview && (
          <div className="mt-8 rounded-3xl border border-cyan-400/20 bg-cyan-400/5 backdrop-blur-xl p-8 shadow-2xl shadow-cyan-500/10">
            <div className="grid md:grid-cols-[1fr_auto] gap-6 items-center">
              <div>
                <p className="text-sm text-cyan-300">Closeness Score</p>

                <h3 className="mt-2 text-5xl font-black text-cyan-300">
                  {preview.closeness_percent}%
                </h3>

                <p className="mt-3 text-2xl font-bold">
                  {preview.character_name}
                </p>

                <p className="mt-2 text-slate-400">{preview.message}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/25 p-5 min-w-[160px]">
                <p className="text-sm text-slate-400">Difficulty</p>

                <p className="mt-2 font-black capitalize text-white">
                  {preview.difficulty}
                </p>
              </div>
            </div>
          </div>
        )}

        {preview && (
          <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-8 shadow-2xl shadow-purple-500/10">
            <h2 className="text-2xl font-bold mb-2">Roadmap Setup</h2>

            <p className="mb-6 text-slate-400">
              We will decide whether you should cut, lean bulk, or recomp based
              on your stats and target physique.
            </p>

            <div className="grid md:grid-cols-4 gap-5">
              <input
                type="number"
                placeholder="Age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/30 p-4 outline-none text-white transition focus:border-cyan-300/50"
              />

              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/30 p-4 outline-none text-white transition focus:border-cyan-300/50"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>

              <select
                value={trainingDays}
                onChange={(e) => setTrainingDays(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/30 p-4 outline-none text-white transition focus:border-cyan-300/50"
              >
                <option value={3}>3 Days / Week</option>
                <option value={4}>4 Days / Week</option>
                <option value={5}>5 Days / Week</option>
                <option value={6}>6 Days / Week</option>
              </select>

              <select
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/30 p-4 outline-none text-white transition focus:border-cyan-300/50"
              >
                <option value={4}>4 Months</option>
                <option value={6}>6 Months</option>
                <option value={9}>9 Months</option>
                <option value={12}>1 Year</option>
                <option value={24}>2 Years</option>
              </select>
            </div>

            <button
              onClick={handleGenerateRoadmap}
              disabled={loadingRoadmap || !age}
              className="mt-6 w-full rounded-2xl bg-cyan-400 px-7 py-4 font-bold text-[#050816] transition hover:bg-cyan-300 disabled:opacity-50"
            >
              {loadingRoadmap ? "Generating Roadmap..." : "Generate Roadmap"}
            </button>
          </div>
        )}

        {error && (
          <p className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/5 p-4 text-red-300">
            {error}
          </p>
        )}

        {roadmap && (
          <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-8 shadow-2xl shadow-cyan-500/10">
            <h2 className="text-4xl font-black">{roadmap.character_name}</h2>

            <p className="mt-2 text-slate-400">{roadmap.anime}</p>

            <div className="mt-8 whitespace-pre-wrap leading-8 text-slate-200">
              {roadmap.roadmap_text}
            </div>

            <button
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              className="mt-8 rounded-2xl bg-cyan-400 px-6 py-4 font-bold text-[#050816] transition hover:bg-cyan-300 disabled:opacity-50"
            >
              {downloadingPdf ? "Generating PDF..." : " Download PDF"}
            </button>
          </div>
        )}
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
          setAge(String(data.age));
          setGender(data.gender || gender);
        }}
      />
    </div>
  );
}