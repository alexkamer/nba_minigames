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
import { GameStats } from '../types';

interface ResultsModalProps {
  visible: boolean;
  won: boolean;
  guessCount: number;
  playerName: string;
  playerId: string;
  stats: GameStats;
  onClose: () => void;
  onPlayAgain: () => void;
  isDaily: boolean;
}

export const ResultsModal: React.FC<ResultsModalProps> = ({
  visible,
  won,
  guessCount,
  playerName,
  playerId,
  stats,
  onClose,
  onPlayAgain,
  isDaily,
}) => {
  const [imageError, setImageError] = React.useState(false);
  const headshotUrl = `https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/${playerId}.png`;

  console.log('ResultsModal - Player ID:', playerId);
  console.log('ResultsModal - Headshot URL:', headshotUrl);

  React.useEffect(() => {
    setImageError(false);
  }, [playerId]);
  const handleShare = async () => {
    const title = won ? `Birdle ${guessCount}/8` : 'Birdle X/8';
    const message = `${title}\n\nI ${
      won ? 'guessed' : "couldn't guess"
    } the NBA player!\n\nPlay Birdle!`;

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
            {won ? '🎉 Congratulations!' : '😔 Game Over'}
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
                  ? `Guessed in ${guessCount} ${
                      guessCount === 1 ? 'try' : 'tries'
                    }!`
                  : 'Better luck next time!'}
              </Text>
            </View>
          </View>

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
              <Text style={styles.statValue}>{stats.currentStreak}</Text>
              <Text style={styles.statLabel}>Streak</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.maxStreak}</Text>
              <Text style={styles.statLabel}>Max Streak</Text>
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
    marginBottom: 24,
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
  placeholderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  placeholderText: {
    fontSize: 50,
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
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
