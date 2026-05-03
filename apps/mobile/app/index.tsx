import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Button, KoruSpinner } from "@korero/ui";

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-secondary">
      <View className="flex-1 items-center justify-center px-6 gap-6">
        <KoruSpinner size={64} color="#04342C" />

        <View className="items-center gap-2">
          <Text variant="h1" color="primary">Kōrero</Text>
          <Text variant="h2" color="primary">Companion</Text>
        </View>

        <Text variant="body" color="muted" className="text-center">
          AI-powered te reo Māori conversation practice
        </Text>

        <View className="w-full gap-3 mt-4">
          <Button label="Tomo mai — Sign in" variant="primary" fullWidth />
          <Button label="Hono mai — Join"    variant="secondary" fullWidth />
        </View>
      </View>
    </SafeAreaView>
  );
}
