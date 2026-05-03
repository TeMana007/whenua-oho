import { View, Text } from "react-native";

export default function GroupScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F5F0E8", alignItems: "center", justifyContent: "center", gap: 16, padding: 24 }}>
      <Text style={{ fontSize: 48 }}>👥</Text>
      <Text style={{ fontFamily: "PlayfairDisplay_700Bold", fontSize: 28, color: "#04342C", textAlign: "center" }}>
        Class Group
      </Text>
      <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 15, color: "rgba(26,26,26,0.5)", textAlign: "center" }}>
        Class challenges and kaiako messages are coming soon.
      </Text>
    </View>
  );
}
