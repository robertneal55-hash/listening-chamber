export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-100 p-6">
      <div className="max-w-xl w-full rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8">
        <h1 className="text-3xl font-semibold">Listening Chamber</h1>

        <p className="mt-3 text-zinc-300">
          Press play. If you hear sound, audio is working.
        </p>

        <div className="mt-6">
          <audio controls className="w-full">
            <source src="/track.mp3" type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>
      </div>
    </main>
  );
}


