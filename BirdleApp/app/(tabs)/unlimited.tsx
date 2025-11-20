import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../src/constants/colors';

export default function UnlimitedTab() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>🏀</Text>
        <Text style={styles.title} adjustsFontSizeToFit numberOfLines={1}>Unlimited Games</Text>
        <Text style={styles.subtitle}>Play as many times as you want</Text>

        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => router.push('/game?isDaily=false')}
          >
            <View style={styles.buttonContent}>
              <View style={styles.buttonTextContainer}>
                <Text style={styles.buttonText}>Unlimited Birdle</Text>
                <Text style={styles.buttonSubtext}>Guess the NBA player</Text>
              </View>
              <Image
                source={require('../../assets/images/Birdle_Logo.png')}
                style={styles.buttonLogo}
                resizeMode="contain"
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.ppSecondaryButton]}
            onPress={() => router.push('/pictureperfect?isDaily=false')}
          >
            <View style={styles.buttonContent}>
              <View style={styles.buttonTextContainer}>
                <Text style={styles.buttonText}>Unlimited Picture Perfect</Text>
                <Text style={styles.buttonSubtext}>Guess from a blurred photo</Text>
              </View>
              <Image
                source={require('../../assets/images/Picture_Perfect_Logo.png')}
                style={styles.buttonLogo}
                resizeMode="contain"
              />
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
  secondaryButton: {
    backgroundColor: Colors.nbaBlue,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.border,
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
  ppSecondaryButton: {
    backgroundColor: '#8E44AD',
  },
});
