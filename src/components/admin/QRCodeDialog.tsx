"use client";

import { useRef, useState } from "react";
import QRCode from "react-qr-code";
import { toPng } from "html-to-image";
import { Download, Loader2, QrCode } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface QRCodeDialogProps {
    slug: string;
    username?: string;
    isOpen: boolean;
    onClose: () => void;
}

export function QRCodeDialog({ slug, username, isOpen, onClose }: QRCodeDialogProps) {
    const qrRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    // Generate the full URL
    const fullUrl = typeof window !== "undefined"
        ? `${window.location.origin}/${slug}`
        : `https://your-domain.com/${slug}`;

    const handleDownload = async () => {
        if (!qrRef.current) return;

        setIsDownloading(true);
        try {
            const dataUrl = await toPng(qrRef.current, {
                cacheBust: true,
                backgroundColor: "#ffffff",
                quality: 1,
                pixelRatio: 3, // Higher resolution
            });

            // Create download link
            const link = document.createElement("a");
            link.download = `qr-${slug}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error("Failed to download QR code:", err);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-sm">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <QrCode className="w-5 h-5 text-violet-400" />
                        QR Code
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col items-center py-6">
                    {/* QR Code Container */}
                    <div
                        ref={qrRef}
                        className="bg-white p-6 rounded-2xl shadow-lg"
                    >
                        <QRCode
                            value={fullUrl}
                            size={200}
                            level="H" // High error correction
                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                        />
                        {/* Label inside QR container for download */}
                        <div className="mt-3 text-center">
                            <p className="text-gray-800 font-medium text-sm">{username || slug}</p>
                            <p className="text-gray-400 text-xs">/{slug}</p>
                        </div>
                    </div>

                    {/* URL Display */}
                    <div className="mt-6 w-full">
                        <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                            <p className="text-violet-400 font-mono text-sm break-all">{fullUrl}</p>
                        </div>
                    </div>

                    {/* Download Button */}
                    <Button
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className="mt-6 w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                    >
                        {isDownloading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Download className="w-4 h-4 mr-2" />
                                Download PNG
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
