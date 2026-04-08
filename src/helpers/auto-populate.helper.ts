/**
 * Auto-population helpers for MEC and MMC fields
 * Based on Amazon Prime Video rules and common patterns
 */

import { extractContentSlug } from './movielabs-id.generator';

/**
 * Configuration for auto-population
 * These should be set once per organization
 */
export interface AutoPopulateConfig {
    /** Organization/Partner alias (e.g., "wiflix") */
    organization: string;
    /** Default identifier namespace - typically "ORG" for indie distributors */
    identifierNamespace?: 'ORG' | 'EIDR';
    /** Organization role - always "licensor" for Prime Video */
    organizationRole?: string;
    /** Company display credit - typically same as organization */
    companyDisplayCredit?: string;
    /** Company credit language - typically "en-US" or primary language */
    companyCreditLanguage?: string;
}

/**
 * Convert title to URL-safe slug
 * @param title - Display title (e.g., "The Matrix: Reloaded")
 * @returns URL-safe slug (e.g., "the-matrix-reloaded")
 *
 * @example
 * titleToSlug("The Matrix") // returns "the-matrix"
 * titleToSlug("Spider-Man 2") // returns "spider-man-2"
 * titleToSlug("Game_of_Thrones") // returns "game_of_thrones"
 */
export function titleToSlug(title: string): string {
    if (!title) {
        throw new Error('Title is required for slug generation');
    }

    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s\-_]/g, '') // Remove special characters, preserve hyphens and underscores
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Extract release year from release date
 * @param releaseDate - Date in YYYY-MM-DD format
 * @returns Year as string (e.g., "2023")
 *
 * @example
 * extractReleaseYear("2023-08-01") // returns "2023"
 */
export function extractReleaseYear(releaseDate: string): string {
    if (!releaseDate || typeof releaseDate !== 'string') {
        throw new Error('Invalid release date format');
    }

    // Extract year from YYYY-MM-DD format
    const year = releaseDate.split('-')[0];

    if (year?.length !== 4 || Number.isNaN(Number(year))) {
        throw new Error(`Invalid release date format: ${releaseDate}. Expected YYYY-MM-DD`);
    }

    return year;
}

/**
 * Get work type suffix for track IDs based on work type
 * @param workType - Type of work (movie, episode, season, series, promotion, supplemental)
 * @returns Suffix for track IDs (e.g., "feature", "episode")
 */
export function getWorkTypeSuffix(workType: string): string {
    const workTypeLower = workType.toLowerCase();

    const suffixMap: Record<string, string> = {
        movie: 'feature',
        episode: 'episode',
        season: 'season',
        series: 'series',
        promotion: 'trailer',
        supplemental: 'bonus',
    };

    return suffixMap[workTypeLower] || 'feature';
}

/**
 * Auto-populate MEC fields based on config and provided data
 * @param data - Partial MEC data
 * @param config - Auto-populate configuration
 * @returns Complete MEC data with auto-populated fields
 */
export function autoPopulateMECFields(
    data: Record<string, unknown>,
    config: AutoPopulateConfig,
): Record<string, unknown> {
    const {
        organization,
        identifierNamespace = 'ORG',
        organizationRole = 'licensor',
        companyDisplayCredit,
        companyCreditLanguage = 'en-US',
    } = config;

    return {
        ...data,

        // Auto-generate ContentID if not provided
        ContentID:
            data.ContentID ||
            (() => {
                if (!data.TitleDisplay) {
                    throw new Error('Either ContentID or TitleDisplay must be provided');
                }
                const slug = titleToSlug(data.TitleDisplay as string);
                return `md:cid:org:${organization}:${slug}`;
            })(),

        // Extract ReleaseYear from ReleaseDate if not provided
        ReleaseYear:
            data.ReleaseYear ||
            (typeof data.ReleaseDate === 'string' ? extractReleaseYear(data.ReleaseDate) : undefined),

        // Set Identifier:Namespace to default if not provided
        'Identifier:Namespace': data['Identifier:Namespace'] || identifierNamespace,

        // Auto-derive Identifier from ContentID if not provided
        Identifier:
            data.Identifier ||
            (typeof data.ContentID === 'string' ? extractContentSlug(data.ContentID) : data.TitleSlug),

        // Set organization fields if not provided
        OrganizationID: data.OrganizationID || organization,
        OrganizationRole: data.OrganizationRole || organizationRole,

        // Set company display credit if not provided
        CompanyDisplayCredit: data.CompanyDisplayCredit || companyDisplayCredit || organization,
        'CompanyDisplayCredit:language': data['CompanyDisplayCredit:language'] || companyCreditLanguage,
    };
}

/**
 * Auto-populate MMC track IDs based on ContentID and work type
 * @param data - Partial MMC data
 * @param config - Auto-populate configuration
 * @returns MMC data with auto-populated track IDs
 */
export function autoPopulateMMCFields(
    data: Record<string, unknown>,
    config: AutoPopulateConfig,
    contentID: string,
    workType: string = 'movie',
): Record<string, unknown> {
    const { organization } = config;
    const contentSlug = extractContentSlug(contentID);
    const typeSuffix = getWorkTypeSuffix(workType);

    return {
        ...data,

        // Auto-generate VideoTrackID if not provided
        VideoTrackID: data.VideoTrackID || `md:vidtrackid:org:${organization}:${contentSlug}:${typeSuffix}.video`,

        // Auto-generate AudioTrackID if not provided and audio exists
        AudioTrackID:
            data.AudioTrackID ||
            (data.AudioLocation ? `md:audtrackid:org:${organization}:${contentSlug}:${typeSuffix}.audio` : ''),

        // Auto-generate SubtitleTrackID if not provided and subtitle exists
        SubtitleTrackID:
            data.SubtitleTrackID ||
            (data.SubtitleLocation
                ? `md:subtitletrackid:org:${organization}:${contentSlug}:${typeSuffix}.subtitle`
                : ''),

        // Auto-generate ImageID if not provided and image exists
        ImageID:
            data.ImageID || (data.ImageLocation ? `md:imageid:org:${organization}:${contentSlug}:cover.art.en` : ''),

        // Auto-generate PresentationID if not provided
        PresentationID:
            data.PresentationID || `md:presentationid:org:${organization}:${contentSlug}:${typeSuffix}.presentation`,

        // Auto-set PresentationIDTrackNum if not provided (always "0" for simple cases)
        PresentationIDTrackNum: data.PresentationIDTrackNum || '0',

        // Auto-populate PresentationIDVid from VideoTrackID (for simple cases)
        PresentationIDVid:
            data.PresentationIDVid ||
            data.VideoTrackID ||
            `md:vidtrackid:org:${organization}:${contentSlug}:${typeSuffix}.video`,

        // Auto-populate PresentationIDAud from AudioTrackID if exists
        PresentationIDAud: data.PresentationIDAud || data.AudioTrackID || '',

        // Auto-populate PresentationIDSub from SubtitleTrackID if exists
        PresentationIDSub: data.PresentationIDSub || data.SubtitleTrackID || '',

        // Auto-generate ExperienceID if not provided
        ExperienceID: data.ExperienceID || `md:experienceid:org:${organization}:${contentSlug}:experience`,

        // Auto-generate ALID if not provided
        ALID: data.ALID || `md:ALID:org:${organization}:${contentSlug}`,
    };
}

/**
 * Create a complete auto-populate configuration from environment or defaults
 */
export function createAutoPopulateConfig(
    organization: string,
    overrides?: Partial<AutoPopulateConfig>,
): AutoPopulateConfig {
    return {
        organization,
        identifierNamespace: 'ORG',
        organizationRole: 'licensor',
        companyDisplayCredit: organization,
        companyCreditLanguage: 'en-US',
        ...overrides,
    };
}
