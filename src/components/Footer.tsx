const FOOTER_LINKS = [
  {
    col: [
      { label: "À propos", href: "#a-propos" },
      { label: "Cours", href: "#cours" },
      { label: "Horaires", href: "#horaires" },
      { label: "Tarifs", href: "#tarifs" },
    ],
  },
  {
    col: [
      { label: "Contact", href: "#contact" },
      { label: "Instagram", href: "https://instagram.com" },
      { label: "Facebook", href: "https://facebook.com" },
    ],
  },
  {
    col: [
      { label: "Réserver", href: "https://amarte.zenitoo.ch/fr/calendar" },
      { label: "info@amarte.ch", href: "mailto:info@amarte.ch" },
      { label: "+41 78 810 64 64", href: "tel:+41788106464" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#1C1612] text-white">
      {/* Corps principal */}
      <div className="px-8 md:px-14 pt-16 md:pt-24 pb-10 md:pb-14">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-14 md:gap-10">

          {/* Tagline gauche — style Core Atelier */}
          <div className="md:max-w-xs">
            <p className="font-serif text-[clamp(2.2rem,5vw,3.4rem)] leading-[1.1] text-white">
              amarte,<br />
              <em>en mouvement.</em>
            </p>
          </div>

          {/* 3 colonnes de liens */}
          <div className="flex gap-12 md:gap-20 flex-wrap">
            {FOOTER_LINKS.map((group, gi) => (
              <ul key={gi} className="flex flex-col gap-3">
                {group.col.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target={link.href.startsWith("http") ? "_blank" : undefined}
                      rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="text-[13px] font-light text-white/55 hover:text-white transition-colors duration-300 tracking-wide"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      </div>

      {/* Barre copyright */}
      <div className="border-t border-white/8 px-8 md:px-14 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <p className="text-[11px] text-white/25 font-light">
          © {new Date().getFullYear()} Amarte. Tous droits réservés.
        </p>
        <p className="text-[11px] text-white/20 font-light">
          Route du Village 1A · 1066 Épalinges
        </p>
      </div>

      {/* Grand texte décoratif bas — comme Core Atelier */}
      <div className="overflow-hidden px-4 pb-2 select-none pointer-events-none">
        <p className="font-serif italic text-[clamp(4rem,14vw,10rem)] leading-none text-white/[0.04] whitespace-nowrap tracking-tight">
          amarte
        </p>
      </div>
    </footer>
  );
}
