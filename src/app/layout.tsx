import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Options Scanner",
  description: "Real-time stock options price scanner",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
