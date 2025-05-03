import { useState, useEffect, useRef } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import TypingTest from './components/TypingTest'
import AuthForms from './components/AuthForms'
import Leaderboard from './components/Leaderboard'
import SettingsPanel from './components/SettingsPanel'
import TopBar from './components/TopBar'
import ProfilePage from './components/ProfilePage'
import './App.css'

const AppContent = ({ theme, setTheme }: { theme: string, setTheme: (theme: string) => void }) => {
  const { user, signIn, signUp } = useAuth()
  const [showSettings, setShowSettings] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [mode, setMode] = useState(30) // 30s or 60s
  const [punctuation, setPunctuation] = useState(false)
  const [numbers, setNumbers] = useState(false)
  const [typingActive, setTypingActive] = useState(false)
  const typingTestRef = useRef<any>(null);

  if (!user) {
    return <AuthForms onSignIn={signIn} onSignUp={signUp} />
  }

  return (
    <div className="min-h-screen w-full flex flex-col font-mono transition-colors duration-300">
      {theme === 'nature' && (
        <>
          <div className="nature-bg-svg nature-svg-1" />
          <div className="nature-bg-svg nature-svg-2" />
          <div className="nature-bg-svg nature-svg-3" />
          <div className="nature-bg-svg nature-svg-4" />
          <div className="nature-bg-svg nature-svg-5" />
        </>
      )}
      <TopBar
        mode={mode}
        setMode={setMode}
        onSettingsClick={() => setShowSettings(true)}
        onLeaderboardClick={() => { setShowLeaderboard(true); setShowProfile(false); }}
        onTypeClick={() => {
          setShowLeaderboard(false); setShowProfile(false);
          if (typingTestRef.current) typingTestRef.current.resetTest();
        }}
        onProfileClick={() => { setShowProfile(true); setShowLeaderboard(false); }}
        punctuation={punctuation}
        setPunctuation={setPunctuation}
        numbers={numbers}
        setNumbers={setNumbers}
        showLeaderboard={showLeaderboard}
        showProfile={showProfile}
        hideIcons={typingActive}
      />
      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="relative w-full max-w-md mx-auto">
            <button
              onClick={() => setShowSettings(false)}
              className="absolute top-2 right-2 p-2 rounded bg-[var(--color-card)] hover:bg-[var(--color-primary)] border border-[var(--color-border)] transition-colors z-10"
              aria-label="Close settings"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-[var(--color-primary)]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <SettingsPanel
              theme={theme}
              setTheme={setTheme}
            />
          </div>
        </div>
      )}
      <main className="flex-1 flex items-center justify-center w-full">
        {showProfile ? (
          <ProfilePage onBack={() => setShowProfile(false)} />
        ) : showLeaderboard ? (
          <Leaderboard />
        ) : (
          <TypingTest
            ref={typingTestRef}
            mode={mode}
            punctuation={punctuation}
            numbers={numbers}
            onTypingActive={setTypingActive}
          />
        )}
      </main>
      <footer className="w-full text-center py-6" style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}>
        For any issues contact me on
        <a href="https://instagram.com/ffm.ly" target="_blank" rel="noopener noreferrer" className="inline-flex items-center ml-2 text-[var(--color-primary)] hover:underline">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
            <rect x="2" y="2" width="20" height="20" rx="5" fill="none" stroke="currentColor" strokeWidth="2"/>
            <circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" strokeWidth="2"/>
            <circle cx="17" cy="7" r="1.5" fill="currentColor"/>
          </svg>
        </a>
      </footer>
    </div>
  )
}

function App() {
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    // Remove all theme-* classes from body
    document.body.className = document.body.className
      .split(' ')
      .filter(c => !c.startsWith('theme-'))
      .join(' ');
    document.body.classList.add(`theme-${theme}`);
  }, [theme]);

  return (
    <div className="w-screen h-screen overflow-hidden">
      <div className="flex flex-col items-center justify-center w-full h-full flex-1">
        <AuthProvider>
          <AppContent theme={theme} setTheme={setTheme} />
        </AuthProvider>
      </div>
    </div>
  )
}

export default App
