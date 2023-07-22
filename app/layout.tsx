import "./globals.css";
import { Inter } from "next/font/google";
import { Noto_Sans } from "next/font/google";

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
  return (
    <html lang="en">
      <body className={noto_sans.className}>{children}</body>
    </html>
  );
}
