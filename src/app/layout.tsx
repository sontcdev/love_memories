import type { Metadata } from "next";
import localFont from "next/font/local";
import { Dancing_Script, Pacifico } from "next/font/google";
import { Suspense } from "react";
import { LoadingProvider, NavigationProgress } from "@/components/providers";
import "./globals.css";

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-dancing-script",
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${dancingScript.variable} ${pacifico.variable} antialiased`}
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

