import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";

import { CustomButtonProps } from "@/types";
import { colors, radius } from "@/constants/theme";
import { verticalScale } from "@/utils/styling";
import Loading from "./Loading";

const Button = ({
  style,
  onPress,
  loading = false,
  children,
}: CustomButtonProps) => {
  
  // 🔥 loading state
  if (loading) {
    return (
      <View
        style={[
          styles.button,
          style,
          { backgroundColor: "transparent" },
        ]}
      >
        <Loading />
      </View>
    );
  }

  // 🔥 normal button
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.button, style]}
      activeOpacity={0.7}
    >
      {children}
    </TouchableOpacity>
  );
};

export default Button;

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius._17,
    height: verticalScale(52),
    justifyContent: "center",
    alignItems: "center",
  },
});