import React from 'react';
import type { Metadata } from "next";
import { Poppins } from 'next/font/google';
import './globals.css';
import AuthProvider from '@/components/AuthProvider';
import NavbarWrapper from '@/components/NavbarWrapper';
import Script from 'next/script';
import Footer from '@/components/Footer';
import styles from "./layout.module.css";

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
    <html lang="en" className={poppins.variable}>
      <body>
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
          <div className={styles.mainContainer}>
            <NavbarWrapper />
            <main className={styles.mainContent}>
              <div className={styles.contentWrapper}>
                {children}
              </div>
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}