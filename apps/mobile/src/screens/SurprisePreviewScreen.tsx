/**
 * Surprise Preview Screen.
 * Shows a blurred preview of the experience.
 * Navigates to TierSelectionScreen for payment.
 * Pricing comes from packages/shared/src/pricing.ts only.
 */
import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { BlurView } from "expo-blur";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../../App";
import { trackEvent } from "../services/supabaseService";
import { TIER_DEFINITIONS } from "@birthday-surprise/shared";

type PreviewRoute = RouteProp<RootStackParamList, "SurprisePreview">;
type NavProp = StackNavigationProp<RootStackParamList, "SurprisePreview">;

export const SurprisePreviewScreen: React.FC = () => {
  const route = useRoute<PreviewRoute>();
  const navigation = useNavigation<NavProp>();
  const { output, input, experienceId } = route.params;
  const isMounted = useRef(true);
  useEffect(() => () => { isMounted.current = false; }, []);

  useEffect(() => {
    void trackEvent(experienceId, "preview_viewed");
  }, [experienceId]);

  const handleGoToTiers = () => {
    navigation.navigate("TierSelection", {
      output,
      input,
      experienceId,
      qualityFlag: false,
    });
  };

  // Show starting price from pricing.ts — never hardcoded
  const startingPrice = TIER_DEFINITIONS.single.displayUSD;

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Blurred preview */}
      <View style={styles.previewContainer}>
        <View style={styles.previewContent} pointerEvents="none">
          <Text style={styles.previewHeadline}>{output.hero.headline}</Text>
          <Text style={styles.previewSub}>{output.hero.subheadline}</Text>
          <View style={styles.previewCard}>
            <Text style={styles.previewCardTitle}>
              ✨ {output.memoryMoment.title}
            </Text>
            <Text style={styles.previewCardBody}>{output.memoryMoment.body}</Text>
          </View>
          <View style={styles.previewWish}>
            <Text style={styles.previewWishText}>{output.finalWish.message}</Text>
          </View>
        </View>
        <BlurView
          intensity={40}
          tint="light"
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        />
        <View style={styles.watermark} pointerEvents="none">
          <Text style={styles.watermarkText}>🔒 Preview</Text>
        </View>
      </View>

      {/* Unlock CTA */}
      <View className="p-6 pt-4">
        <Text className="text-center text-2xl font-bold text-gray-900 mb-2">
          Unlock the full surprise
        </Text>
        <Text className="text-center text-gray-500 mb-2 text-base">
          Permanent share link, full experience, shareable & remixable.
        </Text>
        <Text className="text-center text-gray-400 text-sm mb-6">
          Starting from {startingPrice}
        </Text>

        <TouchableOpacity
          onPress={handleGoToTiers}
          className="rounded-2xl py-4 items-center mb-3 bg-green-500"
          activeOpacity={0.85}
        >
          <Text className="text-white font-bold text-lg">
            Choose a plan →
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="border border-gray-200 rounded-2xl py-3 items-center"
          activeOpacity={0.75}
        >
          <Text className="text-gray-500 text-sm">← Edit inputs</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  previewContainer: {
    position: "relative",
    overflow: "hidden",
    margin: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  previewContent: {
    padding: 20,
    backgroundColor: "#fff",
  },
  previewHeadline: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 6,
  },
  previewSub: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 16,
  },
  previewCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  previewCardTitle: {
    fontWeight: "600",
    marginBottom: 4,
    fontSize: 15,
  },
  previewCardBody: {
    color: "#374151",
    fontSize: 14,
  },
  previewWish: {
    backgroundColor: "#fce7f3",
    borderRadius: 12,
    padding: 14,
  },
  previewWishText: {
    fontStyle: "italic",
    color: "#6b7280",
    fontSize: 14,
  },
  watermark: {
    position: "absolute",
    top: "40%",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  watermarkText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    opacity: 0.6,
    backgroundColor: "rgba(255,255,255,0.6)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    overflow: "hidden",
  },
});
