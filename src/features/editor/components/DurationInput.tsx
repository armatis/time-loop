import { useState, useEffect } from 'react';

// Helper to breakdown seconds into {h, m, s} as PADDED STRINGS
const parseSeconds = (totalSeconds: number) => ({
    h: Math.floor(totalSeconds / 3600).toString().padStart(2, '0'),
    m: Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0'),
    s: (totalSeconds % 60).toString().padStart(2, '0')
});

interface Props {
    value: number; // Total seconds from Store
    onChange: (val: number) => void; // Update Store
}

export function DurationInput({ value, onChange }: Props) {
    // 1. Initialize LOCAL BUFFER with the current store value as STRINGS
    const [buffer, setBuffer] = useState(parseSeconds(value));

    // 2. Sync buffer if the Store changes externally (e.g. undo/redo)
    useEffect(() => {
        setBuffer(parseSeconds(value));
    }, [value]);

    // 3. handleCommit: The only time we update the Global Store
    const handleCommit = () => {
        const total = (parseInt(buffer.h || '0', 10) * 3600) +
            (parseInt(buffer.m || '0', 10) * 60) +
            parseInt(buffer.s || '0', 10);
        onChange(total);
    };

    // 4. handleChange: Update buffer with STRICT 2-DIGIT LIMIT
    const handleChange = (field: 'h' | 'm' | 's', inputValue: string) => {
        // Strip non-digits
        const sanitized = inputValue.replace(/\D/g, '');

        // Strict 2-digit cap
        if (sanitized.length > 2) return;

        setBuffer(prev => ({ ...prev, [field]: sanitized }));
    };

    return (
        <>
            {/* Mobile: Vertical layout with inline labels */}
            <div className="flex flex-col gap-2 sm:hidden">
                {/* HOURS */}
                <div className="flex items-center gap-2 group">
                    <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="w-14 p-3 min-h-[44px] text-center border rounded shadow-sm text-lg font-mono bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700"
                        value={buffer.h}
                        onChange={(e) => handleChange('h', e.target.value)}
                        onBlur={handleCommit}
                        onFocus={(e) => e.target.select()}
                        placeholder="00"
                    />
                    <span className="text-xs text-gray-500 font-medium group-focus-within:text-blue-500 transition-colors">hrs</span>
                </div>

                {/* MINUTES */}
                <div className="flex items-center gap-2 group">
                    <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="w-14 p-3 min-h-[44px] text-center border rounded shadow-sm text-lg font-mono bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700"
                        value={buffer.m}
                        onChange={(e) => handleChange('m', e.target.value)}
                        onBlur={handleCommit}
                        onFocus={(e) => e.target.select()}
                        placeholder="00"
                    />
                    <span className="text-xs text-gray-500 font-medium group-focus-within:text-blue-500 transition-colors">min</span>
                </div>

                {/* SECONDS */}
                <div className="flex items-center gap-2 group">
                    <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="w-14 p-3 min-h-[44px] text-center border rounded shadow-sm text-lg font-mono bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700"
                        value={buffer.s}
                        onChange={(e) => handleChange('s', e.target.value)}
                        onBlur={handleCommit}
                        onFocus={(e) => e.target.select()}
                        placeholder="00"
                    />
                    <span className="text-xs text-gray-500 font-medium group-focus-within:text-blue-500 transition-colors">sec</span>
                </div>
            </div>

            {/* Desktop: Horizontal layout with labels below */}
            <div className="hidden sm:flex items-start gap-2">
                {/* HOURS */}
                <div className="flex flex-col items-center gap-1 group">
                    <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="w-16 p-3 min-h-[44px] text-center border rounded shadow-sm text-lg font-mono bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700"
                        value={buffer.h}
                        onChange={(e) => handleChange('h', e.target.value)}
                        onBlur={handleCommit}
                        onFocus={(e) => e.target.select()}
                        placeholder="00"
                    />
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium group-focus-within:text-blue-500 transition-colors">Hrs</span>
                </div>

                <div className="h-[44px] flex items-center">
                    <span className="text-xl font-bold text-gray-300 dark:text-gray-600">:</span>
                </div>

                {/* MINUTES */}
                <div className="flex flex-col items-center gap-1 group">
                    <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="w-16 p-3 min-h-[44px] text-center border rounded shadow-sm text-lg font-mono bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700"
                        value={buffer.m}
                        onChange={(e) => handleChange('m', e.target.value)}
                        onBlur={handleCommit}
                        onFocus={(e) => e.target.select()}
                        placeholder="00"
                    />
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium group-focus-within:text-blue-500 transition-colors">Min</span>
                </div>

                <div className="h-[44px] flex items-center">
                    <span className="text-xl font-bold text-gray-300 dark:text-gray-600">:</span>
                </div>

                {/* SECONDS */}
                <div className="flex flex-col items-center gap-1 group">
                    <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="w-16 p-3 min-h-[44px] text-center border rounded shadow-sm text-lg font-mono bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700"
                        value={buffer.s}
                        onChange={(e) => handleChange('s', e.target.value)}
                        onBlur={handleCommit}
                        onFocus={(e) => e.target.select()}
                        placeholder="00"
                    />
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium group-focus-within:text-blue-500 transition-colors">Sec</span>
                </div>
            </div>
        </>
    );
}
