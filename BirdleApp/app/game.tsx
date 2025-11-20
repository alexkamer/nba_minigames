import { GameScreen } from '../src/screens/GameScreen';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function Game() {
  const router = useRouter();
  const params = useLocalSearchParams();

  return (
    <GameScreen
      route={{ params: { isDaily: params.isDaily === 'true' } }}
      navigation={router}
    />
  );
}
