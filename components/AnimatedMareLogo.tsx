import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { colors } from '../lib/theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const BASELINE = 34;
const AMPLITUDE = 9;
// Cada ponto de controle oscila com uma fase diferente — é isso que faz
// a onda parecer que está viajando/se movendo, em vez de só "respirar" no lugar.
const FASE_C1 = 0;
const FASE_C2 = (Math.PI * 2) / 3;

const QUADROS = 24;

function gerarQuadro(t: number) {
  const cy1 = BASELINE - AMPLITUDE * Math.sin(t + FASE_C1);
  const cy2 = BASELINE - AMPLITUDE * Math.sin(t + FASE_C2);
  return `M14 34 Q22 ${cy1.toFixed(1)}, 32 34 Q42 ${cy2.toFixed(1)}, 50 34`;
}

const QUADROS_ONDA = Array.from({ length: QUADROS + 1 }, (_, i) => gerarQuadro((i / QUADROS) * Math.PI * 2));
const INPUT_RANGE_ONDA = QUADROS_ONDA.map((_, i) => i / QUADROS);

type Props = {
  size?: number;
  /** Muda esse valor (ex: nome da rota) pra disparar a animação de entrada. */
  gatilho?: unknown;
};

export function AnimatedMareLogo({ size = 28, gatilho }: Props) {
  const onda = useRef(new Animated.Value(0)).current;
  const entrada = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(onda, {
        toValue: 1,
        duration: 2600,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [onda]);

  useEffect(() => {
    entrada.setValue(0);
    Animated.spring(entrada, {
      toValue: 1,
      useNativeDriver: true,
      friction: 5,
      tension: 55,
    }).start();
  }, [gatilho, entrada]);

  const d = useMemo(
    () => onda.interpolate({ inputRange: INPUT_RANGE_ONDA, outputRange: QUADROS_ONDA }),
    [onda]
  );
  const translateY = entrada.interpolate({ inputRange: [0, 0.6, 1], outputRange: [-14, 4, 0] });
  const scale = entrada.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0.6, 1.1, 1] });
  const opacity = entrada.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 1, 1] });

  return (
    <Animated.View style={{ transform: [{ translateY }, { scale }], opacity }}>
      <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <Rect width={64} height={64} rx={15} fill={colors.accent} />
        <AnimatedPath d={d} stroke="#0A0B0F" strokeWidth={5} strokeLinecap="round" fill="none" />
      </Svg>
    </Animated.View>
  );
}
