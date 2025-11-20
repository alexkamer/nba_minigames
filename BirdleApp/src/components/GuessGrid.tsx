import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { GuessResult } from '../types';
import { GuessRow } from './GuessRow';

interface GuessGridProps {
  guesses: GuessResult[];
  maxGuesses: number;
}

export const GuessGrid: React.FC<GuessGridProps> = ({
  guesses,
  maxGuesses,
}) => {
  const rows = [];

  // Add actual guesses
  for (const guess of guesses) {
    rows.push(
      <GuessRow
        key={`guess-${rows.length}`}
        player={guess.player}
        comparison={guess.comparison}
      />
    );
  }

  // Add empty rows
  for (let i = guesses.length; i < maxGuesses; i++) {
    rows.push(<GuessRow key={`empty-${i}`} player={null} comparison={null} />);
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {rows}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
});
