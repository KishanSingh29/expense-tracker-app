import React from "react";
import { View, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { useRouter } from "expo-router";
import * as Icon from "phosphor-react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { PURPLE, SOLID } from "@/constants/colors";

const TAB_ICONS: Record<string, any> = {
  index: Icon.House,
  wallet: Icon.Wallet,
  statistics: Icon.ChartBar,
  profile: Icon.User,
};

const LEFT_ROUTES = ["index", "wallet"];
const RIGHT_ROUTES = ["statistics", "profile"];

const TabBar = ({ state, navigation }: BottomTabBarProps) => {
  const router = useRouter();

  const renderTab = (routeName: string) => {
    const index = state.routes.findIndex((r) => r.name === routeName);
    if (index === -1) return null;
    const route = state.routes[index];
    const isFocused = state.index === index;
    const IconComponent = TAB_ICONS[routeName];

    const onPress = () => {
      const event = navigation.emit({
        type: "tabPress",
        target: route.key,
        canPreventDefault: true,
      });
      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    };

    return (
      <TouchableOpacity key={route.key} style={styles.tabItem} onPress={onPress}>
        <IconComponent
          size={22}
          color={isFocused ? PURPLE.text : PURPLE.muted}
          weight={isFocused ? "fill" : "regular"}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.bar}>
        <View style={styles.side}>{LEFT_ROUTES.map(renderTab)}</View>
        <View style={styles.centerGap} />
        <View style={styles.side}>{RIGHT_ROUTES.map(renderTab)}</View>
      </View>

      <TouchableOpacity
        style={styles.fabWrap}
        activeOpacity={0.85}
        onPress={() => router.push("/budget" as any)}
      >
        <View style={[styles.fab, { backgroundColor: SOLID.fab }]}>
          <Icon.ArrowsLeftRight size={24} color="#fff" weight="bold" />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default TabBar;

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: Platform.OS === "ios" ? 30 : 20,
    alignItems: "center",
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: 64,
    borderRadius: 32,
    backgroundColor: PURPLE.cardAlt,
    borderWidth: 1,
    borderColor: PURPLE.cardBorder,
    paddingHorizontal: 16,
  },
  side: { flex: 1, flexDirection: "row", justifyContent: "space-around" },
  centerGap: { width: 58 },
  tabItem: { alignItems: "center", justifyContent: "center", padding: 8 },
  fabWrap: {
    position: "absolute",
    top: -22,
    alignSelf: "center",
    shadowColor: PURPLE.primary,
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  fab: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: "center",
    alignItems: "center",
  },
});
