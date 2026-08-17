import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "WeZard — Enter the Circle",
  description: "Complete the WeZard quests and earn your place in the circle.",
  openGraph: {
    title: "WeZard — Enter the Circle",
    description: "Complete the WeZard quests and earn your place in the circle.",
    url: "https://wezard.io",
    siteName: "WeZard Whitelist",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WeZard — Enter the Circle",
    description: "Complete the WeZard quests and earn your place in the circle.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} dark`}>
      <body className="bg-obsidian text-slate-100 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
