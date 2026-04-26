export default function HostackLogo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Hostack">
        <defs>
          <linearGradient id="hostack-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#004F59" />
            <stop offset="55%" stopColor="#00BFB3" />
            <stop offset="100%" stopColor="#4af8d4" />
          </linearGradient>
        </defs>
        {/* Top-left: dark teal */}
        <rect x="2" y="2" width="12" height="12" rx="2.5" fill="url(#hostack-grad)" />
        {/* Top-right: mid teal-turquoise */}
        <rect x="18" y="2" width="12" height="12" rx="2.5" fill="url(#hostack-grad)" />
        {/* Bottom-left: mid turquoise */}
        <rect x="2" y="18" width="12" height="12" rx="2.5" fill="url(#hostack-grad)" />
        {/* Bottom-right: neon */}
        <rect x="18" y="18" width="12" height="12" rx="2.5" fill="url(#hostack-grad)" />
      </svg>
      <span className="font-semibold text-gray-900 text-lg leading-none">hostack</span>
    </span>
  )
}
