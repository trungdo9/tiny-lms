'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/query-keys';
import { Save } from 'lucide-react';

interface ProfileEditFormProps {
  initialData: { fullName: string; bio: string; phone: string };
}

export function ProfileEditForm({ initialData }: ProfileEditFormProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(initialData);
  const [success, setSuccess] = useState('');

  const updateMutation = useMutation({
    mutationFn: async (data: { fullName: string; bio: string; phone: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/users/me/profile`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
          body: JSON.stringify(data),
        }
      );
      if (!response.ok) throw new Error('Failed to update profile');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile() });
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  return (
    <>
      {updateMutation.error && (
        <div className="mb-6 p-4 bg-red-100 border-[3px] border-black text-red-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold">
          {updateMutation.error.message}
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-green-400 border-[3px] border-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold">
          {success}
        </div>
      )}

      <div className="bg-[#ff90e8] border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
        <h2 className="text-2xl font-black text-black mb-6" style={{ fontFamily: 'var(--font-archivo-black)' }}>
          Edit Profile
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {[
            { label: 'Full Name', type: 'text', key: 'fullName' as const, placeholder: 'Enter your full name' },
            { label: 'Phone', type: 'tel', key: 'phone' as const, placeholder: 'Enter your phone number' },
          ].map(({ label, type, key, placeholder }) => (
            <div key={key}>
              <label className="block text-lg font-black text-black mb-2" style={{ fontFamily: 'var(--font-archivo-black)' }}>
                {label}
              </label>
              <input
                type={type}
                value={formData[key]}
                onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                className="w-full p-4 bg-white border-[3px] border-black text-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:translate-y-1 focus:shadow-none transition-all placeholder:text-gray-500"
                placeholder={placeholder}
              />
            </div>
          ))}
          <div>
            <label className="block text-lg font-black text-black mb-2" style={{ fontFamily: 'var(--font-archivo-black)' }}>
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full p-4 bg-white border-[3px] border-black text-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:translate-y-1 focus:shadow-none transition-all placeholder:text-gray-500"
              rows={4}
              placeholder="Tell us about yourself"
            />
          </div>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="w-full mt-4 py-4 bg-black text-[#ffdb33] border-[3px] border-black font-black uppercase text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-slate-800 disabled:opacity-70 transition-all hover:translate-y-1 hover:shadow-none flex items-center justify-center gap-3"
            style={{ fontFamily: 'var(--font-archivo-black)' }}
          >
            <Save className="w-5 h-5" />
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </>
  );
}
