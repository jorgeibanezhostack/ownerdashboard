export default function HostackLogo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg width="28" height="28" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Hostack">
        <defs>
          <linearGradient id="hostack-bg" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#005060" />
            <stop offset="100%" stopColor="#008F88" />
          </linearGradient>
        </defs>
        <rect width="36" height="36" rx="9" fill="url(#hostack-bg)" />
        <rect x="5" y="5" width="11" height="11" rx="2.5" fill="white" fillOpacity="0.85" />
        <rect x="20" y="5" width="11" height="11" rx="2.5" fill="white" fillOpacity="0.55" />
        <rect x="5" y="20" width="11" height="11" rx="2.5" fill="white" fillOpacity="0.50" />
        <rect x="20" y="20" width="11" height="11" rx="2.5" fill="white" fillOpacity="0.45" />
      </svg>
      <span className="font-semibold text-white text-lg leading-none">hostack</span>
    </span>
  )
}
