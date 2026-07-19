"use client";

import { Gamepad2, Check, Sparkles } from "lucide-react";
import { LinkType } from "@prisma/client";
import { getGameVariants, type GameVariantId } from "@/components/templates/game-registry";

// ============================================================================
// GAME TEMPLATE SELECTOR
// ----------------------------------------------------------------------------
// Reusable card-style picker for choosing one of 3 game variants per template.
// Used inside EditConfigForm / EditIdolConfigForm.
// ============================================================================

interface GameTemplateSelectorProps {
    linkType: LinkType;
    value: GameVariantId;
    onChange: (value: GameVariantId) => void;
    isDark?: boolean;
}

export function GameTemplateSelector({ linkType, value, onChange, isDark }: GameTemplateSelectorProps) {
    const variants = getGameVariants(linkType);

    return (
        <div>
            <div className="flex items-center gap-2 mb-4">
                <Gamepad2 className="w-5 h-5 text-purple-500" />
                <h3 className="text-lg font-semibold text-gray-800">Trò chơi</h3>
            </div>
            <p className={`text-sm mb-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                Chọn kiểu trò chơi hiển thị trên trang của bạn
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {variants.map((variant) => {
                    const isSelected = value === variant.id;
                    const isComingSoon = variant.status === "coming-soon";
                    return (
                        <button
                            key={variant.id}
                            type="button"
                            onClick={() => onChange(variant.id)}
                            className={`relative text-left p-4 rounded-xl border-2 transition-all ${
                                isSelected
                                    ? "border-purple-500 ring-2 ring-purple-200 bg-purple-50"
                                    : isComingSoon
                                        ? "border-amber-200 bg-amber-50/50 hover:border-amber-300"
                                        : "border-gray-200 hover:border-purple-300 hover:bg-purple-50/50"
                            } ${isDark ? "bg-gray-800 border-gray-700" : ""}`}
                        >
                            {/* Variant badge letter */}
                            <div className="flex items-center justify-between mb-2">
                                <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg font-bold text-sm ${
                                    isSelected
                                        ? "bg-purple-500 text-white"
                                        : isDark
                                            ? "bg-gray-700 text-gray-300"
                                            : "bg-gray-100 text-gray-500"
                                }`}>
                                    {variant.id}
                                </span>
                                {isSelected && (
                                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-purple-500 text-white">
                                        <Check className="w-3 h-3" />
                                    </span>
                                )}
                            </div>

                            <p className={`font-semibold text-sm mb-1 ${
                                isSelected ? "text-purple-900" : isDark ? "text-gray-200" : "text-gray-800"
                            }`}>
                                {variant.label}
                            </p>
                            <p className={`text-xs leading-relaxed ${
                                isDark ? "text-gray-400" : "text-gray-500"
                            }`}>
                                {variant.description}
                            </p>

                            {isComingSoon && (
                                <span className="inline-flex items-center gap-1 mt-2 text-[10px] uppercase tracking-wide font-medium px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                                    <Sparkles className="w-2.5 h-2.5" />
                                    Sắp có
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
