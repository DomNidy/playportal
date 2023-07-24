import "./globals.css";
import { Inter } from "next/font/google";
import { Noto_Sans } from "next/font/google";
import { cookies } from "next/headers";

const inter = Inter({ subsets: ["latin"] });
const noto_sans = Noto_Sans({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});
export const metadata = {
  title: "Multi-Migrate",
  description: "Transfer your playlists from one platform to another.",
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
    <html lang="en">
      <body className={`${noto_sans.className} ${theme}`}>{children}</body>
    </html>
  );
}
