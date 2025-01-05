import { useState, useEffect } from 'react';
import { Unlock } from '@/lib/unlock';
import Success from '../success';

export default function Journey13({ journey, reward, progress }) {
    const [pattern, setPattern] = useState([]);
    const [playerPattern, setPlayerPattern] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [failedStage, setFailedStage] = useState(false);
    const [isShowingPattern, setIsShowingPattern] = useState(false);
    const [stage, setStage] = useState(0);
    const [isWon, setIsWon] = useState(false);
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [mistakes, setMistakes] = useState(0);
    const [timeLeft, setTimeLeft] = useState(null);
    
    const gridSize = 9; // 3x3 grid
    const maxStages = 5;
    const maxMistakes = 2;

    const generatePattern = (length) => { 
        console.log(length, Array(length).fill(0).map(() => Math.floor(Math.random() * gridSize)));
               
        return Array(length).fill(0).map(() => Math.floor(Math.random() * gridSize));
    };

    const calculateTimeForStage = (patternLength, stageNum) => {
        // Base time: 3 seconds per element, decreasing with stage
        const timePerElement = 3000 - (stageNum * 200);
        return Math.max(patternLength * timePerElement, patternLength * 1500); // Minimum 1.5s per element
    };

    const startStage = async () => {
        const buttons = document.querySelectorAll('.seq');
        buttons.forEach(button => button.innerHTML = '');

        setIsShowingPattern(true);
        setPlayerPattern([]);
        setFailedStage(false);

        // Calculate pattern length based on stage (3 for stage 1, +1 each stage)
        console.log(stage);
        
        const patternLength = Math.min(2 + stage, 7); // Cap at 7 elements
        console.log(patternLength);
        
        const newPattern = generatePattern(patternLength);
        setPattern(newPattern);

        const displayTime = Math.max(1000 - (stage * 50), 600); // Minimum 600ms display
        const pauseTime = 400; // Consistent pause between elements

        try {
            for (const tile of newPattern) {
                await new Promise(resolve => {
                    const button = document.querySelector(`[data-index="${tile}"]`);
                    if (!button) throw new Error('Button not found');
                    
                    button.classList.add("bg-purple-600");
                    setTimeout(() => {
                        button.classList.remove("bg-purple-600");
                        resolve();
                    }, displayTime);
                });
                await new Promise(resolve => setTimeout(resolve, pauseTime));
            }

            setIsShowingPattern(false);
            setIsPlaying(true);
            setTimeLeft(calculateTimeForStage(patternLength, stage));
        } catch (error) {
            console.error('Error in pattern display:', error);
            setMistakes(prev => prev + 1);
            setFailedStage(true);
        }
    };

    useEffect(() => {
        if (timeLeft === null || !isPlaying) return;
        
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 0) {
                    setIsPlaying(false);
                    setMistakes(prev => prev + 1);
                    return null;
                }
                return prev - 10;
            });
        }, 10);

        return () => clearInterval(timer);
    }, [timeLeft, isPlaying]);

    // Add new useEffect to watch stage changes
    useEffect(() => {
        if (stage > 0) {
            startStage();
        }
    }, [stage]);

    const handleTileClick = async (index) => {
        if (!isPlaying || isShowingPattern) return;

        const newPlayerPattern = [...playerPattern, index];
        setPlayerPattern(newPlayerPattern);

        const button = document.querySelector(`[data-index="${index}"]`);
        
        // Check if wrong tile was clicked
        if (pattern[playerPattern.length] !== index) {
            if (button) button.innerHTML = '❌';
            setIsPlaying(false);
            setFailedStage(true);
            setMistakes(prev => prev + 1);
            return;
        }

        // Visual feedback for correct click
        if (button) {
            button.classList.add('bg-purple-600');
        }

        // Check if pattern is complete
        if (newPlayerPattern.length === pattern.length) {
            setIsPlaying(false);
            if (stage === maxStages) {
                setIsWon(true);
                setIsUnlocking(true);
                const unlocked = await Unlock(progress, journey.rewardType, reward._id);
                if (unlocked) setIsUnlocking(false);
            }
        }
    };

    return (
        <div className="flex flex-col items-center p-4">
            <div className="mb-4 flex flex-col w-full items-center justify-center text-center">
                <div className='flex justify-between w-full'>
                    <p className="text-xl">Stage {stage === 0 ? 1 : stage}/{maxStages}</p>
                    <p className="text-red-500">Mistakes: {mistakes}/{maxMistakes}</p>
                </div>
                {timeLeft !== null && (
                    <div className="w-full max-w-xs bg-gray-200 h-2 rounded-full mt-2 overflow-hidden">
                        <div 
                            className="h-full bg-pink-500 rounded-full transition-all duration-10"
                            style={{ 
                                width: `${Math.min((timeLeft / calculateTimeForStage(pattern.length, stage)) * 100, 100)}%` 
                            }}
                        />
                    </div>
                )}
            </div>

            <div className="grid grid-cols-3 gap-2 bg-purple-100 p-2 rounded-lg">
                {Array(gridSize).fill(null).map((_, index) => (
                    <button
                        key={index}
                        data-index={index}
                        onClick={() => handleTileClick(index)}
                        disabled={!isPlaying || isShowingPattern}
                        className={`seq w-16 h-16 sm:w-20 sm:h-20 
                            rounded-lg transition-all duration-300 ease-in-out
                            flex items-center justify-center text-2xl
                            ${isPlaying ? 'bg-purple-200 hover:bg-purple-300' : 'bg-purple-200'}
                            ${playerPattern.includes(index) ? 'bg-purple-600' : ''}
                            transform hover:scale-105 active:scale-95
                        `}
                    />
                ))}
            </div>

            {mistakes >= maxMistakes ? (
                <div className="text-center mt-4">
                    <p className="text-red-500 mb-2">Game Over!</p>
                    <button 
                        onClick={() => {
                            setMistakes(0);
                            setPattern([]);
                            setStage(1);
                        }}
                        className="px-4 py-2 bg-purple-500 text-white rounded-lg"
                    >
                        Try Again
                    </button>
                </div>
            ) : !isPlaying && !isShowingPattern && !isWon ? (
                <button
                    onClick={() => {
                        if (!failedStage) {
                            setStage(prev => prev + 1);
                        } else {
                            startStage();
                        }
                    }}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg mt-4"
                >
                    {stage === 0 ? 'Start Game' 
                    : failedStage ? 'Try Again' 
                    : 'Next Pattern'}
                </button>
            ) : null}

            <p className="mt-4 text-gray-600 font-bold">
                {isShowingPattern ? '👀 Watch carefully!' : 
                 isPlaying ? '🎯 Repeat the pattern!' : 
                 ''}
            </p>

            {isWon && <Success rewardType={journey.rewardType} reward={reward} loading={isUnlocking}/>}
        </div>
    );
}