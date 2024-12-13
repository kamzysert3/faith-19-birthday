import Link from "next/link";
import { useEffect, useState } from "react";

export default function PoemBox ({ poem }) {
    const [unlockedPoems, setUnlockedPoems] = useState([]);
    useEffect(() => {
        fetchUnlockedPoems();
    }, [])
    async function fetchUnlockedPoems() {
        const response = await fetch('/api/progress?items=poems');
        const data = await response.json();        
        setUnlockedPoems(data);
    }
    const isUnlocked =  unlockedPoems.includes(poem._id);

    return isUnlocked ? (
    <Link
      href={`/poems/${poem._id}`}
      id={poem._id}
      className="flex flex-col items-center justify-center bg-pink-200 p-3 rounded-md shadow-sm"
    >
      <img src="/images/poem.png" alt="Poem Thumbnail" className="w-20 h-20" />
      <p className="text-rose-800 font-semibold">{poem.title}</p>
    </Link>
  ) : (
    <div
      className="flex flex-col items-center justify-center bg-gray-300 p-3 rounded-md shadow-sm cursor-not-allowed"
    >
      <img src="/images/poem.png" alt="Poem Thumbnail" className="w-20 h-20" />
      <p className="text-gray-500 font-semibold">{poem.title}</p>
      <p className="text-red-500 text-sm italic">Locked</p>
    </div>
  );
}