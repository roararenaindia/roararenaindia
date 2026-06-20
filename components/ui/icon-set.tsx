import type { ReactNode, SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & { size?: number | string }

function makeIcon(paths: ReactNode, viewBox = '0 0 24 24') {
  return function Icon({ size = 24, className, strokeWidth = 2, ...props }: IconProps) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox={viewBox}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
        {...props}
      >
        {paths}
      </svg>
    )
  }
}

export const Activity = makeIcon(<><path d="M22 12h-4l-3 8L9 4l-3 8H2" /></>)
export const ArrowLeft = makeIcon(<><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></>)
export const ArrowRight = makeIcon(<><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></>)
export const ArrowUpRight = makeIcon(<><path d="M7 17 17 7" /><path d="M7 7h10v10" /></>)
export const Bell = makeIcon(<><path d="M10 21h4" /><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /></>)
export const CalendarDays = makeIcon(<><path d="M8 2v4" /><path d="M16 2v4" /><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M3 10h18" /><path d="M8 14h.01" /><path d="M12 14h.01" /><path d="M16 14h.01" /><path d="M8 18h.01" /><path d="M12 18h.01" /></>)
export const Camera = makeIcon(<><path d="M14.5 4 13 2H9L7.5 4H5a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3z" /><circle cx="12" cy="12" r="4" /></>)
export const CheckCircle2 = makeIcon(<><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></>)
export const Clock3 = makeIcon(<><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>)
export const Database = makeIcon(<><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5" /><path d="M3 12c0 1.7 4 3 9 3s9-1.3 9-3" /></>)
export const Download = makeIcon(<><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" /></>)
export const ExternalLink = makeIcon(<><path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></>)
export const Eye = makeIcon(<><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>)
export const EyeOff = makeIcon(<><path d="M3 3l18 18" /><path d="M10.6 10.6a3 3 0 0 0 4.2 4.2" /><path d="M9.9 4.3A10.5 10.5 0 0 1 12 4c6 0 10 8 10 8a16.3 16.3 0 0 1-3.2 4.2" /><path d="M6.6 6.6A16.4 16.4 0 0 0 2 12s4 8 10 8c1.3 0 2.5-.3 3.6-.8" /></>)
export const Facebook = makeIcon(<><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3.5L18 10h-4V7a1 1 0 0 1 1-1h3z" /></>)
export const Flame = makeIcon(<><path d="M8.5 14.5A4.5 4.5 0 0 0 12 22a4.5 4.5 0 0 0 3.5-7.5c-1.2-1.4-1.7-3.2-.9-5.5-2.3 1.1-4.1 2.7-5.3 4.8-.4-2.1.1-4.6 1.5-7.8C6.7 8.6 5.5 12.4 8.5 14.5z" /></>)
export const ImageDown = makeIcon(<><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /><path d="M12 13v6" /><path d="m9 16 3 3 3-3" /></>)
export const Instagram = makeIcon(<><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><path d="M17.5 6.5h.01" /></>)
export const Loader2 = makeIcon(<><path d="M21 12a9 9 0 1 1-6.2-8.6" /></>)
export const Mail = makeIcon(<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>)
export const MapPin = makeIcon(<><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0z" /><circle cx="12" cy="10" r="3" /></>)
export const Menu = makeIcon(<><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" /></>)
export const MessageCircle = makeIcon(<><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-4-.9L3 21l1.6-4.7A8.5 8.5 0 1 1 21 11.5z" /></>)
export const Moon = makeIcon(<><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" /></>)
export const Play = makeIcon(<><path d="M8 5v14l11-7z" /></>)
export const PlugZap = makeIcon(<><path d="M13 2 3 14h7l-1 8 10-12h-7z" /><path d="M18 16v2a2 2 0 0 1-2 2h-2" /></>)
export const Radio = makeIcon(<><path d="M4.9 19.1a10 10 0 1 1 14.2 0" /><path d="M8.5 15.5a5 5 0 1 1 7 0" /><circle cx="12" cy="12" r="1.5" /></>)
export const RefreshCw = makeIcon(<><path d="M21 12a9 9 0 0 1-15 6.7L3 16" /><path d="M3 21v-5h5" /><path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M21 3v5h-5" /></>)
export const Save = makeIcon(<><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><path d="M17 21v-8H7v8" /><path d="M7 3v5h8" /></>)
export const Send = makeIcon(<><path d="m22 2-7 20-4-9-9-4 20-7z" /><path d="M22 2 11 13" /></>)
export const Shield = makeIcon(<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></>)
export const ShieldCheck = makeIcon(<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></>)
export const Sparkles = makeIcon(<><path d="M12 3l1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7z" /><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" /></>)
export const Star = makeIcon(<><path d="m12 2 3 7h7l-5.5 4.5L18.5 21 12 16.8 5.5 21l2-7.5L2 9h7z" /></>)
export const Sun = makeIcon(<><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="M4.9 4.9l1.4 1.4" /><path d="M17.7 17.7l1.4 1.4" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="M4.9 19.1l1.4-1.4" /><path d="M17.7 6.3l1.4-1.4" /></>)
export const Trophy = makeIcon(<><path d="M8 21h8" /><path d="M12 17v4" /><path d="M7 4h10v6a5 5 0 0 1-10 0z" /><path d="M5 6H3a3 3 0 0 0 3 3h1" /><path d="M19 6h2a3 3 0 0 1-3 3h-1" /></>)
export const Users = makeIcon(<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.9" /><path d="M16 3.1a4 4 0 0 1 0 7.8" /></>)
export const Wand2 = makeIcon(<><path d="M15 4V2" /><path d="M15 16v-2" /><path d="M8 9h2" /><path d="M20 9h2" /><path d="m17.8 6.2 1.4-1.4" /><path d="m10.8 13.2-7 7" /><path d="m17.8 11.8 1.4 1.4" /><path d="M14 8l2 2" /></>)
export const Wifi = makeIcon(<><path d="M5 13a10 10 0 0 1 14 0" /><path d="M8.5 16.5a5 5 0 0 1 7 0" /><path d="M12 20h.01" /></>)
export const X = makeIcon(<><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>)
export const XCircle = makeIcon(<><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" /></>)
export const Zap = makeIcon(<><path d="M13 2 3 14h7l-1 8 12-14h-7z" /></>)
