import Link from "next/link";
import PoemBox from "./poemBox";
import StoryBox from "./storyBox";

export default function Success ({ rewardType, reward }) {
    return (
        <div className="absolute inset-0 flex items-center justify-center p-3 bg-gray-800 bg-opacity-30">
            <div className="bg-white p-4 rounded shadow">
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
                <div className="mt-3 flex justify-center">
                    <Link href={'/journey'} className="px-6 py-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition duration-200">
                        Next
                    </Link>
                </div>
            </div>
        </div>
    )
}