export const PURPLE = {
  bg: "#1a1a2e",
  card: "#16213e",
  cardAlt: "#16213e",
  cardBorder: "rgba(255,255,255,0.08)",
  primary: "#7c3aed",
  primaryLight: "#a78bfa",
  pink: "#ec4899",
  teal: "#14b8a6",
  text: "#ffffff",
  muted: "#94a3b8",
  green: "#10b981",
  red: "#ef4444",
  amber: "#f59e0b",
};

// Solid color stand-ins for what used to be LinearGradient fills.
// expo-linear-gradient doesn't work in Expo Go, so every screen now
// uses a flat backgroundColor instead of a gradient.
export const SOLID = {
  primary: "#7c3aed",
  accent: "#ec4899",
  purpleCard: "#7c3aed",
  tealCard: "#14b8a6",
  greenCard: "#10b981",
  fab: "#7c3aed",
  orbPrimary: "rgba(124,58,237,0.30)",
  orbAccent: "rgba(236,72,153,0.20)",
};

export const CATEGORY_COLORS: Record<string, string> = {
  Food: "#ec4899",
  Shopping: "#10b981",
  Travel: "#06b6d4",
  Bills: "#f59e0b",
  Entertainment: "#6366f1",
  Groceries: "#a855f7",
  Other: "#94a3b8",
};
