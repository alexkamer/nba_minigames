import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameStats } from '../types';
import { getTodayString } from './dateUtils';

const STATS_KEY = '@birdle_stats';
const DAILY_GAME_KEY = '@birdle_daily_game';

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
  guessCount: number
): Promise<void> => {
  const stats = await getStats();
  const today = getTodayString();

  stats.gamesPlayed += 1;

  if (won) {
    stats.gamesWon += 1;

    // Update guess distribution
    stats.guessDistribution[guessCount] =
      (stats.guessDistribution[guessCount] || 0) + 1;

    // Update streak
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
  } else {
    stats.currentStreak = 0;
  }

  stats.lastPlayedDate = today;
  await saveStats(stats);
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

export const saveDailyGameComplete = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      DAILY_GAME_KEY,
      JSON.stringify({ date: getTodayString() })
    );
  } catch (error) {
    console.error('Error saving daily game:', error);
  }
};
