'use client';

import { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface DaysCounterProps {
    anniversaryDate: string; // ISO date string
}

export default function DaysCounter({ anniversaryDate }: DaysCounterProps) {
    const [daysTogether, setDaysTogether] = useState(0);

    useEffect(() => {
        const calculateDays = () => {
            const anniversary = new Date(anniversaryDate);
            const today = new Date();
            const diffTime = Math.abs(today.getTime() - anniversary.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays;
        };

        setDaysTogether(calculateDays());
    }, [anniversaryDate]);

    // Animated counter
    const spring = useSpring(0, {
        stiffness: 50,
        damping: 30,
    });

    const display = useTransform(spring, (current) =>
        Math.round(current).toLocaleString()
    );

    useEffect(() => {
        if (daysTogether > 0) {
            spring.set(daysTogether);
        }
    }, [daysTogether, spring]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center"
        >
            <div className="inline-flex items-center gap-3 px-8 py-4 bg-white/80 backdrop-blur-sm rounded-full shadow-xl border-2 border-purple-200">
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="text-4xl"
                >
                    💕
                </motion.div>

                <div className="text-left">
                    <motion.div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        {display}
                    </motion.div>
                    <div className="text-sm md:text-base text-gray-600 font-medium">
                        ngày bên nhau
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
