import React from "react";
import { StyleSheet, View } from "react-native";
import { InvestmentsOverviewBody } from "../../src/screens/InvestmentsOverviewBody";
import { FinancialGuidanceNotice } from "../../src/components/FinancialGuidanceNotice";
import { useAppTheme } from "../../src/theme";

export default function InvestmentsTabScreen() {
  const theme = useAppTheme();
  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <View style={styles.notice}><FinancialGuidanceNotice compact /></View>
      <InvestmentsOverviewBody />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  notice: { paddingHorizontal: 16, paddingTop: 8 },
});
