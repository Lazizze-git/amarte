"use client";

import { useRef, useEffect } from "react";

export default function About() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.style.opacity = "1"; el.style.transform = "translateY(0)"; obs.disconnect(); } },
      { threshold: 0.1 }
    );
    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";
    el.style.transition = "opacity 0.8s ease-out, transform 0.8s ease-out";
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="a-propos" className="border-t border-[var(--border)]">
      {/*
        Mobile  : image portrait pleine largeur → texte en dessous
        Desktop : [image 45%] [texte 55%] côte à côte
      */}
      <div className="flex flex-col md:flex-row">

        {/* Image — ratio portrait respecté sur mobile */}
        <div className="relative aspect-[3/4] md:aspect-auto md:w-[45%] md:min-h-[600px] shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/about.jpg"
            alt="Studio Amarte"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: "center top" }}
          />
          {/* Dégradé bas → blanc — visible sur mobile uniquement */}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-white to-transparent md:hidden" />

          {/* Carte date — desktop uniquement */}
          <div className="absolute bottom-5 right-5 hidden md:block bg-white px-4 py-3 border border-[var(--border)]">
            <p className="font-serif text-2xl text-[var(--text)]">2023</p>
            <p className="text-[10px] tracking-[0.2em] uppercase text-[var(--text-muted)] font-light mt-0.5">Fondé à Épalinges</p>
          </div>
        </div>

        {/* Texte */}
        <div ref={ref} className="flex flex-col justify-center px-5 py-12 md:px-12 lg:px-16 md:py-20 bg-white">
          <p className="text-[11px] tracking-[0.3em] uppercase text-[var(--accent)] font-light mb-5">
            02 — À propos
          </p>
          <h2 className="font-serif text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.1] text-[var(--text)] mb-7">
            Un espace pensé pour{" "}
            <em>prendre soin de vous.</em>
          </h2>
          <div className="space-y-4 text-[15px] text-[var(--text-muted)] font-light leading-relaxed">
            <p>
              Amarte est né d&rsquo;une conviction simple : le mouvement
              conscient transforme. Pas seulement le corps — mais
              l&rsquo;état d&rsquo;esprit, l&rsquo;énergie, la relation à soi.
            </p>
            <p>
              Notre studio à Épalinges propose yoga, pilates et méditation
              dans des installations spacieuses et entièrement neuves.
              Un endroit sans pression ni jugement, pour tous les niveaux.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-8 pt-7 border-t border-[var(--border)]">
            {[
              { label: "Cours collectifs", desc: "Yoga, Pilates, Méditation" },
              { label: "Tous niveaux", desc: "Débutants bienvenus" },
              { label: "Parking gratuit", desc: "Souterrain + extérieur" },
              { label: "Bus Girarde", desc: "À 20 mètres" },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-[12px] font-medium text-[var(--text)] tracking-wide">{item.label}</p>
                <p className="text-[12px] text-[var(--text-muted)] font-light mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
