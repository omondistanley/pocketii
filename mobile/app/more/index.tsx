import React, { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Screen } from "../../src/components/ui/Screen";
import { Text } from "../../src/components/ui/Text";
import { Card } from "../../src/components/ui/Card";
import { useAppTheme, type AppTheme } from "../../src/theme";

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

export default function MoreScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const Item = ({ title, subtitle, href, icon }: { title: string; subtitle: string; href: string; icon: IconName }) => (
    <Pressable style={({ pressed }) => [styles.item, pressed && styles.itemPressed]} onPress={() => router.push(href)}>
      <View style={styles.iconTile}><MaterialCommunityIcons name={icon} size={20} color={theme.colors.primary} /></View>
      <View style={styles.itemCopy}><Text style={styles.itemText}>{title}</Text><Text style={styles.itemSub}>{subtitle}</Text></View>
      <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.onSurfaceVariant} />
    </Pressable>
  );

  return (
    <Screen>
      <Text variant="headline" style={styles.title}>More</Text>
      <Text style={styles.subtitle}>Accounts, planning tools, guidance, reports, and settings.</Text>
      <Card variant="container">
        <Text variant="label" uppercase color={theme.colors.onSurfaceVariant}>Money</Text>
        <Item title="Accounts" subtitle="Balances and net worth" href="/net-worth" icon="bank-outline" />
        <Item title="Cash Flow" subtitle="Income, spending, and savings" href="/analytics" icon="chart-timeline-variant" />
        <Item title="Recurring" subtitle="Bills and expected income" href="/recurring" icon="calendar-sync" />
        <Item title="Goals" subtitle="Savings priorities" href="/goals" icon="target" />
      </Card>
      <Card variant="container">
        <Text variant="label" uppercase color={theme.colors.onSurfaceVariant}>Understand</Text>
        <Item title="Guidance" subtitle="Informational recommendations only" href="/recommendations" icon="compass-outline" />
        <Item title="Insights & Reports" subtitle="Forecasts, anomalies, and exports" href="/insights" icon="chart-box-outline" />
        <Item title="Household" subtitle="Shared workspace and members" href="/household" icon="account-group-outline" />
      </Card>
      <Card variant="container">
        <Text variant="label" uppercase color={theme.colors.onSurfaceVariant}>Manage</Text>
        <Item title="Settings" subtitle="Preferences and connections" href="/settings" icon="cog-outline" />
        <Item title="Security" subtitle="Sessions and privacy" href="/security" icon="shield-check-outline" />
        <Item title="Notifications" subtitle="Alerts and updates" href="/notifications" icon="bell-outline" />
      </Card>
    </Screen>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    title: { marginBottom: 4 },
    subtitle: { color: theme.colors.onSurfaceVariant, marginBottom: 14, fontSize: 13 },
    item: { minHeight: 64, borderBottomWidth: 1, borderBottomColor: theme.colors.outlineVariant, flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 },
    itemPressed: { opacity: 0.72 },
    iconTile: { width: 38, height: 38, borderRadius: 10, backgroundColor: theme.colors.primaryContainer, alignItems: "center", justifyContent: "center" },
    itemCopy: { flex: 1 },
    itemText: { fontSize: 14, fontFamily: "Inter_700Bold", color: theme.colors.onSurface },
    itemSub: { fontSize: 11, color: theme.colors.onSurfaceVariant, marginTop: 2 },
  });
}
