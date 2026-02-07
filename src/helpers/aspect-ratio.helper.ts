/**
 * Calculate the greatest common divisor (GCD) using Euclidean algorithm
 */
function gcd(a: number, b: number): number {
    return b === 0 ? a : gcd(b, a % b);
}

/**
 * Calculate aspect ratio from width and height pixels
 * @param widthPixels - Width in pixels (e.g., "1920")
 * @param heightPixels - Height in pixels (e.g., "1080")
 * @returns Aspect ratio string (e.g., "16:9")
 *
 * @example
 * calculateAspectRatio("1920", "1080") // returns "16:9"
 * calculateAspectRatio("1280", "720")  // returns "16:9"
 * calculateAspectRatio("1200", "1600") // returns "3:4"
 */
export function calculateAspectRatio(widthPixels: string, heightPixels: string): string {
    const width = Number.parseInt(widthPixels, 10);
    const height = Number.parseInt(heightPixels, 10);

    if (Number.isNaN(width) || Number.isNaN(height) || width <= 0 || height <= 0) {
        throw new Error(`Invalid dimensions: width=${widthPixels}, height=${heightPixels}`);
    }

    const divisor = gcd(width, height);
    const aspectWidth = width / divisor;
    const aspectHeight = height / divisor;

    return `${aspectWidth}:${aspectHeight}`;
}
