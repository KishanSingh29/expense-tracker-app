import {
  View, StyleSheet, Pressable,
  TextInput, Alert, ActivityIndicator, ScrollView
} from "react-native";
import React, { useEffect, useState } from "react";
import Typo from "@/components/Typo";
import * as Icon from "phosphor-react-native";
import { useRouter } from "expo-router";
import { getProfileApi, updateProfileApi } from "@/services/api";

const EditProfile = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // ✅ Screen open hote hi current data load karo
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getProfileApi();
      setFirstName(data.firstName || "");
      setLastName(data.lastName || "");
      setPhoneNumber(data.phoneNumber?.toString() || "");
    } catch (error) {
      Alert.alert("Error", "Could not load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert("Validation", "First name and last name cannot be empty");
      return;
    }

    try {
      setSaving(true);
      await updateProfileApi({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phoneNumber ? Number(phoneNumber) : undefined,
      });
      Alert.alert("Success", "Profile updated!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert("Error", "Could not update profile. Try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#84cc16" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Icon.CaretLeft size={24} color="#fff" />
        </Pressable>
        <Typo size={18} fontWeight={"600"} color={"#fff"}>
          Update Profile
        </Typo>
        <View style={{ width: 24 }} />
      </View>

      {/* AVATAR */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Icon.User size={50} color="#ccc" />
        </View>
        <View style={styles.editIcon}>
          <Icon.Pencil size={16} color="#000" />
        </View>
      </View>

      {/* INPUTS */}
      <View style={styles.inputGroup}>
        <View style={styles.inputContainer}>
          <Typo size={14} color={"#aaa"}>First Name</Typo>
          <TextInput
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Enter first name"
            placeholderTextColor="#666"
            style={styles.input}
          />
        </View>

        <View style={styles.inputContainer}>
          <Typo size={14} color={"#aaa"}>Last Name</Typo>
          <TextInput
            value={lastName}
            onChangeText={setLastName}
            placeholder="Enter last name"
            placeholderTextColor="#666"
            style={styles.input}
          />
        </View>

        <View style={styles.inputContainer}>
          <Typo size={14} color={"#aaa"}>Phone Number</Typo>
          <TextInput
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Enter phone number"
            placeholderTextColor="#666"
            keyboardType="phone-pad"
            style={styles.input}
          />
        </View>
      </View>

      {/* UPDATE BUTTON */}
      <Pressable
        style={[styles.button, saving && { opacity: 0.6 }]}
        onPress={handleUpdate}
        disabled={saving}
      >
        {saving
          ? <ActivityIndicator size="small" color="#000" />
          : <Typo size={16} fontWeight={"600"} color={"#000"}>Update</Typo>
        }
      </Pressable>
    </ScrollView>
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
  inputGroup: {
    gap: 20,
    marginBottom: 30,
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
    fontSize: 15,
  },
  button: {
    backgroundColor: "#84cc16",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
  },
});