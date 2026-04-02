import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ScrollAnimations from "@/components/ScrollAnimations";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AlphaX Robotics",
  description: "Next-generation robotics engineering platform. Join the team pushing the boundaries of autonomous systems, hardware design, and AI.",
  keywords: ["robotics", "engineering", "AI", "autonomous systems", "AlphaX"],
  icons: {
    icon: "/icons/v1-192.png",
    apple: "/icons/v1-192.png",
    shortcut: "/icons/v1-192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col relative text-white bg-[#030712] animate-page-in">
        {/* Global Background — GPU accelerated */}
        <div className="fixed inset-0 z-[-10] w-full h-full bg-[#030712] gpu-accelerate">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
          <div className="absolute top-0 left-0 right-0 h-[500px] bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.12),transparent_50%)]" />
        </div>
        
        <ScrollAnimations />
        {children}
      </body>
    </html>
  );
}
