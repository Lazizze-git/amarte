"use client";

import { useRef, useEffect } from "react";

interface CourseSlot {
  time: string;
  name: string;
  duration: string;
  level: string;
}

interface DaySchedule {
  day: string;
  short: string;
  classes: CourseSlot[];
}

const SCHEDULE: DaySchedule[] = [
  {
    day: "Lundi",
    short: "Lun",
    classes: [
      { time: "08:00", name: "Yoga Flow", duration: "60 min", level: "Tous" },
      { time: "12:00", name: "Pilates", duration: "60 min", level: "Inter." },
      { time: "18:30", name: "Yoga Flow", duration: "60 min", level: "Tous" },
    ],
  },
  {
    day: "Mardi",
    short: "Mar",
    classes: [
      { time: "09:00", name: "Méditation", duration: "45 min", level: "Deb." },
      { time: "18:00", name: "Pilates", duration: "60 min", level: "Tous" },
      { time: "19:30", name: "Bien-être", duration: "60 min", level: "Tous" },
    ],
  },
  {
    day: "Mercredi",
    short: "Mer",
    classes: [
      { time: "08:00", name: "Pilates", duration: "60 min", level: "Tous" },
      { time: "18:30", name: "Yoga Flow", duration: "60 min", level: "Avanc." },
    ],
  },
  {
    day: "Jeudi",
    short: "Jeu",
    classes: [
      { time: "09:00", name: "Yoga Flow", duration: "60 min", level: "Deb." },
      { time: "18:00", name: "Pilates", duration: "60 min", level: "Tous" },
      { time: "19:30", name: "Méditation", duration: "45 min", level: "Tous" },
    ],
  },
  {
    day: "Vendredi",
    short: "Ven",
    classes: [
      { time: "08:00", name: "Bien-être", duration: "60 min", level: "Tous" },
      { time: "12:00", name: "Pilates", duration: "60 min", level: "Tous" },
      { time: "18:30", name: "Yoga Flow", duration: "60 min", level: "Tous" },
    ],
  },
  {
    day: "Samedi",
    short: "Sam",
    classes: [
      { time: "09:00", name: "Yoga Flow", duration: "90 min", level: "Tous" },
      { time: "11:00", name: "Pilates", duration: "60 min", level: "Tous" },
    ],
  },
];

const COURSE_COLORS: Record<string, string> = {
  "Yoga Flow": "var(--accent)",
  Pilates: "var(--text)",
  Méditation: "#555",
  "Bien-être": "#666",
};

export default function Schedule() {
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
    <section id="horaires" className="py-16 md:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <div ref={ref}>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-10 md:mb-14">
            <div>
              <p className="text-xs tracking-[0.25em] uppercase text-[var(--accent)] font-light mb-4">
                04 — Planning
              </p>
              <h2 className="font-serif text-[clamp(2rem,6vw,4rem)] leading-[1.1] text-[var(--text)]">
                Vos horaires <em>cette semaine.</em>
              </h2>
            </div>
            <a
              href="https://amarte.zenitoo.ch/fr/calendar"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-xs tracking-[0.15em] uppercase bg-[var(--text)] text-white px-5 py-3 hover:bg-[var(--accent)] transition-colors duration-200 font-medium text-center"
            >
              Calendrier complet
            </a>
          </div>

          {/* Grid planning — scroll horizontal sur mobile */}
          <div className="overflow-x-auto -mx-5 px-5 md:mx-0 md:px-0">
            <div className="min-w-[560px] grid grid-cols-6 border-t border-[var(--border)]">
              {SCHEDULE.map((day) => (
                <div key={day.day} className="border-r border-[var(--border)] last:border-r-0">
                  {/* En-tête jour */}
                  <div className="py-3 px-3 border-b border-[var(--border)]">
                    <p className="text-xs tracking-[0.12em] uppercase text-[var(--text)] font-medium">
                      <span className="md:hidden">{day.short}</span>
                      <span className="hidden md:inline">{day.day}</span>
                    </p>
                  </div>

                  {/* Créneaux */}
                  <div className="divide-y divide-[var(--border)]">
                    {day.classes.map((cls) => (
                      <div key={`${cls.time}-${cls.name}`} className="p-3">
                        <p className="font-serif text-sm text-[var(--text-muted)]">{cls.time}</p>
                        <p
                          className="text-xs font-medium mt-0.5 leading-tight"
                          style={{ color: COURSE_COLORS[cls.name] ?? "var(--text)" }}
                        >
                          {cls.name}
                        </p>
                        <p className="text-xs text-[var(--text-muted)] font-light mt-0.5">
                          {cls.duration}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-5 text-xs text-[var(--text-muted)] font-light">
            Horaires indicatifs — consultez le calendrier en ligne pour les disponibilités exactes.
          </p>
        </div>
      </div>
    </section>
  );
}
