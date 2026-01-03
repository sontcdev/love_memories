"use client";

import { Loader2, AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
    isOpen: boolean;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "warning" | "info";
    isLoading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

const variantStyles = {
    danger: {
        icon: "text-red-500",
        button: "bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600",
        bg: "bg-red-50",
    },
    warning: {
        icon: "text-amber-500",
        button: "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600",
        bg: "bg-amber-50",
    },
    info: {
        icon: "text-blue-500",
        button: "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600",
        bg: "bg-blue-50",
    },
};

export function ConfirmDialog({
    isOpen,
    title = "Xác nhận",
    message,
    confirmText = "Xác nhận",
    cancelText = "Hủy",
    variant = "danger",
    isLoading = false,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    if (!isOpen) return null;

    const styles = variantStyles[variant];

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className={`${styles.bg} p-4 border-b border-gray-100`}>
                    <h3 className="text-lg font-semibold text-gray-800 text-center">{title}</h3>
                </div>

                {/* Body */}
                <div className="p-6 text-center">
                    <div className={`w-14 h-14 mx-auto mb-4 rounded-full ${styles.bg} flex items-center justify-center`}>
                        <AlertTriangle className={`w-7 h-7 ${styles.icon}`} />
                    </div>
                    <p className="text-gray-600 leading-relaxed">{message}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 p-4 pt-0">
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`flex-1 py-2.5 px-4 rounded-xl text-white font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${styles.button}`}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Đang xử lý...
                            </>
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
