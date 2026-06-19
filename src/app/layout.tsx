import type { Metadata } from "next";
import localFont from "next/font/local";
import { Suspense } from "react";
import { LoadingProvider, NavigationProgress } from "@/components/providers";
import { PWAInstallPrompt } from "@/components/pwa/PWAInstallPrompt";
import "./globals.css";

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
  maximumScale: 1,
  userScalable: false,
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
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-152x152.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Comfortaa:wght@400;700&family=Dancing+Script:wght@400;700&family=Inter:wght@400;500;700&family=Montserrat:wght@400;500;700&family=Nunito:wght@400;700&family=Pacifico&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Poppins:wght@400;500;600;700&family=Quicksand:wght@400;500;700&family=Roboto:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var p=window.location.pathname,m=p.match(/^\/([^\/]+)(?:\/|$)/);if(m){var s=m[1];if(s!=='admin'&&s!=='offline'&&s!=='_not-found'){var t=localStorage.getItem('theme_mode_'+s);if(t==='dark'){document.documentElement.classList.add('dark')}}}}catch(e){}})()` }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden`}
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

