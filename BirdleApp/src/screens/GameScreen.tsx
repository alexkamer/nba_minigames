import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { Colors } from '../constants/colors';
import { GuessGrid } from '../components/GuessGrid';
import { PlayerSearch } from '../components/PlayerSearch';
import { ResultsModal } from '../components/ResultsModal';
import { GuessResult, GameStats } from '../types';
import { getDailyPlayer, getRandomPlayer, validateGuess } from '../services/api';
import {
  getStats,
  updateStatsAfterGame,
  saveDailyGameComplete,
  getDailyStats,
  getUnlimitedStats,
  getDailyGameState,
} from '../utils/storage';

interface GameScreenProps {
  route: any;
  navigation: any;
}

const MAX_GUESSES = 8;

export const GameScreen: React.FC<GameScreenProps> = ({ route, navigation }) => {
  const { isDaily } = route.params;

  const [loading, setLoading] = useState(true);
  const [mysteryPlayerId, setMysteryPlayerId] = useState<string>('');
  const [guesses, setGuesses] = useState<GuessResult[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [stats, setStats] = useState<GameStats | null>(null);

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = async () => {
    try {
      setLoading(true);

      // Check if this is a completed daily game
      if (isDaily) {
        const savedGameState = await getDailyGameState();
        if (savedGameState) {
          // Load the completed game
          setMysteryPlayerId(savedGameState.playerId);
          setGuesses(savedGameState.guesses);
          setGameOver(true);
          setWon(savedGameState.won);
          setShowResults(true);

          // Load stats
          const currentStats = isDaily ? await getDailyStats() : await getUnlimitedStats();
          setStats(currentStats);
          setLoading(false);
          return;
        }
      }

      // Get mystery player for new game
      const playerId = isDaily
        ? await getDailyPlayer()
        : await getRandomPlayer();

      setMysteryPlayerId(playerId);

      // Load stats
      const currentStats = isDaily ? await getDailyStats() : await getUnlimitedStats();
      setStats(currentStats);
    } catch (error) {
      console.error('Error initializing game:', error);
      Alert.alert('Error', 'Failed to load game. Please try again.');
      navigation.back();
    } finally {
      setLoading(false);
    }
  };

  const handleGuess = async (playerName: string) => {
    if (gameOver || guesses.length >= MAX_GUESSES) return;

    try {
      const result = await validateGuess(playerName, mysteryPlayerId);
      const newGuesses = [...guesses, result];
      setGuesses(newGuesses);

      if (result.is_correct) {
        // Won the game
        setWon(true);
        setGameOver(true);
        await updateStatsAfterGame(true, newGuesses.length, isDaily);

        if (isDaily) {
          await saveDailyGameComplete({
            playerId: mysteryPlayerId,
            guesses: newGuesses,
            won: true,
          });
        }

        // Update stats and show results
        const updatedStats = isDaily ? await getDailyStats() : await getUnlimitedStats();
        setStats(updatedStats);
        setShowResults(true);
      } else if (newGuesses.length >= MAX_GUESSES) {
        // Lost the game
        setWon(false);
        setGameOver(true);
        await updateStatsAfterGame(false, MAX_GUESSES, isDaily);

        if (isDaily) {
          await saveDailyGameComplete({
            playerId: mysteryPlayerId,
            guesses: newGuesses,
            won: false,
          });
        }

        // Update stats and show results
        const updatedStats = isDaily ? await getDailyStats() : await getUnlimitedStats();
        setStats(updatedStats);
        setShowResults(true);
      }
    } catch (error: any) {
      console.error('Error validating guess:', error);
      Alert.alert(
        'Error',
        error.response?.data?.detail || 'Failed to validate guess'
      );
    }
  };

  const handlePlayAgain = () => {
    setShowResults(false);
    navigation.back();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading game...</Text>
      </View>
    );
  }

  const headshotUrl = `https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/${mysteryPlayerId}.png`;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {isDaily ? 'Daily Birdle' : 'Unlimited Birdle'}
        </Text>
        <Text style={styles.guessCount}>
          {gameOver ? guesses.length : Math.min(guesses.length + 1, MAX_GUESSES)} / {MAX_GUESSES}
        </Text>
      </View>

      {/* Mystery Player Silhouette */}
      <View style={styles.silhouetteContainer}>
        <Image
          source={{ uri: headshotUrl }}
          style={[styles.silhouetteImage, { tintColor: '#000000' }]}
          resizeMode="contain"
        />
      </View>

      <PlayerSearch
        onSelectPlayer={handleGuess}
        disabled={gameOver || guesses.length >= MAX_GUESSES}
      />

      <GuessGrid guesses={guesses} maxGuesses={MAX_GUESSES} />

      {stats && guesses.length > 0 && (
        <ResultsModal
          visible={showResults}
          won={won}
          guessCount={guesses.length}
          playerName={guesses[guesses.length - 1]?.player.display_name || ''}
          playerId={mysteryPlayerId}
          stats={stats}
          onClose={() => {
            setShowResults(false);
            navigation.back();
          }}
          onPlayAgain={handlePlayAgain}
          isDaily={isDaily}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 16,
    paddingTop: 60,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.text,
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  guessCount: {
    fontSize: 18,
    color: Colors.textSecondary,
  },
  silhouetteContainer: {
    alignSelf: 'center',
    marginBottom: 16,
    height: 200,
    width: 180,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
  },
  silhouetteImage: {
    width: 150,
    height: 200,
  },
});
