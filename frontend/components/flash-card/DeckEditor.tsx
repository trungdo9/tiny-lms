'use client';

import { useState } from 'react';
import { flashCardsApi } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import { useMutation, useQueryClient } from '@tanstack/react-query';

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

interface FlashCard {
  id: string;
  front: string;
  back: string;
  hint?: string;
  order_index: number;
}

interface DeckEditorProps {
  lessonId: string;
  deck?: FlashCardDeck | null;
  onDeckCreated?: (deck: FlashCardDeck) => void;
}

export function DeckEditor({ lessonId, deck, onDeckCreated }: DeckEditorProps) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState(deck?.title || '');
  const [description, setDescription] = useState(deck?.description || '');
  const [shuffleCards, setShuffleCards] = useState(deck?.shuffle_cards || false);
  const [isEditing, setIsEditing] = useState(!deck);

  const createDeckMutation = useMutation<FlashCardDeck, Error, { title: string; description?: string; shuffleCards: boolean }>({
    mutationFn: (data) =>
      flashCardsApi.createDeck(lessonId, data) as Promise<FlashCardDeck>,
    onSuccess: (newDeck: FlashCardDeck) => {
      queryClient.setQueryData(queryKeys.flashCards.deck(lessonId), newDeck);
      onDeckCreated?.(newDeck);
      setIsEditing(false);
    },
  });

  const updateDeckMutation = useMutation({
    mutationFn: (data: { title?: string; description?: string; shuffleCards?: boolean; isPublished?: boolean }) =>
      flashCardsApi.updateDeck(lessonId, data),
    onSuccess: (updatedDeck) => {
      queryClient.setQueryData(queryKeys.flashCards.deck(lessonId), updatedDeck);
    },
  });

  const deleteDeckMutation = useMutation({
    mutationFn: () => flashCardsApi.deleteDeck(lessonId),
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.flashCards.deck(lessonId), null);
      setTitle('');
      setDescription('');
      setIsEditing(true);
    },
  });

  const handleCreate = () => {
    if (!title.trim()) return;
    createDeckMutation.mutate({ title, description, shuffleCards });
  };

  const handleUpdate = () => {
    if (!title.trim()) return;
    updateDeckMutation.mutate({ title, description, shuffleCards });
  };

  const handlePublish = () => {
    updateDeckMutation.mutate({ isPublished: true });
  };

  const handleUnpublish = () => {
    updateDeckMutation.mutate({ isPublished: false });
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this flash card deck?')) {
      deleteDeckMutation.mutate();
    }
  };

  if (deck && !isEditing) {
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg">{deck.title}</h3>
            {deck.description && (
              <p className="text-sm text-gray-400">{deck.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              deck.is_published ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'
            }`}>
              {deck.is_published ? 'Published' : 'Draft'}
            </span>
            <span className="text-sm text-gray-400">
              {deck._count?.cards || deck.cards?.length || 0} cards
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(true)}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            Edit
          </button>
          {deck.is_published ? (
            <button
              onClick={handleUnpublish}
              disabled={updateDeckMutation.isPending}
              className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
            >
              Unpublish
            </button>
          ) : (
            <button
              onClick={handlePublish}
              disabled={updateDeckMutation.isPending || (deck._count?.cards || 0) === 0}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
            >
              Publish
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={deleteDeckMutation.isPending}
            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="font-semibold text-lg mb-4">Create Flash Card Deck</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Vocabulary Review"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Description (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What will students learn?"
            rows={2}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="shuffleCards"
            checked={shuffleCards}
            onChange={(e) => setShuffleCards(e.target.checked)}
            className="rounded bg-gray-700 border-gray-600"
          />
          <label htmlFor="shuffleCards" className="text-sm text-gray-300">
            Shuffle cards when studying
          </label>
        </div>

        <div className="flex gap-2">
          {deck ? (
            <>
              <button
                onClick={handleUpdate}
                disabled={updateDeckMutation.isPending || !title.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {updateDeckMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={handleCreate}
              disabled={createDeckMutation.isPending || !title.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {createDeckMutation.isPending ? 'Creating...' : 'Create Deck'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
