import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
});

export const metadata: Metadata = {
  title: "onlyhub • Global Hackathon Radar",
  description:
    "Discover, filter, and track 160+ global developer hackathons across Devfolio, DoraHacks, MLH, Unstop, and WeMakeDevs.",
  keywords: [
    "onlyhub",
    "hackathons",
    "devfolio",
    "dorahacks",
    "mlh",
    "unstop",
    "wemakedevs",
    "bounties",
    "engineering",
  ],
  icons: {
    icon: "/onlyhub_logo.png",
    shortcut: "/onlyhub_logo.png",
    apple: "/onlyhub_logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${spaceGrotesk.variable}`}>
      <head>
        <link rel="icon" href="/onlyhub_logo.png" type="image/png" />
      </head>
      <body className="min-h-screen bg-white dark:bg-black text-black dark:text-white antialiased font-sans selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
        {children}
      </body>
    </html>
  );
}
