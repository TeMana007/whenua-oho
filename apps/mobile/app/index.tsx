import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-4xl font-bold text-tangaroa-800">
          Kōrero Companion
        </Text>
        <Text className="mt-4 text-lg text-gray-600 text-center">
          AI-powered te reo Māori conversation practice
        </Text>
      </View>
    </SafeAreaView>
  );
}
