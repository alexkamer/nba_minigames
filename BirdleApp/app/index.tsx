import { HomeScreen } from '../src/screens/HomeScreen';
import { useRouter } from 'expo-router';

export default function Index() {
  const router = useRouter();

  return <HomeScreen navigation={router} />;
}
