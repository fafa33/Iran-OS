import React from 'react';
import Svg, { Circle, Ellipse, Path, Polygon, Rect, G } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

/**
 * نشان شیر و خورشید — نماد ملی پادشاهی مشروطه سکولار ایران
 * طراحی برداری (SVG) — مناسب برای تمام اندازه‌ها
 */
export const LionSunLogo: React.FC<Props> = ({
  size = 200,
  color = '#C9A84C',
}) => {
  const ratio = 220 / 300;

  return (
    <Svg
      width={size}
      height={size * ratio}
      viewBox="0 0 300 220"
    >
      {/* ═══════════════════════════════════ خورشید */}

      {/* پرتوها — ۱۶ پرتو به صورت مثلث‌های تیز */}
      <Polygon points="210.0,15.0 207.1,62.1 212.9,62.1" fill={color} />
      <Polygon points="232.2,41.4 219.9,63.5 225.2,65.7" fill={color} />
      <Polygon points="266.6,38.4 231.2,69.7 235.3,73.8" fill={color} />
      <Polygon points="263.6,72.8 239.3,79.8 241.5,85.1" fill={color} />
      <Polygon points="290.0,95.0 242.9,92.1 242.9,97.9" fill={color} />
      <Polygon points="263.6,117.2 241.5,104.9 239.3,110.2" fill={color} />
      <Polygon points="266.6,151.6 235.3,116.2 231.2,120.3" fill={color} />
      <Polygon points="232.2,148.6 225.2,124.3 219.9,126.5" fill={color} />
      <Polygon points="210.0,175.0 212.9,127.9 207.1,127.9" fill={color} />
      <Polygon points="187.8,148.6 200.1,126.5 194.8,124.3" fill={color} />
      <Polygon points="153.4,151.6 188.8,120.3 184.7,116.2" fill={color} />
      <Polygon points="156.4,117.2 180.7,110.2 178.5,104.9" fill={color} />
      <Polygon points="130.0,95.0 177.1,97.9 177.1,92.1" fill={color} />
      <Polygon points="156.4,72.8 178.5,85.1 180.7,79.8" fill={color} />
      <Polygon points="153.4,38.4 184.7,73.8 188.8,69.7" fill={color} />
      <Polygon points="187.8,41.4 194.8,65.7 200.1,63.5" fill={color} />

      {/* قرص خورشید */}
      <Circle cx={210} cy={95} r={33} fill={color} />

      {/* ═══════════════════════════════════ شیر */}

      {/* دُم — منحنی به بالا و جلو */}
      <Path
        d="M 228 148 Q 262 100 248 62 Q 242 50 232 56"
        stroke={color}
        strokeWidth={8}
        fill="none"
        strokeLinecap="round"
      />
      {/* تاج دُم */}
      <Ellipse cx={230} cy={54} rx={11} ry={16}
        transform="rotate(-25 230 54)" fill={color} />

      {/* بدن */}
      <Ellipse cx={155} cy={158} rx={84} ry={30} fill={color} />

      {/* کفل — ربع عقبی */}
      <Ellipse cx={218} cy={147} rx={24} ry={20} fill={color} />

      {/* یال — ستاره ۱۲ پر (حلقه پرپشت دور سر) */}
      <Polygon
        points="72.0,68.0 79.8,91.0 98.0,75.0 93.2,98.8 117.0,94.0 101.0,112.2 124.0,120.0 101.0,127.8 117.0,146.0 93.2,141.2 98.0,165.0 79.8,149.0 72.0,172.0 64.2,149.0 46.0,165.0 50.8,141.2 27.0,146.0 43.0,127.8 20.0,120.0 43.0,112.2 27.0,94.0 50.8,98.8 46.0,75.0 64.2,91.0"
        fill={color}
        opacity={0.75}
      />

      {/* سر */}
      <Circle cx={72} cy={120} r={30} fill={color} />

      {/* گردن — اتصال سر به بدن */}
      <Ellipse cx={112} cy={143} rx={26} ry={22} fill={color} />

      {/* پاهای عقب */}
      <Rect x={195} y={182} width={19} height={34} rx={9} fill={color} />
      <Rect x={218} y={180} width={19} height={36} rx={9} fill={color} />

      {/* پاهای جلو */}
      <Rect x={93} y={184} width={18} height={32} rx={9} fill={color} />
      <Rect x={115} y={184} width={18} height={34} rx={9} fill={color} />

      {/* پنجه جلو — بالا برده شده (نگه‌دارنده شمشیر) */}
      <Ellipse cx={40} cy={154} rx={19} ry={12}
        transform="rotate(-20 40 154)" fill={color} />

      {/* ═══════════════════════════════════ شمشیر (شمشیر) */}

      {/* تیغه */}
      <Path
        d="M 18 195 L 46 112"
        stroke={color}
        strokeWidth={5}
        strokeLinecap="round"
      />
      {/* نوک تیز */}
      <Polygon points="46,112 40,121 52,121" fill={color} />

      {/* قبضه/دسته */}
      <Rect x={10} y={182} width={12} height={20} rx={6}
        transform="rotate(-62 16 192)" fill={color} />

      {/* حمایل (crossguard) */}
      <Rect x={18} y={162} width={30} height={6} rx={3}
        transform="rotate(-62 33 165)" fill={color} />

      {/* ═══════════════════════════════════ جزئیات چهره */}

      {/* چشم */}
      <Circle cx={57} cy={115} r={4.5} fill="#0D1117" />
      <Circle cx={58} cy={114} r={1.8} fill={color} />

      {/* بینی */}
      <Ellipse cx={67} cy={124} rx={5} ry={3.5} fill="#0D1117" />

      {/* دهان */}
      <Path
        d="M 62 128 Q 67 133 72 128"
        stroke="#0D1117"
        strokeWidth={1.8}
        fill="none"
        strokeLinecap="round"
      />

      {/* سبیل — خطوط کوتاه */}
      <Path d="M 57 126 L 40 122" stroke="#0D1117" strokeWidth={1.2} strokeLinecap="round" />
      <Path d="M 57 129 L 40 130" stroke="#0D1117" strokeWidth={1.2} strokeLinecap="round" />
    </Svg>
  );
};
