"use client";

import { Sparkles, Gamepad2 } from "lucide-react";

// ============================================================================
// GAME STUB
// ----------------------------------------------------------------------------
// Placeholder shown when a game variant (B/C) is selected but not yet
// implemented. Gives users visual feedback that the feature is incoming.
// ============================================================================

interface GameStubProps {
    variantId: "B" | "C";
    label: string;
    description: string;
    isDark?: boolean;
}

export function GameStub({ variantId, label, description, isDark }: GameStubProps) {
    return (
        <div className={`relative rounded-2xl border-2 border-dashed p-8 text-center ${
            isDark
                ? "border-purple-500/30 bg-slate-900/40"
                : "border-purple-200 bg-purple-50/50"
        }`}>
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                isDark ? "bg-purple-900/40" : "bg-purple-100"
            }`}>
                <Gamepad2 className={`w-8 h-8 ${isDark ? "text-purple-300" : "text-purple-500"}`} />
            </div>

            <div className="flex items-center justify-center gap-2 mb-2">
                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md font-bold text-xs ${
                    isDark ? "bg-purple-900 text-purple-200" : "bg-purple-500 text-white"
                }`}>
                    {variantId}
                </span>
                <h3 className={`text-lg font-semibold ${isDark ? "text-purple-100" : "text-gray-800"}`}>
                    {label}
                </h3>
            </div>

            <p className={`text-sm mb-4 max-w-md mx-auto ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                {description}
            </p>

            <span className="inline-flex items-center gap-1 text-xs uppercase tracking-wide font-medium px-3 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                <Sparkles className="w-3 h-3" />
                Sắp ra mắt
            </span>

            <p className={`mt-4 text-xs italic ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                Trò chơi này đang được phát triển. Hãy quay lại sau nhé!
            </p>
        </div>
    );
}
