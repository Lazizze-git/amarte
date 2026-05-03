"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const LINES = [
  { text: "S\u2019entra\u00eener", italic: false },
  { text: "est un acte", italic: true },
  { text: "d\u2019amour.", italic: false },
];

export default function Hero() {
  const imgRef = useRef<HTMLImageElement>(null);
  const line0 = useRef<HTMLSpanElement>(null);
  const line1 = useRef<HTMLSpanElement>(null);
  const line2 = useRef<HTMLSpanElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const btnRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const lineEls = [line0.current, line1.current, line2.current].filter(Boolean);

    // — Lignes de titre : partent de y:105% (sous leur wrapper overflow:hidden)
    //   exactement comme Core Atelier : ease power1.In, stagger 0.075
    gsap.fromTo(
      lineEls,
      { y: "105%", opacity: 1 },
      {
        y: "0%",
        opacity: 1,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.1,
        delay: 0.2,
      }
    );

    // — Sous-titre et bouton : fade + y:20 comme leur "top 90%" trigger
    gsap.fromTo(
      [subRef.current, btnRef.current],
      { y: 20, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power2.out",
        stagger: 0.12,
        delay: 0.75,
      }
    );

    // — Image hero : commence à scale(1.08), se dézoome légèrement à l'entrée
    gsap.fromTo(
      imgRef.current,
      { scale: 1.08 },
      {
        scale: 1,
        duration: 1.8,
        ease: "power2.out",
        delay: 0,
      }
    );
  }, []);

  return (
    <section
      className="relative overflow-hidden"
      style={{ height: "100svh", minHeight: "640px" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src="/images/hero.jpg"
        alt="Studio Amarte"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ objectPosition: "center center", transformOrigin: "center center" }}
      />

      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.18) 40%, rgba(0,0,0,0.60) 72%, rgba(0,0,0,0.75) 100%)",
        }}
      />

      {/* Texte */}
      <div className="absolute inset-x-0 bottom-0 px-8 pb-14 md:px-14 md:pb-20">
        <h1 className="font-serif text-[clamp(3.2rem,9vw,7rem)] leading-[0.93] text-white mb-6">
          {LINES.map((line, i) => {
            const refs = [line0, line1, line2];
            return (
              <span key={i} className="hero-line-wrap block">
                <span
                  ref={refs[i]}
                  className="block"
                  style={{ willChange: "transform" }}
                >
                  {line.italic ? <em>{line.text}</em> : line.text}
                </span>
              </span>
            );
          })}
        </h1>

        <p
          ref={subRef}
          className="text-[10px] tracking-[0.35em] uppercase text-white/50 font-light mb-8"
          style={{ willChange: "transform, opacity" }}
        >
          Studio · Épalinges, Vaud
        </p>

        <a
          ref={btnRef}
          href="#cours"
          className="inline-flex items-center gap-3 text-white border border-white/40 rounded-full px-7 py-3 text-[13px] font-light tracking-wide hover:bg-white hover:text-[var(--text)] transition-all duration-500"
          style={{ willChange: "transform, opacity" }}
        >
          Réserver maintenant
        </a>
      </div>
    </section>
  );
}
