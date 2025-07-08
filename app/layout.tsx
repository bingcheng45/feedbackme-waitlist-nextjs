import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { SessionProvider } from '@/components/providers/SessionProvider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FeedbackMe - Transform Websites Into Collaborative Communities',
  description: 'The plug-and-play tool that turns user feedback into actionable insights. Just a few lines of code to build transparent, voting-powered communities around your product.',
  keywords: ['feedback', 'community', 'collaboration', 'user engagement', 'product development'],
  authors: [{ name: 'FeedbackMe Team' }],
  creator: 'FeedbackMe',
  publisher: 'FeedbackMe',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://feedbackme.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'FeedbackMe - Transform Websites Into Collaborative Communities',
    description: 'The plug-and-play tool that turns user feedback into actionable insights.',
    url: 'https://feedbackme.com',
    siteName: 'FeedbackMe',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FeedbackMe - Transform Websites Into Collaborative Communities',
    description: 'The plug-and-play tool that turns user feedback into actionable insights.',
    creator: '@feedbackme',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <main className="min-h-screen bg-black text-white">
            {children}
          </main>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 5000,
              style: {
                background: 'transparent',
                boxShadow: 'none',
                padding: 0,
              },
            }}
          />
        </SessionProvider>
      </body>
    </html>
  );
} 