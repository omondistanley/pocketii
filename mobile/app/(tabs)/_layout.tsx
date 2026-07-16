import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useAppTheme } from "../../src/theme";

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

function tabIcon(name: IconName) {
  return ({ color, focused }: { color: string; focused: boolean }) => (
    <MaterialCommunityIcons name={name} size={focused ? 25 : 23} color={color} />
  );
}

export default function TabLayout() {
  const theme = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outlineVariant,
          height: 68,
          paddingBottom: 7,
          paddingTop: 7,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: "Inter_700Bold",
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Overview", tabBarIcon: tabIcon("view-dashboard-outline") }} />
      <Tabs.Screen name="transactions" options={{ title: "Transactions", tabBarIcon: tabIcon("receipt-text-outline") }} />
      <Tabs.Screen name="budgets" options={{ title: "Plan", tabBarIcon: tabIcon("target") }} />
      <Tabs.Screen name="investments" options={{ title: "Invest", tabBarIcon: tabIcon("chart-line") }} />
      <Tabs.Screen name="more" options={{ title: "More", tabBarIcon: tabIcon("dots-horizontal") }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
    </Tabs>
  );
}
