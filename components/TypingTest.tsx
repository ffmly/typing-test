import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { saveScore } from '../services/firestore';

// Large word list for random generation
const WORDS = [
  'the', 'quick', 'brown', 'fox', 'jumps', 'over', 'lazy', 'dog', 'pack', 'my', 'box', 'with', 'five', 'dozen', 'liquor', 'jugs',
  'how', 'vexingly', 'daft', 'zebras', 'jump', 'success', 'future', 'believe', 'beauty', 'dreams', 'innovation', 'distinguishes',
  'between', 'leader', 'follower', 'internet', 'collection', 'things', 'numerous', 'communications', 'networks', 'speak', 'same',
  'digital', 'language', 'programming', 'art', 'telling', 'another', 'human', 'wants', 'computer', 'predict', 'implement', 'yourself',
  'final', 'failure', 'fatal', 'courage', 'continue', 'counts', 'great', 'work', 'love', 'what', 'do', 'system', 'here', 'where', 'turn',
  'down', 'interest', 'plan', 'problem', 'long', 'early', 'write', 'new', 'go', 'work', 'number', 'nation', 'about', 'also', 'hold', 'if',
  'call', 'just', 'around', 'real', 'for', 'fact', 'against', 'then', 'here', 'turn', 'down', 'interest', 'plan', 'problem', 'long', 'early',
  'write', 'new', 'go', 'work', 'number', 'nation', 'about', 'also', 'hold', 'if', 'call', 'just', 'around', 'real', 'for', 'fact', 'against',
  'then', 'system', 'here', 'where', 'turn', 'down', 'interest', 'plan', 'problem', 'long', 'early', 'write', 'new', 'go', 'work', 'number',
  'nation', 'about', 'also', 'hold', 'if', 'call', 'just', 'around', 'real', 'for', 'fact', 'against', 'then', 'system', 'here', 'where',
  // ... (add more words as needed)
];
const PUNCTUATION = [',', '.', '?', '!', ';', ':'];
const NUMBERS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

interface TypingTestProps {
  mode: number;
  punctuation: boolean;
  numbers: boolean;
  onTypingActive?: (active: boolean) => void;
}

function getRandomWord(punctuation: boolean, numbers: boolean) {
  let word = WORDS[Math.floor(Math.random() * WORDS.length)];
  if (numbers && Math.random() < 0.15) {
    word = NUMBERS[Math.floor(Math.random() * NUMBERS.length)];
  }
  if (punctuation && Math.random() < 0.2) {
    word += PUNCTUATION[Math.floor(Math.random() * PUNCTUATION.length)];
  }
  return word;
}

function generateWords(count: number, punctuation: boolean, numbers: boolean) {
  return Array.from({ length: count }, () => getRandomWord(punctuation, numbers)).join(' ');
}

const TypingTest = forwardRef(({ mode, punctuation, numbers, onTypingActive }: TypingTestProps, ref) => {
  const { user } = useAuth();
  const [words, setWords] = useState('');
  const [input, setInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(mode);
  const [isActive, setIsActive] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [showResults, setShowResults] = useState(false);
  const typingAreaRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);

  // Always have enough words for the timer (estimate 2 words per second)
  const INITIAL_WORD_COUNT = 150;

  // Generate new words when mode, punctuation, or numbers change
  useEffect(() => {
    setWords(generateWords(INITIAL_WORD_COUNT, punctuation, numbers));
    setInput('');
    setTimeLeft(mode);
    setIsActive(false);
    setWpm(0);
    setAccuracy(100);
    setShowResults(false);
    setStartTime(null);
    setEndTime(null);
  }, [mode, punctuation, numbers]);

  // Add more words if user is close to the end
  useEffect(() => {
    if (words.split(' ').length - input.trim().split(' ').length < 10) {
      setWords((prev) => prev + ' ' + generateWords(20, punctuation, numbers));
    }
  }, [input, words, punctuation, numbers]);

  useEffect(() => {
    let interval: number | undefined;
    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setEndTime(Date.now());
      handleTestComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // Focus typing area on mount
  useEffect(() => {
    typingAreaRef.current?.focus();
  }, [showResults, mode, punctuation, numbers]);

  // End test if all words are typed
  useEffect(() => {
    const trimmedInput = input.trim();
    const trimmedWords = words.trim();
    if (
      trimmedInput.length > 0 &&
      trimmedInput.length >= trimmedWords.length &&
      trimmedInput === trimmedWords.slice(0, trimmedInput.length)
    ) {
      setEndTime(Date.now());
      handleTestComplete();
    }
  }, [input, words]);

  // Handle key events for direct typing
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (showResults || timeLeft === 0) return;
    if (!isActive) {
      setIsActive(true);
      if (onTypingActive) onTypingActive(true);
      if (!startTime) setStartTime(Date.now());
    }
    if (e.key === 'Backspace') {
      setInput((prev) => prev.slice(0, -1));
      calculateStats(input.slice(0, -1));
      e.preventDefault();
      return;
    }
    // Only add a space if the user types it (no auto-insert)
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      setInput((prev) => prev + e.key);
      calculateStats(input + e.key);
      e.preventDefault();
    }
    if (e.key === 'Tab') {
      e.preventDefault();
    }
  };

  // Character-based stats and accuracy (MonkeyType style)
  const calculateStats = (currentInput: string) => {
    // WPM: (characters typed / 5) / elapsedMinutes
    const charsTyped = currentInput.length;
    let elapsedMs = 0;
    if (startTime) {
      elapsedMs = (endTime ? endTime : Date.now()) - startTime;
    } else {
      elapsedMs = 0;
    }
    const elapsedMinutes = elapsedMs > 0 ? elapsedMs / 1000 / 60 : (mode - timeLeft) / 60;
    const currentWpm = elapsedMinutes > 0 ? Math.round((charsTyped / 5) / elapsedMinutes) : 0;

    // Character-based accuracy
    let correctChars = 0;
    for (let i = 0; i < currentInput.length; i++) {
      if (currentInput[i] === words[i]) correctChars++;
    }
    const currentAccuracy = charsTyped > 0 ? Math.round((correctChars / charsTyped) * 100) : 100;

    // Score: WPM * (Accuracy / 100)
    const currentScore = Math.round(currentWpm * (currentAccuracy / 100));
    setWpm(currentWpm);
    setAccuracy(currentAccuracy);
    setScore(currentScore);
  };

  const handleTestComplete = async () => {
    setIsActive(false);
    if (onTypingActive) onTypingActive(false);
    setShowResults(true);
    if (user && accuracy >= 80 && wpm >= 10) {
      try {
        const username = user.email ? user.email.split('@')[0] : 'Anonymous';
        await saveScore({
          userId: user.uid,
          username: username,
          wpm,
          accuracy,
          mode,
          score,
        });
      } catch (error) {
        console.error('Error saving score:', error);
      }
    }
  };

  const resetTest = () => {
    setInput('');
    setTimeLeft(mode);
    setIsActive(false);
    if (onTypingActive) onTypingActive(false);
    setWpm(0);
    setAccuracy(100);
    setShowResults(false);
    setWords(generateWords(INITIAL_WORD_COUNT, punctuation, numbers));
    typingAreaRef.current?.focus();
  };

  useImperativeHandle(ref, () => ({
    resetTest,
  }));

  // Improved typing area: highlight correct/incorrect letters, show caret, highlight current character
  const renderTypingText = () => {
    // Group words into lines of 6 words per line
    const wordsArr = words.split(' ');
    const wordsPerLine = 6;
    const lines = [];
    for (let i = 0; i < wordsArr.length; i += wordsPerLine) {
      lines.push(wordsArr.slice(i, i + wordsPerLine).join(' '));
    }
    // Find the current line index
    const currentCharIdx = input.length;
    // Calculate which word the caret is in
    let charCount = 0;
    let currentLineIdx = 0;
    for (let i = 0; i < lines.length; i++) {
      if (currentCharIdx < charCount + lines[i].length + 1) { // +1 for the space/newline
        currentLineIdx = i;
        break;
      }
      charCount += lines[i].length + 1;
    }
    // Show 3 lines: current, previous, next
    const visibleLines = lines.slice(Math.max(0, currentLineIdx - 1), currentLineIdx + 2);
    let charGlobalIdx = Math.max(0, lines.slice(0, Math.max(0, currentLineIdx - 1)).reduce((acc, l) => acc + l.length + 1, 0));
    return (
      <div
        ref={typingAreaRef}
        tabIndex={0}
        className="w-full flex flex-col items-center justify-center outline-none"
        style={{ minHeight: '180px', width: '100%', boxSizing: 'border-box', outline: 'none', border: 'none', boxShadow: 'none', background: 'none' }}
        onKeyDown={handleKeyDown}
      >
        <div
          className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-mono flex flex-col gap-y-2 px-4 sm:px-8 py-10 my-8 w-full max-w-4xl mx-auto transition-colors duration-300 break-words max-h-56 overflow-hidden dark:shadow-none"
          style={{ wordBreak: 'break-word', lineHeight: '2.2rem', letterSpacing: '0.03em', border: 'none', boxShadow: 'none', outline: 'none', background: 'none' }}
        >
          {visibleLines.map((line, lineIdx) => (
            <div key={lineIdx} className="flex flex-row flex-wrap gap-x-0">
              {line.split('').map((char, cIdx) => {
                const globalIdx = charGlobalIdx;
                let style = '';
                if (input.length > globalIdx) {
                  style = input[globalIdx] === char ? 'text-green-400' : 'text-red-400 underline';
                } else if (input.length === globalIdx && isActive) {
                  style = 'border-l-4 border-yellow-400 animate-pulse'; // improved caret
                }
                charGlobalIdx++;
                return (
                  <span key={cIdx} className={style}>
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full" style={{ background: 'none', boxShadow: 'none', width: '100vw', boxSizing: 'border-box', marginBottom: 0, border: 'none', outline: 'none' }}>
      {!showResults ? (
        <>
          <div className="mb-4 text-right w-full max-w-3xl mx-auto pr-2 sm:pr-4 md:pr-8">
            <span className="text-2xl font-bold">{timeLeft}s</span>
          </div>
          <div className="mb-6 w-full flex justify-center">
            {renderTypingText()}
          </div>
          <div className="mt-4 flex justify-between text-gray-400 w-full max-w-3xl mx-auto px-2 sm:px-4 md:px-8">
            <span>WPM: {wpm}</span>
            <span>Accuracy: {accuracy}%</span>
          </div>
        </>
      ) : (
        <div className="text-center w-full">
          <h2 className="text-2xl font-bold mb-4">Test Complete!</h2>
          <div className="mb-6">
            <p className="text-xl">Your WPM: {wpm}</p>
            <p className="text-xl">Accuracy: {accuracy}%</p>
          </div>
          <button
            onClick={resetTest}
            className="px-6 py-2 bg-yellow-500 text-gray-900 rounded-lg hover:bg-yellow-400 font-bold min-w-[120px]"
            style={{ color: 'var(--color-bg)' }}
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
});

export default TypingTest; 