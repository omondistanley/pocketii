import React from "react";
import { StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text } from "./ui/Text";
import { useAppTheme } from "../theme";

export const FINANCIAL_GUIDANCE_DISCLOSURE =
  "Informational only. Not financial advice. Not a recommendation to buy, sell, or hold any security.";

export function FinancialGuidanceNotice({ compact = false }: { compact?: boolean }) {
  const theme = useAppTheme();
  return (
    <View
      accessibilityRole="summary"
      style={[
        styles.wrap,
        {
          backgroundColor: theme.colors.tertiaryContainer,
          borderColor: theme.colors.tertiary,
          padding: compact ? 10 : 13,
        },
      ]}
    >
      <MaterialCommunityIcons name="information-outline" size={18} color={theme.colors.onTertiaryContainer} />
      <Text style={[styles.copy, { color: theme.colors.onTertiaryContainer }]}>
        {FINANCIAL_GUIDANCE_DISCLOSURE}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
  },
  copy: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    fontFamily: "Inter_600SemiBold",
  },
});
