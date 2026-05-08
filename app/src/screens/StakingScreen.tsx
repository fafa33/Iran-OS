import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../theme/colors';
import { mockCitizen } from '../mock/citizen';

export const StakingScreen: React.FC = () => {
  const { stake, balancePAH } = mockCitizen;
  const apyEarned = (stake.locked * stake.apy) / 100;

  const handleStake = () =>
    Alert.alert(
      'قفل در صندوق L2',
      'موجودی در لایه مولد صندوق ثروت ملی قفل می‌شود\nو سود ۱۵٪ سالانه دریافت می‌کنید.',
      [
        { text: 'انصراف', style: 'cancel' },
        { text: 'تایید', onPress: () => Alert.alert('✓', 'قرارداد استیک امضا شد') },
      ],
    );

  const handleUnstake = () =>
    Alert.alert(
      'آزادسازی موجودی',
      `در ${stake.unlockDate} موجودی آزاد می‌شود\nسود تجمیع‌شده: ₱ ${stake.earned}`,
      [
        { text: 'انصراف', style: 'cancel' },
        { text: 'آزادسازی', onPress: () => Alert.alert('✓', 'درخواست ثبت شد') },
      ],
    );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* کارت سود */}
      <LinearGradient
        colors={['#1A1500', '#0D1117', '#001A0D']}
        style={styles.apyCard}
      >
        <Text style={styles.apyTitle}>صندوق ثروت ملی — لایه L2</Text>
        <Text style={styles.apyRate}>{stake.apy}٪</Text>
        <Text style={styles.apyLabel}>سود سالانه تضمین‌شده</Text>
        <Text style={styles.apyNote}>سود به صورت خودکار از L2 به L1 منتقل می‌شود</Text>
      </LinearGradient>

      {/* موجودی قفل‌شده */}
      <View style={styles.statsRow}>
        <StatCard
          icon="lock-closed"
          label="قفل‌شده"
          value={`₱ ${stake.locked}`}
          color={Colors.gold}
        />
        <StatCard
          icon="trending-up"
          label="سود تجمیع‌شده"
          value={`₱ ${stake.earned}`}
          color={Colors.greenLight}
        />
        <StatCard
          icon="calendar"
          label="آزادسازی"
          value={stake.unlockDate}
          color={Colors.textSecondary}
          small
        />
      </View>

      {/* پیشرفت سال */}
      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>پیشرفت دوره</Text>
          <Text style={styles.progressPct}>
            {Math.round((stake.earned / apyEarned) * 100)}٪
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[
            styles.progressFill,
            { width: `${Math.round((stake.earned / apyEarned) * 100)}%` as any }
          ]} />
        </View>
        <Text style={styles.progressNote}>
          ₱ {stake.earned} از ₱ {apyEarned} سود سالانه
        </Text>
      </View>

      {/* لایه‌های صندوق */}
      <Text style={styles.sectionTitle}>ساختار صندوق ثروت ملی (SWF)</Text>
      <LayerRow layer="L1" label="نقد" target="۳۰۰B دلار"      color={Colors.greenLight} />
      <LayerRow layer="L2" label="مولد — ۱۵٪ سود" target="۳۰۰B دلار" color={Colors.gold} active />
      <LayerRow layer="L3" label="گرو (استراتژیک)" target="۲ تریلیون دلار" color={Colors.textSecondary} />

      {/* دکمه‌ها */}
      <View style={styles.btnRow}>
        <TouchableOpacity style={styles.stakeBtn} onPress={handleStake}>
          <Ionicons name="add-circle" size={20} color={Colors.background} />
          <Text style={styles.stakeBtnText}>استیک جدید</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.unstakeBtn} onPress={handleUnstake}>
          <Ionicons name="lock-open" size={20} color={Colors.gold} />
          <Text style={styles.unstakeBtnText}>آزادسازی</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
};

const StatCard: React.FC<{
  icon: string; label: string; value: string; color: string; small?: boolean
}> = ({ icon, label, value, color, small }) => (
  <View style={styles.statCard}>
    <Ionicons name={icon as any} size={20} color={color} />
    <Text style={[styles.statValue, { color, fontSize: small ? 12 : 17 }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const LayerRow: React.FC<{
  layer: string; label: string; target: string; color: string; active?: boolean
}> = ({ layer, label, target, color, active }) => (
  <View style={[styles.layerRow, active && styles.layerActive]}>
    <View style={[styles.layerBadge, { backgroundColor: color + '22', borderColor: color }]}>
      <Text style={[styles.layerCode, { color }]}>{layer}</Text>
    </View>
    <View style={styles.layerBody}>
      <Text style={styles.layerLabel}>{label}</Text>
      <Text style={styles.layerTarget}>هدف: {target}</Text>
    </View>
    {active && (
      <Ionicons name="checkmark-circle" size={20} color={Colors.gold} />
    )}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content:   { padding: 16, paddingBottom: 32 },

  apyCard: {
    borderRadius: 20, padding: 28,
    alignItems: 'center', marginBottom: 20,
    borderWidth: 1, borderColor: Colors.goldDim,
  },
  apyTitle: { fontSize: 13, color: Colors.textSecondary, writingDirection: 'rtl' },
  apyRate:  { fontSize: 56, fontWeight: '700', color: Colors.gold, marginVertical: 8 },
  apyLabel: { fontSize: 16, color: Colors.textPrimary, fontWeight: '600', writingDirection: 'rtl' },
  apyNote:  { fontSize: 11, color: Colors.textMuted, marginTop: 8, writingDirection: 'rtl', textAlign: 'center' },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: {
    flex: 1, backgroundColor: Colors.surface,
    borderRadius: 14, padding: 14, alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: Colors.border,
  },
  statValue: { fontWeight: '700', textAlign: 'center' },
  statLabel: { fontSize: 10, color: Colors.textSecondary, writingDirection: 'rtl', textAlign: 'center' },

  progressCard: {
    backgroundColor: Colors.surface, borderRadius: 14, padding: 16,
    marginBottom: 20, borderWidth: 1, borderColor: Colors.border,
  },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  progressLabel:  { fontSize: 13, color: Colors.textSecondary, writingDirection: 'rtl' },
  progressPct:    { fontSize: 13, fontWeight: '700', color: Colors.gold },
  progressBar:    { height: 8, backgroundColor: Colors.border, borderRadius: 4, overflow: 'hidden' },
  progressFill:   { height: '100%', backgroundColor: Colors.gold, borderRadius: 4 },
  progressNote:   { fontSize: 11, color: Colors.textMuted, marginTop: 8, writingDirection: 'rtl', textAlign: 'right' },

  sectionTitle: {
    fontSize: 14, fontWeight: '600', color: Colors.textSecondary,
    marginBottom: 10, writingDirection: 'rtl', textAlign: 'right',
  },
  layerRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.surface, borderRadius: 12, padding: 14,
    marginBottom: 8, borderWidth: 1, borderColor: Colors.border,
  },
  layerActive: { borderColor: Colors.goldDim },
  layerBadge: {
    width: 40, height: 40, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },
  layerCode:   { fontSize: 13, fontWeight: '700' },
  layerBody:   { flex: 1 },
  layerLabel:  { fontSize: 14, color: Colors.textPrimary, writingDirection: 'rtl', textAlign: 'right' },
  layerTarget: { fontSize: 11, color: Colors.textSecondary, writingDirection: 'rtl', textAlign: 'right', marginTop: 2 },

  btnRow: { flexDirection: 'row', gap: 12, marginTop: 24 },
  stakeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: Colors.gold, borderRadius: 14, padding: 16,
  },
  stakeBtnText: { fontSize: 15, fontWeight: '700', color: Colors.background, writingDirection: 'rtl' },
  unstakeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: Colors.surface,
    borderRadius: 14, padding: 16, borderWidth: 1, borderColor: Colors.goldDim,
  },
  unstakeBtnText: { fontSize: 15, fontWeight: '600', color: Colors.gold, writingDirection: 'rtl' },
});
