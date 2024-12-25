import { useState, useEffect } from 'react';
import { Unlock } from '@/lib/unlock';
import Success from '../success';

const words = ['BIRTHDAY', 'PRESENT', 'CANDLES', 'BALLOON', 'CONFETTI', 'CELEBRATE'];
let availableWords = [...words];

export default function Journey4({ journey, reward, progress }) {
    const [currentWord, setCurrentWord] = useState('');
    const [scrambled, setScrambled] = useState([]);
    const [solution, setSolution] = useState([]);
    const [score, setScore] = useState(0);
    const [isWon, setIsWon] = useState(false);
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [selectedLetter, setSelectedLetter] = useState(null);
    const [isWrong, setIsWrong] = useState(false);

    const scrambleWord = (word) => {
        return word.split('')
            .sort(() => Math.random() - 0.5)
            .map((letter, index) => ({
                id: index,
                letter,
                isPlaced: false
            }));
    };

    const initializeGame = () => {
        const word = availableWords[Math.floor(Math.random() * availableWords.length)];
        availableWords = availableWords.filter((w) => w != word);
        if (availableWords.length === 0) availableWords = [...words];
        setCurrentWord(word);
        setScrambled(scrambleWord(word));
        setSolution(Array(word.length).fill(null));
    };

    useEffect(() => {
        initializeGame();
    }, []);

    const handleDragStart = (e, letter, index, fromSolution = false) => {
        e.dataTransfer.setData('letterIndex', index.toString());
        e.dataTransfer.setData('fromSolution', fromSolution.toString());
    };

    const handleTouchStart = (letter, index, fromSolution = false) => {
        setSelectedLetter({ letter, index, fromSolution });
    };

    const handleTouchEndSlot = (targetIndex) => {
        if (!selectedLetter) return;

        if (selectedLetter.fromSolution) {
            // Return to tray
            handleReturnDrop({
                preventDefault: () => {},
                dataTransfer: {
                    getData: (key) => key === 'letterIndex' ? selectedLetter.index.toString() : 'true'
                }
            });
        } else {
            // Place in slot
            handleDrop({
                preventDefault: () => {},
                dataTransfer: {
                    getData: (key) => key === 'letterIndex' ? selectedLetter.index.toString() : 'false'
                }
            }, targetIndex);
        }
        setSelectedLetter(null);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleReturnDrop = (e) => {
        e.preventDefault();
        const sourceIndex = parseInt(e.dataTransfer.getData('letterIndex'));
        const fromSolution = e.dataTransfer.getData('fromSolution') === 'true';

        if (!fromSolution) return; // Only handle letters from solution

        // Find the original letter in scrambled array
        const letterToReturn = solution[sourceIndex];
        if (!letterToReturn) return;

        // Find original position in scrambled array
        const originalIndex = scrambled.findIndex(item => 
            item.id === letterToReturn.id
        );

        if (originalIndex !== -1) {
            // Return letter to scrambled array
            const newScrambled = [...scrambled];
            newScrambled[originalIndex] = { ...newScrambled[originalIndex], isPlaced: false };
            setScrambled(newScrambled);

            // Remove letter from solution
            const newSolution = [...solution];
            newSolution[sourceIndex] = null;
            setSolution(newSolution);
        }
    };

    const handleDrop = (e, targetIndex) => {
        e.preventDefault();
        const sourceIndex = parseInt(e.dataTransfer.getData('letterIndex'));
        const fromSolution = e.dataTransfer.getData('fromSolution') === 'true';

        // Validate indices
        if (isNaN(sourceIndex) || targetIndex < 0 || targetIndex >= solution.length) return;

        // Create new arrays first
        const newSolution = [...solution];
        const newScrambled = [...scrambled];

        // If slot is already filled, don't allow drop
        if (newSolution[targetIndex] !== null) return;

        if (fromSolution) {
            // Handle moving letters between solution slots
            const letterToMove = newSolution[sourceIndex];
            if (!letterToMove) return;

            newSolution[sourceIndex] = null;
            newSolution[targetIndex] = letterToMove;
            setSolution(newSolution);
        } else {
            // Handle dropping from scrambled tray
            const letterToMove = newScrambled[sourceIndex];
            if (!letterToMove || letterToMove.isPlaced) return;

            newSolution[targetIndex] = letterToMove;
            newScrambled[sourceIndex] = { ...letterToMove, isPlaced: true };

            setSolution(newSolution);
            setScrambled(newScrambled);
        }

        // Check if word is complete
        if (!newSolution.includes(null)) {
            const word = newSolution.map(l => l.letter).join('');
            if (word === currentWord) {
                setScore(prev => {
                    const newScore = prev + 1;
                    if (newScore >= 5 && !isWon) {
                        setIsWon(true);
                        setIsUnlocking(true);
                        Unlock(progress, journey.rewardType, reward._id)
                            .then(success => {
                                if (success) setIsUnlocking(false);
                            });
                    }
                    return newScore;
                });
                setTimeout(initializeGame, 1000);
            } else {
                // Wrong word feedback
                setIsWrong(true);
                setTimeout(() => {
                    setIsWrong(false);
                    // Return all letters to tray
                    const newScrambled = [...scrambled];
                    newSolution.forEach(letter => {
                        if (letter) {
                            const index = scrambled.findIndex(item => item.id === letter.id);
                            if (index !== -1) {
                                newScrambled[index] = { ...newScrambled[index], isPlaced: false };
                            }
                        }
                    });
                    setScrambled(newScrambled);
                    setSolution(Array(currentWord.length).fill(null));
                }, 1000);
            }
        }
    };

    return (
        <div className="flex flex-col items-center p-4 w-full max-w-lg mx-auto">
            <div className="text-xl mb-4">Score: {score}/5</div>

            {/* Solution spaces with wrong animation */}
            <div className="flex gap-1 sm:gap-2 mb-8 justify-center">
                {solution.map((slot, index) => (
                    <div
                        key={index}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                        onTouchEnd={() => handleTouchEndSlot(index)}
                        className={`w-8 h-8 sm:w-12 sm:h-12 border-2 rounded flex items-center justify-center 
                            text-xl sm:text-2xl font-bold bg-white
                            ${isWrong ? 'animate-shake border-red-500' : 
                              slot ? 'border-pink-500' : 
                              selectedLetter && !slot ? 'border-pink-400 bg-pink-50' : 
                              'border-pink-300'}
                            ${selectedLetter ? 'transition-colors duration-200' : ''}`}
                    >
                        {slot && (
                            <div
                                draggable
                                onDragStart={(e) => handleDragStart(e, slot.letter, index, true)}
                                onTouchStart={() => handleTouchStart(slot.letter, index, true)}
                                className={`w-full h-full flex items-center justify-center 
                                    ${selectedLetter?.index === index && selectedLetter?.fromSolution ? 'opacity-50' : ''}`}
                            >
                                {slot.letter}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Add shake animation if not already in globals.css */}
            <style jsx global>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-shake {
                    animation: shake 0.2s ease-in-out 3;
                }
            `}</style>

            {/* Scrambled letters tray */}
            <div
                className="flex gap-2 flex-wrap justify-center p-4 bg-gray-100 rounded-lg min-h-[80px]"
                onDragOver={handleDragOver}
                onDrop={handleReturnDrop}
                onTouchEnd={() => selectedLetter?.fromSolution && handleTouchEndSlot(-1)}
            >
                {scrambled.map((item, index) => (
                    <div
                        key={item.id}
                        draggable={!item.isPlaced}
                        onDragStart={(e) => handleDragStart(e, item.letter, index, false)}
                        onTouchStart={() => !item.isPlaced && handleTouchStart(item.letter, index, false)}
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded flex items-center justify-center text-xl sm:text-2xl font-bold
                            ${item.isPlaced ? 'opacity-0 pointer-events-none' : 
                              selectedLetter?.index === index && !selectedLetter?.fromSolution ? 'bg-pink-600 scale-95' : 'bg-pink-400'}
                            ${!item.isPlaced ? 'text-white hover:bg-pink-500 active:scale-95' : ''}
                            transition-all duration-200`}
                    >
                        {item.letter}
                    </div>
                ))}
            </div>

            <button
                onClick={initializeGame}
                className="mt-6 px-4 py-2 bg-pink-100 shadow rounded-full hover:bg-pink-200 text-sm sm:text-base"
            >
                Skip Word
            </button>

            <p className="mt-4 text-gray-600 text-center text-sm sm:text-base">
                {isWrong 
                    ? "Wrong word! Try again..."
                    : "Unscramble the birthday themed word!"
                }
            </p>

            {isWon && <Success rewardType={journey.rewardType} reward={reward} loading={isUnlocking}/>}
        </div>
    );
}