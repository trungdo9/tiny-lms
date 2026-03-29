'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/retroui/Button';

interface Profile {
    id: string;
    fullName?: string;
    role: string;
}

export function PublicHeader() {
    const router = useRouter();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/users/me`,
                { headers: { Authorization: `Bearer ${session.access_token}` } }
            );
            if (res.ok) {
                const data = await res.json();
                setProfile(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <header className= "bg-white shadow-[0px_4px_0px_0px_rgba(0,0,0,1)] border-b-[4px] border-black sticky top-0 z-50" >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" >
            <div className="flex justify-between items-center h-20" >
                {/* Logo */ }
                < div className = "flex items-center" >
                    <Link href="/" className = "text-2xl font-black text-black tracking-tight hover:scale-105 transition-transform" style = {{ fontFamily: 'var(--font-archivo-black)' }
}>
    TINY LMS
        </Link>
        </div>

{/* Navigation */ }
<nav className="flex items-center gap-6" >
    <Link href="/courses" className = "text-black font-black hover:bg-[#ffdb33] px-3 py-1 border-2 border-transparent hover:border-black hover:shadow-[2px_2px_0px_0px_#000] transition-all" style = {{ fontFamily: 'var(--font-space-grotesk)' }}>
        Catalog
        </Link>

        < div className = "flex items-center gap-4 ml-4" >
            {
                loading?(
                <div className = "w-20 h-8 bg-gray-200 animate-pulse border-2 border-black" />
              ): profile ? (
                    <Button asChild className = "bg-[#ffdb33] text-black border-[3px] border-black shadow-[4px_4px_0px_0px_#000] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#000] transition-all font-black" style = {{ fontFamily: 'var(--font-space-grotesk)' }}>
                <Link href="/dashboard" >
                Dashboard →
                    </Link>
                    </Button>
                ) : (
                    <>
                    <Link href= "/login" className = "text-black font-black hover:underline underline-offset-4 decoration-2" style = {{ fontFamily: 'var(--font-space-grotesk)' }}>
                        Log In
                            </Link>
                            < Button asChild className = "bg-black text-white border-[3px] border-black shadow-[4px_4px_0px_0px_#000] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#ffdb33] transition-all font-black" style = {{ fontFamily: 'var(--font-space-grotesk)' }}>
                                <Link href="/register" >
                                    Sign Up
                                        </Link>
                                        </Button>
                                        </>
              )}
</div>
    </nav>
    </div>
    </div>
    </header>
  );
}
