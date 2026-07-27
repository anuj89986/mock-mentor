import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"
import ClientProvider from "@/ClientProvider";
import Navbar from "@/components/ui/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "Mock Mentor",
    template: "%s | Mock Mentor",
  },
  description: "Practice AI-powered mock interviews and improve your skills.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
  <html
    lang="en"
    className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
  >
    <body className="min-h-full flex bg-[#F3EBDD]">
      <ClientProvider>
        <Navbar />
        
        <main className="flex-1 w-full pb-20 md:pb-0">
          {children}
        </main>
        
        <Toaster />
      </ClientProvider>
    </body>
  </html>
);
}
