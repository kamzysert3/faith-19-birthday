import { useState, useEffect } from 'react';
import { Unlock } from '@/lib/unlock';
import Success from '../success';

export default function Journey8({ journey, reward, progress }) {
    const [candles, setCandles] = useState([]);
    const [matches, setMatches] = useState(15);
    const [level, setLevel] = useState(1);
    const [isWon, setIsWon] = useState(false);
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [wind, setWind] = useState({ direction: 1, strength: 0 });
    const [blownOutCandles, setBlownOutCandles] = useState([]);
    const [gameOver, setGameOver] = useState(false);

    const initializeLevel = () => {
        const candleCount = 4 + level;
        const newCandles = Array(candleCount).fill(null).map((_, index) => ({
            id: index,
            lit: false,
            required: index < level + 2,
            protected: false,
            position: index
        }));
        setCandles(newCandles.sort(() => Math.random() - 0.5));
        setWind({ direction: Math.random() > 0.5 ? 1 : -1, strength: level * 0.25 });
        setMatches(3 * ((level + 2) - 1)); // Reset matches when initializing level
        setGameOver(false);
    };

    useEffect(() => {
        initializeLevel();
    }, [level]);

    const lightCandle = (candleIndex) => {
        if (matches <= 0) return;

        setMatches(prev => prev - 1);
        const newCandles = [...candles];
        
        // Light selected candle
        newCandles[candleIndex].lit = true;
        
        // Wind effects
        if (Math.random() < wind.strength) {
            // Wind can blow out nearby candles EXCEPT the one just lit
            const affected = newCandles.filter(c => 
                Math.abs(c.position - newCandles[candleIndex].position) <= 1 &&
                c.lit &&
                !c.protected &&
                newCandles.indexOf(c) !== candleIndex  // Don't affect the candle being lit
            );
            
            // Show wind effect for affected candles
            setBlownOutCandles(affected.map(c => c.id));
            setTimeout(() => setBlownOutCandles([]), 1000);

            affected.forEach(c => c.lit = false);
        }

        setCandles(newCandles);

        // Check win condition
        setTimeout(() => {
            const allRequired = newCandles.every(c => !c.required || c.lit);
            if (allRequired) {
                if (level >= 3) {
                    setIsWon(true);
                    setIsUnlocking(true);
                    Unlock(progress, journey.rewardType, reward._id)
                        .then(success => {
                            if (success) setIsUnlocking(false);
                        });
                } else {
                    setLevel(prev => prev + 1);
                }
            } else {                
                if ((matches - 1) === 0) setGameOver(true);
            }
        }, 500)
    };

    const protectCandle = (index) => {
        if (matches < 2) return; // Costs 2 matches to protect
        setMatches(prev => {
            if (prev - 2 === 0) setGameOver(true);
            return prev - 2
        });
        setCandles(prev => prev.map((c, i) => 
            i === index ? { ...c, protected: true } : c
        ));
    };

    const handleCandle = (index) => {
        // Handle both click and touch
        if (matches <= 0) return;

        // First click/tap lights the candle
        if (!candles[index].lit) {
            lightCandle(index);
        } else if (!candles[index].protected) {
            // Long press/right click to protect lit candles
            protectCandle(index);
        }
    };

    const handleLongPress = (index) => {
        if (!candles[index].lit || candles[index].protected) return;
        protectCandle(index);
    };

    return (
        <div className="flex flex-col items-center p-4 w-full max-w-lg mx-auto select-none">
            <div className="text-xl mb-4">Level {level} - Matches: {matches}</div>
            
            <div className="relative w-full bg-gradient-to-b from-pink-50 to-pink-100 p-6 rounded-lg">
                {/* Wind indicator */}
                <div className="absolute top-2 left-2 flex items-center gap-2">
                    <span className="text-sm">Wind:</span>
                    <div className={`text-2xl transform ${wind.direction > 0 ? 'rotate-0' : 'rotate-180'}`}>
                        {'💨'.repeat(Math.ceil(wind.strength * 5))}
                    </div>
                </div>

                <div className="flex justify-center flex-wrap gap-2 px-2 mt-8">
                    {candles.map((candle, index) => (
                        <div key={index} className="relative">
                            {/* Wind effect animation */}
                            {blownOutCandles.includes(candle.id) && (
                                <div className="absolute -right-4 top-0 animate-wind-blow z-5">
                                    💨
                                </div>
                            )}
                            
                            <div 
                                className="relative group"
                                onClick={() => handleCandle(index)}
                                onContextMenu={(e) => {
                                    e.preventDefault();
                                    handleLongPress(index);
                                }}
                                onTouchStart={() => {
                                    candle.timer = setTimeout(() => handleLongPress(index), 500);
                                }}
                                onTouchEnd={() => {
                                    if (candle.timer) clearTimeout(candle.timer);
                                }}
                            >

                                {/* Candle container */}
                                <div className={`w-14 h-20 relative transition-all duration-300
                                    ${candle.lit ? 'scale-110' : 'scale-100 hover:scale-105'}
                                    ${candle.required ? 'z-5' : ''}
                                    ${blownOutCandles.includes(candle.id) ? 'animate-shake' : ''}`}
                                >
                                    {/* Candle body */}
                                    <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-12 
                                        ${candle.required ? 'bg-pink-200' : 'bg-white'} rounded`}
                                    />
                                    
                                    {/* Flame */}
                                    {candle.lit && (
                                        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2">
                                            <div className="w-4 h-6 bg-yellow-500 rounded-full animate-flicker" />
                                            <div className="w-2 h-2 bg-orange-500 rounded-full mx-auto -mt-1" />
                                        </div>
                                    )}

                                    {/* Shield indicator */}
                                    {candle.protected && (
                                        <div className="absolute -top-3 -right-3 text-sm animate-bounce">
                                            🛡️
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                @keyframes flicker {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }
                .animate-flicker {
                    animation: flicker 0.3s ease-in-out infinite;
                }

                @keyframes wind-blow {
                    0% { 
                        opacity: 0;
                        transform: translateX(-10px);
                    }
                    20% { 
                        opacity: 1;
                    }
                    100% { 
                        opacity: 0;
                        transform: translateX(20px);
                    }
                }
                .animate-wind-blow {
                    animation: wind-blow 1s ease-out forwards;
                }
                
            `}</style>

            <div className="mt-6 text-center space-y-2">
                <p className="text-sm text-gray-600">
                    {gameOver ? (
                        <button 
                            onClick={() => initializeLevel()} 
                            className="px-4 py-2 bg-pink-400 text-white rounded-full"
                        >
                            Try Again
                        </button>
                    ) : (
                        <>
                            Tap to light candles
                            <br />
                            Tap on a lit candle to protect it (costs 2 matches)
                            <br />
                            <span className="text-pink-500">Light all pink candles to advance!</span>
                        </>
                    )}
                </p>
            </div>

            {isWon && <Success rewardType={journey.rewardType} reward={reward} loading={isUnlocking}/>}
        </div>
    );
}