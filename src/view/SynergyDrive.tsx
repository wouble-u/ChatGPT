import { useState, useEffect, useCallback, useRef } from 'react';
import DriveStats from '~components/drive/DriveStats';
import DriveButton from '~components/drive/DriveButton';
import ScoreDisplay from '~components/drive/ScoreDisplay';
import WalletPanel from '~components/drive/WalletPanel';
import DriveHistory from '~components/drive/DriveHistory';
import DNALogo from '~components/drive/DNALogo';

interface DriveSession {
  id: string;
  startTime: number;
  endTime?: number;
  distance: number;
  avgSpeed: number;
  score: number;
  status: 'active' | 'completed' | 'claimed';
}

interface DriveState {
  isActive: boolean;
  speed: number;
  distance: number;
  duration: number;
  score: number;
  stability: number;
  speedHistory: number[];
}

export default function SynergyDrive() {
  const [driveState, setDriveState] = useState<DriveState>({
    isActive: false,
    speed: 0,
    distance: 0,
    duration: 0,
    score: 0,
    stability: 100,
    speedHistory: [],
  });

  const [wallet, setWallet] = useState<{
    connected: boolean;
    address: string | null;
    balance: number;
    pendingRewards: number;
  }>({
    connected: false,
    address: null,
    balance: 0,
    pendingRewards: 0,
  });

  const [sessions, setSessions] = useState<DriveSession[]>([]);
  const watchIdRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastPositionRef = useRef<GeolocationPosition | null>(null);
  const startTimeRef = useRef<number>(0);

  // Score calculation formula: score = (distance * 2) + (avgSpeed * 3) - suddenStops
  const calculateScore = useCallback((state: DriveState): number => {
    const distanceScore = state.distance * 2;
    const speedBonus = state.speedHistory.length > 0 
      ? (state.speedHistory.reduce((a, b) => a + b, 0) / state.speedHistory.length) * 3
      : 0;
    const stabilityBonus = state.stability * 0.5;
    return Math.floor(distanceScore + speedBonus + stabilityBonus);
  }, []);

  // Validate speed to prevent fake data
  const validateSpeed = (speed: number): boolean => {
    if (speed < 0) return false;
    if (speed > 60) return false; // 60 m/s = 216 km/h max
    return true;
  };

  // Analyze speed pattern for anti-cheat
  const analyzePattern = (speedHistory: number[]): boolean => {
    if (speedHistory.length < 20) return true;
    const last20 = speedHistory.slice(-20);
    const variance = Math.max(...last20) - Math.min(...last20);
    return variance >= 1; // If variance < 1, likely fake constant speed
  };

  const startDrive = useCallback(() => {
    if (!('geolocation' in navigator)) {
      console.error('Geolocation not supported');
      return;
    }

    startTimeRef.current = Date.now();
    
    setDriveState(prev => ({
      ...prev,
      isActive: true,
      speed: 0,
      distance: 0,
      duration: 0,
      score: 0,
      stability: 100,
      speedHistory: [],
    }));

    // Start GPS tracking
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const speed = position.coords.speed || 0;
        
        if (!validateSpeed(speed)) return;

        setDriveState(prev => {
          const newSpeedHistory = [...prev.speedHistory, speed].slice(-100);
          
          if (!analyzePattern(newSpeedHistory)) {
            console.warn('Suspicious speed pattern detected');
          }

          // Calculate distance from last position
          let addedDistance = 0;
          if (lastPositionRef.current) {
            addedDistance = calculateDistance(
              lastPositionRef.current.coords.latitude,
              lastPositionRef.current.coords.longitude,
              position.coords.latitude,
              position.coords.longitude
            );
          }
          lastPositionRef.current = position;

          // Calculate stability (penalize sudden speed changes)
          const lastSpeed = prev.speedHistory[prev.speedHistory.length - 1] || speed;
          const speedDiff = Math.abs(speed - lastSpeed);
          const newStability = Math.max(0, prev.stability - (speedDiff > 5 ? speedDiff * 2 : 0));

          const newState = {
            ...prev,
            speed: speed * 3.6, // Convert m/s to km/h
            distance: prev.distance + addedDistance,
            speedHistory: newSpeedHistory,
            stability: Math.min(100, newStability + 0.5), // Slowly recover stability
          };

          return {
            ...newState,
            score: calculateScore(newState),
          };
        });
      },
      (error) => {
        console.error('GPS Error:', error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 5000,
      }
    );

    // Duration timer
    intervalRef.current = setInterval(() => {
      setDriveState(prev => ({
        ...prev,
        duration: Math.floor((Date.now() - startTimeRef.current) / 1000),
      }));
    }, 1000);
  }, [calculateScore]);

  // Send score to backend API when drive completes
  const sendScoreToBackend = useCallback(async (score: number) => {
    try {
      const response = await fetch("/api/reward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score })
      });
      const data = await response.json();
      if (data.success) {
        console.log("Reward minted, TX:", data.txHash);
      } else {
        console.error("Reward error:", data.error);
      }
    } catch (err) {
      console.error("Backend request failed:", err);
    }
  }, []);

  const stopDrive = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    lastPositionRef.current = null;

    setDriveState(prev => {
      // Create completed session
      const session: DriveSession = {
        id: crypto.randomUUID(),
        startTime: startTimeRef.current,
        endTime: Date.now(),
        distance: prev.distance,
        avgSpeed: prev.speedHistory.length > 0 
          ? (prev.speedHistory.reduce((a, b) => a + b, 0) / prev.speedHistory.length) * 3.6
          : 0,
        score: prev.score,
        status: 'completed',
      };

      setSessions(s => [session, ...s]);
      
      setWallet(w => ({
        ...w,
        pendingRewards: w.pendingRewards + prev.score,
      }));

      // Send score to backend for token minting
      if (prev.score > 0) {
        sendScoreToBackend(prev.score);
      }

      return {
        ...prev,
        isActive: false,
      };
    });
  }, [sendScoreToBackend]);

  const connectWallet = useCallback(async () => {
    // Simulated wallet connection
    // In production, this would use window.ethereum
    try {
      // Check if MetaMask is installed
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const accounts = await (window as any).ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        
        if (accounts.length > 0) {
          setWallet({
            connected: true,
            address: accounts[0],
            balance: 1250.75, // Would fetch from contract
            pendingRewards: 0,
          });
        }
      } else {
        // Demo mode without MetaMask
        setWallet({
          connected: true,
          address: '0x887a...3c19',
          balance: 1250.75,
          pendingRewards: 0,
        });
      }
    } catch (error) {
      console.error('Wallet connection failed:', error);
    }
  }, []);

  const [isClaiming, setIsClaiming] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);

  const claimRewards = useCallback(async () => {
    if (wallet.pendingRewards <= 0 || !wallet.address) return;

    setIsClaiming(true);
    setClaimError(null);

    try {
      // Call backend API to mint tokens
      const response = await fetch('/api/reward', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          score: wallet.pendingRewards,
          walletAddress: wallet.address,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to claim rewards');
      }

      // Update local state after successful claim
      setWallet(prev => ({
        ...prev,
        balance: prev.balance + prev.pendingRewards,
        pendingRewards: 0,
      }));

      setSessions(prev => 
        prev.map(s => 
          s.status === 'completed' ? { ...s, status: 'claimed' as const } : s
        )
      );

    } catch (error) {
      console.error('Claim failed:', error);
      setClaimError(error instanceof Error ? error.message : 'Claim failed');
    } finally {
      setIsClaiming(false);
    }
  }, [wallet.pendingRewards, wallet.address]);

  // Haversine formula for distance calculation
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-dna-bg text-dna-text p-4 overflow-y-auto">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <header className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <DNALogo size={40} />
            <div>
              <h1 className="text-lg font-bold text-dna-text">SYNERGY DRIVE</h1>
              <p className="text-xs text-dna-text-dim">Drive-to-Earn Protocol</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${driveState.isActive ? 'bg-dna-accent animate-pulse' : 'bg-dna-text-dim'}`} />
            <span className="text-xs text-dna-text-dim">
              {driveState.isActive ? 'ACTIVE' : 'IDLE'}
            </span>
          </div>
        </header>

        {/* Score Display */}
        <ScoreDisplay 
          score={driveState.score} 
          isActive={driveState.isActive}
          stability={driveState.stability}
        />

        {/* Drive Stats */}
        <DriveStats 
          speed={driveState.speed}
          distance={driveState.distance}
          duration={driveState.duration}
          isActive={driveState.isActive}
        />

        {/* Drive Control Button */}
        <DriveButton 
          isActive={driveState.isActive}
          onStart={startDrive}
          onStop={stopDrive}
          disabled={!wallet.connected}
        />

        {/* Wallet Panel */}
        <WalletPanel 
          wallet={wallet}
          onConnect={connectWallet}
          onClaim={claimRewards}
          isClaiming={isClaiming}
          claimError={claimError}
        />

        {/* Drive History */}
        <DriveHistory sessions={sessions} />
      </div>
    </div>
  );
}
