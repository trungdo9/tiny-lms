'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { flashCardsApi } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';

interface FlashCardDeckSummary {
  id: string;
  title: string;
  description?: string;
  is_published: boolean;
  card_count: number;
  lesson_title: string;
  lesson_id: string;
  course_id: string;
  created_at: string;
}

export default function FlashCardsPage() {
  const router = useRouter();

  const { data: decks, isLoading } = useQuery<FlashCardDeckSummary[]>({
    queryKey: ['flash-cards', 'all'],
    queryFn: () => flashCardsApi.getAll() as Promise<FlashCardDeckSummary[]>,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Flash Cards</h1>
        <button
          onClick={() => router.push('/instructor/flash-cards/create')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Create Flash Cards
        </button>
      </div>

      {(!decks || decks.length === 0) ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No flash cards yet.</p>
          <p className="text-sm text-gray-400">
            Create flash cards from the lesson editor in your courses.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lesson</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cards</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {decks.map((deck) => (
                <tr key={deck.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{deck.title}</div>
                    {deck.description && (
                      <div className="text-sm text-gray-500 truncate max-w-xs">{deck.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {deck.lesson_title}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {deck.card_count} cards
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      deck.is_published
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {deck.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(deck.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => router.push(`/instructor/flash-cards/create?lessonId=${deck.lesson_id}`)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
