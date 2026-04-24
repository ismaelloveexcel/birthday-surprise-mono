interface Props {
  finalWish: { headline: string; message: string; signature: string };
}

export const WebFinalWishCard: React.FC<Props> = ({ finalWish }) => (
  <div className="mx-4 mb-4 bg-pink-50 rounded-2xl p-6 text-center">
    <h2 className="text-2xl font-extrabold text-pink-900 mb-3">{finalWish.headline}</h2>
    <p className="text-pink-800 text-base leading-relaxed mb-4">{finalWish.message}</p>
    <p className="italic text-pink-600 text-sm text-right">— {finalWish.signature}</p>
  </div>
);
