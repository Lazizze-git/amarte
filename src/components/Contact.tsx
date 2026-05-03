"use client";

import { useRef, useEffect, useState } from "react";

export default function Contact() {
  const ref = useRef<HTMLDivElement>(null);
  const [submitted, setSubmitted] = useState(false);

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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="contact" className="py-16 md:py-28 bg-[var(--bg-dark)]">
      <div ref={ref} className="max-w-6xl mx-auto px-5 md:px-8">
        <div className="grid md:grid-cols-2 gap-12 md:gap-20">
          {/* Infos */}
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-[var(--accent)] font-light mb-6">
              07 — Contact
            </p>
            <h2 className="font-serif text-[clamp(2rem,6vw,4rem)] leading-[1.1] text-white mb-10">
              Venez nous <em>rendre visite.</em>
            </h2>

            <div className="space-y-7 text-sm font-light">
              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase text-[#555] mb-2">Adresse</p>
                <p className="text-[#ccc] leading-relaxed">
                  Route du Village 1A<br />1066 Épalinges, Suisse
                </p>
              </div>
              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase text-[#555] mb-2">Contact</p>
                <a href="tel:+41788106464" className="block text-[#ccc] hover:text-[var(--accent)] transition-colors">
                  +41 78 810 64 64
                </a>
                <a href="mailto:info@amarte.ch" className="block text-[#ccc] hover:text-[var(--accent)] transition-colors mt-1">
                  info@amarte.ch
                </a>
              </div>
              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase text-[#555] mb-2">Horaires</p>
                <div className="space-y-1.5">
                  {[
                    ["Lundi – Vendredi", "8h00 – 20h00"],
                    ["Samedi", "8h00 – 17h00"],
                    ["Dimanche", "Fermé"],
                  ].map(([d, h]) => (
                    <div key={d} className="flex justify-between">
                      <span className="text-[#666]">{d}</span>
                      <span className="text-[#ccc]">{h}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase text-[#555] mb-2">Accès</p>
                <ul className="space-y-1.5">
                  {[
                    "Parking souterrain gratuit",
                    "Places extérieures",
                    "Bus Girarde à 20 m",
                    "Abri vélo sécurisé",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-[#999]">
                      <span className="text-[var(--accent)] text-xs">—</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex gap-5 pt-2">
                {[
                  { label: "Instagram", href: "https://instagram.com/amarte_epalinges" },
                  { label: "Facebook", href: "https://facebook.com/AmarteEpalinges" },
                ].map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] tracking-[0.2em] uppercase text-[#555] hover:text-[var(--accent)] transition-colors"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Formulaire */}
          <div>
            {submitted ? (
              <div className="flex flex-col justify-center h-full py-12 text-center">
                <p className="font-serif text-2xl italic text-white mb-3">Merci.</p>
                <p className="text-sm text-[#888] font-light">
                  Nous vous répondons dans les 24 heures.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  {(["Prénom", "Nom"] as const).map((label) => (
                    <div key={label}>
                      <label className="block text-[10px] tracking-[0.2em] uppercase text-[#555] font-light mb-2">
                        {label}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={label === "Prénom" ? "Marie" : "Dupont"}
                        className="w-full bg-transparent border border-[#2a2a2a] focus:border-[var(--accent)] text-white px-4 py-3 text-sm font-light placeholder:text-[#444] outline-none transition-colors"
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-[#555] font-light mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="marie@exemple.ch"
                    className="w-full bg-transparent border border-[#2a2a2a] focus:border-[var(--accent)] text-white px-4 py-3 text-sm font-light placeholder:text-[#444] outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-[#555] font-light mb-2">
                    Je suis intéressé(e) par
                  </label>
                  <select className="w-full bg-[#111] border border-[#2a2a2a] focus:border-[var(--accent)] text-[#ccc] px-4 py-3 text-sm font-light outline-none transition-colors appearance-none cursor-pointer">
                    <option value="">Choisir un cours</option>
                    {["Yoga Flow", "Pilates", "Méditation", "Bien-être", "Pack Découverte", "Cours privé"].map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-[#555] font-light mb-2">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Parlez-nous de vous..."
                    className="w-full bg-transparent border border-[#2a2a2a] focus:border-[var(--accent)] text-white px-4 py-3 text-sm font-light placeholder:text-[#444] outline-none resize-none transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full text-[11px] tracking-[0.15em] uppercase bg-white text-[var(--bg-dark)] py-4 hover:bg-[var(--accent)] hover:text-white transition-colors duration-200 font-light"
                >
                  Envoyer le message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
