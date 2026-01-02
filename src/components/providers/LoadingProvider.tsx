"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface LoadingContextType {
    isLoading: boolean;
    message: string;
    showLoading: (message?: string) => void;
    hideLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function useLoading() {
    const context = useContext(LoadingContext);
    if (!context) {
        throw new Error("useLoading must be used within a LoadingProvider");
    }
    return context;
}

// Loading Overlay Component
function LoadingOverlay({ message }: { message: string }) {
    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999]">
            <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-200">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-pink-100 rounded-full" />
                    <div className="absolute inset-0 w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
                </div>
                <p className="text-gray-700 font-medium text-center">{message}</p>
            </div>
        </div>
    );
}

export function LoadingProvider({ children }: { children: ReactNode }) {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("Loading...");

    const showLoading = useCallback((msg: string = "Loading...") => {
        setMessage(msg);
        setIsLoading(true);
    }, []);

    const hideLoading = useCallback(() => {
        setIsLoading(false);
        setMessage("Loading...");
    }, []);

    return (
        <LoadingContext.Provider value={{ isLoading, message, showLoading, hideLoading }}>
            {children}
            {isLoading && <LoadingOverlay message={message} />}
        </LoadingContext.Provider>
    );
}
