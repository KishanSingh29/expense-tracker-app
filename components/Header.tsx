import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import * as Icon from "phosphor-react-native";
import { PURPLE, SOLID } from "@/constants/colors";

type Props = {
  title: string;
  initials?: string;
};

const Header = ({ title, initials = "AM" }: Props) => {
  return (
    <View style={styles.header}>
      <View style={[styles.logo, { backgroundColor: SOLID.primary }]}>
        <Text style={styles.logoText}>Z</Text>
      </View>

      <Text style={styles.title}>{title}</Text>

      <View style={styles.right}>
        <TouchableOpacity style={styles.bellBtn}>
          <Icon.Bell size={20} color={PURPLE.text} />
          <View style={styles.bellDot} />
        </TouchableOpacity>
        <View style={[styles.avatar, { backgroundColor: SOLID.accent }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
      </View>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: 38,
    height: 38,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  title: { color: PURPLE.text, fontSize: 17, fontWeight: "700" },
  right: { flexDirection: "row", alignItems: "center", gap: 12 },
  bellBtn: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: PURPLE.cardBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  bellDot: {
    position: "absolute",
    top: 8,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: PURPLE.pink,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 12 },
});
