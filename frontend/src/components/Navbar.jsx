import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Navbar() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) return;
      try {
        const response = await api.get("/auth/me");
        setUser(response.data);
      } catch (error) {
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
    setMobileOpen(false);
    navigate("/");
    window.location.reload();
  };

  const initials = user?.username
    ? user.username.split(" ").map((w) => w[0]).join("").toUpperCase()
    : "U";

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/calculator", label: "Calculator" },
    { to: "/target-roadmap", label: "Train Like Character" },
    { to: "/roadmap", label: "Roadmap" },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur-xl">

          {/* Logo */}
          <Link to="/" className="text-xl md:text-2xl font-bold tracking-wider text-white">
            ANIME PHYSIQUE
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-7 text-gray-300">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to} className="transition hover:text-cyan-300 whitespace-nowrap">
                {link.label}
              </Link>
            ))}

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
                        <p className="font-semibold text-white">{user?.username || "User"}</p>
                        <p className="text-xs text-slate-400">{user?.email || ""}</p>
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
                <Link to="/login" className="transition hover:text-cyan-300">Login</Link>
                <Link to="/register" className="rounded-xl bg-cyan-400 px-5 py-2 font-semibold text-[#050816] transition hover:bg-cyan-300">
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile: avatar + hamburger */}
          <div className="flex md:hidden items-center gap-3">
            {token && (
              <button
                onClick={() => setOpenDropdown(!openDropdown)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 font-bold text-[#050816] text-sm"
              >
                {initials}
              </button>
            )}

            {/* Hamburger button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex flex-col gap-1.5 p-2 text-white"
            >
              <span className={`block h-0.5 w-6 bg-white transition-all duration-300 ${mobileOpen ? "translate-y-2 rotate-45" : ""}`} />
              <span className={`block h-0.5 w-6 bg-white transition-all duration-300 ${mobileOpen ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 w-6 bg-white transition-all duration-300 ${mobileOpen ? "-translate-y-2 -rotate-45" : ""}`} />
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileOpen && (
          <div className="md:hidden mt-2 rounded-2xl border border-white/10 bg-[#0a0f1e]/95 backdrop-blur-xl overflow-hidden">

            {/* User info if logged in */}
            {token && user && (
              <div className="flex items-center gap-3 border-b border-white/10 px-6 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 font-bold text-[#050816]">
                  {initials}
                </div>
                <div>
                  <p className="font-semibold text-white">{user.username}</p>
                  <p className="text-xs text-slate-400">{user.email}</p>
                </div>
              </div>
            )}

            {/* Nav links */}
            <div className="flex flex-col">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="px-6 py-4 text-gray-300 hover:text-cyan-300 hover:bg-white/5 transition border-b border-white/5"
                >
                  {link.label}
                </Link>
              ))}

              {token ? (
                <button
                  onClick={handleLogout}
                  className="px-6 py-4 text-left text-red-400 hover:bg-white/5 transition"
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="px-6 py-4 text-gray-300 hover:text-cyan-300 hover:bg-white/5 transition border-b border-white/5"
                  >
                    Login
                  </Link>
                  <div className="px-6 py-4">
                    <Link
                      to="/register"
                      onClick={() => setMobileOpen(false)}
                      className="block w-full text-center rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-[#050816] transition hover:bg-cyan-300"
                    >
                      Register
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
