import Link from "next/link";
import { useEffect, useState } from "react";

export default function StoryBox ({ story }) {
    const [unlockedStories, setUnlockedStories] = useState([]);
    useEffect(() => {
        fetchUnlockedStories();
    }, [])
    async function fetchUnlockedStories() {
        const response = await fetch('/api/progress?items=stories');
        const data = await response.json();        
        setUnlockedStories(data);
    }
    const isUnlocked =  unlockedStories.includes(story._id);

    return isUnlocked ? (
    <Link
      href={`/stories/${story._id}`}
      id={story._id}
      className="flex flex-col items-center justify-center bg-pink-200 p-3 rounded-md shadow-sm"
    >
      <img src="/images/story.png" alt="Poem Thumbnail" className="w-20 h-20" />
      <p className="text-rose-800 font-semibold">{story.title}</p>
    </Link>
  ) : (
    <div
      className="flex flex-col items-center justify-center bg-gray-300 p-3 rounded-md shadow-sm cursor-not-allowed"
    >
      <img src="/images/story.png" alt="Poem Thumbnail" className="w-20 h-20" />
      <p className="text-gray-500 font-semibold">{story.title}</p>
      <p className="text-red-500 text-sm italic">Locked</p>
    </div>
  );
}