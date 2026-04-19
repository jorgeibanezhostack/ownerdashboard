export default function HostackLogo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="28" height="28" rx="7" fill="#1a7a6e"/>
        <rect x="5" y="5" width="8" height="8" rx="2" fill="white" opacity="0.6"/>
        <rect x="15" y="5" width="8" height="8" rx="2" fill="white"/>
        <rect x="5" y="15" width="8" height="8" rx="2" fill="white"/>
        <rect x="15" y="15" width="8" height="8" rx="2" fill="white" opacity="0.6"/>
      </svg>
      <span className="font-semibold text-gray-900 text-lg leading-none">hostack</span>
    </span>
  )
}
