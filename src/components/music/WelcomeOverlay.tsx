"use client";

import { useState, useEffect } from "react";
import { Heart, Sparkles } from "lucide-react";

interface WelcomeOverlayProps {
    title?: string;
    subtitle?: string;
    buttonText?: string;
    onOpen: () => void;
    theme?: "love" | "every" | "idol";
}

const SESSION_KEY = "welcome_shown";

export function WelcomeOverlay({
    title = "Welcome",
    subtitle = "A special place for memories",
    buttonText = "Enter",
    onOpen,
    theme = "love",
}: WelcomeOverlayProps) {
    const [isVisible, setIsVisible] = useState(true);
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);

    // Check session storage on mount
    useEffect(() => {
        const hasShown = sessionStorage.getItem(SESSION_KEY);
        if (hasShown === "true") {
            setIsVisible(false);
            // Auto-trigger music for returning visitors
            onOpen();
        }
    }, [onOpen]);

    const handleOpen = () => {
        setIsAnimatingOut(true);
        sessionStorage.setItem(SESSION_KEY, "true");

        // Wait for animation then hide and trigger music
        setTimeout(() => {
            setIsVisible(false);
            onOpen();
        }, 500);
    };

    if (!isVisible) return null;

    const themeStyles = {
        love: {
            gradient: "from-rose-400 via-pink-500 to-purple-500",
            bgGradient: "from-rose-100 via-pink-100 to-purple-100",
            buttonGradient: "from-rose-400 to-pink-500",
            particles: "from-rose-300 to-pink-400",
        },
        every: {
            gradient: "from-blue-400 via-indigo-500 to-purple-500",
            bgGradient: "from-blue-100 via-indigo-100 to-purple-100",
            buttonGradient: "from-blue-400 to-indigo-500",
            particles: "from-blue-300 to-indigo-400",
        },
        idol: {
            gradient: "from-yellow-400 via-amber-500 to-orange-500",
            bgGradient: "from-yellow-100 via-amber-100 to-orange-100",
            buttonGradient: "from-amber-400 to-orange-500",
            particles: "from-yellow-300 to-amber-400",
        },
    };

    const styles = themeStyles[theme];

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br ${styles.bgGradient} transition-opacity duration-500 ${isAnimatingOut ? "opacity-0" : "opacity-100"
                }`}
        >
            {/* Floating Particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(12)].map((_, i) => (
                    <div
                        key={i}
                        className={`absolute w-3 h-3 rounded-full bg-gradient-to-br ${styles.particles} animate-float opacity-30`}
                        style={{
                            left: `${5 + i * 8}%`,
                            top: `${10 + (i % 5) * 18}%`,
                            animationDelay: `${i * 0.4}s`,
                            animationDuration: `${3 + (i % 3)}s`,
                        }}
                    />
                ))}
            </div>

            {/* Content */}
            <div className="relative text-center px-6">
                {/* Icon */}
                <div className="mb-8 flex justify-center">
                    <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${styles.gradient} p-1 shadow-2xl animate-pulse`}>
                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                            {theme === "love" ? (
                                <Heart className="w-10 h-10 text-rose-400 fill-rose-400" />
                            ) : (
                                <Sparkles className="w-10 h-10 text-amber-400" />
                            )}
                        </div>
                    </div>
                </div>

                {/* Title */}
                <h1 className={`text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r ${styles.gradient} bg-clip-text text-transparent`}>
                    {title}
                </h1>

                {/* Subtitle */}
                <p className="text-gray-500 text-lg mb-10 max-w-md mx-auto">
                    {subtitle}
                </p>

                {/* Enter Button */}
                <button
                    onClick={handleOpen}
                    className={`group relative px-10 py-4 rounded-full bg-gradient-to-r ${styles.buttonGradient} text-white font-semibold text-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105 active:scale-95`}
                >
                    <span className="relative z-10 flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        {buttonText}
                    </span>
                    {/* Glow effect */}
                    <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${styles.buttonGradient} blur-xl opacity-50 group-hover:opacity-70 transition-opacity -z-10`} />
                </button>

                {/* Hint */}
                <p className="mt-6 text-sm text-gray-400">
                    🎵 Music will play after entry
                </p>
            </div>

            {/* Float Animation */}
            <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
        </div>
    );
}
