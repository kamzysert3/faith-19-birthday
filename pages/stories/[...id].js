import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Story() {
  const router = useRouter();
  const [story, setStory] = useState(null);
  const { id } = router.query;

  useEffect(() => {
    if (!id) return;
    axios.get('/api/stories?id=' + id)
      .then(res => {
        if (res.data === "Undefined") {
          setStory("Undefined");
        } else if (res.data === "Locked") {
          setStory("Locked");
        } else {
          setStory(res.data)
        }
      })
      .catch(error => console.error(error));
  }, [id]);

  if (!story) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-pink-100">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 mb-4"></div>
          <p className="text-xl text-gray-600">Loading...</p>
        </div>
      </main>
    );
  } else if (story === "Undefined") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-pink-100">
        <div className="flex flex-col items-center justify-center">
          <p className="text-center text-gray-500">
            This story is not available.
          </p>
        </div>
      </main>
    );
  } else if (story === "Locked") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-pink-100">
        <div className="flex flex-col items-center justify-center">
          <p className="text-center text-gray-500">
            This story is currently locked.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-pink-200 via-red-100 to-pink-300 p-3">
      <div className="max-w-3xl w-full bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-rose-400 via-pink-400 to-red-400 opacity-30"></div>
          <h1 className="text-4xl font-bold text-gray-900 text-center py-8 px-4 relative z-10">
            {story.title}
          </h1>
        </div>
        <div className="p-8">
          <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">
            {story.content}
          </p>
          <div className="mt-8 flex justify-center">
            <Link href={"/story"}
              className="px-6 py-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition duration-200"
            >
              Go Back
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
