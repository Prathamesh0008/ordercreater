import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KVA Orders",
  description: "Order management with user and admin roles",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
