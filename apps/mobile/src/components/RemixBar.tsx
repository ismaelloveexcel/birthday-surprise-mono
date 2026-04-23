import React from "react";
import { View, Text, TouchableOpacity, Linking, StyleSheet } from "react-native";
import { trackEvent } from "../services/supabaseService";

interface Props {
  remixHook: string;
  vibe: string;
  relationship: string;
  experienceId: string;
}

export const RemixBar: React.FC<Props> = ({
  remixHook,
  vibe,
  relationship,
  experienceId,
}) => {
  const handleRemix = async () => {
    await trackEvent(experienceId, "remix_clicked");
    const params = new URLSearchParams({
      vibe: vibe,
      relationship: relationship,
    });
    const deepLink = `birthdaysurprise://create?${params.toString()}`;
    Linking.openURL(deepLink).catch(() => {
      // No-op: user doesn't have the app open — that's fine on mobile since we're IN the app
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.hook}>{remixHook}</Text>
      <TouchableOpacity
        onPress={handleRemix}
        style={styles.button}
        activeOpacity={0.85}
      >
        <Text style={styles.buttonText}>✨ Remix this vibe</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    marginTop: 0,
    padding: 20,
    backgroundColor: "#111827",
    borderRadius: 20,
    alignItems: "center",
  },
  hook: {
    color: "#d1d5db",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#ec4899",
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 50,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
