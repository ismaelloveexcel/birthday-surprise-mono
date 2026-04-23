import React, { useEffect, useRef, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import ConfettiCannon from "react-native-confetti-cannon";
import * as Haptics from "expo-haptics";
import type { RootStackParamList } from "../../App";
import { trackEvent, getShareUrl } from "../services/supabaseService";
import { BirthdayHeroCard } from "../components/BirthdayHeroCard";
import { InteractionCard } from "../components/InteractionCard";
import { MemoryMomentCard } from "../components/MemoryMomentCard";
import { FinalWishCard } from "../components/FinalWishCard";
import { ShareBar } from "../components/ShareBar";
import { RemixBar } from "../components/RemixBar";

type ExperienceRoute = RouteProp<RootStackParamList, "SurpriseExperience">;
type NavProp = StackNavigationProp<RootStackParamList, "SurpriseExperience">;

export const SurpriseExperienceScreen: React.FC = () => {
  const route = useRoute<ExperienceRoute>();
  const { output, experienceId, unlocked, relationship } = route.params;
  const confettiRef = useRef<ConfettiCannon>(null);
  const [wowFired, setWowFired] = useState(false);

  useEffect(() => {
    if (unlocked) {
      trackEvent(experienceId, "experience_opened");
    }
  }, [experienceId, unlocked]);

  const fireWowMoment = () => {
    if (wowFired) return;
    setWowFired(true);
    confettiRef.current?.start();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const shareUrl = getShareUrl(experienceId);

  if (!unlocked) {
    return (
      <View className="flex-1 justify-center items-center px-8">
        <Text className="text-center text-gray-500 text-base">
          This experience is locked. Unlock it from the preview screen.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ConfettiCannon
        ref={confettiRef}
        count={200}
        origin={{ x: -10, y: 0 }}
        fadeOut
        autoStart={false}
        explosionSpeed={400}
        fallSpeed={3000}
      />
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 48 }}
      >
        <BirthdayHeroCard
          hero={output.hero}
          visualStyleId={output.visualStyleId}
          paletteId={output.paletteId}
        />
        <InteractionCard
          interaction={output.interaction}
          experienceId={experienceId}
          onComplete={fireWowMoment}
        />
        <MemoryMomentCard memoryMoment={output.memoryMoment} />
        <FinalWishCard finalWish={output.finalWish} />
        <ShareBar
          shareCaption={output.share.socialCaption}
          shareUrl={shareUrl}
          experienceId={experienceId}
        />
        <RemixBar
          remixHook={output.share.remixHook}
          vibe={output.tone}
          relationship={relationship}
          experienceId={experienceId}
        />
      </ScrollView>
    </View>
  );
};
