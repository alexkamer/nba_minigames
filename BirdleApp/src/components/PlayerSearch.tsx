import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { PlayerBasic } from '../types';
import { searchPlayers } from '../services/api';
import { Colors } from '../constants/colors';

interface PlayerSearchProps {
  onSelectPlayer: (playerName: string) => void;
  disabled: boolean;
}

export const PlayerSearch: React.FC<PlayerSearchProps> = ({
  onSelectPlayer,
  disabled,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PlayerBasic[]>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const search = async () => {
      if (query.length < 1) {
        setResults([]);
        return;
      }

      try {
        const players = await searchPlayers(query);
        setResults(players);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      }
    };

    const timeoutId = setTimeout(search, 100);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSelectPlayer = (player: PlayerBasic) => {
    onSelectPlayer(player.display_name);
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.input, disabled && styles.inputDisabled]}
        placeholder="Search for a player..."
        placeholderTextColor={Colors.textSecondary}
        value={query}
        onChangeText={setQuery}
        onFocus={() => setShowResults(true)}
        editable={!disabled}
        autoCapitalize="words"
        autoCorrect={false}
      />

      {showResults && results.length > 0 && (
        <View style={styles.resultsContainer}>
          <ScrollView
            style={styles.resultsList}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
          >
            {results.map((item) => (
              <TouchableOpacity
                key={item.espn_player_id}
                style={styles.resultItem}
                onPress={() => handleSelectPlayer(item)}
              >
                <Text style={styles.playerName}>{item.display_name}</Text>
                <Text style={styles.playerInfo}>
                  {item.team_abbreviation} • {item.position}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 16,
  },
  input: {
    backgroundColor: Colors.cardBackground,
    color: Colors.text,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
  },
  inputDisabled: {
    opacity: 0.5,
  },
  resultsContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.border,
    maxHeight: 300,
    zIndex: 1000,
  },
  resultsList: {
    maxHeight: 300,
  },
  resultItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  playerName: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  playerInfo: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
});
