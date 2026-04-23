export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-pink-50 px-4">
      <div className="text-6xl mb-4">🎂</div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
        Surprise not found
      </h1>
      <p className="text-gray-500 text-center max-w-xs">
        This experience may have been deleted or the link is incorrect.
      </p>
    </main>
  );
}
