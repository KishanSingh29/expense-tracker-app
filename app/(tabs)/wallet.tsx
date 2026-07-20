import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import * as Icon from "phosphor-react-native";
import Header from "@/components/Header";
import { PURPLE, SOLID, CATEGORY_COLORS } from "@/constants/colors";
import { getSummaryApi } from "@/services/api";
import { ExpenseSummary } from "@/types";
import { formatCurrency, formatTxnMeta } from "@/utils/format";

const CARDS = [
  {
    name: "Zylor Black",
    balance: 8420.5,
    last4: "4821",
    color: SOLID.purpleCard,
  },
  {
    name: "Travel Card",
    balance: 2140.75,
    last4: "1093",
    color: SOLID.tealCard,
  },
];

const EMPTY_SUMMARY: ExpenseSummary = {
  total_income: 0,
  total_expense: 0,
  savings: 0,
  recent_transactions: [],
  category_breakdown: [],
  monthly_data: [],
};

export default function Wallet() {
  const [summary, setSummary] = useState<ExpenseSummary>(EMPTY_SUMMARY);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        try {
          setLoading(true);
          const data = await getSummaryApi();
          if (active) setSummary({ ...EMPTY_SUMMARY, ...data });
        } catch (error) {
          console.log("Failed to load summary:", error);
        } finally {
          if (active) setLoading(false);
        }
      })();
      return () => {
        active = false;
      };
    }, [])
  );

  const totalExpense = Number(summary.total_expense || 0);
  const transactions = summary.recent_transactions || [];
  const categoryBreakdown = summary.category_breakdown || [];
  const maxCategoryAmount = Math.max(1, ...categoryBreakdown.map((c) => Number(c.total_amount)));

  if (loading && summary === EMPTY_SUMMARY) {
    return (
      <View style={styles.wrapper}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PURPLE.primaryLight} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Header title="Wallet" />

        {loading && (
          <View style={styles.inlineLoading}>
            <ActivityIndicator size="small" color={PURPLE.primaryLight} />
          </View>
        )}

        {/* TOTAL WALLET BALANCE */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total wallet balance</Text>
          <Text style={styles.balanceAmount}>{formatCurrency(totalExpense)}</Text>
          <Text style={styles.balanceCaption}>Across {CARDS.length} accounts</Text>
        </View>

        {/* CARDS (static) */}
        <View style={{ gap: 14, marginBottom: 16 }}>
          {CARDS.map((card) => (
            <View key={card.name} style={[styles.cardTile, { backgroundColor: card.color }]}>
              <View style={styles.cardSheen} />
              <View style={styles.cardTopRow}>
                <Text style={styles.cardName}>{card.name}</Text>
                <Icon.WifiHigh size={20} color="#fff" style={{ transform: [{ rotate: "90deg" }] }} />
              </View>
              <Text style={styles.cardBalance}>{formatCurrency(card.balance)}</Text>
              <View style={styles.cardBottomRow}>
                <Text style={styles.cardNumber}>•••• {card.last4}</Text>
                <Icon.CreditCard size={22} color="#fff" />
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.addCardTile}>
            <Icon.Plus size={22} color={PURPLE.muted} />
            <Text style={styles.addCardText}>Add new card</Text>
          </TouchableOpacity>
        </View>

        {/* TRANSACTIONS */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.sectionTitle}>Transactions</Text>
            <TouchableOpacity style={styles.newBtn}>
              <Icon.Plus size={14} color={PURPLE.primaryLight} weight="bold" />
              <Text style={styles.newBtnText}>New</Text>
            </TouchableOpacity>
          </View>

          {transactions.length === 0 ? (
            <Text style={styles.emptyText}>No transactions yet</Text>
          ) : (
            transactions.map((txn, index) => {
              const isCredit = txn.transaction_type === "credit";
              return (
                <View key={index} style={styles.transactionRow}>
                  <View style={[styles.txIcon, { backgroundColor: isCredit ? `${PURPLE.green}22` : `${PURPLE.primary}22` }]}>
                    {isCredit ? (
                      <Icon.ArrowCircleDown size={18} color={PURPLE.green} weight="fill" />
                    ) : (
                      <Icon.ShoppingBag size={18} color={PURPLE.primary} weight="fill" />
                    )}
                  </View>
                  <View style={styles.txDetails}>
                    <Text style={styles.txMerchant}>{txn.merchant}</Text>
                    <Text style={styles.txDate}>{formatTxnMeta(txn.created_at)}</Text>
                  </View>
                  <Text style={[styles.txAmount, { color: isCredit ? PURPLE.green : PURPLE.text }]}>
                    {isCredit ? "+ " : "- "}
                    {formatCurrency(Number(txn.amount))}
                  </Text>
                </View>
              );
            })
          )}
        </View>

        {/* SPENDING BY CATEGORY */}
        <View style={[styles.card, { marginBottom: 140 }]}>
          <Text style={styles.sectionTitle}>Spending by category</Text>
          <View style={{ gap: 16, marginTop: 14 }}>
            {categoryBreakdown.length === 0 ? (
              <Text style={styles.emptyText}>No expenses yet</Text>
            ) : (
              categoryBreakdown.map((c) => {
                const amount = Number(c.total_amount);
                const percent = (amount / maxCategoryAmount) * 100;
                return (
                  <View key={c.category}>
                    <View style={styles.spendRow}>
                      <Text style={styles.spendLabel}>{c.category}</Text>
                      <Text style={styles.spendValue}>{formatCurrency(amount)}</Text>
                    </View>
                    <View style={styles.progressTrack}>
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${percent}%`, backgroundColor: CATEGORY_COLORS[c.category] || PURPLE.primary },
                        ]}
                      />
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: PURPLE.bg },
  container: {
    flex: 1,
    backgroundColor: PURPLE.bg,
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  inlineLoading: { alignItems: "center", marginBottom: 8 },
  balanceCard: {
    backgroundColor: PURPLE.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: PURPLE.cardBorder,
    padding: 22,
    marginBottom: 16,
  },
  balanceLabel: { color: PURPLE.muted, fontSize: 13, marginBottom: 8 },
  balanceAmount: { color: PURPLE.text, fontSize: 34, fontWeight: "800", marginBottom: 6 },
  balanceCaption: { color: PURPLE.muted, fontSize: 12 },
  cardTile: {
    borderRadius: 24,
    padding: 20,
    aspectRatio: 1.6,
    justifyContent: "space-between",
    overflow: "hidden",
  },
  cardSheen: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  cardTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardName: { color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: "600" },
  cardBalance: { color: "#fff", fontSize: 22, fontWeight: "800" },
  cardBottomRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardNumber: { color: "rgba(255,255,255,0.85)", fontSize: 14, letterSpacing: 2 },
  addCardTile: {
    borderRadius: 24,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: PURPLE.cardBorder,
    paddingVertical: 22,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  addCardText: { color: PURPLE.muted, fontSize: 13, fontWeight: "600" },
  card: {
    backgroundColor: PURPLE.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: PURPLE.cardBorder,
    padding: 20,
    marginBottom: 16,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: { color: PURPLE.text, fontSize: 17, fontWeight: "700" },
  newBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(124,58,237,0.15)",
    borderWidth: 1,
    borderColor: "rgba(124,58,237,0.3)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  newBtnText: { color: PURPLE.primaryLight, fontSize: 12, fontWeight: "700" },
  emptyText: { color: PURPLE.muted, fontSize: 13, textAlign: "center", marginTop: 16 },
  transactionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  txIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  txDetails: { flex: 1 },
  txMerchant: { color: PURPLE.text, fontSize: 15, fontWeight: "600" },
  txDate: { color: PURPLE.muted, fontSize: 12, marginTop: 2 },
  txAmount: { fontSize: 15, fontWeight: "700" },
  spendRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  spendLabel: { color: PURPLE.text, fontSize: 13, fontWeight: "600" },
  spendValue: { color: PURPLE.muted, fontSize: 13 },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.06)",
    overflow: "hidden",
  },
  progressFill: { height: 6, borderRadius: 3 },
});
