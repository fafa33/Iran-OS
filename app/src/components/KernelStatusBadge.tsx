import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../theme/colors';

interface Props {
  locked: boolean;
  onPress?: () => void;
}

export const KernelStatusBadge: React.FC<Props> = ({ locked, onPress }) => {
  const bg = locked ? Colors.statusLocked : Colors.surface;
  const dot = locked ? Colors.statusAlert : Colors.statusOk;
  const label = locked ? 'سیستم قفل است' : 'سیستم عادی';

  return (
    <TouchableOpacity
      style={[styles.badge, { backgroundColor: bg, borderColor: dot }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.dot, { backgroundColor: dot }]} />
      <Text style={[styles.label, { color: locked ? Colors.white : Colors.textSecondary }]}>
        {label}
      </Text>
      <Text style={[styles.arrow, { color: Colors.textMuted }]}>›</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    writingDirection: 'rtl',
  },
  arrow: {
    fontSize: 14,
    marginLeft: 2,
  },
});
