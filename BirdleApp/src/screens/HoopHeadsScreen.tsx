import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { Colors } from '../constants/colors';
import { Fonts } from '@/constants/theme';

interface HoopHeadsScreenProps {
  route: {
    params: {
      isDaily?: string;
    };
  };
  navigation: any;
}

interface PlayerSlice {
  playerId: string;
  playerName: string; // Actual answer
  guessedName: string; // User's guess
  isCorrect: boolean;
}

// Mock data - Stephen Curry, Anthony Edwards, Kevin Durant
const MOCK_PLAYERS = {
  top: {
    playerId: '3975',
    playerName: 'Stephen Curry',
  },
  middle: {
    playerId: '4594268',
    playerName: 'Anthony Edwards',
  },
  bottom: {
    playerId: '3202',
    playerName: 'Kevin Durant',
  },
};

const HoopHeadsScreen: React.FC<HoopHeadsScreenProps> = ({ route, navigation }) => {
  const isDaily = route.params?.isDaily === 'true';

  const [topPlayer, setTopPlayer] = useState<PlayerSlice>({
    playerId: MOCK_PLAYERS.top.playerId,
    playerName: MOCK_PLAYERS.top.playerName,
    guessedName: '',
    isCorrect: false,
  });

  const [middlePlayer, setMiddlePlayer] = useState<PlayerSlice>({
    playerId: MOCK_PLAYERS.middle.playerId,
    playerName: MOCK_PLAYERS.middle.playerName,
    guessedName: '',
    isCorrect: false,
  });

  const [bottomPlayer, setBottomPlayer] = useState<PlayerSlice>({
    playerId: MOCK_PLAYERS.bottom.playerId,
    playerName: MOCK_PLAYERS.bottom.playerName,
    guessedName: '',
    isCorrect: false,
  });

  const [guesses, setGuesses] = useState<number>(0);
  const [gameOver, setGameOver] = useState(false);
  const MAX_GUESSES = 6;

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    // In real implementation, this would load the daily/random players from database
    setTopPlayer({
      playerId: MOCK_PLAYERS.top.playerId,
      playerName: MOCK_PLAYERS.top.playerName,
      guessedName: '',
      isCorrect: false,
    });
    setMiddlePlayer({
      playerId: MOCK_PLAYERS.middle.playerId,
      playerName: MOCK_PLAYERS.middle.playerName,
      guessedName: '',
      isCorrect: false,
    });
    setBottomPlayer({
      playerId: MOCK_PLAYERS.bottom.playerId,
      playerName: MOCK_PLAYERS.bottom.playerName,
      guessedName: '',
      isCorrect: false,
    });
    setGuesses(0);
    setGameOver(false);
  };

  const normalizePlayerName = (name: string): string => {
    return name.toLowerCase().trim().replace(/[^\w\s]/g, '');
  };

  const handleSubmitGuess = () => {
    if (!topPlayer.guessedName && !middlePlayer.guessedName && !bottomPlayer.guessedName) {
      Alert.alert('No Guesses', 'Please enter at least one player name.');
      return;
    }

    // Check if guesses match the actual player names
    const newTopCorrect = topPlayer.guessedName.trim()
      ? normalizePlayerName(topPlayer.guessedName) === normalizePlayerName(topPlayer.playerName)
      : false;

    const newMiddleCorrect = middlePlayer.guessedName.trim()
      ? normalizePlayerName(middlePlayer.guessedName) === normalizePlayerName(middlePlayer.playerName)
      : false;

    const newBottomCorrect = bottomPlayer.guessedName.trim()
      ? normalizePlayerName(bottomPlayer.guessedName) === normalizePlayerName(bottomPlayer.playerName)
      : false;

    setTopPlayer(prev => ({
      ...prev,
      isCorrect: prev.isCorrect || newTopCorrect,
    }));

    setMiddlePlayer(prev => ({
      ...prev,
      isCorrect: prev.isCorrect || newMiddleCorrect,
    }));

    setBottomPlayer(prev => ({
      ...prev,
      isCorrect: prev.isCorrect || newBottomCorrect,
    }));

    const newGuesses = guesses + 1;
    setGuesses(newGuesses);

    // Check if all correct
    const allCorrect =
      (topPlayer.isCorrect || newTopCorrect) &&
      (middlePlayer.isCorrect || newMiddleCorrect) &&
      (bottomPlayer.isCorrect || newBottomCorrect);

    if (allCorrect) {
      setGameOver(true);
      Alert.alert('Congratulations!', `You got all 3 players in ${newGuesses} guess${newGuesses === 1 ? '' : 'es'}!`);
    } else if (newGuesses >= MAX_GUESSES) {
      setGameOver(true);
      Alert.alert('Game Over', 'You ran out of guesses!');
    }
  };

  const renderPlayerInput = (
    slice: PlayerSlice,
    setSlice: React.Dispatch<React.SetStateAction<PlayerSlice>>,
    label: string,
    color: string
  ) => {
    return (
      <View style={styles.inputSection}>
        <View style={[styles.labelContainer, { backgroundColor: color }]}>
          <Text style={styles.label}>{label}</Text>
          {slice.isCorrect && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <TextInput
          style={[
            styles.input,
            slice.isCorrect && styles.inputCorrect,
          ]}
          value={slice.guessedName}
          onChangeText={(text) => setSlice(prev => ({ ...prev, guessedName: text }))}
          placeholder={slice.isCorrect ? slice.playerName : 'Enter player name...'}
          placeholderTextColor={Colors.textSecondary}
          editable={!gameOver && !slice.isCorrect}
          autoCapitalize="words"
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Hoop Heads</Text>
          <Text style={styles.subtitle}>
            {isDaily ? 'Daily Puzzle' : 'Unlimited Mode'}
          </Text>
          <Text style={styles.instructions}>
            Guess all 3 players from the combined image
          </Text>
        </View>

        {/* Guesses counter */}
        <View style={styles.guessesContainer}>
          <Text style={styles.guessesText}>
            Guesses: {guesses}/{MAX_GUESSES}
          </Text>
        </View>

        {/* Composite Image - Sliced Players */}
        <View style={styles.imageContainer}>
          {/* Top Slice - Stephen Curry */}
          <View style={styles.imageSection}>
            <Image
              source={{ uri: `https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/${topPlayer.playerId}.png&w=300&h=300` }}
              style={styles.playerImageTop}
              contentFit="cover"
            />
          </View>

          {/* Middle Slice - Anthony Edwards */}
          <View style={styles.imageSection}>
            <Image
              source={{ uri: `https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/${middlePlayer.playerId}.png&w=300&h=300` }}
              style={styles.playerImageMiddle}
              contentFit="cover"
            />
          </View>

          {/* Bottom Slice - Kevin Durant */}
          <View style={styles.imageSection}>
            <Image
              source={{ uri: `https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/${bottomPlayer.playerId}.png&w=300&h=300` }}
              style={styles.playerImageBottom}
              contentFit="cover"
            />
          </View>
        </View>

        {/* Player Input Sections */}
        <View style={styles.inputsContainer}>
          {renderPlayerInput(topPlayer, setTopPlayer, 'Top Player', '#FF6B6B')}
          {renderPlayerInput(middlePlayer, setMiddlePlayer, 'Middle Player', '#4ECDC4')}
          {renderPlayerInput(bottomPlayer, setBottomPlayer, 'Bottom Player', '#95E1D3')}
        </View>

        {/* Submit Button */}
        {!gameOver && (
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmitGuess}
          >
            <Text style={styles.submitButtonText}>Submit Guess</Text>
          </TouchableOpacity>
        )}

        {/* Game Over - New Game Button */}
        {gameOver && (
          <View style={styles.gameOverContainer}>
            <View style={styles.resultsBox}>
              <Text style={styles.resultsTitle}>Final Results</Text>
              <Text style={styles.resultsText}>
                {topPlayer.isCorrect && middlePlayer.isCorrect && bottomPlayer.isCorrect
                  ? `Perfect! ${guesses}/${MAX_GUESSES} guesses`
                  : `Score: ${[topPlayer, middlePlayer, bottomPlayer].filter(p => p.isCorrect).length}/3`}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.newGameButton}
              onPress={initializeGame}
            >
              <Text style={styles.newGameButtonText}>New Game</Text>
            </TouchableOpacity>

            {/* Show answers if not all correct */}
            {!(topPlayer.isCorrect && middlePlayer.isCorrect && bottomPlayer.isCorrect) && (
              <View style={styles.answersBox}>
                <Text style={styles.answersTitle}>Correct Answers:</Text>
                {!topPlayer.isCorrect && (
                  <Text style={styles.answerText}>Top: {topPlayer.playerName}</Text>
                )}
                {!middlePlayer.isCorrect && (
                  <Text style={styles.answerText}>Middle: {middlePlayer.playerName}</Text>
                )}
                {!bottomPlayer.isCorrect && (
                  <Text style={styles.answerText}>Bottom: {bottomPlayer.playerName}</Text>
                )}
              </View>
            )}
          </View>
        )}

        {/* Implementation Notes */}
        <View style={styles.notesContainer}>
          <Text style={styles.notesTitle}>🎮 Current Mock Data:</Text>
          <Text style={styles.notesText}>
            • Top: Stephen Curry (#30 - Warriors){'\n'}
            • Middle: Anthony Edwards (#5 - Timberwolves){'\n'}
            • Bottom: Kevin Durant (#7 - Suns){'\n'}
            {'\n'}
            Try typing their names to test the validation!
          </Text>
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
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.text,
    fontFamily: Fonts.rounded,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  instructions: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  guessesContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  guessesText: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  imageContainer: {
    backgroundColor: Colors.rowBg,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
    alignSelf: 'center',
    width: 300,
    height: 360,
  },
  imageSection: {
    width: '100%',
    height: 120,
    position: 'relative',
    overflow: 'hidden',
  },
  playerImageTop: {
    width: '100%',
    height: 300,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  playerImageMiddle: {
    width: '100%',
    height: 300,
    position: 'absolute',
    top: -120,
    left: 0,
  },
  playerImageBottom: {
    width: '100%',
    height: 300,
    position: 'absolute',
    top: -240,
    left: 0,
  },
  inputsContainer: {
    marginBottom: 20,
    gap: 16,
  },
  inputSection: {
    gap: 8,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  label: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkmark: {
    color: Colors.text,
    fontSize: 20,
  },
  input: {
    backgroundColor: Colors.rowBg,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
  },
  inputCorrect: {
    borderColor: '#6aaa64',
    backgroundColor: '#6aaa6420',
  },
  submitButton: {
    backgroundColor: '#6aaa64',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  submitButtonText: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  gameOverContainer: {
    gap: 16,
  },
  resultsBox: {
    backgroundColor: Colors.rowBg,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  resultsTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  resultsText: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
  newGameButton: {
    backgroundColor: '#6aaa64',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  newGameButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  answersBox: {
    backgroundColor: Colors.rowBg,
    padding: 16,
    borderRadius: 12,
  },
  answersTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  answerText: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: 4,
  },
  notesContainer: {
    backgroundColor: '#4ECDC420',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4ECDC4',
    marginTop: 20,
  },
  notesTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  notesText: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
});

export default HoopHeadsScreen;
