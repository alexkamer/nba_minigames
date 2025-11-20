import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Colors } from '../constants/colors';
import { GameStats } from '../types';
import { getStats } from '../utils/storage';

interface StatsScreenProps {
  navigation: any;
}

export const StatsScreen: React.FC<StatsScreenProps> = ({ navigation }) => {
  const [stats, setStats] = useState<GameStats | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const currentStats = await getStats();
    setStats(currentStats);
  };

  if (!stats) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Loading...</Text>
      </View>
    );
  }

  const winRate =
    stats.gamesPlayed > 0
      ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
      : 0;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.back()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Statistics</Text>
          <View style={{ width: 60 }} />
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.gamesPlayed}</Text>
            <Text style={styles.statLabel}>Games Played</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statValue}>{winRate}%</Text>
            <Text style={styles.statLabel}>Win Rate</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.currentStreak}</Text>
            <Text style={styles.statLabel}>Current Streak</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.maxStreak}</Text>
            <Text style={styles.statLabel}>Max Streak</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Guess Distribution</Text>

          {Object.keys(stats.guessDistribution).length === 0 ? (
            <Text style={styles.emptyText}>
              No games completed yet. Start playing to see your distribution!
            </Text>
          ) : (
            <View style={styles.distribution}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((guessNum) => {
                const count = stats.guessDistribution[guessNum] || 0;
                const maxCount = Math.max(
                  ...Object.values(stats.guessDistribution)
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
      </ScrollView>
    </View>
  );
};

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    color: Colors.primary,
    fontSize: 16,
    width: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
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
