"use client";
import { useEffect } from "react";
import type { StoredExperience } from "@birthday-surprise/shared";
import { trackEvent } from "../lib/analytics";
import { WebBirthdayHeroCard } from "./WebBirthdayHeroCard";
import { WebInteractionCard } from "./WebInteractionCard";
import { WebMemoryMomentCard } from "./WebMemoryMomentCard";
import { WebFinalWishCard } from "./WebFinalWishCard";
import { WebShareBar } from "./WebShareBar";
import { WebRemixBar } from "./WebRemixBar";

interface Props {
  experience: StoredExperience;
  shareUrl: string;
}

export const ExperienceView: React.FC<Props> = ({ experience, shareUrl }) => {
  useEffect(() => {
    trackEvent(experience.id, "experience_opened");
  }, [experience.id]);

  return (
    <main className="max-w-md mx-auto bg-white min-h-screen pb-12">
      <WebBirthdayHeroCard
        hero={experience.output.hero}
        visualStyleId={experience.output.visualStyleId}
        paletteId={experience.output.paletteId}
      />
      <WebInteractionCard
        interaction={experience.output.interaction}
        experienceId={experience.id}
      />
      <WebMemoryMomentCard memoryMoment={experience.output.memoryMoment} />
      <WebFinalWishCard finalWish={experience.output.finalWish} />
      {experience.unlocked ? (
        <>
          <WebShareBar
            shareCaption={experience.output.share.socialCaption}
            shareUrl={shareUrl}
            experienceId={experience.id}
          />
          <WebRemixBar
            remixHook={experience.output.share.remixHook}
            vibe={experience.output.tone}
            relationship={experience.relationship}
            experienceId={experience.id}
          />
        </>
      ) : (
        <div className="mx-4 p-4 bg-yellow-50 rounded-2xl text-center border border-yellow-100">
          <p className="text-yellow-800 text-sm">
            🔒 The creator hasn&apos;t unlocked this yet. Check back soon.
          </p>
        </div>
      )}
    </main>
  );
};
