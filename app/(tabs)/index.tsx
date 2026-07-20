import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { LineChart } from "react-native-chart-kit";
import * as Icon from "phosphor-react-native";
import Header from "@/components/Header";
import DonutChart from "@/components/DonutChart";
import { PURPLE, SOLID, CATEGORY_COLORS } from "@/constants/colors";
import { getSummaryApi } from "@/services/api";
import { ExpenseSummary } from "@/types";
import { formatCurrency, formatTxnMeta } from "@/utils/format";

const screenWidth = Dimensions.get("window").width;

const EMPTY_SUMMARY: ExpenseSummary = {
  total_income: 0,
  total_expense: 0,
  savings: 0,
  recent_transactions: [],
  category_breakdown: [],
  monthly_data: [],
};

export default function Home() {
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

  const totalIncome = Number(summary.total_income || 0);
  const totalExpense = Number(summary.total_expense || 0);
  const savings = Number(summary.savings || 0);
  const totalBalance = totalIncome - totalExpense;

  const expensePercent = totalIncome > 0 ? Math.min(100, (totalExpense / totalIncome) * 100) : 0;
  const savingsPercent = totalIncome > 0 ? Math.min(100, Math.max(0, (savings / totalIncome) * 100)) : 0;

  const donutData = (summary.category_breakdown || []).map((c) => ({
    label: c.category,
    value: Number(c.total_amount),
    color: CATEGORY_COLORS[c.category] || CATEGORY_COLORS.Other,
  }));

  const monthlyData = summary.monthly_data || [];
  const cashFlowChartData = {
    labels: monthlyData.map((m) => m.month.split(" ")[0]),
    datasets: [
      {
        data: monthlyData.map((m) => Number(m.income)),
        color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
        strokeWidth: 2,
      },
      {
        data: monthlyData.map((m) => Number(m.expense)),
        color: (opacity = 1) => `rgba(124, 58, 237, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const recentTransactions = summary.recent_transactions || [];

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
        <Header title="Dashboard" />

        {loading && (
          <View style={styles.inlineLoading}>
            <ActivityIndicator size="small" color={PURPLE.primaryLight} />
          </View>
        )}

        {/* TOTAL BALANCE - dark gradient hero */}
        <View style={styles.balanceCard}>
          <View style={[styles.orb, styles.orbA]} />
          <View style={[styles.orb, styles.orbB]} />
          <View style={styles.balanceLabelRow}>
            <Icon.Wallet size={16} color={PURPLE.muted} />
            <Text style={styles.balanceLabel}>Total balance</Text>
          </View>
          <Text style={styles.balanceAmount}>{formatCurrency(totalBalance)}</Text>
        </View>

        {/* INCOME */}
        <View style={styles.statCard}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Income</Text>
          </View>
          <Text style={styles.statValue}>{formatCurrency(totalIncome)}</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { backgroundColor: PURPLE.primary, width: "100%" }]} />
          </View>
        </View>

        {/* EXPENSE */}
        <View style={styles.statCard}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Expense</Text>
          </View>
          <Text style={styles.statValue}>{formatCurrency(totalExpense)}</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { backgroundColor: PURPLE.red, width: `${expensePercent}%` }]} />
          </View>
        </View>

        {/* SAVINGS */}
        <View style={[styles.statCard, { marginBottom: 24 }]}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Savings</Text>
          </View>
          <Text style={styles.statValue}>{formatCurrency(savings)}</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { backgroundColor: PURPLE.pink, width: `${savingsPercent}%` }]} />
          </View>
        </View>

        {/* CASH FLOW */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>Cash flow</Text>
              <Text style={styles.mutedSmall}>Last 6 months</Text>
            </View>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: PURPLE.green }]} />
                <Text style={styles.legendText}>Income</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: PURPLE.primary }]} />
                <Text style={styles.legendText}>Expense</Text>
              </View>
            </View>
          </View>

          {monthlyData.length > 0 ? (
            <LineChart
              data={cashFlowChartData}
              width={screenWidth - 72}
              height={200}
              bezier
              withInnerLines={false}
              withOuterLines={false}
              withShadow={false}
              withDots={false}
              chartConfig={{
                backgroundGradientFrom: PURPLE.card,
                backgroundGradientTo: PURPLE.card,
                decimalPlaces: 0,
                color: () => "rgba(255,255,255,0.25)",
                labelColor: () => PURPLE.muted,
                fillShadowGradient: PURPLE.primary,
                fillShadowGradientOpacity: 0.12,
              }}
              style={{ borderRadius: 12, marginLeft: -16 }}
            />
          ) : (
            <Text style={styles.emptyText}>No data yet</Text>
          )}
        </View>

        {/* CATEGORIES */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <Text style={styles.mutedSmall}>This month</Text>

          <View style={styles.donutWrap}>
            <DonutChart data={donutData} size={180} strokeWidth={26} />
          </View>
          <View style={{ gap: 12, marginTop: 16 }}>
            {donutData.length === 0 ? (
              <Text style={styles.emptyText}>No expenses yet</Text>
            ) : (
              donutData.map((segment) => (
                <View key={segment.label} style={styles.categoryRow}>
                  <View style={styles.categoryLeft}>
                    <View style={[styles.dot, { backgroundColor: segment.color }]} />
                    <Text style={styles.categoryName}>{segment.label}</Text>
                  </View>
                  <Text style={styles.categoryAmount}>{formatCurrency(segment.value)}</Text>
                </View>
              ))
            )}
          </View>
        </View>

        {/* RECENT TRANSACTIONS */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.sectionTitle}>Recent transactions</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>

          {recentTransactions.length === 0 ? (
            <Text style={styles.emptyText}>No transactions yet</Text>
          ) : (
            recentTransactions.map((txn, index) => {
              const isCredit = txn.transaction_type === "credit";
              const TxnIcon = isCredit ? Icon.ArrowCircleDown : Icon.Receipt;
              const iconBg = isCredit ? PURPLE.green : PURPLE.red;
              return (
                <View key={index} style={styles.transactionRow}>
                  <View style={[styles.txIcon, { backgroundColor: iconBg }]}>
                    <TxnIcon size={20} color="#fff" weight="fill" />
                  </View>
                  <View style={styles.txDetails}>
                    <Text style={styles.txMerchant}>{txn.merchant}</Text>
                    <Text style={styles.txDate}>{formatTxnMeta(txn.created_at)}</Text>
                  </View>
                  <Text style={[styles.txAmount, { color: isCredit ? PURPLE.green : PURPLE.red }]}>
                    {isCredit ? "+ " : "- "}
                    {formatCurrency(Number(txn.amount))}
                  </Text>
                </View>
              );
            })
          )}
        </View>

        <View style={{ height: 140 }} />
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
    overflow: "hidden",
  },
  orb: { position: "absolute", borderRadius: 999 },
  orbA: { width: 160, height: 160, top: -60, right: -50, backgroundColor: SOLID.orbPrimary },
  orbB: { width: 140, height: 140, bottom: -60, left: -40, backgroundColor: SOLID.orbAccent },
  balanceLabelRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
  balanceLabel: { color: PURPLE.muted, fontSize: 13 },
  balanceAmount: { color: PURPLE.text, fontSize: 34, fontWeight: "800", marginBottom: 8 },
  statCard: {
    backgroundColor: PURPLE.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: PURPLE.cardBorder,
    padding: 18,
    marginBottom: 12,
  },
  statRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  statLabel: { color: PURPLE.muted, fontSize: 13 },
  statValue: { color: PURPLE.text, fontSize: 24, fontWeight: "700", marginTop: 6, marginBottom: 10 },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  progressFill: { height: 4, borderRadius: 2 },
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
    alignItems: "flex-start",
    marginBottom: 8,
  },
  sectionTitle: { color: PURPLE.text, fontSize: 17, fontWeight: "700" },
  mutedSmall: { color: PURPLE.muted, fontSize: 12, marginTop: 2 },
  legendRow: { flexDirection: "row", gap: 14 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: PURPLE.muted, fontSize: 12 },
  donutWrap: { alignItems: "center", marginTop: 12 },
  categoryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  categoryLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  categoryName: { color: PURPLE.text, fontSize: 14 },
  categoryAmount: { color: PURPLE.text, fontSize: 14, fontWeight: "600" },
  seeAll: { color: PURPLE.primaryLight, fontSize: 13, fontWeight: "600" },
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
});
