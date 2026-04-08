import React from "react";
import {
  StyleSheet,
  View,
  Platform,
  StatusBar,
} from "react-native";
import { ScreenWrapperProps } from "@/types";
import { colors } from "@/constants/theme";

const ScreenWrapper = ({ style, children }: ScreenWrapperProps) => {
  const paddingTop =
    Platform.OS === "android" ? StatusBar.currentHeight : 50;

  return (
    <View
      style={[
        styles.container,
        { paddingTop },
        style,
      ]}
    >
      <StatusBar barStyle="light-content" />
      {children}
    </View>
  );
};

export default ScreenWrapper;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors?.neutral900 || "#000", // fallback
  },
});