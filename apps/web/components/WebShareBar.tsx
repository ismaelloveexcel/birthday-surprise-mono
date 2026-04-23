"use client";
import { useState } from "react";
import { trackEvent } from "../lib/analytics";

interface Props {
  shareCaption: string;
  shareUrl: string;
  experienceId: string;
}

export const WebShareBar: React.FC<Props> = ({
  shareCaption,
  shareUrl,
  experienceId,
}) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    await trackEvent(experienceId, "share_clicked", { platform: "web_native" });
    if (navigator.share) {
      await navigator.share({ title: "Birthday Surprise", text: shareCaption, url: shareUrl });
    } else {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    await trackEvent(experienceId, "share_clicked", { platform: "copy" });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-4 mb-4 p-4 bg-gray-50 rounded-2xl">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider text-center mb-3">
        Share this surprise
      </p>
      <div className="flex gap-2">
        <button
          onClick={handleShare}
          className="flex-1 bg-green-500 hover:bg-green-600 transition text-white font-semibold py-2.5 rounded-xl text-sm"
        >
          ⬆️ Share
        </button>
        <button
          onClick={handleCopy}
          className="flex-1 bg-gray-200 hover:bg-gray-300 transition text-gray-700 font-semibold py-2.5 rounded-xl text-sm"
        >
          {copied ? "✓ Copied!" : "🔗 Copy link"}
        </button>
      </div>
    </div>
  );
};
