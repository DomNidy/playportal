import "./globals.css";
import { Poppins } from "next/font/google";
import { ThemeProvider } from "../components/ThemeProvider";
import { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { TailwindIndicator } from "@/components/TailwindIndicator";

const poppins = Poppins({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  icons: {
    icon: "/icon.svg",
  },
  title: {
    default: "Playportal",
    template: `%s | Playportal`,
  },
  description:
    "Playportal gives you control over your online music streaming experience. Connect your streaming service accounts and easily modify them; or with a single click, transfer them to a new platform entirely!",
  keywords: [
    "Playlist transfer",
    "share playlists",
    "music migration",
    "cross-platform sharing",
    "PlayPortal",
    "Transfer playlists",
    "Bulk playlists transfer",
    "Spotify playlist to youtube",
    "Transfer youtube playlist to spotify",
    "Youtube playlist editor",
    "Spotify playlist editor",
  ],
  authors: [
    {
      name: "Dominic Nidy",
    },
  ],
  creator: "Dominic Nidy",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.playportal.app/",
    title: "Playportal",
    siteName: "Playportal",
    description:
      "Playportal gives you control over your online music streaming experience. Connect your streaming service accounts and easily modify them; or with a single click, transfer them to a new platform entirely!",
  },
  twitter: {
    card: "summary_large_image",
    title: "Playportal",
    description:
      "Playportal gives you control over your online music streaming experience. Connect your streaming service accounts and easily modify them; or with a single click, transfer them to a new platform entirely!",
    images: [`https://www.playportal.app/og.png`],
  },
  manifest: `https://www.playportal.app/site.webmanifest`,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={`${poppins.className}`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Analytics />
          <TailwindIndicator />
        </ThemeProvider>
      </body>
    </html>
  );
}
