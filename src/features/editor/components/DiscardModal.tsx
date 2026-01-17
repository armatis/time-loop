interface DiscardModalProps {
    onConfirm: () => void;
    onCancel: () => void;
}

export function DiscardModal({ onConfirm, onCancel }: DiscardModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-sm mx-4 shadow-2xl animate-in zoom-in-95 duration-200">
                <h3 className="text-lg font-bold mb-2">Discard Changes?</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    This workout hasn&apos;t been saved. Are you sure you want to discard it?
                </p>
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors cursor-pointer"
                    >
                        Discard
                    </button>
                </div>
            </div>
        </div>
    );
}
