import { useState, useEffect } from 'react';
import { Unlock } from '@/lib/unlock';
import Success from '../success';

export default function Journey7({ journey, reward, progress }) {
    const [tiles, setTiles] = useState([]);
    const [emptyIndex, setEmptyIndex] = useState(8);
    const [moves, setMoves] = useState(0);
    const [isWon, setIsWon] = useState(false);
    const [isUnlocking, setIsUnlocking] = useState(false);

    const initializeGame = () => {
        // Create shuffled tiles array 0-8 (8 is empty)
        let shuffled;
        do {
            shuffled = Array.from({length: 9}, (_, i) => i)
                .sort(() => Math.random() - 0.5);
        } while (!isSolvable(shuffled));

        setTiles(shuffled);
        setEmptyIndex(shuffled.indexOf(8));
        setMoves(0);
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
        if (!isAdjacent(index, emptyIndex) || isWon) return;

        const newTiles = [...tiles];
        [newTiles[index], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[index]];

        // Update tiles first
        setTiles(newTiles);
        setEmptyIndex(index);
        setMoves(prev => prev + 1);

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

    useEffect(() => {
        initializeGame();
    }, []);

    return (
        <div className="flex flex-col items-center p-4 w-full max-w-lg mx-auto">
            <div className="text-xl mb-4">Moves: {moves}</div>
            
            <div className="grid grid-cols-3 gap-1 bg-pink-100 p-2 rounded-lg">
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
                        disabled={!isAdjacent(index, emptyIndex) || isWon}
                    >
                        {tile === 8 ? '' : tile + 1}
                    </button>
                ))}
            </div>

            <button
                onClick={initializeGame}
                className="mt-4 px-4 py-2 bg-pink-400 text-white rounded-full hover:bg-pink-500"
            >
                New Game
            </button>

            <p className="mt-4 text-gray-600 text-center text-sm sm:text-base">
                Click tiles next to the empty space to move them.
                <br />
                Arrange numbers from 1-8 in order!
            </p>

            {isWon && <Success rewardType={journey.rewardType} reward={reward} loading={isUnlocking}/>}
        </div>
    );
}