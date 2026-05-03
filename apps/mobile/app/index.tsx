import { useEffect } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { createSupabaseClient } from "@korero/data";
import { KoruSpinner } from "@korero/ui";

/**
 * Root entry point — immediately redirects based on auth state.
 * Shows the Koru spinner while Supabase resolves the session.
 */
export default function IndexScreen() {
  useEffect(() => {
    (async () => {
      const supabase = createSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace("/(tabs)");
      } else {
        // Auth screens not built yet — stay on this screen
        // TODO: router.replace("/auth/login");
      }
    })();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#04342C", alignItems: "center", justifyContent: "center" }}>
      <KoruSpinner size={72} color="#C8A951" />
    </View>
  );
}
