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
  return Math.min(max, Math.max(min, n));
}

export function ColorPicker({ value, onChange }: Props) {
  const inicial = useMemo(() => hexToHsv(value), []);
  const [h, setH] = useState(inicial.h);
  const [s, setS] = useState(inicial.s);
  const [v, setV] = useState(inicial.v);

  // Guardamos h/s/v também em refs porque os handlers do PanResponder são
  // criados uma vez (useRef) e não devem ler valores "presos" (stale) do
  // primeiro render.
  const hRef = useRef(h);
  const sRef = useRef(s);
  const vRef = useRef(v);
  hRef.current = h;
  sRef.current = s;
  vRef.current = v;

  const atualizar = (novoH: number, novoS: number, novoV: number) => {
    setH(novoH);
    setS(novoS);
    setV(novoV);
    onChange(hsvToHex(novoH, novoS, novoV));
  };

  // Posição da área na tela (em coordenadas de página), medida no layout.
  // Necessário porque `locationX/Y` do evento não é confiável durante o
  // arraste no navegador — usamos as coordenadas absolutas do gesto
  // (gestureState.moveX/moveY) menos essa posição.
  const svViewRef = useRef<View>(null);
  const svOffset = useRef({ x: 0, y: 0 });
  const hueViewRef = useRef<View>(null);
  const hueOffset = useRef({ x: 0, y: 0 });

  function medirSv() {
    svViewRef.current?.measure((_x, _y, _w, _h2, pageX, pageY) => {
      svOffset.current = { x: pageX, y: pageY };
    });
  }

  function medirHue() {
    hueViewRef.current?.measure((_x, _y, _w, _h2, pageX, pageY) => {
      hueOffset.current = { x: pageX, y: pageY };
    });
  }

  function lidarSv(pageX: number, pageY: number) {
    const x = pageX - svOffset.current.x;
    const y = pageY - svOffset.current.y;
    const novoS = clamp((x / SV_SIZE) * 100, 0, 100);
    const novoV = clamp(100 - (y / SV_SIZE) * 100, 0, 100);
    atualizar(hRef.current, novoS, novoV);
  }

  function lidarHue(pageX: number) {
    const x = pageX - hueOffset.current.x;
    const novoH = clamp((x / SV_SIZE) * 360, 0, 360);
    atualizar(novoH, sRef.current, vRef.current);
  }

  const svResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (_e, g) => {
        medirSv();
        lidarSv(g.x0, g.y0);
      },
      onPanResponderMove: (_e, g) => lidarSv(g.moveX, g.moveY),
    })
  ).current;

  const hueResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (_e, g) => {
        medirHue();
        lidarHue(g.x0);
      },
      onPanResponderMove: (_e, g) => lidarHue(g.moveX),
    })
  ).current;

  const corPura = hsvToHex(h, 100, 100);

  return (
    <View style={styles.container}>
      <View
        ref={svViewRef}
        onLayout={medirSv}
        style={[styles.svArea, styles.semGestoDoNavegador]}
        {...svResponder.panHandlers}
      >
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

      <View
        ref={hueViewRef}
        onLayout={medirHue}
        style={[styles.hueArea, styles.semGestoDoNavegador]}
        {...hueResponder.panHandlers}
      >
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
  // @ts-expect-error touchAction é uma propriedade só do react-native-web,
  // necessária pra impedir o navegador de rolar a tela ao arrastar no seletor.
  semGestoDoNavegador: { touchAction: 'none' },
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
