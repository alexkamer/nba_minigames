import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameStats } from '../types';
import { getTodayString } from './dateUtils';

const STATS_KEY = '@birdle_stats';
const DAILY_GAME_KEY = '@birdle_daily_game';
const PP_STATS_KEY = '@picture_perfect_stats';
const PP_DAILY_GAME_KEY = '@picture_perfect_daily_game';

// Separate keys for daily vs unlimited stats
const DAILY_STATS_KEY = '@birdle_daily_stats';
const UNLIMITED_STATS_KEY = '@birdle_unlimited_stats';
const PP_DAILY_STATS_KEY = '@picture_perfect_daily_stats';
const PP_UNLIMITED_STATS_KEY = '@picture_perfect_unlimited_stats';

export interface PicturePerfectStats {
  gamesPlayed: number;
  gamesWon: number;
  totalPoints: number;
  averageGuesses: number;
}

export const getStats = async (): Promise<GameStats> => {
  try {
    const stats = await AsyncStorage.getItem(STATS_KEY);
    if (stats) {
      return JSON.parse(stats);
    }
  } catch (error) {
    console.error('Error loading stats:', error);
  }

  // Return default stats
  return {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessDistribution: {},
    lastPlayedDate: '',
  };
};

export const saveStats = async (stats: GameStats): Promise<void> => {
  try {
    await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error('Error saving stats:', error);
  }
};

export const updateStatsAfterGame = async (
  won: boolean,
  guessCount: number,
  isDaily: boolean = false
): Promise<void> => {
  // Get the appropriate stats based on game mode
  const statsKey = isDaily ? DAILY_STATS_KEY : UNLIMITED_STATS_KEY;
  const stats = await getStatsForMode(statsKey);
  const today = getTodayString();

  stats.gamesPlayed += 1;

  if (won) {
    stats.gamesWon += 1;

    // Update guess distribution
    stats.guessDistribution[guessCount] =
      (stats.guessDistribution[guessCount] || 0) + 1;

    // Update streak (only for daily mode)
    if (isDaily) {
      const lastPlayedYesterday =
        stats.lastPlayedDate &&
        new Date(stats.lastPlayedDate).getTime() ===
          new Date(today).getTime() - 86400000;

      if (lastPlayedYesterday || stats.currentStreak === 0) {
        stats.currentStreak += 1;
      } else {
        stats.currentStreak = 1;
      }

      stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
    }
  } else {
    if (isDaily) {
      stats.currentStreak = 0;
    }
  }

  stats.lastPlayedDate = today;
  await saveStatsForMode(statsKey, stats);
};

// Helper functions for mode-specific stats
const getStatsForMode = async (key: string): Promise<GameStats> => {
  try {
    const stats = await AsyncStorage.getItem(key);
    if (stats) {
      return JSON.parse(stats);
    }
  } catch (error) {
    console.error('Error loading stats:', error);
  }

  return {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessDistribution: {},
    lastPlayedDate: '',
  };
};

const saveStatsForMode = async (key: string, stats: GameStats): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(stats));
  } catch (error) {
    console.error('Error saving stats:', error);
  }
};

// Public functions to get daily and unlimited stats
export const getDailyStats = async (): Promise<GameStats> => {
  return getStatsForMode(DAILY_STATS_KEY);
};

export const getUnlimitedStats = async (): Promise<GameStats> => {
  return getStatsForMode(UNLIMITED_STATS_KEY);
};

export const hasPlayedToday = async (): Promise<boolean> => {
  try {
    const dailyGame = await AsyncStorage.getItem(DAILY_GAME_KEY);
    if (dailyGame) {
      const { date } = JSON.parse(dailyGame);
      return date === getTodayString();
    }
  } catch (error) {
    console.error('Error checking daily game:', error);
  }
  return false;
};

export const saveDailyGameComplete = async (gameState?: any): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      DAILY_GAME_KEY,
      JSON.stringify({
        date: getTodayString(),
        gameState: gameState || null
      })
    );
  } catch (error) {
    console.error('Error saving daily game:', error);
  }
};

export const getDailyGameState = async (): Promise<any | null> => {
  try {
    const dailyGame = await AsyncStorage.getItem(DAILY_GAME_KEY);
    if (dailyGame) {
      const { date, gameState } = JSON.parse(dailyGame);
      if (date === getTodayString()) {
        return gameState;
      }
    }
  } catch (error) {
    console.error('Error getting daily game state:', error);
  }
  return null;
};

// Picture Perfect Storage Functions
export const getPPStats = async (): Promise<PicturePerfectStats> => {
  try {
    const stats = await AsyncStorage.getItem(PP_STATS_KEY);
    if (stats) {
      return JSON.parse(stats);
    }
  } catch (error) {
    console.error('Error loading Picture Perfect stats:', error);
  }

  return {
    gamesPlayed: 0,
    gamesWon: 0,
    totalPoints: 0,
    averageGuesses: 0,
  };
};

export const savePPStats = async (stats: PicturePerfectStats): Promise<void> => {
  try {
    await AsyncStorage.setItem(PP_STATS_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error('Error saving Picture Perfect stats:', error);
  }
};

export const updatePPStatsAfterGame = async (
  won: boolean,
  points: number,
  guessCount: number,
  isDaily: boolean = false
): Promise<void> => {
  // Get the appropriate stats based on game mode
  const statsKey = isDaily ? PP_DAILY_STATS_KEY : PP_UNLIMITED_STATS_KEY;
  const stats = await getPPStatsForMode(statsKey);

  stats.gamesPlayed += 1;

  if (won) {
    stats.gamesWon += 1;
    stats.totalPoints += points;
  }

  // Update average guesses (only count wins)
  if (stats.gamesWon > 0) {
    const totalGuesses = stats.averageGuesses * (stats.gamesWon - (won ? 1 : 0));
    stats.averageGuesses = (totalGuesses + (won ? guessCount : 0)) / stats.gamesWon;
  }

  await savePPStatsForMode(statsKey, stats);
};

// Helper functions for mode-specific Picture Perfect stats
const getPPStatsForMode = async (key: string): Promise<PicturePerfectStats> => {
  try {
    const stats = await AsyncStorage.getItem(key);
    if (stats) {
      return JSON.parse(stats);
    }
  } catch (error) {
    console.error('Error loading Picture Perfect stats:', error);
  }

  return {
    gamesPlayed: 0,
    gamesWon: 0,
    totalPoints: 0,
    averageGuesses: 0,
  };
};

const savePPStatsForMode = async (key: string, stats: PicturePerfectStats): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(stats));
  } catch (error) {
    console.error('Error saving Picture Perfect stats:', error);
  }
};

// Public functions to get daily and unlimited Picture Perfect stats
export const getPPDailyStats = async (): Promise<PicturePerfectStats> => {
  return getPPStatsForMode(PP_DAILY_STATS_KEY);
};

export const getPPUnlimitedStats = async (): Promise<PicturePerfectStats> => {
  return getPPStatsForMode(PP_UNLIMITED_STATS_KEY);
};

// Migration function to move old stats to new daily stats
export const migrateOldStats = async (): Promise<void> => {
  try {
    // Check if migration has already been done
    const migrationDone = await AsyncStorage.getItem('@stats_migration_done');
    if (migrationDone === 'true') {
      return;
    }

    // Migrate Birdle stats
    const oldBirdleStats = await AsyncStorage.getItem(STATS_KEY);
    if (oldBirdleStats) {
      const stats = JSON.parse(oldBirdleStats);
      // Move old stats to daily stats
      await AsyncStorage.setItem(DAILY_STATS_KEY, oldBirdleStats);
      console.log('Migrated Birdle stats to daily');
    }

    // Migrate Picture Perfect stats
    const oldPPStats = await AsyncStorage.getItem(PP_STATS_KEY);
    if (oldPPStats) {
      const stats = JSON.parse(oldPPStats);
      // Move old stats to daily stats
      await AsyncStorage.setItem(PP_DAILY_STATS_KEY, oldPPStats);
      console.log('Migrated Picture Perfect stats to daily');
    }

    // Mark migration as done
    await AsyncStorage.setItem('@stats_migration_done', 'true');
    console.log('Stats migration completed');
  } catch (error) {
    console.error('Error migrating stats:', error);
  }
};

// Clear all stats (for debugging/testing)
export const clearAllStats = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      STATS_KEY,
      DAILY_STATS_KEY,
      UNLIMITED_STATS_KEY,
      PP_STATS_KEY,
      PP_DAILY_STATS_KEY,
      PP_UNLIMITED_STATS_KEY,
      DAILY_GAME_KEY,
      PP_DAILY_GAME_KEY,
      '@stats_migration_done',
    ]);
    console.log('All stats cleared');
  } catch (error) {
    console.error('Error clearing stats:', error);
  }
};

export const hasPPPlayedToday = async (): Promise<boolean> => {
  try {
    const dailyGame = await AsyncStorage.getItem(PP_DAILY_GAME_KEY);
    if (dailyGame) {
      const { date } = JSON.parse(dailyGame);
      return date === getTodayString();
    }
  } catch (error) {
    console.error('Error checking Picture Perfect daily game:', error);
  }
  return false;
};

export const savePPDailyGameComplete = async (gameState?: any): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      PP_DAILY_GAME_KEY,
      JSON.stringify({
        date: getTodayString(),
        gameState: gameState || null
      })
    );
  } catch (error) {
    console.error('Error saving Picture Perfect daily game:', error);
  }
};

export const getPPDailyGameState = async (): Promise<any | null> => {
  try {
    const dailyGame = await AsyncStorage.getItem(PP_DAILY_GAME_KEY);
    if (dailyGame) {
      const { date, gameState } = JSON.parse(dailyGame);
      if (date === getTodayString()) {
        return gameState;
      }
    }
  } catch (error) {
    console.error('Error getting Picture Perfect daily game state:', error);
  }
  return null;
};
