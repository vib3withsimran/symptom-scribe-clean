type RequestRecord = {
    count: number;
    timestamp: number;
};

const requestStore = new Map<string, RequestRecord>();

const WINDOW_SIZE_MS = 60 * 1000;
const MAX_REQUESTS = 10;

export function rateLimit(ip: string) {
    const now = Date.now();

    const existing = requestStore.get(ip);

    // First request
    if (!existing) {
        requestStore.set(ip, {
            count: 1,
            timestamp: now,
        });

        return { success: true };
    }

    // Reset window
    if (now - existing.timestamp > WINDOW_SIZE_MS) {
        requestStore.set(ip, {
            count: 1,
            timestamp: now,
        });

        return { success: true };
    }

    // Block request
    if (existing.count >= MAX_REQUESTS) {
        return { success: false };
    }

    // Increment safely
    requestStore.set(ip, {
        count: existing.count + 1,
        timestamp: existing.timestamp,
    });

    return { success: true };
}