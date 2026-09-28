import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Layers, Cpu, Plus, Sun, Moon, Bot } from 'lucide-react';

export default function Navbar({ onOpenRegister, onOpenAiModal }) {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mounted,  setMounted]  = useState(false);
  const [theme, setTheme] = useState(
    () => localStorage.getItem('trustledger-theme') || 'dark'
  );

  const isActive = (path) => location.pathname === path;

  /* page-load entrance */
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  /* theme */
  useEffect(() => {
    const root = document.documentElement;
    theme === 'dark' ? root.classList.add('dark') : root.classList.remove('dark');
    localStorage.setItem('trustledger-theme', theme);
  }, [theme]);

  /* scroll — updates on every crossing of 24px */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleTheme = () => setTheme(p => (p === 'dark' ? 'light' : 'dark'));

  return (
    /* outer wrapper — page-load slide-down entrance */
    <div className={`nav-outer sticky top-0 z-50 flex justify-center px-4 pt-3 pb-2 ${mounted ? 'is-visible' : 'is-hidden'}`}>

      {/* inner bar — re-transitions every time scrolled changes */}
      <header
        className={`
          nav-bar-inner
          w-full max-w-5xl
          rounded-2xl
          border
          backdrop-blur-2xl
          overflow-hidden
          ${scrolled
            ? 'is-scrolled bg-gray-800/75 dark:bg-gray-950/82 border-gray-600/50 dark:border-gray-700/50'
            : 'bg-gray-700/50 dark:bg-gray-900/50 border-gray-500/30 dark:border-gray-700/30'
          }
        `}
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-8 right-8 h-[1.5px] rounded-full bg-gradient-to-r from-transparent via-emerald-400/45 to-transparent pointer-events-none" />

        <div className={`flex items-center justify-between gap-4 px-4 sm:px-5 transition-all duration-300 ${scrolled ? 'h-11' : 'h-[52px]'}`}>

          {/* ── LEFT: brand ── */}
          <Link to="/" className="flex items-center gap-2.5 group nav-brand shrink-0">
            {/* logo mark */}
            <div className="relative w-7 h-7 rounded-xl bg-emerald-500 flex items-center justify-center
              shadow-md shadow-emerald-500/40
              group-hover:shadow-emerald-400/60 group-hover:scale-105
              transition-all duration-200">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/25 to-transparent pointer-events-none" />
              <span className="relative text-white font-black text-[11px] tracking-tight">TL</span>
            </div>

            <div className="flex items-baseline gap-2">
              {/* italic brand name — always gray-100 since bar is always dark-ish */}
              <span className={`font-bold italic tracking-tight text-gray-100 transition-all duration-300 ${scrolled ? 'text-[12px]' : 'text-[13px]'}`}>
                TrustLedger
              </span>
              <span className="hidden sm:block not-italic text-[9px] font-semibold px-1.5 py-0.5 rounded-lg
                bg-gray-600/60 text-gray-400 border border-gray-500/40 uppercase tracking-widest">
                Fabric
              </span>
            </div>
          </Link>

          {/* ── CENTER: nav tabs ── */}
          <nav className="hidden md:flex items-center bg-gray-600/30 rounded-xl border border-gray-500/25 p-[3px] gap-0.5">
            {[
              { to: '/',    icon: <Layers className="w-3.5 h-3.5" />, label: 'Dashboard'     },
              { to: '/iot', icon: <Cpu    className="w-3.5 h-3.5" />, label: 'IoT Telemetry' },
            ].map(({ to, icon, label }) => (
              <Link
                key={to}
                to={to}
                className={`relative flex items-center gap-1.5 px-4 py-[7px] rounded-xl text-[12px] font-semibold italic transition-all duration-200 ${
                  isActive(to)
                    ? 'bg-gray-500/70 text-gray-100 shadow-sm shadow-black/20 border border-gray-400/25'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-500/35'
                }`}
              >
                {/* active dot indicator */}
                {isActive(to) && (
                  <span className="absolute bottom-[3px] left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-400" />
                )}
                {icon}
                {label}
              </Link>
            ))}
          </nav>

          {/* ── RIGHT: actions ── */}
          <div className="flex items-center gap-2 shrink-0">

            {/* live pill */}
            <div className="hidden lg:flex items-center gap-1.5 text-[10px] font-mono
              text-gray-400 bg-gray-600/30 px-2.5 py-1 rounded-full border border-gray-500/25">
              <span className="relative flex w-1.5 h-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-55" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              Live
            </div>

            {/* theme toggle */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              className="w-8 h-8 flex items-center justify-center rounded-xl
                border border-gray-500/35 bg-gray-600/40
                hover:bg-gray-500/55 hover:border-gray-400/55
                text-gray-300 transition-all duration-200 cursor-pointer active:scale-90"
            >
              {theme === 'dark'
                ? <Sun  className="w-3.5 h-3.5 text-amber-400" />
                : <Moon className="w-3.5 h-3.5 text-gray-200" />}
            </button>

            {/* AI Ingest */}
            {onOpenAiModal && (
              <button
                onClick={onOpenAiModal}
                className="hidden sm:flex items-center gap-1.5 h-8 px-3 rounded-xl text-[12px] font-semibold italic
                  border border-violet-400/30 bg-violet-500/15
                  hover:bg-violet-500/25 hover:border-violet-400/50
                  text-violet-300 transition-all duration-200 cursor-pointer active:scale-95"
              >
                <Bot className="w-3.5 h-3.5 not-italic" />
                AI Ingest
              </button>
            )}

            {/* Register */}
            {onOpenRegister && (
              <button
                onClick={onOpenRegister}
                className="relative flex items-center gap-1.5 h-8 px-3.5 rounded-xl text-[12px] font-bold italic
                  bg-emerald-600 hover:bg-emerald-500
                  text-white shadow-md shadow-emerald-600/30 hover:shadow-emerald-500/50
                  transition-all duration-200 cursor-pointer active:scale-95 overflow-hidden group"
              >
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full
                  transition-transform duration-500
                  bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
                <Plus className="w-3.5 h-3.5 not-italic transition-transform duration-200 group-hover:rotate-90" />
                Register
              </button>
            )}
          </div>

        </div>
      </header>
    </div>
  );
}
