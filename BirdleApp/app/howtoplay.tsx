import { HowToPlayScreen } from '../src/screens/HowToPlayScreen';
import { useRouter } from 'expo-router';

export default function HowToPlay() {
  const router = useRouter();

  return <HowToPlayScreen navigation={router} />;
}
