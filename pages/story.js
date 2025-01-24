import StoryBox from "@/components/storyBox";
import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function StoryPage () {
    const [stories, setStories] = useState([])
    const [unlockedStories, setUnlockedStories] = useState([]);

    useEffect(() => {
        fetchUnlockedStories();
    }, [])
    async function fetchUnlockedStories() {
        const response = await fetch('/api/progress?items=stories');
        const data = await response.json();        
        setUnlockedStories(data);
    }
    
    useEffect(() => {
        fetchStories();
    }, [])
    function fetchStories() {
        axios.get('/api/stories')
        .then(response => setStories(response.data))
       .catch(error => console.error(error));
    }
    return (
        <main className="min-h-screen flex flex-col p-3 justify-center bg-gradient-to-b from-rose-100 to-pink-200 px-5 text-pink-800">
            <Link href={'/'} className="text-xl bg-pink-500 p-3 rounded-full absolute top-5 left-5 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
            </Link>
            <div className="flex flex-col justify-center text-center my-4 gap-2 text-pink-700">
                <h1 className="sm:text-4xl text-2xl font-bold text-center text-pink-800">Unlocked Stories</h1>
            </div>
            {stories.length === 0 && (
                <div className="flex items-center justify-center">
                    <h2 className="text-2xl text-gray-400 animate-pulse">Loading...</h2>   
                </div>
            )}
            {stories.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 mt-8">
                    {stories.length > 0 && stories.map(story => (
                        <StoryBox key={story._id} story={story} unlockedStories={unlockedStories} />
                    ))}
                </div>
            )}
        </main>
    )
}