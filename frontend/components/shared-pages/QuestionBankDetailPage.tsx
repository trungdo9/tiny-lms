'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/query-keys';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface SharedPageProps {
  basePath: '/instructor' | '/admin';
}

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

interface AIGeneratedQuestion {
  type: string;
  content: string;
  explanation?: string;
  difficulty: string;
  defaultScore: number;
  tags: string[];
  options: { content: string; isCorrect: boolean; matchKey?: string; matchValue?: string; orderIndex?: number }[];
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
  { value: 'drag_drop_text', label: 'Drag Words into Blanks' },
  { value: 'drag_drop_image', label: 'Drag Labels onto Image' },
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

export function QuestionBankDetailPage({ basePath }: SharedPageProps) {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const bankId = params.id as string;

  const [error, setError] = useState('');
  const [editQuestion, setEditQuestion] = useState<Question | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  // AI Generate Modal state
  const [aiOpen, setAiOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiContext, setAiContext] = useState('');
  const [aiTypes, setAiTypes] = useState<string[]>(['single']);
  const [aiDifficulty, setAiDifficulty] = useState('mixed');
  const [aiCount, setAiCount] = useState(5);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiResults, setAiResults] = useState<AIGeneratedQuestion[]>([]);
  const [aiSelected, setAiSelected] = useState<Set<number>>(new Set());
  const [aiError, setAiError] = useState('');
  const [aiSaving, setAiSaving] = useState(false);
  const [showAiContext, setShowAiContext] = useState(false);

  // Drag-drop text state
  const [ddtTemplate, setDdtTemplate] = useState('');
  const [ddtTokens, setDdtTokens] = useState<{ content: string; slotId: string | null }[]>([]);

  // Drag-drop image state
  const [ddiImageUrl, setDdiImageUrl] = useState('');
  const [ddiUploading, setDdiUploading] = useState(false);
  const [ddiZones, setDdiZones] = useState<{ id: string; label: string; x: number; y: number }[]>([]);
  const [ddiDistractors, setDdiDistractors] = useState<string[]>([]);

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
      const needsDragDropText = newQuestion.type === 'drag_drop_text';
      const needsDragDropImage = newQuestion.type === 'drag_drop_image';

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

      if (needsDragDropText) {
        if (!newQuestion.content.match(/\[slot_\d+\]/)) {
          throw new Error('drag_drop_text requires at least one [slot_N] marker in the content');
        }
        if (!ddtTokens.some(t => t.slotId)) {
          throw new Error('At least one correct token with a slot is required');
        }
      }

      if (needsDragDropImage) {
        if (!ddiImageUrl) {
          throw new Error('An image is required for drag_drop_image');
        }
        if (!ddiZones.some(z => z.label.trim())) {
          throw new Error('At least one labeled zone is required');
        }
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
      } else if (needsDragDropText) {
        payload.options = ddtTokens.map(t => ({
          content: t.content,
          isCorrect: !!t.slotId,
          matchKey: t.slotId,
          matchValue: null,
        }));
      } else if (needsDragDropImage) {
        payload.mediaUrl = `${API}${ddiImageUrl}`;
        payload.mediaType = 'image';
        payload.options = [
          ...ddiZones.filter(z => z.label.trim()).map((z, i) => ({
            content: z.label,
            isCorrect: true,
            matchKey: `zone_${i}`,
            matchValue: JSON.stringify({ x: z.x, y: z.y, w: 10, h: 8 }),
          })),
          ...ddiDistractors.map(d => ({
            content: d,
            isCorrect: false,
            matchKey: null,
            matchValue: null,
          })),
        ];
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
      // Reset drag-drop state
      setDdtTemplate('');
      setDdtTokens([]);
      setDdiImageUrl('');
      setDdiZones([]);
      setDdiDistractors([]);
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
    } else if (type === 'drag_drop_text') {
      newOptions = [];
    } else if (type === 'drag_drop_image') {
      newOptions = [];
    }
    setNewQuestion({ ...newQuestion, type, options: newOptions });
  };

  const hasOptions = (type: string) => ['single', 'multi', 'true_false', 'matching', 'ordering', 'cloze'].includes(type);
  const isSimpleChoice = (type: string) => ['single', 'multi', 'true_false'].includes(type);
  const isMatching = (type: string) => type === 'matching';
  const isOrdering = (type: string) => type === 'ordering';
  const isCloze = (type: string) => type === 'cloze';
  const isDragDropText = (type: string) => type === 'drag_drop_text';
  const isDragDropImage = (type: string) => type === 'drag_drop_image';

  // Upload image helper
  const uploadImage = async (file: File): Promise<string> => {
    const { data: { session } } = await supabase.auth.getSession();
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${API}/questions/upload-image`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${session?.access_token}` },
      body: form,
    });
    if (!res.ok) throw new Error('Upload failed');
    const { url } = await res.json();
    return url;
  };

  // Image click handler for zone placement
  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const newZone = { id: `zone_${Date.now()}`, label: '', x, y };
    setDdiZones([...ddiZones, newZone]);
  };

  // AI Generate handlers
  const handleGenerate = async () => {
    if (!aiTopic.trim()) {
      setAiError('Topic is required');
      return;
    }
    setAiGenerating(true);
    setAiError('');
    setAiResults([]);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${API}/ai-questions/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          topic: aiTopic,
          context: aiContext || undefined,
          types: aiTypes,
          difficulty: aiDifficulty,
          count: aiCount,
        }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.message || 'Generation failed');
      }
      const data: AIGeneratedQuestion[] = await res.json();
      setAiResults(data);
      setAiSelected(new Set(data.map((_, i) => i)));
    } catch (err: any) {
      setAiError(err.message);
    } finally {
      setAiGenerating(false);
    }
  };

  const toggleAiSelect = (index: number) => {
    const newSelected = new Set(aiSelected);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setAiSelected(newSelected);
  };

  const selectAllAi = () => {
    if (aiSelected.size === aiResults.length) {
      setAiSelected(new Set());
    } else {
      setAiSelected(new Set(aiResults.map((_, i) => i)));
    }
  };

  const handleSaveSelected = async () => {
    const selected = aiResults.filter((_, i) => aiSelected.has(i));
    if (!selected.length) return;
    setAiSaving(true);
    setAiError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${API}/questions/bank/${bankId}/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          questions: selected.map(q => ({
            type: q.type,
            content: q.content,
            difficulty: q.difficulty,
            defaultScore: q.defaultScore,
            options: q.options,
          })),
        }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.message || 'Save failed');
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.questionBanks.questions(bankId) });
      setAiOpen(false);
      setAiTopic('');
      setAiContext('');
      setAiTypes(['single']);
      setAiDifficulty('mixed');
      setAiCount(5);
      setAiResults([]);
      setAiSelected(new Set());
    } catch (err: any) {
      setAiError(err.message || 'Failed to save questions');
    } finally {
      setAiSaving(false);
    }
  };

  const toggleAiType = (type: string) => {
    if (aiTypes.includes(type)) {
      if (aiTypes.length > 1) {
        setAiTypes(aiTypes.filter(t => t !== type));
      }
    } else {
      setAiTypes([...aiTypes, type]);
    }
  };

  const resetAiModal = () => {
    setAiOpen(false);
    setAiTopic('');
    setAiContext('');
    setAiTypes(['single']);
    setAiDifficulty('mixed');
    setAiCount(5);
    setAiResults([]);
    setAiSelected(new Set());
    setAiError('');
  };

  const difficultyColor = (d: string) => {
    switch (d) {
      case 'easy': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'hard': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

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
              onClick={() => router.push(`${basePath}/question-banks/${bankId}/import`)}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Import
            </button>
            <button
              onClick={() => setAiOpen(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Generate with AI
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

                    {/* Drag Drop Text Type */}
                    {isDragDropText(newQuestion.type) && (
                      <>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Template with Slots</label>
                        <p className="text-xs text-gray-500 mb-1">Use [slot_0], [slot_1]… to mark blanks in the text.</p>
                        <textarea
                          value={ddtTemplate}
                          onChange={(e) => setDdtTemplate(e.target.value)}
                          placeholder="The [slot_0] jumped over the [slot_1]."
                          className="w-full p-2 border rounded-lg text-sm"
                          rows={3}
                        />

                        <label className="block text-sm font-medium text-gray-700 mb-2 mt-4">Correct Tokens</label>
                        <div className="space-y-2">
                          {ddtTokens.filter(t => t.slotId).map((token, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">{token.slotId}</span>
                              <input
                                type="text"
                                value={token.content}
                                onChange={(e) => {
                                  const updated = [...ddtTokens];
                                  updated[index] = { ...updated[index], content: e.target.value };
                                  setDdtTokens(updated);
                                }}
                                placeholder="Correct word"
                                className="flex-1 p-2 border rounded-lg text-sm"
                              />
                              <button
                                type="button"
                                onClick={() => setDdtTokens(ddtTokens.filter((_, i) => i !== index))}
                                className="text-red-500 hover:text-red-700"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              // Find the next available slot number
                              const usedSlots = ddtTokens.filter(t => t.slotId).map(t => parseInt(t.slotId!.replace('slot_', '')));
                              let nextSlot = 0;
                              while (usedSlots.includes(nextSlot)) nextSlot++;
                              setDdtTokens([...ddtTokens, { content: '', slotId: `slot_${nextSlot}` }]);
                            }}
                            className="text-sm text-blue-600 hover:underline"
                          >
                            + Add Correct Token
                          </button>
                        </div>

                        <label className="block text-sm font-medium text-gray-700 mb-2 mt-4">Distractors (Wrong Words)</label>
                        <div className="space-y-2">
                          {ddtTokens.filter(t => !t.slotId).map((token, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">distractor</span>
                              <input
                                type="text"
                                value={token.content}
                                onChange={(e) => {
                                  const updated = [...ddtTokens];
                                  updated[index] = { ...updated[index], content: e.target.value };
                                  setDdtTokens(updated);
                                }}
                                placeholder="Wrong word"
                                className="flex-1 p-2 border rounded-lg text-sm"
                              />
                              <button
                                type="button"
                                onClick={() => setDdtTokens(ddtTokens.filter((_, i) => i !== index))}
                                className="text-red-500 hover:text-red-700"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => setDdtTokens([...ddtTokens, { content: '', slotId: null }])}
                            className="text-sm text-blue-600 hover:underline"
                          >
                            + Add Distractor
                          </button>
                        </div>
                      </>
                    )}

                    {/* Drag Drop Image Type */}
                    {isDragDropImage(newQuestion.type) && (
                      <>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
                        {ddiImageUrl ? (
                          <div className="relative w-full h-48 border-2 border-gray-200 rounded-lg overflow-hidden cursor-crosshair" onClick={handleImageClick}>
                            <img src={`${API}${ddiImageUrl}`} alt="Preview" className="w-full h-full object-contain" />
                            {ddiZones.map((zone) => (
                              <div
                                key={zone.id}
                                className="absolute border-2 border-blue-500 bg-blue-500/20 rounded-full flex items-center justify-center text-xs"
                                style={{ left: `${zone.x}%`, top: `${zone.y}%`, width: 24, height: 24, transform: 'translate(-50%, -50%)' }}
                              >
                                <input
                                  type="text"
                                  value={zone.label}
                                  onChange={(e) => {
                                    const updated = ddiZones.map(z => z.id === zone.id ? { ...z, label: e.target.value } : z);
                                    setDdiZones(updated);
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  placeholder="Label"
                                  className="w-16 text-xs p-1 border rounded text-center"
                                />
                              </div>
                            ))}
                            <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">Click to add zone</div>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <input
                              type="file"
                              accept="image/*"
                              id="ddi-upload"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                setDdiUploading(true);
                                try {
                                  const url = await uploadImage(file);
                                  setDdiImageUrl(url);
                                } catch { setError('Upload failed'); }
                                setDdiUploading(false);
                              }}
                            />
                            <label htmlFor="ddi-upload" className="cursor-pointer">
                              <div className="text-gray-500 text-sm">{ddiUploading ? 'Uploading...' : 'Click to upload image'}</div>
                            </label>
                          </div>
                        )}

                        <label className="block text-sm font-medium text-gray-700 mb-2 mt-4">Zones (Drop Targets)</label>
                        <div className="space-y-2">
                          {ddiZones.map((zone) => (
                            <div key={zone.id} className="flex items-center gap-2">
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">zone {ddiZones.indexOf(zone)}</span>
                              <input
                                type="text"
                                value={zone.label}
                                onChange={(e) => {
                                  const updated = ddiZones.map(z => z.id === zone.id ? { ...z, label: e.target.value } : z);
                                  setDdiZones(updated);
                                }}
                                placeholder="Label for this zone"
                                className="flex-1 p-2 border rounded-lg text-sm"
                              />
                              <span className="text-xs text-gray-400">{Math.round(zone.x)}%, {Math.round(zone.y)}%</span>
                              <button
                                type="button"
                                onClick={() => setDdiZones(ddiZones.filter(z => z.id !== zone.id))}
                                className="text-red-500 hover:text-red-700"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>

                        <label className="block text-sm font-medium text-gray-700 mb-2 mt-4">Distractors (Wrong Labels)</label>
                        <div className="space-y-2">
                          {ddiDistractors.map((d, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">distractor</span>
                              <input
                                type="text"
                                value={d}
                                onChange={(e) => {
                                  const updated = [...ddiDistractors];
                                  updated[index] = e.target.value;
                                  setDdiDistractors(updated);
                                }}
                                placeholder="Wrong label"
                                className="flex-1 p-2 border rounded-lg text-sm"
                              />
                              <button
                                type="button"
                                onClick={() => setDdiDistractors(ddiDistractors.filter((_, i) => i !== index))}
                                className="text-red-500 hover:text-red-700"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => setDdiDistractors([...ddiDistractors, ''])}
                            className="text-sm text-blue-600 hover:underline"
                          >
                            + Add Distractor
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

        {/* AI Generate Modal */}
        {aiOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-bold">Generate Questions with AI</h2>
                <button onClick={resetAiModal} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
              </div>

              <div className="p-6 space-y-4">
                {aiError && (
                  <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{aiError}</div>
                )}

                {/* Step 1: Generation Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Topic <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                      placeholder="e.g. JavaScript closures, Vietnam History..."
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={() => setShowAiContext(!showAiContext)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {showAiContext ? '- Hide' : '+ Add'} Context (optional)
                    </button>
                    {showAiContext && (
                      <textarea
                        value={aiContext}
                        onChange={(e) => setAiContext(e.target.value)}
                        placeholder="Add reference text, article excerpt, or specific context for better questions..."
                        className="w-full p-2 border rounded-lg mt-2"
                        rows={3}
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Question Types</label>
                    <div className="flex flex-wrap gap-2">
                      {['single', 'multi', 'true_false', 'short_answer', 'essay'].map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => toggleAiType(type)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                            aiTypes.includes(type)
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {QUESTION_TYPES.find(t => t.value === type)?.label || type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                      <select
                        value={aiDifficulty}
                        onChange={(e) => setAiDifficulty(e.target.value)}
                        className="w-full p-2 border rounded-lg"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                        <option value="mixed">Mixed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Count (1-20)</label>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={aiCount}
                        onChange={(e) => setAiCount(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleGenerate}
                    disabled={aiGenerating || !aiTopic.trim()}
                    className="w-full py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium"
                  >
                    {aiGenerating ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                        Generating {aiCount} questions...
                      </span>
                    ) : (
                      'Generate Questions'
                    )}
                  </button>
                </div>

                {/* Step 2: Preview Results */}
                {aiResults.length > 0 && (
                  <div className="border-t pt-4 mt-4">
                    <div className="flex items-center justify-between mb-4">
                      <p className="font-medium">{aiResults.length} questions generated</p>
                      <button onClick={handleGenerate} className="text-sm text-blue-600 hover:underline">
                        Regenerate
                      </button>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <button
                        onClick={selectAllAi}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {aiSelected.size === aiResults.length ? 'Deselect All' : 'Select All'}
                      </button>
                      <span className="text-sm text-gray-500">{aiSelected.size} selected</span>
                    </div>

                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {aiResults.map((q, i) => (
                        <div
                          key={i}
                          onClick={() => toggleAiSelect(i)}
                          className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                            aiSelected.has(i) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={aiSelected.has(i)}
                              readOnly
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <div className="flex gap-2 mb-2">
                                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{q.type}</span>
                                <span className={`text-xs px-2 py-0.5 rounded ${difficultyColor(q.difficulty)}`}>
                                  {q.difficulty}
                                </span>
                              </div>
                              <p className="text-sm font-medium line-clamp-3">{q.content}</p>
                              {q.options.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  {q.options.slice(0, 3).map((opt, j) => (
                                    <p
                                      key={j}
                                      className={`text-xs ${
                                        opt.isCorrect ? 'text-green-600 font-medium' : 'text-gray-500'
                                      }`}
                                    >
                                      {opt.isCorrect ? '✓' : '○'} {opt.content}
                                    </p>
                                  ))}
                                  {q.options.length > 3 && (
                                    <p className="text-xs text-gray-400">+{q.options.length - 3} more options</p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={handleSaveSelected}
                        disabled={aiSaving || aiSelected.size === 0}
                        className="flex-1 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                      >
                        {aiSaving ? 'Saving...' : `Save Selected (${aiSelected.size})`}
                      </button>
                      <button
                        onClick={resetAiModal}
                        className="px-4 py-2.5 border rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}