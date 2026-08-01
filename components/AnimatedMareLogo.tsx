import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { colors } from '../lib/theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);

// Mesma curva, só o ponto de controle sobe e desce — dá o efeito de onda.
const ONDA_BAIXA = 'M14 34 Q22 29, 32 34 T50 34';
const ONDA_ALTA = 'M14 34 Q22 19, 32 34 T50 34';

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
      Animated.sequence([
        Animated.timing(onda, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(onda, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ])
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

  const d = onda.interpolate({ inputRange: [0, 1], outputRange: [ONDA_BAIXA, ONDA_ALTA] });
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
