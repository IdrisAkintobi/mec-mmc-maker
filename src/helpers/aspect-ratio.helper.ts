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

/**
 * Required aspect ratios per art reference purpose (Amazon Prime Video spec).
 * null means no fixed ratio is enforced (e.g. title art is a transparent PNG).
 */
const ART_REFERENCE_RATIOS: Record<string, string | null> = {
    cover:           '16:9',
    hero:            '16:9',
    episodic:        '16:9',
    'trailer-bonus': '16:9',
    poster:          '2:3',
    'carousel-hero': '8:3',
    title:           null,
};

/**
 * boxart ratio depends on workType:
 *   movies  → 3:4 (portrait)
 *   seasons / series → 4:3 (landscape)
 */
const BOXART_RATIO_BY_WORKTYPE: Record<string, string> = {
    movie:  '3:4',
    season: '4:3',
    series: '4:3',
};

/**
 * Validate that an art reference resolution matches the Amazon Prime Video spec
 * for the given purpose.  Throws if the ratio is wrong; warns and skips for
 * unknown purposes.
 *
 * @param resolution - Resolution string in WxH format (e.g., "1920x1080")
 * @param purpose    - Art reference purpose (e.g., "cover", "boxart", "hero")
 * @param workType   - Content work type; required for boxart ratio selection
 *
 * @example
 * validateArtReferenceResolution("3840x2160", "cover")          // OK — 16:9
 * validateArtReferenceResolution("2560x1920", "boxart", "season") // OK — 4:3
 * validateArtReferenceResolution("1920x1080", "hero")            // throws — 3:4 ≠ 16:9... wait that IS 16:9, OK
 * validateArtReferenceResolution("1920x2560", "hero")            // throws — 3:4 ≠ 16:9
 */
export function validateArtReferenceResolution(resolution: string, purpose: string, workType?: string): void {
    const normalizedPurpose = purpose.toLowerCase().trim();
    const parts = resolution.split('x');

    if (parts.length !== 2 || !parts[0] || !parts[1]) {
        throw new Error(
            `Invalid resolution format for purpose="${purpose}": "${resolution}". Expected WxH (e.g., "1920x1080").`,
        );
    }

    const actual = calculateAspectRatio(parts[0], parts[1]);

    if (normalizedPurpose === 'boxart') {
        const normalizedWorkType = workType?.toLowerCase();
        const expected = normalizedWorkType ? BOXART_RATIO_BY_WORKTYPE[normalizedWorkType] : undefined;

        if (expected) {
            if (actual !== expected) {
                throw new Error(
                    `ArtReference resolution mismatch for purpose="${purpose}" (workType="${workType}"): ` +
                    `"${resolution}" has ratio ${actual}, expected ${expected}.`,
                );
            }
        } else {
            // workType unknown or not season/series/movie — accept either valid boxart ratio
            if (!['4:3', '3:4'].includes(actual)) {
                throw new Error(
                    `ArtReference resolution mismatch for purpose="${purpose}": ` +
                    `"${resolution}" has ratio ${actual}, expected 4:3 (seasons/series) or 3:4 (movies).`,
                );
            }
        }
        return;
    }

    if (!(normalizedPurpose in ART_REFERENCE_RATIOS)) {
        console.warn(`Unknown art reference purpose: "${purpose}". Skipping ratio validation.`);
        return;
    }

    const expected = ART_REFERENCE_RATIOS[normalizedPurpose];
    if (expected === null) return; // no fixed ratio (e.g. title art)

    if (actual !== expected) {
        throw new Error(
            `ArtReference resolution mismatch for purpose="${purpose}": ` +
            `"${resolution}" has ratio ${actual}, expected ${expected}.`,
        );
    }
}
