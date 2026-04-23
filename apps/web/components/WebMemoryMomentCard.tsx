interface Props {
  memoryMoment: { title: string; body: string };
}

export const WebMemoryMomentCard: React.FC<Props> = ({ memoryMoment }) => (
  <div className="mx-4 my-0 mb-4 bg-yellow-50 rounded-2xl p-5">
    <h3 className="text-lg font-bold text-yellow-800 mb-2">{memoryMoment.title}</h3>
    <p className="text-yellow-700 text-sm leading-relaxed">{memoryMoment.body}</p>
  </div>
);
