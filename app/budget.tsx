import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useCallback, useState } from "react";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import * as Icon from "phosphor-react-native";
import CircularProgress from "@/components/CircularProgress";
import { PURPLE, SOLID } from "@/constants/colors";
import { getLimitApi, setLimitApi, resetLimitApi, addExpenseApi } from "@/services/api";
import { SpendingLimitStatus } from "@/types";
import { formatCurrency } from "@/utils/format";

export default function Budget() {
  const router = useRouter();

  const [limitData, setLimitData] = useState<SpendingLimitStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const [newAmount, setNewAmount] = useState("");
  const [newDays, setNewDays] = useState("");
  const [quickAmount, setQuickAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [deducting, setDeducting] = useState(false);
  const [resetting, setResetting] = useState(false);

  const loadLimit = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getLimitApi();
      setLimitData(data);
    } catch (error) {
      console.log("Failed to load spending limit:", error);
      setLimitData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadLimit();
    }, [loadLimit])
  );

  const amount = Number(limitData?.amount ?? 0);
  const spent = Number(limitData?.total_spent ?? 0);
  const remaining = Number(limitData?.remaining_limit ?? Math.max(0, amount - spent));
  const daysLeft = Number(limitData?.days_left ?? 0);
  const percentUsed = amount > 0 ? Math.min(100, Math.max(0, (spent / amount) * 100)) : 0;

  const handleSaveBudget = async () => {
    if (!newAmount || !newDays) return;
    try {
      setSaving(true);
      await setLimitApi({ amount: Number(newAmount), days: Number(newDays) });
      setNewAmount("");
      setNewDays("");
      await loadLimit();
    } catch (error) {
      console.log("Failed to save budget:", error);
      Alert.alert("Error", "Could not save budget. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleResetBudget = async () => {
    if (!limitData) return;
    try {
      setResetting(true);
      // amount: 0 tells the backend to delete the spending_limit row (no expenses
      // are touched). getLimit then 404s and the screen falls back to the
      // "No active budget" empty state below.
      await resetLimitApi();
      await loadLimit();
    } catch (error) {
      console.log("Failed to reset budget:", error);
      Alert.alert("Error", "Could not reset budget. Try again.");
    } finally {
      setResetting(false);
    }
  };

  const handleQuickAdd = async () => {
    if (!quickAmount) return;
    try {
      setDeducting(true);
      const response = await addExpenseApi({
        amount: Number(quickAmount),
        merchant: "Quick Expense",
        currency: "inr",
        transactionType: "debit",
      });
      setQuickAmount("");
      if (response?.limit_exceeded) {
        Alert.alert("Warning", "Warning: " + response.warning);
      }
      await loadLimit();
    } catch (error) {
      console.log("Failed to add expense:", error);
      Alert.alert("Error", "Could not add expense. Try again.");
    } finally {
      setDeducting(false);
    }
  };

  if (loading && !limitData) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={PURPLE.primaryLight} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Icon.CaretLeft size={20} color={PURPLE.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Budget</Text>
          <View style={{ width: 38 }} />
        </View>

        {/* SPENDING LIMIT CARD */}
        <View style={styles.limitCard}>
          <View style={[styles.orb, styles.orbA]} />
          <View style={[styles.orb, styles.orbB]} />

          <View style={styles.limitHeaderRow}>
            <Icon.Target size={14} color={PURPLE.primaryLight} />
            <Text style={styles.limitHeaderText}>SPENDING LIMIT</Text>
          </View>

          {limitData ? (
            <>
              <Text style={styles.remainingLabel}>Remaining budget</Text>
              <Text style={styles.remainingAmount}>{formatCurrency(remaining)}</Text>
              <Text style={styles.ofTotal}>
                of <Text style={{ fontWeight: "700", color: PURPLE.text }}>{formatCurrency(amount)}</Text>
              </Text>

              <View style={styles.progressWrap}>
                <CircularProgress
                  percentage={percentUsed}
                  size={220}
                  strokeWidth={18}
                  gradientFrom={PURPLE.primary}
                  gradientTo={PURPLE.pink}
                >
                  <Text style={styles.percentText}>{Math.round(percentUsed)}%</Text>
                  <Text style={styles.usedText}>used</Text>
                </CircularProgress>
              </View>
            </>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrap}>
                <Icon.Target size={28} color={PURPLE.muted} />
              </View>
              <Text style={styles.emptyTitle}>No active budget</Text>
              <Text style={styles.emptyText}>Set a new budget below to get started.</Text>
            </View>
          )}
        </View>

        {/* STAT ROW */}
        {limitData && (
          <View style={styles.statRow}>
            <View style={styles.statCard}>
              <Icon.Wallet size={18} color={PURPLE.primaryLight} />
              <Text style={styles.statLabel}>TOTAL</Text>
              <Text style={styles.statValue}>{formatCurrency(amount)}</Text>
            </View>
            <View style={styles.statCard}>
              <Icon.ChartLineDown size={18} color={PURPLE.red} />
              <Text style={styles.statLabel}>SPENT</Text>
              <Text style={styles.statValue}>{formatCurrency(spent)}</Text>
            </View>
            <View style={styles.statCard}>
              <Icon.CalendarBlank size={18} color={PURPLE.primaryLight} />
              <Text style={styles.statLabel}>DAYS LEFT</Text>
              <Text style={styles.statValue}>{daysLeft}</Text>
            </View>
          </View>
        )}

        {/* SET NEW BUDGET */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Icon.Sparkle size={16} color={PURPLE.primaryLight} weight="fill" />
            <Text style={styles.cardTitle}>Set a new budget</Text>
          </View>

          <Text style={styles.inputLabel}>Amount ($)</Text>
          <TextInput
            style={styles.input}
            value={newAmount}
            onChangeText={setNewAmount}
            placeholder="2500"
            placeholderTextColor="#666"
            keyboardType="numeric"
          />

          <Text style={styles.inputLabel}>Days</Text>
          <TextInput
            style={styles.input}
            value={newDays}
            onChangeText={setNewDays}
            placeholder="30"
            placeholderTextColor="#666"
            keyboardType="numeric"
          />

          <TouchableOpacity onPress={handleSaveBudget} disabled={saving}>
            <View style={[styles.saveBtn, { backgroundColor: SOLID.primary, opacity: saving ? 0.6 : 1 }]}>
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveBtnText}>Save Budget</Text>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* QUICK ADD EXPENSE */}
        <View style={[styles.card, { marginBottom: 60 }]}>
          <View style={styles.cardTitleRow}>
            <Icon.Plus size={16} color={PURPLE.primaryLight} weight="bold" />
            <Text style={styles.cardTitle}>Quick add expense</Text>
          </View>

          <Text style={styles.inputLabel}>Amount ($)</Text>
          <TextInput
            style={styles.input}
            value={quickAmount}
            onChangeText={setQuickAmount}
            placeholder="42.00"
            placeholderTextColor="#666"
            keyboardType="numeric"
          />

          <TouchableOpacity style={[styles.deductBtn, deducting && { opacity: 0.6 }]} onPress={handleQuickAdd} disabled={deducting}>
            {deducting ? (
              <ActivityIndicator size="small" color={PURPLE.text} />
            ) : (
              <Text style={styles.deductBtnText}>Deduct from Budget</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.resetBtn, (resetting || !limitData) && { opacity: 0.5 }]}
            onPress={handleResetBudget}
            disabled={resetting || !limitData}
          >
            {resetting ? (
              <ActivityIndicator size="small" color={PURPLE.muted} />
            ) : (
              <>
                <Icon.ArrowCounterClockwise size={14} color={PURPLE.muted} />
                <Text style={styles.resetText}>Reset budget</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PURPLE.bg,
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  loadingContainer: { justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: PURPLE.cardBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { color: PURPLE.text, fontSize: 18, fontWeight: "700" },
  limitCard: {
    backgroundColor: PURPLE.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: PURPLE.cardBorder,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
    overflow: "hidden",
  },
  orb: { position: "absolute", borderRadius: 999 },
  orbA: { width: 180, height: 180, top: -70, right: -60, backgroundColor: SOLID.orbPrimary },
  orbB: { width: 160, height: 160, bottom: -70, left: -50, backgroundColor: SOLID.orbAccent },
  limitHeaderRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 18 },
  limitHeaderText: { color: PURPLE.primaryLight, fontSize: 12, fontWeight: "700", letterSpacing: 2 },
  remainingLabel: { color: PURPLE.muted, fontSize: 14, marginBottom: 8 },
  remainingAmount: { color: PURPLE.text, fontSize: 40, fontWeight: "800", marginBottom: 6 },
  ofTotal: { color: PURPLE.muted, fontSize: 14, marginBottom: 20 },
  progressWrap: { marginTop: 8 },
  percentText: { color: PURPLE.text, fontSize: 34, fontWeight: "800" },
  usedText: { color: PURPLE.muted, fontSize: 13, marginTop: 2 },
  emptyState: { alignItems: "center", paddingVertical: 20, gap: 6 },
  emptyIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: PURPLE.cardBorder,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  emptyTitle: { color: PURPLE.text, fontSize: 17, fontWeight: "700" },
  emptyText: { color: PURPLE.muted, fontSize: 13, textAlign: "center" },
  statRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  statCard: {
    flex: 1,
    backgroundColor: PURPLE.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PURPLE.cardBorder,
    padding: 14,
    alignItems: "center",
    gap: 6,
  },
  statLabel: { color: PURPLE.muted, fontSize: 10, fontWeight: "700", letterSpacing: 1 },
  statValue: { color: PURPLE.text, fontSize: 15, fontWeight: "700" },
  card: {
    backgroundColor: PURPLE.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: PURPLE.cardBorder,
    padding: 20,
    marginBottom: 16,
  },
  cardTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 },
  cardTitle: { color: PURPLE.text, fontSize: 16, fontWeight: "700" },
  inputLabel: { color: PURPLE.muted, fontSize: 13, marginBottom: 6 },
  input: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: PURPLE.cardBorder,
    borderRadius: 12,
    padding: 14,
    color: PURPLE.text,
    fontSize: 15,
    marginBottom: 14,
  },
  saveBtn: {
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  deductBtn: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: PURPLE.cardBorder,
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  deductBtnText: { color: PURPLE.text, fontWeight: "700", fontSize: 16 },
  resetBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 16,
  },
  resetText: { color: PURPLE.muted, fontSize: 13 },
});
