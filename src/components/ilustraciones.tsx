// Ilustraciones — GUÍA de posición y tamaño.
// Se reemplazan por los PNG de acuarela que entrega Efraín, respetando caja y posición.

type S = { className?: string; style?: React.CSSProperties };

export function Oso({ className, style }: S) {
  return (
    <svg viewBox="0 0 140 150" fill="none" className={className} style={style} aria-hidden="true">
      <circle cx="40" cy="30" r="16" fill="#D4B48C"/>
      <circle cx="40" cy="30" r="8.5" fill="#EFDCC0"/>
      <circle cx="100" cy="30" r="16" fill="#D4B48C"/>
      <circle cx="100" cy="30" r="8.5" fill="#EFDCC0"/>
      <ellipse cx="42" cy="132" rx="20" ry="14" fill="#E0C6A0"/>
      <ellipse cx="98" cy="132" rx="20" ry="14" fill="#E0C6A0"/>
      <ellipse cx="38" cy="133" rx="10" ry="8" fill="#F5E9D6"/>
      <ellipse cx="102" cy="133" rx="10" ry="8" fill="#F5E9D6"/>
      <ellipse cx="26" cy="100" rx="13" ry="18" fill="#D4B48C"/>
      <ellipse cx="114" cy="100" rx="13" ry="18" fill="#D4B48C"/>
      <ellipse cx="70" cy="105" rx="38" ry="33" fill="#E0C6A0"/>
      <ellipse cx="70" cy="110" rx="23" ry="22" fill="#F5E9D6"/>
      <ellipse cx="70" cy="52" rx="36" ry="32" fill="#E0C6A0"/>
      <ellipse cx="70" cy="63" rx="18" ry="14" fill="#F5E9D6"/>
      <ellipse cx="70" cy="56" rx="5.5" ry="4.2" fill="#7C6647"/>
      <path d="M70 60v4M70 64c-2 2.4-5.6 2.4-7.2.2M70 64c2 2.4 5.6 2.4 7.2.2" stroke="#7C6647" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="55" cy="47" r="3.8" fill="#5A4A33"/>
      <circle cx="85" cy="47" r="3.8" fill="#5A4A33"/>
      <path d="M70 82 56 73v18z" fill="#A8C4DC"/>
      <path d="M70 82 84 73v18z" fill="#A8C4DC"/>
      <circle cx="70" cy="82" r="5.5" fill="#8FB8D8"/>
    </svg>
  );
}

export function OsoMarca({ className, style }: S) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} style={style} aria-hidden="true">
      <circle cx="16" cy="18" r="9.5" fill="#D4B48C"/>
      <circle cx="16" cy="18" r="5" fill="#EFDCC0"/>
      <circle cx="48" cy="18" r="9.5" fill="#D4B48C"/>
      <circle cx="48" cy="18" r="5" fill="#EFDCC0"/>
      <ellipse cx="32" cy="36" rx="21" ry="19" fill="#E0C6A0"/>
      <ellipse cx="32" cy="43" rx="11" ry="8.5" fill="#F5E9D6"/>
      <ellipse cx="32" cy="38.6" rx="3.6" ry="2.8" fill="#7C6647"/>
      <circle cx="23.5" cy="32" r="2.4" fill="#5A4A33"/>
      <circle cx="40.5" cy="32" r="2.4" fill="#5A4A33"/>
    </svg>
  );
}

export function Conejo({ className, style }: S) {
  return (
    <svg viewBox="0 0 102 130" fill="none" className={className} style={style} aria-hidden="true">
      <ellipse cx="40" cy="26" rx="7.5" ry="21" fill="#E8D9C2"/>
      <ellipse cx="40" cy="26" rx="3.6" ry="14" fill="#F2E4D2"/>
      <ellipse cx="62" cy="26" rx="7.5" ry="21" fill="#E8D9C2"/>
      <ellipse cx="62" cy="26" rx="3.6" ry="14" fill="#F2E4D2"/>
      <ellipse cx="51" cy="62" rx="26" ry="24" fill="#EDDFC9"/>
      <ellipse cx="51" cy="70" rx="13" ry="10" fill="#F7EDDD"/>
      <ellipse cx="51" cy="64" rx="4" ry="3" fill="#B08D6A"/>
      <circle cx="41" cy="56" r="3.2" fill="#5A4A33"/>
      <circle cx="61" cy="56" r="3.2" fill="#5A4A33"/>
      <ellipse cx="51" cy="104" rx="30" ry="26" fill="#EDDFC9"/>
      <rect x="12" y="82" width="78" height="48" rx="5" fill="#D9BE96"/>
      <rect x="12" y="82" width="78" height="48" rx="5" fill="none" stroke="#C2A377" stroke-width="2"/>
      <path d="M51 96c-5-7-14-4-14 3 0 6 9 11 14 15 5-4 14-9 14-15 0-7-9-10-14-3Z" fill="#A8C4DC"/>
    </svg>
  );
}

export function Globo({ className, style }: S) {
  return (
    <svg viewBox="0 0 90 130" fill="none" className={className} style={style} aria-hidden="true">
      <ellipse cx="45" cy="48" rx="36" ry="44" fill="#F5E9D6"/>
      <path d="M45 4c-9 6-14 24-14 44s5 38 14 44c9-6 14-24 14-44S54 10 45 4Z" fill="#C9DCEA"/>
      <path d="M9 48c0 12 3 23 8 31 4-8 6-19 6-31s-2-23-6-31C12 25 9 36 9 48Z" fill="#EBD9BA"/>
      <path d="M81 48c0 12-3 23-8 31-4-8-6-19-6-31s2-23 6-31c5 8 8 19 8 31Z" fill="#EBD9BA"/>
      <ellipse cx="45" cy="48" rx="36" ry="44" fill="none" stroke="#C9A87A" stroke-width="1.3"/>
      <path d="M27 70l6 6 6-6 6 6 6-6 6 6 6-6" fill="none" stroke="#A8C4DC" stroke-width="3" stroke-linejoin="round"/>
      <path d="M31 86l5 14M59 86l-5 14M45 92v8" stroke="#C2A377" stroke-width="1.6" fill="none"/>
      <rect x="34" y="100" width="22" height="17" rx="3.5" fill="#C9A87A"/>
      <path d="M34 107h22M40 100v17M50 100v17" stroke="#B08D6A" stroke-width="1.2"/>
    </svg>
  );
}

export function Rama({ className, style }: S) {
  return (
    <svg viewBox="0 0 70 140" fill="none" className={className} style={style} aria-hidden="true">
      <path d="M35 138V10" stroke="#9BAE86" stroke-width="2" fill="none" stroke-linecap="round"/>
      <ellipse cx="20" cy="30" rx="14" ry="7" fill="#A8B894" transform="rotate(-28 20 30)"/>
      <ellipse cx="50" cy="46" rx="14" ry="7" fill="#8FA47C" transform="rotate(28 50 46)"/>
      <ellipse cx="20" cy="62" rx="14" ry="7" fill="#8FA47C" transform="rotate(-28 20 62)"/>
      <ellipse cx="50" cy="78" rx="14" ry="7" fill="#A8B894" transform="rotate(28 50 78)"/>
      <ellipse cx="20" cy="94" rx="13" ry="6.5" fill="#A8B894" transform="rotate(-28 20 94)"/>
      <ellipse cx="50" cy="110" rx="13" ry="6.5" fill="#8FA47C" transform="rotate(28 50 110)"/>
      <ellipse cx="35" cy="14" rx="7" ry="11" fill="#A8B894"/>
    </svg>
  );
}

export function Nube({ className, style }: S) {
  return (
    <svg viewBox="0 0 120 56" fill="none" className={className} style={style} aria-hidden="true">
      <circle cx="34" cy="32" r="19" fill="#FDFAF4"/>
      <circle cx="60" cy="24" r="23" fill="#FDFAF4"/>
      <circle cx="86" cy="34" r="17" fill="#FDFAF4"/>
      <rect x="28" y="32" width="62" height="19" rx="9.5" fill="#FDFAF4"/>
    </svg>
  );
}

export function Corazon({ className, style }: S) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden="true">
      <path d="M12 21c-1-.9-8-5.3-8-10.5C4 7 6.6 5 9 5c1.6 0 2.5.8 3 1.6C12.5 5.8 13.4 5 15 5c2.4 0 5 2 5 5.5C20 15.7 13 20.1 12 21Z" fill="currentColor" />
    </svg>
  );
}

export function Estrella({ className, style }: S) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden="true">
      <path d="M12 3.5 14.4 9l6 .5-4.6 4 1.4 5.9L12 16.3 6.8 19.4l1.4-5.9-4.6-4 6-.5Z" fill="currentColor" />
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
