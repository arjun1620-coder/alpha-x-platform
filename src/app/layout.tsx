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

const siteUrl = "https://alpha-x-robotics.vercel.app";

export const metadata: Metadata = {
  title: {
    default: "AlphaX Robotics — Next-Gen Robotics Engineering Platform",
    template: "%s | AlphaX Robotics",
  },
  description: "Join AlphaX Robotics — a cutting-edge robotics engineering team pushing the boundaries of autonomous systems, embedded hardware, AI, and 3D printing. Apply now to build the future.",
  keywords: [
    "AlphaX Robotics", "robotics club", "engineering team", "autonomous systems",
    "AI", "embedded systems", "Arduino", "ESP32", "ROS", "3D printing",
    "PCB design", "machine learning", "robotics platform", "join robotics team"
  ],
  authors: [{ name: "AlphaX Robotics" }],
  creator: "AlphaX Robotics",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "AlphaX Robotics",
    title: "AlphaX Robotics — Engineering the Future",
    description: "A next-generation robotics engineering platform. Join our team of engineers, designers, and innovators building autonomous systems and AI-powered robots.",
    images: [
      {
        url: `${siteUrl}/icons/v1-512.png`,
        width: 512,
        height: 512,
        alt: "AlphaX Robotics Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AlphaX Robotics — Engineering the Future",
    description: "Join our robotics engineering team. We build autonomous systems, custom hardware, and AI-powered robots.",
    images: [`${siteUrl}/icons/v1-512.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/icons/v1-192.png",
    apple: "/icons/v1-192.png",
    shortcut: "/icons/v1-192.png",
  },
  verification: {
    google: "bJmbVVIt1tF1Ye7r7y-Ocl6LpY0pX8T8_J5vI7ZfU4s",
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
      <head>
        {/* Structured Data (JSON-LD) for Google Search */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "AlphaX Robotics",
              url: siteUrl,
              logo: `${siteUrl}/icons/v1-512.png`,
              description: "Next-generation robotics engineering team building autonomous systems, custom hardware, and AI-powered robots.",
              sameAs: [],
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "general",
                url: `${siteUrl}/contact`,
              },
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col relative text-white bg-[#030712] animate-page-in">
        {/* Global Background Layer */}
        <div className="fixed inset-0 z-[-10] w-full h-full bg-mesh-gradient gpu-accelerate overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_80%_at_50%_0%,black_40%,transparent_100%)]" />
          <div className="absolute top-0 left-0 right-0 h-full w-full bg-gradient-to-b from-indigo-500/5 via-transparent to-transparent pointer-events-none" />
        </div>
        
        <ScrollAnimations />
        {children}
      </body>
    </html>
  );
}
