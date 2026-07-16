import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { randomBytes } from "crypto";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function generateSlug(length: number = 8): string {
    return randomBytes(Math.ceil(length / 2)).toString("hex").slice(0, length);
}

export function generatePin(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export function generateSessionToken(): string {
    return randomBytes(32).toString("hex");
}
