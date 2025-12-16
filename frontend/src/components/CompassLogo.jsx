export default function CompassLogo({ className = '' }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      role="img"
    >
      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.95)" strokeWidth="1.2" />
      <path d="M16 8L11 13L8 16L11 11L16 8Z" fill="rgba(255,255,255,0.95)" />
      {/* subtle needle */}
      <path d="M12 6L13.8 11.2" stroke="rgba(255,255,255,0.95)" strokeWidth="0.9" strokeLinecap="round" />
    </svg>
  );
}
