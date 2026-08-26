// Lo que queda de los SVG planos.
//
// Las ilustraciones grandes (oso, globo, conejo, ramas, nubes, estrellas) se
// eliminaron el 25/08/2026: las reemplazaron las acuarelas de `public/img`, que ya
// traen su propio follaje horneado. Ver .claude/docs/plan-landing.md.
//
// Corazón y divisor sobreviven porque siguen apareciendo en el diseño final como
// separadores, y ahí un SVG pesa menos y escala mejor que un PNG.

type S = { className?: string; style?: React.CSSProperties };

export function Corazon({ className, style }: S) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden="true">
      <path d="M12 21c-1-.9-8-5.3-8-10.5C4 7 6.6 5 9 5c1.6 0 2.5.8 3 1.6C12.5 5.8 13.4 5 15 5c2.4 0 5 2 5 5.5C20 15.7 13 20.1 12 21Z" fill="currentColor" />
    </svg>
  );
}

export function Divisor({ className }: S) {
  const hoja = (
    <svg viewBox="0 0 74 22" className="h-[22px] w-[74px]" aria-hidden="true">
      <path d="M72 4C52 4 40 10 34 18" stroke="#A8B894" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <ellipse cx="60" cy="6" rx="7" ry="3.4" fill="#A8B894" transform="rotate(-16 60 6)" />
      <ellipse cx="48" cy="9" rx="7" ry="3.4" fill="#8FA47C" transform="rotate(-22 48 9)" />
      <ellipse cx="38" cy="14" rx="6" ry="3" fill="#A8B894" transform="rotate(-30 38 14)" />
    </svg>
  );
  return (
    <div className={`flex items-center justify-center gap-3 ${className ?? ""}`}>
      {hoja}
      <Corazon className="h-3.5 w-3.5 text-[#E0CBAE]" />
      <span className="scale-x-[-1]">{hoja}</span>
    </div>
  );
}
