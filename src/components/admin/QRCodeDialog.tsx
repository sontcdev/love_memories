"use client";

import { useRef, useState } from "react";
import QRCode from "react-qr-code";
import { toPng } from "html-to-image";
import { Download, Loader2, QrCode, Check } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Preset colors for QR code
const COLOR_PRESETS = [
    { name: "Đen", value: "#000000" },
    { name: "Tím", value: "#7c3aed" },
    { name: "Hồng", value: "#ec4899" },
    { name: "Xanh dương", value: "#3b82f6" },
    { name: "Xanh lá", value: "#10b981" },
    { name: "Đỏ", value: "#ef4444" },
];

interface QRCodeDialogProps {
    slug: string;
    username?: string;
    isOpen: boolean;
    onClose: () => void;
}

export function QRCodeDialog({ slug, username, isOpen, onClose }: QRCodeDialogProps) {
    const qrRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [qrColor, setQrColor] = useState("#000000");
    const [transparentBg, setTransparentBg] = useState(false);

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
                backgroundColor: transparentBg ? undefined : "#ffffff",
                quality: 1,
                pixelRatio: 3, // Higher resolution
            });

            // Create download link
            const link = document.createElement("a");
            link.download = `qr-${slug}${transparentBg ? "-transparent" : ""}.png`;
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

                <div className="flex flex-col items-center py-4">
                    {/* QR Code Container */}
                    <div
                        ref={qrRef}
                        className={`p-6 rounded-2xl shadow-lg ${transparentBg ? "bg-transparent" : "bg-white"}`}
                        style={{
                            backgroundImage: transparentBg
                                ? "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)"
                                : undefined,
                            backgroundSize: "20px 20px",
                            backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
                        }}
                    >
                        <QRCode
                            value={fullUrl}
                            size={180}
                            level="H"
                            fgColor={qrColor}
                            bgColor={transparentBg ? "transparent" : "#ffffff"}
                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                        />
                    </div>

                    {/* Color Picker */}
                    <div className="mt-4 w-full">
                        <Label className="text-sm text-slate-300 mb-2 block">Màu QR Code</Label>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {COLOR_PRESETS.map((color) => (
                                <button
                                    key={color.value}
                                    onClick={() => setQrColor(color.value)}
                                    className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center ${qrColor === color.value
                                            ? "border-white scale-110"
                                            : "border-transparent hover:border-slate-500"
                                        }`}
                                    style={{ backgroundColor: color.value }}
                                    title={color.name}
                                >
                                    {qrColor === color.value && (
                                        <Check className="w-4 h-4 text-white drop-shadow-lg" />
                                    )}
                                </button>
                            ))}
                            {/* Custom color input */}
                            <div className="relative">
                                <input
                                    type="color"
                                    value={qrColor}
                                    onChange={(e) => setQrColor(e.target.value)}
                                    className="w-8 h-8 rounded-full cursor-pointer border-2 border-slate-500 hover:border-white transition-all"
                                    title="Màu tùy chỉnh"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Transparent Background Toggle */}
                    <div className="mt-4 w-full flex items-center justify-between bg-slate-700/50 rounded-lg p-3">
                        <Label htmlFor="transparent-bg" className="text-sm text-slate-300 cursor-pointer">
                            Nền trong suốt
                        </Label>
                        <Switch
                            id="transparent-bg"
                            checked={transparentBg}
                            onCheckedChange={setTransparentBg}
                        />
                    </div>

                    {/* URL Display */}
                    <div className="mt-4 w-full">
                        <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                            <p className="text-slate-400 text-xs mb-1">{username || slug}</p>
                            <p className="text-violet-400 font-mono text-sm break-all">{fullUrl}</p>
                        </div>
                    </div>

                    {/* Download Button */}
                    <Button
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className="mt-4 w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                    >
                        {isDownloading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Đang tạo...
                            </>
                        ) : (
                            <>
                                <Download className="w-4 h-4 mr-2" />
                                Tải PNG {transparentBg && "(trong suốt)"}
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
