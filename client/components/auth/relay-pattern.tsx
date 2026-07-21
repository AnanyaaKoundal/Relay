export function RelayPattern({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 600 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* connection lines */}
      <path d="M100 300 Q200 150 300 300 T500 300" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.15" />
      <path d="M100 350 Q200 500 300 350 T500 350" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.10" />
      <path d="M200 100 Q300 200 200 300 T200 500" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.12" />
      <path d="M400 100 Q300 200 400 300 T400 500" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.08" />
      {/* nodes */}
      <circle cx="100" cy="300" r="2.5" fill="currentColor" opacity="0.2" />
      <circle cx="200" cy="200" r="1.5" fill="currentColor" opacity="0.15" />
      <circle cx="300" cy="300" r="2" fill="currentColor" opacity="0.2" />
      <circle cx="400" cy="150" r="1.5" fill="currentColor" opacity="0.12" />
      <circle cx="500" cy="300" r="2.5" fill="currentColor" opacity="0.18" />
      <circle cx="300" cy="450" r="1.5" fill="currentColor" opacity="0.12" />
      <circle cx="200" cy="400" r="1" fill="currentColor" opacity="0.1" />
      <circle cx="400" cy="400" r="1" fill="currentColor" opacity="0.1" />
      <circle cx="150" cy="250" r="1" fill="currentColor" opacity="0.08" />
      <circle cx="450" cy="250" r="1" fill="currentColor" opacity="0.08" />
    </svg>
  );
}
