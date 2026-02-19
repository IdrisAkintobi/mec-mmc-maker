import { extractContentSlugFromURL } from './content-slug-extractor.helper';

/**
 * Generic MMC data structure for auto-filling IDs
 */
export interface MMCDataWithIDs {
    VideoLocation?: string;
    VideoTrackID?: string;
    AudioLocation?: string;
    AudioTrackID?: string;
    SubtitleLocation?: string;
    SubtitleTrackID?: string;
    ImageLocation?: string;
    ImageID?: string;
    PresentationID?: string;
    PresentationIDTrackNum?: string;
    PresentationIDVid?: string;
    PresentationIDAud?: string;
    PresentationIDSub?: string;
    ExperienceID?: string;
    ALID?: string;
    [key: string]: unknown;
}

/**
 * Auto-fill missing MMC IDs from VideoLocation URL
 * This is a fallback when user doesn't provide MovieLabs IDs
 * Handles multiple audio/subtitle tracks by generating sequential IDs
 *
 * @param data - MMC data with optional IDs
 * @param organization - Organization name for generating IDs
 * @returns Data with auto-filled IDs
 *
 * @example
 * ```typescript
 * const data = {
 *   VideoLocation: 'https://s3.amazonaws.com/wiflix-content/my-movie/video.mp4',
 *   AudioLocation: 'path/to/audio1.mp4;path/to/audio2.mp4'
 * };
 * const filled = autofillMMCIDs(data, 'wiflix');
 * // filled.VideoTrackID = 'md:vidtrackid:org:wiflix:my-movie:video'
 * // filled.AudioTrackID = 'md:audiotrackid:org:wiflix:my-movie:audio1;md:audiotrackid:org:wiflix:my-movie:audio2'
 * ```
 */
export function autofillMMCIDs<T extends MMCDataWithIDs>(data: T, organization: string = 'default-org'): T {
    // Extract content slug from VideoLocation
    const contentSlug = extractContentSlugFromURL(data.VideoLocation || '');

    // Helper function to generate multiple IDs based on count
    const generateMultipleIDs = (
        existingIDs: string | undefined,
        location: string | undefined,
        type: 'video' | 'audio' | 'subtitle' | 'image',
        suffix: string = type,
    ): string | undefined => {
        if (existingIDs) return existingIDs;
        if (!location) return undefined;

        // Count how many items (split by ';')
        const locations = location.split(';').filter(l => l.trim());

        if (locations.length === 1) {
            // Single track
            return `md:${type}trackid:org:${organization}:${contentSlug}:${suffix}`;
        } else {
            // Multiple tracks - generate sequential IDs
            return locations
                .map((_, index) => `md:${type}trackid:org:${organization}:${contentSlug}:${suffix}${index + 1}`)
                .join(';');
        }
    };

    // Generate Video Track ID (usually single)
    const videoTrackID = data.VideoTrackID || `md:vidtrackid:org:${organization}:${contentSlug}:video`;

    // Generate Audio Track IDs (can be multiple)
    const audioTrackID = generateMultipleIDs(data.AudioTrackID, data.AudioLocation, 'audio');

    // Generate Subtitle Track IDs (can be multiple)
    const subtitleTrackID = generateMultipleIDs(data.SubtitleTrackID, data.SubtitleLocation, 'subtitle');

    // Helper function to generate image IDs
    const generateImageID = (location: string | undefined): string | undefined => {
        if (!location) return undefined;
        const locations = location.split(';').filter(l => l.trim());
        if (locations.length === 1) {
            return `md:imageid:org:${organization}:${contentSlug}:cover.art`;
        } else {
            return locations
                .map((_, index) => `md:imageid:org:${organization}:${contentSlug}:image${index + 1}`)
                .join(';');
        }
    };

    // Generate Image IDs (can be multiple)
    const imageID = data.ImageID || generateImageID(data.ImageLocation);

    // Generate IDs only if they're missing
    return {
        ...data,

        VideoTrackID: videoTrackID,
        AudioTrackID: audioTrackID,
        SubtitleTrackID: subtitleTrackID,
        ImageID: imageID,

        // Presentation ID
        PresentationID: data.PresentationID || `md:presentationid:org:${organization}:${contentSlug}:presentation`,

        // Presentation Track Number (default to 0)
        PresentationIDTrackNum: data.PresentationIDTrackNum || '0',

        // Presentation References (use generated track IDs)
        PresentationIDVid: data.PresentationIDVid || videoTrackID,
        PresentationIDAud: data.PresentationIDAud || audioTrackID,
        PresentationIDSub: data.PresentationIDSub || subtitleTrackID,

        // Experience ID
        ExperienceID: data.ExperienceID || `md:experienceid:org:${organization}:${contentSlug}:experience`,

        // ALID
        ALID: data.ALID || `md:ALID:org:${organization}:${contentSlug}`,
    };
}
