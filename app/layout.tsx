import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
    subsets: ["latin", "vietnamese"],
    display: "swap",
});

export const metadata: Metadata = {
    title: "Kỷ Niệm Số - Digital Memories",
    description: "Nền tảng lưu giữ kỷ niệm số cho các cặp đôi",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="vi">
            <head>
                {/* PWA Meta Tags */}
                <link rel="manifest" href="/manifest.json" />
                <meta name="theme-color" content="#9333ea" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                <meta name="apple-mobile-web-app-title" content="Kỷ Niệm Số" />

                {/* Apple Touch Icons */}
                <link rel="apple-touch-icon" href="/icons/icon-152x152.png" />
                <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
                <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />
                <link rel="apple-touch-icon" sizes="167x167" href="/icons/icon-192x192.png" />

                {/* Favicons */}
                <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-72x72.png" />
                <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-72x72.png" />
            </head>
            <body className={inter.className}>
                {children}
            </body>
        </html>
    );
}
