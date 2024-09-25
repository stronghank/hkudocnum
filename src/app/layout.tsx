import type { Metadata } from 'next';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import ThemeRegistry from '@/components/ThemeRegistry';
import ConditionalHeader from '@/components/ConditionalHeader';
import Footer from '@/components/Footer';
import { Providers } from '@/components/Providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'HKU Med Document Management',
  description: 'Document number management system for HKU Faculty of Medicine',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Providers>
          <AppRouterCacheProvider>
            <ThemeRegistry>
              <ConditionalHeader />
              <main style={{ flex: 1 }}>{children}</main>
              <Footer />
            </ThemeRegistry>
          </AppRouterCacheProvider>
        </Providers>
      </body>
    </html>
  );
}