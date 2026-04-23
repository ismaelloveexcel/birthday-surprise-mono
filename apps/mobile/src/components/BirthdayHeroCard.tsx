import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { CURATED_PALETTES } from "@birthday-surprise/shared";

interface Props {
  hero: {
    headline: string;
    subheadline: string;
    introLine: string;
  };
  visualStyleId: string;
}

export const BirthdayHeroCard: React.FC<Props> = ({ hero, visualStyleId }) => {
  const paletteKey =
    visualStyleId === "soft-party"
      ? "cake-pop"
      : visualStyleId === "night-glow"
      ? "midnight-neon"
      : visualStyleId === "scrapbook-pop"
      ? "memory-collage"
      : "gold-rose";

  const palette = CURATED_PALETTES[paletteKey] ?? CURATED_PALETTES["cake-pop"];

  return (
    <View
      style={[styles.container, { backgroundColor: palette.bg }]}
    >
      <Text style={[styles.headline, { color: palette.text }]}>
        {hero.headline}
      </Text>
      <Text style={[styles.subheadline, { color: palette.accent }]}>
        {hero.subheadline}
      </Text>
      <Text style={[styles.introLine, { color: palette.text }]}>
        {hero.introLine}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 32,
    alignItems: "center",
  },
  headline: {
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 38,
  },
  subheadline: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 12,
  },
  introLine: {
    fontSize: 15,
    fontStyle: "italic",
    textAlign: "center",
    opacity: 0.75,
  },
});
