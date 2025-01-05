import { useState, useEffect, useRef } from 'react';
import { Unlock } from '@/lib/unlock';
import Success from '../success';

export default function Journey3({ journey, reward, progress }) {
    const [score, setScore] = useState(0);
    const [holes, setHoles] = useState(Array(9).fill(null));
    const [isWon, setIsWon] = useState(false);
    const [isUnlocking, setIsUnlocking] = useState(false);
    
    // Separate good and bad items
    const goodItems = ['🎂', '🎁', '🎈', '🎊', '🎉'];
    const badItems = ['💣', '💣', '💣', '💣', '💣'];
    const timeoutRef = useRef(null);
    const activeTimeouts = useRef([]);

    const popUpItem = () => {
        if (isWon) return;
        
        const emptyHoles = holes.map((_, idx) => idx).filter(idx => !holes[idx]);
        if (emptyHoles.length === 0) return;

        // Ensure only one hole is active initially
        const activeHoles = holes.filter(hole => hole !== null).length;
        if (activeHoles > 0) return;

        const randomHole = emptyHoles[Math.floor(Math.random() * emptyHoles.length)];
        // 70% chance for good items, 30% for bad items
        const isGoodItem = Math.random() < 0.7;
        const items = isGoodItem ? goodItems : badItems;
        const randomItem = items[Math.floor(Math.random() * items.length)];

        setHoles(prev => {
            const newHoles = [...prev];
            newHoles[randomHole] = randomItem;
            return newHoles;
        });

        // Store timeout ID to clear it properly
        const disappearTimeout = setTimeout(() => {
            setHoles(prev => {
                const newHoles = [...prev];
                if (newHoles[randomHole] === randomItem) { // Only clear if item hasn't changed
                    newHoles[randomHole] = null;
                }
                return newHoles;
            });
            
            // Remove this timeout from active timeouts
            activeTimeouts.current = activeTimeouts.current.filter(t => t !== disappearTimeout);
            
            // Start next item after current one disappears
            timeoutRef.current = setTimeout(popUpItem, Math.random() * 300 + 200);
        }, Math.random() * 1000 + 1000);

        activeTimeouts.current.push(disappearTimeout);
    };

    useEffect(() => {
        // Add initial delay before first item appears
        const initialDelay = setTimeout(popUpItem, 500);
        return () => {
            clearTimeout(initialDelay);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            activeTimeouts.current.forEach(timeout => clearTimeout(timeout));
        };
    }, []);

    const whack = (index) => {
        if (!holes[index] || isWon) return;

        const item = holes[index];
        const isGoodItem = goodItems.includes(item);
        
        // Update score (don't go below 0)
        setScore(prev => {
            const newScore = isGoodItem ? prev + 1 : Math.max(0, prev - 2);
            
            // Check win condition
            if (newScore >= 20 && !isWon) {
                setIsWon(true);
                setIsUnlocking(true);
                Unlock(progress, journey.rewardType, reward._id)
                    .then(success => {
                        if (success) setIsUnlocking(false);
                    });
            }
            
            return newScore;
        });

        // Clear hole immediately
        setHoles(prev => {
            const newHoles = [...prev];
            newHoles[index] = null;
            return newHoles;
        });
    };

    return (
        <div className="flex flex-col items-center p-4 w-full max-w-sm mx-auto">
            <div className="text-xl mb-4">Score: {score}/20</div>
            <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full bg-gradient-to-b from-pink-50 to-pink-100 p-3 sm:p-6 rounded-lg">
                {holes.map((item, index) => (
                    <button
                        key={index}
                        onClick={() => whack(index)}
                        className={`aspect-square w-full flex items-center justify-center text-2xl sm:text-4xl
                            ${item ? 'bg-white shadow-lg' : 'bg-gray-300'}
                            transition-all duration-100 hover:scale-105 rounded-full`}
                    >
                        {item ?? '⚫'}
                    </button>
                ))}
            </div>
            <p className="mt-4 text-gray-600 text-center text-sm sm:text-base">
                Whack the birthday items for points! 
                <br />
                Watch out for Bombs - they reduce your score!
            </p>
            {isWon && <Success rewardType={journey.rewardType} reward={reward} loading={isUnlocking}/>}
        </div>
    );
}