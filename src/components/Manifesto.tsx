"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Manifesto() {
  const labelRef = useRef<HTMLParagraphElement>(null);
  const quoteRef = useRef<HTMLQuoteElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const els = [labelRef.current, quoteRef.current, subRef.current];
    els.forEach((el, i) => {
      if (!el) return;
      gsap.fromTo(el,
        { y: 50, opacity: 0 },
        {
          y: 0, opacity: 1,
          duration: 0.8,
          ease: "power2.out",
          delay: i * 0.1,
          scrollTrigger: { trigger: el, start: "top 90%" },
        }
      );
    });

    // Stats en stagger
    if (statsRef.current) {
      gsap.fromTo(
        Array.from(statsRef.current.children),
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1,
          duration: 0.75,
          ease: "power2.out",
          stagger: 0.1,
          scrollTrigger: { trigger: statsRef.current, start: "top 90%" },
        }
      );
    }
  }, []);

  return (
    <section className="bg-[var(--bg-dark)] py-20 md:py-32">
      <div className="max-w-5xl mx-auto px-8 md:px-14">
        <p ref={labelRef} className="text-[10px] tracking-[0.35em] uppercase text-[var(--accent)] font-light mb-8">
          Notre philosophie
        </p>
        <blockquote ref={quoteRef} className="font-serif text-[clamp(1.8rem,4.5vw,3.2rem)] leading-[1.18] text-white max-w-3xl">
          S&rsquo;entraîner est bien plus qu&rsquo;une discipline —
          c&rsquo;est un acte de <em>soin de soi.</em>
        </blockquote>
        <p ref={subRef} className="mt-7 text-[15px] text-white/45 font-light leading-relaxed max-w-md">
          Un espace intime, sans jugement. Pour que vous progressiez
          à votre rythme, en sécurité et en confiance.
        </p>
        <div ref={statsRef} className="grid grid-cols-3 gap-6 mt-14 pt-10 border-t border-white/8">
          {[
            { value: "9+", label: "Disciplines" },
            { value: "∀", label: "Niveaux" },
            { value: "2023", label: "Fondé" },
          ].map((s) => (
            <div key={s.label}>
              <p className="font-serif text-[clamp(2rem,4vw,3rem)] text-[var(--accent)]">{s.value}</p>
              <p className="text-[10px] tracking-[0.2em] uppercase text-white/35 mt-2 font-light">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
