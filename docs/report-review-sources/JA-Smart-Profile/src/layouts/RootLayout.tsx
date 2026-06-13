import { Helmet } from '@dr.pogodin/react-helmet';
import { type ReactElement } from 'react';
import { ScrollRestoration } from 'react-router-dom';
import Website from '@/layouts/Website';
import CookieBanner from '@/components/CookieBanner';

interface RootLayoutProps {
  children: ReactElement;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <Website>
      <Helmet>
        <title>JA Smart Profile — Your Digital Business Card, Reimagined</title>
        <meta name="description" content="Create a stunning digital profile that showcases who you are and what you do — share it with a single link. Free to start." />
      </Helmet>
      <ScrollRestoration />
      {children}
      <CookieBanner />
    </Website>
  );
}
