import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Colors } from '../constants/colors';
import { hasPlayedToday } from '../utils/storage';

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [dailyCompleted, setDailyCompleted] = useState(false);

  useEffect(() => {
    checkDailyStatus();
  }, []);

  const checkDailyStatus = async () => {
    const completed = await hasPlayedToday();
    setDailyCompleted(completed);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>🏀</Text>
        <Text style={styles.title}>BIRDLE</Text>
        <Text style={styles.subtitle}>NBA Wordle</Text>

        <View style={styles.buttons}>
          <TouchableOpacity
            style={[
              styles.button,
              styles.primaryButton,
              dailyCompleted && styles.buttonDisabled,
            ]}
            onPress={() => navigation.push('/game?isDaily=true')}
            disabled={dailyCompleted}
          >
            <Text style={styles.buttonText}>
              {dailyCompleted ? 'Daily Completed ✓' : 'Daily Challenge'}
            </Text>
            {!dailyCompleted && (
              <Text style={styles.buttonSubtext}>One puzzle per day</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => navigation.push('/game?isDaily=false')}
          >
            <Text style={styles.buttonText}>Practice Mode</Text>
            <Text style={styles.buttonSubtext}>Unlimited games</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.outlineButton]}
            onPress={() => navigation.push('/stats')}
          >
            <Text style={[styles.buttonText, styles.outlineButtonText]}>
              Statistics
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.outlineButton]}
            onPress={() => navigation.push('/howtoplay')}
          >
            <Text style={[styles.buttonText, styles.outlineButtonText]}>
              How to Play
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  logo: {
    fontSize: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginBottom: 48,
  },
  buttons: {
    width: '100%',
    maxWidth: 400,
    gap: 16,
  },
  button: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  secondaryButton: {
    backgroundColor: Colors.nbaBlue,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  outlineButtonText: {
    color: Colors.text,
  },
  buttonSubtext: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
});
