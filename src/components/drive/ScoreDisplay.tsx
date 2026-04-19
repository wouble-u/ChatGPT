import { useEffect, useState } from 'react';

interface ScoreDisplayProps {
  score: number;
  isActive: boolean;
  stability: number;
}

export default function ScoreDisplay({ score, isActive, stability }: ScoreDisplayProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Animate score changes
  useEffect(() => {
    if (score !== displayScore) {
      setIsAnimating(true);
      const diff = score - displayScore;
      const step = Math.ceil(Math.abs(diff) / 10);
      
      const timer = setInterval(() => {
        setDisplayScore(prev => {
          const next = diff > 0 ? Math.min(prev + step, score) : Math.max(prev - step, score);
          if (next === score) {
            clearInterval(timer);
            setIsAnimating(false);
          }
          return next;
        });
      }, 50);

      return () => clearInterval(timer);
    }
  }, [score, displayScore]);

  // Calculate stability color
  const getStabilityColor = () => {
    if (stability >= 80) return 'text-dna-accent';
    if (stability >= 50) return 'text-dna-warning';
    return 'text-dna-danger';
  };

  return (
    <div className="relative bg-dna-card border border-dna-border rounded-2xl p-6 overflow-hidden">
      {/* Background glow effect */}
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-br from-dna-accent/5 to-dna-cyan/5 animate-pulse" />
      )}
      
      {/* Score ring */}
      <div className="relative flex flex-col items-center">
        <div 
          className={`relative w-40 h-40 rounded-full border-4 flex items-center justify-center ${
            isActive ? 'border-dna-accent animate-pulse-glow' : 'border-dna-border'
          }`}
        >
          {/* Stability arc */}
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="68"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeDasharray={`${(stability / 100) * 427} 427`}
              className={`transition-all duration-300 ${getStabilityColor()}`}
              strokeLinecap="round"
            />
          </svg>
          
          <div className="text-center">
            <div className="text-xs text-dna-text-dim uppercase tracking-wider mb-1">
              DNA Score
            </div>
            <div 
              className={`text-4xl font-bold text-dna-accent transition-transform ${
                isAnimating ? 'animate-score-pop' : ''
              }`}
            >
              {displayScore.toLocaleString()}
            </div>
            <div className="text-xs text-dna-text-dim mt-1">
              DNAC Tokens
            </div>
          </div>
        </div>

        {/* Stability indicator */}
        <div className="mt-4 flex items-center gap-2">
          <span className="text-xs text-dna-text-dim">Stability</span>
          <div className="w-24 h-2 bg-dna-border rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${
                stability >= 80 ? 'bg-dna-accent' : stability >= 50 ? 'bg-dna-warning' : 'bg-dna-danger'
              }`}
              style={{ width: `${stability}%` }}
            />
          </div>
          <span className={`text-xs font-medium ${getStabilityColor()}`}>
            {Math.round(stability)}%
          </span>
        </div>
      </div>
    </div>
  );
}
