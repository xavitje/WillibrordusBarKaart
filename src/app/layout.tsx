import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "BarKas - Scouting Willibrordusgroep",
  description: "Digitaal BarKas systeem voor het afstrepen van drankjes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body className={montserrat.className}>
        <Navbar />
        <main className="container" style={{ padding: "2rem 1rem" }}>
          {children}
        </main>
      </body>
    </html>
  );
}

