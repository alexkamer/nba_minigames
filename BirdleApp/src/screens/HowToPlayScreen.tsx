import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Colors } from '../constants/colors';

interface HowToPlayScreenProps {
  navigation: any;
}

export const HowToPlayScreen: React.FC<HowToPlayScreenProps> = ({
  navigation,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.back()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>How to Play</Text>
          <View style={{ width: 60 }} />
        </View>

        <View style={styles.content}>
          <Text style={styles.paragraph}>
            Guess the mystery NBA player in 8 tries or fewer!
          </Text>

          <Text style={styles.sectionTitle}>How It Works</Text>
          <Text style={styles.paragraph}>
            • A silhouette of the mystery player is shown at the top for a visual hint{'\n'}
            • Each guess must be a valid active NBA player{'\n'}
            • After each guess, the color of the tiles will change to show how
            close your guess was{'\n'}
            • Use the feedback to narrow down the mystery player{'\n'}
            • You have 8 attempts to guess correctly
          </Text>

          <Text style={styles.sectionTitle}>Color Guide</Text>

          <View style={styles.exampleRow}>
            <View style={[styles.exampleCell, { backgroundColor: Colors.exact }]}>
              <Text style={styles.cellText}>LAL</Text>
            </View>
            <Text style={styles.exampleText}>
              <Text style={styles.bold}>Green</Text> means exact match! This
              attribute is correct.
            </Text>
          </View>

          <View style={styles.exampleRow}>
            <View
              style={[styles.exampleCell, { backgroundColor: Colors.close }]}
            >
              <Text style={styles.cellText}>28</Text>
            </View>
            <Text style={styles.exampleText}>
              <Text style={styles.bold}>Yellow</Text> means close match. For numeric values (height, age, jersey, experience), this means within 2 of the correct value. For division, it means same conference but different division.
            </Text>
          </View>

          <View style={styles.exampleRow}>
            <View style={[styles.exampleCell, { backgroundColor: Colors.wrong }]}>
              <Text style={styles.cellText}>G</Text>
            </View>
            <Text style={styles.exampleText}>
              <Text style={styles.bold}>Gray</Text> means this attribute doesn't
              match at all.
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Attributes</Text>
          <Text style={styles.paragraph}>
            • <Text style={styles.bold}>Team:</Text> Player's current team (shown as team logo){'\n'}
            • <Text style={styles.bold}>Position:</Text> G (Guard), F (Forward), or C (Center){'\n'}
            • <Text style={styles.bold}>Height:</Text> Player's height (e.g., 6'7"){'\n'}
            • <Text style={styles.bold}>Age:</Text> Player's age{'\n'}
            • <Text style={styles.bold}>#:</Text> Jersey number{'\n'}
            • <Text style={styles.bold}>Div:</Text> Division (Yellow if same conference but different division){'\n'}
            • <Text style={styles.bold}>Exp:</Text> Years of NBA experience
            {'\n\n'}
            <Text style={styles.bold}>Note:</Text> For Height, Age, Jersey #, and Experience - Yellow means within 2 of the correct value! Team only shows green (correct) or gray (wrong).
          </Text>

          <Text style={styles.sectionTitle}>Game Modes</Text>
          <Text style={styles.paragraph}>
            • <Text style={styles.bold}>Daily Birdle:</Text> One mystery
            player per day, same for everyone{'\n'}
            • <Text style={styles.bold}>Unlimited Birdle:</Text> Unlimited games
            with random players
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
    padding: 16,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    color: Colors.primary,
    fontSize: 16,
    width: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
  },
  content: {
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 24,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: 16,
  },
  bold: {
    fontWeight: 'bold',
    color: Colors.text,
  },
  exampleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  exampleCell: {
    width: 60,
    height: 60,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  exampleText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
