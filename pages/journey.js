import Journey1 from "@/components/Journeys/Journey1";
import Journey2 from "@/components/Journeys/Journey2";
import Journey3 from "@/components/Journeys/Journey3";
import Journey4 from "@/components/Journeys/Journey4";
import Journey5 from "@/components/Journeys/Journey5";
import Journey6 from "@/components/Journeys/Journey6";
import Journey7 from "@/components/Journeys/Journey7";
import Journey8 from "@/components/Journeys/Journey8";
import Journey9 from "@/components/Journeys/Journey9";
import Journey10 from "@/components/Journeys/Journey10";
import Journey11 from "@/components/Journeys/Journey11";
import Journey12 from "@/components/Journeys/Journey12";
import Journey13 from "@/components/Journeys/Journey13";
import Journey14 from "@/components/Journeys/Journey14";
import Journey15 from "@/components/Journeys/Journey15";
import Journey16 from "@/components/Journeys/Journey16";
import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";


const journeyComponents = {
    1: Journey1, 2: Journey2,
    3: Journey3, 4: Journey4,
    5: Journey5, 6: Journey6,
    7: Journey7, 8: Journey8,
    9: Journey9, 10: Journey10,
    11: Journey11, 12: Journey12,
    13: Journey13, 14: Journey14,
    15: Journey15, 16: Journey16,
};

export default function Journey () {
    const [progressBar, setProgressBar] = useState(null);
    const [journeyObj, setJourneyObj] = useState(null);
    const [journeyReward, setJourneyReward] = useState(null);
    const router = useRouter();
    const { part } = router.query;
    useEffect(() => {
        if (!router.isReady) return;

        if (part) {
            setProgressBar(parseInt(part) - 1);
        } else {
            fetchProgress();
        }

    }, [part])
    useEffect(() => {
        if (progressBar === null) return;

        fetchJourneyObject(progressBar);
    }, [progressBar])
    function fetchProgress() {
        axios.get('/api/progress')
        .then(response => setProgressBar(response.data))
        .catch(error => console.error(error));
    }
    function fetchJourneyObject (id) {
        axios.get('/api/journeys?id=' + id)
        .then(response => {
            setJourneyObj(response.data.journey)
            setJourneyReward(response.data.reward);
        })
        .catch(error => console.error(error));
    }
    const JourneyComponent = journeyComponents[progressBar + 1];
    
    return (
        <main className="min-h-screen flex flex-col p-3 justify-center bg-gradient-to-b from-rose-100 to-pink-200 px-5 text-pink-800">
            <Link href={'/'} className="text-xl bg-pink-500 p-3 rounded-full absolute top-5 left-5 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
            </Link>
            {progressBar === null ? (
                <div className="flex items-center justify-center">
                    <h2 className="text-2xl text-gray-400 animate-pulse">Loading...</h2>
                </div>
            ) : JourneyComponent ? journeyObj && (
                <JourneyComponent journey={journeyObj} reward={journeyReward}/>
            ) : (
                <div className="flex items-center justify-center">
                    <h2 className="text-2xl text-red-500">Journey not found</h2>
                </div>
            )}
        </main>
    )
}