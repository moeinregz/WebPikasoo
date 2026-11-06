// Small inline icons — plain SVG, no icon library.
const P = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" {...P} aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
  </svg>
);

export const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" {...P} aria-hidden="true">
    <path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2" />
  </svg>
);

export const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7a2.8 2.8 0 0 0 1.8-1.3 2.3 2.3 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3z" />
  </svg>
);

export const SERVICE_ICONS = [
  // full-time hosting
  <svg key="0" viewBox="0 0 48 48" {...P}><circle cx="24" cy="26" r="16" /><path d="M24 16v10l7 5M18 6h12M24 6v4" /></svg>,
  // parking
  <svg key="1" viewBox="0 0 48 48" {...P}><rect x="7" y="7" width="34" height="34" rx="8" /><path d="M19 34V14h7a6 6 0 0 1 0 12h-7" /></svg>,
  // food (cloche)
  <svg key="2" viewBox="0 0 48 48" {...P}><path d="M6 34h36M9 34a15 15 0 0 1 30 0M24 15v-3M21 12h6M8 39h32" /></svg>,
  // live music
  <svg key="3" viewBox="0 0 48 48" {...P}><path d="M18 36V10l20-4v26M18 17l20-4" /><circle cx="13" cy="36" r="5" /><circle cx="33" cy="32" r="5" /></svg>,
  // artists (star)
  <svg key="4" viewBox="0 0 48 48" {...P}><path d="M24 5l5.6 11.4 12.6 1.8-9.1 8.9 2.1 12.5L24 33.7l-11.2 5.9 2.1-12.5-9.1-8.9 12.6-1.8z" /></svg>,
];
