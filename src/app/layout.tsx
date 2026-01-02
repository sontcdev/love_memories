import type { Metadata } from "next";
import localFont from "next/font/local";
import { Suspense } from "react";
import { LoadingProvider, NavigationProgress } from "@/components/providers";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&family=Pacifico&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LoadingProvider>
          <Suspense fallback={null}>
            <NavigationProgress />
          </Suspense>
          {children}
        </LoadingProvider>
      </body>
    </html>
  );
}

