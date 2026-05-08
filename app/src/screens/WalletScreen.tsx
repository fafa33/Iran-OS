import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TextInput, TouchableOpacity, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { PAHAmount } from '../components/PAHAmount';
import { mockCitizen } from '../mock/citizen';

const TX_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  send:    'arrow-up-circle',
  receive: 'arrow-down-circle',
  bill:    'receipt',
  stake:   'lock-closed',
  welfare: 'heart',
};

const TX_COLORS: Record<string, string> = {
  send:    Colors.red,
  receive: Colors.greenLight,
  bill:    Colors.statusWarn,
  stake:   Colors.gold,
  welfare: Colors.greenLight,
};

export const WalletScreen: React.FC = () => {
  const c = mockCitizen;
  const [tab, setTab] = useState<'send' | 'history'>('history');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount]     = useState('');

  const handleSend = () => {
    if (!recipient || !amount) {
      Alert.alert('خطا', 'آدرس گیرنده و مبلغ را وارد کنید');
      return;
    }
    Alert.alert(
      'تایید تراکنش',
      `ارسال ₱${amount} به\n${recipient}`,
      [
        { text: 'انصراف', style: 'cancel' },
        {
          text: 'تایید و امضا',
          onPress: () => Alert.alert('✓', 'تراکنش در شبکه ثبت شد'),
        },
      ],
    );
  };

  return (
    <View style={styles.container}>

      {/* موجودی */}
      <View style={styles.balanceSection}>
        <PAHAmount pah={c.balancePAH} sare={c.balanceSare} size="xl" showLabel />
        <Text style={styles.walletAddr}>{c.walletAddress}</Text>
      </View>

      {/* تب */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === 'history' && styles.tabActive]}
          onPress={() => setTab('history')}
        >
          <Text style={[styles.tabText, tab === 'history' && styles.tabTextActive]}>
            تاریخچه
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'send' && styles.tabActive]}
          onPress={() => setTab('send')}
        >
          <Text style={[styles.tabText, tab === 'send' && styles.tabTextActive]}>
            ارسال
          </Text>
        </TouchableOpacity>
      </View>

      {tab === 'history' ? (
        <ScrollView style={styles.list}>
          {c.transactions.map(tx => (
            <View key={tx.id} style={styles.txRow}>
              <View style={[styles.txIcon, { backgroundColor: TX_COLORS[tx.type] + '22' }]}>
                <Ionicons
                  name={TX_ICONS[tx.type]}
                  size={20}
                  color={TX_COLORS[tx.type]}
                />
              </View>
              <View style={styles.txBody}>
                <Text style={styles.txLabel}>{tx.label}</Text>
                <Text style={styles.txHash}>{tx.txHash}</Text>
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
        </ScrollView>
      ) : (
        <ScrollView style={styles.list} contentContainerStyle={styles.sendForm}>
          <Text style={styles.formLabel}>آدرس گیرنده (0x...)</Text>
          <TextInput
            style={styles.input}
            value={recipient}
            onChangeText={setRecipient}
            placeholder="0x..."
            placeholderTextColor={Colors.textMuted}
            autoCapitalize="none"
            dir="ltr"
          />

          <Text style={styles.formLabel}>مبلغ (PAH)</Text>
          <View style={styles.amountRow}>
            <Text style={styles.currencySymbol}>₱</Text>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={amount}
              onChangeText={setAmount}
              placeholder="۰"
              placeholderTextColor={Colors.textMuted}
              keyboardType="numeric"
            />
          </View>

          <Text style={styles.feeNote}>
            کارمزد شبکه: ۰ PAH (ZK-Rollup)
          </Text>

          <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
            <Ionicons name="arrow-up-circle" size={20} color={Colors.background} />
            <Text style={styles.sendBtnText}>ارسال و امضای دیجیتال</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  balanceSection: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  walletAddr: {
    marginTop: 10, fontSize: 12,
    color: Colors.textMuted, fontFamily: 'monospace',
  },

  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1, paddingVertical: 8, borderRadius: 8,
    alignItems: 'center', backgroundColor: Colors.surface,
  },
  tabActive: { backgroundColor: Colors.gold },
  tabText:   { fontSize: 14, color: Colors.textSecondary, writingDirection: 'rtl' },
  tabTextActive: { color: Colors.background, fontWeight: '700' },

  list: { flex: 1 },

  txRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 12, padding: 16,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  txIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  txBody: { flex: 1 },
  txLabel: { fontSize: 14, color: Colors.textPrimary, writingDirection: 'rtl', textAlign: 'right' },
  txHash:  { fontSize: 10, color: Colors.textMuted, fontFamily: 'monospace', marginTop: 2 },
  txDate:  { fontSize: 11, color: Colors.textSecondary, writingDirection: 'rtl', textAlign: 'right', marginTop: 2 },
  txAmount: { fontSize: 15, fontWeight: '700' },

  sendForm: { padding: 20, gap: 8 },
  formLabel: {
    fontSize: 13, color: Colors.textSecondary,
    writingDirection: 'rtl', textAlign: 'right', marginTop: 12,
  },
  input: {
    backgroundColor: Colors.surface, borderRadius: 12,
    padding: 14, color: Colors.textPrimary, fontSize: 15,
    borderWidth: 1, borderColor: Colors.border,
  },
  amountRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  currencySymbol: { fontSize: 22, color: Colors.gold, fontWeight: '700' },
  feeNote: {
    fontSize: 12, color: Colors.statusOk,
    textAlign: 'right', writingDirection: 'rtl', marginTop: 4,
  },
  sendBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, backgroundColor: Colors.gold,
    borderRadius: 14, padding: 16, marginTop: 24,
  },
  sendBtnText: { fontSize: 16, fontWeight: '700', color: Colors.background, writingDirection: 'rtl' },
});
