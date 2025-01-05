import { useState, useEffect } from 'react';
import { Unlock } from '@/lib/unlock';
import Success from '../success';

export default function Journey12({ journey, reward, progress }) {
    const [cards, setCards] = useState([]);
    const [flipped, setFlipped] = useState([]);
    const [matched, setMatched] = useState([]);
    const [moves, setMoves] = useState(0);
    const [isWon, setIsWon] = useState(false);
    const [isUnlocking, setIsUnlocking] = useState(false);

    const cardEmojis = [
        '🎂', '🎈', '🎁', '🎊', '🎉', '🍰', '🎵', '🌟',
        '🎀', '🎸', '🎹', '🎪', '🎯', '🎨', '🎭'
    ];
    
    useEffect(() => {
        // Create pairs of cards and shuffle them
        const shuffledCards = [...cardEmojis, ...cardEmojis]
            .sort(() => Math.random() - 0.5)
            .map((emoji, index) => ({
                id: index,
                content: emoji,
                isFlipped: false,
                isMatched: false
            }));
        setCards(shuffledCards);
    }, []);

    const handleCardClick = async (clickedId) => {
        if (flipped.length === 2 || flipped.includes(clickedId) || matched.includes(clickedId)) return;

        const newFlipped = [...flipped, clickedId];
        setFlipped(newFlipped);

        if (newFlipped.length === 2) {
            setMoves(m => m + 1);
            const [firstId, secondId] = newFlipped;
            const firstCard = cards.find(card => card.id === firstId);
            const secondCard = cards.find(card => card.id === secondId);

            if (firstCard.content === secondCard.content) {
                setMatched([...matched, firstId, secondId]);
                setFlipped([]);

                if (matched.length === 28) { // All pairs found (30 cards - 2 just matched)
                    setIsWon(true);
                    setIsUnlocking(true);
                    const unlocked = await Unlock(progress, journey.rewardType, reward._id);
                    if (unlocked) setIsUnlocking(false);
                }
            } else {
                setTimeout(() => setFlipped([]), 1000);
            }
        }
    };

    return (
        <div className="flex flex-col items-center p-4">
            <p className="mb-4">Moves: {moves}</p>

            <div className="grid grid-cols-5 gap-2 mb-4">
                {cards.map(card => (
                    <button
                        key={card.id}
                        onClick={() => handleCardClick(card.id)}
                        className={`w-12 h-12 sm:w-14 sm:h-14 text-xl sm:text-2xl 
                            rounded-lg transition-all duration-300 transform
                            ${(flipped.includes(card.id) || matched.includes(card.id))
                                ? 'bg-pink-200'
                                : 'bg-purple-500 '}`}
                        style={{
                            transition: 'all 0.3s',
                            transform: flipped.includes(card.id) ? 'rotateY(180deg)' : '',
                        }}
                        disabled={isWon}
                    >
                        <span 
                            className={`block transition-all duration-300 
                                ${flipped.includes(card.id) ? 'opacity-100' : 'opacity-0'}`}
                        >
                            {card.content}
                        </span>
                    </button>
                ))}
            </div>

            <p className="text-gray-600 text-center">
                Find all matching pairs! ({Math.floor(matched.length/2)}/15 pairs found)
            </p>

            {isWon && <Success rewardType={journey.rewardType} reward={reward} loading={isUnlocking}/>}
        </div>
    );
}