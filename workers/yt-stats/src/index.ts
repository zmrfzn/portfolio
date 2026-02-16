/**
 * Cloudflare Worker for YouTube Stats
 * - Caches view counts in KV
 * - Refreshes via weekly cron
 * - Serves cached data to frontend
 */

export interface Env {
    YT_CACHE: KVNamespace;
    YT_API_KEY: string;
    ALLOWED_ORIGIN: string;
}

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*', // Replace with specific origin in production if needed
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json'
};

// Video IDs to track (extracted from talks.json)
const VIDEO_IDS = [
    "gZtnKmbtecY",
    "H4V107K-xTU",
    "NkJefYSVxfE",
    "a501tgQzc6Y",
    "figFMgvOhdk",
    "awTp7rF_1PE",
    "fLptS-w0Tyk",
    "78C7gujwGO8"
];

// Helper: Fetch from YouTube API
async function fetchFromYouTube(apiKey: string, videoIds: string[]): Promise<Record<string, string>> {
    if (!apiKey || apiKey === 'YT_API_KEY_PLACEHOLDER') {
        console.warn('No API key set');
        return {};
    }

    const url = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds.join(',')}&key=${apiKey}`;
    const resp = await fetch(url);

    if (!resp.ok) {
        console.error(`YouTube API error: ${resp.status} ${resp.statusText}`);
        return {};
    }

    const data: any = await resp.json();
    const stats: Record<string, string> = {};

    if (data.items) {
        for (const item of data.items) {
            stats[item.id] = item.statistics.viewCount;
        }
    }

    return stats;
}

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: CORS_HEADERS });
        }

        if (request.method !== 'GET') {
            return new Response('Method Not Allowed', { status: 405, headers: CORS_HEADERS });
        }

        // Try to get from KV
        let cached = await env.YT_CACHE.get('view_counts', 'json');

        // If no cache (first run), try to fetch live if API key is present
        if (!cached && env.YT_API_KEY && env.YT_API_KEY !== 'YT_API_KEY_PLACEHOLDER') {
            console.log('Cache miss, fetching live...');
            const fresh = await fetchFromYouTube(env.YT_API_KEY, VIDEO_IDS);
            if (Object.keys(fresh).length > 0) {
                await env.YT_CACHE.put('view_counts', JSON.stringify(fresh), {
                    expirationTtl: 604800 // 7 days
                });
                cached = fresh;
            }
        }

        // If still no cache (API key missing or failed), return empty object?
        // Client can fallback to returnyoutubedislikeapi.com
        if (!cached) {
            return Response.json({}, { headers: CORS_HEADERS });
        }

        return Response.json(cached, { headers: CORS_HEADERS });
    },

    async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
        console.log('Cron triggered: Refreshing YouTube stats...');
        const fresh = await fetchFromYouTube(env.YT_API_KEY, VIDEO_IDS);

        if (Object.keys(fresh).length > 0) {
            await env.YT_CACHE.put('view_counts', JSON.stringify(fresh), {
                expirationTtl: 604800 // 7 days
            });
            console.log('Cache updated successfully');
        } else {
            console.error('Failed to update cache (empty response or API error)');
        }
    }
};
