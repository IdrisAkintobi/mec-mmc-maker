/**
 * Media Entertainment Core (MEC) data structure for Amazon Prime Video content.
 * This interface represents all metadata required to generate a valid MEC XML file
 * according to the MovieLabs specification v2.9.
 *
 * @example
 * ```typescript
 * const mecData: MECData = {
 *   contentId: 'content123',
 *   localizedInfo: [{
 *     language: 'en-US',
 *     titleDisplay: 'Sample Movie',
 *     titleSort: 'Sample Movie'
 *   }],
 *   genre: [{ primary: 'Action', subGenre: ['Adventure'] }],
 *   releaseYear: '2023',
 *   // ... other required fields
 * };
 * ```
 */
export interface MECData {
    /** Unique identifier for the content */
    contentId: string;
    /** Localized information for different languages */
    localizedInfo: LocalizedInfo[];
    /** Genre classification (max 3 total including subgenres) */
    genre: Genre[];
    /** Year of release (YYYY format) */
    releaseYear: string;
    /** Full release date (YYYY-MM-DD format) */
    releaseDate: string;
    /** Release history across different territories and platforms */
    releaseHistory: ReleaseHistory[];
    /** Type of work (movie, episode, season, etc.) */
    workType: WorkType;
    /** Alternative identifiers (EIDR, ISAN, IMDB, etc.) */
    identifier: ContentIdentifier[];
    /** Content ratings (optional) */
    rating?: Rating[];
    /** Cast and crew members */
    cast: CastMember[];
    /** Original language of the content */
    originalLanguage: string;
    /** Associated organization information */
    organization: Organization;
    /** Company display credit information */
    companyDisplayCredit: CompanyCredit;
    /** Category information for episodic content (optional) */
    category?: CategoryInfo;
}

/**
 * Localized metadata for a specific language.
 * Each content must have at least one localized info entry.
 */
export interface LocalizedInfo {
    /** Language code (e.g., 'en-US', 'es-ES', 'ja-JP') */
    language: string;
    /** Display title for the content */
    titleDisplay: string;
    /**
     * Sort title - AUTOMATICALLY GENERATED from titleDisplay
     * The system removes leading articles ('The', 'A', 'An') for proper alphabetical sorting.
     * You should NOT provide this field - it will be ignored and auto-generated.
     * Note: Required by MovieLabs XSD but not used by Amazon Prime Video.
     */
    titleSort?: string;
    /** Short summary (max 190 characters) */
    summary190?: string;
    /** Long summary (max 400 characters) */
    summary400?: string;
    /** Art references (cover images, posters, etc.) */
    artReference?: ArtReference[];
}

/**
 * Art reference for cover images, posters, and other visual assets.
 */
interface ArtReference {
    /** Path or URL to the image file */
    reference: string;
    /** Image resolution (e.g., '1920x1080', '4:3') */
    resolution: string;
    /** Purpose of the image (e.g., 'cover', 'hero', 'boxart') */
    purpose: string;
}

/**
 * Genre classification for content.
 * Amazon Prime supports a maximum of 3 total genres (primary + subgenres combined).
 */
export interface Genre {
    /** Primary genre (e.g., 'Action', 'Drama', 'Comedy') */
    primary: string;
    /** Optional subgenres (e.g., ['Adventure', 'Thriller']) */
    subGenre?: string[];
}

export interface ReleaseHistory {
    type: ReleaseType;
    country: string;
    date: string;
}

export interface ContentIdentifier {
    namespace: NamespaceType;
    value: string;
}

export interface Rating {
    country: string;
    system: string;
    value: string;
}

/**
 * Cast or crew member information.
 */
export interface CastMember {
    /** Job function (e.g., 'Actor', 'Director', 'Producer') */
    jobFunction: string;
    /** Billing order for credits */
    billingBlockOrder: string;
    /** Display names in different languages (language code -> name) */
    displayName: Record<string, string>;
}

interface Organization {
    id: string;
    role: string;
}

interface CompanyCredit {
    value: string;
    language: string;
}

export interface CategoryInfo {
    type: CategoryEnum;
    sequenceNumber?: string;
    parentContentId?: string;
}

export enum ReleaseType {
    Original = 'Original',
    Broadcast = 'Broadcast',
    DVD = 'DVD',
    BluRay = 'Blu-ray',
    PayTV = 'PayTV',
    InternetBuy = 'InternetBuy',
    InternetRent = 'InternetRent',
    Theatrical = 'Theatrical',
    SVOD = 'SVOD',
}

export enum NamespaceType {
    EIDR = 'EIDR',
    ISAN = 'ISAN',
    IMDB = 'IMDB',
    ORG = 'ORG',
}

export enum WorkType {
    Movie = 'movie',
    Episode = 'episode',
    Promotion = 'promotion',
    Season = 'season',
    Series = 'series',
    Supplemental = 'supplemental',
}

export enum CategoryEnum {
    Episode = 'Episode',
    Feature = 'Feature',
    Season = 'Season',
    Series = 'Series',
    Promotion = 'Promotion',
}
