import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useCallback, useState } from "react";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import * as Icon from "phosphor-react-native";
import Header from "@/components/Header";
import { PURPLE, SOLID } from "@/constants/colors";
import { getProfileApi, clearTokens } from "@/services/api";
import { ProfileData } from "@/types";

const STATS = [
  { label: "Accounts", value: "3" },
  { label: "Categories", value: "8" },
  { label: "Saved", value: "$2,252" },
];

const ACCOUNT_ITEMS = [
  { icon: Icon.Lock, label: "Security", desc: "Password, 2FA", bg: "rgba(124,58,237,0.15)", color: PURPLE.primaryLight },
  { icon: Icon.CreditCard, label: "Linked cards", desc: "2 connected", bg: "rgba(236,72,153,0.15)", color: PURPLE.pink },
  { icon: Icon.ShieldCheck, label: "Privacy", desc: "Manage your data", bg: "rgba(20,184,166,0.15)", color: PURPLE.teal },
];

const PREFERENCE_ITEMS = [
  { icon: Icon.Bell, label: "Notifications", desc: "Push, email alerts", bg: "rgba(124,58,237,0.15)", color: PURPLE.primaryLight },
  { icon: Icon.MoonStars, label: "Appearance", desc: "Dark theme", bg: "rgba(236,72,153,0.15)", color: PURPLE.pink },
  { icon: Icon.Globe, label: "Language", desc: "English (US)", bg: "rgba(20,184,166,0.15)", color: PURPLE.teal },
];

const EMPTY_PROFILE: ProfileData = {
  firstName: "",
  lastName: "",
  email: "",
};

export default function Profile() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData>(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        try {
          setLoading(true);
          const data = await getProfileApi();
          if (active) setProfile({ ...EMPTY_PROFILE, ...data });
        } catch (error) {
          console.log("Failed to load profile:", error);
        } finally {
          if (active) setLoading(false);
        }
      })();
      return () => {
        active = false;
      };
    }, [])
  );

  const handleLogout = async () => {
    await clearTokens();
    router.replace("/(auth)/login" as any);
  };

  const name = `${profile.firstName} ${profile.lastName}`.trim() || "User";
  const initials =
    `${profile.firstName?.[0] ?? ""}${profile.lastName?.[0] ?? ""}`.toUpperCase() || "U";

  const MenuRow = ({ icon: IconCmp, label, desc, bg, color }: any) => (
    <TouchableOpacity style={styles.row}>
      <View style={styles.rowLeft}>
        <View style={[styles.iconBox, { backgroundColor: bg }]}>
          <IconCmp size={18} color={color} weight="fill" />
        </View>
        <View>
          <Text style={styles.rowLabel}>{label}</Text>
          <Text style={styles.rowDesc}>{desc}</Text>
        </View>
      </View>
      <Icon.CaretRight size={16} color={PURPLE.muted} />
    </TouchableOpacity>
  );

  if (loading && profile === EMPTY_PROFILE) {
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
        <Header title="Profile" />

        {loading && (
          <View style={styles.inlineLoading}>
            <ActivityIndicator size="small" color={PURPLE.primaryLight} />
          </View>
        )}

        {/* PROFILE HERO */}
        <View style={styles.heroCard}>
          <View style={[styles.avatar, { backgroundColor: SOLID.primary }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{name}</Text>
          <View style={styles.metaRow}>
            <Icon.EnvelopeSimple size={13} color={PURPLE.muted} />
            <Text style={styles.metaText}>{profile.email}</Text>
          </View>

          <TouchableOpacity style={styles.editBtn} onPress={() => router.push("/edit-profile")}>
            <Icon.PencilSimple size={14} color={PURPLE.text} />
            <Text style={styles.editBtnText}>Edit profile</Text>
          </TouchableOpacity>

          <View style={styles.statsRow}>
            {STATS.map((s, i) => (
              <View key={s.label} style={[styles.statItem, i !== STATS.length - 1 && styles.statDivider]}>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ACCOUNT */}
        <Text style={styles.groupTitle}>ACCOUNT</Text>
        <View style={styles.card}>
          {ACCOUNT_ITEMS.map((item, i) => (
            <View key={item.label}>
              <MenuRow {...item} />
              {i !== ACCOUNT_ITEMS.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        {/* PREFERENCES */}
        <Text style={styles.groupTitle}>PREFERENCES</Text>
        <View style={styles.card}>
          {PREFERENCE_ITEMS.map((item, i) => (
            <View key={item.label}>
              <MenuRow {...item} />
              {i !== PREFERENCE_ITEMS.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        {/* LOGOUT */}
        <View style={[styles.card, { marginBottom: 140 }]}>
          <TouchableOpacity style={styles.row} onPress={handleLogout}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, { backgroundColor: "rgba(239,68,68,0.15)" }]}>
                <Icon.SignOut size={18} color={PURPLE.red} weight="fill" />
              </View>
              <Text style={[styles.rowLabel, { color: PURPLE.red }]}>Logout</Text>
            </View>
          </TouchableOpacity>
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
  heroCard: {
    backgroundColor: PURPLE.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: PURPLE.cardBorder,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  avatarText: { color: "#fff", fontSize: 26, fontWeight: "800" },
  name: { color: PURPLE.text, fontSize: 20, fontWeight: "700", marginBottom: 8 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  metaText: { color: PURPLE.muted, fontSize: 13 },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: PURPLE.cardBorder,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginTop: 16,
  },
  editBtnText: { color: PURPLE.text, fontSize: 13, fontWeight: "600" },
  statsRow: {
    flexDirection: "row",
    width: "100%",
    marginTop: 22,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: PURPLE.cardBorder,
  },
  statItem: { flex: 1, alignItems: "center" },
  statDivider: { borderRightWidth: 1, borderRightColor: PURPLE.cardBorder },
  statValue: { color: PURPLE.text, fontSize: 16, fontWeight: "700" },
  statLabel: { color: PURPLE.muted, fontSize: 11, marginTop: 4 },
  groupTitle: {
    color: PURPLE.muted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 10,
    marginLeft: 4,
  },
  card: {
    backgroundColor: PURPLE.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: PURPLE.cardBorder,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
  },
  rowLabel: { color: PURPLE.text, fontSize: 14, fontWeight: "600" },
  rowDesc: { color: PURPLE.muted, fontSize: 12, marginTop: 2 },
  divider: { height: 1, backgroundColor: PURPLE.cardBorder, marginLeft: 60 },
});
