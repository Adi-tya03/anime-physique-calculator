import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Navbar() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) return;

      try {
        const response = await api.get("/auth/me");
        setUser(response.data);
      } catch (error) {
        console.log(error);
        localStorage.removeItem("token");
        setUser(null);
      }
    };

    fetchUser();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setOpenDropdown(false);
    navigate("/");
    window.location.reload();
  };

  const initials = user?.username
    ? user.username
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
    : "U";

  return (
    <nav className="fixed top-0 left-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-8 py-4 backdrop-blur-xl">
          <Link
            to="/"
            className="text-2xl font-bold tracking-wider text-white"
          >
            ANIME PHYSIQUE
          </Link>

          <div className="flex items-center gap-7 text-gray-300">
            <Link to="/" className="transition hover:text-cyan-300">
              Home
            </Link>

            <Link to="/calculator" className="transition hover:text-cyan-300">
              Calculator
            </Link>

            <Link
              to="/target-roadmap"
              className="transition hover:text-cyan-300"
            >
              Train Like Character
            </Link>

            <Link to="/roadmap" className="transition hover:text-cyan-300">
              Roadmap
            </Link>

            {token ? (
              <div className="relative">
                <button
                  onClick={() => setOpenDropdown(!openDropdown)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 font-bold text-[#050816] shadow-lg transition hover:scale-105"
                >
                  {initials}
                </button>

                {openDropdown && (
                  <div className="absolute right-0 mt-3 w-56 overflow-hidden rounded-2xl border border-white/10 bg-[#111827] shadow-2xl">
                    <div className="flex items-center gap-3 border-b border-white/10 p-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 font-bold text-[#050816]">
                        {initials}
                      </div>

                      <div>
                        <p className="font-semibold text-white">
                          {user?.username || "User"}
                        </p>
                        <p className="text-xs text-slate-400">
                          {user?.email || ""}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-3 text-left text-red-400 transition hover:bg-white/10"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="transition hover:text-cyan-300">
                  Login
                </Link>

                <Link
                  to="/register"
                  className="rounded-xl bg-cyan-400 px-5 py-2 font-semibold text-[#050816] transition hover:bg-cyan-300"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}