import type { Metadata } from "next";
import localFont from "next/font/local";
import {
  Inter,
  Roboto,
  Poppins,
  Playfair_Display,
  Dancing_Script,
  Quicksand,
  Nunito,
  Pacifico
} from "next/font/google";
import { Suspense } from "react";
import { LoadingProvider, NavigationProgress } from "@/components/providers";
import { PWAInstallPrompt } from "@/components/pwa/PWAInstallPrompt";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
});
const roboto = Roboto({
  weight: ["400", "500", "700"],
  subsets: ["latin", "vietnamese"],
  variable: "--font-roboto",
  display: "swap",
});
const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});
const playfairDisplay = Playfair_Display({
  subsets: ["latin", "vietnamese"],
  variable: "--font-playfair",
  display: "swap",
});
const dancingScript = Dancing_Script({
  subsets: ["latin", "vietnamese"],
  variable: "--font-dancing-script",
  display: "swap",
});
const quicksand = Quicksand({
  subsets: ["latin", "vietnamese"],
  variable: "--font-quicksand",
  display: "swap",
});
const nunito = Nunito({
  subsets: ["latin", "vietnamese"],
  variable: "--font-nunito",
  display: "swap",
});
const pacifico = Pacifico({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pacifico",
  display: "swap",
});

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    default: "Love Memories - Lưu giữ kỷ niệm yêu thương",
    template: "%s | Love Memories",
  },
  description: "Tạo trang kỷ niệm cá nhân cho người yêu, idol, hoặc nhóm bạn. Lưu giữ những khoảnh khắc đáng nhớ với ảnh, timeline và nhạc nền.",
  keywords: ["kỷ niệm", "anniversary", "love", "memories", "couple", "idol", "fan page", "timeline", "gallery"],
  authors: [{ name: "Love Memories" }],
  creator: "Love Memories",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Love Memories",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "Love Memories",
    title: "Love Memories - Lưu giữ kỷ niệm yêu thương",
    description: "Tạo trang kỷ niệm cá nhân cho người yêu, idol, hoặc nhóm bạn.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Love Memories",
    description: "Tạo trang kỷ niệm cá nhân cho người yêu, idol, hoặc nhóm bạn.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ec4899" },
    { media: "(prefers-color-scheme: dark)", color: "#be185d" },
  ],
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-152x152.png" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body
        className={`${inter.variable} ${roboto.variable} ${poppins.variable} ${playfairDisplay.variable} ${dancingScript.variable} ${quicksand.variable} ${nunito.variable} ${pacifico.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LoadingProvider>
          <Suspense fallback={null}>
            <NavigationProgress />
          </Suspense>
          {children}
          <PWAInstallPrompt />
        </LoadingProvider>
      </body>
    </html>
  );
}

