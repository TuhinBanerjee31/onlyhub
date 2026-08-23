import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "onlyhub • Hackathon Radar",
  description: "Discover, filter, and track 160+ global developer hackathons across Devfolio, DoraHacks, MLH, Unstop, and WeMakeDevs.",
  keywords: ["onlyhub", "hackathons", "devfolio", "dorahacks", "mlh", "unstop", "wemakedevs", "bounties", "engineering"],
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
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/onlyhub_logo.png" type="image/png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-white dark:bg-black text-black dark:text-white antialiased selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
        {children}
      </body>
    </html>
  );
}
