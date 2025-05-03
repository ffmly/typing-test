import { useState } from 'react';

interface AuthFormsProps {
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (email: string, password: string) => Promise<void>;
}

const AuthForms = ({ onSignIn, onSignUp }: AuthFormsProps) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isSignUp) {
        await onSignUp(email, password);
      } else {
        await onSignIn(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[var(--color-bg)]">
      <div className="bg-[var(--color-card)] max-w-md w-full px-4 py-10 rounded-2xl shadow-lg flex flex-col items-center border border-[var(--color-border)]">
        <h2 className="text-3xl font-extrabold text-center mb-6 tracking-tight text-[var(--color-text)]" style={{ letterSpacing: '-0.03em' }}>
          {isSignUp ? 'Sign Up' : 'Sign In'}
        </h2>
        <div className="w-16 h-1 rounded-full mb-6" style={{ background: 'var(--color-primary)', opacity: 0.2 }} />
        {error && (
          <div className="p-3 mb-4 text-red-500 bg-red-100 dark:bg-red-900/20 rounded w-full text-center">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5 w-full">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold mb-1 text-[var(--color-text)]">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input bg-[var(--color-input)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-gray-400"
              required
              autoComplete="username"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-semibold mb-1 text-[var(--color-text)]">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input bg-[var(--color-input)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-gray-400"
              required
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              placeholder="Enter your password"
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary w-full text-lg font-bold mt-2"
          >
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="w-full mt-6 text-sm font-semibold text-[var(--color-primary)] hover:underline transition-colors"
        >
          {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
        </button>
      </div>
    </div>
  );
};

export default AuthForms; 