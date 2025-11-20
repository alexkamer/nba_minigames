import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Share,
  Image,
} from 'react-native';
import { Colors } from '../constants/colors';

export interface PicturePerfectStats {
  gamesPlayed: number;
  gamesWon: number;
  totalPoints: number;
  averageGuesses: number;
}

interface PicturePerfectResultsProps {
  visible: boolean;
  won: boolean;
  guessCount: number;
  points: number;
  hintsUsed: number;
  playerName: string;
  playerId: string;
  stats: PicturePerfectStats;
  onClose: () => void;
  onPlayAgain: () => void;
  isDaily: boolean;
}

export const PicturePerfectResults: React.FC<PicturePerfectResultsProps> = ({
  visible,
  won,
  guessCount,
  points,
  hintsUsed,
  playerName,
  playerId,
  stats,
  onClose,
  onPlayAgain,
  isDaily,
}) => {
  const headshotUrl = `https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/${playerId}.png`;

  const handleShare = async () => {
    const title = won ? `Picture Perfect ${points} pts` : 'Picture Perfect X';
    const message = `${title}\n\nGuesses: ${guessCount}/6\nHints: ${hintsUsed}\n\nI ${
      won ? 'guessed' : "couldn't guess"
    } the NBA player!\n\nPlay Picture Perfect!`;

    try {
      await Share.share({ message, title });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>
            {won ? '🎉 Perfect!' : '😔 Game Over'}
          </Text>

          <View style={styles.playerContainer}>
            <View style={styles.headshotContainer}>
              <Image
                source={{ uri: headshotUrl }}
                style={styles.headshot}
                resizeMode="contain"
              />
            </View>
            <View style={styles.nameContainer}>
              <Text style={styles.playerName}>{playerName}</Text>
              <Text style={styles.subtitle}>
                {won
                  ? `${points} points in ${guessCount} ${
                      guessCount === 1 ? 'guess' : 'guesses'
                    }!`
                  : 'Better luck next time!'}
              </Text>
            </View>
          </View>

          {won && (
            <View style={styles.gameInfo}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Guesses:</Text>
                <Text style={styles.infoValue}>{guessCount}/6</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Hints Used:</Text>
                <Text style={styles.infoValue}>{hintsUsed}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Points:</Text>
                <Text style={[styles.infoValue, styles.pointsValue]}>{points}</Text>
              </View>
            </View>
          )}

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.gamesPlayed}</Text>
              <Text style={styles.statLabel}>Played</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {stats.gamesPlayed > 0
                  ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
                  : 0}
                %
              </Text>
              <Text style={styles.statLabel}>Win Rate</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {stats.gamesPlayed > 0
                  ? Math.round(stats.totalPoints / stats.gamesPlayed)
                  : 0}
              </Text>
              <Text style={styles.statLabel}>Avg Points</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {stats.averageGuesses > 0
                  ? stats.averageGuesses.toFixed(1)
                  : '0.0'}
              </Text>
              <Text style={styles.statLabel}>Avg Guesses</Text>
            </View>
          </View>

          <View style={styles.buttons}>
            {isDaily ? (
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={onClose}
              >
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={onPlayAgain}
              >
                <Text style={styles.buttonText}>Play Again</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={handleShare}
            >
              <Text style={styles.buttonText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  playerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 16,
  },
  headshotContainer: {
    width: 100,
    height: 100,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  headshot: {
    width: '100%',
    height: '100%',
  },
  nameContainer: {
    flex: 1,
  },
  playerName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  gameInfo: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  pointsValue: {
    color: Colors.exact,
    fontSize: 18,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  buttons: {
    gap: 12,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  secondaryButton: {
    backgroundColor: Colors.border,
  },
  buttonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
