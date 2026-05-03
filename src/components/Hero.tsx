"use client";

import { useEffect, useRef } from "react";

export default function Hero() {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";
    const t = setTimeout(() => {
      el.style.transition = "opacity 1s ease-out, transform 1s ease-out";
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    }, 150);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative overflow-hidden" style={{ height: "100svh", minHeight: "600px" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/hero.jpg"
        alt="Studio Amarte"
        className="absolute inset-0 w-full h-full object-cover object-top"
      />
      {/* Gradient renforcé — couvre le bas en dégradé progressif */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 via-[45%] to-transparent to-[75%]" />

      <div ref={contentRef} className="absolute inset-x-0 bottom-0 px-5 pb-10 md:px-12 md:pb-16">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] tracking-[0.3em] uppercase text-white/80 font-light mb-4">
            Studio · Épalinges, Vaud
          </p>
          <h1 className="font-serif text-[clamp(2.6rem,9vw,6rem)] leading-[0.95] text-white mb-7 drop-shadow-lg">
            S&rsquo;entraîner
            <br />
            <em>est un acte</em>
            <br />
            d&rsquo;amour.
          </h1>
          <div className="flex flex-col sm:flex-row gap-3">
            <a href="#cours" className="text-[11px] tracking-[0.15em] uppercase bg-white text-[var(--text)] px-7 py-3.5 hover:bg-[var(--accent)] hover:text-white transition-colors duration-200 font-medium text-center">
              Découvrir les cours
            </a>
            <a href="#a-propos" className="text-[11px] tracking-[0.15em] uppercase border border-white/50 text-white px-7 py-3.5 hover:border-white transition-colors duration-200 font-light text-center">
              Notre histoire
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
