import { Alert, Pressable, StyleSheet, View } from "react-native";
import React from "react";
import Typo from "@/components/Typo";
import * as Icon from "phosphor-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const Profile = () => {
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        onPress: async () => {
          await AsyncStorage.clear();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  // 🔹 reusable row
  const MenuItem = ({ icon, title, onPress }: any) => (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={styles.left}>
        <View style={styles.iconBox}>{icon}</View>
        <Typo size={16} color={"#fff"}>
          {title}
        </Typo>
      </View>
      <Icon.CaretRight size={18} color="#aaa" />
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {/* 🔝 TITLE */}
      <Typo size={20} fontWeight={"600"} style={styles.title}>
        Profile
      </Typo>

      {/* 👤 PROFILE */}
      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          <Icon.User size={50} color="#ccc" />
        </View>

        <Typo size={18} fontWeight={"600"} color={"#fff"}>
          Kishan SIngh
        </Typo>

        <Typo size={14} color={"#aaa"}>
          Kishan@gmail.com
        </Typo>
      </View>

      {/* 📋 MENU */}
      <View style={styles.menu}>
        <MenuItem
          title="Edit Profile"
          icon={
            <View style={[styles.iconColor, { backgroundColor: "#6366f1" }]}>
              <Icon.User size={18} color="#fff" />
            </View>
          }
          onPress={() => router.push("/edit-profile")}
        />

        <MenuItem
          title="Settings"
          icon={
            <View style={[styles.iconColor, { backgroundColor: "#1b5c33" }]}>
              <Icon.Gear size={18} color="#fff" />
            </View>
          }
          onPress={() => Alert.alert("Coming Soon")}
        />

        <MenuItem
          title="Privacy Policy"
          icon={
            <View style={[styles.iconColor, { backgroundColor: "#6b7280" }]}>
              <Icon.Lock size={18} color="#fff" />
            </View>
          }
          onPress={() => Alert.alert("Coming Soon")}
        />

        <MenuItem
          title="Logout"
          icon={
            <View style={[styles.iconColor, { backgroundColor: "#ef4444" }]}>
              <Icon.Power size={18} color="#fff" />
            </View>
          }
          onPress={handleLogout}
        />
      </View>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0c0c0c",
    paddingHorizontal: 20,
    paddingTop: 40,
  },

  title: {
    textAlign: "center",
    marginBottom: 30,
    color: "#fff",
  },

  profileSection: {
    alignItems: "center",
    marginBottom: 40,
    gap: 6,
  },

  avatar: {
    width: 100,
    height: 100,
    borderRadius: 60,
    backgroundColor: "#2c2c2e",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  menu: {
    gap: 15,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },

  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  iconColor: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});
