"use client";

import { useRef, useEffect } from "react";

interface Plan {
  name: string;
  tagline: string;
  price: string;
  unit: string;
  validity: string;
  featured: boolean;
  description: string;
  features: string[];
  cta: string;
}

const PLANS: Plan[] = [
  {
    name: "Découverte",
    tagline: "Pour commencer",
    price: "CHF 75",
    unit: "3 crédits",
    validity: "Valables 2 mois",
    featured: false,
    description:
      "Explorez nos disciplines à votre rythme, sans engagement.",
    features: [
      "3 crédits utilisables librement",
      "Yoga, Pilates ou Méditation",
      "Valables 2 mois",
      "Accès app de réservation",
    ],
    cta: "Commencer",
  },
  {
    name: "Mensuel",
    tagline: "Le plus populaire",
    price: "CHF 180",
    unit: "/ mois",
    validity: "8 crédits · Auto-renouvelable",
    featured: true,
    description:
      "Intégrez la pratique dans votre routine avec 8 crédits par mois.",
    features: [
      "8 crédits par mois",
      "Renouvellement automatique",
      "Report d'un mois possible",
      "Tous cours inclus",
      "Priorité de réservation",
    ],
    cta: "S'abonner",
  },
  {
    name: "Illimité",
    tagline: "Pour les passionnés",
    price: "CHF 280",
    unit: "/ mois",
    validity: "Cours illimités",
    featured: false,
    description:
      "Venez autant que vous voulez. Le mouvement comme priorité.",
    features: [
      "Cours illimités",
      "Accès prioritaire",
      "Invité offert 1×/mois",
      "Atelier mensuel gratuit",
    ],
    cta: "Devenir membre",
  },
];

export default function Pricing() {
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
      { threshold: 0.1 }
    );
    el.style.opacity = "0";
    el.style.transform = "translateY(24px)";
    el.style.transition = "opacity 0.7s ease-out, transform 0.7s ease-out";
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="tarifs" className="py-16 md:py-28 bg-[var(--bg-soft)]">
      <div ref={ref} className="max-w-6xl mx-auto px-5 md:px-8">
        <div className="mb-10 md:mb-16">
          <p className="text-[10px] tracking-[0.3em] uppercase text-[var(--accent)] font-light mb-4">
            05 — Tarifs
          </p>
          <h2 className="font-serif text-[clamp(2rem,6vw,4rem)] leading-[1.1] text-[var(--text)] max-w-lg">
            Investir dans soi,{" "}
            <em>à votre rythme.</em>
          </h2>
          <p className="mt-4 text-sm text-[var(--text-muted)] font-light max-w-sm">
            Des formules flexibles, sans engagement forcé.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-0 md:border md:border-[var(--border)]">
          {PLANS.map((plan, i) => (
            <div
              key={plan.name}
              className={`relative flex flex-col p-6 md:p-8 ${
                plan.featured
                  ? "bg-[var(--bg-dark)] text-white md:border-x md:border-[var(--bg-dark)]"
                  : "bg-white border border-[var(--border)] md:border-0"
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--accent)] px-3 py-1">
                  <span className="text-[9px] tracking-[0.2em] uppercase text-white font-light">
                    Recommandé
                  </span>
                </div>
              )}

              <div className="mb-6">
                <p
                  className={`text-[10px] tracking-[0.2em] uppercase font-light mb-1 ${
                    plan.featured ? "text-[var(--accent)]" : "text-[var(--text-muted)]"
                  }`}
                >
                  {plan.tagline}
                </p>
                <h3
                  className={`font-serif text-xl leading-tight ${
                    plan.featured ? "text-white" : "text-[var(--text)]"
                  }`}
                >
                  {plan.name}
                </h3>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span
                    className={`font-serif text-3xl md:text-4xl ${
                      plan.featured ? "text-white" : "text-[var(--text)]"
                    }`}
                  >
                    {plan.price}
                  </span>
                  <span
                    className={`text-xs font-light ${
                      plan.featured ? "text-[#888]" : "text-[var(--text-muted)]"
                    }`}
                  >
                    {plan.unit}
                  </span>
                </div>
                <p
                  className={`text-[10px] tracking-[0.1em] uppercase font-light mt-1 ${
                    plan.featured ? "text-[#666]" : "text-[var(--text-muted)]"
                  }`}
                >
                  {plan.validity}
                </p>
              </div>

              <p
                className={`text-sm font-light leading-relaxed mb-6 ${
                  plan.featured ? "text-[#999]" : "text-[var(--text-muted)]"
                }`}
              >
                {plan.description}
              </p>

              <ul className="space-y-2.5 flex-1 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <span className={`text-xs mt-0.5 shrink-0 ${plan.featured ? "text-[var(--accent)]" : "text-[var(--accent)]"}`}>
                      ✓
                    </span>
                    <span
                      className={`text-xs font-light ${
                        plan.featured ? "text-[#999]" : "text-[var(--text-muted)]"
                      }`}
                    >
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <a
                href="#contact"
                className={`text-[11px] tracking-[0.15em] uppercase text-center py-3.5 transition-colors duration-200 font-light ${
                  plan.featured
                    ? "bg-white text-[var(--bg-dark)] hover:bg-[var(--accent)] hover:text-white"
                    : "border border-[var(--text)] text-[var(--text)] hover:bg-[var(--text)] hover:text-white"
                }`}
              >
                {plan.cta}
              </a>

              {/* Séparateur vertical desktop */}
              {i < PLANS.length - 1 && !plan.featured && (
                <div className="hidden md:block absolute right-0 top-8 bottom-8 w-px bg-[var(--border)]" />
              )}
            </div>
          ))}
        </div>

        <p className="mt-6 text-[11px] text-[var(--text-muted)] font-light">
          Cours privés disponibles sur demande ·{" "}
          <a href="#contact" className="underline underline-offset-2 hover:text-[var(--text)] transition-colors">
            Nous contacter
          </a>
        </p>
      </div>
    </section>
  );
}
