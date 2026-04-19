interface WalletPanelProps {
  wallet: {
    connected: boolean;
    address: string | null;
    balance: number;
    pendingRewards: number;
  };
  onConnect: () => void;
  onClaim: () => void;
  isClaiming?: boolean;
  claimError?: string | null;
}

export default function WalletPanel({ wallet, onConnect, onClaim, isClaiming = false, claimError }: WalletPanelProps) {
  const formatAddress = (address: string): string => {
    if (address.length <= 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!wallet.connected) {
    return (
      <div className="bg-dna-card border border-dna-border rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-dna-text">Connect Wallet</h3>
            <p className="text-xs text-dna-text-dim mt-1">
              Connect to Base network to earn DNAC
            </p>
          </div>
          <button
            onClick={onConnect}
            className="flex items-center gap-2 px-4 py-2 bg-dna-purple hover:bg-dna-purple/80 text-white rounded-lg text-sm font-medium transition-colors"
            aria-label="Connect wallet"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
            Connect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dna-card border border-dna-border rounded-xl p-4 space-y-4">
      {/* Wallet Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-dna-accent to-dna-cyan flex items-center justify-center">
            <svg className="w-5 h-5 text-dna-bg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 18v1a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v1" />
              <path d="M21 12H8a2 2 0 00-2 2v0a2 2 0 002 2h13v-4z" />
              <circle cx="16" cy="14" r="1" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-medium text-dna-text">
              {wallet.address ? formatAddress(wallet.address) : 'Connected'}
            </div>
            <div className="text-xs text-dna-text-dim">Base Network</div>
          </div>
        </div>
        <div className="w-2 h-2 rounded-full bg-dna-accent" title="Connected" />
      </div>

      {/* Balance Section */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-dna-bg rounded-lg p-3">
          <div className="text-xs text-dna-text-dim mb-1">Balance</div>
          <div className="text-xl font-bold text-dna-text">
            {wallet.balance.toLocaleString()}
            <span className="text-xs text-dna-text-dim ml-1">DNAC</span>
          </div>
        </div>
        <div className="bg-dna-bg rounded-lg p-3">
          <div className="text-xs text-dna-text-dim mb-1">Pending</div>
          <div className="text-xl font-bold text-dna-accent">
            +{wallet.pendingRewards.toLocaleString()}
            <span className="text-xs text-dna-text-dim ml-1">DNAC</span>
          </div>
        </div>
      </div>

      {/* Claim Error */}
      {claimError && (
        <div className="bg-dna-danger/10 border border-dna-danger/30 rounded-lg p-3 text-sm text-dna-danger">
          {claimError}
        </div>
      )}

      {/* Claim Button */}
      {wallet.pendingRewards > 0 && (
        <button
          onClick={onClaim}
          disabled={isClaiming}
          className="w-full py-3 px-4 bg-gradient-to-r from-dna-accent to-dna-cyan text-dna-bg font-bold rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Claim pending rewards"
        >
          {isClaiming ? (
            <>
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                <path d="M12 2a10 10 0 0110 10" strokeLinecap="round" />
              </svg>
              Claiming...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" strokeLinecap="round" />
              </svg>
              Claim {wallet.pendingRewards.toLocaleString()} DNAC
            </>
          )}
        </button>
      )}
    </div>
  );
}
