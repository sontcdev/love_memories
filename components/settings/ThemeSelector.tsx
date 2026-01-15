'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Palette, Check } from 'lucide-react';
import { applyTheme } from '@/lib/theme';
import { createClient } from '@/lib/supabase/client';

interface ThemeSelectorProps {
    linkId: string;
    currentColor?: string;
    onColorChange?: (color: string) => void;
}

const PRESET_COLORS = [
    { name: 'Purple', hex: '#9333ea' },
    { name: 'Pink', hex: '#ec4899' },
    { name: 'Red', hex: '#ef4444' },
    { name: 'Orange', hex: '#f97316' },
    { name: 'Amber', hex: '#f59e0b' },
    { name: 'Green', hex: '#10b981' },
    { name: 'Teal', hex: '#14b8a6' },
    { name: 'Blue', hex: '#3b82f6' },
    { name: 'Indigo', hex: '#6366f1' },
    { name: 'Rose', hex: '#f43f5e' },
];

export default function ThemeSelector({ linkId, currentColor = '#9333ea', onColorChange }: ThemeSelectorProps) {
    const [selectedColor, setSelectedColor] = useState(currentColor);
    const [customColor, setCustomColor] = useState(currentColor);
    const [isSaving, setIsSaving] = useState(false);
    const supabase = createClient();

    const handleColorSelect = async (hex: string) => {
        setSelectedColor(hex);
        setCustomColor(hex);

        // Apply theme immediately
        applyTheme(hex);

        // Save to database
        await saveColor(hex);

        // Callback
        onColorChange?.(hex);
    };

    const handleCustomColorChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const hex = e.target.value;
        setCustomColor(hex);
        setSelectedColor(hex);

        // Apply theme immediately
        applyTheme(hex);

        // Debounced save
        await saveColor(hex);

        // Callback
        onColorChange?.(hex);
    };

    const saveColor = async (hex: string) => {
        setIsSaving(true);

        try {
            // Fetch current settings
            const { data: link } = await supabase
                .from('links')
                .select('settings')
                .eq('id', linkId)
                .single();

            // Update theme_color in settings
            const updatedSettings = {
                ...link?.settings,
                theme_color: hex,
            };

            await supabase
                .from('links')
                .update({ settings: updatedSettings })
                .eq('id', linkId);

        } catch (error) {
            console.error('Failed to save theme color:', error);
        }

        setIsSaving(false);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                    <Palette className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">Theme Color</h3>
                    <p className="text-sm text-gray-600">
                        Choose your preferred color theme
                    </p>
                </div>
            </div>

            {/* Preset Colors */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                    Preset Colors
                </label>
                <div className="grid grid-cols-5 gap-4">
                    {PRESET_COLORS.map((color) => (
                        <motion.button
                            key={color.hex}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleColorSelect(color.hex)}
                            className="relative aspect-square rounded-xl shadow-md hover:shadow-lg transition-shadow ring-2 ring-gray-200 hover:ring-gray-300"
                            style={{ backgroundColor: color.hex }}
                            title={color.name}
                        >
                            {selectedColor === color.hex && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                                        <Check className="w-5 h-5 text-gray-800" />
                                    </div>
                                </div>
                            )}
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Custom Color Picker */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                    Custom Color
                </label>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <input
                            type="color"
                            value={customColor}
                            onChange={handleCustomColorChange}
                            className="w-20 h-20 rounded-xl cursor-pointer border-2 border-gray-200 hover:border-primary-500 transition-colors"
                        />
                    </div>
                    <div className="flex-1">
                        <input
                            type="text"
                            value={customColor}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (/^#[0-9A-F]{6}$/i.test(value)) {
                                    handleCustomColorChange(e as any);
                                }
                                setCustomColor(value);
                            }}
                            placeholder="#9333ea"
                            pattern="^#[0-9A-F]{6}$"
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-gray-900"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Enter a hex color code (e.g., #9333ea)
                        </p>
                    </div>
                </div>
            </div>

            {/* Preview */}
            <div className="bg-gray-50 rounded-xl p-6">
                <p className="text-sm font-medium text-gray-700 mb-4">Preview</p>
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-primary-500 rounded-lg">
                            <div className="w-6 h-6 bg-white rounded" />
                        </div>
                        <span className="text-sm text-gray-600">Primary buttons and accents</span>
                    </div>
                    <div className="flex gap-2">
                        <div className="h-8 w-16 bg-primary-100 rounded" />
                        <div className="h-8 w-16 bg-primary-300 rounded" />
                        <div className="h-8 w-16 bg-primary-500 rounded" />
                        <div className="h-8 w-16 bg-primary-700 rounded" />
                        <div className="h-8 w-16 bg-primary-900 rounded" />
                    </div>
                </div>
            </div>

            {/* Status */}
            {isSaving && (
                <div className="text-sm text-gray-600 text-center">
                    Saving theme...
                </div>
            )}
        </div>
    );
}
