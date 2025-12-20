/**
 * SelectField component for enum/select inputs
 */
export interface SelectFieldProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    required?: boolean;
    error?: string;
}

export function SelectField({ label, value, onChange, options, required, error }: SelectFieldProps) {
    return (
        <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">
                {label}
                {required && <span className="text-red-500">*</span>}
            </label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                    error
                        ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                }`}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
}
