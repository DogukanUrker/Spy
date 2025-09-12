import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Casus Kim?",
  description:
    "Casus Kim? - Arkadaşlarınızla oynayabileceğiniz eğlenceli casus oyunu",
  keywords: [
    "casus oyunu",
    "party oyunu",
    "arkadaş oyunu",
    "spy game",
    "türkçe oyun",
    "eğlenceli oyun",
  ],
  openGraph: {
    title: "Casus Kim? 🕵️ - Eğlenceli Casus Oyunu",
    description:
      "Casus Kim? - Arkadaşlarınızla oynayabileceğiniz eğlenceli casus oyunu",
    type: "website",
    images: ["/web-app-manifest-512x512.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Casus Kim? 🕵️ - Eğlenceli Casus Oyunu",
    description:
      "Casus Kim? - Arkadaşlarınızla oynayabileceğiniz eğlenceli casus oyunu",
    images: ["/web-app-manifest-512x512.png"],
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="dark">
      <head>
        <meta name="theme-color" content="#000000" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link
          rel="icon"
          type="image/png"
          sizes="96x96"
          href="/favicon-96x96.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="apple-mobile-web-app-title" content="Casus Kim?" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background`}
      >
        {children}
      </body>
    </html>
  );
}
