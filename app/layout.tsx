import './globals.css';
import type { Metadata } from 'next';
import SmoothScroll from '@/components/SmoothScroll';

export const metadata: Metadata = {
  title: 'PUFFY • Wear A Brighter World | 3D Puffer Studio',
  description: 'Iconic puffer jackets with iridescent nano-glaze and sub-zero cloud down. Explore the interactive 3D WebGL Studio and the Plushy dreamscape.',
  icons: {
    icon: '/assets/brand/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SmoothScroll>
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
