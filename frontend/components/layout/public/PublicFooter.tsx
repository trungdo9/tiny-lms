'use client';

import Link from 'next/link';

export function PublicFooter() {
    return (
        <footer className= "bg-white border-t-[4px] border-black mt-auto z-10 relative" >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" >
            <div className="flex flex-col md:flex-row justify-between items-center gap-4" >
                <p className="text-black font-bold text-sm" style = {{ fontFamily: 'var(--font-space-grotesk)' }
}>
            © { new Date().getFullYear() } Tiny LMS.All rights reserved.
          </p>
    < div className = "flex gap-6 text-sm font-black" style = {{ fontFamily: 'var(--font-space-grotesk)' }}>
        <Link href="/" className = "text-black hover:-translate-y-0.5 transition-transform hover:underline" >
            Home
            </Link>
            < Link href = "/courses" className = "text-black hover:-translate-y-0.5 transition-transform hover:underline" >
                Courses
                </Link>
                </div>
                </div>
                </div>
                </footer>
  );
}
