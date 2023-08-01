import "./globals.css";
import { Inter } from "next/font/google";
import { Noto_Sans } from "next/font/google";
import { cookies } from "next/headers";
import { Providers } from "./providers";
import { getFirebaseApp } from "./utility/GetFirebaseApp";

const inter = Inter({ subsets: ["latin"] });
const noto_sans = Noto_Sans({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});
export const metadata = {
  title: "Playportal",
  description: "Playlist management software",
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
