import React from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, I18nManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { PAHAmount } from '../components/PAHAmount';
import { KernelStatusBadge } from '../components/KernelStatusBadge';
import { LionSunLogo } from '../components/LionSunLogo';
import { mockCitizen, kernelStatus } from '../mock/citizen';

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

const TX_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  send:    'arrow-up-circle-outline',
  receive: 'arrow-down-circle-outline',
  bill:    'receipt-outline',
  stake:   'lock-closed-outline',
  welfare: 'heart-outline',
};

const TX_COLORS: Record<string, string> = {
  send:    Colors.red,
  receive: Colors.green,
  bill:    Colors.statusWarn,
  stake:   Colors.gold,
  welfare: Colors.greenLight,
};

export const DashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const c = mockCitizen;
  const k = kernelStatus;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* هدر */}
      <View style={styles.header}>
        <LionSunLogo size={44} color={Colors.gold} />
        <View style={styles.headerText}>
          <Text style={styles.greeting}>سلام، {c.fullName.split(' ')[0]}</Text>
          <Text style={styles.province}>{c.province} — ایران</Text>
        </View>
        <KernelStatusBadge
          locked={k.systemLocked}
          onPress={() => navigation.navigate('KernelStatus')}
        />
      </View>

      {/* کارت موجودی */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>موجودی کیف‌پول</Text>
        <PAHAmount pah={c.balancePAH} sare={c.balanceSare} size="xl" />
        <View style={styles.actionRow}>
          <ActionBtn icon="arrow-up" label="ارسال"
            onPress={() => navigation.navigate('Wallet')} />
          <ActionBtn icon="arrow-down" label="دریافت"
            onPress={() => navigation.navigate('Wallet')} />
          <ActionBtn icon="receipt" label="قبوض"
            onPress={() => navigation.navigate('Bills')} />
          <ActionBtn icon="lock-closed" label="استیک"
            onPress={() => navigation.navigate('Staking')} />
        </View>
      </View>

      {/* خلاصه رفاه */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>مزایای رفاهی</Text>
        <View style={styles.welfareRow}>
          <WelfareTile
            icon="heart-outline" label="اعتبار سلامت"
            value={`₱ ${c.healthCredit}`} color={Colors.greenLight} />
          <WelfareTile
            icon="medkit-outline" label="سهمیه دارو"
            value={`سره ${c.drugQuota}`} color={Colors.gold} />
          <WelfareTile
            icon="lock-closed-outline" label="استیک فعال"
            value={`₱ ${c.stake.locked}`} color={Colors.statusWarn} />
        </View>
      </View>

      {/* تراکنش‌های اخیر */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>تراکنش‌های اخیر</Text>
        {c.transactions.slice(0, 4).map(tx => (
          <View key={tx.id} style={styles.txRow}>
            <Ionicons
              name={TX_ICONS[tx.type] ?? 'ellipse-outline'}
              size={24}
              color={TX_COLORS[tx.type] ?? Colors.textMuted}
            />
            <View style={styles.txInfo}>
              <Text style={styles.txLabel}>{tx.label}</Text>
              <Text style={styles.txDate}>{tx.date}</Text>
            </View>
            <Text style={[
              styles.txAmount,
              { color: tx.type === 'receive' || tx.type === 'welfare'
                  ? Colors.greenLight : Colors.textPrimary }
            ]}>
              {tx.type === 'receive' || tx.type === 'welfare' ? '+' : '−'}₱{tx.amount}
            </Text>
          </View>
        ))}
      </View>

    </ScrollView>
  );
};

const ActionBtn: React.FC<{
  icon: string; label: string; onPress: () => void
}> = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.actionBtn} onPress={onPress} activeOpacity={0.7}>
    <Ionicons name={icon as any} size={22} color={Colors.gold} />
    <Text style={styles.actionLabel}>{label}</Text>
  </TouchableOpacity>
);

const WelfareTile: React.FC<{
  icon: string; label: string; value: string; color: string
}> = ({ icon, label, value, color }) => (
  <View style={styles.welfareTile}>
    <Ionicons name={icon as any} size={20} color={color} />
    <Text style={[styles.welfareValue, { color }]}>{value}</Text>
    <Text style={styles.welfareLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: Colors.background },
  content:     { padding: 16, paddingBottom: 32 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    writingDirection: 'rtl',
  },
  headerText:  { flex: 1 },
  greeting:    { fontSize: 17, fontWeight: '600', color: Colors.textPrimary, writingDirection: 'rtl' },
  province:    { fontSize: 12, color: Colors.textSecondary, writingDirection: 'rtl' },

  balanceCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 12,
    writingDirection: 'rtl',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 24,
    writingDirection: 'rtl',
  },
  actionBtn: {
    flex: 1,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 6,
  },
  actionLabel: { fontSize: 11, color: Colors.textSecondary, writingDirection: 'rtl' },

  section:       { marginBottom: 20 },
  sectionTitle:  {
    fontSize: 15, fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
    writingDirection: 'rtl',
    textAlign: 'right',
  },

  welfareRow:  { flexDirection: 'row', gap: 10 },
  welfareTile: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  welfareValue: { fontSize: 15, fontWeight: '700' },
  welfareLabel: { fontSize: 10, color: Colors.textSecondary, textAlign: 'center', writingDirection: 'rtl' },

  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  txInfo:   { flex: 1 },
  txLabel:  { fontSize: 14, color: Colors.textPrimary, writingDirection: 'rtl', textAlign: 'right' },
  txDate:   { fontSize: 11, color: Colors.textSecondary, writingDirection: 'rtl', textAlign: 'right' },
  txAmount: { fontSize: 15, fontWeight: '600' },
});
