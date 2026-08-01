import { Redirect, Stack } from 'expo-router';
import { useAuth } from '../../lib/auth-context';

export default function AuthLayout() {
  const { session, carregando } = useAuth();

  if (carregando) return null;
  if (session) return <Redirect href="/(app)" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
