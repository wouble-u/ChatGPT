interface DNALogoProps {
  size?: number;
  className?: string;
}

export default function DNALogo({ size = 40, className = '' }: DNALogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      aria-label="DNAchain Logo"
    >
      <defs>
        <linearGradient id="dnaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00ff88" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      {/* Outer ring */}
      <circle
        cx="50"
        cy="50"
        r="45"
        fill="none"
        stroke="url(#dnaGradient)"
        strokeWidth="2"
        opacity="0.3"
      />
      
      {/* DNA helix strands */}
      <g filter="url(#glow)">
        {/* Left strand */}
        <path
          d="M30 20 Q50 35 30 50 Q50 65 30 80"
          fill="none"
          stroke="#00ff88"
          strokeWidth="3"
          strokeLinecap="round"
        />
        
        {/* Right strand */}
        <path
          d="M70 20 Q50 35 70 50 Q50 65 70 80"
          fill="none"
          stroke="#06b6d4"
          strokeWidth="3"
          strokeLinecap="round"
        />
        
        {/* Cross connections */}
        <line x1="35" y1="27" x2="65" y2="27" stroke="#00ff88" strokeWidth="2" opacity="0.6" />
        <line x1="32" y1="38" x2="68" y2="38" stroke="#06b6d4" strokeWidth="2" opacity="0.6" />
        <line x1="35" y1="50" x2="65" y2="50" stroke="#00ff88" strokeWidth="2" opacity="0.6" />
        <line x1="32" y1="62" x2="68" y2="62" stroke="#06b6d4" strokeWidth="2" opacity="0.6" />
        <line x1="35" y1="73" x2="65" y2="73" stroke="#00ff88" strokeWidth="2" opacity="0.6" />
      </g>
    </svg>
  );
}
