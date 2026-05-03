"use client";

import { useRef, useEffect } from "react";

interface ClassItem {
  number: string;
  title: string;
  subtitle: string;
  description: string;
  duration: string;
  level: string;
}

const CLASSES: ClassItem[] = [
  {
    number: "01",
    title: "Yoga Flow",
    subtitle: "Dynamique & Libérateur",
    description:
      "Un yoga fluide qui harmonise force et souplesse. Chaque séance renforce le corps tout en apaisant l'esprit. Des variations proposées à chaque cours.",
    duration: "60 min",
    level: "Tous niveaux",
  },
  {
    number: "02",
    title: "Pilates",
    subtitle: "Renforcement & Équilibre",
    description:
      "Méthode profonde de renforcement musculaire centrée sur la posture et la coordination. Des résultats visibles en quelques semaines.",
    duration: "60 min",
    level: "Tous niveaux",
  },
  {
    number: "03",
    title: "Méditation",
    subtitle: "Pleine conscience",
    description:
      "Séances guidées pour cultiver la présence. Respiration, visualisation, scan corporel. Un ancrage indispensable dans votre semaine.",
    duration: "45 min",
    level: "Débutants bienvenus",
  },
  {
    number: "04",
    title: "Bien-être",
    subtitle: "Holistique & Doux",
    description:
      "Mouvements thérapeutiques, étirements profonds et relaxation guidée. Parfait pour la récupération et la reconnexion corps-esprit.",
    duration: "60 min",
    level: "Tous niveaux",
  },
];

function ClassCard({ cls, delay }: { cls: ClassItem; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setTimeout(() => {
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
          }, delay);
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    el.style.opacity = "0";
    el.style.transform = "translateY(16px)";
    el.style.transition = "opacity 0.6s ease-out, transform 0.6s ease-out";
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className="flex flex-col gap-4 py-8 border-t border-[var(--border)] group"
    >
      <div className="flex items-start justify-between gap-4">
        <span className="font-serif text-4xl text-[var(--border)] leading-none group-hover:text-[var(--accent)]/30 transition-colors duration-300">
          {cls.number}
        </span>
        <div className="flex gap-2 pt-1 shrink-0">
          <span className="text-[10px] tracking-[0.1em] uppercase text-[var(--text-muted)] font-light border border-[var(--border)] px-2 py-1">
            {cls.duration}
          </span>
          <span className="hidden sm:inline text-[10px] tracking-[0.1em] uppercase text-[var(--text-muted)] font-light border border-[var(--border)] px-2 py-1">
            {cls.level}
          </span>
        </div>
      </div>

      <div>
        <h3 className="font-serif text-2xl md:text-3xl text-[var(--text)] leading-tight">
          {cls.title}
        </h3>
        <p className="text-[11px] tracking-[0.18em] uppercase text-[var(--accent)] font-medium mt-1">
          {cls.subtitle}
        </p>
      </div>

      <p className="text-[15px] text-[var(--text-muted)] font-light leading-relaxed">
        {cls.description}
      </p>

      <a
        href="#horaires"
        className="self-start text-[11px] tracking-[0.1em] uppercase font-medium text-[var(--text)] flex items-center gap-2 hover:text-[var(--accent)] transition-colors duration-200"
      >
        Voir les horaires <span>→</span>
      </a>
    </div>
  );
}

export default function Classes() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    el.style.opacity = "0";
    el.style.transform = "translateY(16px)";
    el.style.transition = "opacity 0.7s ease-out, transform 0.7s ease-out";
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="cours" className="bg-[var(--bg-soft)] py-14 md:py-24">
      <div className="max-w-5xl mx-auto px-5 md:px-8">
        <div ref={ref} className="mb-4 md:mb-8">
          <p className="text-[11px] tracking-[0.3em] uppercase text-[var(--accent)] font-light mb-4">
            03 — Disciplines
          </p>
          <h2 className="font-serif text-[clamp(2rem,5.5vw,3.5rem)] leading-[1.1] text-[var(--text)] max-w-lg">
            Chaque cours, <em>une invitation à revenir à soi.</em>
          </h2>
        </div>

        {/* 2 colonnes sur mobile aussi — lisible car peu de texte par carte */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 md:gap-x-16">
          {CLASSES.map((cls, i) => (
            <ClassCard key={cls.number} cls={cls} delay={i * 80} />
          ))}
        </div>
      </div>
    </section>
  );
}
