interface DriveStatsProps {
  speed: number;
  distance: number;
  duration: number;
  isActive: boolean;
}

export default function DriveStats({ speed, distance, duration, isActive }: DriveStatsProps) {
  // Format duration as HH:MM:SS
  const formatDuration = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const stats = [
    {
      label: 'Speed',
      value: speed.toFixed(1),
      unit: 'km/h',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L12 6" strokeLinecap="round" />
          <path d="M12 18L12 22" strokeLinecap="round" />
          <circle cx="12" cy="12" r="8" />
          <path d="M12 12L16 8" strokeLinecap="round" />
        </svg>
      ),
      highlight: speed > 30,
    },
    {
      label: 'Distance',
      value: distance.toFixed(2),
      unit: 'km',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      ),
      highlight: distance > 1,
    },
    {
      label: 'Duration',
      value: formatDuration(duration),
      unit: '',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6L12 12L16 14" strokeLinecap="round" />
        </svg>
      ),
      highlight: duration > 300,
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`bg-dna-card border rounded-xl p-3 text-center transition-all duration-300 ${
            isActive && stat.highlight 
              ? 'border-dna-accent/50 bg-dna-accent/5' 
              : 'border-dna-border'
          }`}
        >
          <div className={`flex justify-center mb-2 ${
            isActive && stat.highlight ? 'text-dna-accent' : 'text-dna-text-dim'
          }`}>
            {stat.icon}
          </div>
          <div className="text-lg font-bold text-dna-text">
            {stat.value}
            {stat.unit && <span className="text-xs text-dna-text-dim ml-1">{stat.unit}</span>}
          </div>
          <div className="text-xs text-dna-text-dim mt-1">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
