import { useState, useEffect } from 'react';
import { Unlock } from '@/lib/unlock';
import Success from '../success';

export default function Journey11({ journey, reward, progress }) {
    const [cards, setCards] = useState([]);
    const [flipped, setFlipped] = useState([]);
    const [solved, setSolved] = useState([]);
    const [score, setScore] = useState(0);
    const [isWon, setIsWon] = useState(false);
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [attempts, setAttempts] = useState(0);

    const REQUIRED_SCORE = 5;
    const MAX_ATTEMPTS = 20;

    const SEQUENCES = [
        { items: ['1️⃣', '2️⃣', '3️⃣'], name: 'Count' },
        { items: ['🎂', '🕯️', '🎁'], name: 'Birthday' },
        { items: ['🎈', '🎉', '🎊'], name: 'Party' },
        { items: ['🍰', '🍪', '🧁'], name: 'Sweets' }
    ];

    const initializeGame = () => {
        // Create grid with two sets of each sequence
        const sequences = [...SEQUENCES, ...SEQUENCES];
        const shuffled = sequences
            .flatMap(seq => seq.items.map((item, index) => ({
                id: Math.random(),
                content: item,
                sequenceIndex: index,
                sequenceName: seq.name
            })))
            .sort(() => Math.random() - 0.5);

        setCards(shuffled);
        setFlipped([]);
        setSolved([]);
        setScore(0);
        setAttempts(MAX_ATTEMPTS);
    };

    useEffect(() => {
        initializeGame();
    }, []);

    const checkSequence = (flippedCards) => {
        const first = cards[flippedCards[0]];
        const sequence = SEQUENCES.find(s => s.name === first.sequenceName);
        
        // Check if cards are from same sequence and in correct order
        return flippedCards.every((cardIndex, i) => {
            const card = cards[cardIndex];
            return card.sequenceName === first.sequenceName && 
                   card.sequenceIndex === i;
        });
    };

    const handleCardClick = (index) => {
        if (flipped.includes(index) || solved.includes(index) || attempts <= 0) return;

        const newFlipped = [...flipped, index];
        setFlipped(newFlipped);

        if (newFlipped.length === 3) {
            setAttempts(prev => prev - 1);
            
            if (checkSequence(newFlipped)) {
                setSolved([...solved, ...newFlipped]);
                setScore(prev => {
                    const newScore = prev + 1;
                    if (newScore >= REQUIRED_SCORE) {
                        setIsWon(true);
                        setIsUnlocking(true);
                        Unlock(progress, journey.rewardType, reward._id)
                            .then(success => {
                                if (success) setIsUnlocking(false);
                            });
                    }
                    return newScore;
                });
            }
            
            setTimeout(() => setFlipped([]), 1000);
        }
    };

    return (
        <div className="flex flex-col items-center p-4 w-full max-w-lg mx-auto">
            <div className="flex justify-between w-full mb-4">
                <div className="text-xl">Score: {score}/{REQUIRED_SCORE}</div>
                <div className="text-xl">Moves: {attempts}</div>
            </div>

            <div className="grid grid-cols-6 gap-2 bg-pink-100 p-4 rounded-lg">
                {cards.map((card, index) => (
                    <button
                        key={card.id}
                        onClick={() => handleCardClick(index)}
                        className={`aspect-square w-full flex items-center justify-center text-2xl
                            ${flipped.includes(index) || solved.includes(index)
                                ? 'bg-white'
                                : 'bg-pink-400 text-transparent'} 
                            ${solved.includes(index) ? 'opacity-50' : ''}
                            rounded-lg transition-all duration-300 hover:scale-105`}
                        disabled={solved.includes(index) || attempts <= 0}
                    >
                        {card.content}
                    </button>
                ))}
            </div>

            <div className="mt-6 space-y-4 flex flex-col items-center">
                <div className="flex gap-4 justify-center">
                    {SEQUENCES.map(seq => (
                        <div key={seq.name} className="flex gap-1 items-center bg-white px-3 py-1 rounded-full">
                            {seq.items.map((item, i) => (
                                <span key={i}>{item}</span>
                            ))}
                        </div>
                    ))}
                </div>

                <p className="text-gray-600 text-center text-sm">
                    Find sequences of 3 cards in order!
                    <br />
                    Click to reveal cards and match the sequences shown above.
                </p>

                {attempts <= 0 && !isWon && (
                    <button
                        onClick={initializeGame}
                        className="px-4 py-2 bg-pink-400 text-white rounded-full"
                    >
                        Try Again
                    </button>
                )}
            </div>

            {isWon && <Success rewardType={journey.rewardType} reward={reward} loading={isUnlocking}/>}
        </div>
    );
}