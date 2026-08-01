import { StyleSheet, Text, View } from 'react-native';
import { MareLogo } from './MareLogo';
import { colors, fonts, spacing } from '../lib/theme';

export function AppHeader() {
  return (
    <View style={styles.header}>
      <MareLogo size={24} />
      <Text style={styles.wordmark}>maré</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  wordmark: {
    fontFamily: fonts.heading,
    fontSize: 15,
    color: colors.text,
    letterSpacing: 0.2,
  },
});
