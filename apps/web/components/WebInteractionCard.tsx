"use client";
import { useState } from "react";
import confetti from "canvas-confetti";
import { trackEvent } from "../lib/analytics";

interface Props {
  interaction: {
    type: string;
    prompt: string;
    options?: string[];
    revealText: string;
  };
  experienceId: string;
}

export const WebInteractionCard: React.FC<Props> = ({
  interaction,
  experienceId,
}) => {
  const [revealed, setRevealed] = useState(false);

  const handleReveal = () => {
    if (revealed) return;
    setRevealed(true);
    trackEvent(experienceId, "interaction_completed", { type: interaction.type });
    confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
  };

  const renderPrompt = () => {
    if (
      interaction.type === "mini_quiz" ||
      interaction.type === "choice_path"
    ) {
      const opts = interaction.options ?? [];
      return (
        <div>
          <p className="text-center font-semibold text-gray-800 mb-4 text-lg">
            {interaction.prompt}
          </p>
          {opts.length > 0 ? (
            opts.map((opt, i) => (
              <button
                key={i}
                onClick={handleReveal}
                className="block w-full bg-gray-100 hover:bg-pink-50 transition text-left p-3 rounded-xl mb-2 text-gray-700"
              >
                {opt}
              </button>
            ))
          ) : (
            <button
              onClick={handleReveal}
              className="bg-pink-500 hover:bg-pink-600 transition text-white font-bold py-3 px-8 rounded-full mx-auto block"
            >
              Tap to reveal
            </button>
          )}
        </div>
      );
    }
    return (
      <button
        onClick={handleReveal}
        className="bg-pink-500 hover:bg-pink-600 transition text-white font-bold py-3 px-8 rounded-full mx-auto block"
      >
        {interaction.prompt}
      </button>
    );
  };

  return (
    <div className="mx-4 my-4 bg-white rounded-2xl shadow-sm p-5 text-center">
      {!revealed ? (
        renderPrompt()
      ) : (
        <div className="animate-fade-in">
          <p className="text-lg font-bold text-gray-900">{interaction.revealText}</p>
        </div>
      )}
    </div>
  );
};
