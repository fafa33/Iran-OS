import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { LionSunLogo } from '../components/LionSunLogo';
import { kernelStatus } from '../mock/citizen';

const formatNumber = (n: number): string =>
  n.toLocaleString('fa-IR');

export const KernelStatusScreen: React.FC = () => {
  const k = kernelStatus;
  const mintedPct = ((k.totalPAHMinted / k.liquidityCap) * 100).toFixed(2);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* وضعیت کلی */}
      <View style={[
        styles.statusHeader,
        { borderColor: k.systemLocked ? Colors.statusAlert : Colors.statusOk }
      ]}>
        <LionSunLogo size={80} color={k.systemLocked ? Colors.red : Colors.gold} />
        <Text style={[
          styles.statusTitle,
          { color: k.systemLocked ? Colors.statusAlert : Colors.statusOk }
        ]}>
          {k.systemLocked ? 'سیستم قفل است' : 'سیستم ایران‌اواس فعال'}
        </Text>
        <Text style={styles.statusBlock}>
          بلاک شماره: {formatNumber(k.lastBlock)}
        </Text>
        <Text style={styles.statusSig}>
          امضاهای تحریم: {k.signaturesCollected} از {k.signaturesRequired}
        </Text>
      </View>

      {/* خطوط قرمز */}
      <Text style={styles.sectionTitle}>خطوط قرمز (TR-01 تا TR-06)</Text>
      {k.redLines.map(rl => (
        <View key={rl.code} style={styles.redLineRow}>
          <View style={[
            styles.codeChip,
            { backgroundColor: rl.status === 'ok' ? Colors.statusOk + '22' : Colors.statusAlert + '22' }
          ]}>
            <Text style={[
              styles.codeText,
              { color: rl.status === 'ok' ? Colors.statusOk : Colors.statusAlert }
            ]}>
              {rl.code}
            </Text>
          </View>
          <Text style={styles.redLineLabel}>{rl.label}</Text>
          <Ionicons
            name={rl.status === 'ok' ? 'shield-checkmark' : 'alert-circle'}
            size={20}
            color={rl.status === 'ok' ? Colors.statusOk : Colors.statusAlert}
          />
        </View>
      ))}

      {/* نقدینگی */}
      <Text style={styles.sectionTitle}>زیرساخت پولی</Text>
      <View style={styles.monetaryCard}>
        <MonRow label="سقف نقدینگی" value="₱ ۹۰۰٬۰۰۰٬۰۰۰٬۰۰۰" color={Colors.textPrimary} />
        <MonRow
          label="ضرب‌شده تاکنون"
          value={`₱ ${formatNumber(k.totalPAHMinted)}`}
          color={Colors.gold}
        />
        <MonRow
          label="درصد استفاده"
          value={`${mintedPct}٪`}
          color={parseFloat(mintedPct) > 80 ? Colors.statusAlert : Colors.statusOk}
        />
        <MonRow label="پروتکل لایه ۲" value="ZK-Rollups" color={Colors.textSecondary} />
        <MonRow label="حداقل پشتوانه" value="۳۳.۳٪ دارایی ملی" color={Colors.textSecondary} />
      </View>

      {/* مالتی‌سیگ */}
      <Text style={styles.sectionTitle}>ماشه (Trigger Protocol)</Text>
      <View style={styles.triggerCard}>
        <View style={styles.sigBar}>
          {Array.from({ length: 9 }, (_, i) => (
            <View
              key={i}
              style={[
                styles.sigDot,
                { backgroundColor: i < k.signaturesCollected
                    ? Colors.statusAlert : Colors.border }
              ]}
            />
          ))}
        </View>
        <Text style={styles.sigInfo}>
          {k.signaturesCollected}/{k.signaturesRequired} امضا برای فعال‌سازی ماشه
        </Text>
        <Text style={styles.triggerNote}>
          پس از ۷ امضای دادگاه عالی، ماشه به‌طور خودکار فعال می‌شود.
          مهلت: ۷۲ ساعت پس از ثبت تخلف.
        </Text>
      </View>

    </ScrollView>
  );
};

const MonRow: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
  <View style={styles.monRow}>
    <Text style={styles.monLabel}>{label}</Text>
    <Text style={[styles.monValue, { color }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content:   { padding: 16, paddingBottom: 40 },

  statusHeader: {
    alignItems: 'center', padding: 28,
    backgroundColor: Colors.surface,
    borderRadius: 20, marginBottom: 24,
    borderWidth: 2, gap: 10,
  },
  statusTitle: { fontSize: 20, fontWeight: '700', writingDirection: 'rtl' },
  statusBlock: { fontSize: 12, color: Colors.textMuted, fontFamily: 'monospace' },
  statusSig:   { fontSize: 13, color: Colors.textSecondary, writingDirection: 'rtl' },

  sectionTitle: {
    fontSize: 14, fontWeight: '600', color: Colors.textSecondary,
    marginBottom: 10, writingDirection: 'rtl', textAlign: 'right',
  },

  redLineRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  codeChip: {
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 6, minWidth: 52, alignItems: 'center',
  },
  codeText:     { fontSize: 11, fontWeight: '700', fontFamily: 'monospace' },
  redLineLabel: { flex: 1, fontSize: 14, color: Colors.textPrimary, writingDirection: 'rtl', textAlign: 'right' },

  monetaryCard: {
    backgroundColor: Colors.surface, borderRadius: 14, padding: 16,
    marginBottom: 20, borderWidth: 1, borderColor: Colors.border,
  },
  monRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  monLabel: { fontSize: 13, color: Colors.textSecondary, writingDirection: 'rtl' },
  monValue: { fontSize: 13, fontWeight: '600' },

  triggerCard: {
    backgroundColor: Colors.surface, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: Colors.border,
  },
  sigBar: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: 12 },
  sigDot: { width: 26, height: 26, borderRadius: 13 },
  sigInfo: {
    fontSize: 13, color: Colors.textSecondary,
    textAlign: 'center', writingDirection: 'rtl', marginBottom: 10,
  },
  triggerNote: {
    fontSize: 12, color: Colors.textMuted,
    textAlign: 'center', writingDirection: 'rtl', lineHeight: 20,
  },
});
