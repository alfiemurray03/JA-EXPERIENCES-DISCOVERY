import { RouteObject } from 'react-router-dom';
import { lazy } from 'react';
import HomePage from './pages/index';
import WhatWePrintPage from './pages/what-we-print';
import PortfolioPage from './pages/portfolio';
import ContactPage from './pages/contact';
import QuotePage from './pages/quote';

const NotFoundPage = import.meta.env.DEV
  ? lazy(() => import('../dev-tools/src/PageNotFound'))
  : lazy(() => import('./pages/_404'));

export const routes: RouteObject[] = [
  { path: '/', element: <HomePage /> },
  { path: '/what-we-print', element: <WhatWePrintPage /> },
  { path: '/portfolio', element: <PortfolioPage /> },
  { path: '/contact', element: <ContactPage /> },
  { path: '/quote', element: <QuotePage /> },
  { path: '/privacy', element: <PrivacyPage /> },
  { path: '/terms', element: <TermsPage /> },
  { path: '*', element: <NotFoundPage /> },
];

function PrivacyPage() {
  return (
    <>
      <title>Privacy Policy — JA Print Studio</title>
      <div className="container mx-auto px-6 lg:px-8 py-20 max-w-3xl">
        <h1 className="text-5xl font-heading font-bold text-foreground mb-8">Privacy Policy</h1>
        <div className="prose prose-sm text-foreground/70 space-y-4">
          <p>JA Print Studio (operated by JA Group Services Ltd) is committed to protecting your personal data. This policy explains how we collect, use, and store your information.</p>
          <h2 className="text-xl font-bold text-foreground mt-6">Data We Collect</h2>
          <p>We collect your name, email address, phone number, and any files you upload as part of a print request. We use this information solely to process your orders and communicate with you about them.</p>
          <h2 className="text-xl font-bold text-foreground mt-6">How We Use Your Data</h2>
          <p>Your data is used to process print requests, send quotes, and provide customer support. We do not sell or share your data with third parties except as required to fulfil your order.</p>
          <h2 className="text-xl font-bold text-foreground mt-6">Contact</h2>
          <p>For data enquiries, contact us at Hello@jagroupservices.co.uk.</p>
        </div>
      </div>
    </>
  );
}

function TermsPage() {
  return (
    <>
      <title>Terms of Service — JA Print Studio</title>
      <div className="container mx-auto px-6 lg:px-8 py-20 max-w-3xl">
        <h1 className="text-5xl font-heading font-bold text-foreground mb-8">Terms of Service</h1>
        <div className="prose prose-sm text-foreground/70 space-y-4">
          <p>By using JA Print Studio's services, you agree to these terms. JA Print Studio is a trading brand operated by JA Group Services Ltd.</p>
          <h2 className="text-xl font-bold text-foreground mt-6">Orders & Quotes</h2>
          <p>All quotes are custom and non-binding until accepted by both parties. Payment is required before production begins. We reserve the right to decline any order.</p>
          <h2 className="text-xl font-bold text-foreground mt-6">Artwork</h2>
          <p>You are responsible for ensuring all uploaded artwork is print-ready and that you own the rights to all content. We are not liable for errors in customer-supplied artwork.</p>
          <h2 className="text-xl font-bold text-foreground mt-6">Delivery</h2>
          <p>Delivery timescales are estimates. We are not liable for delays caused by third-party couriers.</p>
          <h2 className="text-xl font-bold text-foreground mt-6">Contact</h2>
          <p>For any queries, contact us at Hello@jagroupservices.co.uk.</p>
        </div>
      </div>
    </>
  );
}

export type Path = '/' | '/what-we-print' | '/portfolio' | '/contact' | '/quote';
export type Params = Record<string, string | undefined>;
