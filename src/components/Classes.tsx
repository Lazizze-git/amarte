"use client";

import { useRef, useEffect } from "react";
import ImageSlot from "./ImageSlot";

interface ClassItem {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  description: string;
  duration: string;
  level: string;
  imageLabel: string;
  imageFile: string;
  objectPosition?: string;
}

const CLASSES: ClassItem[] = [
  {
    id: "yoga",
    number: "01",
    title: "Yoga Flow",
    subtitle: "Dynamique & Libérateur",
    description:
      "Un yoga fluide qui harmonise force et souplesse. Chaque séance renforce le corps tout en apaisant l'esprit. Accessible à tous les niveaux avec des variations proposées.",
    duration: "60 min",
    level: "Tous niveaux",
    imageLabel: "Cours de Yoga Flow en studio",
    imageFile: "class-yoga.jpg",
    objectPosition: "center 40%",
  },
  {
    id: "pilates",
    number: "02",
    title: "Pilates",
    subtitle: "Renforcement & Équilibre",
    description:
      "Méthode profonde de renforcement musculaire centrée sur la posture et la coordination. Des résultats visibles en quelques semaines.",
    duration: "60 min",
    level: "Tous niveaux",
    imageLabel: "Cours de Pilates — équipement studio",
    imageFile: "class-pilates.jpg",
    objectPosition: "center top",
  },
  {
    id: "meditation",
    number: "03",
    title: "Méditation",
    subtitle: "Pleine conscience",
    description:
      "Séances guidées pour cultiver la présence. Techniques de respiration, visualisation et scan corporel. Un ancrage indispensable dans votre semaine.",
    duration: "45 min",
    level: "Débutants bienvenus",
    imageLabel: "Séance de méditation guidée",
    imageFile: "class-meditation.jpg",
    objectPosition: "center center",
  },
  {
    id: "bien-etre",
    number: "04",
    title: "Bien-être",
    subtitle: "Holistique & Doux",
    description:
      "Mouvements thérapeutiques, étirements profonds et relaxation guidée. Parfait pour la récupération et la reconnexion corps-esprit.",
    duration: "60 min",
    level: "Tous niveaux",
    imageLabel: "Séance bien-être et détente",
    imageFile: "class-bienetre.jpg",
    objectPosition: "center 30%",
  },
];

function ClassCard({ cls, index }: { cls: ClassItem; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
          }, index * 80);
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";
    el.style.transition = "opacity 0.7s ease-out, transform 0.7s ease-out";
    obs.observe(el);
    return () => obs.disconnect();
  }, [index]);

  return (
    <div ref={ref} className="group flex flex-col">
      {/* Image pleine largeur */}
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: "4/3" }}>
        <ImageSlot
          label={cls.imageLabel}
          filename={cls.imageFile}
          objectPosition={cls.objectPosition}
          className="w-full h-full transition-transform duration-700 group-hover:scale-105"
        />
        {/* Numéro editorial overlay */}
        <span
          aria-hidden
          className="absolute top-4 left-4 font-serif text-5xl leading-none text-white/30"
        >
          {cls.number}
        </span>
      </div>

      {/* Texte sous l'image */}
      <div className="flex-1 flex flex-col pt-5 pb-8 border-b border-[var(--border)]">
        <p className="text-xs tracking-[0.2em] uppercase text-[var(--accent)] font-medium mb-2">
          {cls.subtitle}
        </p>
        <h3 className="font-serif text-2xl md:text-3xl text-[var(--text)] leading-tight mb-3">
          {cls.title}
        </h3>
        <p className="text-sm text-[var(--text-muted)] font-light leading-relaxed mb-5 flex-1">
          {cls.description}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex gap-3">
            <span className="text-xs tracking-[0.1em] uppercase text-[var(--text-muted)] font-light border border-[var(--border)] px-2.5 py-1.5">
              {cls.duration}
            </span>
            <span className="text-xs tracking-[0.1em] uppercase text-[var(--text-muted)] font-light border border-[var(--border)] px-2.5 py-1.5">
              {cls.level}
            </span>
          </div>
          <a
            href="#horaires"
            className="text-xs tracking-[0.1em] uppercase font-medium text-[var(--text)] flex items-center gap-1.5 hover:text-[var(--accent)] transition-colors duration-200"
          >
            Horaires <span>→</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default function Classes() {
  const headerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = headerRef.current;
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

  return (
    <section id="cours" className="bg-white py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        {/* En-tête */}
        <div ref={headerRef} className="mb-12 md:mb-16">
          <p className="text-xs tracking-[0.3em] uppercase text-[var(--accent)] font-light mb-4">
            03 — Disciplines
          </p>
          <h2 className="font-serif text-[clamp(2rem,6vw,4rem)] leading-[1.1] text-[var(--text)] max-w-xl">
            Chaque cours,{" "}
            <em>une invitation à revenir à soi.</em>
          </h2>
        </div>

        {/* Grille 2 colonnes — chaque carte : image en haut, texte en bas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-12">
          {CLASSES.map((cls, i) => (
            <ClassCard key={cls.id} cls={cls} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
