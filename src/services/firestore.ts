import { collection, addDoc, query, orderBy, limit as firestoreLimit, getDocs, Timestamp, where, updateDoc, getDocs as getDocsV9, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Score {
  id?: string;
  userId: string;
  username: string;
  wpm: number;
  accuracy: number;
  mode: number; // 30 or 60 seconds
  score: number;
  timestamp: Timestamp;
}

// Save a new score to Firestore
export const saveScore = async (score: Omit<Score, 'timestamp' | 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, 'scores'), {
      ...score,
      timestamp: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving score:', error);
    throw error;
  }
};

// Get top scores from Firestore for a specific mode
export const getTopScores = async (limitCount: number = 100, mode: number = 30) => {
  try {
    const scoresQuery = query(
      collection(db, 'scores'),
      orderBy('mode', 'asc'),
      orderBy('score', 'desc'),
      orderBy('timestamp', 'desc'),
      firestoreLimit(limitCount)
    );

    const querySnapshot = await getDocs(scoresQuery);
    // Filter by mode in case Firestore doesn't filter on orderBy
    return querySnapshot.docs
      .map(doc => ({ id: doc.id, ...(doc.data() as Score) }))
      .filter((score: any) => score.mode === mode) as Score[];
  } catch (error) {
    console.error('Error fetching scores:', error);
    throw error;
  }
};

// Add sample scores for testing
export const addSampleScores = async () => {
  const sampleScores = [
    {
      userId: 'sample1',
      username: 'Speed Demon',
      wpm: 120,
      accuracy: 98,
      mode: 30,
      score: 118
    },
    {
      userId: 'sample2',
      username: 'Typing Master',
      wpm: 115,
      accuracy: 97,
      mode: 30,
      score: 112
    },
    {
      userId: 'sample3',
      username: 'Keyboard Warrior',
      wpm: 110,
      accuracy: 96,
      mode: 60,
      score: 105
    },
    {
      userId: 'sample4',
      username: 'Fast Fingers',
      wpm: 105,
      accuracy: 95,
      mode: 60,
      score: 100
    },
    {
      userId: 'sample5',
      username: 'Quick Typist',
      wpm: 100,
      accuracy: 94,
      mode: 30,
      score: 94
    }
  ];

  try {
    for (const score of sampleScores) {
      await saveScore(score);
    }
    console.log('Sample scores added successfully');
  } catch (error) {
    console.error('Error adding sample scores:', error);
  }
};

// Get best results (highest score) for each mode for a user
export const getUserBestResults = async (userId: string) => {
  try {
    const scoresQuery = query(
      collection(db, 'scores'),
      orderBy('mode', 'asc'),
      orderBy('score', 'desc'),
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(scoresQuery);
    const userScores = querySnapshot.docs
      .map(doc => ({ id: doc.id, ...(doc.data() as Score) }))
      .filter((score: any) => score.userId === userId);
    // Get best score per mode (by score)
    const bestByMode: { [mode: number]: any } = {};
    userScores.forEach(score => {
      if (!bestByMode[score.mode] || score.score > bestByMode[score.mode].score) {
        bestByMode[score.mode] = score;
      }
    });
    return Object.values(bestByMode).map(score => ({
      mode: score.mode,
      wpm: score.wpm,
      accuracy: score.accuracy,
      score: score.score
    }));
  } catch (error) {
    console.error('Error fetching user best results:', error);
    return [];
  }
};

// Find a user by username (from scores collection)
export const getUserByUsername = async (username: string) => {
  try {
    const scoresQuery = query(
      collection(db, 'scores'),
      orderBy('username', 'asc')
    );
    const querySnapshot = await getDocs(scoresQuery);
    const userDoc = querySnapshot.docs
      .map(doc => ({ id: doc.id, ...(doc.data() as Score) }))
      .find((score: any) => score.username.toLowerCase() === username.toLowerCase());
    if (!userDoc) return null;
    return { userId: userDoc.userId, username: userDoc.username };
  } catch (error) {
    console.error('Error finding user by username:', error);
    return null;
  }
};

// Update username for all scores by userId
export const updateUsername = async (userId: string, newUsername: string) => {
  try {
    const scoresQuery = query(
      collection(db, 'scores'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocsV9(scoresQuery);
    const batchUpdates = querySnapshot.docs.map((scoreDoc) =>
      updateDoc(doc(db, 'scores', scoreDoc.id), { username: newUsername })
    );
    await Promise.all(batchUpdates);
    return true;
  } catch (error) {
    console.error('Error updating username:', error);
    return false;
  }
};

// Get the latest username for a userId from scores
export const getCurrentUsername = async (userId: string) => {
  try {
    const scoresQuery = query(
      collection(db, 'scores'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      firestoreLimit(1)
    );
    const querySnapshot = await getDocs(scoresQuery);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0].data();
      return doc.username;
    }
    return null;
  } catch (error) {
    console.error('Error fetching current username:', error);
    return null;
  }
};

// Get all scores for a user, sorted by timestamp
export const getUserAllScores = async (userId: string) => {
  try {
    const scoresQuery = query(
      collection(db, 'scores'),
      where('userId', '==', userId),
      orderBy('timestamp', 'asc')
    );
    const querySnapshot = await getDocs(scoresQuery);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as Score) }));
  } catch (error) {
    console.error('Error fetching all user scores:', error);
    return [];
  }
};

// Get user's leaderboard rank for a mode
export const getUserLeaderboardRank = async (username: string, mode: number) => {
  try {
    const scoresQuery = query(
      collection(db, 'scores'),
      orderBy('mode', 'asc'),
      orderBy('score', 'desc'),
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(scoresQuery);
    const scores = querySnapshot.docs
      .map(doc => ({ id: doc.id, ...(doc.data() as Score) }))
      .filter((score: any) => score.mode === mode);
    // Group by username and keep only the highest score for each user
    const bestScoresMap = new Map();
    scores.forEach(score => {
      if (!bestScoresMap.has(score.username) || score.score > bestScoresMap.get(score.username).score) {
        bestScoresMap.set(score.username, score);
      }
    });
    const bestScores = Array.from(bestScoresMap.values()).sort((a, b) => b.score - a.score);
    const rank = bestScores.findIndex(s => s.username === username);
    return rank === -1 ? null : rank + 1;
  } catch (error) {
    console.error('Error fetching user leaderboard rank:', error);
    return null;
  }
}; 