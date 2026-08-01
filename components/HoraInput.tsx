import { createElement, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, fonts, radii, spacing } from '../lib/theme';

type Props = {
  /** formato HH:MM */
  value: string;
  onChange: (valor: string) => void;
};

function paraData(valor: string) {
  const [h, m] = (valor || '00:00').split(':').map(Number);
  const d = new Date();
  d.setHours(h || 0, m || 0, 0, 0);
  return d;
}

function formatarHora(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// No web usamos o <input type="time"> nativo — abre o editor numérico do
// próprio sistema. Em iOS/Android usa o DateTimePicker nativo (mode="time").
export function HoraInput({ value, onChange }: Props) {
  if (Platform.OS === 'web') {
    return (
      <View style={styles.webWrap}>
        {createElement('input', {
          type: 'time',
          value,
          onChange: (e: { target: { value: string } }) => onChange(e.target.value),
          style: {
            display: 'block',
            boxSizing: 'border-box',
            backgroundColor: colors.bg,
            border: `1px solid ${colors.border}`,
            borderRadius: radii.sm,
            paddingLeft: spacing.md,
            paddingRight: spacing.md,
            paddingTop: spacing.sm + 2,
            paddingBottom: spacing.sm + 2,
            color: colors.text,
            fontFamily: fonts.mono,
            fontSize: 15,
            width: '100%',
            maxWidth: '100%',
            minWidth: 0,
            colorScheme: 'dark',
          },
        })}
      </View>
    );
  }

  const [mostrar, setMostrar] = useState(false);

  return (
    <View>
      <Pressable style={styles.campo} onPress={() => setMostrar(true)}>
        <Text style={styles.texto}>{value || 'Escolher hora'}</Text>
      </Pressable>
      {mostrar && (
        <DateTimePicker
          value={paraData(value)}
          mode="time"
          is24Hour
          onChange={(_evento, novaData) => {
            setMostrar(false);
            if (novaData) onChange(formatarHora(novaData));
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  webWrap: { width: '100%', minWidth: 0 },
  campo: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  texto: { fontFamily: fonts.mono, fontSize: 15, color: colors.text },
});
