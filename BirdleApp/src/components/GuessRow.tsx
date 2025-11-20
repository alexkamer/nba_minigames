import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { GuessComparison, PlayerFull } from '../types';
import { AttributeCell } from './AttributeCell';
import { Colors } from '../constants/colors';

interface GuessRowProps {
  player: PlayerFull | null;
  comparison: GuessComparison | null;
}

export const GuessRow: React.FC<GuessRowProps> = ({ player, comparison }) => {
  if (!player || !comparison) {
    return (
      <View style={styles.row}>
        <View style={styles.emptyRow}>
          <Text style={styles.emptyText}>—</Text>
        </View>
      </View>
    );
  }

  const headshotUrl = `https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/${player.espn_player_id}.png`;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headshotContainer}>
          <Image
            source={{ uri: headshotUrl }}
            style={styles.headshot}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.playerName}>{player.display_name}</Text>
      </View>
      <View style={styles.row}>
        <AttributeCell label="Team" comparison={comparison.team} />
        <AttributeCell label="Pos" comparison={comparison.position} />
        <AttributeCell label="Height" comparison={comparison.height} />
        <AttributeCell label="Age" comparison={comparison.age} />
        <AttributeCell label="#" comparison={comparison.jersey} />
        <AttributeCell label="Div" comparison={comparison.division} />
        <AttributeCell label="Exp" comparison={comparison.experience} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  headshotContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headshot: {
    width: '100%',
    height: '100%',
  },
  playerName: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    width: '100%',
  },
  emptyRow: {
    flex: 1,
    height: 60,
    backgroundColor: Colors.empty,
    margin: 2,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 20,
  },
});
