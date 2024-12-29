import { useState, useEffect } from 'react';
import { Unlock } from '@/lib/unlock';
import Success from '../success';

export default function Journey10({ journey, reward, progress }) {
    const [grid, setGrid] = useState([]);
    const [score, setScore] = useState(0);
    const [isWon, setIsWon] = useState(false);
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [selected, setSelected] = useState([]);
    const [animations, setAnimations] = useState(new Set());
    const [moves, setMoves] = useState(20);
    const [gameOver, setGameOver] = useState(false);

    const GRID_SIZE = 8;
    const REQUIRED_SCORE = 1000; // Increased from 300
    const INITIAL_MOVES = 20;
    const BALLOONS = ['🎈', '🎁', '🎂', '🎉', '🎊'];

    useEffect(() => {
        initializeGrid();
    }, []);

    const initializeGrid = () => {
        const newGrid = Array(GRID_SIZE).fill().map(() =>
            Array(GRID_SIZE).fill().map(() =>
                BALLOONS[Math.floor(Math.random() * BALLOONS.length)]
            )
        );
        setGrid(newGrid);
        setScore(0);
        setMoves(INITIAL_MOVES);
        setGameOver(false);
        setAnimations(new Set());
    };

    const hasValidMoves = (board) => {
        if (!board || !Array.isArray(board) || board.length === 0) return false;

        // Check every position for potential matches
        for (let row = 0; row < GRID_SIZE; row++) {
            if (!board[row]) continue;
            for (let col = 0; col < GRID_SIZE; col++) {
                if (!board[row][col]) continue;
                const connected = findConnectedBalloons(row, col, board[row][col], new Set(), board);
                if (connected.size >= 3) {
                    return true;
                }
            }
        }
        return false;
    };

    const findConnectedBalloons = (row, col, balloon, visited = new Set(), currentGrid = grid) => {
        if (!currentGrid || !currentGrid[row] || !currentGrid[row][col]) return visited;
        
        const key = `${row},${col}`;
        if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE || 
            visited.has(key) || currentGrid[row][col] !== balloon) {
            return visited;
        }

        visited.add(key);

        // Check all 4 directions
        findConnectedBalloons(row + 1, col, balloon, visited, currentGrid);
        findConnectedBalloons(row - 1, col, balloon, visited, currentGrid);
        findConnectedBalloons(row, col + 1, balloon, visited, currentGrid);
        findConnectedBalloons(row, col - 1, balloon, visited, currentGrid);

        return visited;
    };

    const reshuffleBoard = () => {
        setAnimations(new Set());
        
        // Show reshuffling message
        setGrid(prev => {
            // Create new grid and validate it has possible moves
            let newGrid;
            do {
                newGrid = Array(GRID_SIZE).fill().map(() =>
                    Array(GRID_SIZE).fill().map(() =>
                        BALLOONS[Math.floor(Math.random() * BALLOONS.length)]
                    )
                );
            } while (!hasValidMoves(newGrid));
            
            return newGrid;
        });
    };

    const handleBalloonClick = (row, col) => {
        if (moves <= 0 || gameOver) return;
        
        const balloon = grid[row][col];
        const connected = findConnectedBalloons(row, col, balloon);

        if (connected.size >= 3) {
            setMoves(prev => prev - 1);
            // Start pop animation
            setAnimations(connected);

            setTimeout(() => {
                // Update score
                const points = connected.size * 10;
                setScore(prev => {
                    const newScore = prev + points;
                    if (newScore >= REQUIRED_SCORE && !isWon) {
                        setIsWon(true);
                        setIsUnlocking(true);
                        Unlock(progress, journey.rewardType, reward._id)
                            .then(success => {
                                if (success) setIsUnlocking(false);
                            });
                    }
                    return newScore;
                });

                // Remove popped balloons and shift remaining down
                const newGrid = grid.map(row => [...row]);
                
                // Remove popped balloons (replace with null)
                connected.forEach(pos => {
                    const [r, c] = pos.split(',').map(Number);
                    newGrid[r][c] = null;
                });

                // Shift balloons down
                for (let col = 0; col < GRID_SIZE; col++) {
                    let writePos = GRID_SIZE - 1;
                    for (let row = GRID_SIZE - 1; row >= 0; row--) {
                        if (newGrid[row][col] !== null) {
                            newGrid[writePos][col] = newGrid[row][col];
                            if (writePos !== row) {
                                newGrid[row][col] = null;
                            }
                            writePos--;
                        }
                    }
                    // Fill empty spaces with new balloons
                    for (let row = writePos; row >= 0; row--) {
                        newGrid[row][col] = BALLOONS[Math.floor(Math.random() * BALLOONS.length)];
                    }
                }

                setGrid(newGrid);
                setAnimations(new Set());

                // Check if the new board has any valid moves
                setTimeout(() => {
                    if (!hasValidMoves(newGrid)) {
                        reshuffleBoard();
                    }
                }, 500);

                // Check if out of moves
                if (moves - 1 <= 0 && score < REQUIRED_SCORE) {
                    setGameOver(true);
                }
            }, 300);
        }
    };

    return (
        <div className="flex flex-col items-center p-4 w-full max-w-lg mx-auto">
            <div className="flex justify-between w-full mb-4">
                <div className="text-xl">Score: {score}/{REQUIRED_SCORE}</div>
                <div className="text-xl">Moves: {moves}</div>
            </div>

            <div className="grid grid-cols-8 gap-1 bg-pink-100 p-2 rounded-lg relative">
                {grid.map((row, rowIndex) =>
                    row.map((balloon, colIndex) => (
                        <button
                            key={`${rowIndex}-${colIndex}`}
                            onClick={() => handleBalloonClick(rowIndex, colIndex)}
                            className={`w-10 h-10 flex items-center justify-center text-2xl
                                bg-white rounded transition-all duration-200
                                ${animations.has(`${rowIndex},${colIndex}`) ? 'animate-pop' : ''}
                                hover:scale-110 active:scale-95`}
                        >
                            {balloon}
                        </button>
                    ))
                )}

                {/* Add reshuffling overlay */}
                {!hasValidMoves(grid) && !gameOver && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="text-white text-xl animate-bounce">
                            Reshuffling...
                        </div>
                    </div>
                )}

                {/* Game Over Overlay */}
                {(gameOver && !isWon) && (
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-4">
                        <div className="text-white text-2xl text-center">
                            Game Over!
                            <div className="text-lg mt-2">Score: {score}</div>
                        </div>
                        <button
                            onClick={initializeGrid}
                            className="px-6 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                )}
            </div>

            <style jsx global>{`
                @keyframes pop {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.3); opacity: 0.5; }
                    100% { transform: scale(0); opacity: 0; }
                }
                .animate-pop {
                    animation: pop 0.3s ease-out forwards;
                }
            `}</style>

            <p className="mt-4 text-gray-600 text-center text-sm sm:text-base">
                Click groups of 3 or more matching balloons to pop them!
                <br />
                Balloons must be connected horizontally or vertically.
            </p>

            {isWon && <Success rewardType={journey.rewardType} reward={reward} loading={isUnlocking}/>}
        </div>
    );
}