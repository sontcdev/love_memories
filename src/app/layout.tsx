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
  Pacifico,
  Montserrat,
  Comfortaa,
  Caveat
} from "next/font/google";
import { Suspense } from "react";
import { LoadingProvider, NavigationProgress } from "@/components/providers";
import { ToastProvider } from "@/components/ui/toast";
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
  subsets: ["latin", "vietnamese"],
  variable: "--font-pacifico",
  display: "swap",
});
const montserrat = Montserrat({
  subsets: ["latin", "vietnamese"],
  variable: "--font-montserrat",
  display: "swap",
});
const comfortaa = Comfortaa({
  subsets: ["latin", "vietnamese"],
  variable: "--font-comfortaa",
  display: "swap",
});
const caveat = Caveat({
  subsets: ["latin", "latin-ext"],
  variable: "--font-caveat",
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
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var p=window.location.pathname,m=p.match(/^\/([^\/]+)(?:\/|$)/);if(m){var s=m[1];if(s!=='admin'&&s!=='offline'&&s!=='_not-found'){var t=localStorage.getItem('theme_mode_'+s);if(t==='dark'){document.documentElement.classList.add('dark')}}}}catch(e){}})()` }} />
      </head>
      <body
        className={`${inter.variable} ${roboto.variable} ${poppins.variable} ${playfairDisplay.variable} ${dancingScript.variable} ${quicksand.variable} ${nunito.variable} ${pacifico.variable} ${montserrat.variable} ${comfortaa.variable} ${caveat.variable} ${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden`}
      >
        <LoadingProvider>
          <ToastProvider>
            <Suspense fallback={null}>
              <NavigationProgress />
            </Suspense>
            {children}
            <PWAInstallPrompt />
          </ToastProvider>
        </LoadingProvider>
      </body>
    </html>
  );
}

