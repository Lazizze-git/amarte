"use client";

import { useRef, useEffect } from "react";

export default function CTABanner() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.style.opacity = "1"; obs.disconnect(); } },
      { threshold: 0.1 }
    );
    el.style.opacity = "0";
    el.style.transition = "opacity 0.9s ease-out";
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="relative overflow-hidden aspect-[3/4] sm:aspect-auto sm:h-[65vh]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/cta-banner.jpg"
        alt="Studio Amarte"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ objectPosition: "center 30%" }}
      />
      <div className="absolute inset-0 bg-black/60" />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-5">
        <p className="text-[11px] tracking-[0.3em] uppercase text-white/70 font-light mb-5">
          Commencez votre parcours
        </p>
        <h2 className="font-serif text-[clamp(2rem,6vw,4.5rem)] leading-[1.05] text-white mb-8 max-w-2xl">
          Votre première séance <em>vous attend.</em>
        </h2>
        <a
          href="#contact"
          className="text-[11px] tracking-[0.18em] uppercase bg-white text-[var(--text)] px-8 py-4 hover:bg-[var(--accent)] hover:text-white transition-colors duration-200 font-medium"
        >
          Réserver maintenant
        </a>
      </div>
    </div>
  );
}
