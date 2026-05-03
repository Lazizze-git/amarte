"use client";

import { useRef, useEffect } from "react";
import ImageSlot from "./ImageSlot";

function useFadeIn() {
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
  return ref;
}

export default function About() {
  const imgRef = useFadeIn();
  const textRef = useFadeIn();

  return (
    <section id="a-propos" className="bg-white">
      {/* Grande image pleine largeur */}
      <div ref={imgRef} className="relative w-full h-[55vh] md:h-[70vh] overflow-hidden">
        <ImageSlot
          label="Studio Amarte — espace intérieur"
          filename="about.jpg"
          objectPosition="center 30%"
          className="w-full h-full"
        />
        {/* Léger gradient en bas */}
        <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-white to-transparent" />
      </div>

      {/* Texte en dessous */}
      <div ref={textRef} className="max-w-6xl mx-auto px-6 md:px-8 py-14 md:py-20">
        <div className="grid md:grid-cols-2 gap-10 md:gap-20 items-start">
          {/* Titre */}
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-[var(--accent)] font-light mb-5">
              02 — À propos
            </p>
            <h2 className="font-serif text-[clamp(2rem,5vw,3.8rem)] leading-[1.05] text-[var(--text)]">
              Un espace pensé pour{" "}
              <em>prendre soin de vous.</em>
            </h2>
          </div>

          {/* Corps + détails */}
          <div className="space-y-5">
            <p className="text-base text-[var(--text-muted)] font-light leading-relaxed">
              Amarte est né d&rsquo;une conviction simple : le mouvement conscient
              transforme. Pas seulement le corps — mais l&rsquo;état d&rsquo;esprit,
              l&rsquo;énergie, la relation à soi.
            </p>
            <p className="text-base text-[var(--text-muted)] font-light leading-relaxed">
              Notre studio à Épalinges propose yoga, pilates et méditation dans
              des installations spacieuses et entièrement neuves. Un endroit
              sans pression ni jugement.
            </p>

            <div className="grid grid-cols-2 gap-5 pt-6 border-t border-[var(--border)] mt-6">
              {[
                { label: "Cours collectifs", desc: "Yoga, Pilates, Méditation" },
                { label: "Tous niveaux", desc: "Débutants bienvenus" },
                { label: "Parking gratuit", desc: "Souterrain + extérieur" },
                { label: "Bus Girarde", desc: "À 20 mètres" },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-xs tracking-[0.1em] uppercase text-[var(--text)] font-medium">
                    {item.label}
                  </p>
                  <p className="text-sm text-[var(--text-muted)] font-light mt-0.5">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
