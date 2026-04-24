/**
 * Tier Selection Screen — shown BEFORE payment.
 * User picks Single / Premium / Group, then proceeds to Stripe payment sheet.
 * Prices are sourced from packages/shared/src/pricing.ts — never hardcoded here.
 */
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../../App";
import {
  TIER_DEFINITIONS,
  getPriceForRegion,
} from "@birthday-surprise/shared";
import type { Tier } from "@birthday-surprise/shared";
import { initStripePayment, presentStripePayment } from "../services/paymentService";
import { markExperiencePaid, trackEvent } from "../services/supabaseService";

type TierRoute = RouteProp<RootStackParamList, "TierSelection">;
type NavProp = StackNavigationProp<RootStackParamList, "TierSelection">;

const TIER_ORDER: Tier[] = ["single", "premium", "group"];

export const TierSelectionScreen: React.FC = () => {
  const route = useRoute<TierRoute>();
  const navigation = useNavigation<NavProp>();
  const { output, input, experienceId } = route.params;

  const [selectedTier, setSelectedTier] = useState<Tier>("single");
  const [paying, setPaying] = useState(false);

  const regionPrices = getPriceForRegion(input.region ?? "north_america");

  const handleUnlock = async () => {
    setPaying(true);
    try {
      await trackEvent(experienceId, "payment_started", { tier: selectedTier });

      // 1. Create payment intent server-side
      await initStripePayment(experienceId, selectedTier, input.region ?? "north_america");

      // 2. Present Stripe payment sheet
      const success = await presentStripePayment();
      if (!success) {
        Alert.alert("Payment cancelled", "You can unlock anytime.");
        return;
      }

      // 3. Mark as paid in Supabase
      const { error } = await markExperiencePaid(experienceId, selectedTier);
      if (error) throw new Error(error);

      await trackEvent(experienceId, "payment_success", { tier: selectedTier });

      navigation.replace("SurpriseExperience", {
        output,
        experienceId,
        unlocked: true,
        relationship: input.relationship,
        tier: selectedTier,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      Alert.alert("Unlock failed", msg);
    } finally {
      setPaying(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 24, paddingBottom: 48 }}>
      <Text className="text-2xl font-bold text-gray-900 mb-1">
        Unlock the full surprise
      </Text>
      <Text className="text-sm text-gray-500 mb-6">
        Choose what works for this moment.
      </Text>

      {TIER_ORDER.map((tier) => {
        const def = TIER_DEFINITIONS[tier];
        const displayPrice = regionPrices.display[tier];
        const isSelected = selectedTier === tier;

        return (
          <TouchableOpacity
            key={tier}
            onPress={() => setSelectedTier(tier)}
            activeOpacity={0.8}
            className={`mb-3 rounded-2xl border-2 p-4 ${
              isSelected
                ? "border-pink-500 bg-pink-50"
                : "border-gray-200 bg-white"
            }`}
          >
            <View className="flex-row justify-between items-start mb-2">
              <View className="flex-1 mr-4">
                <Text
                  className={`text-base font-bold ${
                    isSelected ? "text-pink-700" : "text-gray-900"
                  }`}
                >
                  {def.label}
                </Text>
                <Text className="text-xs text-gray-500 mt-0.5">{def.tagline}</Text>
              </View>
              <Text
                className={`text-lg font-bold ${
                  isSelected ? "text-pink-600" : "text-gray-700"
                }`}
              >
                {displayPrice}
              </Text>
            </View>

            <View className="mt-1">
              {def.features.map((feature) => (
                <View key={feature} className="flex-row items-start mb-1">
                  <Text className="text-pink-400 mr-1.5 text-xs mt-0.5">✓</Text>
                  <Text className="text-xs text-gray-600 flex-1">{feature}</Text>
                </View>
              ))}
            </View>

            {isSelected && (
              <View className="mt-2 items-end">
                <View className="bg-pink-500 rounded-full px-2 py-0.5">
                  <Text className="text-white text-xs font-semibold">Selected</Text>
                </View>
              </View>
            )}
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity
        onPress={handleUnlock}
        disabled={paying}
        className={`rounded-2xl py-4 items-center mt-4 ${
          paying ? "bg-green-300" : "bg-green-500"
        }`}
        activeOpacity={0.85}
      >
        {paying ? (
          <View className="flex-row items-center">
            <ActivityIndicator color="white" size="small" />
            <Text className="text-white font-bold text-lg ml-2">Processing…</Text>
          </View>
        ) : (
          <Text className="text-white font-bold text-lg">
            Unlock {TIER_DEFINITIONS[selectedTier].label} →{" "}
            {regionPrices.display[selectedTier]}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.goBack()}
        className="border border-gray-200 rounded-2xl py-3 items-center mt-3"
        activeOpacity={0.75}
      >
        <Text className="text-gray-500 text-sm">← Back to preview</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};
