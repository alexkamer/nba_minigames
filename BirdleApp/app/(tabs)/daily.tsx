import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../src/constants/colors';
import { hasPlayedToday, hasPPPlayedToday } from '../../src/utils/storage';

export default function DailyTab() {
  const router = useRouter();
  const [dailyCompleted, setDailyCompleted] = useState(false);
  const [ppDailyCompleted, setPpDailyCompleted] = useState(false);

  useEffect(() => {
    checkDailyStatus();
  }, []);

  const checkDailyStatus = async () => {
    const completed = await hasPlayedToday();
    setDailyCompleted(completed);

    const ppCompleted = await hasPPPlayedToday();
    setPpDailyCompleted(ppCompleted);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>🏀</Text>
        <Text style={styles.title}>Daily Games</Text>
        <Text style={styles.subtitle}>One puzzle per day</Text>

        <View style={styles.buttons}>
          <TouchableOpacity
            style={[
              styles.button,
              styles.primaryButton,
            ]}
            onPress={() => router.push('/game?isDaily=true')}
          >
            <View style={styles.buttonContent}>
              <View style={styles.buttonTextContainer}>
                <Text style={styles.buttonText}>
                  {dailyCompleted ? 'View Daily Birdle ✓' : 'Daily Birdle'}
                </Text>
                <Text style={styles.buttonSubtext}>
                  {dailyCompleted ? 'See your completed game' : 'Guess the NBA player'}
                </Text>
              </View>
              <Image
                source={require('../../assets/images/Birdle_Logo.png')}
                style={styles.buttonLogo}
                resizeMode="contain"
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.ppPrimaryButton,
            ]}
            onPress={() => router.push('/pictureperfect?isDaily=true')}
          >
            <View style={styles.buttonContent}>
              <View style={styles.buttonTextContainer}>
                <Text style={styles.buttonText}>
                  {ppDailyCompleted ? 'View Picture Perfect ✓' : 'Daily Picture Perfect'}
                </Text>
                <Text style={styles.buttonSubtext}>
                  {ppDailyCompleted ? 'See your completed game' : 'Guess from a blurred photo'}
                </Text>
              </View>
              <Image
                source={require('../../assets/images/Picture_Perfect_Logo.png')}
                style={styles.buttonLogo}
                resizeMode="contain"
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.crossOverButton,
            ]}
            onPress={() => router.push('/crossover?isDaily=true')}
          >
            <View style={styles.buttonContent}>
              <View style={styles.buttonTextContainer}>
                <Text style={styles.buttonText}>
                  Daily Cross-Over
                </Text>
                <Text style={styles.buttonSubtext}>
                  Find groups of 4 NBA players
                </Text>
              </View>
              <Text style={styles.buttonEmoji}>🔀</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.hoopHeadsButton,
            ]}
            onPress={() => router.push('/hoopheads?isDaily=true')}
          >
            <View style={styles.buttonContent}>
              <View style={styles.buttonTextContainer}>
                <Text style={styles.buttonText}>
                  Daily Hoop Heads
                </Text>
                <Text style={styles.buttonSubtext}>
                  Guess 3 players from combined image
                </Text>
              </View>
              <Text style={styles.buttonEmoji}>🎭</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={[styles.button, styles.outlineButton]}
            onPress={() => router.push('/howtoplay')}
          >
            <Text style={[styles.buttonText, styles.outlineButtonText]}>
              How to Play
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

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
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  buttonTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  buttonLogo: {
    width: 40,
    height: 40,
    tintColor: Colors.text,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
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
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 16,
  },
  ppPrimaryButton: {
    backgroundColor: '#9B59B6',
  },
  crossOverButton: {
    backgroundColor: '#E67E22',
  },
  hoopHeadsButton: {
    backgroundColor: '#16A085',
  },
  buttonEmoji: {
    fontSize: 40,
  },
});
