/**
 * MovieLabs ID Generator for Amazon Prime Video
 *
 * According to Amazon Prime Video documentation:
 * Identifiers use the following URI structure:
 * <namespace>:<type>:<scheme>:<SSID>:<Additional Information>
 *
 * - namespace: Always "md" for MovieLabs IDs
 * - type: The type of identifier (vidtrackid, audtrackid, imageid, etc.)
 * - scheme: Either "eidr-x" (EIDR) or "org" (partner unique ID)
 * - SSID: The content identifier (EIDR or partner's unique ID with business alias)
 * - Additional Information: Extra details to make IDs unique
 *
 * @see https://videocentral.amazon.com/support/delivery-experience/mmc-asset-manifest
 */

export interface MovieLabsIDConfig {
    /** Partner's business alias (e.g., "wiflix", "amazon_studios") */
    organization: string;
    /** Content unique identifier/slug (e.g., "Chioma", "Kingmakers_S01E01") */
    contentSlug: string;
    /** Scheme type: "org" for partner IDs, "eidr-x" for EIDR numbers */
    scheme?: 'org' | 'eidr-x';
}

export type IDType =
    | 'cid' // Content ID
    | 'vidtrackid' // Video Track ID
    | 'audtrackid' // Audio Track ID
    | 'subtitletrackid' // Subtitle Track ID
    | 'imageid' // Image ID
    | 'presentationid' // Presentation ID
    | 'experienceid' // Experience ID
    | 'ALID' // Amazon Listing ID
    | 'picturegroupid'; // Picture Group ID

/**
 * Generate a MovieLabs-compliant ID for Amazon Prime Video content
 *
 * @param type - The type of ID to generate
 * @param config - Configuration with organization and content slug
 * @param additionalInfo - Optional additional information for uniqueness
 * @returns MovieLabs-compliant ID string
 *
 * @example
 * // Content ID
 * generateMovieLabsID('cid', {
 *   organization: 'wiflix',
 *   contentSlug: 'Chioma'
 * }) // returns "md:cid:org:wiflix:Chioma"
 *
 * @example
 * // Video Track ID with type
 * generateMovieLabsID('vidtrackid', {
 *   organization: 'wiflix',
 *   contentSlug: 'Chioma'
 * }, 'feature.video') // returns "md:vidtrackid:org:wiflix:Chioma:feature.video"
 *
 * @example
 * // Image ID with purpose and language
 * generateMovieLabsID('imageid', {
 *   organization: 'wiflix',
 *   contentSlug: 'Chioma'
 * }, 'cover.art.en') // returns "md:imageid:org:wiflix:Chioma:cover.art.en"
 */
export function generateMovieLabsID(type: IDType, config: MovieLabsIDConfig, additionalInfo?: string): string {
    const { organization, contentSlug, scheme = 'org' } = config;

    // Validate inputs
    if (!organization || !contentSlug) {
        throw new Error('Organization and contentSlug are required');
    }

    // Build the ID parts
    const parts = [
        'md', // namespace
        type, // type
        scheme, // scheme
        organization, // business alias
        contentSlug, // unique content ID
    ];

    // Add additional information if provided
    if (additionalInfo) {
        parts.push(additionalInfo);
    }

    return parts.join(':');
}

/**
 * Extract content slug from a MovieLabs Content ID
 *
 * @param contentID - The full content ID (e.g., "md:cid:org:wiflix:Chioma")
 * @returns The content slug (e.g., "Chioma")
 *
 * @example
 * extractContentSlug("md:cid:org:wiflix:Chioma") // returns "Chioma"
 * extractContentSlug("md:cid:org:wiflix:Kingmakers_S01E01") // returns "Kingmakers_S01E01"
 */
export function extractContentSlug(contentID: string): string {
    const parts = contentID.split(':');

    // Format: md:cid:org:organization:contentSlug
    if (parts.length >= 5) {
        return parts[4];
    }

    throw new Error(`Invalid ContentID format: ${contentID}`);
}

/**
 * Extract organization from a MovieLabs ID
 *
 * @param movieLabsID - Any MovieLabs ID
 * @returns The organization/business alias
 *
 * @example
 * extractOrganization("md:cid:org:wiflix:Chioma") // returns "wiflix"
 */
export function extractOrganization(movieLabsID: string): string {
    const parts = movieLabsID.split(':');

    // Format: md:type:scheme:organization:...
    if (parts.length >= 4 && parts[2] === 'org') {
        return parts[3];
    }

    throw new Error(`Invalid MovieLabs ID format or scheme: ${movieLabsID}`);
}

/**
 * Helper to generate common ID types
 */
export const MovieLabsIDGenerator = {
    /**
     * Generate Content ID
     * @example contentID('wiflix', 'Chioma') // "md:cid:org:wiflix:Chioma"
     */
    contentID: (organization: string, contentSlug: string) => generateMovieLabsID('cid', { organization, contentSlug }),

    /**
     * Generate Video Track ID
     * @example videoTrackID('wiflix', 'Chioma', 'feature') // "md:vidtrackid:org:wiflix:Chioma:feature.video"
     */
    videoTrackID: (organization: string, contentSlug: string, type: string = 'feature') =>
        generateMovieLabsID('vidtrackid', { organization, contentSlug }, `${type}.video`),

    /**
     * Generate Audio Track ID
     * @example audioTrackID('wiflix', 'Chioma', 'feature', 'en') // "md:audtrackid:org:wiflix:Chioma:feature.audio.en"
     */
    audioTrackID: (organization: string, contentSlug: string, type: string = 'feature', language?: string) =>
        generateMovieLabsID(
            'audtrackid',
            { organization, contentSlug },
            language ? `${type}.audio.${language}` : `${type}.audio`,
        ),

    /**
     * Generate Subtitle Track ID
     */
    subtitleTrackID: (organization: string, contentSlug: string, type: string = 'feature', language: string = 'en') =>
        generateMovieLabsID('subtitletrackid', { organization, contentSlug }, `${type}.subtitle.${language}`),

    /**
     * Generate Image ID
     * @example imageID('wiflix', 'Chioma', 'cover', 'en') // "md:imageid:org:wiflix:Chioma:cover.art.en"
     */
    imageID: (organization: string, contentSlug: string, purpose: string, language: string = 'en') =>
        generateMovieLabsID('imageid', { organization, contentSlug }, `${purpose}.art.${language}`),

    /**
     * Generate Presentation ID
     * @example presentationID('wiflix', 'Chioma', 'feature') // "md:presentationid:org:wiflix:Chioma:feature.presentation"
     */
    presentationID: (organization: string, contentSlug: string, type: string = 'feature') =>
        generateMovieLabsID('presentationid', { organization, contentSlug }, `${type}.presentation`),

    /**
     * Generate Experience ID
     * @example experienceID('wiflix', 'Chioma') // "md:experienceid:org:wiflix:Chioma:experience"
     */
    experienceID: (organization: string, contentSlug: string) =>
        generateMovieLabsID('experienceid', { organization, contentSlug }, 'experience'),

    /**
     * Generate ALID (Amazon Listing ID)
     * @example alid('wiflix', 'Chioma') // "md:ALID:org:wiflix:Chioma"
     */
    alid: (organization: string, contentSlug: string) => generateMovieLabsID('ALID', { organization, contentSlug }),

    /**
     * Generate Picture Group ID
     * @example pictureGroupID('wiflix', 'Chioma') // "md:picturegroupid:org:wiflix:Chioma"
     */
    pictureGroupID: (organization: string, contentSlug: string) =>
        generateMovieLabsID('picturegroupid', { organization, contentSlug }),
};
