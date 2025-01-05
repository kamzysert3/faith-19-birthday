import { useState, useEffect } from 'react';
import { Unlock } from '@/lib/unlock';
import Success from '../success';

export default function Journey16({ journey, reward, progress }) {
    const [grid, setGrid] = useState([]);
    const [words, setWords] = useState([]);
    const [foundWords, setFoundWords] = useState([]);
    const [isSelecting, setIsSelecting] = useState(false);
    const [startCell, setStartCell] = useState(null);
    const [currentCell, setCurrentCell] = useState(null);
    const [isWon, setIsWon] = useState(false);
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [timeLeft, setTimeLeft] = useState(120);
    const [isGameOver, setIsGameOver] = useState(false);

    const GRID_SIZE = 12;
    const WORD_POOL = [
        'BIRTHDAY', 'FAITH', 'PARTY', 'CAKE', 'GIFT', 'HAPPY', 'SMILE', 'JOY',
        'FRIEND', 'DANCE', 'MUSIC', 'SWEET', 'LAUGH', 'LOVE', 'DREAM', 'WISH',
        'SUGAR', 'CANDY', 'HEART', 'SHINE', 'STARS', 'GLOW', 'MAGIC', 'FUN', 'CUTE'
    ];
    const [currentWords, setCurrentWords] = useState([]);

    const initializeGame = () => {
        const selectedWords = [...WORD_POOL]
            .sort(() => Math.random() - 0.5)
            .slice(0, 8);
        
        setCurrentWords(selectedWords);
        const { grid: newGrid, placedWords } = createWordSearch(selectedWords);
        setGrid(newGrid);
        setWords(placedWords);
        setFoundWords([]);
        setTimeLeft(120); // Reset timer
        setIsGameOver(false);
    };

    useEffect(() => {
        initializeGame();
    }, []);

    useEffect(() => {
        if (timeLeft <= 0) {
            setIsGameOver(true);
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    const createWordSearch = (wordsToPlace) => {
        // Initialize empty grid
        let grid = Array(GRID_SIZE).fill().map(() => 
            Array(GRID_SIZE).fill(''));
        let placedWords = [];

        // Place words in random directions
        wordsToPlace.forEach(word => {
            let placed = false;
            let attempts = 0;
            while (!placed && attempts < 100) {
                const direction = Math.random() < 0.5 ? 'horizontal' : 'vertical';
                const row = Math.floor(Math.random() * GRID_SIZE);
                const col = Math.floor(Math.random() * GRID_SIZE);

                if (canPlaceWord(grid, word, row, col, direction)) {
                    placeWord(grid, word, row, col, direction);
                    placedWords.push({
                        word,
                        start: [row, col],
                        direction
                    });
                    placed = true;
                }
                attempts++;
            }
        });

        // Fill empty cells with random letters
        for (let i = 0; i < GRID_SIZE; i++) {
            for (let j = 0; j < GRID_SIZE; j++) {
                if (!grid[i][j]) {
                    grid[i][j] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
                }
            }
        }

        return { grid, placedWords };
    };

    const canPlaceWord = (grid, word, row, col, direction) => {
        if (direction === 'horizontal' && col + word.length > GRID_SIZE) return false;
        if (direction === 'vertical' && row + word.length > GRID_SIZE) return false;

        for (let i = 0; i < word.length; i++) {
            const currentRow = direction === 'vertical' ? row + i : row;
            const currentCol = direction === 'horizontal' ? col + i : col;
            if (grid[currentRow][currentCol] && grid[currentRow][currentCol] !== word[i]) {
                return false;
            }
        }
        return true;
    };

    const placeWord = (grid, word, row, col, direction) => {
        for (let i = 0; i < word.length; i++) {
            if (direction === 'horizontal') {
                grid[row][col + i] = word[i];
            } else {
                grid[row + i][col] = word[i];
            }
        }
    };

    const handleMouseDown = (row, col) => {
        setIsSelecting(true);
        setStartCell([row, col]);
        setCurrentCell([row, col]);
    };

    const handleMouseMove = (row, col) => {
        if (isSelecting) {
            setCurrentCell([row, col]);
        }
    };

    const handleMouseUp = () => {
        if (!isSelecting || !startCell || !currentCell || isGameOver) return;

        const selectedWord = getSelectedWord();
        if (currentWords.includes(selectedWord) && !foundWords.includes(selectedWord)) {
            setFoundWords(prev => {
                const newFound = [...prev, selectedWord];
                if (newFound.length === currentWords.length) {
                    setIsWon(true);
                    setIsUnlocking(true);
                    setTimeLeft(0);
                    Unlock(progress, journey.rewardType, reward._id)
                        .then(success => {
                            if (success) setIsUnlocking(false);
                        });
                }
                return newFound;
            });
        }

        setIsSelecting(false);
        setStartCell(null);
        setCurrentCell(null);
    };

    const getSelectedWord = () => {
        if (!startCell || !currentCell) return '';

        const [startRow, startCol] = startCell;
        const [endRow, endCol] = currentCell;
        
        if (startRow === endRow) {
            const start = Math.min(startCol, endCol);
            const length = Math.abs(endCol - startCol) + 1;
            return grid[startRow].slice(start, start + length).join('');
        } else if (startCol === endCol) {
            const start = Math.min(startRow, endRow);
            const length = Math.abs(endRow - startRow) + 1;
            return Array(length).fill().map((_, i) => grid[start + i][startCol]).join('');
        }
        return '';
    };

    const getHighlightedCells = () => {
        if (!startCell || !currentCell) return new Set();
        
        const highlighted = new Set();
        const [startRow, startCol] = startCell;
        const [endRow, endCol] = currentCell;

        if (startRow === endRow) {
            // Horizontal selection
            const start = Math.min(startCol, endCol);
            const end = Math.max(startCol, endCol);
            for (let col = start; col <= end; col++) {
                highlighted.add(`${startRow},${col}`);
            }
        } else if (startCol === endCol) {
            // Vertical selection
            const start = Math.min(startRow, endRow);
            const end = Math.max(startRow, endRow);
            for (let row = start; row <= end; row++) {
                highlighted.add(`${row},${startCol}`);
            }
        }
        return highlighted;
    };

    // Add this new helper function to track letter positions for found words
    const getWordLetterPositions = () => {
        const positions = new Set();
        foundWords.forEach(word => {
            words.forEach(placedWord => {
                if (placedWord.word === word) {
                    const [row, col] = placedWord.start;
                    const { direction } = placedWord;
                    
                    for (let i = 0; i < word.length; i++) {
                        const currentRow = direction === 'vertical' ? row + i : row;
                        const currentCol = direction === 'horizontal' ? col + i : col;
                        positions.add(`${currentRow},${currentCol}`);
                    }
                }
            });
        });
        return positions;
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col items-center p-4 pb-1 w-full">
            <div className="flex justify-end w-full mb-4">
                <div className={`text-xl font-bold ${timeLeft < 60 ? 'text-red-500 animate-pulse' : ''}`}>
                    {formatTime(timeLeft)}
                </div>
            </div>

            <div className='flex flex-wrap w-full justify-center items-start gap-2'>
                <div className="grid grid-cols-12 gap-1 bg-pink-100 p-4 rounded-lg select-none relative">
                    {grid.map((row, i) => (
                        row.map((letter, j) => {
                            const isHighlighted = getHighlightedCells().has(`${i},${j}`);
                            const isFoundInWord = getWordLetterPositions().has(`${i},${j}`);
                            return (
                                <div
                                    key={`${i}-${j}`}
                                    onMouseDown={() => handleMouseDown(i, j)}
                                    onMouseMove={() => handleMouseMove(i, j)}
                                    onMouseUp={handleMouseUp}
                                    onTouchStart={() => handleMouseDown(i, j)}
                                    onTouchMove={(e) => {
                                        const touch = e.touches[0];
                                        const element = document.elementFromPoint(touch.clientX, touch.clientY);
                                        const cellCoords = element?.getAttribute('data-coords');
                                        if (cellCoords) {
                                            const [row, col] = cellCoords.split(',').map(Number);
                                            handleMouseMove(row, col);
                                        }
                                    }}
                                    onTouchEnd={handleMouseUp}
                                    data-coords={`${i},${j}`}
                                    className={`w-5 h-5 sm:w-8 sm:h-8 text-xs sm:text-base flex items-center justify-center 
                                        rounded font-semibold sm:font-bold cursor-pointer transition-all duration-150
                                        ${isHighlighted 
                                            ? 'bg-pink-300 scale-110 shadow-md' 
                                            : 'bg-white hover:bg-pink-50'}
                                        ${isFoundInWord
                                            ? 'text-white bg-pink-300 hover:bg-pink-300' 
                                            : 'text-gray-700'}`}
                                >
                                    {letter}
                                </div>
                            );
                        })
                    ))}

                    {/* Game Over Overlay - Modified to cover only the grid */}
                    {isGameOver && !isWon && (
                        <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                            <div className="bg-white w-1/2 p-4 rounded-lg text-center shadow-xl transform scale-100 animate-fadeIn">
                                <h2 className="text-base font-semibold mb-2">Time's Up!</h2>
                                <p className="mb-3 text-xs italic">You found only {foundWords.length} words</p>
                                <button
                                    onClick={initializeGame}
                                    className="px-3 py-1.5 bg-pink-500 text-white text-sm rounded-full hover:bg-pink-600"
                                >
                                    Try Again
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* New Word List UI */}
                <div className="flex sm:flex-col flex-wrap gap-2 min-w-[120px] justify-center">
                    {currentWords.map(word => (
                        <div
                            key={word}
                            className={`relative px-3 py-2 pr-8 rounded-lg transition-all duration-300
                                ${foundWords.includes(word) 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-gray-100 text-gray-700'}`}
                        >
                            <div className="flex items-center justify-between gap-2">
                                <span className={`font-medium ${foundWords.includes(word) ? 'line-through' : ''}`}>
                                    {word}
                                </span>
                            </div>
                            <div className="absolute bottom-1 right-2 text-[10px] opacity-50">
                                {word.length}L
                            </div>
                        </div>
                    ))}
                </div>

                {/* Add custom styles for touch handling */}
                <style jsx global>{`
                    .grid {
                        touch-action: none;
                    }
                `}</style>
            </div>

            {isWon && <Success rewardType={journey.rewardType} reward={reward} loading={isUnlocking}/>}
        </div>
    );
}