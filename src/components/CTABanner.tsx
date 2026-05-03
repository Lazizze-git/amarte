"use client";

import { useRef, useEffect } from "react";
import ImageSlot from "./ImageSlot";

export default function CTABanner() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1";
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    el.style.opacity = "0";
    el.style.transition = "opacity 0.9s ease-out";
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="relative w-full h-[55vh] md:h-[65vh] overflow-hidden border-t border-[var(--border)]">
      {/* Image paysage pleine largeur */}
      <ImageSlot
        label="Photo bannière — studio ou pratique en groupe, format paysage"
        filename="cta-banner.jpg"
        objectPosition="center 30%"
        className="absolute inset-0 w-full h-full"
      />

      {/* Overlay sombre renforcé */}
      <div className="absolute inset-0 bg-black/65" />

      {/* Texte centré */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
        <p className="text-xs tracking-[0.3em] uppercase text-white/80 font-light mb-5">
          Commencez votre parcours
        </p>
        <h2 className="font-serif text-[clamp(2.2rem,6vw,5rem)] leading-[1.05] text-white mb-8 max-w-2xl">
          Votre première séance{" "}
          <em>vous attend.</em>
        </h2>
        <a
          href="#contact"
          className="text-xs tracking-[0.2em] uppercase bg-white text-[var(--text)] px-8 py-4 hover:bg-[var(--accent)] hover:text-white transition-colors duration-200 font-medium"
        >
          Réserver maintenant
        </a>
      </div>
    </div>
  );
}
