import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'T.U.E.M.I. System',
  description: 'Sistema de Gestión y Monitoreo del Transporte Universitario EMI',
  applicationName: 'T.U.E.M.I.',
  authors: [{ name: 'EMI' }],
  keywords: ['transporte', 'universitario', 'EMI', 'Bolivia', 'monitoreo', 'GPS'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'T.U.E.M.I.',
  },
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#1A237E' },
    { media: '(prefers-color-scheme: dark)', color: '#0D1642' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning className="scroll-smooth">
      <head>
        {/* PWA Meta Tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="T.U.E.M.I." />
        
        {/* Prevenir zoom en inputs en iOS */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
        
        {/* Soporte para diferentes tamaños de iconos */}
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      </head>
      <body 
        className={`${inter.className} ${inter.variable} antialiased min-h-screen`}
        suppressHydrationWarning
      >
        {/* Contenedor principal con soporte para safe area */}
        <div className="relative flex min-h-screen flex-col">
          {children}
        </div>
        
        {/* Toaster con posición responsive */}
        <Toaster />
        
        {/* Script para detectar touch devices */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
                  document.documentElement.classList.add('touch-device');
                }
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}