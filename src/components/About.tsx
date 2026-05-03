"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function About() {
  const imgRef = useRef<HTMLDivElement>(null);
  const imgInnerRef = useRef<HTMLImageElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Image : révélation avec clip-path qui s'ouvre du bas + scale de l'image intérieure
    if (imgRef.current && imgInnerRef.current) {
      gsap.fromTo(imgRef.current,
        { clipPath: "inset(100% 0% 0% 0%)" },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.2,
          ease: "power3.inOut",
          scrollTrigger: { trigger: imgRef.current, start: "top 85%" },
        }
      );
      gsap.fromTo(imgInnerRef.current,
        { scale: 1.15 },
        {
          scale: 1,
          duration: 1.2,
          ease: "power3.inOut",
          scrollTrigger: { trigger: imgRef.current, start: "top 85%" },
        }
      );
    }

    // Contenu texte — enfants en stagger
    if (contentRef.current) {
      gsap.fromTo(
        Array.from(contentRef.current.children),
        { y: 50, opacity: 0 },
        {
          y: 0, opacity: 1,
          duration: 0.8,
          ease: "power2.out",
          stagger: 0.1,
          scrollTrigger: { trigger: contentRef.current, start: "top 85%" },
        }
      );
    }
  }, []);

  return (
    <section id="a-propos" className="border-t border-[var(--border)]">
      <div className="flex flex-col md:flex-row">

        {/* Image */}
        <div
          ref={imgRef}
          className="relative aspect-[3/4] md:aspect-auto md:w-[45%] md:min-h-[640px] shrink-0 overflow-hidden"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgInnerRef}
            src="/images/about.jpg"
            alt="Session au Studio Amarte"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: "center center" }}
          />
          <div className="absolute bottom-5 right-5 hidden md:block bg-white/90 backdrop-blur-sm px-5 py-4 border border-[var(--border)]">
            <p className="font-serif text-2xl italic text-[var(--text)]">2023</p>
            <p className="text-[9px] tracking-[0.25em] uppercase text-[var(--text-muted)] font-light mt-1">Fondé à Épalinges</p>
          </div>
        </div>

        {/* Texte */}
        <div
          ref={contentRef}
          className="flex flex-col justify-center px-8 py-14 md:px-14 lg:px-20 md:py-24 bg-white"
        >
          <p className="text-[10px] tracking-[0.35em] uppercase text-[var(--accent)] font-light mb-6">
            02 — À propos
          </p>
          <h2 className="font-serif text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.1] text-[var(--text)] mb-8">
            Un espace pensé pour{" "}
            <em>prendre soin de vous.</em>
          </h2>
          <div className="space-y-4 text-[15px] text-[var(--text-muted)] font-light leading-relaxed max-w-md">
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
          <div className="grid grid-cols-2 gap-5 mt-10 pt-8 border-t border-[var(--border)]">
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
