"use client";
import { useState } from "react";
import { trackEvent } from "../lib/analytics";

interface Props {
  remixHook: string;
  vibe: string;
  relationship: string;
  experienceId: string;
}

export const WebRemixBar: React.FC<Props> = ({
  remixHook,
  vibe,
  relationship,
  experienceId,
}) => {
  const [showFallback, setShowFallback] = useState(false);

  const handleRemix = async () => {
    await trackEvent(experienceId, "remix_clicked");
    const params = new URLSearchParams({ vibe, relationship });
    const deepLink = `birthdaysurprise://create?${params.toString()}`;
    window.location.href = deepLink;
    // Show a gentle inline prompt if the app isn't installed;
    // hide it if the page loses visibility (app opened successfully).
    const timeout = setTimeout(() => setShowFallback(true), 800);
    const cancel = () => {
      clearTimeout(timeout);
      document.removeEventListener("visibilitychange", cancel);
    };
    document.addEventListener("visibilitychange", cancel);
  };

  return (
    <div className="mx-4 mb-4 p-5 bg-gray-900 rounded-2xl text-center">
      <p className="text-gray-400 text-sm mb-3">{remixHook}</p>
      <button
        onClick={handleRemix}
        className="bg-pink-500 hover:bg-pink-600 transition text-white font-bold py-2.5 px-7 rounded-full text-sm"
      >
        ✨ Remix this vibe
      </button>
      {showFallback && (
        <p className="text-gray-400 text-xs mt-3">
          Get the Birthday Surprise app to remix this experience.
        </p>
      )}
    </div>
  );
};
