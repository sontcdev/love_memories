"use client";

import type { UseFormRegisterReturn } from "react-hook-form";

interface SloganFieldProps {
    registerProps: UseFormRegisterReturn;
    error?: string;
    label?: string;
    placeholder?: string;
    focusRingClassName?: string;
}

export function SloganField({
    registerProps,
    error,
    label = "Slogan",
    placeholder = "Một câu ngắn gọn nói lên tinh thần trang này",
    focusRingClassName = "focus:ring-rose-300 focus:border-rose-400",
}: SloganFieldProps) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
                {...registerProps}
                className={`w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 outline-none transition-all ${focusRingClassName}`}
                placeholder={placeholder}
            />
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>
    );
}
