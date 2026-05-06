import { useEffect, useState } from "react";
import { View, Text, Pressable, Linking } from "react-native";
import { router } from "expo-router";
import { createSupabaseClient } from "@korero/data";
import { KoruSpinner } from "@korero/ui";

/**
 * Root entry point — immediately redirects based on auth state.
 * Shows the Koru spinner while Supabase resolves the session.
 * If no session: shows a prompt to sign in via the web app.
 */
export default function IndexScreen() {
  const [noAuth, setNoAuth] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const supabase = createSupabaseClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          router.replace("/(tabs)");
        } else {
          setNoAuth(true);
        }
      } catch {
        setNoAuth(true);
      }
    })();
  }, []);

  if (noAuth) {
    return (
      <View style={{
        flex: 1,
        backgroundColor: "#04342C",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        gap: 24,
      }}>
        <KoruSpinner size={56} color="#C8A951" />
        <Text style={{
          fontFamily: "PlayfairDisplay_700Bold",
          fontSize: 26,
          color: "#F5F0E8",
          textAlign: "center",
          lineHeight: 32,
        }}>
          Kia ora!
        </Text>
        <Text style={{
          fontFamily: "DMSans_400Regular",
          fontSize: 15,
          color: "rgba(245,240,232,0.65)",
          textAlign: "center",
          lineHeight: 22,
        }}>
          Sign in via the Kōrero Companion web app first, then return here to continue your practice.
        </Text>
        <Pressable
          onPress={() => Linking.openURL("https://korero-companion.vercel.app/auth/login")}
          style={{
            backgroundColor: "#C8A951",
            borderRadius: 16,
            height: 56,
            paddingHorizontal: 32,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontFamily: "DMSans_700Bold", fontSize: 16, color: "#04342C" }}>
            Sign in on the web →
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#04342C", alignItems: "center", justifyContent: "center" }}>
      <KoruSpinner size={72} color="#C8A951" />
    </View>
  );
}
