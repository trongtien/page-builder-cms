/**
 * NumberField component for number inputs
 */
export interface NumberFieldProps {
    label: string;
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    required?: boolean;
    error?: string;
}

export function NumberField({ label, value, onChange, min, max, step = 1, required, error }: NumberFieldProps) {
    return (
        <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">
                {label}
                {required && <span className="text-red-500">*</span>}
            </label>
            <input
                type="number"
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                min={min}
                max={max}
                step={step}
                className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                    error
                        ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                }`}
            />
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
}
