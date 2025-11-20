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
  const headshotUrl = `https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/${playerId}.png`;

  // Calculate pixelation amount based on blur radius (0-20)
  // Higher blur = more pixelation (smaller scale)
  const pixelationScale = Math.max(0.1, 1 - (blurRadius / 20) * 0.8);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Image
        source={{ uri: headshotUrl }}
        style={[
          styles.image,
          {
            width: size * pixelationScale,
            height: size * pixelationScale,
            transform: [{ scale: 1 / pixelationScale }],
          },
        ]}
        blurRadius={blurRadius / 2}
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
