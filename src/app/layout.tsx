import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AudioPlayerProvider } from '@/store';
import { Header, Footer } from '@/components/layout';
import { Player } from '@/components/features';

export const metadata: Metadata = {
  title: 'StoryHub - Listen to Premium Audiobooks & Stories',
  description: 'Stream unlimited futuristic audiobooks, biography summaries, and audio stories in English.',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/favicon.svg',
    apple: '/apple-icon',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full scroll-smooth antialiased dark">
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100">
        <AudioPlayerProvider>
          {/* HEADER */}
          <Header />

          {/* MAIN PAGE BODY */}
          <main className="flex-grow">
            {children}
          </main>

          {/* FOOTER */}
          <Footer />

          {/* PERSISTENT STICKY PLAYER */}
          <Player />
        </AudioPlayerProvider>
      </body>
    </html>
  );
}
