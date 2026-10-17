import { PILLARS, type PillarId } from '@convivio/shared';
import Svg, { Circle, G } from 'react-native-svg';
import { pillarColors } from '@/theme';

interface Props {
  size?: number;
  onPressPillar?: (id: PillarId) => void;
}

/** O logo do app: cinco círculos sobrepostos, um por pilar. Cada pétala pode ser tocável. */
export function PillarFlower({ size = 160, onPressPillar }: Props) {
  const center = size / 2;
  const petal = size * 0.24; // raio de cada círculo
  const distance = size * 0.2; // distância do centro
  return (
    <Svg width={size} height={size}>
      <G>
        {PILLARS.map((pillar, i) => {
          const angle = -Math.PI / 2 + (i * 2 * Math.PI) / PILLARS.length;
          return (
            <Circle
              key={pillar.id}
              cx={center + distance * Math.cos(angle)}
              cy={center + distance * Math.sin(angle)}
              r={petal}
              fill={pillarColors[pillar.id]}
              fillOpacity={0.75}
              onPress={onPressPillar ? () => onPressPillar(pillar.id) : undefined}
            />
          );
        })}
      </G>
    </Svg>
  );
}
