"use client";

import { useState, useEffect } from "react";

const NAV_LINKS = [
  { label: "À propos", href: "#a-propos" },
  { label: "Cours", href: "#cours" },
  { label: "Horaires", href: "#horaires" },
  { label: "Tarifs", href: "#tarifs" },
  { label: "Contact", href: "#contact" },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const isLight = !scrolled && !open;

  return (
    <>
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        open ? "bg-transparent" : scrolled ? "bg-white/97 backdrop-blur-sm border-b border-[var(--border)]" : "bg-transparent"
      }`}>
        <div className="px-8 md:px-12 h-16 md:h-20 flex items-center justify-between">

          {/* Logo */}
          <a href="#" className="z-10 flex flex-col leading-none select-none">
            <span className={`font-serif text-2xl md:text-[1.6rem] italic transition-colors duration-500 ${
              isLight ? "text-white" : "text-[var(--text)]"
            }`}>
              Amarte
            </span>
            <span className={`text-[8px] tracking-[0.32em] uppercase font-light transition-colors duration-500 ${
              isLight ? "text-white/60" : "text-[var(--text-muted)]"
            }`}>
              Épalinges
            </span>
          </a>

          {/* Hamburger / Croix */}
          <button
            onClick={() => setOpen(!open)}
            aria-label={open ? "Fermer" : "Menu"}
            className="z-10 relative w-8 h-8 flex items-center justify-center"
          >
            {/* Barre 1 */}
            <span className={`absolute block w-6 h-px transition-all duration-500 ease-in-out ${
              open
                ? "rotate-45 bg-[var(--text)]"
                : isLight ? "bg-white -translate-y-[5px]" : "bg-[var(--text)] -translate-y-[5px]"
            }`} />
            {/* Barre 2 */}
            <span className={`absolute block h-px transition-all duration-300 ease-in-out ${
              open
                ? "w-0 opacity-0 bg-[var(--text)]"
                : isLight ? "w-4 bg-white opacity-100" : "w-4 bg-[var(--text)] opacity-100"
            }`} />
            {/* Barre 3 */}
            <span className={`absolute block w-6 h-px transition-all duration-500 ease-in-out ${
              open
                ? "-rotate-45 bg-[var(--text)]"
                : isLight ? "bg-white translate-y-[5px]" : "bg-[var(--text)] translate-y-[5px]"
            }`} />
          </button>
        </div>
      </header>

      {/* Overlay menu plein écran */}
      <div className={`fixed inset-0 z-40 bg-[#F7F3EE] flex flex-col transition-all duration-600 ease-in-out ${
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}>
        {/* Ligne verticale déco */}
        <div className="absolute left-0 top-0 bottom-0 w-px bg-[var(--border)]" style={{ left: "5rem" }} />

        <nav className="flex flex-col justify-center flex-1 pl-24 md:pl-40 pr-10 pt-24 pb-10 gap-0">
          {NAV_LINKS.map((l, i) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="group relative flex items-center justify-between py-5 border-b border-[var(--border)] overflow-hidden"
              style={{
                opacity: open ? 1 : 0,
                transform: open ? "translateY(0)" : "translateY(12px)",
                transition: `opacity 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 55}ms, transform 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 55}ms`,
              }}
            >
              {/* Numéro */}
              <span className="text-[10px] tracking-[0.2em] text-[var(--text-muted)] font-light w-10 shrink-0">
                0{i + 1}
              </span>

              {/* Label avec underline animé au hover */}
              <span className="relative font-serif text-[clamp(2rem,4.5vw,3.2rem)] italic text-[var(--text)] leading-none flex-1">
                {l.label}
                {/* Trait qui slide de gauche à droite au hover */}
                <span className="absolute bottom-0 left-0 h-px bg-[var(--accent)] w-0 group-hover:w-full transition-all duration-500 ease-in-out" />
              </span>

              {/* Flèche qui se décale au hover */}
              <span className="text-[var(--accent)] text-base font-light transition-transform duration-300 group-hover:translate-x-1 opacity-0 group-hover:opacity-100">
                →
              </span>
            </a>
          ))}
        </nav>

        {/* Bas du menu */}
        <div
          className="pl-24 md:pl-40 pr-10 pb-10 flex flex-col sm:flex-row items-start sm:items-center gap-6"
          style={{
            opacity: open ? 1 : 0,
            transform: open ? "translateY(0)" : "translateY(10px)",
            transition: `opacity 0.5s ease ${NAV_LINKS.length * 55 + 80}ms, transform 0.5s ease ${NAV_LINKS.length * 55 + 80}ms`,
          }}
        >
          <a
            href="#cours"
            onClick={() => setOpen(false)}
            className="text-[11px] tracking-[0.2em] uppercase bg-[var(--text)] text-white px-8 py-3.5 hover:bg-[var(--accent)] transition-colors duration-300 font-light"
          >
            Réserver un cours
          </a>
          <p className="text-[11px] text-[var(--text-muted)] font-light">
            +41 78 810 64 64 · info@amarte.ch
          </p>
        </div>
      </div>
    </>
  );
}
