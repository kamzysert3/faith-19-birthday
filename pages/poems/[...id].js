import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Poem() {
  const router = useRouter();
  const [poem, setPoem] = useState(null);
  const { id } = router.query;

  useEffect(() => {
    if (!id) return;
    axios.get('/api/poems?id=' + id)
      .then(res => setPoem(res.data))
      .catch(error => console.error(error));
  }, [id]);

  if (!poem) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-100 to-gray-200">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
          <p className="text-xl text-gray-600 ml-4">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-pink-200 via-red-100 to-pink-300">
      <div className="max-w-3xl bg-white rounded-lg shadow-xl p-8 relative">
        <div className="absolute top-0 left-0 w-full h-2 rounded-t-lg bg-gradient-to-r from-pink-500 to-rose-500"></div>
        <h1 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">{poem.title}</h1>
        <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">
          {poem.content}
        </p>
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => router.back()}
            className="inline-block bg-blue-500 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-600 transition duration-200"
          >
            Go Back
          </button>
        </div>
      </div>
    </main>
  );
}
