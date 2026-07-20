import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import Header from "@/components/Header";
import { PURPLE } from "@/constants/colors";
import { getSummaryApi } from "@/services/api";
import { ExpenseSummary } from "@/types";
import { formatCurrency } from "@/utils/format";

const CHART_HEIGHT = 150;

const EMPTY_SUMMARY: ExpenseSummary = {
  total_income: 0,
  total_expense: 0,
  savings: 0,
  recent_transactions: [],
  category_breakdown: [],
  monthly_data: [],
};

const DATE_RANGES = [
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "3M", days: 90 },
  { label: "6M", days: 180 },
];

export default function Statistics() {
  const [summary, setSummary] = useState<ExpenseSummary>(EMPTY_SUMMARY);
  const [loading, setLoading] = useState(true);
  const [selectedDays, setSelectedDays] = useState(180);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        try {
          setLoading(true);
          const data = await getSummaryApi(selectedDays);
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
    }, [selectedDays])
  );

  const totalIncome = Number(summary.total_income || 0);
  const totalExpense = Number(summary.total_expense || 0);
  const savings = Number(summary.savings || 0);
  const monthlyData = summary.monthly_data || [];
  const categoryBreakdown = summary.category_breakdown || [];
  const recentTransactions = summary.recent_transactions || [];

  const selectedRangeLabel = DATE_RANGES.find((r) => r.days === selectedDays)?.label ?? "6M";
  const avgMonthlySpend = totalExpense / Math.max(1, selectedDays / 30);
  const topCategory = categoryBreakdown[0];
  const topCategoryPercent =
    topCategory && totalExpense > 0 ? Math.round((Number(topCategory.total_amount) / totalExpense) * 100) : 0;
  const savingRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;

  const STATS = [
    { label: "Avg. monthly spend", value: formatCurrency(avgMonthlySpend), sub: `Last ${selectedRangeLabel}` },
    { label: "Top category", value: topCategory?.category ?? "—", sub: topCategory ? `${topCategoryPercent}% of spend` : "No data" },
    { label: "Saving rate", value: `${savingRate.toFixed(0)}%`, sub: "of income" },
    { label: "Transactions", value: `${recentTransactions.length}`, sub: "recent" },
  ];

  const maxValue = Math.max(1, ...monthlyData.flatMap((m) => [Number(m.income), Number(m.expense)]));

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
        <Header title="Statistics" />

        {loading && (
          <View style={styles.inlineLoading}>
            <ActivityIndicator size="small" color={PURPLE.primaryLight} />
          </View>
        )}

        <View style={styles.titleRow}>
          <View>
            <Text style={styles.pageTitle}>Insights</Text>
            <Text style={styles.pageSubtitle}>Understand your spending patterns</Text>
          </View>
        </View>

        <View style={styles.pillRow}>
          {DATE_RANGES.map((range) => (
            <TouchableOpacity
              key={range.label}
              style={[styles.pillBtn, selectedDays === range.days && styles.pillBtnActive]}
              onPress={() => setSelectedDays(range.days)}
            >
              <Text style={[styles.pillText, selectedDays === range.days && styles.pillTextActive]}>
                {range.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 4 STAT CARDS GRID */}
        <View style={styles.grid}>
          {STATS.map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Text style={styles.statLabel}>{s.label}</Text>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statSub}>{s.sub}</Text>
            </View>
          ))}
        </View>

        {/* MONTHLY COMPARISON BAR CHART */}
        <View style={[styles.card, { marginBottom: 140 }]}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.sectionTitle}>Monthly comparison</Text>
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

          {monthlyData.length === 0 ? (
            <Text style={styles.emptyText}>No data yet</Text>
          ) : (
            <View style={styles.chartArea}>
              {monthlyData.map((m) => (
                <View key={m.month} style={styles.barGroup}>
                  <View style={styles.barPair}>
                    <View
                      style={[
                        styles.bar,
                        { height: (Number(m.income) / maxValue) * CHART_HEIGHT, backgroundColor: PURPLE.green },
                      ]}
                    />
                    <View
                      style={[
                        styles.bar,
                        { height: (Number(m.expense) / maxValue) * CHART_HEIGHT, backgroundColor: PURPLE.primary },
                      ]}
                    />
                  </View>
                  <Text style={styles.barLabel}>{m.month.split(" ")[0]}</Text>
                </View>
              ))}
            </View>
          )}
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
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
    gap: 12,
  },
  pageTitle: { color: PURPLE.text, fontSize: 24, fontWeight: "800" },
  pageSubtitle: { color: PURPLE.muted, fontSize: 12, marginTop: 4 },
  pillRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  pillBtn: {
    flex: 1,
    alignItems: "center",
    backgroundColor: PURPLE.card,
    borderWidth: 1,
    borderColor: PURPLE.cardBorder,
    borderRadius: 12,
    paddingVertical: 10,
  },
  pillBtnActive: {
    backgroundColor: PURPLE.primary,
    borderColor: PURPLE.primary,
  },
  pillText: { color: PURPLE.muted, fontSize: 13, fontWeight: "600" },
  pillTextActive: { color: "#fff" },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    width: "47.5%",
    backgroundColor: PURPLE.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: PURPLE.cardBorder,
    padding: 16,
  },
  statLabel: { color: PURPLE.muted, fontSize: 12 },
  statValue: { color: PURPLE.text, fontSize: 20, fontWeight: "700", marginTop: 6 },
  statSub: { color: PURPLE.muted, fontSize: 12, marginTop: 6 },
  card: {
    backgroundColor: PURPLE.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: PURPLE.cardBorder,
    padding: 20,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: { color: PURPLE.text, fontSize: 17, fontWeight: "700" },
  legendRow: { flexDirection: "row", gap: 14 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: PURPLE.muted, fontSize: 12 },
  emptyText: { color: PURPLE.muted, fontSize: 13, textAlign: "center", marginVertical: 16 },
  chartArea: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: CHART_HEIGHT + 28,
  },
  barGroup: { alignItems: "center", gap: 8 },
  barPair: { flexDirection: "row", alignItems: "flex-end", gap: 4, height: CHART_HEIGHT },
  bar: { width: 8, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  barLabel: { color: PURPLE.muted, fontSize: 11 },
});
