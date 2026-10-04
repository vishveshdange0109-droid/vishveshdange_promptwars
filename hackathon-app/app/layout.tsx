import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Think Twice | Decision Reflection & Interrogation System",
  description:
    "AI that doesn't tell you what to decide. It asks what you haven't considered. Think Twice. Decide Once.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-white text-black">
      <body className="min-h-full flex flex-col font-ui bg-white text-[#0A0A0A] selection:bg-[#0B8A3E] selection:text-white">
        {children}
      </body>
    </html>
  );
}
