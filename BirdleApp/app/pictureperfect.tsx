import React from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import PicturePerfectScreen from '../src/screens/PicturePerfectScreen';

export default function PicturePerfect() {
  const router = useRouter();
  const params = useLocalSearchParams();

  return <PicturePerfectScreen route={{ params }} navigation={router} />;
}
