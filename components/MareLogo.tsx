import Svg, { Path, Rect } from 'react-native-svg';
import { colors } from '../lib/theme';

export function MareLogo({ size = 28 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Rect width={64} height={64} rx={15} fill={colors.accent} />
      <Path
        d="M14 34 Q22 24, 32 34 T50 34"
        stroke="#0A0B0F"
        strokeWidth={5}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}
