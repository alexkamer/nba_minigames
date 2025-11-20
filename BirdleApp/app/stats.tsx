import { StatsScreen } from '../src/screens/StatsScreen';
import { useRouter } from 'expo-router';

export default function Stats() {
  const router = useRouter();

  return <StatsScreen navigation={router} />;
}
