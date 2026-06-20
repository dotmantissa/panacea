import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "Panacea Medical Second Opinion On Chain",
  description: "Your prescription and diagnosis, cross checked with clinical guidelines and stored securely on chain. Read your briefings in plain English.",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
