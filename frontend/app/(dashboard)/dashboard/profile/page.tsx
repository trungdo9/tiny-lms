'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/query-keys';

interface Profile {
    id: string;
    email: string;
    fullName?: string;
    bio?: string;
    phone?: string;
    avatarUrl?: string;
    role: string;
}

async function fetchProfile() {
    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/users/me`,
        {
            headers: { Authorization: `Bearer ${session?.access_token}` },
        }
    );
    if (!response.ok) throw new Error('Failed to fetch profile');
    return response.json();
}

export default function DashboardProfilePage() {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        fullName: '',
        bio: '',
        phone: '',
    });
    const [success, setSuccess] = useState('');

    const { data: profile, isLoading, error } = useQuery<Profile>({
        queryKey: queryKeys.profile(),
        queryFn: fetchProfile,
    });

    // Update form data when profile loads
    useState(() => {
        if (profile) {
            setFormData({
                fullName: profile.fullName || '',
                bio: profile.bio || '',
                phone: profile.phone || '',
            });
        }
    });

    const updateMutation = useMutation({
        mutationFn: async (data: { fullName: string; bio: string; phone: string }) => {
            const { data: { session } } = await supabase.auth.getSession();
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/users/me/profile`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${session?.access_token}`,
                    },
                    body: JSON.stringify(data),
                }
            );
            if (!response.ok) throw new Error('Failed to update profile');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.profile() });
            setSuccess('Profile updated successfully.');
            setTimeout(() => setSuccess(''), 3000);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateMutation.mutate(formData);
    };

    if (isLoading) {
        return (
            <div className= "min-h-screen flex items-center justify-center" >
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" > </div>
                </div>
    );
    }

    if (error) {
        return (
            <div className= "p-8" >
            <div className="max-w-2xl mx-auto" >
                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm" > { error.message } </div>
                    </div>
                    </div>
    );
    }

    return (
        <div className= "p-8" >
        <div className="max-w-2xl mx-auto" >
            <div className="mb-8" >
                <h1 className="text-2xl font-semibold text-slate-900" > Profile Settings </h1>
                    < p className = "text-sm text-slate-500 mt-1" > Manage your administrator and instructor profile information </p>
                        </div>

    {
        updateMutation.error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm" > { updateMutation.error.message } </div>
        )
    }
    {
        success && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-md text-sm" > { success } </div>
        )
    }

    {/* Profile Info Card */ }
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6" >
        <div className="flex items-center gap-5" >
            <div className="w-16 h-16 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center shrink-0" >
                {
                    profile?.fullName?(
                <span className = "text-xl font-semibold text-slate-700" >
                            { profile.fullName.charAt(0).toUpperCase() }
                            </span>
                    ): (
                            <span className = "text-xl font-medium text-slate-400">?</ span >
              )
}
</div>
    < div >
    <h2 className="text-lg font-semibold text-slate-900" > { profile?.fullName || 'No name set'}</h2>
        < p className = "text-sm text-slate-500" > { profile?.email } </p>
            < div className = "mt-2 text-xs font-medium bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md inline-block capitalize border border-slate-200" >
                { profile?.role } Role
                    </div>
                    </div>
                    </div>
                    </div>

{/* Edit Form */ }
<div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6" >
    <h2 className="text-base font-semibold text-slate-900 mb-5" > Personal Information </h2>
        < form onSubmit = { handleSubmit } className = "space-y-5" >
            <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5" >
                Full Name
                    </label>
                    < input
type = "text"
value = { formData.fullName }
onChange = {(e) => setFormData({ ...formData, fullName: e.target.value })}
className = "w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
placeholder = "Enter your full name"
    />
    </div>

    < div >
    <label className="block text-sm font-medium text-slate-700 mb-1.5" >
        Bio
        </label>
        < textarea
value = { formData.bio }
onChange = {(e) => setFormData({ ...formData, bio: e.target.value })}
className = "w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
rows = { 4}
placeholder = "Tell us about your professional background"
    />
    </div>

    < div >
    <label className="block text-sm font-medium text-slate-700 mb-1.5" >
        Phone Number
            </label>
            < input
type = "tel"
value = { formData.phone }
onChange = {(e) => setFormData({ ...formData, phone: e.target.value })}
className = "w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
placeholder = "Enter your contact number"
    />
    </div>

    < div className = "pt-2" >
        <button
                type="submit"
disabled = { updateMutation.isPending }
className = "w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
    { updateMutation.isPending ? 'Saving Changes...' : 'Save Changes' }
    </button>
    </div>
    </form>
    </div>
    </div>
    </div>
  );
}
