import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Health Tracker',
  description: 'Daily health log with trends',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
