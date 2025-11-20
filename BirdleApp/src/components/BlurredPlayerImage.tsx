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

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Image
        source={{ uri: headshotUrl }}
        style={[styles.image, { width: size, height: size }]}
        blurRadius={blurRadius}
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
