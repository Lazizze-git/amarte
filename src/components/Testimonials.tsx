"use client";

import { useState, useRef, useEffect } from "react";

interface Testimonial {
  text: string;
  author: string;
  detail: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    text: "Une expérience fantastique. L'accueil est chaleureux, l'espace est spacieux et les installations sont entièrement neuves. Je me sens vraiment chez moi.",
    author: "Sophie M.",
    detail: "Membre depuis 6 mois · Yoga Flow",
  },
  {
    text: "J'avais peur de ne pas être au niveau. Mais les enseignants proposent toujours des adaptations. Pour la première fois, j'ai trouvé un cours vraiment accessible.",
    author: "Laurent D.",
    detail: "Membre depuis 3 mois · Pilates",
  },
  {
    text: "Ce que j'apprécie chez Amarte, c'est l'absence de compétition. On vient pour soi, pas pour performer. Cette ambiance est rare.",
    author: "Nathalie R.",
    detail: "Membre depuis 1 an · Tous cours",
  },
  {
    text: "J'ai commencé avec le pack Découverte. Deux semaines plus tard, j'ai pris l'abonnement mensuel. Amarte m'a redonné le goût du mouvement.",
    author: "Isabelle C.",
    detail: "Membre depuis 8 mois · Yoga & Bien-être",
  },
];

export default function Testimonials() {
  const [current, setCurrent] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
          obs.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    el.style.opacity = "0";
    el.style.transform = "translateY(24px)";
    el.style.transition = "opacity 0.7s ease-out, transform 0.7s ease-out";
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const t = TESTIMONIALS[current];

  return (
    <section className="py-16 md:py-28 bg-white border-t border-[var(--border)]">
      <div ref={ref} className="max-w-6xl mx-auto px-5 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10 md:mb-14">
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-[var(--accent)] font-light mb-4">
              06 — Témoignages
            </p>
            <h2 className="font-serif text-[clamp(2rem,6vw,4rem)] leading-[1.1] text-[var(--text)]">
              Ce qu&rsquo;ils disent <em>d&rsquo;Amarte.</em>
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrent((c) => (c === 0 ? TESTIMONIALS.length - 1 : c - 1))}
              className="w-10 h-10 border border-[var(--border)] flex items-center justify-center text-[var(--text)] hover:border-[var(--text)] hover:bg-[var(--text)] hover:text-white transition-all duration-200 text-sm"
              aria-label="Précédent"
            >
              ←
            </button>
            <span className="text-[11px] text-[var(--text-muted)] font-light w-12 text-center">
              {current + 1} / {TESTIMONIALS.length}
            </span>
            <button
              onClick={() => setCurrent((c) => (c === TESTIMONIALS.length - 1 ? 0 : c + 1))}
              className="w-10 h-10 border border-[var(--border)] flex items-center justify-center text-[var(--text)] hover:border-[var(--text)] hover:bg-[var(--text)] hover:text-white transition-all duration-200 text-sm"
              aria-label="Suivant"
            >
              →
            </button>
          </div>
        </div>

        <div className="min-h-[160px] md:min-h-[140px]">
          <blockquote
            key={current}
            className="font-serif text-[clamp(1.25rem,3.5vw,2.25rem)] leading-[1.3] text-[var(--text)] italic max-w-4xl"
            style={{ animation: "fadeSlide 0.4s ease-out" }}
          >
            &ldquo;{t.text}&rdquo;
          </blockquote>
          <div className="mt-6">
            <p className="text-sm text-[var(--text)] font-light">{t.author}</p>
            <p className="text-[10px] tracking-[0.15em] uppercase text-[var(--text-muted)] font-light mt-1">
              {t.detail}
            </p>
          </div>
        </div>

        {/* Indicateurs */}
        <div className="flex gap-2 mt-8">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-px transition-all duration-300 ${
                i === current ? "w-8 bg-[var(--text)]" : "w-3 bg-[var(--border)]"
              }`}
              aria-label={`Témoignage ${i + 1}`}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateX(16px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </section>
  );
}
