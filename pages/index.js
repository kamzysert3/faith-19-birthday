import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  const primaryButtonClass =
    "px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-400 text-white text-lg rounded-full shadow-lg hover:shadow-rose-500/50 hover:scale-105 transition-transform";
  const secondaryButtonClass =
    "px-4 py-2 border border-pink-400 text-pink-500 bg-white rounded-full shadow-md hover:bg-pink-500 hover:text-white hover:scale-105 transition-transform";

  return (
    <div>
      <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-rose-100 to-pink-200">
        {/* Welcome Section */}
        <div className="text-center p-8">
          <div className="bg-clip-text text-transparent bg-gradient-to-r from-rose-500 via-red-300 to-pink-500 py-3">
            <h1 className="text-6xl font-bold">
              Happy Birthday Love
            </h1>
          </div>
          <p className="mt-4 text-lg text-gray-700 italic">
            🎉 Celebrate your birthday with this special gift
          </p>
        </div>

        {/* Navigation Buttons */}
        <section className="flex flex-col gap-6 mt-8 items-center">
          {/* Main Action Button */}
          <Link
            href="/journey"
            className={primaryButtonClass}
            aria-label="Start the Journey"
          >
            Start the Journey 🎁
          </Link>

          {/* Secondary Links */}
          <div className="flex gap-4">
            <Link
              href="/poems"
              className={secondaryButtonClass}
              aria-label="Explore Poems"
            >
              Poems 📜
            </Link>
            <Link
              href="/story"
              className={secondaryButtonClass}
              aria-label="Read Our Story"
            >
              Story 📖
            </Link>
            <Link
              href="/progress"
              className={secondaryButtonClass}
              aria-label="See Progress"
            >
              Progress 📈
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
