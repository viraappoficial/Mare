import { createElement, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, fonts, radii, spacing } from '../lib/theme';

type Props = {
  /** formato AAAA-MM-DD */
  value: string;
  onChange: (valor: string) => void;
};

function paraData(valor: string) {
  return valor ? new Date(`${valor}T00:00:00`) : new Date();
}

function formatarData(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// No web usamos o <input type="date"> nativo do navegador — abre o
// calendário do próprio sistema. Em iOS/Android usa o DateTimePicker nativo.
export function DataInput({ value, onChange }: Props) {
  if (Platform.OS === 'web') {
    return createElement('input', {
      type: 'date',
      value,
      onChange: (e: { target: { value: string } }) => onChange(e.target.value),
      style: {
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
        colorScheme: 'dark',
      },
    });
  }

  const [mostrar, setMostrar] = useState(false);

  return (
    <View>
      <Pressable style={styles.campo} onPress={() => setMostrar(true)}>
        <Text style={styles.texto}>{value || 'Escolher data'}</Text>
      </Pressable>
      {mostrar && (
        <DateTimePicker
          value={paraData(value)}
          mode="date"
          onChange={(_evento, novaData) => {
            setMostrar(false);
            if (novaData) onChange(formatarData(novaData));
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
