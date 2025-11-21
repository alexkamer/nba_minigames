import React from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import CrossOverScreen from '../src/screens/CrossOverScreen';

export default function CrossOver() {
  const router = useRouter();
  const params = useLocalSearchParams();

  return <CrossOverScreen route={{ params }} navigation={router} />;
}
