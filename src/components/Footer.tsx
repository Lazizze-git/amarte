export default function Footer() {
  return (
    <footer className="bg-[var(--bg-dark)] border-t border-white/5 py-8">
      <div className="max-w-6xl mx-auto px-5 md:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div>
          <p className="font-serif text-lg italic text-white">Amarte</p>
          <p className="text-[9px] tracking-[0.25em] uppercase text-[#444] mt-0.5 font-light">
            Yoga · Pilates · Bien-être
          </p>
        </div>

        <p className="text-[10px] text-[#444] font-light">
          Route du Village 1A · 1066 Épalinges ·{" "}
          <a href="mailto:info@amarte.ch" className="hover:text-[#888] transition-colors">
            info@amarte.ch
          </a>
        </p>

        <p className="text-[9px] text-[#333] font-light">
          © {new Date().getFullYear()} Amarte
        </p>
      </div>
    </footer>
  );
}
