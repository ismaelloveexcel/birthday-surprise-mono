"use client";
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
  const handleRemix = async () => {
    await trackEvent(experienceId, "remix_clicked");
    const params = new URLSearchParams({ vibe, relationship });
    const deepLink = `birthdaysurprise://create?${params.toString()}`;
    window.location.href = deepLink;
    // Fallback: if deep link didn't open the app after 600ms, show message
    setTimeout(() => {
      alert("Open the Birthday Surprise app to remix this experience!");
    }, 600);
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
    </div>
  );
};
