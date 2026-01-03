"use client"

import * as React from "react"

interface SwitchProps {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    disabled?: boolean;
    className?: string;
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
    ({ className, checked, onCheckedChange, disabled }, ref) => {
        return (
            <button
                ref={ref}
                type="button"
                role="switch"
                aria-checked={checked}
                disabled={disabled}
                onClick={() => onCheckedChange?.(!checked)}
                className={`
                    relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full 
                    border-2 border-transparent transition-colors duration-200 ease-in-out
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800
                    disabled:cursor-not-allowed disabled:opacity-50
                    ${checked ? "bg-violet-600" : "bg-slate-600"}
                    ${className || ""}
                `}
            >
                <span
                    className={`
                        pointer-events-none inline-block h-5 w-5 transform rounded-full 
                        bg-white shadow-lg ring-0 transition duration-200 ease-in-out
                        ${checked ? "translate-x-5" : "translate-x-0"}
                    `}
                />
            </button>
        );
    }
);
Switch.displayName = "Switch";

export { Switch };
