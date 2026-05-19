import type { Metadata } from "next";
import { Geist, Geist_Mono, Pacifico } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Ticker from "./components/Ticker";
import Footer from "./components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const pacifico = Pacifico({
  variable: "--font-cursive",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VYRAL — Leverage trading on virality",
  description:
    "Long or short the popularity of celebrities, news, sports, RWA, and pre-IPO subjects with up to 20x leverage, settled in VYR.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${pacifico.variable} antialiased min-h-screen flex flex-col`}
      >
        <Navbar />
        <Ticker />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
