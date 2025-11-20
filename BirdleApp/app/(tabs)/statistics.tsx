import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../../src/constants/colors';
import { GameStats } from '../../src/types';
import {
  getDailyStats,
  getUnlimitedStats,
  getPPDailyStats,
  getPPUnlimitedStats,
  PicturePerfectStats,
  migrateOldStats
} from '../../src/utils/storage';

type GameType = 'birdle' | 'pictureperfect';
type GameMode = 'daily' | 'unlimited';

export default function StatisticsTab() {
  const [selectedGame, setSelectedGame] = useState<GameType>('birdle');
  const [selectedMode, setSelectedMode] = useState<GameMode>('daily');
  const [birdleDailyStats, setBirdleDailyStats] = useState<GameStats | null>(null);
  const [birdleUnlimitedStats, setBirdleUnlimitedStats] = useState<GameStats | null>(null);
  const [ppDailyStats, setPPDailyStats] = useState<PicturePerfectStats | null>(null);
  const [ppUnlimitedStats, setPPUnlimitedStats] = useState<PicturePerfectStats | null>(null);

  useEffect(() => {
    initializeStats();
  }, []);

  // Reload stats whenever the tab comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadStats();
    }, [])
  );

  const initializeStats = async () => {
    // First, migrate old stats if needed
    await migrateOldStats();

    // Then load all stats
    await loadStats();
  };

  const loadStats = async () => {
    const bDailyStats = await getDailyStats();
    setBirdleDailyStats(bDailyStats);

    const bUnlimitedStats = await getUnlimitedStats();
    setBirdleUnlimitedStats(bUnlimitedStats);

    const pDailyStats = await getPPDailyStats();
    setPPDailyStats(pDailyStats);

    const pUnlimitedStats = await getPPUnlimitedStats();
    setPPUnlimitedStats(pUnlimitedStats);
  };

  if (!birdleDailyStats || !birdleUnlimitedStats || !ppDailyStats || !ppUnlimitedStats) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Loading...</Text>
      </View>
    );
  }

  const renderBirdleStats = () => {
    const birdleStats = selectedMode === 'daily' ? birdleDailyStats : birdleUnlimitedStats;
    const winRate =
      birdleStats.gamesPlayed > 0
        ? Math.round((birdleStats.gamesWon / birdleStats.gamesPlayed) * 100)
        : 0;

    return (
      <>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{birdleStats.gamesPlayed}</Text>
            <Text style={styles.statLabel}>Games Played</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statValue}>{winRate}%</Text>
            <Text style={styles.statLabel}>Win Rate</Text>
          </View>

          {selectedMode === 'daily' && (
            <>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{birdleStats.currentStreak}</Text>
                <Text style={styles.statLabel}>Current Streak</Text>
              </View>

              <View style={styles.statBox}>
                <Text style={styles.statValue}>{birdleStats.maxStreak}</Text>
                <Text style={styles.statLabel}>Max Streak</Text>
              </View>
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Guess Distribution</Text>

          {Object.keys(birdleStats.guessDistribution).length === 0 ? (
            <Text style={styles.emptyText}>
              No games completed yet. Start playing to see your distribution!
            </Text>
          ) : (
            <View style={styles.distribution}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((guessNum) => {
                const count = birdleStats.guessDistribution[guessNum] || 0;
                const maxCount = Math.max(
                  ...Object.values(birdleStats.guessDistribution)
                );
                const percentage =
                  maxCount > 0 ? (count / maxCount) * 100 : 0;

                return (
                  <View key={guessNum} style={styles.distributionRow}>
                    <Text style={styles.guessNumber}>{guessNum}</Text>
                    <View style={styles.barContainer}>
                      <View
                        style={[
                          styles.bar,
                          {
                            width: `${Math.max(percentage, count > 0 ? 10 : 0)}%`,
                          },
                        ]}
                      >
                        <Text style={styles.barText}>{count}</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </>
    );
  };

  const renderPicturePerfectStats = () => {
    const ppStats = selectedMode === 'daily' ? ppDailyStats : ppUnlimitedStats;
    const winRate =
      ppStats.gamesPlayed > 0
        ? Math.round((ppStats.gamesWon / ppStats.gamesPlayed) * 100)
        : 0;

    return (
      <>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{ppStats.gamesPlayed}</Text>
            <Text style={styles.statLabel}>Games Played</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statValue}>{winRate}%</Text>
            <Text style={styles.statLabel}>Win Rate</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statValue}>{ppStats.totalPoints}</Text>
            <Text style={styles.statLabel}>Total Points</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {ppStats.averageGuesses > 0 ? ppStats.averageGuesses.toFixed(1) : '0'}
            </Text>
            <Text style={styles.statLabel}>Avg Guesses</Text>
          </View>
        </View>

        {ppStats.gamesPlayed === 0 && (
          <View style={styles.section}>
            <Text style={styles.emptyText}>
              No games completed yet. Start playing to see your stats!
            </Text>
          </View>
        )}
      </>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Statistics</Text>

        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              selectedGame === 'birdle' && styles.toggleButtonActive,
            ]}
            onPress={() => setSelectedGame('birdle')}
          >
            <Text
              style={[
                styles.toggleButtonText,
                selectedGame === 'birdle' && styles.toggleButtonTextActive,
              ]}
            >
              Birdle
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleButton,
              selectedGame === 'pictureperfect' && styles.toggleButtonActive,
            ]}
            onPress={() => setSelectedGame('pictureperfect')}
          >
            <Text
              style={[
                styles.toggleButtonText,
                selectedGame === 'pictureperfect' && styles.toggleButtonTextActive,
              ]}
            >
              Picture Perfect
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              selectedMode === 'daily' && styles.toggleButtonActive,
            ]}
            onPress={() => setSelectedMode('daily')}
          >
            <Text
              style={[
                styles.toggleButtonText,
                selectedMode === 'daily' && styles.toggleButtonTextActive,
              ]}
            >
              Daily
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleButton,
              selectedMode === 'unlimited' && styles.toggleButtonActive,
            ]}
            onPress={() => setSelectedMode('unlimited')}
          >
            <Text
              style={[
                styles.toggleButtonText,
                selectedMode === 'unlimited' && styles.toggleButtonTextActive,
              ]}
            >
              Unlimited
            </Text>
          </TouchableOpacity>
        </View>

        {selectedGame === 'birdle' ? renderBirdleStats() : renderPicturePerfectStats()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
    padding: 16,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 24,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: Colors.primary,
  },
  toggleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  toggleButtonTextActive: {
    color: Colors.text,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.cardBackground,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    padding: 24,
  },
  distribution: {
    gap: 8,
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  guessNumber: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    width: 20,
  },
  barContainer: {
    flex: 1,
    height: 32,
  },
  bar: {
    backgroundColor: Colors.exact,
    height: '100%',
    borderRadius: 4,
    justifyContent: 'center',
    paddingHorizontal: 8,
    minWidth: 32,
  },
  barText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
});
