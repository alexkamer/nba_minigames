import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { Colors } from '../constants/colors';
import { Fonts } from '@/constants/theme';

interface CrossOverScreenProps {
  route: {
    params: {
      isDaily?: string;
    };
  };
  navigation: any;
}

interface GridCell {
  playerName: string;
  isCorrect: boolean | null; // null = not guessed yet, true = correct, false = incorrect
}

// Placeholder criteria for the grid
const PLACEHOLDER_ROW_CRITERIA = [
  'Lakers',
  'Warriors',
  'Heat',
];

const PLACEHOLDER_COL_CRITERIA = [
  'All-Star',
  'Champion',
  '30+ PPG Season',
];

const CrossOverScreen: React.FC<CrossOverScreenProps> = ({ route, navigation }) => {
  const isDaily = route.params?.isDaily === 'true';

  const [grid, setGrid] = useState<GridCell[][]>([]);
  const [selectedCell, setSelectedCell] = useState<{row: number, col: number} | null>(null);
  const [inputModalVisible, setInputModalVisible] = useState(false);
  const [playerInput, setPlayerInput] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);

  const MAX_ATTEMPTS = 9;

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    // Initialize empty 3x3 grid
    const emptyGrid: GridCell[][] = Array(3).fill(null).map(() =>
      Array(3).fill(null).map(() => ({
        playerName: '',
        isCorrect: null,
      }))
    );
    setGrid(emptyGrid);
    setSelectedCell(null);
    setGameOver(false);
    setScore(0);
    setAttempts(0);
  };

  const handleCellPress = (row: number, col: number) => {
    if (gameOver) return;

    // Don't allow changing a correct answer
    if (grid[row][col].isCorrect === true) {
      Alert.alert('Already Correct', 'You already guessed this cell correctly!');
      return;
    }

    setSelectedCell({ row, col });
    setPlayerInput('');
    setInputModalVisible(true);
  };

  const handleSubmitGuess = () => {
    if (!selectedCell || !playerInput.trim()) {
      Alert.alert('Invalid Input', 'Please enter a player name.');
      return;
    }

    const { row, col } = selectedCell;
    const newGrid = [...grid];

    // For placeholder purposes, randomly determine if it's correct (20% chance)
    // In real implementation, this would check against actual player data
    const isCorrect = Math.random() < 0.2;

    newGrid[row][col] = {
      playerName: playerInput.trim(),
      isCorrect: isCorrect,
    };

    setGrid(newGrid);
    setAttempts(attempts + 1);

    if (isCorrect) {
      setScore(score + 1);
    }

    setInputModalVisible(false);
    setPlayerInput('');
    setSelectedCell(null);

    // Check if game is over
    if (score + 1 === 9) {
      setGameOver(true);
      Alert.alert('Perfect!', '🎉 You completed the grid with a perfect score!');
    } else if (attempts + 1 >= MAX_ATTEMPTS) {
      setGameOver(true);
      Alert.alert('Game Over', `You finished with ${isCorrect ? score + 1 : score}/9 correct!`);
    }
  };

  const getCellStyle = (cell: GridCell) => {
    if (cell.isCorrect === null) {
      return styles.emptyCell;
    } else if (cell.isCorrect) {
      return styles.correctCell;
    } else {
      return styles.incorrectCell;
    }
  };

  const getCellTextStyle = (cell: GridCell) => {
    if (cell.isCorrect === null) {
      return styles.emptyCellText;
    } else if (cell.isCorrect) {
      return styles.correctCellText;
    } else {
      return styles.incorrectCellText;
    }
  };

  const renderGrid = () => {
    return (
      <View style={styles.gridContainer}>
        {/* Header row with column criteria */}
        <View style={styles.gridRow}>
          <View style={styles.cornerCell} />
          {PLACEHOLDER_COL_CRITERIA.map((criteria, index) => (
            <View key={`col-${index}`} style={styles.headerCell}>
              <Text style={styles.headerText}>{criteria}</Text>
            </View>
          ))}
        </View>

        {/* Grid rows */}
        {grid.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.gridRow}>
            {/* Row criteria */}
            <View style={styles.headerCell}>
              <Text style={styles.headerText}>
                {PLACEHOLDER_ROW_CRITERIA[rowIndex]}
              </Text>
            </View>

            {/* Grid cells */}
            {row.map((cell, colIndex) => (
              <TouchableOpacity
                key={`cell-${rowIndex}-${colIndex}`}
                style={[styles.gridCell, getCellStyle(cell)]}
                onPress={() => handleCellPress(rowIndex, colIndex)}
                disabled={gameOver && cell.isCorrect !== null}
              >
                {cell.playerName ? (
                  <Text
                    style={[styles.cellText, getCellTextStyle(cell)]}
                    numberOfLines={2}
                    adjustsFontSizeToFit
                  >
                    {cell.playerName}
                  </Text>
                ) : (
                  <Text style={styles.emptyCellText}>?</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Cross-Over</Text>
          <Text style={styles.subtitle}>
            {isDaily ? 'Daily Grid' : 'Unlimited Mode'}
          </Text>
          <Text style={styles.instructions}>
            Find a player for each cell that matches both criteria
          </Text>
        </View>

        {/* Score display */}
        <View style={styles.scoreContainer}>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreLabel}>Score</Text>
            <Text style={styles.scoreValue}>{score}/9</Text>
          </View>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreLabel}>Guesses</Text>
            <Text style={styles.scoreValue}>{attempts}/{MAX_ATTEMPTS}</Text>
          </View>
        </View>

        {/* Grid */}
        {renderGrid()}

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendSquare, styles.correctCell]} />
            <Text style={styles.legendText}>Correct</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendSquare, styles.incorrectCell]} />
            <Text style={styles.legendText}>Incorrect</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendSquare, styles.emptyCell]} />
            <Text style={styles.legendText}>Not Guessed</Text>
          </View>
        </View>

        {/* New game button */}
        {gameOver && (
          <TouchableOpacity
            style={styles.newGameButton}
            onPress={initializeGame}
          >
            <Text style={styles.newGameButtonText}>New Game</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Input Modal */}
      <Modal
        visible={inputModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setInputModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Player Name</Text>
            {selectedCell && (
              <Text style={styles.modalSubtitle}>
                {PLACEHOLDER_ROW_CRITERIA[selectedCell.row]} + {PLACEHOLDER_COL_CRITERIA[selectedCell.col]}
              </Text>
            )}

            <TextInput
              style={styles.input}
              value={playerInput}
              onChangeText={setPlayerInput}
              placeholder="Player name..."
              placeholderTextColor={Colors.textSecondary}
              autoFocus
              autoCapitalize="words"
              onSubmitEditing={handleSubmitGuess}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setInputModalVisible(false);
                  setPlayerInput('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleSubmitGuess}
              >
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 20,
  },
  scoreBox: {
    backgroundColor: Colors.rowBg,
    padding: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  scoreLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  scoreValue: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: 'bold',
  },
  gridContainer: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  gridRow: {
    flexDirection: 'row',
  },
  cornerCell: {
    width: 80,
    height: 80,
    backgroundColor: Colors.background,
  },
  headerCell: {
    width: 80,
    height: 80,
    backgroundColor: Colors.rowBg,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerText: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  gridCell: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyCell: {
    backgroundColor: Colors.background,
  },
  correctCell: {
    backgroundColor: '#6aaa64',
  },
  incorrectCell: {
    backgroundColor: '#787c7e',
  },
  cellText: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyCellText: {
    color: Colors.textSecondary,
    fontSize: 24,
  },
  correctCellText: {
    color: Colors.text,
  },
  incorrectCellText: {
    color: Colors.text,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendSquare: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  legendText: {
    color: Colors.text,
    fontSize: 12,
  },
  newGameButton: {
    backgroundColor: '#6aaa64',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  newGameButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.rowBg,
    borderRadius: 12,
    padding: 24,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#6aaa64',
  },
  submitButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CrossOverScreen;
