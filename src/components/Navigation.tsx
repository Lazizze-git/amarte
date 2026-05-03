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
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-sm border-b border-[var(--border)]"
            : "bg-white/80 backdrop-blur-sm"
        }`}
      >
        <div className="max-w-6xl mx-auto px-5 md:px-8 h-14 md:h-16 flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex flex-col leading-none">
            <span className="font-serif text-xl md:text-2xl text-[var(--text)] italic">
              Amarte
            </span>
            <span className="text-[10px] tracking-[0.25em] uppercase text-[var(--text-muted)] font-light">
              Épalinges
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-[12px] tracking-[0.12em] uppercase text-[var(--text-muted)] hover:text-[var(--text)] transition-colors duration-200 font-light"
              >
                {l.label}
              </a>
            ))}
            <a
              href="#cours"
              className="text-[12px] tracking-[0.12em] uppercase bg-[var(--text)] text-white px-5 py-2.5 hover:bg-[var(--accent)] transition-colors duration-200 font-light"
            >
              Réserver
            </a>
          </nav>

          {/* Mobile burger */}
          <button
            onClick={() => setOpen(!open)}
            aria-label="Menu"
            className="md:hidden flex flex-col justify-center gap-[5px] w-10 h-10 -mr-2"
          >
            <span
              className={`block h-px bg-[var(--text)] transition-all duration-300 origin-center ${
                open ? "w-6 rotate-45 translate-y-[6px]" : "w-6"
              }`}
            />
            <span
              className={`block h-px bg-[var(--text)] transition-all duration-300 ${
                open ? "w-0 opacity-0" : "w-4"
              }`}
            />
            <span
              className={`block h-px bg-[var(--text)] transition-all duration-300 origin-center ${
                open ? "w-6 -rotate-45 -translate-y-[6px]" : "w-5"
              }`}
            />
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 z-40 bg-white flex flex-col justify-between transition-all duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex flex-col justify-center flex-1 px-5 pt-20 pb-10">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((l, i) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="font-serif text-4xl italic text-[var(--text)] py-3 border-b border-[var(--border)] flex items-center justify-between"
                style={{ transitionDelay: `${i * 40}ms` }}
              >
                {l.label}
                <span className="text-[var(--accent)] text-2xl not-italic font-light font-sans">→</span>
              </a>
            ))}
          </nav>
          <a
            href="#cours"
            onClick={() => setOpen(false)}
            className="mt-8 text-center text-[11px] tracking-[0.15em] uppercase bg-[var(--text)] text-white py-4 hover:bg-[var(--accent)] transition-colors duration-200 font-light"
          >
            Réserver un cours
          </a>
        </div>
        <div className="px-5 pb-8">
          <p className="text-[11px] text-[var(--text-muted)] font-light">
            +41 78 810 64 64 · info@amarte.ch
          </p>
        </div>
      </div>
    </>
  );
}
