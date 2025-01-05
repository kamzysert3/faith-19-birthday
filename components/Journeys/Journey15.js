import { useState, useEffect } from 'react';
import { Unlock } from '@/lib/unlock';
import Success from '../success';

export default function Journey9({ journey, reward, progress }) {
    const [grid, setGrid] = useState([]);
    const [selected, setSelected] = useState(null);
    const [score, setScore] = useState(0);
    const [isWon, setIsWon] = useState(false);
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [switching, setSwitching] = useState(null);
    const [matching, setMatching] = useState(new Set());
    const [falling, setFalling] = useState(new Set());
    const [chainMultiplier, setChainMultiplier] = useState(1);
    const [moves, setMoves] = useState(15); // Add moves limit state
    const [gameOver, setGameOver] = useState(false);

    const GRID_SIZE = 6;
    const REQUIRED_SCORE = 500;
    const INITIAL_MOVES = 15;
    const CANDIES = ['🎈', '🎁', '🎂', '🎉', '🎊', '🍰', '🎨', '🎭'];

    useEffect(() => {
        initializeGrid();
    }, []);

    const validateGrid = (grid) => {
        // Check for any matches in the initial grid
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE - 2; col++) {
                if (grid[row][col] === grid[row][col + 1] && 
                    grid[row][col] === grid[row][col + 2]) {
                    return false;
                }
            }
        }
        
        for (let row = 0; row < GRID_SIZE - 2; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                if (grid[row][col] === grid[row + 1][col] && 
                    grid[row][col] === grid[row + 2][col]) {
                    return false;
                }
            }
        }
        return true;
    };

    // Add new helper function to check if a move creates a match
    const checkValidMove = (board, row1, col1, row2, col2) => {
        if (!board || !board[row1] || !board[row2]) return false;
        
        const tempBoard = board.map(row => [...row]);
        const temp = tempBoard[row1][col1];
        tempBoard[row1][col1] = tempBoard[row2][col2];
        tempBoard[row2][col2] = temp;
        
        return hasMatch(tempBoard);
    };

    // Add new function to check if any valid moves exist
    const hasValidMoves = (board) => {
        if (!board || board.length === 0) return false;

        // Check horizontal swaps
        for (let row = 0; row < GRID_SIZE; row++) {
            if (!board[row]) continue;
            for (let col = 0; col < GRID_SIZE - 1; col++) {
                if (checkValidMove(board, row, col, row, col + 1)) {
                    return true;
                }
            }
        }
        // Check vertical swaps
        for (let row = 0; row < GRID_SIZE - 1; row++) {
            if (!board[row] || !board[row + 1]) continue;
            for (let col = 0; col < GRID_SIZE; col++) {
                if (checkValidMove(board, row, col, row + 1, col)) {
                    return true;
                }
            }
        }
        return false;
    };

    // Modify initializeGrid to include valid moves check
    const initializeGrid = () => {
        let newGrid;
        do {
            newGrid = Array(GRID_SIZE).fill().map(() =>
                Array(GRID_SIZE).fill().map(() =>
                    CANDIES[Math.floor(Math.random() * CANDIES.length)]
                )
            );
        } while (!validateGrid(newGrid) || (newGrid.length > 0 && !hasValidMoves(newGrid)));
        
        setGrid(newGrid);
        setMoves(INITIAL_MOVES);
        setScore(0);
        setGameOver(false);
        setChainMultiplier(1);
        setMatching(new Set());
        setFalling(new Set());
        setSwitching(null);
    };

    // Add reshuffling function
    const reshuffleBoard = () => {
        if (moves <= 0 || gameOver) return;
        let newGrid;
        setMatching(new Set());
        setFalling(new Set());
        setSwitching(null);
        
        do {
            newGrid = Array(GRID_SIZE).fill().map(() =>
                Array(GRID_SIZE).fill().map(() =>
                    CANDIES[Math.floor(Math.random() * CANDIES.length)]
                )
            );
        } while (!validateGrid(newGrid) || !hasValidMoves(newGrid));

        setTimeout(() => setGrid(newGrid), 2000);
    };

    const handleSelect = (row, col) => {
        if (!selected) {
            setSelected({ row, col });
        } else {
            // Check if adjacent
            const isAdjacent = (
                (Math.abs(selected.row - row) === 1 && selected.col === col) ||
                (Math.abs(selected.col - col) === 1 && selected.row === row)
            );

            if (isAdjacent) {
                swapCandies(selected.row, selected.col, row, col);
            }
            setSelected(null);
        }
    };

    const swapCandies = (row1, col1, row2, col2) => {
        if (moves <= 0 || gameOver) return;
        
        setSwitching({ 
            from: { row: row1, col: col1 }, 
            to: { row: row2, col: col2 } // Fix: removed col2 typo
        });

        // Create temp grid and apply swap
        const newGrid = grid.map(row => [...row]);
        const temp = newGrid[row1][col1];
        newGrid[row1][col1] = newGrid[row2][col2];
        newGrid[row2][col2] = temp;

        // Wait for animation to complete before updating grid
        setTimeout(() => {
            if (hasMatch(newGrid)) {
                setGrid(newGrid);
                setSwitching(null);
                checkMatches(newGrid, true);
            } else {
                // Revert if no match
                setSwitching(null);
                setChainMultiplier(1);
            }
        }, 300);

        setMoves(prev => {
            const newMoves = prev - 1;
            if (newMoves <= 0 && score < REQUIRED_SCORE) {
                setGameOver(true);
            }
            return newMoves;
        });
    };

    const hasMatch = (board) => {
        // Check rows
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE - 2; col++) {
                if (board[row][col] &&
                    board[row][col] === board[row][col + 1] &&
                    board[row][col] === board[row][col + 2]) {
                    return true;
                }
            }
        }
        // Check columns
        for (let row = 0; row < GRID_SIZE - 2; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                if (board[row][col] &&
                    board[row][col] === board[row + 1][col] &&
                    board[row][col] === board[row + 2][col]) {
                    return true;
                }
            }
        }
        return false;
    };

    const checkMatches = (currentGrid, isNewMatch = false) => {
        let matches = new Set();
        let matched = false;

        // Check rows
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE - 2; col++) {
                if (currentGrid[row][col] &&
                    currentGrid[row][col] === currentGrid[row][col + 1] &&
                    currentGrid[row][col] === currentGrid[row][col + 2]) {
                    matches.add(`${row},${col}`);
                    matches.add(`${row},${col + 1}`);
                    matches.add(`${row},${col + 2}`);
                    matched = true;
                }
            }
        }

        // Check columns
        for (let row = 0; row < GRID_SIZE - 2; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                if (currentGrid[row][col] &&
                    currentGrid[row][col] === currentGrid[row + 1][col] &&
                    currentGrid[row][col] === currentGrid[row + 2][col]) {
                    matches.add(`${row},${col}`);
                    matches.add(`${row + 1},${col}`);
                    matches.add(`${row + 2},${col}`);
                    matched = true;
                }
            }
        }

        if (matched) {
            if (isNewMatch) {
                setChainMultiplier(prev => prev + 0.5);
            }

            // Mark matched candies as null
            const newGrid = currentGrid.map(row => [...row]);
            matches.forEach(pos => {
                const [row, col] = pos.split(',').map(Number);
                newGrid[row][col] = null;
            });

            setMatching(matches);

            // Update score
            setTimeout(() => {
                setScore(prev => {
                    const matchPoints = matches.size * 10;
                    const bonusPoints = Math.floor(matchPoints * chainMultiplier);
                    const newScore = prev + bonusPoints;
                    
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

                // Apply gravity using Journey10's approach
                for (let col = 0; col < GRID_SIZE; col++) {
                    let writePos = GRID_SIZE - 1;
                    for (let row = GRID_SIZE - 1; row >= 0; row--) {
                        if (newGrid[row][col] !== null) {
                            if (writePos !== row) {
                                newGrid[writePos][col] = newGrid[row][col];
                                newGrid[row][col] = null;
                            }
                            writePos--;
                        }
                    }
                    // Fill empty spaces with new candies
                    for (let row = writePos; row >= 0; row--) {
                        newGrid[row][col] = CANDIES[Math.floor(Math.random() * CANDIES.length)];
                    }
                }

                setGrid(newGrid);
                
                // Clear animations and check for new matches
                setTimeout(() => {
                    setMatching(new Set());
                    if (hasMatch(newGrid)) {
                        checkMatches(newGrid, true);
                    } else if (!hasValidMoves(newGrid)) {
                        reshuffleBoard();
                    } else {
                        setChainMultiplier(1);
                    }
                }, 300);
            }, 300);
        } else {
            if (!hasValidMoves(currentGrid)) {
                reshuffleBoard();
            }
            setChainMultiplier(1);
        }
    };

    return (
        <div className="flex flex-col items-center p-4 w-full max-w-lg mx-auto">
            <div className="flex justify-between w-full mb-4">
                <div className="text-xl">Score: {score < 500 ? score : 500}/{REQUIRED_SCORE}</div>
                {chainMultiplier > 1 && (
                    <div className="text-pink-500 font-bold animate-pulse">
                        Combo x{chainMultiplier.toFixed(1)}
                    </div>
                )}
                <div className="text-xl">Moves: {moves}</div>
            </div>

            <div className="grid grid-cols-6 gap-1 bg-pink-100 p-2 rounded-lg relative">
                {grid.map((row, rowIndex) =>
                    row.map((candy, colIndex) => {
                        const isMatching = matching.has(`${rowIndex},${colIndex}`);
                        const isFalling = falling.has(`${rowIndex},${colIndex}`);
                        const isSwappingFrom = switching?.from.row === rowIndex && switching?.from.col === colIndex;
                        const isSwappingTo = switching?.to.row === rowIndex && switching?.to.col === colIndex;
                        
                        let translateX = 0;
                        let translateY = 0;
                        
                        if (isSwappingFrom) {
                            translateX = switching.to.col - switching.from.col;
                            translateY = switching.to.row - switching.from.row;
                        } else if (isSwappingTo) {
                            translateX = switching.from.col - switching.to.col;
                            translateY = switching.from.row - switching.to.row;
                        }

                        return (
                            <button
                                key={`${rowIndex}-${colIndex}`}
                                onClick={() => handleSelect(rowIndex, colIndex)}
                                className={`w-10 h-10 text-lg sm:text-2xl sm:w-12 sm:h-12 flex items-center justify-center text-2xl
                                    ${selected?.row === rowIndex && selected?.col === colIndex
                                        ? 'bg-pink-200'
                                        : 'bg-white'} 
                                    ${isMatching ? 'animate-match' : ''}
                                    ${isFalling ? 'animate-drop' : ''}
                                    rounded`}
                                style={{
                                    transform: `
                                        ${isSwappingFrom ? `translate(${(switching.to.col - switching.from.col) * 100}%, ${(switching.to.row - switching.from.row) * 100}%)` : ''}
                                        ${isSwappingTo ? `translate(${(switching.from.col - switching.to.col) * 100}%, ${(switching.from.row - switching.to.row) * 100}%)` : ''}
                                        ${isMatching ? 'scale(1.1)' : ''}
                                    `,
                                    transition: 'all 0.3s ease-in-out'
                                }}
                            >
                                {candy}
                            </button>
                        );
                    })
                )}

                {/* Game Over Overlay */}
                {(gameOver && !isWon) && (
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-4 cursor-default">
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

                {/* Existing no moves overlay */}
                {!hasValidMoves(grid) && !gameOver && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="text-white text-xl animate-bounce">
                            Reshuffling...
                        </div>
                    </div>
                )}
            </div>

            <style jsx global>{`
                @keyframes match {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.2); opacity: 0.8; }
                    100% { transform: scale(1); opacity: 1; }
                }
                .animate-match {
                    animation: match 0.3s ease-in-out;
                }
                
                @keyframes drop {
                    0% { transform: translateY(-100%); opacity: 0; }
                    60% { transform: translateY(10%); opacity: 1; }
                    100% { transform: translateY(0); opacity: 1; }
                }
                .animate-drop {
                    animation: drop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
            `}</style>

            <p className="mt-4 text-gray-600 text-center text-sm sm:text-base">
                Match 3 or more candies in a row!
                <br />
                Click two adjacent candies to swap them.
            </p>

            {isWon && <Success rewardType={journey.rewardType} reward={reward} loading={isUnlocking}/>}
        </div>
    );
}