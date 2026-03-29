'use client';

import { useState, useEffect } from 'react';
import { flashCardsApi } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import { useMutation } from '@tanstack/react-query';

interface FlashCard {
  id: string;
  front: string;
  back: string;
  hint?: string;
}

interface StudySession {
  sessionId: string;
  totalCards: number;
  cards: FlashCard[];
}

interface FlashCardStudyProps {
  lessonId: string;
  onComplete: () => void;
}

export function FlashCardStudy({ lessonId, onComplete }: FlashCardStudyProps) {
  const [session, setSession] = useState<StudySession | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCards, setKnownCards] = useState<Set<string>>(new Set());
  const [startTime] = useState(Date.now());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const completeMutation = useMutation({
    mutationFn: async ({ sessionId, known, timeSpent }: { sessionId: string; known: number; timeSpent: number }) => {
      return flashCardsApi.completeSession(sessionId, {
        knownCards: known,
        timeSpentSecs: Math.round(timeSpent / 1000),
      });
    },
    onSuccess: () => {
      onComplete();
    },
  });

  useEffect(() => {
    async function loadDeck() {
      try {
        const deck = await flashCardsApi.getDeckByLesson(lessonId);
        if (deck && (deck as any).isPublished && (deck as any).cards?.length > 0) {
          const sessionData = await flashCardsApi.startSession((deck as any).id);
          setSession(sessionData as StudySession);
        } else {
          setError('No published flash cards available');
        }
      } catch (err) {
        setError('Failed to load flash cards');
      } finally {
        setIsLoading(false);
      }
    }
    loadDeck();
  }, [lessonId]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleAnswer = (known: boolean) => {
    if (!session) return;

    const currentCard = session.cards[currentIndex];
    if (known) {
      setKnownCards((prev) => new Set(prev).add(currentCard.id));
    }

    if (currentIndex < session.totalCards - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      // Complete session
      const timeSpent = Date.now() - startTime;
      completeMutation.mutate({
        sessionId: session.sessionId,
        known: knownCards.size + (known ? 1 : 0),
        timeSpent,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-400">{error || 'No flash cards available'}</p>
        <button
          onClick={onComplete}
          className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Close
        </button>
      </div>
    );
  }

  const currentCard = session.cards[currentIndex];
  const progress = ((currentIndex + 1) / session.totalCards) * 100;

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          {currentIndex + 1} of <span>Card {session.totalCards}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Card */}
      <div
        className="relative h-64 cursor-pointer perspective-1000"
        onClick={handleFlip}
      >
        <div
          className={`absolute inset-0 transition-transform duration-500 transform-style-preserve-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 bg-gray-800 rounded-lg p-8 flex flex-col items-center justify-center backface-hidden"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <p className="text-xl font-medium text-center">{currentCard.front}</p>
            <p className="text-sm text-gray-500 mt-4">Click to reveal answer</p>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 bg-blue-900 rounded-lg p-8 flex flex-col items-center justify-center backface-hidden"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <p className="text-xl text-center">{currentCard.back}</p>
            {currentCard.hint && (
              <p className="text-sm text-blue-300 mt-4">💡 {currentCard.hint}</p>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4 mt-8">
        <button
          onClick={() => handleAnswer(false)}
          disabled={!isFlipped}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Didn't Know
        </button>
        <button
          onClick={() => handleAnswer(true)}
          disabled={!isFlipped}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Got It!
        </button>
      </div>

      {/* Skip button */}
      <div className="text-center mt-4">
        <button
          onClick={onComplete}
          className="text-gray-500 hover:text-gray-400 text-sm"
        >
          Exit Study Mode
        </button>
      </div>
    </div>
  );
}
