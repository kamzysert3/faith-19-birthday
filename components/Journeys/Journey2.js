import { useState, useEffect } from 'react';
import { Unlock } from '@/lib/unlock';
import Success from '../success';

export default function Journey2({ journey, reward, progress }) {
    const words = ['BIRTHDAY', 'CELEBRATE', 'SURPRISE', 'PARTY', 'PRESENTS', 'WISHES'];
    const [word, setWord] = useState('');
    const [guessed, setGuessed] = useState(new Set());
    const [mistakes, setMistakes] = useState(0);
    const [isWon, setIsWon] = useState(false);
    const [isUnlocking, setIsUnlocking] = useState(false);
    const maxMistakes = 6;

    useEffect(() => {
        setWord(words[Math.floor(Math.random() * words.length)]);
    }, []);

    const keyboard = [
        'QWERTYUIOP'.split(''),
        'ASDFGHJKL'.split(''),
        'ZXCVBNM'.split('')
    ];

    const handleGuess = async (letter) => {
        if (guessed.has(letter) || isWon || mistakes >= maxMistakes) return;

        const newGuessed = new Set([...guessed, letter]);
        setGuessed(newGuessed);

        if (!word.includes(letter)) {
            setMistakes(prev => prev + 1);
        }

        // Check win condition
        const isWordGuessed = word.split('').every(letter => newGuessed.has(letter));
        if (isWordGuessed) {
            setIsWon(true);
            setIsUnlocking(true);
            const unlocked = await Unlock(progress, journey.rewardType, reward._id);
            if (unlocked) {
                setIsUnlocking(false);
            }
        }
    };

    const renderWord = () => {
        return word.split('').map((letter, i) => (
            <span key={i} className="mx-1 text-4xl font-bold">
                {guessed.has(letter) ? letter : '_'}
            </span>
        ));
    };

    return (
        <div className="flex flex-col items-center p-4 w-full max-w-lg mx-auto">
            <div className="w-full text-center">
                <p className="text-base sm:text-lg mb-4">Mistakes: {mistakes}/{maxMistakes}</p>
                <div className="mb-8 space-x-1 sm:space-x-2 text-2xl sm:text-4xl font-bold">
                    {renderWord()}
                </div>
            </div>

            <div className="flex flex-col gap-1 sm:gap-2 w-full max-w-md">
                {keyboard.map((row, i) => (
                    <div key={i} className="flex justify-center gap-1 sm:gap-2">
                        {row.map(letter => (
                            <button
                                key={letter}
                                onClick={() => handleGuess(letter)}
                                disabled={guessed.has(letter) || isWon || mistakes >= maxMistakes}
                                className={`w-7 h-7 sm:w-10 sm:h-10 rounded text-sm sm:text-base
                                    ${guessed.has(letter)
                                        ? 'bg-gray-300'
                                        : 'bg-pink-500 hover:bg-pink-600'
                                    } text-white font-bold`}
                            >
                                {letter}
                            </button>
                        ))}
                    </div>
                ))}
            </div>

            <p className="mt-4 text-gray-600 text-center text-sm sm:text-base">
                Guess the birthday themed word!
            </p>


            {isWon && <Success rewardType={journey.rewardType} reward={reward} loading={isUnlocking}/>}
        </div>
    );
}