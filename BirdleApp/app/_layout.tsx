import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

export default function RootLayout() {
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#121213' },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="game" />
        <Stack.Screen name="pictureperfect" />
        <Stack.Screen name="stats" />
        <Stack.Screen name="howtoplay" />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}
