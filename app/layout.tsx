import "./globals.css";
import { Inter } from "next/font/google";
import { Noto_Sans } from "next/font/google";
import { cookies } from "next/headers";
import { Providers } from "./providers";
import { getFirebaseApp } from "./utility/GetFirebaseApp";
import { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });
const noto_sans = Noto_Sans({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Playportal",
    template: `%s | Playportal`,
  },
  description:
    "Playportal gives you control over your online music streaming experience. Connect your streaming service accounts and easily modify them; or with a single click, transfer them to a new platform entirely!",
  keywords: [
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
    // TODO: Add display image here
  },
  manifest: `https://www.playportal.app/site.webmanifest`,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  let theme = "light";

  // If we have theme in our cookies
  if (cookieStore.get("theme")) {
    theme = cookieStore.get("theme")!?.value;
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={`${noto_sans.className} ${theme}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
