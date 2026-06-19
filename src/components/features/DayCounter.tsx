"use client";

import { useState, useEffect, useMemo, memo } from "react";
import { Heart } from "lucide-react";
import { formatDate, getDateParts } from "@/lib/date-utils";

interface DayCounterProps {
    startDate: Date | string;
    showSeconds?: boolean;
    theme?: "love" | "every" | "idol";
}

interface TimeElapsed {
    years: number;
    months: number;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    totalDays: number;
}

export function DayCounter({ startDate, showSeconds = false, theme = "love" }: DayCounterProps) {
    const [timeElapsed, setTimeElapsed] = useState<TimeElapsed | null>(null);

    const start = useMemo(() => {
        return typeof startDate === "string" ? new Date(startDate) : startDate;
    }, [startDate]);

    useEffect(() => {
        const calculateTime = () => {
            const now = new Date();
            const diffMs = now.getTime() - start.getTime();

            if (diffMs < 0) {
                setTimeElapsed(null);
                return;
            }

            const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            const totalSeconds = Math.floor(diffMs / 1000);

            // Calculate years, months, days
            const nowParts = getDateParts(now);
            const startParts = getDateParts(start);
            let years = nowParts.year - startParts.year;
            let months = nowParts.month - startParts.month;
            let days = nowParts.day - startParts.day;

            if (days < 0) {
                months--;
                const prevMonthDate = new Date(nowParts.year, nowParts.month - 1, 0);
                const prevMonthParts = getDateParts(prevMonthDate);
                days += prevMonthParts.day;
            }

            if (months < 0) {
                years--;
                months += 12;
            }

            // Time components
            const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
            const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
            const seconds = totalSeconds % 60;

            setTimeElapsed({ years, months, days, hours, minutes, seconds, totalDays });
        };

        calculateTime();
        const interval = setInterval(calculateTime, showSeconds ? 1000 : 60000);
        return () => clearInterval(interval);
    }, [start, showSeconds]);

    if (!timeElapsed) {
        return null;
    }

    const themeColors = {
        love: {
            primary: "from-rose-400 to-pink-500",
            secondary: "text-rose-500",
            bg: "bg-rose-50",
            heart: "text-rose-400 fill-rose-400",
        },
        every: {
            primary: "from-blue-400 to-indigo-500",
            secondary: "text-blue-500",
            bg: "bg-blue-50",
            heart: "text-blue-400 fill-blue-400",
        },
        idol: {
            primary: "from-amber-400 to-orange-500",
            secondary: "text-amber-500",
            bg: "bg-amber-50",
            heart: "text-amber-400 fill-amber-400",
        },
    };

    const colors = themeColors[theme];

    return (
        <div className="text-center py-8">
            {/* Total Days Badge */}
            <div className={`inline-flex items-center gap-2 ${colors.bg} px-6 py-3 rounded-full shadow-md mb-6`}>
                <Heart className={`w-5 h-5 ${colors.heart}`} />
                <span className="text-gray-600">Together for</span>
                <span className={`text-3xl font-bold ${colors.secondary}`}>
                    {timeElapsed.totalDays.toLocaleString()}
                </span>
                <span className="text-gray-600">days</span>
            </div>

            {/* Detailed Breakdown */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 max-w-lg mx-auto">
                <TimeUnit value={timeElapsed.years} label="Years" colors={colors} />
                <TimeUnit value={timeElapsed.months} label="Months" colors={colors} />
                <TimeUnit value={timeElapsed.days} label="Days" colors={colors} />
                {showSeconds && (
                    <>
                        <TimeUnit value={timeElapsed.hours} label="Hours" colors={colors} />
                        <TimeUnit value={timeElapsed.minutes} label="Minutes" colors={colors} />
                        <TimeUnit value={timeElapsed.seconds} label="Seconds" colors={colors} />
                    </>
                )}
            </div>

            {/* Anniversary Date */}
            <p className="mt-6 text-sm text-gray-400">
                Since {formatDate(start, {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                })}
            </p>
        </div>
    );
}

interface TimeUnitProps {
    value: number;
    label: string;
    colors: { primary: string; secondary: string };
}

const TimeUnit = memo(function TimeUnit({ value, label, colors }: TimeUnitProps) {
    return (
        <div className="flex flex-col items-center">
            <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br ${colors.primary} flex items-center justify-center shadow-lg`}>
                <span className="text-2xl md:text-3xl font-bold text-white">
                    {String(value).padStart(2, "0")}
                </span>
            </div>
            <span className="mt-2 text-xs text-gray-500 uppercase tracking-wide">
                {label}
            </span>
        </div>
    );
});
