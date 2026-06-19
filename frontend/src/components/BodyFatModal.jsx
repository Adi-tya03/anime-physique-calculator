import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { estimateBodyFat } from "../api/bodyfat";

export default function BodyFatModal({
  isOpen,
  onClose,
  onEstimate,
  initialHeight = "",
  initialWeight = "",
  initialGender = "male",
}) {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("male");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setHeight(initialHeight || "");
      setWeight(initialWeight || "");
      setGender(initialGender || "male");
      setError("");
    }
  }, [isOpen, initialHeight, initialWeight, initialGender]);

  if (!isOpen) return null;

  const handleEstimate = async () => {
    if (!height || !weight || !age) {
      setError("Please fill all fields.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await estimateBodyFat({
        height_cm: Number(height),
        weight_kg: Number(weight),
        age: Number(age),
        gender,
      });

      onEstimate({
        ...data,
        age,
        gender,
        });
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Failed to estimate body fat."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
        fixed
        inset-0
        bg-black/70
        backdrop-blur-sm
        flex
        justify-center
        items-center
        z-50
        px-4
      "
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.85 }}
        className="
          w-full
          max-w-md
          rounded-3xl
          bg-white/5
          border
          border-white/10
          backdrop-blur-xl
          p-8
          text-white
          shadow-2xl
          shadow-purple-500/20
        "
      >
        <h2
          className="
            text-3xl
            font-bold
            text-center
            mb-8
          "
        >
          ⚔ Estimate Body Fat
        </h2>

        <div className="space-y-4">
          <input
            type="number"
            placeholder="Height (cm)"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className="
              w-full
              bg-black/30
              rounded-xl
              p-4
              outline-none
              border
              border-white/10
            "
          />

          <input
            type="number"
            placeholder="Weight (kg)"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="
              w-full
              bg-black/30
              rounded-xl
              p-4
              outline-none
              border
              border-white/10
            "
          />

          <input
            type="number"
            placeholder="Age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="
              w-full
              bg-black/30
              rounded-xl
              p-4
              outline-none
              border
              border-white/10
            "
          />

          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="
              w-full
              bg-black/30
              rounded-xl
              p-4
              outline-none
              border
              border-white/10
            "
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>

          {error && (
            <p className="text-red-400 text-sm">
              {error}
            </p>
          )}

          <button
            onClick={handleEstimate}
            disabled={loading}
            className="
              w-full
              bg-purple-600
              hover:bg-purple-500
              rounded-xl
              py-4
              font-semibold
              transition
              disabled:opacity-50
            "
          >
            {loading ? "Estimating..." : "Estimate"}
          </button>

          <button
            onClick={onClose}
            className="
              w-full
              mt-3
              text-gray-400
            "
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
}