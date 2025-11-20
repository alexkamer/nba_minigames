import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Colors } from '../constants/colors';
import { getDailyPlayer, getRandomPlayer, searchPlayers, getHint } from '../services/api';
import {
  getPPStats,
  updatePPStatsAfterGame,
  hasPPPlayedToday,
  savePPDailyGameComplete,
  PicturePerfectStats,
} from '../utils/storage';
import { PlayerSearch } from '../components/PlayerSearch';
import BlurredPlayerImage from '../components/BlurredPlayerImage';
import HintButton from '../components/HintButton';
import HintDisplay, { Hint } from '../components/HintDisplay';
import { PicturePerfectResults } from '../components/PicturePerfectResults';

interface PicturePerfectScreenProps {
  route: {
    params: {
      isDaily?: string;
    };
  };
  navigation: any;
}

const MAX_GUESSES = 6;
const POINTS_BY_GUESS = [200, 100, 50, 25, 10, 0];
const INITIAL_BLUR = 20;
const BLUR_REDUCTION_PER_GUESS = 3;

const PicturePerfectScreen: React.FC<PicturePerfectScreenProps> = ({
  route,
  navigation,
}) => {
  const isDaily = route.params?.isDaily === 'true';

  const [loading, setLoading] = useState(true);
  const [mysteryPlayerId, setMysteryPlayerId] = useState<string>('');
  const [mysteryPlayerName, setMysteryPlayerName] = useState<string>('');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentBlur, setCurrentBlur] = useState<number>(INITIAL_BLUR);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [points, setPoints] = useState<number>(200);
  const [stats, setStats] = useState<PicturePerfectStats>({
    gamesPlayed: 0,
    gamesWon: 0,
    totalPoints: 0,
    averageGuesses: 0,
  });
  const [showResults, setShowResults] = useState(false);

  // Hint system
  const [revealedHints, setRevealedHints] = useState<Hint[]>([]);
  const [hintTypes, setHintTypes] = useState<{
    team: boolean;
    position: boolean;
    conference: boolean;
    jersey: boolean;
  }>({
    team: false,
    position: false,
    conference: false,
    jersey: false,
  });

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = async () => {
    setLoading(true);
    try {
      // Check if already played today
      if (isDaily) {
        const played = await hasPPPlayedToday();
        if (played) {
          Alert.alert(
            'Already Played',
            "You've already played today's Picture Perfect! Come back tomorrow for a new challenge.",
            [
              {
                text: 'Play Unlimited',
                onPress: () => navigation.push('/pictureperfect?isDaily=false'),
              },
              { text: 'Go Back', onPress: () => navigation.back() },
            ]
          );
          setLoading(false);
          return;
        }
      }

      // Get mystery player
      const playerId = isDaily
        ? await getDailyPlayer()
        : await getRandomPlayer();

      setMysteryPlayerId(playerId);

      // Load stats
      const loadedStats = await getPPStats();
      setStats(loadedStats);

      setLoading(false);
    } catch (error) {
      console.error('Error initializing game:', error);
      Alert.alert('Error', 'Failed to load game. Please try again.');
      setLoading(false);
    }
  };

  const handleGuess = async (playerName: string) => {
    if (gameOver || guesses.length >= MAX_GUESSES) return;

    const newGuesses = [...guesses, playerName];
    setGuesses(newGuesses);

    // Check if correct
    try {
      // Search for the player to get their ID
      const searchResults = await searchPlayers(playerName);
      const guessedPlayer = searchResults.find(
        (p) => p.display_name === playerName
      );

      if (guessedPlayer && guessedPlayer.espn_player_id === mysteryPlayerId) {
        // Correct guess!
        handleWin(newGuesses.length, playerName);
      } else {
        // Wrong guess - reduce blur
        const newBlur = Math.max(
          0,
          INITIAL_BLUR - newGuesses.length * BLUR_REDUCTION_PER_GUESS
        );
        setCurrentBlur(newBlur);

        // Update points
        const newPoints = POINTS_BY_GUESS[newGuesses.length] || 0;
        setPoints(newPoints);

        // Check if game over (max guesses reached)
        if (newGuesses.length >= MAX_GUESSES) {
          handleLoss();
        }
      }
    } catch (error) {
      console.error('Error validating guess:', error);
      Alert.alert('Error', 'Failed to validate guess. Please try again.');
    }
  };

  const handleGetHint = async (hintType: 'team' | 'position' | 'conference' | 'jersey') => {
    if (hintTypes[hintType] || gameOver) return;

    try {
      const hintResponse = await getHint(mysteryPlayerId, hintType);

      setRevealedHints([
        ...revealedHints,
        { type: hintResponse.hint_type, display: hintResponse.hint_display },
      ]);

      setHintTypes({
        ...hintTypes,
        [hintType]: true,
      });

      // Reduce blur slightly when using a hint
      const newBlur = Math.max(0, currentBlur - 2);
      setCurrentBlur(newBlur);
    } catch (error) {
      console.error('Error getting hint:', error);
      Alert.alert('Error', 'Failed to get hint. Please try again.');
    }
  };

  const handleWin = async (guessCount: number, playerName: string) => {
    setWon(true);
    setGameOver(true);
    setMysteryPlayerName(playerName);
    setCurrentBlur(0); // Fully reveal

    const finalPoints = POINTS_BY_GUESS[guessCount - 1] || 0;
    setPoints(finalPoints);

    // Update stats
    await updatePPStatsAfterGame(true, finalPoints, guessCount);

    if (isDaily) {
      await savePPDailyGameComplete();
    }

    // Reload stats
    const updatedStats = await getPPStats();
    setStats(updatedStats);

    // Show results after a brief delay
    setTimeout(() => {
      setShowResults(true);
    }, 500);
  };

  const handleLoss = async () => {
    setGameOver(true);
    setWon(false);
    setCurrentBlur(0); // Fully reveal

    // Need to fetch the player name
    try {
      // We'll use a workaround: search for a unique attribute and find the player
      // For now, just set a placeholder - in a real app, add a getPlayerById endpoint
      setMysteryPlayerName('Mystery Player');

      // Update stats
      await updatePPStatsAfterGame(false, 0, MAX_GUESSES);

      if (isDaily) {
        await savePPDailyGameComplete();
      }

      // Reload stats
      const updatedStats = await getPPStats();
      setStats(updatedStats);

      // Show results after a brief delay
      setTimeout(() => {
        setShowResults(true);
      }, 500);
    } catch (error) {
      console.error('Error handling loss:', error);
    }
  };

  const handlePlayAgain = () => {
    // Reset game state
    setMysteryPlayerId('');
    setMysteryPlayerName('');
    setGuesses([]);
    setCurrentBlur(INITIAL_BLUR);
    setGameOver(false);
    setWon(false);
    setPoints(200);
    setRevealedHints([]);
    setHintTypes({
      team: false,
      position: false,
      conference: false,
      jersey: false,
    });
    setShowResults(false);

    // Re-initialize
    initializeGame();
  };

  const handleClose = () => {
    navigation.back();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading Picture Perfect...</Text>
      </View>
    );
  }

  const remainingGuesses = MAX_GUESSES - guesses.length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>Picture Perfect</Text>
          <Text style={styles.subtitle}>
            {isDaily ? 'Daily Challenge' : 'Unlimited Mode'}
          </Text>
        </View>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Score Display */}
        <View style={styles.scoreContainer}>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreLabel}>Points</Text>
            <Text style={[styles.scoreValue, styles.pointsText]}>{points}</Text>
          </View>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreLabel}>Guesses</Text>
            <Text style={styles.scoreValue}>
              {guesses.length}/{MAX_GUESSES}
            </Text>
          </View>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreLabel}>Hints</Text>
            <Text style={styles.scoreValue}>{revealedHints.length}</Text>
          </View>
        </View>

        {/* Blurred Player Image */}
        <View style={styles.imageContainer}>
          {mysteryPlayerId && (
            <BlurredPlayerImage
              playerId={mysteryPlayerId}
              blurRadius={currentBlur}
              size={280}
            />
          )}
        </View>

        {/* Hints Display */}
        <HintDisplay hints={revealedHints} />

        {/* Hint Buttons */}
        {!gameOver && (
          <View style={styles.hintButtons}>
            <Text style={styles.hintTitle}>Get a Hint:</Text>
            <View style={styles.hintButtonRow}>
              <HintButton
                label="Team"
                onPress={() => handleGetHint('team')}
                disabled={hintTypes.team}
                revealed={hintTypes.team}
              />
              <HintButton
                label="Position"
                onPress={() => handleGetHint('position')}
                disabled={hintTypes.position}
                revealed={hintTypes.position}
              />
              <HintButton
                label="Conference"
                onPress={() => handleGetHint('conference')}
                disabled={hintTypes.conference}
                revealed={hintTypes.conference}
              />
              <HintButton
                label="Jersey #"
                onPress={() => handleGetHint('jersey')}
                disabled={hintTypes.jersey}
                revealed={hintTypes.jersey}
              />
            </View>
          </View>
        )}

        {/* Guesses List */}
        {guesses.length > 0 && (
          <View style={styles.guessesContainer}>
            <Text style={styles.guessesTitle}>Your Guesses:</Text>
            {guesses.map((guess, index) => (
              <View key={index} style={styles.guessItem}>
                <Text style={styles.guessNumber}>{index + 1}.</Text>
                <Text style={styles.guessText}>{guess}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Player Search */}
        {!gameOver && (
          <View style={styles.searchContainer}>
            <Text style={styles.searchLabel}>
              Guess the Player ({remainingGuesses} {remainingGuesses === 1 ? 'guess' : 'guesses'} left):
            </Text>
            <PlayerSearch onSelectPlayer={handleGuess} disabled={gameOver} />
          </View>
        )}
      </ScrollView>

      {/* Results Modal */}
      <PicturePerfectResults
        visible={showResults}
        won={won}
        guessCount={guesses.length}
        points={points}
        hintsUsed={revealedHints.length}
        playerName={mysteryPlayerName}
        playerId={mysteryPlayerId}
        stats={stats}
        onClose={handleClose}
        onPlayAgain={handlePlayAgain}
        isDaily={isDaily}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    color: Colors.text,
    fontSize: 16,
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: Colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 60,
  },
  backButtonText: {
    color: Colors.primary,
    fontSize: 16,
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  scoreItem: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  pointsText: {
    color: Colors.exact,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  hintButtons: {
    marginBottom: 20,
  },
  hintTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  hintButtonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  guessesContainer: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  guessesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  guessItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  guessNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    width: 30,
  },
  guessText: {
    fontSize: 15,
    color: Colors.text,
    flex: 1,
  },
  searchContainer: {
    marginBottom: 40,
  },
  searchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
});

export default PicturePerfectScreen;
