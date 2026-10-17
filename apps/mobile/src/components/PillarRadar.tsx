import { PILLARS, type PillarPoints } from '@convivio/shared';
import Svg, { Circle, Line, Polygon, Text as SvgText } from 'react-native-svg';
import { colors, fonts, pillarTheme } from '@/theme';

interface Props {
  points: PillarPoints;
  size?: number;
}

/** Gráfico radar dos cinco pilares (perfil): mostra em qual pilar o usuário mais evoluiu. */
export function PillarRadar({ points, size = 280 }: Props) {
  const center = size / 2;
  const radius = size * 0.32;
  const max = Math.max(10, ...Object.values(points));

  const vertex = (i: number, scale: number) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / PILLARS.length;
    return { x: center + radius * scale * Math.cos(angle), y: center + radius * scale * Math.sin(angle) };
  };
  const polygon = (scale: (i: number) => number) =>
    PILLARS.map((_, i) => vertex(i, scale(i)))
      .map((p) => `${p.x},${p.y}`)
      .join(' ');
  const value = (i: number) => Math.max(0.04, points[PILLARS[i]!.id] / max);

  return (
    <Svg width={size} height={size}>
      {[0.25, 0.5, 0.75, 1].map((level) => (
        <Polygon
          key={level}
          points={polygon(() => level)}
          fill={level === 1 ? colors.surfaceAlt : 'none'}
          fillOpacity={0.5}
          stroke={colors.border}
          strokeWidth={1}
        />
      ))}
      {PILLARS.map((pillar, i) => {
        const end = vertex(i, 1);
        return <Line key={pillar.id} x1={center} y1={center} x2={end.x} y2={end.y} stroke={colors.border} />;
      })}
      <Polygon points={polygon(value)} fill={colors.primary} fillOpacity={0.22} stroke={colors.primary} strokeWidth={2.5} />
      {PILLARS.map((pillar, i) => {
        const dot = vertex(i, value(i));
        const label = vertex(i, 1.3);
        return [
          <Circle
            key={`${pillar.id}-dot`}
            cx={dot.x}
            cy={dot.y}
            r={6}
            fill={pillarTheme[pillar.id].color}
            stroke={colors.surface}
            strokeWidth={2}
          />,
          <SvgText
            key={`${pillar.id}-label`}
            x={label.x}
            y={label.y + 4}
            fontSize={11}
            fontFamily={fonts.bold}
            fill={pillarTheme[pillar.id].color}
            textAnchor="middle"
          >
            {pillarTheme[pillar.id].short}
          </SvgText>,
        ];
      })}
    </Svg>
  );
}
