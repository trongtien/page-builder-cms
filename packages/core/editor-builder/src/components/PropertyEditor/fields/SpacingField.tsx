/**
 * SpacingField component for padding/margin inputs
 */
export interface SpacingValue {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
}

export interface SpacingFieldProps {
    label: string;
    value: SpacingValue | undefined;
    onChange: (value: SpacingValue | undefined) => void;
}

export function SpacingField({ label, value, onChange }: SpacingFieldProps) {
    const handleChange = (side: keyof SpacingValue, val: number) => {
        onChange({
            ...value,
            [side]: val
        });
    };

    const spacing = value || { top: 0, right: 0, bottom: 0, left: 0 };

    return (
        <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">{label}</label>
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="mb-1 block text-xs text-gray-600">Top</label>
                    <input
                        type="number"
                        value={spacing.top || 0}
                        onChange={(e) => handleChange("top", Number(e.target.value))}
                        min={0}
                        max={200}
                        className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-xs text-gray-600">Right</label>
                    <input
                        type="number"
                        value={spacing.right || 0}
                        onChange={(e) => handleChange("right", Number(e.target.value))}
                        min={0}
                        max={200}
                        className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-xs text-gray-600">Bottom</label>
                    <input
                        type="number"
                        value={spacing.bottom || 0}
                        onChange={(e) => handleChange("bottom", Number(e.target.value))}
                        min={0}
                        max={200}
                        className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-xs text-gray-600">Left</label>
                    <input
                        type="number"
                        value={spacing.left || 0}
                        onChange={(e) => handleChange("left", Number(e.target.value))}
                        min={0}
                        max={200}
                        className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                </div>
            </div>
        </div>
    );
}
