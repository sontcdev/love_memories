'use client';

import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { verifyAdminPassword } from '@/app/actions/admin';

interface AdminLoginProps {
    onSuccess: () => void;
}

export default function AdminLogin({ onSuccess }: AdminLoginProps) {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const result = await verifyAdminPassword(password);

        if (result.success) {
            onSuccess();
        } else {
            setError(result.error || 'Invalid password');
            setPassword('');
        }

        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
                    <div className="p-8">
                        <div className="text-center mb-8">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: 'spring' }}
                                className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4"
                            >
                                <Lock className="w-8 h-8 text-white" />
                            </motion.div>

                            <h1 className="text-3xl font-bold text-white mb-2">
                                Admin Dashboard
                            </h1>
                            <p className="text-white/70">
                                Enter password to continue
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            setError('');
                                        }}
                                        placeholder="Enter admin password"
                                        required
                                        disabled={isLoading}
                                        className="w-full px-4 py-3 pr-12 bg-white/20 border border-white/30 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all disabled:opacity-50"
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5 text-white/70" />
                                        ) : (
                                            <Eye className="w-5 h-5 text-white/70" />
                                        )}
                                    </button>
                                </div>

                                {error && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-2 text-sm text-red-300"
                                    >
                                        {error}
                                    </motion.p>
                                )}
                            </div>

                            <motion.button
                                type="submit"
                                disabled={isLoading || !password}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full py-3 bg-white text-purple-900 font-semibold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-xl"
                            >
                                {isLoading ? 'Verifying...' : 'Login'}
                            </motion.button>
                        </form>
                    </div>

                    <div className="px-8 py-4 bg-white/5 border-t border-white/10">
                        <p className="text-xs text-white/50 text-center">
                            Default password: admin123 (set ADMIN_PASSWORD in .env to change)
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
