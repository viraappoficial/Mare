import { useMemo, useRef, useState } from 'react';
import { PanResponder, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radii } from '../lib/theme';
import { hexToHsv, hsvToHex } from '../lib/color';

const SV_SIZE = 220;
const HUE_HEIGHT = 20;
const THUMB = 20;

const HUE_CORES = [
  '#FF0000',
  '#FFFF00',
  '#00FF00',
  '#00FFFF',
  '#0000FF',
  '#FF00FF',
  '#FF0000',
] as const;

type Props = {
  value: string;
  onChange: (hex: string) => void;
};

function clamp(n: number, min: number, max: number) {
  'worklet';
  return Math.min(max, Math.max(min, n));
}

export function ColorPicker({ value, onChange }: Props) {
  const inicial = useMemo(() => hexToHsv(value), []);
  const [h, setH] = useState(inicial.h);
  const [s, setS] = useState(inicial.s);
  const [v, setV] = useState(inicial.v);

  const atualizar = (novoH: number, novoS: number, novoV: number) => {
    setH(novoH);
    setS(novoS);
    setV(novoV);
    onChange(hsvToHex(novoH, novoS, novoV));
  };

  const svResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => lidarSv(e.nativeEvent.locationX, e.nativeEvent.locationY),
      onPanResponderMove: (e) => lidarSv(e.nativeEvent.locationX, e.nativeEvent.locationY),
    })
  ).current;

  const hueResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => lidarHue(e.nativeEvent.locationX),
      onPanResponderMove: (e) => lidarHue(e.nativeEvent.locationX),
    })
  ).current;

  function lidarSv(x: number, y: number) {
    const novoS = clamp((x / SV_SIZE) * 100, 0, 100);
    const novoV = clamp(100 - (y / SV_SIZE) * 100, 0, 100);
    atualizar(h, novoS, novoV);
  }

  function lidarHue(x: number) {
    const novoH = clamp((x / SV_SIZE) * 360, 0, 360);
    atualizar(novoH, s, v);
  }

  const corPura = hsvToHex(h, 100, 100);

  return (
    <View style={styles.container}>
      <View style={styles.svArea} {...svResponder.panHandlers}>
        <LinearGradient
          colors={['#FFFFFF', corPura]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={['rgba(0,0,0,0)', '#000000']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View
          pointerEvents="none"
          style={[
            styles.svThumb,
            {
              left: (s / 100) * SV_SIZE - THUMB / 2,
              top: (1 - v / 100) * SV_SIZE - THUMB / 2,
              backgroundColor: hsvToHex(h, s, v),
            },
          ]}
        />
      </View>

      <View style={styles.hueArea} {...hueResponder.panHandlers}>
        <LinearGradient
          colors={HUE_CORES}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        <View
          pointerEvents="none"
          style={[
            styles.hueThumb,
            {
              left: (h / 360) * SV_SIZE - THUMB / 2,
              backgroundColor: corPura,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 14, alignItems: 'center' },
  svArea: {
    width: SV_SIZE,
    height: SV_SIZE,
    borderRadius: radii.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  svThumb: {
    position: 'absolute',
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 3,
  },
  hueArea: {
    width: SV_SIZE,
    height: HUE_HEIGHT,
    borderRadius: radii.full,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  hueThumb: {
    position: 'absolute',
    top: -2,
    width: THUMB,
    height: HUE_HEIGHT + 4,
    borderRadius: THUMB / 2,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 3,
  },
});
