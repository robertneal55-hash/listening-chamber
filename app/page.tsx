export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-100 p-6">
      <div className="max-w-xl w-full rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8">
        <h1 className="text-3xl font-semibold">Listening Chamber</h1>
        <p className="mt-3 text-zinc-300">
          If you can see this dark background + centered card, Tailwind is working.
        </p>
        <button className="mt-6 rounded-xl bg-white text-black px-4 py-2 font-medium">
          Test Button
        </button>
      </div>
    </main>
  );
}
