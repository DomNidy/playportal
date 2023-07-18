import { initializeApp } from "firebase/app";
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
  // Initialize firebase app here so we dont have to worry about it anywhere else
  initializeApp({
    apiKey: "AIzaSyAPczHoT5cJ1fxv4fk_fQjnRHaL8WXPX-o",
    authDomain: "multi-migrate.firebaseapp.com",
    projectId: "multi-migrate",
    storageBucket: "multi-migrate.appspot.com",
    messagingSenderId: "296730327999",
    appId: "1:296730327999:web:74c09b878bd58e8a28ff0a",
    measurementId: "G-V87LXV2M29",
  });
  return (
    <html lang="en">
      <body className={noto_sans.className}>{children}</body>
    </html>
  );
}
