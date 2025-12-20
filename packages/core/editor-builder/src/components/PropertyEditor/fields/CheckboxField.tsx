/**
 * CheckboxField component for boolean inputs
 */
export interface CheckboxFieldProps {
    label: string;
    value: boolean;
    onChange: (value: boolean) => void;
    description?: string;
}

export function CheckboxField({ label, value, onChange, description }: CheckboxFieldProps) {
    return (
        <div className="mb-4">
            <label className="flex items-center">
                <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => onChange(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">{label}</span>
            </label>
            {description && <p className="ml-6 mt-1 text-xs text-gray-500">{description}</p>}
        </div>
    );
}
