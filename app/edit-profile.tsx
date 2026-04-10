import { View, StyleSheet, Pressable, TextInput } from "react-native";
import React, { useState } from "react";
import Typo from "@/components/Typo";
import * as Icon from "phosphor-react-native";
import { useRouter } from "expo-router";

const EditProfile = () => {
  const router = useRouter();
  const [name, setName] = useState("Kishan");

  return (
    <View style={styles.container}>
      {/* 🔝 HEADER */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Icon.CaretLeft size={24} color="#fff" />
        </Pressable>

        <Typo size={18} fontWeight={"600"} color={"#fff"}>
          Update Profile
        </Typo>

        <View style={{ width: 24 }} />
      </View>

      {/* 👤 PROFILE IMAGE */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Icon.User size={50} color="#ccc" />
        </View>

        {/* edit icon */}
        <View style={styles.editIcon}>
          <Icon.Pencil size={16} color="#000" />
        </View>
      </View>

      {/* 📝 INPUT */}
      <View style={styles.inputContainer}>
        <Typo size={14} color={"#aaa"}>
          Name
        </Typo>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Enter name"
          placeholderTextColor="#666"
          style={styles.input}
        />
      </View>

      {/* ✅ BUTTON */}
      <Pressable style={styles.button}>
        <Typo size={16} fontWeight={"600"} color={"#000"}>
          Update
        </Typo>
      </Pressable>
    </View>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
    paddingHorizontal: 20,
    paddingTop: 50,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },

  avatarSection: {
    alignItems: "center",
    marginBottom: 40,
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 60,
    backgroundColor: "#2c2c2e",
    justifyContent: "center",
    alignItems: "center",
  },

  editIcon: {
    position: "absolute",
    bottom: 5,
    right: 130,
    backgroundColor: "#fff",
    padding: 6,
    borderRadius: 20,
  },

  inputContainer: {
    gap: 8,
  },

  input: {
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 12,
    padding: 14,
    color: "#fff",
  },

  button: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: "#84cc16", // green
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },
});