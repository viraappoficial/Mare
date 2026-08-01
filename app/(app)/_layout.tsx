import { Redirect, Stack } from 'expo-router';
import { useAuth } from '../../lib/auth-context';
import { colors } from '../../lib/theme';

export default function AppLayout() {
  const { session, carregando } = useAuth();

  if (carregando) return null;
  if (!session) return <Redirect href="/(auth)/login" />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="escolher-perfil" options={{ presentation: 'fullScreenModal' }} />
      <Stack.Screen name="tutorial" options={{ presentation: 'fullScreenModal' }} />
    </Stack>
  );
}
