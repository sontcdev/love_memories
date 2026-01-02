"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createInitialAdmin } from "@/app/actions/admin-actions";

export default function SetupPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const username = formData.get("username") as string;
        const password = formData.get("password") as string;

        try {
            const result = await createInitialAdmin(username, password);

            if (result.success) {
                setSuccess(true);
                setTimeout(() => {
                    router.push("/admin/login");
                }, 2000);
            } else {
                setError(result.error || "Failed to create admin");
            }
        } catch (err) {
            setError("An unexpected error occurred");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
                <div className="w-full max-w-md bg-slate-800 rounded-2xl p-8 border border-slate-700 text-center">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Admin Created!</h1>
                    <p className="text-slate-400">Redirecting to login page...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
            <div className="w-full max-w-md bg-slate-800 rounded-2xl p-8 border border-slate-700">
                <h1 className="text-2xl font-bold text-white mb-6 text-center">
                    Setup Initial Admin
                </h1>
                <p className="text-slate-400 text-sm mb-6 text-center">
                    This page should only be used once to create the first admin account.
                </p>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-slate-300 mb-2">Username</label>
                        <input
                            type="text"
                            name="username"
                            required
                            className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-violet-500"
                            placeholder="admin"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-300 mb-2">Password</label>
                        <input
                            type="password"
                            name="password"
                            required
                            minLength={6}
                            className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-violet-500"
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-600/50 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Creating...
                            </>
                        ) : (
                            "Create Admin Account"
                        )}
                    </button>
                </form>

                <p className="text-xs text-slate-500 mt-6 text-center">
                    ⚠️ Delete this page after creating the admin account for security.
                </p>
            </div>
        </div>
    );
}
