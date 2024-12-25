import { useState, useEffect } from "react";
import Success from "../success";
import { Unlock } from "@/lib/unlock";

export default function Journey1({ journey, reward, progress }) {
    const [cards, setCards] = useState([]);
    const [flipped, setFlipped] = useState([]);
    const [solved, setSolved] = useState([]);
    const [moves, setMoves] = useState(0);
    const [isWon, setIsWon] = useState(false);
    const [isUnlocking, setIsUnlocking] = useState(false);

    const emojis = ['🎈', '🎁', '🎂', '🎉', '🎊', '🍰', '🎨', '🎭'];
    
    useEffect(() => {
        initializeGame();
    }, []);

    const initializeGame = () => {
        const shuffledCards = [...emojis, ...emojis]
            .sort(() => Math.random() - 0.5)
            .map((emoji, index) => ({
                id: index,
                content: emoji,
            }));
        setCards(shuffledCards);
        setFlipped([]);
        setSolved([]);
        setMoves(0);
        setIsWon(false);
    };

    const handleCardClick = (id) => {
        if (flipped.length === 2 || flipped.includes(id) || solved.includes(id)) return;
        
        const newFlipped = [...flipped, id];
        setFlipped(newFlipped);

        if (newFlipped.length === 2) {
            setMoves(m => m + 1);
            const [first, second] = newFlipped;
            
            if (cards[first].content === cards[second].content) {
                setSolved(prev => [...prev, first, second]);
                setFlipped([]);
            } else {
                setTimeout(() => setFlipped([]), 1000);
            }
        }
    };

    useEffect(() => {
        const handleUnlock = async () => {
            if (solved.length === cards.length && cards.length > 0 && !isUnlocking) {
                setIsWon(true);
                setIsUnlocking(true);
                const unlocked = await Unlock(progress, journey.rewardType, reward._id);
                if (unlocked) {
                    setIsUnlocking(false);
                }
            }
        };

        handleUnlock();
    }, [solved, cards]);

    return (
        <div className="p-4 w-full max-w-lg mx-auto">
            <div className="grid grid-cols-4 gap-2 sm:gap-4">
                {cards.map((card) => (
                    <div
                        key={card.id}
                        onClick={() => handleCardClick(card.id)}
                        className={`aspect-square w-full flex items-center justify-center text-xl sm:text-3xl
                            ${flipped.includes(card.id) || solved.includes(card.id) 
                                ? 'bg-white' 
                                : 'bg-pink-500'
                            } rounded-lg cursor-pointer transition-all duration-300`}
                        style={{
                            transition: 'all 0.3s',
                            transform: flipped.includes(card.id) ? 'rotateY(180deg)' : '',
                        }}
                    >
                        {(flipped.includes(card.id) || solved.includes(card.id)) && card.content}
                    </div>
                ))}
            </div>
            <div className="text-center mt-4 text-base sm:text-lg">
                <p>Moves: {moves}</p>
                <p className="mt-4 text-gray-600 text-center text-sm sm:text-base">
                    Flip similar cards to match!
                </p>
                {isWon && <Success rewardType={journey.rewardType} reward={reward} loading={isUnlocking}/>}
            </div>
        </div>
    );
}
