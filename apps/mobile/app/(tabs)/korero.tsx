import { View, Text } from "react-native";
import { KoruSpinner } from "@korero/ui";

export default function KoreroScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F5F0E8", alignItems: "center", justifyContent: "center", gap: 16, padding: 24 }}>
      <Text style={{ fontSize: 48 }}>🎙️</Text>
      <Text style={{ fontFamily: "PlayfairDisplay_700Bold", fontSize: 28, color: "#04342C", textAlign: "center" }}>
        Kōrero Practice
      </Text>
      <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 15, color: "rgba(26,26,26,0.5)", textAlign: "center" }}>
        Speaking practice is coming soon.
      </Text>
    </View>
  );
}
