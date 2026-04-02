interface DriveButtonProps {
  isActive: boolean;
  onStart: () => void;
  onStop: () => void;
  disabled?: boolean;
}

export default function DriveButton({ 
  isActive, 
  onStart, 
  onStop, 
  disabled = false 
}: DriveButtonProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={isActive ? onStop : onStart}
        disabled={disabled}
        className={`relative w-full py-4 px-8 rounded-xl font-bold text-lg uppercase tracking-wider transition-all duration-300 ${
          disabled
            ? 'bg-dna-border text-dna-text-dim cursor-not-allowed'
            : isActive
              ? 'bg-dna-danger hover:bg-dna-danger/80 text-white'
              : 'bg-dna-accent hover:bg-dna-accent-dim text-dna-bg'
        }`}
        aria-label={isActive ? 'Stop driving session' : 'Start driving session'}
      >
        {/* Glow effect when active */}
        {isActive && (
          <span className="absolute inset-0 rounded-xl bg-dna-danger/20 animate-ping" />
        )}
        
        <span className="relative flex items-center justify-center gap-3">
          {isActive ? (
            <>
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
              Stop Drive
            </>
          ) : (
            <>
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="8,5 19,12 8,19" />
              </svg>
              Start Drive
            </>
          )}
        </span>
      </button>

      {disabled && (
        <p className="text-xs text-dna-warning text-center">
          Connect your wallet to start earning DNAC tokens
        </p>
      )}

      {isActive && (
        <div className="flex items-center gap-2 text-sm text-dna-text-dim">
          <span className="w-2 h-2 rounded-full bg-dna-accent animate-pulse" />
          GPS tracking active
        </div>
      )}
    </div>
  );
}
