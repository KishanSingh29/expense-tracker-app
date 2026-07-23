import { Stack } from "expo-router";
import { useSmsListener } from "@/hooks/useSmsListener";

export default function Layout() {
  useSmsListener();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="budget" options={{ presentation: "modal" }} />
    </Stack>
  );
}