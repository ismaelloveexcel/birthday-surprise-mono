"use client";
import { useEffect, useState, useRef } from "react";
import confetti from "canvas-confetti";
import type { StoredExperience } from "@birthday-surprise/shared";
import { trackEvent } from "../lib/analytics";
import { WebBirthdayHeroCard } from "./WebBirthdayHeroCard";
import { WebInteractionCard } from "./WebInteractionCard";
import { WebMemoryMomentCard } from "./WebMemoryMomentCard";
import { WebFinalWishCard } from "./WebFinalWishCard";
import { WebShareBar } from "./WebShareBar";
import { WebRemixBar } from "./WebRemixBar";
import { MakeOneForMeCTA } from "./MakeOneForMeCTA";

interface Props {
  experience: StoredExperience;
  shareUrl: string;
  isTimeGated: boolean;
  secondsUntilUnlock: number;
}

export const ExperienceView: React.FC<Props> = ({
  experience,
  shareUrl,
  isTimeGated,
  secondsUntilUnlock,
}) => {
  const [timeLeft, setTimeLeft] = useState(secondsUntilUnlock);
  const confettiFired = useRef(false);

  // Track experience_opened — fire-and-forget
  useEffect(() => {
    void trackEvent(experience.id, "experience_opened");
  }, [experience.id]);

  // Confetti — once per session only, never on locked/blurred experiences
  useEffect(() => {
    if (!experience.paid || isTimeGated || confettiFired.current) return;
    const sessionKey = `confetti_shown_${experience.id}`;
    if (typeof window !== "undefined" && !sessionStorage.getItem(sessionKey)) {
      sessionStorage.setItem(sessionKey, "1");
      confettiFired.current = true;
      setTimeout(() => {
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.5 } });
      }, 400);
    }
  }, [experience.id, experience.paid, isTimeGated]);

  // Countdown timer for scheduled delivery
  useEffect(() => {
    if (!isTimeGated || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          // Reload to reveal content once time is up
          window.location.reload();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimeGated, timeLeft]);

  const formatCountdown = (secs: number): string => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "";

  // ─── Time-gated: show countdown ───────────────────────────────────────────
  if (isTimeGated) {
    return (
      <main className="max-w-md mx-auto bg-white min-h-screen pb-4 flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-16 text-center">
          <div className="text-5xl mb-6">⏳</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Something special is coming…
          </h1>
          <p className="text-gray-500 mb-8">
            This experience unlocks in
          </p>
          <div className="bg-pink-50 border border-pink-100 rounded-2xl px-10 py-6 mb-8">
            <span className="text-4xl font-mono font-bold text-pink-600 tabular-nums">
              {formatCountdown(timeLeft)}
            </span>
          </div>
          <p className="text-sm text-gray-400">
            Come back when the time is right 🎂
          </p>
        </div>
        {/* Make One For Me — visible even on locked */}
        <MakeOneForMeCTA
          senderName={experience.recipient_name}
          experienceId={experience.id}
          baseUrl={baseUrl}
        />
      </main>
    );
  }

  // ─── Unpaid: blurred preview + lock overlay ───────────────────────────────
  if (!experience.paid) {
    return (
      <main className="max-w-md mx-auto bg-white min-h-screen pb-4 flex flex-col">
        <div className="relative overflow-hidden m-4 rounded-3xl border border-gray-100 flex-1">
          {/* Blurred content beneath */}
          <div className="pointer-events-none select-none blur-md opacity-60 p-6">
            <WebBirthdayHeroCard
              hero={experience.output.hero}
              visualStyleId={experience.output.visualStyleId}
              paletteId={experience.output.paletteId}
            />
            <div className="bg-gray-50 rounded-2xl p-5 my-4">
              <p className="font-bold text-gray-800 mb-2">
                {experience.output.memoryMoment.title}
              </p>
              <p className="text-gray-600 text-sm">
                {experience.output.memoryMoment.body}
              </p>
            </div>
          </div>
          {/* Lock overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm p-8 text-center">
            <div className="text-4xl mb-4">🔒</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              This experience is locked
            </h2>
            <p className="text-sm text-gray-500">
              The creator hasn&apos;t unlocked this yet. Check back soon.
            </p>
          </div>
        </div>
        {/* Make One For Me — always visible */}
        <MakeOneForMeCTA
          senderName={experience.recipient_name}
          experienceId={experience.id}
          baseUrl={baseUrl}
        />
      </main>
    );
  }

  // ─── Paid: full experience ─────────────────────────────────────────────────
  return (
    <main className="max-w-md mx-auto bg-white min-h-screen pb-4">
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

      {/* Make One For Me — always at the bottom, full-width, sticky */}
      <MakeOneForMeCTA
        senderName={experience.recipient_name}
        experienceId={experience.id}
        baseUrl={baseUrl}
      />
    </main>
  );
};
