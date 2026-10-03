import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: 'PETTA｜智能宠物项圈概念计划',
  description: '持续感知、注意变化、解释提醒。加入 PETTA 智能宠物项圈首批共创计划。',
  openGraph: {
    title: 'PETTA｜Notice the change.',
    description: '持续感知、注意变化、解释提醒。加入 PETTA 首批共创计划。',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'PETTA smart pet health collar concept' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PETTA｜Notice the change.',
    description: '持续感知、注意变化、可解释提醒。',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
