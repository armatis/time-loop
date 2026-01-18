import { vi, beforeEach } from 'vitest';

// Mock crypto.randomUUID with deterministic counter
let uuidCounter = 0;
Object.defineProperty(global, 'crypto', {
    value: {
        randomUUID: () => `test-uuid-${++uuidCounter}`
    },
    writable: true, // Allow overrides if necessary
});

// Reset UUID counter before each test for deterministic behavior
beforeEach(() => {
    uuidCounter = 0;
});

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
            store[key] = value.toString();
        },
        removeItem: (key: string) => {
            delete store[key];
        },
        clear: () => {
            store = {};
        }
    };
})();

Object.defineProperty(global, 'localStorage', {
    value: localStorageMock,
    writable: true,
});
