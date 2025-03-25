import React from 'react';
import type { Metadata } from "next";
import { Poppins } from 'next/font/google'; // Changed font to Poppins for better readability
import './globals.css';
import AuthProvider from '@/components/AuthProvider';
import NavbarWrapper from '@/components/NavbarWrapper';
import Script from 'next/script';
import Footer from '@/components/Footer'; // Added Footer component

const poppins = Poppins({ 
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: "Flower Shop",
  description: "Online flower shop application",
  icons: {
    icon: '/favicon.ico'
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${poppins.variable} scroll-smooth`} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-50 text-gray-800" suppressHydrationWarning>
        <Script id="hydration-fix" strategy="afterInteractive">
          {`
            // Clean-up attributes added by browser extensions
            document.body.removeAttribute('bis_register');
            document.body.removeAttribute('__processed_a43ad232-a378-4f74-8fa5-efd6f9c77920__');
            Array.from(document.body.attributes).forEach(attr => {
              if(attr.name.startsWith('__processed_')) {
                document.body.removeAttribute(attr.name);
              }
            });
          `}
        </Script>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <NavbarWrapper />
            <main className="container mx-auto px-4 py-8 flex-grow max-w-7xl">
              <div className="bg-white rounded-lg shadow-sm p-6">
                {children}
              </div>
            </main>
            <Footer /> {/* Add a Footer component */}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}