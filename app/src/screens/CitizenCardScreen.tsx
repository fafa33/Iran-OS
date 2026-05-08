import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { LionSunLogo } from '../components/LionSunLogo';
import { mockCitizen } from '../mock/citizen';

const STATUS_LABELS: Record<string, string> = {
  employed:   'شاغل',
  unemployed: 'بیکار',
  retired:    'بازنشسته',
  disabled:   'ازکارافتاده',
};

const STATUS_COLORS: Record<string, string> = {
  employed:   Colors.statusOk,
  unemployed: Colors.statusWarn,
  retired:    Colors.gold,
  disabled:   Colors.textSecondary,
};

export const CitizenCardScreen: React.FC = () => {
  const c = mockCitizen;
  const maskedId = `****${c.nationalId.slice(-4)}`;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* کارت شهروندی دیجیتال */}
      <LinearGradient
        colors={['#1C2A1C', '#0D1117', '#2A1C0D']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* نوار پرچم */}
        <View style={styles.flagBar}>
          <View style={[styles.flagStripe, { backgroundColor: Colors.green }]} />
          <View style={[styles.flagStripe, { backgroundColor: Colors.white }]} />
          <View style={[styles.flagStripe, { backgroundColor: Colors.red }]} />
        </View>

        {/* هدر کارت */}
        <View style={styles.cardHeader}>
          <LionSunLogo size={52} color={Colors.gold} />
          <View style={styles.cardTitleBlock}>
            <Text style={styles.cardTitle}>جمهوری — پادشاهی مشروطه ایران</Text>
            <Text style={styles.cardSubtitle}>کارت شهروندی دیجیتال</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* اطلاعات شهروند */}
        <Text style={styles.fullName}>{c.fullName}</Text>
        <Text style={styles.nationalId}>کد ملی: {maskedId}</Text>
        <Text style={styles.province}>{c.province}</Text>

        {/* وضعیت */}
        <View style={styles.statusRow}>
          <View style={[
            styles.statusChip,
            { borderColor: STATUS_COLORS[c.employmentStatus] }
          ]}>
            <View style={[
              styles.statusDot,
              { backgroundColor: STATUS_COLORS[c.employmentStatus] }
            ]} />
            <Text style={[
              styles.statusText,
              { color: STATUS_COLORS[c.employmentStatus] }
            ]}>
              {STATUS_LABELS[c.employmentStatus]}
            </Text>
          </View>

          {c.biometricVerified && (
            <View style={styles.verifiedChip}>
              <Ionicons name="finger-print" size={14} color={Colors.gold} />
              <Text style={styles.verifiedText}>تایید بیومتریک</Text>
            </View>
          )}
        </View>

        {/* آدرس کیف‌پول */}
        <View style={styles.walletRow}>
          <Ionicons name="wallet-outline" size={14} color={Colors.textMuted} />
          <Text style={styles.walletAddress}>{c.walletAddress}</Text>
        </View>

        {/* زیرنویس */}
        <Text style={styles.cardFooter}>IranOS · Kernel v1.0 · ZKP Verified</Text>
      </LinearGradient>

      {/* مزایا */}
      <Text style={styles.sectionTitle}>مزایای فعال</Text>

      <BenefitRow
        icon="heart" label="اعتبار سلامت سالانه"
        value={`₱ ${c.healthCredit}`} color={Colors.greenLight} />
      <BenefitRow
        icon="medkit" label="سهمیه ماهانه دارو"
        value={`سره ${c.drugQuota}`} color={Colors.gold} />
      <BenefitRow
        icon="cash" label="حداقل حقوق (اجباری کارفرما)"
        value="₱ ۱٬۰۰۰/ماه" color={Colors.statusWarn} />
      <BenefitRow
        icon="shield-checkmark" label="بیمه بیکاری (در صورت نیاز)"
        value="۷۰٪ · حداکثر ۱۸ ماه" color={Colors.textSecondary} />
      <BenefitRow
        icon="time" label="سن بازنشستگی"
        value="۶۵ سال" color={Colors.textSecondary} />
    </ScrollView>
  );
};

const BenefitRow: React.FC<{
  icon: string; label: string; value: string; color: string
}> = ({ icon, label, value, color }) => (
  <View style={styles.benefitRow}>
    <Ionicons name={icon as any} size={20} color={color} />
    <Text style={styles.benefitLabel}>{label}</Text>
    <Text style={[styles.benefitValue, { color }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content:   { padding: 16, paddingBottom: 32 },

  card: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.goldDim,
    overflow: 'hidden',
  },
  flagBar: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 5,
    flexDirection: 'row',
  },
  flagStripe: { flex: 1 },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  cardTitleBlock: { flex: 1 },
  cardTitle: {
    fontSize: 11, color: Colors.textSecondary,
    writingDirection: 'rtl', textAlign: 'right',
  },
  cardSubtitle: {
    fontSize: 14, fontWeight: '700',
    color: Colors.gold, writingDirection: 'rtl', textAlign: 'right',
  },

  divider: { height: 1, backgroundColor: Colors.border, marginBottom: 16 },

  fullName: {
    fontSize: 24, fontWeight: '700',
    color: Colors.textPrimary, writingDirection: 'rtl', textAlign: 'right',
  },
  nationalId: {
    fontSize: 13, color: Colors.textSecondary,
    marginTop: 4, writingDirection: 'rtl', textAlign: 'right',
  },
  province: {
    fontSize: 12, color: Colors.textMuted,
    marginTop: 2, writingDirection: 'rtl', textAlign: 'right',
  },

  statusRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
    justifyContent: 'flex-end',
  },
  statusChip: {
    flexDirection: 'row', alignItems: 'center',
    gap: 6, paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 12, borderWidth: 1,
  },
  statusDot:  { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 12, fontWeight: '500', writingDirection: 'rtl' },

  verifiedChip: {
    flexDirection: 'row', alignItems: 'center',
    gap: 4, paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 12, borderWidth: 1, borderColor: Colors.goldDim,
  },
  verifiedText: { fontSize: 12, color: Colors.gold, writingDirection: 'rtl' },

  walletRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 6, marginTop: 14,
    justifyContent: 'flex-end',
  },
  walletAddress: { fontSize: 11, color: Colors.textMuted, fontFamily: 'monospace' },

  cardFooter: {
    fontSize: 9, color: Colors.textMuted,
    textAlign: 'center', marginTop: 14, letterSpacing: 0.5,
  },

  sectionTitle: {
    fontSize: 15, fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
    writingDirection: 'rtl', textAlign: 'right',
  },
  benefitRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 12, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  benefitLabel: {
    flex: 1, fontSize: 14, color: Colors.textPrimary,
    writingDirection: 'rtl', textAlign: 'right',
  },
  benefitValue: { fontSize: 13, fontWeight: '600' },
});
