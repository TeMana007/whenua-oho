import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

interface TabConfig {
  name: string;
  title: string;
  icon: IoniconName;
  iconFocused: IoniconName;
}

const TABS: TabConfig[] = [
  { name: "index",    title: "Home",     icon: "home-outline",        iconFocused: "home" },
  { name: "korero",   title: "Kōrero",   icon: "mic-outline",         iconFocused: "mic" },
  { name: "review",   title: "Review",   icon: "book-outline",        iconFocused: "book" },
  { name: "group",    title: "Group",    icon: "people-outline",      iconFocused: "people" },
  { name: "progress", title: "Progress", icon: "stats-chart-outline", iconFocused: "stats-chart" },
];

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle:      { backgroundColor: "#04342C" },
        headerTintColor:  "#F5F0E8",
        headerTitleStyle: { fontFamily: "PlayfairDisplay_700Bold", fontSize: 18 },
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "rgba(26,26,26,0.08)",
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor:   "#04342C",
        tabBarInactiveTintColor: "rgba(26,26,26,0.35)",
        tabBarLabelStyle: {
          fontFamily: "DMSans_400Regular",
          fontSize: 10,
          marginTop: 2,
        },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={focused ? tab.iconFocused : tab.icon}
                size={size ?? 22}
                color={color}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
