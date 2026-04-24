import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import * as Haptics from "expo-haptics";
import type { InteractiveElementType } from "@birthday-surprise/shared";
import { trackEvent } from "../services/supabaseService";

interface Props {
  interaction: {
    type: InteractiveElementType;
    prompt: string;
    options?: string[];
    revealText: string;
  };
  experienceId: string;
  onComplete: () => void;
}

export const InteractionCard: React.FC<Props> = ({
  interaction,
  experienceId,
  onComplete,
}) => {
  const [revealed, setRevealed] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  const handleReveal = () => {
    if (revealed) return;
    setRevealed(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    trackEvent(experienceId, "interaction_completed", {
      type: interaction.type,
    });
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
    onComplete();
  };

  const renderPrompt = () => {
    switch (interaction.type) {
      case "tap_reveal":
        return (
          <TouchableOpacity
            onPress={handleReveal}
            style={styles.tapButton}
            activeOpacity={0.8}
          >
            <Text style={styles.tapButtonText}>{interaction.prompt}</Text>
          </TouchableOpacity>
        );

      case "mini_quiz":
      case "choice_path":
        return (
          <View>
            <Text style={styles.quizPrompt}>{interaction.prompt}</Text>
            {(interaction.options ?? []).length > 0 ? (
              (interaction.options ?? []).map((opt, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={handleReveal}
                  style={styles.optionButton}
                  activeOpacity={0.75}
                >
                  <Text style={styles.optionText}>{opt}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <TouchableOpacity
                onPress={handleReveal}
                style={styles.tapButton}
                activeOpacity={0.8}
              >
                <Text style={styles.tapButtonText}>Tap to reveal</Text>
              </TouchableOpacity>
            )}
          </View>
        );

      case "countdown_reveal":
        return (
          <TouchableOpacity
            onPress={handleReveal}
            style={styles.countdownButton}
            activeOpacity={0.8}
          >
            <Text style={styles.countdownText}>{interaction.prompt}</Text>
          </TouchableOpacity>
        );

      default:
        return (
          <TouchableOpacity onPress={handleReveal} style={styles.tapButton}>
            <Text style={styles.tapButtonText}>{interaction.prompt}</Text>
          </TouchableOpacity>
        );
    }
  };

  return (
    <View style={styles.card}>
      {!revealed ? (
        renderPrompt()
      ) : (
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.revealText}>{interaction.revealText}</Text>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 16,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  tapButton: {
    backgroundColor: "#ec4899",
    borderRadius: 50,
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignItems: "center",
    alignSelf: "center",
  },
  tapButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  quizPrompt: {
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 14,
    color: "#111827",
  },
  optionButton: {
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 15,
    color: "#374151",
  },
  countdownButton: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  countdownText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  revealText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    lineHeight: 26,
  },
});
