/**
 * Extract content slug from Video Location URL
 * Used for auto-generating MMC IDs when ContentID is not available
 *
 * Examples:
 * - https://s3.amazonaws.com/wiflix-content/chioma-my-love/video/feature_1080p.mp4
 *   → chioma-my-love
 * - /content/my-movie/video.mp4
 *   → my-movie
 */
export function extractContentSlugFromURL(url: string): string {
    if (!url) {
        return 'default-content';
    }

    try {
        // Remove protocol and domain
        const withoutProtocol = url.replace(/^https?:\/\/[^\/]+\//, '');

        // Split by slashes and find the content identifier
        // Typically: bucket/content-name/subfolder/file.ext
        // We want: content-name
        const parts = withoutProtocol.split('/');

        // Return the second segment (after bucket name)
        // If URL format is: wiflix-content/chioma-my-love/video/file.mp4
        // Return: chioma-my-love
        if (parts.length >= 2) {
            return parts[1];
        }

        // Fallback: return first meaningful part
        return parts[0] || 'default-content';
    } catch {
        return 'default-content';
    }
}
