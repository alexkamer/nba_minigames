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
  // Higher blur = more pixelation (much smaller render size)
  // At blur=20: scale=0.05 (render at 5% then scale up = heavily pixelated)
  // At blur=0: scale=1.0 (render at 100% = clear)
  const pixelationScale = Math.max(0.05, 1 - (blurRadius / 20) * 0.95);
  const scaleUpFactor = 1 / pixelationScale;

  return (
    <View style={[styles.container, { width: size, height: size, overflow: 'hidden' }]}>
      <View style={{
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        <Image
          source={{ uri: headshotUrl }}
          style={{
            width: size * pixelationScale,
            height: size * pixelationScale,
            transform: [{ scale: scaleUpFactor }],
          }}
          blurRadius={blurRadius * 0.3}
          resizeMode="contain"
        />
      </View>
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
