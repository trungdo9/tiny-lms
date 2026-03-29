'use client';

import { useState } from 'react';
import { flashCardsApi } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface FlashCard {
  id: string;
  front: string;
  back: string;
  hint?: string;
  order_index: number;
}

interface CardListProps {
  deckId: string;
  cards: FlashCard[];
}

export function CardList({ deckId, cards }: CardListProps) {
  const queryClient = useQueryClient();
  const [editingCard, setEditingCard] = useState<FlashCard | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [hint, setHint] = useState('');

  const createCardMutation = useMutation({
    mutationFn: (data: { front: string; back: string; hint?: string }) =>
      flashCardsApi.createCard(deckId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.flashCards.cards(deckId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.flashCards.deck('*') });
      setIsAdding(false);
      setFront('');
      setBack('');
      setHint('');
    },
  });

  const updateCardMutation = useMutation({
    mutationFn: ({ cardId, data }: { cardId: string; data: { front?: string; back?: string; hint?: string } }) =>
      flashCardsApi.updateCard(cardId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.flashCards.cards(deckId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.flashCards.deck('*') });
      setEditingCard(null);
    },
  });

  const deleteCardMutation = useMutation({
    mutationFn: (cardId: string) => flashCardsApi.deleteCard(cardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.flashCards.cards(deckId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.flashCards.deck('*') });
    },
  });

  const handleAdd = () => {
    if (!front.trim() || !back.trim()) return;
    createCardMutation.mutate({ front, back, hint: hint || undefined });
  };

  const handleUpdate = () => {
    if (!editingCard || !editingCard.front.trim() || !editingCard.back.trim()) return;
    updateCardMutation.mutate({
      cardId: editingCard.id,
      data: { front: editingCard.front, back: editingCard.back, hint: editingCard.hint },
    });
  };

  const handleDelete = (cardId: string) => {
    if (confirm('Delete this card?')) {
      deleteCardMutation.mutate(cardId);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-300">Cards ({cards.length})</h4>
        <button
          onClick={() => setIsAdding(true)}
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
        >
          + Add Card
        </button>
      </div>

      {/* Add Card Form */}
      {isAdding && (
        <div className="bg-gray-700 rounded-lg p-4 space-y-3">
          <input
            type="text"
            value={front}
            onChange={(e) => setFront(e.target.value)}
            placeholder="Front (question/term)"
            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
          <input
            type="text"
            value={back}
            onChange={(e) => setBack(e.target.value)}
            placeholder="Back (answer/definition)"
            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
          <input
            type="text"
            value={hint}
            onChange={(e) => setHint(e.target.value)}
            placeholder="Hint (optional)"
            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              disabled={createCardMutation.isPending || !front.trim() || !back.trim()}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
            >
              {createCardMutation.isPending ? 'Adding...' : 'Add'}
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Cards List */}
      {cards.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No cards yet. Add your first card above.</p>
      ) : (
        <div className="space-y-2">
          {cards.map((card, index) => (
            <div key={card.id} className="bg-gray-700 rounded-lg p-3">
              {editingCard?.id === card.id ? (
                // Edit mode
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editingCard.front}
                    onChange={(e) => setEditingCard({ ...editingCard, front: e.target.value })}
                    className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                  />
                  <input
                    type="text"
                    value={editingCard.back}
                    onChange={(e) => setEditingCard({ ...editingCard, back: e.target.value })}
                    className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                  />
                  <input
                    type="text"
                    value={editingCard.hint || ''}
                    onChange={(e) => setEditingCard({ ...editingCard, hint: e.target.value })}
                    placeholder="Hint"
                    className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdate}
                      disabled={updateCardMutation.isPending}
                      className="px-2 py-1 bg-green-600 text-white rounded text-xs"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingCard(null)}
                      className="px-2 py-1 bg-gray-600 text-white rounded text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // View mode
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-500">#{index + 1}</span>
                    </div>
                    <p className="font-medium text-white truncate">{card.front}</p>
                    <p className="text-sm text-gray-400 truncate">{card.back}</p>
                    {card.hint && (
                      <p className="text-xs text-blue-400 mt-1">💡 {card.hint}</p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setEditingCard(card)}
                      className="px-2 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-500"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(card.id)}
                      disabled={deleteCardMutation.isPending}
                      className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
