import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export function Navbar() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? "glass-strong shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-shadow duration-300">
            <svg className="w-4 h-4 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <span className="font-bold text-lg tracking-tight">On My Way</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to="/create"
            className={`btn-primary text-sm !px-4 !py-2 ${
              location.pathname === "/create" ? "ring-2 ring-primary/50" : ""
            }`}
          >
            Create Room
          </Link>
          <Link
            to="/join"
            className={`btn-ghost text-sm ${
              location.pathname === "/join" ? "text-text bg-white/[0.04]" : ""
            }`}
          >
            Join
          </Link>
        </div>
      </div>
    </nav>
  );
}
