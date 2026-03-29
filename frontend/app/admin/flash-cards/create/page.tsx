'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { flashCardsApi, lessonsApi } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import { CardList } from '@/components/flash-card';

interface FlashCard {
  id: string;
  front: string;
  back: string;
  hint?: string;
  order_index: number;
}

interface FlashCardDeck {
  id: string;
  lesson_id: string;
  title: string;
  description?: string;
  shuffle_cards: boolean;
  is_published: boolean;
  cards: FlashCard[];
  _count?: { cards: number };
}

export default function FlashCardsEditorPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const lessonIdFromQuery = searchParams.get('lessonId');
  const deckId = params.id as string;
  const lessonId = lessonIdFromQuery;

  const [lessonTitle, setLessonTitle] = useState('');

  // Fetch deck data
  const { data: deck, isLoading } = useQuery<FlashCardDeck>({
    queryKey: queryKeys.flashCards.deck(lessonId || deckId),
    queryFn: () => flashCardsApi.getDeckByLesson(lessonId || deckId) as Promise<FlashCardDeck>,
    enabled: !!(lessonId || deckId),
  });

  // Fetch lesson title
  useEffect(() => {
    async function fetchLesson() {
      if (lessonId) {
        const lesson = await lessonsApi.get(lessonId);
        setLessonTitle((lesson as any).title);
      } else if (deckId) {
        const cards = await flashCardsApi.getCards(deckId);
        // deck to We need to get find lessonId - for now skip
      }
    }
    fetchLesson();
  }, [lessonId, deckId]);

  const handleDeckCreated = (newDeck: FlashCardDeck) => {
    if (newDeck.lesson_id) {
      router.replace(`/admin/flash-cards/create?lessonId=${newDeck.lesson_id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-gray-500 hover:text-gray-700 mb-2"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold">
          {deck ? `Edit: ${deck.title}` : 'Create Flash Cards'}
        </h1>
        {lessonTitle && (
          <p className="text-gray-500">Lesson: {lessonTitle}</p>
        )}
      </div>

      {/* Deck Editor */}
      <div className="mb-6">
        {deck ? (
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg">{deck.title}</h3>
                {deck.description && (
                  <p className="text-sm text-gray-500">{deck.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  deck.is_published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {deck.is_published ? 'Published' : 'Draft'}
                </span>
                <span className="text-sm text-gray-500">
                  {deck._count?.cards || deck.cards?.length || 0} cards
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              {deck.is_published ? (
                <button
                  onClick={() => flashCardsApi.updateDeck(deck.lesson_id, { isPublished: false }).then(() => {
                    queryClient.invalidateQueries({ queryKey: queryKeys.flashCards.deck(deck.lesson_id) });
                  })}
                  className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
                >
                  Unpublish
                </button>
              ) : (
                <button
                  onClick={() => flashCardsApi.updateDeck(deck.lesson_id, { isPublished: true }).then(() => {
                    queryClient.invalidateQueries({ queryKey: queryKeys.flashCards.deck(deck.lesson_id) });
                  })}
                  disabled={(deck._count?.cards || 0) === 0}
                  className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50"
                >
                  Publish
                </button>
              )}
            </div>
          </div>
        ) : lessonId ? (
          <CreateDeckForm lessonId={lessonId} onCreated={handleDeckCreated} />
        ) : (
          <p className="text-gray-500">Please select a lesson to create flash cards.</p>
        )}
      </div>

      {/* Card List */}
      {deck && (
        <div className="bg-white rounded-lg shadow p-4">
          <CardList deckId={deck.id} cards={deck.cards || []} />
        </div>
      )}
    </div>
  );
}

// Separate component for creating deck
function CreateDeckForm({ lessonId, onCreated }: { lessonId: string; onCreated: (deck: FlashCardDeck) => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [shuffleCards, setShuffleCards] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) return;
    setIsCreating(true);
    try {
      const deck = await flashCardsApi.createDeck(lessonId, { title, description, shuffleCards });
      onCreated(deck as FlashCardDeck);
    } catch (error) {
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold text-lg mb-4">Create Flash Card Deck</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Vocabulary Review"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Description (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What will students learn?"
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="shuffleCards"
            checked={shuffleCards}
            onChange={(e) => setShuffleCards(e.target.checked)}
            className="rounded"
          />
          <label htmlFor="shuffleCards" className="text-sm text-gray-600">
            Shuffle cards when studying
          </label>
        </div>
        <button
          onClick={handleCreate}
          disabled={isCreating || !title.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isCreating ? 'Creating...' : 'Create Deck'}
        </button>
      </div>
    </div>
  );
}
