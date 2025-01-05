import { useState, useEffect } from 'react';
import { Unlock } from '@/lib/unlock';
import Success from '../success';

export default function Journey7({ journey, reward, progress }) {
    const [tiles, setTiles] = useState([]);
    const [emptyIndex, setEmptyIndex] = useState(8);
    const [timeLeft, setTimeLeft] = useState(60);
    const [isWon, setIsWon] = useState(false);
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [gameOver, setGameOver] = useState(false);

    const initializeGame = () => {
        // Create shuffled tiles array 0-8 (8 is empty)
        let shuffled;
        do {
            shuffled = Array.from({length: 9}, (_, i) => i)
                .sort(() => Math.random() - 0.5);
        } while (!isSolvable(shuffled));

        setTiles(shuffled);
        setEmptyIndex(shuffled.indexOf(8));
    };

    useEffect(() => initializeGame(), []);

    const startGame = () => {
        setGameStarted(true);
        setGameOver(false);
        setTimeLeft(60);
    };

    // Add timer effect
    useEffect(() => {
        if (!gameStarted || isWon || gameOver) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    setGameOver(true);
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [gameStarted, isWon, gameOver]);

    // Format time function
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Check if puzzle is solvable
    const isSolvable = (tiles) => {
        let inversions = 0;
        for (let i = 0; i < tiles.length - 1; i++) {
            for (let j = i + 1; j < tiles.length; j++) {
                if (tiles[i] !== 8 && tiles[j] !== 8 && tiles[i] > tiles[j]) {
                    inversions++;
                }
            }
        }
        return inversions % 2 === 0;
    };

    const isAdjacent = (index1, index2) => {
        const row1 = Math.floor(index1 / 3);
        const col1 = index1 % 3;
        const row2 = Math.floor(index2 / 3);
        const col2 = index2 % 3;
        return Math.abs(row1 - row2) + Math.abs(col1 - col2) === 1;
    };

    const handleTileClick = (index) => {
        if (!isAdjacent(index, emptyIndex) || isWon || gameOver) return;

        const newTiles = [...tiles];
        [newTiles[index], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[index]];

        // Update tiles first
        setTiles(newTiles);
        setEmptyIndex(index);

        // Then check win condition with the updated tiles
        const correctOrder = [0, 1, 2, 3, 4, 5, 6, 7, 8];
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

    return (
        <div className="flex flex-col items-center p-4 w-full max-w-lg mx-auto">
            <div className={`text-xl mb-4 ${timeLeft < 30 ? 'text-red-500 animate-pulse' : ''}`}>
                Time: {formatTime(timeLeft)}
            </div>
            
            <div className={`grid grid-cols-3 gap-1 bg-pink-100 p-2 rounded-lg ${(gameStarted) ? 'opacity-100' : 'opacity-50'}`}>
                {tiles.map((tile, index) => (
                    <button
                        key={index}
                        onClick={() => handleTileClick(index)}
                        className={`
                            w-20 h-20 sm:w-24 sm:h-24 text-2xl sm:text-3xl
                            ${tile === 8 ? 'bg-pink-100' : 'bg-white hover:bg-pink-50'}
                            flex items-center justify-center font-bold
                            transition-all duration-200
                            ${isAdjacent(index, emptyIndex) ? 'cursor-pointer shadow-md hover:scale-105' : ''}
                            rounded
                        `}
                        disabled={!isAdjacent(index, emptyIndex) || isWon || gameOver}
                    >
                        {tile === 8 ? '' : tile + 1}
                    </button>
                ))}
            </div>

            {(gameOver && !isWon) && (
                <div className="mt-4 text-center">
                    <p className="text-red-500 mb-2">Time's up!</p>
                    <button
                        onClick={startGame}
                        className="px-4 py-2 bg-pink-400 text-white rounded-full hover:bg-pink-500"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {!gameStarted && (
                <button
                    onClick={startGame}
                    className="mt-4 px-4 py-2 bg-pink-400 text-white rounded-full hover:bg-pink-500"
                >
                    Start Game
                </button>
            )}

            <p className="mt-4 text-gray-600 text-center text-sm sm:text-base">
                Click tiles next to the empty space to move them.
                <br />
                Arrange numbers from 1-8 in order within 3 minutes!
            </p>

            {isWon && <Success rewardType={journey.rewardType} reward={reward} loading={isUnlocking}/>}
        </div>
    );
}