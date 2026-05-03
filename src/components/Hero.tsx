"use client";

import { useEffect, useRef } from "react";
import ImageSlot from "./ImageSlot";

export default function Hero() {
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(16px)";
    const t = setTimeout(() => {
      el.style.transition = "opacity 1s ease-out, transform 1s ease-out";
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    }, 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative w-full h-screen min-h-[600px] overflow-hidden">
      {/* Image plein écran */}
      <ImageSlot
        label="Studio Amarte — ambiance intérieure"
        filename="hero.jpg"
        objectPosition="center center"
        className="absolute inset-0 w-full h-full"
      />

      {/* Gradient overlay — bas de l'image */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Texte — bas gauche */}
      <div ref={textRef} className="absolute inset-x-0 bottom-0 px-6 md:px-12 pb-12 md:pb-16">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs tracking-[0.3em] uppercase text-white/70 font-light mb-4">
            Studio · Épalinges, Vaud
          </p>
          <h1 className="font-serif text-[clamp(2.8rem,8vw,6.5rem)] leading-[0.95] text-white mb-6">
            S&rsquo;entraîner
            <br />
            <em>est un acte</em>
            <br />
            d&rsquo;amour.
          </h1>

          <div className="flex flex-col sm:flex-row items-start gap-3 mt-7">
            <a
              href="#cours"
              className="inline-block text-xs tracking-[0.15em] uppercase bg-white text-[var(--text)] px-7 py-4 hover:bg-[var(--accent)] hover:text-white transition-colors duration-200 font-medium text-center"
            >
              Découvrir les cours
            </a>
            <a
              href="#a-propos"
              className="inline-block text-xs tracking-[0.15em] uppercase border border-white/60 text-white px-7 py-4 hover:border-white transition-colors duration-200 font-light text-center"
            >
              Notre histoire
            </a>
          </div>
        </div>
      </div>

      {/* Infos bas-droite */}
      <div className="absolute bottom-0 right-0 px-6 md:px-12 pb-12 md:pb-16 hidden md:flex flex-col items-end gap-1.5">
        {["Lun–Ven 8h–20h", "Sam 8h–17h", "Parking gratuit"].map((item) => (
          <span key={item} className="text-xs text-white/60 font-light">
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}
