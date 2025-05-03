import { useState, useEffect } from 'react';
import { getTopScores, Score } from '../services/firestore';
import AddSampleScores from './AddSampleScores';
import { ClockIcon } from '@heroicons/react/24/outline';

const Leaderboard = () => {
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [mode, setMode] = useState(30); // 30s or 60s
  const scoresPerPage = 10;

  const fetchScores = async (selectedMode: number) => {
    try {
      const scoresData = await getTopScores(100, selectedMode);
      // Group by username and keep only the highest score for each user
      const bestScoresMap = new Map();
      scoresData.forEach(score => {
        if (!bestScoresMap.has(score.username) || score.score > bestScoresMap.get(score.username).score) {
          bestScoresMap.set(score.username, score);
        }
      });
      // Convert map to array and sort by score descending
      const bestScores = Array.from(bestScoresMap.values()).sort((a, b) => b.score - a.score);
      setScores(bestScores);
    } catch (err) {
      setError('Failed to load leaderboard');
      console.error('Error fetching scores:', err);
    } finally {
      setLoading(false);
    }
  };

  // Refresh scores every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchScores(mode);
    }, 5000);

    return () => clearInterval(interval);
  }, [mode]);

  useEffect(() => {
    setLoading(true);
    fetchScores(mode);
    setCurrentPage(1);
  }, [mode]);

  // Calculate pagination
  const indexOfLastScore = currentPage * scoresPerPage;
  const indexOfFirstScore = indexOfLastScore - scoresPerPage;
  const currentScores = scores.slice(indexOfFirstScore, indexOfLastScore);
  const totalPages = Math.ceil(scores.length / scoresPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full flex flex-col md:flex-row max-w-6xl mx-auto min-h-[70vh]">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[var(--color-card)] rounded-2xl md:rounded-l-2xl md:rounded-r-none p-4 flex md:flex-col flex-row gap-2 md:gap-4 mb-4 md:mb-0 md:mr-6 shadow-lg mt-8">
        {[30, 60].map((m) => (
          <button
            key={m}
            className={`flex items-center gap-3 px-4 py-3 w-full md:w-auto rounded-lg font-semibold text-lg transition-colors duration-200
              ${mode === m ? 'bg-[var(--color-primary)] text-[var(--color-bg)] shadow' : 'bg-transparent text-[var(--color-primary)] hover:bg-[var(--color-secondary)]'}`}
            onClick={() => setMode(m)}
          >
            <ClockIcon className="w-6 h-6" />
            <span className="font-mono">time {m}</span>
          </button>
        ))}
      </aside>
      {/* Main leaderboard content */}
      <main className="flex-1 bg-[var(--color-card)] rounded-2xl p-6 shadow-lg overflow-x-auto mx-auto md:ml-8 mt-8">
        <h2 className="text-3xl font-bold mb-6 text-[var(--color-text)] tracking-tight font-mono">
          All-time Time {mode} Leaderboard
        </h2>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)] mx-auto"></div>
            <p className="mt-4 text-[var(--color-text)]">Loading leaderboard...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500 dark:text-red-400">
            {error}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full rounded-lg overflow-hidden bg-[var(--color-card)]" style={{ border: 'none', boxShadow: 'none' }}>
                <thead>
                  <tr className="bg-[var(--color-secondary)]">
                    <th className="p-3 text-left text-[var(--color-text)] font-mono">#</th>
                    <th className="p-3 text-left text-[var(--color-text)] font-mono">name</th>
                    <th className="p-3 text-left text-[var(--color-text)] font-mono">wpm</th>
                    <th className="p-3 text-left text-[var(--color-text)] font-mono">accuracy</th>
                    <th className="p-3 text-left text-[var(--color-text)] font-mono">score</th>
                    <th className="p-3 text-left text-[var(--color-text)] font-mono">date</th>
                  </tr>
                </thead>
                <tbody>
                  {currentScores.map((score, index) => (
                    <tr key={score.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-secondary)] transition-colors">
                      <td className="p-3 text-[var(--color-text)] font-mono text-lg">
                        {indexOfFirstScore + index + 1 === 1 ? '🥇' :
                         indexOfFirstScore + index + 1 === 2 ? '🥈' :
                         indexOfFirstScore + index + 1 === 3 ? '🥉' :
                         indexOfFirstScore + index + 1}
                      </td>
                      <td className="p-3 text-[var(--color-text)] font-mono text-lg">{score.username}</td>
                      <td className="p-3 text-[var(--color-text)] font-mono text-lg">{score.wpm}</td>
                      <td className="p-3 text-[var(--color-text)] font-mono text-lg">{score.accuracy}%</td>
                      <td className="p-3 text-[var(--color-text)] font-mono text-lg">{score.score}</td>
                      <td className="p-3 text-[var(--color-text)] font-mono text-lg">
                        {score.timestamp.toDate().toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {scores.length === 0 && (
              <div className="text-center py-8 text-[var(--color-text)] opacity-70">
                No scores yet. Be the first to set a record!
              </div>
            )}
            {/* Pagination */}
            {scores.length > 0 && (
              <div className="flex justify-center mt-6 space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-[var(--color-text)] bg-[var(--color-card)] border border-[var(--color-border)] rounded-md hover:bg-[var(--color-secondary)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-sm font-medium text-[var(--color-text)]">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-medium text-[var(--color-text)] bg-[var(--color-card)] border border-[var(--color-border)] rounded-md hover:bg-[var(--color-secondary)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Leaderboard; 