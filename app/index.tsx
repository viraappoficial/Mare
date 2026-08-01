import { Redirect } from 'expo-router';
import { useAuth } from '../lib/auth-context';

export default function Index() {
  const { session, carregando } = useAuth();

  if (carregando) return null;

  return <Redirect href={session ? '/(app)' : '/(auth)/login'} />;
}
