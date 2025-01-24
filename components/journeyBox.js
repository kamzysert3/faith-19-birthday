import Link from "next/link";
import { useEffect, useState } from "react";

export default function JourneyBox ({ journey, unlockedJourney }) {
    const unlockedJourneyIds = unlockedJourney.map(journey => journey._id);
    const isUnlocked = unlockedJourneyIds.includes(journey._id);

    return isUnlocked ? (
    <Link
      href={journey.link}
      id={journey._id}
      className="flex flex-col items-center justify-center bg-pink-200 p-3 rounded-md shadow-sm"
    >
      <img src="/images/journey.png" alt="Poem Thumbnail" className="w-20 h-20" />
      <p className="text-rose-800 font-semibold">{journey.title}</p>
    </Link>
  ) : (
    <div
      className="flex flex-col items-center justify-center bg-gray-300 p-3 rounded-md shadow-sm cursor-not-allowed"
    >
      <img src="/images/journey.png" alt="Poem Thumbnail" className="w-20 h-20" />
      <p className="text-gray-500 font-semibold">{journey.title}</p>
      <p className="text-red-500 text-sm italic">Locked</p>
    </div>
  );
}