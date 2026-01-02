"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loginAdmin } from "@/app/actions/admin-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, User, Loader2 } from "lucide-react";

// Full-screen loading overlay
function LoadingOverlay({ message }: { message: string }) {
    return (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-sm flex items-center justify-center z-[100]">
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-violet-200/20 rounded-full" />
                    <div className="absolute inset-0 w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
                </div>
                <p className="text-white font-medium text-lg">{message}</p>
            </div>
        </div>
    );
}

export default function AdminLoginPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [isPageLoading, setIsPageLoading] = useState(true);

    // Show loading when page first loads
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsPageLoading(false);
        }, 800);

        return () => clearTimeout(timer);
    }, []);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);

        // Show loading immediately
        setIsLoading(true);
        setLoadingMessage("Signing in...");
        setError(null);

        // Minimum loading time for UX
        const minLoadingTime = new Promise(resolve => setTimeout(resolve, 1000));

        try {
            const [result] = await Promise.all([
                loginAdmin(formData),
                minLoadingTime
            ]);

            if (result.success) {
                setLoadingMessage("Redirecting to dashboard...");
                // Small delay before redirect
                await new Promise(resolve => setTimeout(resolve, 500));
                router.push("/admin/links");
            } else {
                setError(result.error || "Login failed");
                setIsLoading(false);
                setLoadingMessage("");
            }
        } catch (err) {
            console.error("Login error:", err);
            setError("An error occurred");
            setIsLoading(false);
            setLoadingMessage("");
        }
    }

    // Show initial page loading
    if (isPageLoading) {
        return <LoadingOverlay message="Loading..." />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 animate-in fade-in duration-500">
            {/* Loading Overlay for form submission */}
            {isLoading && <LoadingOverlay message={loadingMessage} />}

            <div className="w-full max-w-md">
                {/* Logo/Title */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 mb-4 shadow-lg shadow-violet-500/25">
                        <Lock className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Admin Portal</h1>
                    <p className="text-slate-400">Sign in to manage your platform</p>
                </div>

                {/* Login Card */}
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Username */}
                        <div className="space-y-2">
                            <Label htmlFor="username" className="text-slate-300">
                                Username
                            </Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <Input
                                    id="username"
                                    name="username"
                                    type="text"
                                    placeholder="Enter your username"
                                    required
                                    disabled={isLoading}
                                    className="pl-10 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-violet-500 focus:ring-violet-500/20 disabled:opacity-50"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-slate-300">
                                Password
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="Enter your password"
                                    required
                                    disabled={isLoading}
                                    className="pl-10 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-violet-500 focus:ring-violet-500/20 disabled:opacity-50"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold py-3 h-12 rounded-xl shadow-lg shadow-violet-500/25 transition-all duration-200 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </Button>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center text-slate-500 text-sm mt-6">
                    Personalized Anniversary Platform
                </p>
            </div>
        </div>
    );
}
