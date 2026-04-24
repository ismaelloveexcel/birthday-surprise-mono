import { CURATED_PALETTES } from "@birthday-surprise/shared";

interface Props {
  hero: { headline: string; subheadline: string; introLine: string };
  visualStyleId: string;
  paletteId: string;
}

export const WebBirthdayHeroCard: React.FC<Props> = ({ hero, paletteId }) => {
  const palette = CURATED_PALETTES[paletteId] ?? CURATED_PALETTES["cake-pop"];

  return (
    <div
      className="px-6 pt-14 pb-10 text-center"
      style={{ backgroundColor: palette.bg }}
    >
      <h1
        className="text-4xl font-extrabold mb-2 leading-tight"
        style={{ color: palette.text }}
      >
        {hero.headline}
      </h1>
      <p className="text-lg font-semibold mb-3" style={{ color: palette.accent }}>
        {hero.subheadline}
      </p>
      <p className="text-sm italic" style={{ color: palette.text, opacity: 0.7 }}>
        {hero.introLine}
      </p>
    </div>
  );
};
