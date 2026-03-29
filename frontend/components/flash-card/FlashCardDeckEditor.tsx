'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { flashCardsApi } from '@/lib/api';

interface FlashCard {
  id: string;
  front: string;
  back: string;
  hint?: string;
  imageUrl?: string;
  orderIndex: number;
}

interface FlashCardDeck {
  id: string;
  lessonId: string;
  title: string;
  description?: string;
  shuffleCards: boolean;
  isPublished: boolean;
  cards: FlashCard[];
}

interface FlashCardDeckEditorProps {
  lessonId: string;
  isInstructor: boolean;
}

export function FlashCardDeckEditor({ lessonId, isInstructor }: FlashCardDeckEditorProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [newCard, setNewCard] = useState({ front: '', back: '', hint: '' });
  const [editingCard, setEditingCard] = useState<FlashCard | null>(null);

  // Fetch deck
  const { data: deck, isLoading } = useQuery<any>({
    queryKey: queryKeys.flashCards.deck(lessonId),
    queryFn: () => flashCardsApi.getDeckByLesson(lessonId),
  });

  // Create deck mutation
  const createDeckMutation = useMutation({
    mutationFn: (data: { title: string; description?: string }) =>
      flashCardsApi.createDeck(lessonId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.flashCards.deck(lessonId) });
      setIsEditing(false);
    },
  });

  // Update deck mutation
  const updateDeckMutation = useMutation({
    mutationFn: (data: { title?: string; description?: string; shuffleCards?: boolean; isPublished?: boolean }) =>
      flashCardsApi.updateDeck(lessonId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.flashCards.deck(lessonId) });
    },
  });

  // Delete deck mutation
  const deleteDeckMutation = useMutation({
    mutationFn: () => flashCardsApi.deleteDeck(lessonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.flashCards.deck(lessonId) });
    },
  });

  // Create card mutation
  const createCardMutation = useMutation({
    mutationFn: (data: { front: string; back: string; hint?: string }) =>
      flashCardsApi.createCard(deck!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.flashCards.deck(lessonId) });
      setNewCard({ front: '', back: '', hint: '' });
    },
  });

  // Update card mutation
  const updateCardMutation = useMutation({
    mutationFn: ({ cardId, data }: { cardId: string; data: { front: string; back: string; hint?: string } }) =>
      flashCardsApi.updateCard(cardId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.flashCards.deck(lessonId) });
      setEditingCard(null);
    },
  });

  // Delete card mutation
  const deleteCardMutation = useMutation({
    mutationFn: (cardId: string) => flashCardsApi.deleteCard(cardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.flashCards.deck(lessonId) });
    },
  });

  if (isLoading) {
    return <div className="p-4 text-gray-500">Đang tải...</div>;
  }

  // No deck yet - show create button
  if (!deck) {
    if (!isInstructor) return null;
    return (
      <div className="border rounded-lg p-4 mt-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Flash Cards</h3>
            <p className="text-sm text-gray-500">Thêm flash cards để học sinh ôn tập</p>
          </div>
          <button
            onClick={() => {
              createDeckMutation.mutate({ title: 'Flash Cards', description: '' });
            }}
            disabled={createDeckMutation.isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {createDeckMutation.isPending ? 'Đang tạo...' : 'Tạo Flash Cards'}
          </button>
        </div>
      </div>
    );
  }

  // Has deck - show editor
  return (
    <div className="border rounded-lg p-4 mt-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-medium">{deck.title}</h3>
          <p className="text-sm text-gray-500">{deck.cards.length} thẻ</p>
        </div>
        <div className="flex gap-2">
          {isInstructor && (
            <>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={deck.shuffleCards}
                  onChange={(e) => updateDeckMutation.mutate({ shuffleCards: e.target.checked })}
                  className="rounded"
                />
                Xáo trộn
              </label>
              <button
                onClick={() => updateDeckMutation.mutate({ isPublished: !deck.isPublished })}
                disabled={deck.cards.length === 0}
                className={`px-3 py-1 rounded text-sm ${
                  deck.isPublished
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {deck.isPublished ? 'Đã xuất bản' : 'Xuất bản'}
              </button>
              <button
                onClick={() => {
                  if (confirm('Xóa tất cả flash cards?')) {
                    deleteDeckMutation.mutate();
                  }
                }}
                className="px-3 py-1 text-red-600 text-sm hover:underline"
              >
                Xóa
              </button>
            </>
          )}
        </div>
      </div>

      {/* Card list */}
      <div className="space-y-2">
        {(deck.cards || []).map((card: any, index: number) => (
          <div key={card.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded">
            <span className="text-gray-400 text-sm">{index + 1}.</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{card.front}</p>
              <p className="text-sm text-gray-500 truncate">{card.back}</p>
              {card.hint && <p className="text-xs text-gray-400">💡 {card.hint}</p>}
            </div>
            {isInstructor && (
              <div className="flex gap-1">
                <button
                  onClick={() => setEditingCard(card)}
                  className="text-blue-600 text-sm hover:underline"
                >
                  Sửa
                </button>
                <button
                  onClick={() => deleteCardMutation.mutate(card.id)}
                  className="text-red-600 text-sm hover:underline"
                >
                  Xóa
                </button>
              </div>
            )}
          </div>
        ))}

        {deck.cards.length === 0 && (
          <p className="text-center text-gray-500 py-4">Chưa có thẻ nào</p>
        )}
      </div>

      {/* Add card form */}
      {isInstructor && (
        <div className="mt-4 pt-4 border-t">
          <h4 className="font-medium mb-2">Thêm thẻ mới</h4>
          <div className="grid gap-2">
            <input
              type="text"
              placeholder="Mặt trước (câu hỏi)"
              value={newCard.front}
              onChange={(e) => setNewCard({ ...newCard, front: e.target.value })}
              className="px-3 py-2 border rounded"
            />
            <input
              type="text"
              placeholder="Mặt sau (đáp án)"
              value={newCard.back}
              onChange={(e) => setNewCard({ ...newCard, back: e.target.value })}
              className="px-3 py-2 border rounded"
            />
            <input
              type="text"
              placeholder="Gợi ý (tùy chọn)"
              value={newCard.hint}
              onChange={(e) => setNewCard({ ...newCard, hint: e.target.value })}
              className="px-3 py-2 border rounded"
            />
            <button
              onClick={() => createCardMutation.mutate(newCard)}
              disabled={!newCard.front || !newCard.back || createCardMutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {createCardMutation.isPending ? 'Đang thêm...' : 'Thêm thẻ'}
            </button>
          </div>
        </div>
      )}

      {/* Edit card modal */}
      {editingCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="font-medium mb-4">Sửa thẻ</h3>
            <div className="grid gap-2">
              <input
                type="text"
                placeholder="Mặt trước"
                value={editingCard.front}
                onChange={(e) => setEditingCard({ ...editingCard, front: e.target.value })}
                className="px-3 py-2 border rounded"
              />
              <input
                type="text"
                placeholder="Mặt sau"
                value={editingCard.back}
                onChange={(e) => setEditingCard({ ...editingCard, back: e.target.value })}
                className="px-3 py-2 border rounded"
              />
              <input
                type="text"
                placeholder="Gợi ý"
                value={editingCard.hint || ''}
                onChange={(e) => setEditingCard({ ...editingCard, hint: e.target.value })}
                className="px-3 py-2 border rounded"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => updateCardMutation.mutate({ cardId: editingCard.id, data: editingCard })}
                disabled={updateCardMutation.isPending}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Lưu
              </button>
              <button
                onClick={() => setEditingCard(null)}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
