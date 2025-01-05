import { useState, useEffect } from 'react';
import { Unlock } from '@/lib/unlock';
import Success from '../success';

export default function Journey14({ journey, reward, progress }) {
    const [tiles, setTiles] = useState([]);
    const [emptyIndex, setEmptyIndex] = useState(15);
    const [isWon, setIsWon] = useState(false);
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [timeLeft, setTimeLeft] = useState(120); 
    const [gameStarted, setGameStarted] = useState(false);

    useEffect(() => initializeGame, [])

    const initializeGame = () => {
        let shuffled;
        do {
            shuffled = Array.from({length: 16}, (_, i) => i)
                .sort(() => Math.random() - 0.5);
        } while (!isSolvable(shuffled));

        setTiles(shuffled);
        setEmptyIndex(shuffled.indexOf(15));
    };

    const isSolvable = (tiles) => {
        let inversions = 0;
        const emptyTileRow = Math.floor(tiles.indexOf(15) / 4) + 1;
        
        for (let i = 0; i < tiles.length - 1; i++) {
            for (let j = i + 1; j < tiles.length; j++) {
                if (tiles[i] !== 15 && tiles[j] !== 15 && tiles[i] > tiles[j]) {
                    inversions++;
                }
            }
        }
        
        return (inversions + emptyTileRow) % 2 === 0;
    };

    const isAdjacent = (index1, index2) => {
        const row1 = Math.floor(index1 / 4);
        const col1 = index1 % 4;
        const row2 = Math.floor(index2 / 4);
        const col2 = index2 % 4;
        return Math.abs(row1 - row2) + Math.abs(col1 - col2) === 1;
    };

    const handleTileClick = (index) => {
        if (!isAdjacent(index, emptyIndex) || isWon || timeLeft <= 0) return;

        const newTiles = [...tiles];
        [newTiles[index], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[index]];

        setTiles(newTiles);
        setEmptyIndex(index);

        const correctOrder = Array.from({length: 16}, (_, i) => i);
        const isComplete = newTiles.every((tile, idx) => tile === correctOrder[idx]);

        if (isComplete) {
            setIsWon(true);
            setIsUnlocking(true);
            Unlock(progress, journey.rewardType, reward._id)
                .then(success => {
                    if (success) setIsUnlocking(false);
                });
        }
    };

    useEffect(() => {
        if (gameStarted && timeLeft > 0 && !isWon) {
            const timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [gameStarted, timeLeft, isWon]);

    return (
        <div className="flex flex-col items-center p-4 w-full max-w-lg mx-auto">
            <div className="flex justify-center w-full mb-4">
                <div className="text-xl font-semibold">Time: {Math.floor(timeLeft/60)}:{(timeLeft%60).toString().padStart(2, '0')}</div>
            </div>
            
            <div className={`grid grid-cols-4 gap-1 bg-purple-100 p-2 rounded-lg ${(gameStarted) ? 'opacity-100' : 'opacity-50'}`}>
                {tiles.map((tile, index) => (
                    <button
                        key={index}
                        onClick={() => handleTileClick(index)}
                        className={`
                            w-16 h-16 text-xl sm:text-2xl
                            ${tile === 15 ? 'bg-purple-100' : 'bg-white hover:bg-purple-50'}
                            flex items-center justify-center font-bold
                            transition-all duration-200
                            ${isAdjacent(index, emptyIndex) ? 'cursor-pointer shadow-md hover:scale-105' : ''}
                            rounded
                        `}
                        disabled={!isAdjacent(index, emptyIndex) || isWon || timeLeft <= 0}
                    >
                        {tile === 15 ? '' : tile + 1}
                    </button>
                ))}
            </div>

            {(!gameStarted || timeLeft <= 0) && (
                <button
                    onClick={() => {
                        setIsWon(false);
                        setTimeLeft(120);
                        setGameStarted(true);
                    }}
                className="mt-4 px-4 py-2 bg-purple-400 text-white rounded-full hover:bg-purple-500"
                >
                {timeLeft <= 0 ? "Try Again" : "New Game"}
                </button>
            )}

            <p className="mt-4 text-gray-600 text-center text-sm sm:text-base">
                Complete the puzzle in under 2 minutes with at least 50 moves!
                <br />
                Arrange numbers from 1-15 in order.
            </p>

            {(isWon || timeLeft <= 0) && (
                <div className="mt-4 text-center">
                    {isWon ? 
                        <Success rewardType={journey.rewardType} reward={reward} loading={isUnlocking}/> :
                        <p className="text-red-500">Time's up! Try again.</p>
                    }
                </div>
            )}
        </div>
    );
}