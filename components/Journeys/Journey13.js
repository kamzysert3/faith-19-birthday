import { useState, useEffect } from 'react';
import { Unlock } from '@/lib/unlock';
import Success from '../success';

export default function Journey15({ journey, reward, progress }) {
    const [jars, setJars] = useState([]);
    const [selectedJar, setSelectedJar] = useState(null);
    const [moves, setMoves] = useState(0);
    const [isWon, setIsWon] = useState(false);
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [level, setLevel] = useState(1);
    const [totalScore, setTotalScore] = useState(0);
    const [levelLost, setLevelLost] = useState(false);

    const JAR_CAPACITY = 4;

    const LEVELS = {
        1: { jars: 4, colors: ['🔴', '🔵', '🟡', '🟢'], moves: 25 },
        2: { jars: 5, colors: ['🔴', '🔵', '🟡', '🟢', '🟣'], moves: 30 },
        3: { jars: 5, colors: ['🔴', '🔵', '🟡', '🟢', '⚪'], moves: 25 },
        4: { jars: 6, colors: ['🔴', '🔵', '🟡', '🟢', '🟣', '⚪'], moves: 35 }
    };

    const initializeGame = () => {
        const currentLevel = LEVELS[level];
        const mixedBubbles = currentLevel.colors.flatMap(color => 
            Array(JAR_CAPACITY).fill(color)
        ).sort(() => Math.random() - 0.5);
        
        const initialJars = [];
        for (let i = 0; i < currentLevel.jars; i++) {
            initialJars.push(mixedBubbles.slice(i * 4, (i + 1) * 4));
        }
        initialJars.push([]); // Empty jar for moves
        
        setJars(initialJars);
        setSelectedJar(null);
        setMoves(0);
        setLevelLost(false);
        setIsWon(false);
    };

    useEffect(() => {
        initializeGame();
    }, [level]);

    const handleWin = () => {
        const newScore = totalScore + (LEVELS[level].moves - moves);
        setTotalScore(newScore);
        
        if (level < Object.keys(LEVELS).length) {
            // Advance to next level
            setTimeout(() => {
                setLevel(prev => prev + 1);
            }, 1000);
        } else {
            // Game completed
            setIsWon(true);
            setIsUnlocking(true);
            Unlock(progress, journey.rewardType, reward._id)
                .then(success => {
                    if (success) setIsUnlocking(false);
                });
        }
    };

    const checkWin = (currentJars) => {
        let completedJars = 0;
        currentJars.forEach(jar => {
            if (jar.length === JAR_CAPACITY) {
                const firstBubble = jar[0];
                if (jar.every(bubble => bubble === firstBubble)) {
                    completedJars++;
                }
            }
        });
        return completedJars === LEVELS[level].colors.length;
    };

    const handleJarClick = (jarIndex) => {
        if (moves >= LEVELS[level].moves) return;

        if (selectedJar === null) {
            if (jars[jarIndex].length > 0) {
                setSelectedJar(jarIndex);
            }
        } else {
            if (selectedJar !== jarIndex && jars[jarIndex].length < JAR_CAPACITY) {
                const newJars = [...jars];
                const bubble = newJars[selectedJar].pop();
                newJars[jarIndex].push(bubble);
                
                const newMoves = moves + 1;
                setMoves(newMoves);
                
                // Check win condition first
                if (checkWin(newJars)) {
                    setJars(newJars);
                    handleWin();
                    setSelectedJar(null);
                    return; // Exit early if won
                }
                
                // If not won, update jars and check for level failure
                setJars(newJars);
                if (newMoves >= LEVELS[level].moves) {
                    setLevelLost(true);
                }
            }
            setSelectedJar(null);
        }
    };

    return (
        <div className="flex flex-col items-center p-4 max-w-lg mx-auto">
            <div className="mb-4 text-center">
                <div className="text-lg font-bold mb-2">Level {level}</div>
                <div className="flex justify-between gap-4 text-sm">
                    <div>Score: {totalScore}</div>
                    <div className={moves >= LEVELS[level].moves ? 'text-red-500 font-bold' : ''}>
                        Moves: {moves}/{LEVELS[level].moves}
                    </div>
                </div>
            </div>

            <div className="flex gap-3 flex-wrap justify-center mb-8">
                {jars.map((jar, index) => (
                    <div
                        key={index}
                        onClick={() => handleJarClick(index)}
                        className={`relative w-14 h-32 bg-gray-100 rounded-lg p-2 cursor-pointer
                            flex flex-col-reverse gap-1 items-center
                            ${selectedJar === index ? 'ring-2 ring-pink-500' : ''}
                            ${jar.length === 0 ? 'bg-gray-50 border-2 border-dashed border-gray-300' : ''}
                            hover:bg-gray-50 transition-all duration-200`}
                        style={{ borderRadius: '0 0 20px 20px' }}
                    >
                        {jar.map((bubble, i) => (
                            <div
                                key={i}
                                className={`w-8 h-8 flex items-center justify-center text-xl
                                    transition-all duration-300
                                    ${selectedJar === index && i === jar.length - 1 
                                        ? 'transform hover:scale-110' 
                                        : ''}`}
                            >
                                {bubble}
                            </div>
                        ))}
                        {/* Empty spaces */}
                        {Array(JAR_CAPACITY - jar.length).fill(null).map((_, i) => (
                            <div key={`empty-${i}`} className="w-8 h-8" />
                        ))}
                    </div>
                ))}
            </div>

            <div className="text-center space-y-4">
                <p className="text-gray-600 text-sm">
                    Sort the bubbles by moving them between jars.
                    <br />
                    Make each jar contain only one color!
                </p>
                <button
                    onClick={initializeGame}
                    className="px-4 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600"
                >
                    Reset Game
                </button>
            </div>

            {moves >= LEVELS[level].moves && levelLost && !isWon && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg text-center">
                        <h2 className="text-xl mb-2">Level {level} Failed!</h2>
                        <p className="mb-4">Try again to complete this level</p>
                        <button
                            onClick={initializeGame}
                            className="px-4 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600"
                        >
                            Retry Level
                        </button>
                    </div>
                </div>
            )}

            {isWon && <Success rewardType={journey.rewardType} reward={reward} loading={isUnlocking}/>}
        </div>
    );
}