import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { SurpriseInputSchema, VIBES } from "@birthday-surprise/shared";
import type { SurpriseInput, SurpriseVibe } from "@birthday-surprise/shared";
import { generateBirthdaySurprise } from "../services/surpriseGenerationService";
import { saveExperience, trackEvent } from "../services/supabaseService";
import type { RootStackParamList } from "../../App";

type NavProp = StackNavigationProp<RootStackParamList, "CreateSurprise">;

const VIBE_LABELS: Record<SurpriseVibe, string> = {
  funny: "😂 Funny",
  emotional: "🥺 Emotional",
  playful: "🎉 Playful",
  warm: "🤗 Warm",
  bold: "🔥 Bold",
  chaotic: "🌀 Chaotic",
};

export const CreateSurpriseScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const [input, setInput] = useState<SurpriseInput>({
    recipientName: "",
    relationship: "",
    vibe: "warm",
    memoryNote: "",
  });
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    const parsed = SurpriseInputSchema.safeParse(input);
    if (!parsed.success) {
      const first = parsed.error.errors[0]?.message ?? "Please fill in all fields.";
      Alert.alert("Missing info", first);
      return;
    }

    setLoading(true);
    try {
      const output = await generateBirthdaySurprise(parsed.data);
      const { id, error } = await saveExperience(output, parsed.data);
      if (error || !id) throw new Error(error ?? "Could not save experience");
      await trackEvent(id, "experience_generated");
      navigation.navigate("SurprisePreview", {
        output,
        input: parsed.data,
        experienceId: id,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      Alert.alert("Generation failed", msg + "\n\nCheck your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        className="flex-1 bg-white"
        contentContainerStyle={{ padding: 24, paddingBottom: 48 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-3xl font-bold text-gray-900 mb-1">
          Make it unforgettable.
        </Text>
        <Text className="text-base text-gray-500 mb-8">
          One memory. One tap. A birthday they'll actually remember.
        </Text>

        {/* Recipient name */}
        <View className="mb-5">
          <Text className="text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
            Who is this for?
          </Text>
          <TextInput
            className="border border-gray-200 rounded-2xl px-4 py-3.5 text-base text-gray-900 bg-gray-50"
            placeholder="Their name"
            placeholderTextColor="#9ca3af"
            value={input.recipientName}
            onChangeText={(t) => setInput({ ...input, recipientName: t })}
            autoCapitalize="words"
            returnKeyType="next"
          />
        </View>

        {/* Relationship */}
        <View className="mb-5">
          <Text className="text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
            Your relationship
          </Text>
          <TextInput
            className="border border-gray-200 rounded-2xl px-4 py-3.5 text-base text-gray-900 bg-gray-50"
            placeholder="e.g. best friend, wife, brother"
            placeholderTextColor="#9ca3af"
            value={input.relationship}
            onChangeText={(t) => setInput({ ...input, relationship: t })}
            autoCapitalize="none"
            returnKeyType="next"
          />
        </View>

        {/* Vibe picker */}
        <View className="mb-5">
          <Text className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
            Pick a vibe
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {VIBES.map((vibe) => (
              <TouchableOpacity
                key={vibe}
                onPress={() => setInput({ ...input, vibe })}
                className={`px-4 py-2 rounded-full border ${
                  input.vibe === vibe
                    ? "bg-pink-500 border-pink-500"
                    : "bg-white border-gray-200"
                }`}
                activeOpacity={0.75}
              >
                <Text
                  className={`text-sm font-medium ${
                    input.vibe === vibe ? "text-white" : "text-gray-700"
                  }`}
                >
                  {VIBE_LABELS[vibe]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Memory note */}
        <View className="mb-8">
          <Text className="text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
            One memory or inside joke
          </Text>
          <TextInput
            className="border border-gray-200 rounded-2xl px-4 py-3.5 text-base text-gray-900 bg-gray-50"
            style={{ minHeight: 100, textAlignVertical: "top" }}
            placeholder="That karaoke night, the time they burned dinner, their obsession with bad movies…"
            placeholderTextColor="#9ca3af"
            multiline
            value={input.memoryNote}
            onChangeText={(t) => setInput({ ...input, memoryNote: t })}
          />
        </View>

        <TouchableOpacity
          onPress={handleGenerate}
          disabled={loading}
          className={`rounded-2xl py-4 items-center ${loading ? "bg-pink-300" : "bg-pink-500"}`}
          activeOpacity={0.85}
        >
          {loading ? (
            <View className="flex-row items-center gap-2">
              <ActivityIndicator color="white" size="small" />
              <Text className="text-white font-bold text-base ml-2">
                Creating magic…
              </Text>
            </View>
          ) : (
            <Text className="text-white font-bold text-lg">
              Generate Surprise ✨
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
