'use client';

import { useEffect, useState } from 'react';
import { settingsApi } from '@/lib/api';

interface Setting {
  key: string;
  value: unknown;
  type: string;
}

export function GAInitializer() {
  const [gaCode, setGaCode] = useState<string | null>(null);

  useEffect(() => {
    const fetchGACode = async () => {
      try {
        const settings = await settingsApi.getByCategory('analytics') as Setting[];
        const gaSetting = settings.find((s) => s.key === 'analytics_ga_code');
        const dbGaCode = (gaSetting?.value as string) || '';
        const effectiveGaCode = dbGaCode || process.env.NEXT_PUBLIC_GA_ID || '';
        if (effectiveGaCode) {
          setGaCode(effectiveGaCode);
        }
      } catch {
        const envGaCode = process.env.NEXT_PUBLIC_GA_ID || '';
        if (envGaCode) {
          setGaCode(envGaCode);
        }
      }
    };

    fetchGACode();
  }, []);

  if (!gaCode) return null;

  return (
    <>
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaCode}`} />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaCode}', {
              page_path: window.location.pathname,
              send_page_view: true,
            });
          `,
        }}
      />
    </>
  );
}
