import { Helmet } from '@dr.pogodin/react-helmet';
import { type ReactElement } from 'react';
import { ScrollRestoration } from 'react-router-dom';

import Footer from '@/layouts/parts/Footer';
import Header from '@/layouts/parts/Header';
import Website from '@/layouts/Website';

interface RootLayoutProps {
  children: ReactElement;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <Website>
      <Helmet>
        <title>JABooking — Online Booking for Every Business</title>
        <meta
          name="description"
          content="JABooking is the UK's multi-industry online booking platform. From barbers to personal trainers, tutors to dog groomers — get your professional booking page, manage appointments and get paid online."
        />
        <meta property="og:site_name" content="JABooking" />
        <meta property="og:type" content="website" />
        <meta name="theme-color" content="#6366F1" />
      </Helmet>
      <ScrollRestoration />
      <Header />
      {children}
      <Footer />
    </Website>
  );
}
