export interface EditThemeClasses {
    wrapperClass: string;
    containerClass: string;
    sidebarClass: string;
    mainClass: string;
    headerClass: string;
    headerTextClass: string;
    headerBackLinkClass: string;
    headerViewLinkClass: string;
}

export function getEditThemeClasses(isDark: boolean, isGrad: boolean, isIdol: boolean, gradTheme: string): EditThemeClasses {
    let wrapperClass = `min-h-screen relative overflow-x-hidden transition-colors duration-500 ${isDark ? "bg-[#0a0a0c] text-white" : "bg-gray-50 text-gray-800"}`;
    let containerClass = `rounded-3xl border transition-all duration-500 overflow-hidden ${
        isDark
            ? "bg-slate-900/85 border-purple-500/20 shadow-[0_0_40px_rgba(168,85,247,0.15)] text-white backdrop-blur-sm"
            : "bg-white border-gray-100 shadow-xl text-gray-800"
    }`;
    let sidebarClass = `w-full md:w-72 shrink-0 p-4 md:p-6 flex flex-col gap-6 md:border-r transition-all ${
        isDark ? "border-purple-500/25 bg-slate-950/20" : "border-gray-100 bg-gray-50/30"
    }`;
    let mainClass = "flex-1 p-4 sm:p-6 md:p-8";

    let headerClass = `sticky top-0 z-10 md:z-20 border-b transition-all ${
        isDark
            ? "bg-slate-950/80 border-purple-900/30 backdrop-blur-md"
            : "bg-white border-gray-200 shadow-sm"
    }`;

    let headerTextClass = isDark ? "text-white" : "text-gray-800";
    let headerBackLinkClass = isDark ? "hover:bg-slate-800 text-purple-400" : "hover:bg-gray-100 text-gray-600";
    let headerViewLinkClass = isDark ? "text-purple-300 hover:text-white" : "text-gray-600 hover:text-gray-800";

    if (isGrad) {
        if (gradTheme === "emerald") {
            if (isDark) {
                wrapperClass = "min-h-screen relative overflow-x-hidden bg-[#150f0b] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,40,32,0.6),rgba(0,0,0,0.8))] py-6";
                containerClass = "rounded-3xl border-4 border-[#1c1511] shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden bg-[#24352f] text-emerald-100 max-w-6xl mx-auto";
                sidebarClass = "w-full md:w-72 shrink-0 p-4 md:p-6 flex flex-col gap-6 md:border-r-2 md:border-[#10201a] bg-[#0f1d19] text-emerald-200 relative";
                mainClass = "flex-1 p-4 sm:p-6 md:p-8 bg-[#24352f] bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100%_2.5rem] text-emerald-100 relative shadow-inner";
                headerClass = "sticky top-0 z-10 md:z-20 border-b border-[#12241d] bg-[#0f1d19] text-emerald-200";
            } else {
                wrapperClass = "min-h-screen relative overflow-x-hidden bg-[#2d1f18] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] py-6";
                containerClass = "rounded-3xl border-4 border-[#3e2b20] shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden bg-[#faf6ee] text-slate-800 max-w-6xl mx-auto";
                sidebarClass = "w-full md:w-72 shrink-0 p-4 md:p-6 flex flex-col gap-6 md:border-r-2 md:border-[#1a3028]/20 bg-[#1c352d] text-emerald-100 relative";
                mainClass = "flex-1 p-4 sm:p-6 md:p-8 bg-[#faf6ee] bg-[linear-gradient(rgba(36,74,60,0.03)_1px,transparent_1px)] bg-[size:100%_2.5rem] text-slate-800 relative shadow-inner";
                headerClass = "sticky top-0 z-10 md:z-20 border-b border-[#12241d] bg-[#1c352d] text-emerald-100";
            }
            headerTextClass = "text-current";
            headerBackLinkClass = "hover:bg-black/10 text-current";
            headerViewLinkClass = "text-current opacity-80 hover:opacity-100";
        } else if (gradTheme === "chalkboard") {
            if (isDark) {
                wrapperClass = "min-h-screen relative overflow-x-hidden bg-[#1a0f0b] py-6";
                containerClass = "rounded-3xl border-4 border-[#0c0503] shadow-[0_20px_50px_rgba(0,0,0,0.85)] overflow-hidden bg-[#0b120f] text-[#a5c0b0] max-w-6xl mx-auto";
                sidebarClass = "w-full md:w-72 shrink-0 p-4 md:p-6 flex flex-col gap-6 md:border-r-2 md:border-[#070b09] bg-[#182024] text-slate-300 relative";
                mainClass = "flex-1 p-4 sm:p-6 md:p-8 bg-[#0b120f] bg-[radial-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:16px_16px] text-[#a5c0b0] relative shadow-inner";
                headerClass = "sticky top-0 z-10 md:z-20 border-b border-[#070b09] bg-[#182024] text-slate-300";
            } else {
                wrapperClass = "min-h-screen relative overflow-x-hidden bg-[#3e2723] bg-gradient-to-b from-[#2d1a12] to-[#3e2723] py-6";
                containerClass = "rounded-3xl border-4 border-[#1e100b] shadow-[0_20px_50px_rgba(0,0,0,0.7)] overflow-hidden bg-[#131f1a] text-[#f4f7f6] max-w-6xl mx-auto";
                sidebarClass = "w-full md:w-72 shrink-0 p-4 md:p-6 flex flex-col gap-6 md:border-r-2 md:border-[#0c1411] bg-[#263238] text-slate-200 relative";
                mainClass = "flex-1 p-4 sm:p-6 md:p-8 bg-[#131f1a] bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:16px_16px] text-[#f4f7f6] relative shadow-inner";
                headerClass = "sticky top-0 z-10 md:z-20 border-b border-[#0c1411] bg-[#263238] text-slate-200";
            }
            headerTextClass = "text-current";
            headerBackLinkClass = "hover:bg-black/10 text-current";
            headerViewLinkClass = "text-current opacity-80 hover:opacity-100";
        } else if (gradTheme === "caravan") {
            if (isDark) {
                wrapperClass = "min-h-screen relative overflow-x-hidden bg-[#120a05] py-6";
                containerClass = "rounded-3xl border-4 border-[#3a2517] shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden bg-[#2d1b10] text-[#f2e6d9] max-w-6xl mx-auto";
                sidebarClass = "w-full md:w-72 shrink-0 p-4 md:p-6 flex flex-col gap-6 md:border-r-2 md:border-[#1d1008] bg-[#4a3525] text-orange-200 relative";
                mainClass = "flex-1 p-4 sm:p-6 md:p-8 bg-[#2d1b10] bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100%_2.5rem] text-[#f2e6d9] relative shadow-inner";
                headerClass = "sticky top-0 z-10 md:z-20 border-b border-[#1d1008] bg-[#4a3525] text-orange-200";
            } else {
                wrapperClass = "min-h-screen relative overflow-x-hidden bg-[#27150c] bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.2)_1px,transparent_1px)] py-6";
                containerClass = "rounded-3xl border-4 border-[#543b27] shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden bg-[#faf4e8] text-amber-950 max-w-6xl mx-auto";
                sidebarClass = "w-full md:w-72 shrink-0 p-4 md:p-6 flex flex-col gap-6 md:border-r-2 md:border-[#543b27]/20 bg-[#7a5c43] text-orange-50 relative";
                mainClass = "flex-1 p-4 sm:p-6 md:p-8 bg-[#faf4e8] bg-[linear-gradient(rgba(84,59,39,0.03)_1px,transparent_1px)] bg-[size:100%_2.5rem] text-amber-950 relative shadow-inner";
                headerClass = "sticky top-0 z-10 md:z-20 border-b border-[#543b27]/20 bg-[#7a5c43] text-orange-50";
            }
            headerTextClass = "text-current";
            headerBackLinkClass = "hover:bg-black/10 text-current";
            headerViewLinkClass = "text-current opacity-80 hover:opacity-100";
        } else if (gradTheme === "scrapbook") {
            if (isDark) {
                wrapperClass = "min-h-screen relative overflow-x-hidden bg-[#1e1c18] py-6";
                containerClass = "rounded-3xl border-4 border-[#7a0c3a] shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden bg-[#2b2b2b] text-slate-100 max-w-6xl mx-auto";
                sidebarClass = "w-full md:w-72 shrink-0 p-4 md:p-6 flex flex-col gap-6 md:border-r-2 md:border-[#1a1a1a] bg-[#880e4f] text-pink-100 relative";
                mainClass = "flex-1 p-4 sm:p-6 md:p-8 bg-[#2b2b2b] bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100%_2.5rem] text-slate-100 relative shadow-inner";
                headerClass = "sticky top-0 z-10 md:z-20 border-b border-[#1a1a1a] bg-[#880e4f] text-pink-100";
            } else {
                wrapperClass = "min-h-screen relative overflow-x-hidden bg-[#f0e6d2] bg-[radial-gradient(#d3c5a7_1px,transparent_1px)] [background-size:24px_24px] py-6";
                containerClass = "rounded-3xl border-4 border-[#ad1457] shadow-[0_20px_50px_rgba(0,0,0,0.4)] overflow-hidden bg-white text-slate-800 max-w-6xl mx-auto";
                sidebarClass = "w-full md:w-72 shrink-0 p-4 md:p-6 flex flex-col gap-6 md:border-r-2 md:border-pink-200 bg-[#d81b60] text-pink-50 relative";
                mainClass = "flex-1 p-4 sm:p-6 md:p-8 bg-white bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:100%_2.5rem] text-slate-800 relative shadow-inner";
                headerClass = "sticky top-0 z-10 md:z-20 border-b border-pink-200 bg-[#d81b60] text-pink-50";
            }
            headerTextClass = "text-current";
            headerBackLinkClass = "hover:bg-black/10 text-current";
            headerViewLinkClass = "text-current opacity-80 hover:opacity-100";
        } else {
            if (isDark) {
                wrapperClass = "min-h-screen relative overflow-x-hidden bg-[#05070a] py-6";
                containerClass = "rounded-3xl border-4 border-[#10161c] shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden bg-[#182026] text-slate-200 max-w-6xl mx-auto";
                sidebarClass = "w-full md:w-72 shrink-0 p-4 md:p-6 flex flex-col gap-6 md:border-r-2 md:border-[#10161c] bg-[#1b252f] text-blue-200 relative";
                mainClass = "flex-1 p-4 sm:p-6 md:p-8 bg-[#182026] bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:2rem_2rem] text-slate-200 relative shadow-inner";
                headerClass = "sticky top-0 z-10 md:z-20 border-b border-[#10161c] bg-[#1b252f] text-blue-200";
            } else {
                wrapperClass = "min-h-screen relative overflow-x-hidden bg-[#0d131a] bg-gradient-to-tr from-[#060a0f] to-[#141d26] py-6";
                containerClass = "rounded-3xl border-4 border-[#1a252f] shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden bg-[#f4f7f6] text-slate-800 max-w-6xl mx-auto";
                sidebarClass = "w-full md:w-72 shrink-0 p-4 md:p-6 flex flex-col gap-6 md:border-r-2 md:border-slate-300 bg-[#2c3e50] text-blue-50 relative";
                mainClass = "flex-1 p-4 sm:p-6 md:p-8 bg-[#f4f7f6] bg-[linear-gradient(rgba(44,62,80,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(44,62,80,0.03)_1px,transparent_1px)] bg-[size:2rem_2rem] text-slate-800 relative shadow-inner";
                headerClass = "sticky top-0 z-10 md:z-20 border-b border-slate-300 bg-[#2c3e50] text-blue-50";
            }
            headerTextClass = "text-current";
            headerBackLinkClass = "hover:bg-black/10 text-current";
            headerViewLinkClass = "text-current opacity-80 hover:opacity-100";
        }
    }

    return { wrapperClass, containerClass, sidebarClass, mainClass, headerClass, headerTextClass, headerBackLinkClass, headerViewLinkClass };
}

export function getTabButtonClass(
    isDark: boolean,
    isGrad: boolean,
    gradTheme: string,
    isActive: boolean,
): string {
    let tabBtnClass = `flex items-center gap-2 md:gap-3 px-3 py-2.5 md:px-4 md:py-3 rounded-xl text-left transition-all ${
        isActive
            ? isDark
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] border border-purple-400/25"
                : "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md"
            : isDark
                ? "text-purple-300 hover:bg-slate-800/80"
                : "text-gray-600 hover:bg-gray-50"
    }`;

    if (isGrad) {
        if (gradTheme === "emerald") {
            tabBtnClass = `flex items-center gap-2 md:gap-3 px-3 py-2.5 md:px-4 md:py-3 rounded-l-xl text-left transition-all md:rounded-r-none md:-mr-6 ${
                isActive
                    ? "bg-[#faf6ee] text-emerald-900 font-bold border-y border-l border-emerald-900/20 shadow-[-4px_0_10px_rgba(0,0,0,0.05)] relative z-10"
                    : "text-emerald-100 hover:bg-[#152822]"
            }`;
            if (isDark && isActive) {
                tabBtnClass = `flex items-center gap-2 md:gap-3 px-3 py-2.5 md:px-4 md:py-3 rounded-l-xl text-left transition-all md:rounded-r-none md:-mr-6 bg-[#24352f] text-emerald-200 font-bold border-y border-l border-[#10201a]/30 shadow-[-4px_0_10px_rgba(0,0,0,0.15)] relative z-10`;
            }
        } else if (gradTheme === "chalkboard") {
            tabBtnClass = `flex items-center gap-2 md:gap-3 px-3 py-2.5 md:px-4 md:py-3 rounded-l-xl text-left transition-all md:rounded-r-none md:-mr-6 ${
                isActive
                    ? isDark
                        ? "bg-[#0b120f] text-[#a5c0b0] font-bold border-y border-l border-[#070b09]/30 shadow-[-4px_0_10px_rgba(0,0,0,0.2)] relative z-10"
                        : "bg-[#131f1a] text-emerald-400 font-bold border-y border-l border-emerald-950/20 shadow-[-4px_0_10px_rgba(0,0,0,0.15)] relative z-10"
                    : "text-slate-300 hover:bg-[#1e2d25]"
            }`;
        } else if (gradTheme === "caravan") {
            tabBtnClass = `flex items-center gap-2 md:gap-3 px-3 py-2.5 md:px-4 md:py-3 rounded-l-xl text-left transition-all md:rounded-r-none md:-mr-6 ${
                isActive
                    ? isDark
                        ? "bg-[#2d1b10] text-[#f2e6d9] font-bold border-y border-l border-[#1d1008]/30 shadow-[-4px_0_10px_rgba(0,0,0,0.15)] relative z-10"
                        : "bg-[#faf4e8] text-[#543b27] font-bold border-y border-l border-[#543b27]/20 shadow-[-4px_0_10px_rgba(0,0,0,0.05)] relative z-10"
                    : "text-orange-100 hover:bg-[#644933]"
            }`;
        } else if (gradTheme === "scrapbook") {
            tabBtnClass = `flex items-center gap-2 md:gap-3 px-3 py-2.5 md:px-4 md:py-3 rounded-l-xl text-left transition-all md:rounded-r-none md:-mr-6 ${
                isActive
                    ? isDark
                        ? "bg-[#2b2b2b] text-pink-200 font-bold border-y border-l border-[#1a1a1a]/30 shadow-[-4px_0_10px_rgba(0,0,0,0.15)] relative z-10"
                        : "bg-white text-[#d81b60] font-bold border-y border-l border-pink-100 shadow-[-4px_0_10px_rgba(0,0,0,0.05)] relative z-10"
                    : "text-pink-100 hover:bg-[#c2185b]"
            }`;
        } else {
            tabBtnClass = `flex items-center gap-2 md:gap-3 px-3 py-2.5 md:px-4 md:py-3 rounded-l-xl text-left transition-all md:rounded-r-none md:-mr-6 ${
                isActive
                    ? isDark
                        ? "bg-[#182026] text-blue-200 font-bold border-y border-l border-[#10161c]/30 shadow-[-4px_0_10px_rgba(0,0,0,0.15)] relative z-10"
                        : "bg-[#f4f7f6] text-blue-900 font-bold border-y border-l border-blue-100 shadow-[-4px_0_10px_rgba(0,0,0,0.05)] relative z-10"
                    : "text-blue-100 hover:bg-[#202d3b]"
            }`;
        }
    }

    return tabBtnClass;
}
