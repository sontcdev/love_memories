"use client";

import { useState, useRef, useEffect } from "react";
import { verifyLinkPassword } from "@/app/actions/auth-actions";
import { Lock, Heart, Delete, Loader2 } from "lucide-react";

interface LockScreenProps {
    slug: string;
    onSuccess: () => void;
}

export function LockScreen({ slug, onSuccess }: LockScreenProps) {
    const [pin, setPin] = useState<string[]>(["", "", "", "", "", ""]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        // Focus first input on mount
        inputRefs.current[0]?.focus();
    }, []);

    const handleInputChange = (index: number, value: string) => {
        // Only allow digits
        if (value && !/^\d$/.test(value)) return;

        const newPin = [...pin];
        newPin[index] = value;
        setPin(newPin);
        setError(null);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all digits entered
        if (value && index === 5) {
            const fullPin = newPin.join("");
            if (fullPin.length === 6) {
                handleSubmit(fullPin);
            }
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !pin[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleNumberPad = (num: string) => {
        const emptyIndex = pin.findIndex((p) => p === "");
        if (emptyIndex !== -1) {
            handleInputChange(emptyIndex, num);
        }
    };

    const handleDelete = () => {
        const lastFilledIndex = pin.map((p, i) => (p ? i : -1)).filter((i) => i !== -1).pop();
        if (lastFilledIndex !== undefined && lastFilledIndex >= 0) {
            const newPin = [...pin];
            newPin[lastFilledIndex] = "";
            setPin(newPin);
            inputRefs.current[lastFilledIndex]?.focus();
        }
    };

    const handleClear = () => {
        setPin(["", "", "", "", "", ""]);
        setError(null);
        inputRefs.current[0]?.focus();
    };

    const handleSubmit = async (pinValue?: string) => {
        const fullPin = pinValue || pin.join("");
        if (fullPin.length !== 6) {
            setError("Vui lòng nhập đủ 6 chữ số");
            return;
        }

        setIsLoading(true);
        setError(null);

        const result = await verifyLinkPassword(slug, fullPin);

        if (result.success) {
            onSuccess();
        } else {
            setError(result.error || "Mã PIN không đúng");
            setPin(["", "", "", "", "", ""]);
            inputRefs.current[0]?.focus();
        }

        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--theme-bg, #fdf2f8)' }}>
            <div className="w-full max-w-sm">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 mb-4 shadow-lg shadow-rose-300/50">
                        <Heart className="w-10 h-10 text-white fill-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Kỷ Niệm Riêng Tư</h1>
                    <p className="text-gray-500 text-sm">Mật mã kỷ niệm của chúng mình là gì nhỉ?</p>
                </div>

                {/* PIN Card */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/50">
                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-6 text-red-600 text-sm text-center">
                            {error}
                        </div>
                    )}

                    {/* PIN Input Display */}
                    <div className="flex justify-center gap-3 mb-6">
                        {pin.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => { inputRefs.current[index] = el; }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleInputChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                disabled={isLoading}
                                className="w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-200 outline-none transition-all bg-gray-50 disabled:opacity-50"
                            />
                        ))}
                    </div>

                    {/* Number Pad */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                            <button
                                key={num}
                                onClick={() => handleNumberPad(num.toString())}
                                disabled={isLoading}
                                className="h-14 rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-95 text-xl font-semibold text-gray-700 transition-all disabled:opacity-50"
                            >
                                {num}
                            </button>
                        ))}
                        <button
                            onClick={handleClear}
                            disabled={isLoading}
                            className="h-14 rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-95 text-sm font-medium text-gray-500 transition-all disabled:opacity-50"
                        >
                            Xóa
                        </button>
                        <button
                            onClick={() => handleNumberPad("0")}
                            disabled={isLoading}
                            className="h-14 rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-95 text-xl font-semibold text-gray-700 transition-all disabled:opacity-50"
                        >
                            0
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={isLoading}
                            className="h-14 rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-500 transition-all disabled:opacity-50 flex items-center justify-center"
                        >
                            <Delete className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={() => handleSubmit()}
                        disabled={isLoading || pin.some((p) => !p)}
                        className="w-full py-4 rounded-xl text-white font-semibold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:brightness-110"
                        style={{ backgroundColor: 'var(--theme-accent, #ec4899)' }}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Đang mở khóa...
                            </>
                        ) : (
                            <>
                                <Lock className="w-5 h-5" />
                                Mở khóa
                            </>
                        )}
                    </button>
                </div>

                {/* Footer */}
                <p className="text-center text-gray-400 text-xs mt-6">
                    Kỷ niệm của bạn được bảo vệ 💕
                </p>
            </div>
        </div>
    );
}
