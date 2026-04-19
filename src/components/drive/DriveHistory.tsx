interface DriveSession {
  id: string;
  startTime: number;
  endTime?: number;
  distance: number;
  avgSpeed: number;
  score: number;
  status: 'active' | 'completed' | 'claimed';
}

interface DriveHistoryProps {
  sessions: DriveSession[];
}

export default function DriveHistory({ sessions }: DriveHistoryProps) {
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (start: number, end?: number): string => {
    if (!end) return '--:--';
    const seconds = Math.floor((end - start) / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (sessions.length === 0) {
    return (
      <div className="bg-dna-card border border-dna-border rounded-xl p-6 text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-dna-border flex items-center justify-center">
          <svg className="w-6 h-6 text-dna-text-dim" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" strokeLinecap="round" />
          </svg>
        </div>
        <h3 className="text-sm font-medium text-dna-text">No Drive History</h3>
        <p className="text-xs text-dna-text-dim mt-1">
          Start your first drive to earn DNAC tokens
        </p>
      </div>
    );
  }

  return (
    <div className="bg-dna-card border border-dna-border rounded-xl overflow-hidden">
      <div className="p-4 border-b border-dna-border">
        <h3 className="text-sm font-medium text-dna-text flex items-center gap-2">
          <svg className="w-4 h-4 text-dna-text-dim" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 8v4l3 3" strokeLinecap="round" />
            <circle cx="12" cy="12" r="10" />
          </svg>
          Recent Drives
        </h3>
      </div>

      <div className="divide-y divide-dna-border max-h-64 overflow-y-auto">
        {sessions.map((session) => (
          <div key={session.id} className="p-4 hover:bg-dna-bg/50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    session.status === 'claimed' 
                      ? 'bg-dna-accent' 
                      : session.status === 'completed' 
                        ? 'bg-dna-warning' 
                        : 'bg-dna-cyan'
                  }`} />
                  <span className="text-sm font-medium text-dna-text">
                    {formatDate(session.startTime)}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-4 text-xs text-dna-text-dim">
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {session.distance.toFixed(2)} km
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" strokeLinecap="round" />
                    </svg>
                    {formatDuration(session.startTime, session.endTime)}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2L12 6" strokeLinecap="round" />
                      <circle cx="12" cy="12" r="8" />
                      <path d="M12 12L16 8" strokeLinecap="round" />
                    </svg>
                    {session.avgSpeed.toFixed(1)} km/h
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold ${
                  session.status === 'claimed' ? 'text-dna-accent' : 'text-dna-warning'
                }`}>
                  +{session.score.toLocaleString()}
                </div>
                <div className="text-xs text-dna-text-dim">DNAC</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
