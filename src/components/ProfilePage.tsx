import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserBestResults, getUserByUsername, updateUsername, getCurrentUsername, getUserAllScores, getUserLeaderboardRank } from '../services/firestore';
import { PencilIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface BestResult {
  mode: number;
  wpm: number;
  accuracy: number;
  score: number;
}

const ProfilePage = ({ onBack }: { onBack: () => void }) => {
  const { user, logout } = useAuth();
  const [bestResults, setBestResults] = useState<BestResult[]>([]);
  const [search, setSearch] = useState('');
  const [searchResult, setSearchResult] = useState<{ username: string; bestResults: BestResult[] } | null>(null);
  const [searchError, setSearchError] = useState('');
  const [username, setUsername] = useState(user?.email ? user.email.split('@')[0] : '');
  const [newUsername, setNewUsername] = useState('');
  const [usernameMsg, setUsernameMsg] = useState('');
  const [editingUsername, setEditingUsername] = useState(false);
  const [userModalData, setUserModalData] = useState<any>(null);
  const [userModalOpen, setUserModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      getUserBestResults(user.uid).then(setBestResults);
      getCurrentUsername(user.uid).then((uname) => {
        setUsername(uname || (user.email ? user.email.split('@')[0] : ''));
      });
    }
  }, [user]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');
    setSearchResult(null);
    setUserModalOpen(false);
    if (!search.trim()) return;
    try {
      const foundUser = await getUserByUsername(search.trim());
      if (!foundUser) {
        setSearchError('User not found.');
        return;
      }
      // Fetch all scores and ranks
      const allScores = await getUserAllScores(foundUser.userId);
      const bestResults = await getUserBestResults(foundUser.userId);
      const rank30 = await getUserLeaderboardRank(foundUser.username, 30);
      const rank60 = await getUserLeaderboardRank(foundUser.username, 60);
      setUserModalData({
        username: foundUser.username,
        bestResults,
        allScores,
        rank30,
        rank60
      });
      setUserModalOpen(true);
    } catch (err) {
      setSearchError('Error searching for user.');
    }
  };

  const handleUsernameChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setUsernameMsg('');
    if (!newUsername.trim() || !user) return;
    
    try {
      const success = await updateUsername(user.uid, newUsername.trim());
      if (success) {
        setUsername(newUsername.trim());
        setUsernameMsg('Username updated!');
        setNewUsername('');
        setEditingUsername(false);
        
        // Refresh best results to show updated username
        getUserBestResults(user.uid).then(setBestResults);
      } else {
        setUsernameMsg('Username is already taken or update failed.');
      }
    } catch (error) {
      console.error('Error updating username:', error);
      setUsernameMsg('Failed to update username.');
    }
  };

  const renderResults = (results: BestResult[]) => (
    <div className="flex flex-col gap-2 mt-2">
      {results.length === 0 ? (
        <span className="text-gray-400">No results yet.</span>
      ) : (
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="px-2">Mode</th>
              <th className="px-2">WPM</th>
              <th className="px-2">Accuracy</th>
              <th className="px-2">Score</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.mode} className="bg-[var(--color-card)] rounded-lg">
                <td className="px-2 font-bold text-yellow-400">{r.mode}s</td>
                <td className="px-2">{r.wpm}</td>
                <td className="px-2">{r.accuracy}%</td>
                <td className="px-2">{r.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-[var(--color-bg)] text-[var(--color-text)] px-4 py-8">
      <div className="w-full max-w-md bg-[var(--color-card)] rounded-2xl p-8 flex flex-col items-center">
        <button onClick={onBack} className="absolute left-4 top-4 text-yellow-400 hover:text-yellow-500 text-2xl font-bold">←</button>
        <div className="w-20 h-20 rounded-full bg-yellow-400 flex items-center justify-center text-3xl font-bold text-gray-900 mb-4" style={{ background: 'var(--color-primary)', color: 'var(--color-bg)' }}>
          {user?.email ? user.email[0].toUpperCase() : '?'}
        </div>
        <div className="text-xl font-bold mb-2 flex items-center gap-2">
          {username || 'Anonymous'}
          <button
            type="button"
            className="ml-2 p-1 rounded bg-[var(--color-card)] hover:bg-[var(--color-primary)] border border-[var(--color-primary)] transition-colors"
            onClick={() => setEditingUsername(true)}
            aria-label="Edit username"
          >
            <PencilIcon className="w-5 h-5 text-[var(--color-primary)]" />
          </button>
        </div>
        {editingUsername && (
          <form onSubmit={handleUsernameChange} className="flex gap-2 mb-4 w-full animate-fade-in">
            <input
              type="text"
              value={newUsername}
              onChange={e => setNewUsername(e.target.value)}
              className="flex-1 px-3 py-2 rounded bg-[var(--color-bg)] border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-primary)]"
              placeholder="Change username..."
              autoFocus
            />
            <button type="submit" className="px-4 py-2 bg-[var(--color-primary)] text-[var(--color-bg)] rounded-lg font-bold hover:bg-[var(--color-secondary)]">Update</button>
            <button type="button" onClick={() => { setEditingUsername(false); setNewUsername(''); setUsernameMsg(''); }} className="p-2 rounded bg-[var(--color-card)] hover:bg-[var(--color-primary)] border border-[var(--color-primary)] transition-colors" aria-label="Cancel">
              <XMarkIcon className="w-5 h-5 text-[var(--color-primary)]" />
            </button>
          </form>
        )}
        {usernameMsg && <div className="mb-2 text-sm text-[var(--color-primary)]">{usernameMsg}</div>}
        <div className="mb-6 w-full">
          <h3 className="text-lg font-semibold mb-2">Your Best Results</h3>
          {renderResults(bestResults)}
        </div>
        <button onClick={logout} className="w-full py-2 bg-[var(--color-primary)] text-[var(--color-bg)] rounded-lg font-bold hover:bg-[var(--color-secondary)] mb-6">Logout</button>
        <form onSubmit={handleSearch} className="w-full flex flex-col gap-2 mb-2">
          <label className="text-sm font-semibold">Search user by username</label>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-3 py-2 rounded bg-[var(--color-bg)] border border-[var(--color-border)] focus:outline-none focus:border-yellow-400"
            placeholder="Enter username..."
          />
          <button type="submit" className="py-2 bg-[var(--color-primary)] text-[var(--color-bg)] rounded-lg font-bold hover:bg-[var(--color-secondary)]">Search</button>
        </form>
        {searchError && <div className="text-red-500 text-sm mb-2">{searchError}</div>}
        {searchResult && (
          <div className="w-full mt-2">
            <h4 className="font-bold mb-1">{searchResult.username}'s Best Results</h4>
            {renderResults(searchResult.bestResults)}
          </div>
        )}
      </div>
      {/* User Modal Panel */}
      {userModalOpen && userModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="relative w-full max-w-lg mx-auto bg-[var(--color-card)] rounded-2xl p-8 flex flex-col items-center shadow-lg">
            <button onClick={() => setUserModalOpen(false)} className="absolute top-2 right-2 p-2 rounded bg-[var(--color-card)] hover:bg-[var(--color-primary)] border border-[var(--color-primary)] transition-colors z-10" aria-label="Close">
              <XMarkIcon className="w-6 h-6 text-[var(--color-primary)]" />
            </button>
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold mb-4" style={{ background: 'var(--color-primary)', color: 'var(--color-bg)' }}>
              {userModalData.username[0].toUpperCase()}
            </div>
            <div className="text-xl font-bold mb-2" style={{ color: 'var(--color-primary)' }}>{userModalData.username}</div>
            <div className="mb-2 w-full flex flex-col items-center">
              <div className="flex gap-4 mb-2">
                <span className="text-sm text-gray-400">Rank 30s: <span className="text-yellow-400 font-bold">{userModalData.rank30 ?? 'N/A'}</span></span>
                <span className="text-sm text-gray-400">Rank 60s: <span className="text-yellow-400 font-bold">{userModalData.rank60 ?? 'N/A'}</span></span>
              </div>
              <div className="flex gap-4 mb-2">
                <span className="text-sm text-gray-400">First login: <span className="text-yellow-400 font-bold">{userModalData.allScores.length > 0 ? new Date(userModalData.allScores[0].timestamp.toDate()).toLocaleDateString() : 'N/A'}</span></span>
                <span className="text-sm text-gray-400">Last activity: <span className="text-yellow-400 font-bold">{userModalData.allScores.length > 0 ? new Date(userModalData.allScores[userModalData.allScores.length-1].timestamp.toDate()).toLocaleDateString() : 'N/A'}</span></span>
              </div>
              <div className="flex gap-4 mb-2">
                <span className="text-sm text-gray-400">Last result: <span className="text-yellow-400 font-bold">{userModalData.allScores.length > 0 ? `${userModalData.allScores[userModalData.allScores.length-1].wpm} WPM, ${userModalData.allScores[userModalData.allScores.length-1].accuracy}%` : 'N/A'}</span></span>
              </div>
            </div>
            <div className="w-full">
              <h4 className="font-semibold mb-2">Best Results</h4>
              <table className="w-full text-left">
                <thead>
                  <tr>
                    <th className="px-2">Mode</th>
                    <th className="px-2">WPM</th>
                    <th className="px-2">Accuracy</th>
                    <th className="px-2">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {userModalData.bestResults.map((r: any) => (
                    <tr key={r.mode} className="bg-[var(--color-card)] rounded-lg">
                      <td className="px-2 font-bold text-yellow-400">{r.mode}s</td>
                      <td className="px-2">{r.wpm}</td>
                      <td className="px-2">{r.accuracy}%</td>
                      <td className="px-2">{r.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage; 