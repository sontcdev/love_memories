"use client";

import { useState, useEffect } from "react";
import { X, Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        // Check if user has already dismissed the prompt
        const dismissed = localStorage.getItem("pwa-install-dismissed");
        if (dismissed) return;

        const handler = (e: Event) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Save the event for later use
            setDeferredPrompt(e as BeforeInstallPromptEvent);

            // Show prompt after user has engaged with content (after 5 seconds)
            setTimeout(() => {
                setShowPrompt(true);
            }, 5000);
        };

        window.addEventListener("beforeinstallprompt", handler);

        return () => {
            window.removeEventListener("beforeinstallprompt", handler);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        // Show the install prompt
        await deferredPrompt.prompt();

        // Wait for the user's response
        const { outcome } = await deferredPrompt.userChoice;

        // Clear the deferredPrompt
        setDeferredPrompt(null);
        setShowPrompt(false);

        if (outcome === "accepted") {
            console.log("User accepted the install prompt");
        }
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem("pwa-install-dismissed", "true");
    };

    if (!showPrompt) return null;

    return (
        <div className="fixed bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom-4 duration-500 md:left-auto md:right-4 md:w-96">
            <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 p-[2px] rounded-2xl shadow-2xl">
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 relative">
                    <button
                        onClick={handleDismiss}
                        className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 transition-colors tap-target"
                        aria-label="Đóng"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-rose-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                            <Download className="w-7 h-7 text-white" />
                        </div>

                        <div className="flex-1 min-w-0 pt-1">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-1 text-lg">
                                Cài đặt Love Memories
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                                Cài đặt ứng dụng để sử dụng ngoại tuyến và truy cập nhanh hơn!
                            </p>

                            <div className="flex gap-2">
                                <button
                                    onClick={handleInstall}
                                    className="flex-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all tap-target"
                                >
                                    Cài đặt ngay
                                </button>
                                <button
                                    onClick={handleDismiss}
                                    className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors tap-target"
                                >
                                    Để sau
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                        <div className="flex gap-1">
                            <span className="px-2 py-1 bg-rose-50 text-rose-600 rounded">📱 Offline</span>
                            <span className="px-2 py-1 bg-pink-50 text-pink-600 rounded">⚡ Nhanh</span>
                            <span className="px-2 py-1 bg-purple-50 text-purple-600 rounded">🔔 Thông báo</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
