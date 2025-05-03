import { Cog6ToothIcon, InformationCircleIcon, TrophyIcon, UserCircleIcon } from '@heroicons/react/24/outline';

interface TopBarProps {
  mode: number;
  setMode: (mode: number) => void;
  onSettingsClick: () => void;
  onLeaderboardClick: () => void;
  onTypeClick: () => void;
  onProfileClick: () => void;
  punctuation: boolean;
  setPunctuation: (val: boolean) => void;
  numbers: boolean;
  setNumbers: (val: boolean) => void;
  showLeaderboard: boolean;
  showProfile: boolean;
  hideIcons?: boolean;
}

const TopBar = ({ mode, setMode, onSettingsClick, onLeaderboardClick, onTypeClick, onProfileClick, punctuation, setPunctuation, numbers, setNumbers, showLeaderboard, showProfile, hideIcons }: TopBarProps) => {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-8 py-3 border-b shadow-md"
      style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}>
      <div className="flex items-center gap-2">
        <span
          className={`flex items-center gap-2 text-2xl font-bold tracking-tight cursor-pointer select-none px-3 py-1 transition-colors duration-200 text-[var(--color-primary)]`}
          onClick={onTypeClick}
          style={{ userSelect: 'none', background: 'none', boxShadow: 'none', border: 'none' }}
        >
          Ryuu , typing
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6 ml-2 text-[var(--color-primary)]" style={{ display: 'inline', verticalAlign: 'middle' }}>
            <rect x="3" y="5" width="18" height="14" rx="2" strokeWidth="2" />
            <rect x="7" y="15" width="2" height="2" rx="0.5" strokeWidth="2" />
            <rect x="11" y="15" width="2" height="2" rx="0.5" strokeWidth="2" />
            <rect x="15" y="15" width="2" height="2" rx="0.5" strokeWidth="2" />
          </svg>
        </span>
        <div className={hideIcons ? 'fade-icons' : ''} style={{ display: 'flex', alignItems: 'center', gap: '8px', transition: 'opacity 0.5s', opacity: hideIcons ? 0 : 1 }}>
          <button onClick={onLeaderboardClick} className={`ml-4 focus:outline-none rounded ${showLeaderboard ? 'bg-[var(--color-primary)] text-[var(--color-bg)] font-bold shadow' : 'bg-[var(--color-card)] text-[var(--color-primary)] border border-[var(--color-primary)]'}`}>
            <TrophyIcon className="w-5 h-5" />
          </button>
          <InformationCircleIcon className="w-5 h-5 ml-2 text-[var(--color-primary)]" />
        </div>
      </div>
      <div className={hideIcons ? 'fade-icons' : ''} style={{ display: 'flex', alignItems: 'center', gap: '8px', transition: 'opacity 0.5s', opacity: hideIcons ? 0 : 1 }}>
        <span className="text-[var(--color-primary)] font-bold">time</span>
        <button
          className={`ml-4 px-2 py-1 rounded ${mode === 30 ? 'bg-[var(--color-primary)] text-[var(--color-bg)] font-bold' : 'bg-[var(--color-card)] text-[var(--color-primary)] border border-[var(--color-primary)]'}`}
          onClick={() => setMode(30)}
        >
          30
        </button>
        <button
          className={`ml-2 px-2 py-1 rounded ${mode === 60 ? 'bg-[var(--color-primary)] text-[var(--color-bg)] font-bold' : 'bg-[var(--color-card)] text-[var(--color-primary)] border border-[var(--color-primary)]'}`}
          onClick={() => setMode(60)}
        >
          60
        </button>
        <span className="text-gray-400">@</span>
        <button
          className={`px-2 py-1 rounded border-2 transition-colors duration-200 ${punctuation ? 'bg-[var(--color-primary)] text-[var(--color-bg)] border-[var(--color-primary)] font-bold' : 'bg-[var(--color-card)] text-[var(--color-primary)] border-[var(--color-primary)] hover:border-[var(--color-primary)]'}`}
          onClick={() => setPunctuation(!punctuation)}
        >
          punctuation
        </button>
        <span className="text-gray-400">#</span>
        <button
          className={`px-2 py-1 rounded border-2 transition-colors duration-200 ${numbers ? 'bg-[var(--color-primary)] text-[var(--color-bg)] border-[var(--color-primary)] font-bold' : 'bg-[var(--color-card)] text-[var(--color-primary)] border-[var(--color-primary)] hover:border-[var(--color-primary)]'}`}
          onClick={() => setNumbers(!numbers)}
        >
          numbers
        </button>
        <button onClick={onSettingsClick} className="ml-6 p-2 rounded bg-[var(--color-card)] hover:bg-[var(--color-primary)] border border-[var(--color-primary)] transition-colors">
          <Cog6ToothIcon className="w-6 h-6 text-[var(--color-primary)] transition-colors" />
        </button>
        <button onClick={onProfileClick} className={`ml-4 p-2 rounded-full transition-colors duration-200 border-2 ${showProfile ? 'bg-[var(--color-primary)] text-[var(--color-bg)] border-[var(--color-primary)] font-bold shadow' : 'bg-[var(--color-card)] text-[var(--color-primary)] border-[var(--color-primary)] hover:border-[var(--color-primary)]'}`}>
          <UserCircleIcon className="w-7 h-7" />
        </button>
      </div>
    </nav>
  );
};

export default TopBar; 