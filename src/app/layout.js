// src/app/layout.js
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LangProvider } from "@/context/LangContext";
import { headers } from "next/headers";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata() {
  const headersList = await headers();
  const host = headersList.get("host") ?? "";

  const isEnglish = host.includes("copdcalendar.com");

  return {
    title: isEnglish ? "COPD Calendar" : "Kolskalendar",
    description: isEnglish
      ? "COPD symptom calendar"
      : "Symptomkalender for kols",
  };
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
