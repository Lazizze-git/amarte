"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

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
    description: "Un yoga fluide qui harmonise force et souplesse. Chaque séance renforce le corps tout en apaisant l'esprit. Des variations proposées à chaque cours.",
    duration: "60 min",
    level: "Tous niveaux",
  },
  {
    number: "02",
    title: "Pilates",
    subtitle: "Renforcement & Équilibre",
    description: "Méthode profonde de renforcement musculaire centrée sur la posture et la coordination. Des résultats visibles en quelques semaines.",
    duration: "60 min",
    level: "Tous niveaux",
  },
  {
    number: "03",
    title: "Méditation",
    subtitle: "Pleine conscience",
    description: "Séances guidées pour cultiver la présence. Respiration, visualisation, scan corporel. Un ancrage indispensable dans votre semaine.",
    duration: "45 min",
    level: "Débutants bienvenus",
  },
  {
    number: "04",
    title: "Bien-être",
    subtitle: "Holistique & Doux",
    description: "Mouvements thérapeutiques, étirements profonds et relaxation guidée. Parfait pour la récupération et la reconnexion corps-esprit.",
    duration: "60 min",
    level: "Tous niveaux",
  },
];

function ClassCard({ cls }: { cls: ClassItem }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(ref.current,
      { y: 50, opacity: 0 },
      {
        y: 0, opacity: 1,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: { trigger: ref.current, start: "top 90%" },
      }
    );
  }, []);

  return (
    <div
      ref={ref}
      className="group flex flex-col gap-4 py-8 border-t border-[var(--border)] cursor-default"
    >
      <div className="flex items-start justify-between gap-4">
        <span className="font-serif text-[2.8rem] leading-none text-[var(--border)] group-hover:text-[var(--accent)]/40 transition-colors duration-500">
          {cls.number}
        </span>
        <div className="flex gap-2 pt-2 shrink-0">
          <span className="text-[10px] tracking-[0.1em] uppercase text-[var(--text-muted)] font-light border border-[var(--border)] px-2.5 py-1">
            {cls.duration}
          </span>
          <span className="hidden sm:inline text-[10px] tracking-[0.1em] uppercase text-[var(--text-muted)] font-light border border-[var(--border)] px-2.5 py-1">
            {cls.level}
          </span>
        </div>
      </div>
      <div>
        <h3 className="font-serif text-[1.7rem] md:text-[2rem] text-[var(--text)] leading-tight group-hover:text-[var(--accent)] transition-colors duration-400">
          {cls.title}
        </h3>
        <p className="text-[10px] tracking-[0.2em] uppercase text-[var(--accent)] font-light mt-1.5">
          {cls.subtitle}
        </p>
      </div>
      <p className="text-[14px] text-[var(--text-muted)] font-light leading-relaxed">
        {cls.description}
      </p>
      <a
        href="#horaires"
        className="group/link self-start flex items-center gap-2 text-[11px] tracking-[0.12em] uppercase font-medium text-[var(--text)] hover:text-[var(--accent)] transition-colors duration-300"
      >
        <span>Voir les horaires</span>
        <span className="inline-block transition-transform duration-300 group-hover/link:translate-x-1">→</span>
      </a>
    </div>
  );
}

export default function Classes() {
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!headerRef.current) return;
    gsap.fromTo(
      Array.from(headerRef.current.children),
      { y: 50, opacity: 0 },
      {
        y: 0, opacity: 1,
        duration: 0.8,
        ease: "power2.out",
        stagger: 0.1,
        scrollTrigger: { trigger: headerRef.current, start: "top 90%" },
      }
    );
  }, []);

  return (
    <section id="cours" className="bg-[var(--bg-soft)] py-16 md:py-28">
      <div className="max-w-5xl mx-auto px-8 md:px-14">
        <div ref={headerRef} className="mb-4 md:mb-10">
          <p className="text-[10px] tracking-[0.35em] uppercase text-[var(--accent)] font-light mb-5">
            03 — Disciplines
          </p>
          <h2 className="font-serif text-[clamp(2rem,5.5vw,3.5rem)] leading-[1.1] text-[var(--text)] max-w-lg">
            Chaque cours, <em>une invitation à revenir à soi.</em>
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 md:gap-x-20">
          {CLASSES.map((cls) => (
            <ClassCard key={cls.number} cls={cls} />
          ))}
        </div>
      </div>
    </section>
  );
}
