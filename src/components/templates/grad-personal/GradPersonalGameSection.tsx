"use client";

import { useState } from "react";
import { GraduationCap, Trophy, Award, Star, BookOpen, Users, Target, Sparkles } from "lucide-react";

interface GradPersonalGameSectionProps {
    isDark?: boolean;
}

interface Badge {
    id: string;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    unlocked: boolean;
    requirement: string;
}

export function GradPersonalGameSection({ isDark = false }: GradPersonalGameSectionProps) {
    const [badges, setBadges] = useState<Badge[]>([
        {
            id: "graduate",
            title: "Graduate",
            description: "Completed the journey",
            icon: GraduationCap,
            unlocked: true,
            requirement: "Auto-unlocked",
        },
        {
            id: "scholar",
            title: "Top Scholar",
            description: "Academic excellence",
            icon: BookOpen,
            unlocked: false,
            requirement: "Tap to unlock",
        },
        {
            id: "leader",
            title: "Natural Leader",
            description: "Inspired others",
            icon: Users,
            unlocked: false,
            requirement: "Tap to unlock",
        },
        {
            id: "achiever",
            title: "Goal Crusher",
            description: "Achieved all targets",
            icon: Target,
            unlocked: false,
            requirement: "Tap to unlock",
        },
        {
            id: "star",
            title: "Rising Star",
            description: "Bright future ahead",
            icon: Star,
            unlocked: false,
            requirement: "Tap to unlock",
        },
        {
            id: "champion",
            title: "Champion",
            description: "Overcame all challenges",
            icon: Trophy,
            unlocked: false,
            requirement: "Tap to unlock",
        },
    ]);

    const [showCelebration, setShowCelebration] = useState(false);

    const handleBadgeClick = (badgeId: string) => {
        setBadges(prev => prev.map(badge => 
            badge.id === badgeId && !badge.unlocked 
                ? { ...badge, unlocked: true }
                : badge
        ));

        const allUnlocked = badges.filter(b => b.id !== badgeId).every(b => b.unlocked || b.id === badgeId);
        if (allUnlocked) {
            setShowCelebration(true);
        }
    };

    const unlockedCount = badges.filter(b => b.unlocked).length;
    const allUnlocked = unlockedCount === badges.length;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <div className="absolute inset-0 bg-emerald-500 rounded-full blur-lg opacity-40 animate-pulse"></div>
                        <div className="relative w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                            <Award className="w-5 h-5 text-white" />
                        </div>
                    </div>
                    <div>
                        <h2 className={`text-xl font-bold ${isDark ? "text-slate-100" : "text-gray-800"}`}>
                            Achievement Badges
                        </h2>
                        <span className={`text-sm ${isDark ? "text-slate-400" : "text-gray-400"}`}>
                            {unlockedCount}/{badges.length} unlocked
                        </span>
                    </div>
                </div>
            </div>

            {allUnlocked && showCelebration && (
                <div className={`relative text-center p-8 rounded-2xl ${isDark ? "bg-gradient-to-br from-emerald-900/50 to-teal-900/50 border border-emerald-700" : "bg-gradient-to-br from-emerald-100 to-teal-100 border-4 border-emerald-200"}`}>
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        {Array.from({ length: 30 }).map((_, i) => (
                            <div
                                key={i}
                                className="absolute animate-bounce"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                    animationDelay: `${Math.random() * 2}s`,
                                    animationDuration: `${1 + Math.random() * 2}s`,
                                }}
                            >
                                <Sparkles className="w-6 h-6 text-emerald-500" />
                            </div>
                        ))}
                    </div>
                    <div className="relative inline-block">
                        <div className="absolute inset-0 bg-yellow-400 blur-2xl opacity-60 animate-pulse rounded-full"></div>
                        <Trophy className="relative w-20 h-20 mx-auto mb-4 text-yellow-500 animate-bounce" />
                    </div>
                    <h3 className={`text-3xl font-bold mb-2 ${isDark ? "text-emerald-100" : "text-emerald-800"}`}>
                        All Badges Unlocked! 🎓
                    </h3>
                    <p className={`text-lg ${isDark ? "text-emerald-200" : "text-emerald-700"}`}>
                        Congratulations, Graduate!
                    </p>
                </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {badges.map((badge) => {
                    const Icon = badge.icon;
                    return (
                        <button
                            key={badge.id}
                            onClick={() => handleBadgeClick(badge.id)}
                            disabled={badge.unlocked}
                            className={`relative p-6 rounded-2xl transition-all duration-300 ${
                                badge.unlocked
                                    ? isDark
                                        ? "bg-gradient-to-br from-emerald-800 to-teal-800 border-2 border-emerald-500 shadow-lg shadow-emerald-500/30"
                                        : "bg-gradient-to-br from-emerald-100 to-teal-100 border-4 border-emerald-400 shadow-lg shadow-emerald-400/20"
                                    : isDark
                                    ? "bg-slate-800 border-2 border-slate-700 hover:border-emerald-500/50 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/20"
                                    : "bg-gray-100 border-2 border-gray-200 hover:border-emerald-300 hover:scale-105 hover:shadow-lg"
                            }`}
                        >
                            <div className={`relative w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${
                                badge.unlocked
                                    ? "bg-gradient-to-br from-emerald-500 to-teal-600 border-4 border-white shadow-lg"
                                    : isDark
                                    ? "bg-slate-700 border-2 border-slate-600"
                                    : "bg-gray-200 border-2 border-gray-300"
                            }`}>
                                {badge.unlocked && (
                                    <div className="absolute inset-0 bg-emerald-400 rounded-full blur-lg opacity-40 animate-pulse"></div>
                                )}
                                <Icon className={`relative w-8 h-8 ${badge.unlocked ? "text-white" : isDark ? "text-slate-500" : "text-gray-400"}`} />
                            </div>
                            <h3 className={`font-bold text-center mb-1 ${
                                badge.unlocked
                                    ? isDark ? "text-emerald-100" : "text-emerald-800"
                                    : isDark ? "text-slate-400" : "text-gray-500"
                            }`}>
                                {badge.title}
                            </h3>
                            <p className={`text-xs text-center ${
                                badge.unlocked
                                    ? isDark ? "text-emerald-200" : "text-emerald-600"
                                    : isDark ? "text-slate-500" : "text-gray-400"
                            }`}>
                                {badge.description}
                            </p>
                            {badge.unlocked && (
                                <div className="absolute top-2 right-2">
                                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg animate-bounce">
                                        <span className="text-white text-xs font-bold">✓</span>
                                    </div>
                                </div>
                            )}
                            {!badge.unlocked && (
                                <div className={`mt-2 text-xs text-center ${isDark ? "text-slate-500" : "text-gray-400"}`}>
                                    {badge.requirement}
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            <div className={`text-center p-4 rounded-xl ${isDark ? "bg-slate-800" : "bg-emerald-50"}`}>
                <p className={`text-sm ${isDark ? "text-slate-300" : "text-emerald-700"}`}>
                    {unlockedCount === badges.length
                        ? "🎉 You've unlocked all achievements!"
                        : `Tap on locked badges to unlock them! ${badges.length - unlockedCount} remaining.`}
                </p>
            </div>
        </div>
    );
}
