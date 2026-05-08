import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { mockCitizen, Bill } from '../mock/citizen';

const BILL_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  electricity: 'flash',
  water:       'water',
  gas:         'flame',
  internet:    'wifi',
};

const BILL_COLORS: Record<string, string> = {
  electricity: '#F0C040',
  water:       '#4FC3F7',
  gas:         '#FF8A65',
  internet:    '#81C784',
};

export const BillsScreen: React.FC = () => {
  const [bills, setBills] = useState(mockCitizen.bills);
  const unpaid = bills.filter(b => !b.paid);
  const paid   = bills.filter(b => b.paid);
  const totalDue = unpaid.reduce((s, b) => s + b.amount, 0);

  const payBill = (bill: Bill) => {
    Alert.alert(
      'پرداخت قبض',
      `پرداخت ₱${bill.amount} — ${bill.label}\nاز کیف‌پول پهلوی`,
      [
        { text: 'انصراف', style: 'cancel' },
        {
          text: 'پرداخت',
          onPress: () => {
            setBills(prev =>
              prev.map(b => b.id === bill.id ? { ...b, paid: true } : b)
            );
            Alert.alert('✓', `قبض ${bill.label} پرداخت شد\nتراکنش در بلاک‌چین ثبت شد`);
          },
        },
      ],
    );
  };

  const payAll = () => {
    Alert.alert(
      'پرداخت همه قبوض',
      `پرداخت ₱${totalDue} به صورت یکجا`,
      [
        { text: 'انصراف', style: 'cancel' },
        {
          text: 'پرداخت همه',
          onPress: () => {
            setBills(prev => prev.map(b => ({ ...b, paid: true })));
            Alert.alert('✓', 'همه قبوض پرداخت شدند');
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>

      {/* خلاصه */}
      <View style={styles.summary}>
        <View>
          <Text style={styles.dueLabel}>مجموع پرداختنی</Text>
          <Text style={styles.dueAmount}>₱ {totalDue}</Text>
        </View>
        {unpaid.length > 0 && (
          <TouchableOpacity style={styles.payAllBtn} onPress={payAll}>
            <Text style={styles.payAllText}>پرداخت همه</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* قبوض پرداخت‌نشده */}
      {unpaid.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>پرداخت‌نشده</Text>
          {unpaid.map(bill => (
            <BillCard key={bill.id} bill={bill} onPay={payBill} />
          ))}
        </>
      )}

      {/* قبوض پرداخت‌شده */}
      {paid.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>پرداخت‌شده</Text>
          {paid.map(bill => (
            <BillCard key={bill.id} bill={bill} onPay={payBill} />
          ))}
        </>
      )}

      <Text style={styles.note}>
        پرداخت مستقیم از کیف‌پول پهلوی — بدون درگاه بانکی
      </Text>
    </View>
  );
};

const BillCard: React.FC<{ bill: Bill; onPay: (b: Bill) => void }> = ({ bill, onPay }) => {
  const color = BILL_COLORS[bill.type];

  return (
    <View style={[styles.card, bill.paid && styles.cardPaid]}>
      <View style={[styles.iconBox, { backgroundColor: color + '22' }]}>
        <Ionicons name={BILL_ICONS[bill.type]} size={24} color={color} />
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.billLabel}>{bill.label}</Text>
        <Text style={styles.dueDate}>سررسید: {bill.dueDate}</Text>
      </View>
      <View style={styles.cardRight}>
        <Text style={[styles.billAmount, { color }]}>₱ {bill.amount}</Text>
        {bill.paid ? (
          <View style={styles.paidBadge}>
            <Ionicons name="checkmark-circle" size={14} color={Colors.statusOk} />
            <Text style={styles.paidText}>پرداخت‌شد</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.payBtn} onPress={() => onPay(bill)}>
            <Text style={styles.payBtnText}>پرداخت</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 16 },

  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dueLabel:  { fontSize: 12, color: Colors.textSecondary, writingDirection: 'rtl', textAlign: 'right' },
  dueAmount: { fontSize: 28, fontWeight: '700', color: Colors.gold, marginTop: 4 },

  payAllBtn: {
    backgroundColor: Colors.gold, borderRadius: 12,
    paddingHorizontal: 18, paddingVertical: 10,
  },
  payAllText: { fontSize: 14, fontWeight: '700', color: Colors.background, writingDirection: 'rtl' },

  sectionTitle: {
    fontSize: 14, fontWeight: '600', color: Colors.textSecondary,
    marginBottom: 10, writingDirection: 'rtl', textAlign: 'right',
  },

  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: 14,
    padding: 16, marginBottom: 10, gap: 12,
    borderWidth: 1, borderColor: Colors.border,
  },
  cardPaid: { opacity: 0.6 },
  iconBox:  { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cardBody: { flex: 1 },
  billLabel: { fontSize: 15, color: Colors.textPrimary, writingDirection: 'rtl', textAlign: 'right' },
  dueDate:   { fontSize: 11, color: Colors.textSecondary, writingDirection: 'rtl', textAlign: 'right', marginTop: 3 },

  cardRight: { alignItems: 'flex-end', gap: 8 },
  billAmount: { fontSize: 17, fontWeight: '700' },

  payBtn: {
    backgroundColor: Colors.gold, borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 6,
  },
  payBtnText: { fontSize: 13, fontWeight: '700', color: Colors.background, writingDirection: 'rtl' },

  paidBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  paidText:  { fontSize: 12, color: Colors.statusOk, writingDirection: 'rtl' },

  note: {
    fontSize: 12, color: Colors.textMuted,
    textAlign: 'center', writingDirection: 'rtl',
    marginTop: 20, lineHeight: 20,
  },
});
