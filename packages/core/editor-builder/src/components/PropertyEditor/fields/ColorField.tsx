import { useState } from "react";

/**
 * ColorField component for hex color inputs with picker
 */
export interface ColorFieldProps {
    label: string;
    value: string | undefined;
    onChange: (value: string | undefined) => void;
    required?: boolean;
    error?: string;
}

export function ColorField({ label, value, onChange, required, error }: ColorFieldProps) {
    const [showPicker, setShowPicker] = useState(false);
    const displayValue = value || "#ffffff";

    return (
        <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">
                {label}
                {required && <span className="text-red-500">*</span>}
            </label>
            <div className="flex gap-2">
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setShowPicker(!showPicker)}
                        className="h-10 w-10 rounded-md border-2 border-gray-300 shadow-sm transition-shadow hover:shadow-md"
                        style={{ backgroundColor: displayValue }}
                        title="Click to pick color"
                    />
                    {showPicker && (
                        <input
                            type="color"
                            value={displayValue}
                            onChange={(e) => onChange(e.target.value)}
                            className="absolute left-0 top-0 h-10 w-10 cursor-pointer opacity-0"
                            onBlur={() => setShowPicker(false)}
                        />
                    )}
                </div>
                <input
                    type="text"
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value || undefined)}
                    placeholder="#000000"
                    pattern="^#[0-9A-Fa-f]{6}$"
                    className={`flex-1 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                        error
                            ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                            : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                    }`}
                />
                {value && (
                    <button
                        type="button"
                        onClick={() => onChange(undefined)}
                        className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                        Clear
                    </button>
                )}
            </div>
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
}
