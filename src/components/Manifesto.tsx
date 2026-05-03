"use client";

import { useRef, useEffect } from "react";

export default function Manifesto() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.style.opacity = "1"; el.style.transform = "translateY(0)"; obs.disconnect(); } },
      { threshold: 0.15 }
    );
    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";
    el.style.transition = "opacity 0.8s ease-out, transform 0.8s ease-out";
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="bg-[var(--bg-dark)] py-16 md:py-28">
      <div ref={ref} className="max-w-5xl mx-auto px-5 md:px-8">
        <p className="text-[11px] tracking-[0.3em] uppercase text-[var(--accent)] font-light mb-7">
          Notre philosophie
        </p>
        <blockquote className="font-serif text-[clamp(1.7rem,4.5vw,3rem)] leading-[1.2] text-white max-w-3xl">
          S&rsquo;entraîner est bien plus qu&rsquo;une discipline —
          c&rsquo;est un acte de <em>soin de soi.</em>
        </blockquote>
        <p className="mt-6 text-[15px] text-[#999] font-light leading-relaxed max-w-lg">
          Un espace intime, sans jugement. Pour que vous progressiez
          à votre rythme, en sécurité et en confiance.
        </p>
        <div className="grid grid-cols-3 gap-6 mt-12 pt-10 border-t border-white/10">
          {[
            { value: "9+", label: "Disciplines" },
            { value: "∀", label: "Niveaux" },
            { value: "2023", label: "Fondé" },
          ].map((s) => (
            <div key={s.label}>
              <p className="font-serif text-3xl md:text-5xl text-[var(--accent)]">{s.value}</p>
              <p className="text-[11px] tracking-[0.2em] uppercase text-[#666] mt-2 font-light">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
