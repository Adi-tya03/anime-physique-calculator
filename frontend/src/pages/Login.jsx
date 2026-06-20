import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function EyeIcon({ open }) {
  return open ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
}

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("username", email);
      formData.append("password", password);

      const response = await axios.post(
        "https://anime-physique-calculator.onrender.com/auth/login",
        formData
      );

      const token = response.data.access_token;
      localStorage.setItem("token", token);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.detail || "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Enter your email above first, then click Forgot Password.");
      return;
    }
    setForgotLoading(true);
    setError("");
    try {
      await axios.post(
        "https://anime-physique-calculator.onrender.com/auth/forgot-password",
        { email }
      );
      setForgotSent(true);
    } catch (err) {
      setError(err.response?.data?.detail || "Could not send reset email. Try again.");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] flex justify-center items-center px-6">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 shadow-2xl shadow-purple-500/20">
        <h1 className="text-white text-4xl font-bold text-center mb-8">Login</h1>

        {forgotSent ? (
          <div className="text-center space-y-4">
            <div className="text-5xl">📧</div>
            <h2 className="text-white text-xl font-bold">Check your email</h2>
            <p className="text-gray-400 text-sm">
              We sent a password reset link to <span className="text-purple-400">{email}</span>.
              Check your inbox (and spam folder).
            </p>
            <button
              onClick={() => setForgotSent(false)}
              className="text-purple-400 hover:text-purple-300 text-sm"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-5">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 rounded-2xl bg-white/10 text-white outline-none placeholder-gray-400"
              required
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 pr-12 rounded-2xl bg-white/10 text-white outline-none placeholder-gray-400"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>

            <div className="text-right">
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={forgotLoading}
                className="text-sm text-purple-400 hover:text-purple-300 transition disabled:opacity-50"
              >
                {forgotLoading ? "Sending..." : "Forgot Password?"}
              </button>
            </div>

            {error && <p className="text-red-400 text-center text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-500 rounded-2xl py-4 text-white font-semibold transition duration-300 disabled:opacity-50"
            >
              {loading ? "Logging In..." : "Login"}
            </button>

            <div className="text-center">
              <p className="text-gray-400">
                New User?{" "}
                <Link to="/register" className="text-purple-400 hover:text-purple-300">
                  Register
                </Link>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
