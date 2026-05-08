import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';

interface Props {
  pah: number;
  sare?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  showLabel?: boolean;
}

const SIZES = {
  sm: { symbol: 13, amount: 16, sub: 11 },
  md: { symbol: 17, amount: 22, sub: 13 },
  lg: { symbol: 22, amount: 32, sub: 16 },
  xl: { symbol: 28, amount: 48, sub: 20 },
};

const formatPAH = (n: number): string =>
  n.toLocaleString('fa-IR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

export const PAHAmount: React.FC<Props> = ({
  pah,
  sare = 0,
  size = 'md',
  color = Colors.gold,
  showLabel = false,
}) => {
  const s = SIZES[size];

  return (
    <View style={styles.container}>
      {showLabel && (
        <Text style={[styles.label, { color: Colors.textSecondary }]}>
          موجودی پهلوی
        </Text>
      )}
      <View style={styles.row}>
        {/* نماد ₱ برای پهلوی */}
        <Text style={[styles.symbol, { fontSize: s.symbol, color }]}>₱</Text>
        <Text style={[styles.amount, { fontSize: s.amount, color }]}>
          {formatPAH(pah)}
        </Text>
        {sare > 0 && (
          <Text style={[styles.sare, { fontSize: s.sub, color: Colors.textSecondary }]}>
            .{String(sare).padStart(2, '۰')} سره
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    marginBottom: 4,
    writingDirection: 'rtl',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  symbol: {
    fontWeight: '700',
    marginBottom: 2,
  },
  amount: {
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  sare: {
    marginBottom: 4,
  },
});
