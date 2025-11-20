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
  // Calculate image resolution based on blur radius (0-20)
  // At blur=20: request 20px image (worst quality)
  // At blur=0: request 500px image (best quality)
  const imageResolution = Math.max(20, Math.floor(500 - (blurRadius / 20) * 480));

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
