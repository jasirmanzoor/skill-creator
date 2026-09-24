type P = { className?: string };
const base = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export const ArrowIcon = ({ className = "size-4" }: P) => (
  <svg viewBox="0 0 24 24" className={`${className} rtl:-scale-x-100`} aria-hidden="true" {...base}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
export const WhatsAppIcon = ({ className = "size-5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91A9.85 9.85 0 0 0 12.04 2Zm0 18.15h-.01a8.23 8.23 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24a8.2 8.2 0 0 1 8.24 8.25c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.7-.8-.22-.09-.39-.13-.56.12-.16.25-.64.8-.78.97-.15.16-.29.18-.54.06-.25-.12-1.05-.39-1.99-1.23a7.46 7.46 0 0 1-1.38-1.72c-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.16.04-.31-.02-.43-.06-.13-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48a.92.92 0 0 0-.67.31c-.23.25-.87.85-.87 2.08 0 1.22.89 2.4 1.02 2.57.12.16 1.76 2.68 4.25 3.76.59.26 1.06.41 1.42.52.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.2-.58.2-1.08.14-1.18-.06-.1-.22-.16-.47-.29Z" />
  </svg>
);
export const PhoneIcon = ({ className = "size-5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base}>
    <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
  </svg>
);
export const MailIcon = ({ className = "size-5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);
export const PinIcon = ({ className = "size-5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base}>
    <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </svg>
);
export const CheckIcon = ({ className = "size-4" }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base} strokeWidth={2.2}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);

/** Service glyphs — simple, consistent line icons. */
export const ServiceIcon = ({ id, className = "size-6" }: P & { id: string }) => {
  const paths: Record<string, React.ReactNode> = {
    "last-mile": (<><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7" /><circle cx="7" cy="17.5" r="1.8" /><circle cx="17.5" cy="17.5" r="1.8" /></>),
    warehousing: (<><path d="M3 10 12 4l9 6v10H3z" /><path d="M7 20v-6h10v6M7 17h10" /></>),
    "land-freight": (<><path d="M2 6h12v10H2zM14 9h5l3 4v3h-8" /><circle cx="6" cy="17.5" r="1.8" /><circle cx="18" cy="17.5" r="1.8" /><path d="M5 10h6" /></>),
    fleet: (<><circle cx="12" cy="12" r="8.5" /><path d="M12 12l4-3M12 3.5v2M20.5 12h-2M12 20.5v-2M3.5 12h2" /></>),
    manpower: (<><circle cx="9" cy="8" r="3" /><path d="M3.5 19a5.5 5.5 0 0 1 11 0" /><circle cx="17" cy="9" r="2.3" /><path d="M16 14.2a4.5 4.5 0 0 1 5 4.8" /></>),
    tracking: (<><path d="M12 21s-6-5.3-6-10a6 6 0 0 1 12 0c0 4.7-6 10-6 10Z" /><circle cx="12" cy="11" r="2" /><path d="M3 21h18" /></>),
    account: (<><circle cx="12" cy="8" r="3.5" /><path d="M5 20a7 7 0 0 1 14 0" /><path d="M17.5 4.5 19 3M19.5 7.5h2" /></>),
  };
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base}>
      {paths[id]}
    </svg>
  );
};

/** Planner option glyphs. */
export const OptionIcon = ({ id, className = "size-5" }: P & { id: string }) => {
  const paths: Record<string, React.ReactNode> = {
    seller: (<><path d="M5 8h14l-1 12H6z" /><path d="M9 8a3 3 0 0 1 6 0" /></>),
    startup: (<><path d="M12 3c3 2 5 5.5 5 9.5L15 16H9l-2-3.5C7 8.5 9 5 12 3Z" /><circle cx="12" cy="10" r="1.6" /><path d="M9 16l-2 4 3-1.5M15 16l2 4-3-1.5" /></>),
    ecommerce: (<><path d="M3 4h3l2.2 10.5h10L20 7H7" /><circle cx="9.5" cy="19" r="1.5" /><circle cx="17" cy="19" r="1.5" /></>),
    enterprise: (<><path d="M4 21V5l8-2v18M12 9l8 2.5V21M3 21h18" /><path d="M7.5 8h1M7.5 12h1M7.5 16h1M15.5 14h1M15.5 17.5h1" /></>),
    platform: (<><circle cx="12" cy="5" r="2" /><circle cx="5" cy="18" r="2" /><circle cx="19" cy="18" r="2" /><path d="M12 7v4M12 11l-5.5 5.5M12 11l5.5 5.5" /></>),
    parcels: (<><path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5z" /><path d="M3.5 7.5 12 12l8.5-4.5M12 12v9M7.5 5.3l8.5 4.5" /></>),
    b2b: (<><rect x="2.5" y="8" width="6" height="8" rx="1" /><rect x="15.5" y="8" width="6" height="8" rx="1" /><path d="M9.5 10.5h5l-1.5-1.5M14.5 13.5h-5l1.5 1.5" /></>),
    freight: (<><path d="M2 6h12v10H2zM14 9h5l3 4v3h-8" /><circle cx="6" cy="17.5" r="1.8" /><circle cx="18" cy="17.5" r="1.8" /></>),
    storage: (<><path d="M3 10 12 4l9 6v10H3z" /><path d="M7 20v-6h10v6M7 17h10" /></>),
    people: (<><circle cx="9" cy="8" r="3" /><path d="M3.5 19a5.5 5.5 0 0 1 11 0" /><circle cx="17" cy="9" r="2.3" /><path d="M16 14.2a4.5 4.5 0 0 1 5 4.8" /></>),
    starting: (<><rect x="4" y="15" width="3" height="5" rx="1" fill="currentColor" /><rect x="10.5" y="11" width="3" height="9" rx="1" opacity=".35" /><rect x="17" y="6" width="3" height="14" rx="1" opacity=".35" /></>),
    steady: (<><rect x="4" y="15" width="3" height="5" rx="1" fill="currentColor" /><rect x="10.5" y="11" width="3" height="9" rx="1" fill="currentColor" /><rect x="17" y="6" width="3" height="14" rx="1" opacity=".35" /></>),
    scaling: (<><rect x="4" y="15" width="3" height="5" rx="1" fill="currentColor" /><rect x="10.5" y="11" width="3" height="9" rx="1" fill="currentColor" /><rect x="17" y="6" width="3" height="14" rx="1" fill="currentColor" /></>),
    high: (<><rect x="3" y="14" width="3" height="6" rx="1" fill="currentColor" /><rect x="8.3" y="10" width="3" height="10" rx="1" fill="currentColor" /><rect x="13.6" y="6" width="3" height="14" rx="1" fill="currentColor" /><path d="M19 9V3m0 0-2.2 2.2M19 3l2.2 2.2" /></>),
  };
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base}>
      {paths[id]}
    </svg>
  );
};
