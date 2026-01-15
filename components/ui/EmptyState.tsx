'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    illustration?: ReactNode;
}

export default function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    illustration
}: EmptyStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center py-16 px-4"
        >
            {/* Dashed Border Container */}
            <div className="w-full max-w-lg border-2 border-dashed border-gray-300 rounded-3xl p-12 bg-gray-50/50 backdrop-blur-sm">
                {/* Icon or Illustration */}
                <div className="flex justify-center mb-6">
                    {illustration || (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                            className="p-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full"
                        >
                            <Icon className="w-16 h-16 text-purple-600" strokeWidth={1.5} />
                        </motion.div>
                    )}
                </div>

                {/* Text Content */}
                <div className="text-center space-y-3">
                    <motion.h3
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-2xl font-bold text-gray-800"
                    >
                        {title}
                    </motion.h3>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-gray-600 leading-relaxed"
                    >
                        {description}
                    </motion.p>
                </div>

                {/* Action Button */}
                {action && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="mt-8 flex justify-center"
                    >
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={action.onClick}
                            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                        >
                            {action.label}
                        </motion.button>
                    </motion.div>
                )}

                {/* Decorative Elements */}
                <div className="mt-8 flex justify-center gap-2">
                    {[...Array(3)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.6 + i * 0.1 }}
                            className="w-2 h-2 bg-purple-300 rounded-full"
                        />
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
