import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { AttributeComparison } from '../types';
import { Colors } from '../constants/colors';

interface AttributeCellProps {
  label: string;
  comparison: AttributeComparison | null;
}

export const AttributeCell: React.FC<AttributeCellProps> = ({
  label,
  comparison,
}) => {
  // Debug: Log team comparison data
  if (label === 'Team' && comparison) {
    console.log('Team comparison:', JSON.stringify(comparison, null, 2));
  }

  const getBackgroundColor = () => {
    if (!comparison) return Colors.empty;

    switch (comparison.match) {
      case 'exact':
        return Colors.exact;
      case 'partial':
        return Colors.partial;
      case 'close':
        return Colors.close;
      case 'higher':
        return Colors.higher;
      case 'lower':
        return Colors.lower;
      default:
        return Colors.wrong;
    }
  };

  const getDisplayValue = () => {
    if (!comparison) return '';

    const value = comparison.value.toString();

    // Add arrows for directional hints
    if (comparison.match === 'higher') {
      return `${value} ↓`;
    }
    if (comparison.match === 'lower') {
      return `${value} ↑`;
    }

    return value;
  };

  // If there's a logo with a valid URL, show it instead of text
  if (comparison?.logo && comparison.logo.trim() !== '') {
    return (
      <View style={[styles.cell, { backgroundColor: getBackgroundColor() }]}>
        <Text style={styles.label}>{label}</Text>
        <Image
          source={{ uri: comparison.logo }}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
    );
  }

  return (
    <View style={[styles.cell, { backgroundColor: getBackgroundColor() }]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
        {getDisplayValue()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  cell: {
    flex: 1,
    margin: 2,
    padding: 8,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 60,
  },
  label: {
    fontSize: 10,
    color: Colors.text,
    marginBottom: 2,
  },
  value: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
  },
  logo: {
    width: 30,
    height: 30,
  },
});
