import type { Metadata } from "next";
import { Pixelify_Sans, Silkscreen } from "next/font/google";
import "./globals.css";

const pixelify = Pixelify_Sans({
  subsets: ["latin"],
  variable: "--font-pixel",
  display: "swap",
});

const silkscreen = Silkscreen({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-silkscreen",
  display: "swap",
});

export const metadata: Metadata = {
  title: "WeZards — Enter the Circle",
  description: "Complete the WeZards quests and earn your place in the circle.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "WeZards — Enter the Circle",
    description: "Complete the WeZards quests and earn your place in the circle.",
    url: "https://wezards.io",
    siteName: "WeZards Whitelist",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WeZards — Enter the Circle",
    description: "Complete the WeZards quests and earn your place in the circle.",
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
    <html lang="en" className={`${pixelify.variable} ${silkscreen.variable} dark`}>
      <body className="bg-obsidian text-slate-100 font-pixel antialiased">
        {children}
      </body>
    </html>
  );
}
