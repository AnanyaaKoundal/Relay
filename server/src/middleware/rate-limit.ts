import type { Request, Response, NextFunction } from "express";

interface Bucket {
    count: number;
    resetAt: number;   // timestamp when the window expires
}

const buckets = new Map<string, Bucket>();

export function rateLimit(options: {
    windowMs: number;
    max: number;
}) {
    return function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
        const key = req.user?.userId ?? req.ip ?? "unknown";
        const now = Date.now();

        const bucket = buckets.get(key);

        // First request, or window expired → fresh bucket
        if (!bucket || now >= bucket.resetAt) {
            buckets.set(key, { count: 1, resetAt: now + options.windowMs });
            next();
            return;
        }

        // Over limit → 429 + Retry-After
        if (bucket.count >= options.max) {
            res.setHeader("Retry-After", String(Math.ceil((bucket.resetAt - now) / 1000)));
            res.status(429).json({ error: "Too many attempts. Please wait a moment and try again." });
            return;
        }

        bucket.count += 1;
        next();
    };
}