import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

export interface Hint {
  type: string;
  display: string;
}

interface HintDisplayProps {
  hints: Hint[];
}

const HintDisplay: React.FC<HintDisplayProps> = ({ hints }) => {
  if (hints.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Revealed Hints:</Text>
      {hints.map((hint, index) => (
        <View key={index} style={styles.hintItem}>
          <Text style={styles.hintText}>{hint.display}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  hintItem: {
    backgroundColor: Colors.exact,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  hintText: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
});

export default HintDisplay;
