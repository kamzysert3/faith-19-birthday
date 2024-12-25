import { useState, useEffect } from 'react';
import { Unlock } from '@/lib/unlock';
import Success from '../success';

export default function Journey5({ journey, reward, progress }) {
    const [sequence, setSequence] = useState([]);
    const [playerSequence, setPlayerSequence] = useState([]);
    const [balloons, setBalloons] = useState([]);
    const [score, setScore] = useState(0);
    const [isWon, setIsWon] = useState(false);
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [showingSequence, setShowingSequence] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [isWrong, setIsWrong] = useState(false);
    const [wrongSequence, setWrongSequence] = useState([]);

    const colors = [
        { name: 'pink', bg: 'bg-pink-400', text: 'text-pink-400' },
        { name: 'purple', bg: 'bg-purple-400', text: 'text-purple-400' },
        { name: 'blue', bg: 'bg-blue-400', text: 'text-blue-400' },
        { name: 'green', bg: 'bg-green-400', text: 'text-green-400' }
    ];

    const generateSequence = () => {
        // Track available colors to ensure sequence is possible
        const availableColors = colors.reduce((acc, color) => {
            acc[color.name] = 2; // Each color appears twice in balloons
            return acc;
        }, {});

        const newSequence = Array(4).fill(null).map(() => {
            // Filter colors that are still available
            const possibleColors = colors.filter(color => availableColors[color.name] > 0);
            const selectedColor = possibleColors[Math.floor(Math.random() * possibleColors.length)];
            availableColors[selectedColor.name]--; // Decrease available count
            return selectedColor;
        });

        setSequence(newSequence);
        return newSequence;
    };

    const generateBalloons = () => {
        // Ensure exactly two of each color
        const balloonPairs = colors.flatMap(color => [
            { id: color.name + '1', color, isPopped: false },
            { id: color.name + '2', color, isPopped: false }
        ]);
        
        // Shuffle the pairs
        const shuffledBalloons = balloonPairs.sort(() => Math.random() - 0.5);
        setBalloons(shuffledBalloons);
    };

    const startNewRound = () => {
        setPlayerSequence([]);
        setShowingSequence(true);
        setActiveIndex(-1);
        const newSequence = generateSequence();
        generateBalloons();

        // Show sequence animation
        newSequence.forEach((color, index) => {
            setTimeout(() => {
                setActiveIndex(index);
                if (index === newSequence.length - 1) {
                    setTimeout(() => {
                        setShowingSequence(false);
                        setActiveIndex(-1);
                    }, 1000);
                }
            }, (index + 1) * 1000);
        });
    };

    useEffect(() => {
        startNewRound();
    }, []);

    const handleBalloonClick = (balloon) => {
        if (balloon.isPopped || showingSequence) return;

        setBalloons(prev => prev.map(b => 
            b.id === balloon.id ? { ...b, isPopped: true } : b
        ));

        setPlayerSequence(prev => {
            const newSequence = [...prev, balloon.color];
            
            // Check if sequence matches so far
            for (let i = 0; i < newSequence.length; i++) {
                if (newSequence[i].name !== sequence[i].name) {
                    setIsWrong(true);
                    setWrongSequence(newSequence);
                    setTimeout(() => {
                        setIsWrong(false);
                        setWrongSequence([]);
                        startNewRound();
                    }, 1000);
                    return [];
                }
            }

            // Check if sequence is complete
            if (newSequence.length === sequence.length) {
                setTimeout(() => { 
                    setScore(() => {
                        if (score + 1 >= 5 && !isWon) {
                            setIsWon(true);
                            setIsUnlocking(true);
                            Unlock(progress, journey.rewardType, reward._id)
                                .then(success => {
                                    if (success) setIsUnlocking(false);
                                });
                        }
                        return (score + 1);
                    });                
                    setTimeout(startNewRound, 1000);
                    return [];
                }, 500);
            }

            return newSequence;
        });
    };

    return (
        <div className="flex flex-col items-center p-4 w-full max-w-lg mx-auto">
            <div className="text-xl mb-4">Score: {score}/5</div>

            {/* Sequence display with wrong sequence feedback */}
            <div className="flex gap-2 mb-8">
                {sequence.map((color, index) => (
                    <div
                        key={index}
                        className={`w-8 h-8 rounded-full transition-all duration-300 
                            ${showingSequence && index <= activeIndex
                                ? color.bg
                                : isWrong && index < wrongSequence.length
                                ? `${wrongSequence[index].bg} animate-shake`
                                : !showingSequence && index < playerSequence.length
                                ? playerSequence[index].bg
                                : 'bg-gray-200'
                            }
                        `}
                    />
                ))}
            </div>

            {/* Add shake animation class to globals.css */}
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

            {/* Balloons grid */}
            <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                {balloons.map(balloon => (
                    <button
                        key={balloon.id}
                        onClick={() => handleBalloonClick(balloon)}
                        disabled={balloon.isPopped}
                        className={`
                            aspect-square w-full rounded-full transform transition-all duration-300
                            ${balloon.isPopped 
                                ? 'opacity-0 scale-90' 
                                : `${balloon.color.bg} hover:scale-110 active:scale-95`
                            }
                        `}
                    >
                        🎈
                    </button>
                ))}
            </div>

            <p className="mt-6 text-gray-600 text-center text-sm sm:text-base">
                {showingSequence 
                    ? "Watch the sequence..." 
                    : isWrong
                    ? "Wrong sequence! Try again..."
                    : "Pop the balloons in the same color sequence!"
                }
            </p>

            {isWon && <Success rewardType={journey.rewardType} reward={reward} loading={isUnlocking}/>}
        </div>
    );
}