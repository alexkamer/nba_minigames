import React from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import HoopHeadsScreen from '../src/screens/HoopHeadsScreen';

export default function HoopHeads() {
  const router = useRouter();
  const params = useLocalSearchParams();

  return <HoopHeadsScreen route={{ params }} navigation={router} />;
}
