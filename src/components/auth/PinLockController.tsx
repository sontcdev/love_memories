"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Delete, Loader2, Lock } from "lucide-react";
import type { Gallery, Letter, LetterReply, Link, LinkConfig, Timeline } from "@prisma/client";
import { verifyLinkPassword } from "@/app/actions/auth-actions";

type LetterWithReplies = Letter & { replies: LetterReply[] };

export type LockScreenLinkData = Link & {
    config: LinkConfig | null;
    galleries: Gallery[];
    timelines: Timeline[];
    letters: LetterWithReplies[];
};

export interface TemplateLockScreenProps {
    slug: string;
    onSuccess: () => void;
    linkData: LockScreenLinkData | null;
}

export interface PinLockControls {
    pin: string[];
    error: string | null;
    isLoading: boolean;
    enterDigit: (digit: string) => void;
    deleteDigit: () => void;
    clearPin: () => void;
    submitPin: () => void;
}

interface PinLockControllerProps {
    slug: string;
    onSuccess: () => void;
    errorMessage?: string;
    children: (controls: PinLockControls) => ReactNode;
}

interface PinKeypadProps {
    controls: PinLockControls;
    filledIcon: ReactNode;
    emptyIcon?: ReactNode;
    slotClass: string;
    activeSlotClass: string;
    keyClass: string;
    specialKeyClass: string;
    submitClass: string;
    submitLabel?: string;
    errorClass?: string;
}

export function PinLockController({ slug, onSuccess, errorMessage = "Mã PIN không đúng", children }: PinLockControllerProps) {
    const [pin, setPin] = useState(["", "", "", "", "", ""]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        sessionStorage.removeItem("welcome_shown");
    }, []);

    const submit = useCallback(async (pinValue?: string) => {
        const fullPin = pinValue || pin.join("");
        if (fullPin.length !== 6) {
            setError("Vui lòng nhập đủ 6 chữ số");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const result = await verifyLinkPassword(slug, fullPin);
            if (result.success) {
                onSuccess();
                return;
            }

            setError(result.error || errorMessage);
            setPin(["", "", "", "", "", ""]);
        } catch {
            setError("Không thể xác thực lúc này. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    }, [errorMessage, onSuccess, pin, slug]);

    const enterDigit = useCallback((digit: string) => {
        if (!/^\d$/.test(digit) || isLoading) return;

        setPin((current) => {
            const emptyIndex = current.findIndex((value) => value === "");
            if (emptyIndex === -1) return current;

            const next = [...current];
            next[emptyIndex] = digit;
            if (emptyIndex === 5) {
                window.setTimeout(() => submit(next.join("")), 50);
            }
            return next;
        });
        setError(null);
    }, [isLoading, submit]);

    const deleteDigit = useCallback(() => {
        if (isLoading) return;
        setPin((current) => {
            let lastIndex = -1;
            for (let index = current.length - 1; index >= 0; index -= 1) {
                if (current[index] !== "") {
                    lastIndex = index;
                    break;
                }
            }
            if (lastIndex < 0) return current;
            const next = [...current];
            next[lastIndex] = "";
            return next;
        });
        setError(null);
    }, [isLoading]);

    const clearPin = useCallback(() => {
        if (isLoading) return;
        setPin(["", "", "", "", "", ""]);
        setError(null);
    }, [isLoading]);

    const submitPin = useCallback(() => submit(), [submit]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (/^\d$/.test(event.key)) {
                event.preventDefault();
                enterDigit(event.key);
            } else if (event.key === "Backspace") {
                event.preventDefault();
                deleteDigit();
            } else if (event.key === "Delete" || event.key === "Escape") {
                event.preventDefault();
                clearPin();
            } else if (event.key === "Enter") {
                event.preventDefault();
                submitPin();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [clearPin, deleteDigit, enterDigit, submitPin]);

    return children({ pin, error, isLoading, enterDigit, deleteDigit, clearPin, submitPin });
}

export function PinKeypad({
    controls,
    filledIcon,
    emptyIcon = <span className="h-2 w-2 rounded-full bg-current opacity-25" />,
    slotClass,
    activeSlotClass,
    keyClass,
    specialKeyClass,
    submitClass,
    submitLabel = "Mở khóa",
    errorClass = "border-red-200 bg-red-50/95 text-red-600",
}: PinKeypadProps) {
    const { pin, error, isLoading, enterDigit, deleteDigit, clearPin, submitPin } = controls;

    return (
        <>
            {error && (
                <div className={`mb-5 rounded-xl border p-3 text-center text-sm font-medium animate-shake ${errorClass}`} role="alert">
                    {error}
                </div>
            )}

            <div className="mb-5 flex justify-center gap-2 sm:mb-6 sm:gap-3" aria-label="Mã PIN 6 số">
                {pin.map((digit, index) => (
                    <div
                        key={index}
                        className={`flex h-11 w-9 items-center justify-center rounded-xl border-2 transition-all sm:h-14 sm:w-12 sm:rounded-2xl ${digit ? activeSlotClass : slotClass}`}
                    >
                        {digit ? filledIcon : emptyIcon}
                    </div>
                ))}
            </div>

            <div className="mb-4 grid grid-cols-3 gap-2 sm:gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
                    <button key={number} type="button" onClick={() => enterDigit(String(number))} disabled={isLoading} className={`h-12 text-lg font-bold transition-all sm:h-14 sm:text-xl ${keyClass}`}>
                        {number}
                    </button>
                ))}
                <button type="button" onClick={clearPin} disabled={isLoading} className={`h-12 text-xs font-semibold transition-all sm:h-14 sm:text-sm ${specialKeyClass}`}>
                    Xóa
                </button>
                <button type="button" onClick={() => enterDigit("0")} disabled={isLoading} className={`h-12 text-lg font-bold transition-all sm:h-14 sm:text-xl ${keyClass}`}>
                    0
                </button>
                <button type="button" onClick={deleteDigit} disabled={isLoading} className={`flex h-12 items-center justify-center transition-all sm:h-14 ${specialKeyClass}`} aria-label="Xóa một số">
                    <Delete className="h-5 w-5" />
                </button>
            </div>

            <button
                type="button"
                onClick={submitPin}
                disabled={isLoading || pin.some((digit) => !digit)}
                className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 font-bold transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:scale-100 sm:py-4 ${submitClass}`}
            >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Lock className="h-5 w-5" />}
                {isLoading ? "Đang mở khóa..." : submitLabel}
            </button>
        </>
    );
}

export function useLockTheme(slug: string, defaultDark = false) {
    const [isDark, setIsDark] = useState(defaultDark);

    useEffect(() => {
        const savedTheme = localStorage.getItem(`theme_mode_${slug}`);
        if (savedTheme) setIsDark(savedTheme === "dark");
    }, [slug]);

    const toggleTheme = () => {
        const nextDark = !isDark;
        setIsDark(nextDark);
        localStorage.setItem(`theme_mode_${slug}`, nextDark ? "dark" : "light");
        window.dispatchEvent(new CustomEvent("theme-change", { detail: { isDark: nextDark } }));
    };

    return { isDark, toggleTheme };
}
