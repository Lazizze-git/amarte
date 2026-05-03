"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function CTABanner() {
  const imgRef = useRef<HTMLImageElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Image : clip-path reveal + dézoom intérieur
    if (wrapRef.current && imgRef.current) {
      gsap.fromTo(wrapRef.current,
        { clipPath: "inset(100% 0% 0% 0%)" },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.2,
          ease: "power3.inOut",
          scrollTrigger: { trigger: wrapRef.current, start: "top 85%" },
        }
      );
      gsap.fromTo(imgRef.current,
        { scale: 1.12 },
        {
          scale: 1,
          duration: 1.2,
          ease: "power3.inOut",
          scrollTrigger: { trigger: wrapRef.current, start: "top 85%" },
        }
      );
    }

    // Texte
    if (contentRef.current) {
      gsap.fromTo(
        Array.from(contentRef.current.children),
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1,
          duration: 0.8,
          ease: "power2.out",
          stagger: 0.1,
          delay: 0.3,
          scrollTrigger: { trigger: contentRef.current, start: "top 85%" },
        }
      );
    }
  }, []);

  return (
    <div
      ref={wrapRef}
      className="relative overflow-hidden aspect-[3/4] sm:aspect-auto sm:h-[70vh]"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src="/images/cta-banner.jpg"
        alt="Cours collectif au Studio Amarte"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ objectPosition: "center 40%" }}
      />
      <div className="absolute inset-0 bg-black/52" />
      <div
        ref={contentRef}
        className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
      >
        <p className="text-[10px] tracking-[0.38em] uppercase text-white/50 font-light mb-5">
          Commencez votre parcours
        </p>
        <h2 className="font-serif text-[clamp(2.4rem,6vw,5rem)] leading-[1.02] text-white mb-10 max-w-2xl">
          Votre première séance{" "}
          <em>vous attend.</em>
        </h2>
        <a
          href="#contact"
          className="inline-flex items-center gap-3 text-white border border-white/50 rounded-full px-8 py-3.5 text-[13px] font-light tracking-wide hover:bg-white hover:text-[var(--text)] transition-all duration-500"
        >
          Réserver maintenant
        </a>
      </div>
    </div>
  );
}
