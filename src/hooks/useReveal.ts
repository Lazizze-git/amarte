"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Anime un élément au scroll — y:50 opacity:0 → y:0 opacity:1
// Exactement comme Core Atelier : start "top 90%", ease power2.out, duration 0.8
export function useReveal(delay = 0) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    gsap.fromTo(
      el,
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power2.out",
        delay,
        scrollTrigger: {
          trigger: el,
          start: "top 90%",
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(t => {
        if (t.vars.trigger === el) t.kill();
      });
    };
  }, [delay]);

  return ref;
}

// Anime plusieurs enfants en stagger au scroll — comme leur heading
export function useRevealStagger(stagger = 0.075) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const children = Array.from(el.children);

    gsap.fromTo(
      children,
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power2.out",
        stagger,
        scrollTrigger: {
          trigger: el,
          start: "top 90%",
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(t => {
        if (t.vars.trigger === el) t.kill();
      });
    };
  }, [stagger]);

  return ref;
}
