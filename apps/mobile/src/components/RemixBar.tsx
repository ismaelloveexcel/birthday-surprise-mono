import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../../App";
import { trackEvent } from "../services/supabaseService";

type NavProp = StackNavigationProp<RootStackParamList, "SurpriseExperience">;

interface Props {
  remixHook: string;
  vibe: string;
  relationship: string;
  experienceId: string;
}

export const RemixBar: React.FC<Props> = ({
  remixHook,
  experienceId,
}) => {
  const navigation = useNavigation<NavProp>();

  const handleRemix = async () => {
    void trackEvent(experienceId, "remix_clicked");
    // Navigate directly to the create screen — we're already in the app
    navigation.navigate("CreateSurprise");
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
