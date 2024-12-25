import { useState, useEffect, useRef } from 'react';
import { Unlock } from '@/lib/unlock';
import Success from '../success';

export default function Journey6({ journey, reward, progress }) {
    const [score, setScore] = useState(0);
    const [isWon, setIsWon] = useState(false);
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [balloons, setBalloons] = useState([]);
    const [arrow, setArrow] = useState(null);
    const [multiplier, setMultiplier] = useState(1);
    const [combo, setCombo] = useState(0);
    const [lastHit, setLastHit] = useState(0);
    const canvasRef = useRef(null);
    const frameRef = useRef(null);
    const containerWidth = useRef(0);
    const isVisibleRef = useRef(true);
    const spawnIntervalRef = useRef(null);

    useEffect(() => {
        // Get and store container width
        if (canvasRef.current) {
            containerWidth.current = canvasRef.current.offsetWidth;
        }
    }, []);

    const spawnBalloon = () => {
        if (isWon) return;
        
        const types = {
            normal: { emoji: '🎈', points: 1, speed: 2 },
            special: { emoji: '🎁', points: 2, speed: 3 },
            golden: { emoji: '🎊', points: 3, speed: 4 },
            bomb: { emoji: '💣', points: -2, speed: 2.5 }
        };

        // Determine balloon type based on probabilities
        const rand = Math.random();
        const type = rand < 0.6 ? 'normal' :
                    rand < 0.8 ? 'special' :
                    rand < 0.9 ? 'golden' : 'bomb';

        const size = type === 'golden' ? 50 : 40;
        const safeArea = containerWidth.current - size * 2; // Account for balloon size
        const spawnX = Math.random() * safeArea + size; // Spawn within safe area

        const balloon = {
            id: Date.now(),
            x: spawnX,
            y: 600,
            size,
            speedY: types[type].speed,
            speedX: (Math.random() - 0.5) * 3, // Horizontal movement
            emoji: types[type].emoji,
            points: types[type].points,
            type,
            bouncing: false // New property for bounce animation
        };
        setBalloons(prev => [...prev, balloon]);
    };

    useEffect(() => {
        spawnIntervalRef.current = setInterval(spawnBalloon, 2000);
        return () => {
            if (spawnIntervalRef.current) {
                clearInterval(spawnIntervalRef.current);
            }
        };
    }, [isWon]);

    const updateGame = () => {
        if (!isVisibleRef.current) return;

        // Update balloons with horizontal movement
        setBalloons(prev => prev
            .filter(balloon => balloon.y > -50)
            .map(balloon => {
                let newX = balloon.x + balloon.speedX;
                let newSpeedX = balloon.speedX;
                let isBouncing = balloon.bouncing;

                // Calculate boundaries based on container width and balloon size
                const leftBoundary = balloon.size;
                const rightBoundary = containerWidth.current - balloon.size;

                // Boundary collision with bounce effect
                if (newX <= leftBoundary || newX >= rightBoundary) {
                    newSpeedX = -balloon.speedX;
                    isBouncing = true;
                    newX = newX <= leftBoundary ? leftBoundary : rightBoundary;

                    // Reset bounce animation after delay
                    setTimeout(() => {
                        setBalloons(current => 
                            current.map(b => 
                                b.id === balloon.id ? { ...b, bouncing: false } : b
                            )
                        );
                    }, 200);
                }

                return {
                    ...balloon,
                    x: newX,
                    y: balloon.y - balloon.speedY,
                    speedX: newSpeedX,
                    bouncing: isBouncing
                };
            })
        );

        // Update arrow if exists
        if (arrow) {
            setArrow(prev => {
                if (!prev) return null;
                
                // Check balloon collisions
                const hit = balloons.find(balloon => 
                    Math.hypot(balloon.x - prev.x, balloon.y - prev.y) < balloon.size/2
                );

                if (hit) {
                    setBalloons(prev => prev.filter(b => b.id !== hit.id));
                    
                    // Handle combo system
                    const now = Date.now();
                    if (now - lastHit < 1000 && hit.type !== 'bomb') {
                        setCombo(prev => Math.min(prev + 1, 5));
                    } else {
                        setCombo(hit.type === 'bomb' ? 0 : 1);
                    }
                    setLastHit(now);

                    setScore(() => {
                        const points = hit.points * (hit.type === 'golden' ? multiplier : 1);
                        const newScore = Math.max(0, score + points * combo);
                        if (newScore >= 30 && !isWon) {
                            setIsWon(true);
                            setIsUnlocking(true);
                            Unlock(progress, journey.rewardType, reward._id)
                                .then(success => {
                                    if (success) setIsUnlocking(false);
                                });
                        }
                        return newScore;
                    });

                    // Special effects for golden balloons
                    if (hit.type === 'golden') {
                        setMultiplier(prev => prev + 0.5);
                        setTimeout(() => setMultiplier(1), 5000);
                    }

                    return null;
                }

                // Remove arrow if off screen
                if (prev.y < -20) return null;

                return {
                    ...prev,
                    y: prev.y - 10
                };
            });
        }

        frameRef.current = requestAnimationFrame(updateGame);
    };

    useEffect(() => {
        frameRef.current = requestAnimationFrame(updateGame);
        return () => cancelAnimationFrame(frameRef.current);
    }, [arrow]);

    // Add visibility change handler
    useEffect(() => {
        const handleVisibilityChange = () => {
            isVisibleRef.current = document.visibilityState === 'visible';
            
            if (!isVisibleRef.current) {
                // Clear all animations and balloons when tab is hidden
                if (frameRef.current) {
                    cancelAnimationFrame(frameRef.current);
                }
                if (spawnIntervalRef.current) {
                    clearInterval(spawnIntervalRef.current);
                }
                setBalloons([]);
            } else {
                // Restart game loop when tab becomes visible
                frameRef.current = requestAnimationFrame(updateGame);
                spawnIntervalRef.current = setInterval(spawnBalloon, 2000);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    // Update container width on resize
    useEffect(() => {
        const handleResize = () => {
            if (canvasRef.current) {
                containerWidth.current = canvasRef.current.offsetWidth;
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleClick = (e) => {
        if (arrow || isWon) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        setArrow({ x, y: 550 });
    };

    return (
        <div className="flex flex-col items-center p-4 w-full max-w-lg mx-auto select-none">
            <div className="flex justify-between w-full text-center">
                <div className="text-xl">Score: {score < 30 ? score : 30}/30</div>
                {combo > 1 && <div className="text-pink-500 font-bold">Combo x{combo}!</div>}
                {multiplier > 1 && <div className="text-yellow-500 font-bold">✨ x{multiplier.toFixed(1)}</div>}
            </div>

            <div 
                ref={canvasRef}
                onClick={handleClick}
                className="relative w-full h-[400px] bg-gradient-to-b from-pink-50 to-pink-100 rounded-lg overflow-hidden cursor-crosshair"
            >
                {/* Balloons */}
                {balloons.map(balloon => (
                    <div
                        key={balloon.id}
                        className={`absolute transition-all duration-200
                            ${balloon.bouncing ? 'scale-x-90 scale-y-110' : 'scale-100'}`}
                        style={{
                            left: `${balloon.x}px`,
                            top: `${balloon.y}px`,
                            fontSize: `${balloon.size}px`,
                            transform: `translate(-50%, -50%) ${balloon.bouncing ? 'scale(0.9, 1.1)' : 'scale(1)'}`,
                            transition: 'transform 0.2s ease-out'
                        }}
                    >
                        {balloon.emoji}
                    </div>
                ))}

                {/* Arrow */}
                {arrow && (
                    <div 
                        className="absolute text-2xl"
                        style={{
                            left: arrow.x,
                            top: arrow.y,
                            transform: 'translate(-50%, -50%) rotate(-45deg)'
                        }}
                    >
                        ➹
                    </div>
                )}
            </div>

            <p className="mt-4 text-gray-600 text-center text-sm sm:text-base">
                🎈 = 1pt | 🎁 = 2pts | 🎊 = 3pts (with multiplier!) | 💣 = -2pts
                <br />
                Quick hits increase your combo! Golden balloons give score multiplier!
            </p>

            {isWon && <Success rewardType={journey.rewardType} reward={reward} loading={isUnlocking}/>}
        </div>
    );
}