import Link from "next/link";
import PoemBox from "./poemBox";
import StoryBox from "./storyBox";
import { useRouter } from "next/router";

export default function Success ({ rewardType, reward, loading }) {
    const router = useRouter()
    const { part } = router.query;

    return (
        <div className="absolute inset-0 flex items-center justify-center p-3 bg-gray-800 bg-opacity-30">
            <div className="bg-white w-full sm:w-1/2 flex flex-col justify-center items-center p-4 rounded shadow">
                {loading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-gray-500"></div>
                ) : (
                    <div>
                        <h1 className="text-2xl font-semibold text-center">Success!</h1>
                        <p className="italic text-center">You have unlocked</p>
                        {rewardType === "Poem" ? (
                            <PoemBox key={reward._id} poem={reward} />
                        ) : rewardType === "Story" ? (
                            <StoryBox key={reward._id} story={reward} />
                        ) : (
                            <p className="text-center text-gray-500">
                                This reward is not available.
                            </p>
                        )}
                        <div className="mt-3 flex gap-2 justify-center">
                                <Link href={'/'} className="px-6 py-3 bg-gray-200 text-black rounded-full shadow-lg hover:bg-gray-400 hover:text-white transition duration-200">
                                    Home
                                </Link>
                            {part ? (
                                <Link href={'/journey'} className="px-6 py-3 bg-pink-400 text-white rounded-full shadow-lg hover:bg-pink-600 transition duration-200">
                                    Next
                                </Link>
                            ) : (
                                <button
                                    onClick={() => router.reload()}
                                    className="px-6 py-3 bg-pink-400 text-white rounded-full shadow-lg hover:bg-pink-600 transition duration-200"
                                    >
                                    Next
                                </button>
                            )}
                        </div>
                    </div>  
                )}
            </div>
        </div>
    )
}