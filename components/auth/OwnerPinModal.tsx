'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock } from 'lucide-react';

interface OwnerPinModalProps {
    username: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (linkId: string) => void;
}

export default function OwnerPinModal({ username, isOpen, onClose, onSuccess }: OwnerPinModalProps) {
    const [pin, setPin] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handlePinChange = (index: number, value: string) => {
        // Only allow digits
        if (value && !/^\d$/.test(value)) return;

        const newPin = [...pin];
        newPin[index] = value;
        setPin(newPin);
        setError('');

        // Auto-focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`pin-${index + 1}`);
            nextInput?.focus();
        }

        // Auto-submit when all 6 digits are entered
        if (index === 5 && value) {
            const fullPin = newPin.join('');
            if (fullPin.length === 6) {
                handleSubmit(fullPin);
            }
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !pin[index] && index > 0) {
            const prevInput = document.getElementById(`pin-${index - 1}`);
            prevInput?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);

        if (!/^\d+$/.test(pastedData)) return;

        const newPin = [...pin];
        pastedData.split('').forEach((digit, index) => {
            if (index < 6) newPin[index] = digit;
        });
        setPin(newPin);

        // Focus last filled input
        const lastIndex = Math.min(pastedData.length - 1, 5);
        document.getElementById(`pin-${lastIndex}`)?.focus();

        // Auto-submit if 6 digits
        if (pastedData.length === 6) {
            handleSubmit(pastedData);
        }
    };

    const handleSubmit = async (fullPin: string) => {
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('/api/auth/verify-pin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, pin: fullPin }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Mã PIN không đúng');
                setPin(['', '', '', '', '', '']);
                document.getElementById('pin-0')?.focus();
                setIsLoading(false);
                return;
            }

            onSuccess(data.linkId);
            handleClose();

        } catch (err) {
            console.error('PIN verification error:', err);
            setError('Có lỗi xảy ra, vui lòng thử lại');
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setPin(['', '', '', '', '', '']);
        setError('');
        setIsLoading(false);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden pointer-events-auto">
                            {/* Header */}
                            <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
                                <button
                                    onClick={handleClose}
                                    className="absolute right-4 top-4 p-2 hover:bg-white/20 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-white/20 rounded-xl">
                                        <Lock className="w-6 h-6" />
                                    </div>
                                    <div>
                                        {/* <h2 className="text-xl font-bold">Chế độ Chỉnh sửa</h2> */}
                                        <p className="text-sm text-white/80">Nhập mã PIN 6 chữ số</p>
                                    </div>
                                </div>
                            </div>

                            {/* PIN Input */}
                            <div className="p-8">
                                <div className="flex justify-center gap-3 mb-6">
                                    {pin.map((digit, index) => (
                                        <input
                                            key={index}
                                            id={`pin-${index}`}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handlePinChange(index, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(index, e)}
                                            onPaste={index === 0 ? handlePaste : undefined}
                                            disabled={isLoading}
                                            className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            autoFocus={index === 0}
                                        />
                                    ))}
                                </div>

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center"
                                    >
                                        {error}
                                    </motion.div>
                                )}

                                {isLoading && (
                                    <div className="flex items-center justify-center gap-2 text-purple-600">
                                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        <span className="text-sm font-medium">Đang xác thực...</span>
                                    </div>
                                )}

                                <p className="text-center text-sm text-gray-500 mt-6">
                                    Mã PIN dành riêng cho chủ sở hữu
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
