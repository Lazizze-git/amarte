"use client";

import { useRef, useEffect } from "react";
import ImageSlot from "./ImageSlot";

export default function Manifesto() {
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
      { threshold: 0.15 }
    );
    el.style.opacity = "0";
    el.style.transform = "translateY(24px)";
    el.style.transition = "opacity 0.8s ease-out, transform 0.8s ease-out";
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="relative w-full h-[70vh] md:h-[80vh] min-h-[500px] overflow-hidden">
      {/* Image plein cadre */}
      <ImageSlot
        label="Ambiance studio — pratique yoga ou pilates"
        filename="philosophy.jpg"
        objectPosition="center center"
        className="absolute inset-0 w-full h-full"
      />

      {/* Overlay sombre */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Contenu centré */}
      <div
        ref={ref}
        className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6 md:px-12"
      >
        <p className="text-xs tracking-[0.3em] uppercase text-[var(--accent)] font-light mb-8">
          Notre philosophie
        </p>
        <blockquote className="font-serif text-[clamp(1.6rem,4.5vw,3.2rem)] leading-[1.2] text-white max-w-3xl">
          S&rsquo;entraîner est bien plus qu&rsquo;une discipline —
          c&rsquo;est un acte de <em>soin de soi.</em>
        </blockquote>
        <p className="mt-6 text-sm md:text-base text-white/65 font-light leading-relaxed max-w-xl">
          Un espace intime, sans jugement. Pour que vous progressiez
          à votre rythme, en sécurité.
        </p>

        <div className="flex gap-10 md:gap-16 mt-12 pt-10 border-t border-white/20">
          {[
            { value: "9+", label: "Disciplines" },
            { value: "∀", label: "Niveaux" },
            { value: "2023", label: "Fondé" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-serif text-3xl md:text-4xl text-[var(--accent)]">{s.value}</p>
              <p className="text-xs tracking-[0.2em] uppercase text-white/50 mt-1 font-light">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
