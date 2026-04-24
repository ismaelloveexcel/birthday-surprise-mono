"use client";
import { trackEvent } from "../lib/analytics";

interface Props {
  senderName: string;
  experienceId: string;
  baseUrl?: string;
}

/**
 * "Make One For Me" CTA — visible on ALL viewer states (paid, unpaid, locked).
 * Every experience recipient is a potential buyer.
 * Tapping deep-links to the mobile app; falls back to app store if not installed.
 */
export const MakeOneForMeCTA: React.FC<Props> = ({
  senderName,
  experienceId,
  baseUrl = "",
}) => {
  const handleClick = async () => {
    // Fire-and-forget analytics
    void trackEvent(experienceId, "remix_clicked", { source: "make_one_cta" });

    // Deep link: open mobile app with senderName pre-filled as recipientName
    const params = new URLSearchParams({ senderName });
    const deepLink = `birthdaysurprise://create?${params.toString()}`;

    // Try opening the app
    window.location.href = deepLink;

    // After 900ms assume app not installed → redirect to app store
    await new Promise<void>((resolve) => setTimeout(resolve, 900));

    if (!document.hidden) {
      // Page is still visible → app didn't open → show store
      const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
      const storeUrl = isIOS
        ? "https://apps.apple.com/app/birthday-surprise/id0000000000"
        : "https://play.google.com/store/apps/details?id=com.birthdaysurprise.app";
      window.location.href = storeUrl;
    }
  };

  return (
    <div className="sticky bottom-0 w-full px-4 pb-safe pt-3 bg-gradient-to-t from-white via-white to-transparent">
      <button
        onClick={handleClick}
        className="w-full bg-pink-500 hover:bg-pink-600 active:bg-pink-700 transition-colors
                   text-white font-bold text-base py-4 rounded-2xl shadow-lg shadow-pink-200
                   flex items-center justify-center gap-2"
      >
        <span>✨</span>
        <span>Someone made this for you. Make one for someone you love →</span>
      </button>
    </div>
  );
};
