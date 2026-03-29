'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/query-keys';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface QuestionOption {
  id?: string;
  content: string;
  isCorrect: boolean;
  matchKey?: string;
  matchValue?: string;
  orderIndex?: number;
}

interface Question {
  id: string;
  content: string;
  type: string;
  difficulty: string;
  defaultScore: number;
  options?: QuestionOption[];
}

interface QuestionBank {
  id: string;
  title: string;
  description?: string;
}

const QUESTION_TYPES = [
  { value: 'single', label: 'Single Choice' },
  { value: 'multi', label: 'Multiple Choice' },
  { value: 'true_false', label: 'True/False' },
  { value: 'short_answer', label: 'Short Answer' },
  { value: 'essay', label: 'Essay' },
  { value: 'matching', label: 'Matching' },
  { value: 'ordering', label: 'Ordering' },
  { value: 'cloze', label: 'Fill in the Blank (Cloze)' },
];

async function fetchQuestionBank(bankId: string): Promise<QuestionBank> {
  const { data: { session } } = await supabase.auth.getSession();
  const res = await fetch(`${API}/question-banks/${bankId}`, {
    headers: { Authorization: `Bearer ${session?.access_token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch question bank');
  return res.json();
}

async function fetchQuestions(bankId: string): Promise<Question[]> {
  const { data: { session } } = await supabase.auth.getSession();
  const res = await fetch(`${API}/question-banks/${bankId}/questions`, {
    headers: { Authorization: `Bearer ${session?.access_token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch questions');
  return res.json();
}

export default function QuestionBankPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const bankId = params.id as string;

  const [error, setError] = useState('');
  const [editQuestion, setEditQuestion] = useState<Question | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  // Create question state
  const [newQuestion, setNewQuestion] = useState({
    type: 'single',
    content: '',
    difficulty: 'medium',
    defaultScore: 1,
    options: [{ content: '', isCorrect: true }] as QuestionOption[],
  });

  // Fetch question bank
  const { data: bank, isLoading } = useQuery<QuestionBank>({
    queryKey: queryKeys.questionBanks.detail(bankId),
    queryFn: () => fetchQuestionBank(bankId),
    enabled: !!bankId,
  });

  // Fetch questions
  const { data: questions = [] } = useQuery<Question[]>({
    queryKey: queryKeys.questionBanks.questions(bankId),
    queryFn: () => fetchQuestions(bankId),
    enabled: !!bankId,
  });

  // Delete question mutation
  const deleteMutation = useMutation({
    mutationFn: async (questionId: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${API}/questions/${questionId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (!response.ok) throw new Error('Failed to delete question');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.questionBanks.questions(bankId) });
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const handleDelete = (questionId: string) => {
    if (!confirm('Delete this question?')) return;
    deleteMutation.mutate(questionId);
  };

  // Update question mutation
  const updateMutation = useMutation({
    mutationFn: async (question: Question) => {
      const { data: { session } } = await supabase.auth.getSession();

      // Update question
      const response = await fetch(`${API}/questions/${question.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          content: question.content,
          difficulty: question.difficulty,
          defaultScore: question.defaultScore,
        }),
      });
      if (!response.ok) throw new Error('Failed to update question');

      // Update options if they exist
      if (question.options && question.options.length > 0) {
        await fetch(`${API}/questions/${question.id}/options`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            options: question.options.map(o => ({
              id: o.id,
              content: o.content,
              isCorrect: o.isCorrect,
            })),
          }),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.questionBanks.questions(bankId) });
      setEditQuestion(null);
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const handleSaveQuestion = () => {
    if (!editQuestion) return;
    updateMutation.mutate(editQuestion);
  };

  // Create question mutation
  const createMutation = useMutation({
    mutationFn: async () => {
      const simpleChoiceTypes = ['single', 'multi', 'true_false'];
      const needsSimpleOptions = simpleChoiceTypes.includes(newQuestion.type);
      const needsMatching = newQuestion.type === 'matching';
      const needsOrdering = newQuestion.type === 'ordering';
      const needsCloze = newQuestion.type === 'cloze';

      if (!newQuestion.content.trim()) {
        throw new Error('Question content is required');
      }

      if (needsSimpleOptions) {
        const validOptions = newQuestion.options.filter(o => o.content.trim());
        if (validOptions.length < 2) throw new Error('At least 2 options are required');
        if (!validOptions.some(o => o.isCorrect)) throw new Error('At least one option must be correct');
      }

      if (needsMatching) {
        const validPairs = newQuestion.options.filter(o => (o.matchKey?.trim() || o.matchValue?.trim()));
        if (validPairs.length < 2) throw new Error('At least 2 matching pairs are required');
      }

      if (needsOrdering) {
        const validItems = newQuestion.options.filter(o => o.content.trim());
        if (validItems.length < 2) throw new Error('At least 2 items are required for ordering');
      }

      if (needsCloze) {
        const validAnswers = newQuestion.options.filter(o => o.content.trim());
        if (validAnswers.length < 1) throw new Error('At least 1 correct answer is required');
      }

      const { data: { session } } = await supabase.auth.getSession();

      const payload: any = {
        type: newQuestion.type,
        content: newQuestion.content,
        difficulty: newQuestion.difficulty,
        defaultScore: newQuestion.defaultScore,
      };

      if (needsSimpleOptions) {
        payload.options = newQuestion.options
          .filter(o => o.content.trim())
          .map(o => ({ content: o.content, isCorrect: o.isCorrect }));
      } else if (needsMatching) {
        payload.options = newQuestion.options
          .filter(o => (o.matchKey?.trim() || o.matchValue?.trim()))
          .map(() => ({
            content: '',
            isCorrect: true,
            matchKey: '',
            matchValue: '',
          }));
      } else if (needsOrdering) {
        payload.options = newQuestion.options
          .filter(o => o.content.trim())
          .map((o, idx) => ({
            content: o.content,
            isCorrect: true,
            orderIndex: idx,
          }));
      } else if (needsCloze) {
        payload.options = newQuestion.options
          .filter(o => o.content.trim())
          .map((o, idx) => ({
            content: o.content,
            isCorrect: true,
          }));
      }

      const response = await fetch(`${API}/questions/bank/${bankId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to create question');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.questionBanks.questions(bankId) });
      setShowCreate(false);
      setNewQuestion({
        type: 'single',
        content: '',
        difficulty: 'medium',
        defaultScore: 1,
        options: [{ content: '', isCorrect: true }],
      });
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const handleCreateQuestion = () => {
    setError('');
    createMutation.mutate();
  };

  const addOption = () => {
    setNewQuestion({
      ...newQuestion,
      options: [...newQuestion.options, { content: '', isCorrect: false }],
    });
  };

  const removeOption = (index: number) => {
    setNewQuestion({
      ...newQuestion,
      options: newQuestion.options.filter((_, i) => i !== index),
    });
  };

  const updateOption = (index: number, field: keyof QuestionOption, value: any) => {
    const updated = [...newQuestion.options];
    updated[index] = { ...updated[index], [field]: value };

    // For single choice, uncheck others when checking one
    if (field === 'isCorrect' && value === true && newQuestion.type === 'single') {
      updated.forEach((o, i) => {
        if (i !== index) o.isCorrect = false;
      });
    }

    setNewQuestion({ ...newQuestion, options: updated });
  };

  const handleTypeChange = (type: string) => {
    let newOptions: QuestionOption[] = [];
    if (type === 'matching') {
      // Matching: pairs of matchKey (left) and matchValue (right)
      newOptions = [
        { content: '', isCorrect: true, matchKey: '', matchValue: '' },
        { content: '', isCorrect: true, matchKey: '', matchValue: '' },
        { content: '', isCorrect: true, matchKey: '', matchValue: '' },
      ];
    } else if (type === 'ordering') {
      // Ordering: items to be ordered (all isCorrect)
      newOptions = [
        { content: '', isCorrect: true },
        { content: '', isCorrect: true },
        { content: '', isCorrect: true },
      ];
    } else if (type === 'cloze') {
      // Cloze: correct answers for blanks
      newOptions = [
        { content: '', isCorrect: true },
        { content: '', isCorrect: true },
      ];
    } else if (type === 'single' || type === 'true_false') {
      newOptions = [{ content: '', isCorrect: true }];
    } else if (type === 'multi') {
      newOptions = [{ content: '', isCorrect: false }, { content: '', isCorrect: false }];
    } else if (type === 'short_answer') {
      newOptions = [{ content: '', isCorrect: true }];
    }
    setNewQuestion({ ...newQuestion, type, options: newOptions });
  };

  const hasOptions = (type: string) => ['single', 'multi', 'true_false', 'matching', 'ordering', 'cloze'].includes(type);
  const isSimpleChoice = (type: string) => ['single', 'multi', 'true_false'].includes(type);
  const isMatching = (type: string) => type === 'matching';
  const isOrdering = (type: string) => type === 'ordering';
  const isCloze = (type: string) => type === 'cloze';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">{bank?.title}</h1>
            {bank?.description && (
              <p className="text-gray-500">{bank.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCreate(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Question
            </button>
            <button
              onClick={() => router.push(`/instructor/question-banks/${bankId}/import`)}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Import
            </button>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Back
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>
        )}

        {questions.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 mb-4">No questions yet</p>
            <button
              onClick={() => setShowCreate(true)}
              className="text-blue-600 hover:underline"
            >
              Add your first question
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Question</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Difficulty</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Score</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((q) => (
                  <tr key={q.id} className="border-t">
                    <td className="px-4 py-3 max-w-md truncate">{q.content}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs">{q.type}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        q.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                        q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {q.difficulty}
                      </span>
                    </td>
                    <td className="px-4 py-3">{q.defaultScore}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditQuestion({...q, options: q.options || []})}
                          className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(q.id)}
                          className="px-3 py-1 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Create Modal */}
        {showCreate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-bold mb-4">Add Question</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Question Type</label>
                  <select
                    value={newQuestion.type}
                    onChange={(e) => handleTypeChange(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                  >
                    {QUESTION_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Question Content</label>
                  <textarea
                    value={newQuestion.content}
                    onChange={(e) => setNewQuestion({ ...newQuestion, content: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                    rows={3}
                    placeholder="Enter your question..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                    <select
                      value={newQuestion.difficulty}
                      onChange={(e) => setNewQuestion({ ...newQuestion, difficulty: e.target.value })}
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Score</label>
                    <input
                      type="number"
                      min="1"
                      value={newQuestion.defaultScore}
                      onChange={(e) => setNewQuestion({ ...newQuestion, defaultScore: parseInt(e.target.value) })}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                </div>

                {hasOptions(newQuestion.type) && (
                  <div>
                    {/* Simple Choice Types: single, multi, true_false */}
                    {isSimpleChoice(newQuestion.type) && (
                      <>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                        <div className="space-y-2">
                          {newQuestion.options.map((option, index) => (
                            <div key={index} className="flex items-center gap-2">
                              {newQuestion.type === 'single' || newQuestion.type === 'true_false' ? (
                                <input
                                  type="radio"
                                  name="correct-answer"
                                  checked={option.isCorrect}
                                  onChange={(e) => updateOption(index, 'isCorrect', e.target.checked)}
                                  className="w-4 h-4"
                                />
                              ) : (
                                <input
                                  type="checkbox"
                                  checked={option.isCorrect}
                                  onChange={(e) => updateOption(index, 'isCorrect', e.target.checked)}
                                  className="w-4 h-4"
                                />
                              )}
                              <input
                                type="text"
                                value={option.content}
                                onChange={(e) => updateOption(index, 'content', e.target.value)}
                                placeholder={`Option ${index + 1}`}
                                className="flex-1 p-2 border rounded-lg text-sm"
                              />
                              {newQuestion.options.length > 2 && (
                                <button
                                  type="button"
                                  onClick={() => removeOption(index)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={addOption}
                            className="text-sm text-blue-600 hover:underline"
                          >
                            + Add Option
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {newQuestion.type === 'single' || newQuestion.type === 'true_false'
                            ? 'Select one correct answer'
                            : 'Check all correct answers'}
                        </p>
                      </>
                    )}

                    {/* Matching Type */}
                    {isMatching(newQuestion.type) && (
                      <>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Matching Pairs</label>
                        <p className="text-xs text-gray-500 mb-2">Define pairs to match (e.g., "Apple" {"->"} "Fruit")</p>
                        <div className="space-y-2">
                          {newQuestion.options.map((option, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={option.matchKey || ''}
                                onChange={(e) => updateOption(index, 'matchKey', e.target.value)}
                                placeholder="Item (left)"
                                className="flex-1 p-2 border rounded-lg text-sm"
                              />
                              <span className="text-gray-400">→</span>
                              <input
                                type="text"
                                value={option.matchValue || ''}
                                onChange={(e) => updateOption(index, 'matchValue', e.target.value)}
                                placeholder="Match (right)"
                                className="flex-1 p-2 border rounded-lg text-sm"
                              />
                              {newQuestion.options.length > 2 && (
                                <button
                                  type="button"
                                  onClick={() => removeOption(index)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={addOption}
                            className="text-sm text-blue-600 hover:underline"
                          >
                            + Add Pair
                          </button>
                        </div>
                      </>
                    )}

                    {/* Ordering Type */}
                    {isOrdering(newQuestion.type) && (
                      <>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Items to Order</label>
                        <p className="text-xs text-gray-500 mb-2">All items are correct. User will arrange them in order.</p>
                        <div className="space-y-2">
                          {newQuestion.options.map((option, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <span className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-full text-xs">{index + 1}</span>
                              <input
                                type="text"
                                value={option.content}
                                onChange={(e) => updateOption(index, 'content', e.target.value)}
                                placeholder={`Item ${index + 1}`}
                                className="flex-1 p-2 border rounded-lg text-sm"
                              />
                              {newQuestion.options.length > 2 && (
                                <button
                                  type="button"
                                  onClick={() => removeOption(index)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={addOption}
                            className="text-sm text-blue-600 hover:underline"
                          >
                            + Add Item
                          </button>
                        </div>
                      </>
                    )}

                    {/* Cloze Type */}
                    {isCloze(newQuestion.type) && (
                      <>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Correct Answers for Blanks</label>
                        <p className="text-xs text-gray-500 mb-2">Use [blank] in question content to create blanks. Add correct answers below.</p>
                        <div className="space-y-2">
                          {newQuestion.options.map((option, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <span className="w-6 h-6 flex items-center justify-center bg-blue-100 rounded-full text-xs text-blue-600">#{index + 1}</span>
                              <input
                                type="text"
                                value={option.content}
                                onChange={(e) => updateOption(index, 'content', e.target.value)}
                                placeholder={`Correct answer for blank ${index + 1}`}
                                className="flex-1 p-2 border rounded-lg text-sm"
                              />
                              {newQuestion.options.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeOption(index)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={addOption}
                            className="text-sm text-blue-600 hover:underline"
                          >
                            + Add Blank Answer
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  onClick={handleCreateQuestion}
                  disabled={createMutation.isPending}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Question'}
                </button>
                <button
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editQuestion && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-bold mb-4">Edit Question</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs">{editQuestion.type}</span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Question Content</label>
                  <textarea
                    value={editQuestion.content}
                    onChange={(e) => setEditQuestion({ ...editQuestion, content: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                    <select
                      value={editQuestion.difficulty}
                      onChange={(e) => setEditQuestion({ ...editQuestion, difficulty: e.target.value })}
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Score</label>
                    <input
                      type="number"
                      min="1"
                      value={editQuestion.defaultScore}
                      onChange={(e) => setEditQuestion({ ...editQuestion, defaultScore: parseInt(e.target.value) })}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                </div>

                {hasOptions(editQuestion.type) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                    <div className="space-y-2">
                      {(editQuestion.options || []).map((option, index) => (
                        <div key={option.id || index} className="flex items-center gap-2">
                          {editQuestion.type === 'single' || editQuestion.type === 'true_false' ? (
                            <input
                              type="radio"
                              name="edit-correct-answer"
                              checked={option.isCorrect}
                              onChange={(e) => {
                                const updated = [...editQuestion.options!];
                                updated.forEach((o, i) => {
                                  if (i !== index) o.isCorrect = false;
                                });
                                updated[index] = { ...updated[index], isCorrect: e.target.checked };
                                setEditQuestion({ ...editQuestion, options: updated });
                              }}
                              className="w-4 h-4"
                            />
                          ) : (
                            <input
                              type="checkbox"
                              checked={option.isCorrect}
                              onChange={(e) => {
                                const updated = [...editQuestion.options!];
                                updated[index] = { ...updated[index], isCorrect: e.target.checked };
                                setEditQuestion({ ...editQuestion, options: updated });
                              }}
                              className="w-4 h-4"
                            />
                          )}
                          <input
                            type="text"
                            value={option.content}
                            onChange={(e) => {
                              const updated = [...editQuestion.options!];
                              updated[index] = { ...updated[index], content: e.target.value };
                              setEditQuestion({ ...editQuestion, options: updated });
                            }}
                            className="flex-1 p-2 border rounded-lg text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  onClick={handleSaveQuestion}
                  disabled={updateMutation.isPending}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => setEditQuestion(null)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
