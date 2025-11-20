import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

interface BlurredPlayerImageProps {
  playerId: string;
  blurRadius: number;
  size?: number;
}

const BlurredPlayerImage: React.FC<BlurredPlayerImageProps> = ({
  playerId,
  blurRadius,
  size = 250,
}) => {
  // Map blur radius to specific resolutions for each guess level
  // Blur reduces by 3 per wrong guess: 20 → 17 → 14 → 11 → 8 → 5 → 2
  let imageResolution;
  if (blurRadius >= 18) {
    imageResolution = 10;  // Start
  } else if (blurRadius >= 15) {
    imageResolution = 25;  // After 1 wrong guess
  } else if (blurRadius >= 12) {
    imageResolution = 50;  // After 2 wrong guesses
  } else if (blurRadius >= 9) {
    imageResolution = 100; // After 3 wrong guesses
  } else if (blurRadius >= 6) {
    imageResolution = 150; // After 4 wrong guesses
  } else if (blurRadius >= 3) {
    imageResolution = 255; // After 5 wrong guesses
  } else {
    imageResolution = 500; // Full quality (correct guess or game over)
  }

  // Request image at specific resolution from ESPN CDN
  const headshotUrl = `https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/${playerId}.png&w=${imageResolution}&h=${imageResolution}`;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Image
        source={{ uri: headshotUrl }}
        style={[styles.image, { width: size, height: size }]}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1E1E1E',
  },
  image: {
    borderRadius: 12,
  },
});

export default BlurredPlayerImage;
