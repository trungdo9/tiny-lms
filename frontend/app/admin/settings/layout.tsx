'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { name: 'General', href: '/admin/settings' },
  { name: 'Email', href: '/admin/settings/email' },
  { name: 'Templates', href: '/admin/settings/email/templates' },
  { name: 'Logs', href: '/admin/settings/email/logs' },
  { name: 'Branding', href: '/admin/settings/branding' },
  { name: 'Auth', href: '/admin/settings/auth' },
  { name: 'Organization', href: '/admin/settings/organization' },
  { name: 'Departments', href: '/admin/settings/departments' },
  { name: 'Categories', href: '/admin/settings/categories' },
  { name: 'Contact Sync', href: '/admin/settings/contact-sync' },
  { name: 'Analytics', href: '/admin/settings/analytics' },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const isActive = tab.href === '/admin/settings'
              ? pathname === '/admin/settings'
              : pathname.startsWith(tab.href);

            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-8">{children}</div>
    </div>
  );
}
