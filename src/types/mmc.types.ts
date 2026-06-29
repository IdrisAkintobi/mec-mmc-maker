/**
 * Media Manifest Core (MMC) data structure for Amazon Prime Video content.
 * This interface represents all manifest metadata required to generate a valid MMC XML file
 * according to the MovieLabs specification v1.9.
 *
 * @example
 * ```typescript
 * const mmcData: MMCData = {
 *   audio: [{ trackId: 'audio1', type: 'Primary', language: 'en', location: 'path/to/audio.mp4' }],
 *   video: [{ trackId: 'video1', type: 'Primary', language: 'en', location: 'path/to/video.mp4', hash: 'abc123', picture: {...} }],
 *   presentation: [{ id: 'pres1', trackNum: '1', videoId: 'video1', audioId: 'audio1' }],
 *   experience: [{ id: 'exp1', type: AudiovisualType.Main, subType: AudiovisualSubType.Feature }],
 *   alidExperience: [{ alid: 'alid1', experienceId: 'exp1' }]
 * };
 * ```
 */
export interface MMCData {
    /**
     * Compatibility block (manifest spec version + profile). MovieLabs requires this as
     * the first child of MediaManifest; emitted only when provided. e.g.
     * `{ specVersion: '1.5' }`.
     */
    compatibility?: Compatibility;
    /** Audio track information */
    audio: AudioTrack[];
    /** Video track information */
    video: VideoTrack[];
    /** Subtitle track information (optional) */
    subtitle?: SubtitleTrack[];
    /** Image assets (optional) */
    image?: ImageAsset[];
    /** Presentation configurations */
    presentation: Presentation[];
    /** Picture groups (optional) */
    pictureGroup?: PictureGroup[];
    /** Experience definitions */
    experience: Experience[];
    /** ALID to Experience mappings */
    alidExperience: ALIDExperience[];
}

export interface AudioTrack {
    /** Track ID - OPTIONAL: Will be auto-generated if not provided */
    trackId?: string;
    type: AudioType | string;
    language: string;
    location: string;
    /** MD5 hash - OPTIONAL: Not all content providers have hashes */
    hash?: string;
    /**
     * Marks a dubbed track. Emits `dubbed="true"` on the `<md:Type>` element, per
     * Amazon's dubbed-audio requirement. OPTIONAL: omit/false for original-language audio.
     */
    dubbed?: boolean;
    /** Marks a forced track. Emits `forced="true"` on the `<md:Type>` element. OPTIONAL. */
    forced?: boolean;
}

export interface VideoTrack {
    /** Track ID - OPTIONAL: Will be auto-generated if not provided */
    trackId?: string;
    type: VideoType | string;
    language: string;
    location: string;
    /** MD5 hash - OPTIONAL: Not all content providers have hashes */
    hash?: string;
    picture: {
        heightPixels: string;
        widthPixels: string;
        /** Aspect ratio - OPTIONAL: Will be auto-calculated from dimensions if not provided */
        aspectRatio?: string;
        progressive?: boolean;
        progressiveScanOrder?: string;
    };
}

export interface SubtitleTrack {
    /** Track ID - OPTIONAL: Will be auto-generated if not provided */
    trackId?: string;
    /** Timed-text format, e.g. "SRT" / "SCC" — OPTIONAL (emitted as md:Format when set). */
    format?: string;
    type: SubtitleType | string;
    language: string;
    location: string;
    /** MD5 hash - OPTIONAL: Not all content providers have hashes */
    hash?: string;
    /** Frame rate - REQUIRED: e.g., "23.976", "24", "25", "29.97" */
    frameRate: string;
    /** Frame rate multiplier - OPTIONAL: e.g., "1001/1000" */
    frameRateMultiplier?: string;
    /** Frame rate timecode - OPTIONAL: Defaults to "NonDrop" */
    frameRateTimeCode?: string;
}

export interface ImageAsset {
    /** Image ID - OPTIONAL: Will be auto-generated if not provided */
    id?: string;
    purpose: ImagePurpose;
    language: string;
    location: string;
}

export interface Presentation {
    /** Presentation ID - OPTIONAL: Will be auto-generated if not provided */
    id?: string;
    /** Track number - OPTIONAL: Defaults to "0" if not provided */
    trackNum?: string;
    /** Video Track ID - OPTIONAL: Will be auto-generated if not provided */
    videoId?: string;
    /** Audio Track ID — single (back-compat). Prefer `audioIds` for multiple references. */
    audioId?: string;
    /** Audio Track IDs — one AudioTrackReference per id (a presentation may carry several). */
    audioIds?: string[];
    /** Subtitle Track ID — single (back-compat). Prefer `subtitleIds` for multiple. */
    subtitleId?: string;
    /** Subtitle Track IDs — one SubtitleTrackReference per id (full + forced, etc.). */
    subtitleIds?: string[];
}

export interface PictureGroup {
    /** Picture Group ID - OPTIONAL: Will be auto-generated if not provided */
    id?: string;
    /** Picture ID — OPTIONAL, emitted as manifest:PictureID inside the Picture. */
    pictureId?: string;
    imageIds: string[];
}

export interface Experience {
    /** Experience ID - OPTIONAL: Will be auto-generated if not provided */
    id?: string;
    /**
     * Audiovisual Type — the content role, NOT the entity type. For Amazon, main-catalog
     * content (feature, episode, trailer, bonus) all use `"Main"`; the entity type
     * (movie/series) belongs in MEC `WorkType`, not here.
     */
    type: AudiovisualType | string;
    /**
     * Audiovisual SubType — `Feature` | `Trailer` | `Bonus` | `ShoulderContent`. Required
     * for Trailer/Bonus, and used for the feature (`Feature`). Omitted from the XML when empty.
     */
    subType: AudiovisualSubType | string;
    /** Experience version attribute — Amazon's templates use "1.0" (the default). */
    version?: string;
    /** Presentation this experience plays (emitted inside Audiovisual). */
    presentationId?: string;
    /** Picture group for storefront artwork (emitted after Audiovisual). */
    pictureGroupId?: string;
    child?: ExperienceChild;
}

export interface ExperienceChild {
    id: string;
    /** e.g. `ispromotionfor` (trailer→feature) or `isepisodeof`. */
    relationship: ExperienceRelationship | string;
}

/** Manifest compatibility block — MovieLabs requires this first under MediaManifest. */
export interface Compatibility {
    /** Manifest spec version, e.g. "1.5". Must align with the manifest namespace. */
    specVersion: string;
    /** Optional profile identifier. */
    profile?: string;
}

/**
 * ALID Experience mapping
 * Note: Both alid and experienceId are OPTIONAL and will be auto-generated if not provided.
 * The experienceId will be auto-derived from the experience array.
 */
export interface ALIDExperience {
    /** ALID - OPTIONAL: Will be auto-generated if not provided */
    alid?: string;
    /** Experience ID - OPTIONAL: Auto-derived from experience array */
    experienceId?: string;
}

export enum ImagePurpose {
    Boxart = 'Boxart',
    Cover = 'Cover',
    Hero = 'Hero',
}

export enum AudioType {
    Primary = 'primary',
    Narration = 'narration',
    DialogCentric = 'dialog centric',
    Commentary = 'commentary',
}

export enum VideoType {
    Primary = 'primary',
    Other = 'other',
}

export enum SubtitleType {
    Normal = 'normal',
    SDH = 'sdh',
    Forced = 'forced',
}

/** MMC Audiovisual `Type` — the content role. Amazon main-catalog content uses `Main`. */
export enum AudiovisualType {
    Main = 'Main',
    Promotion = 'Promotion',
    Bonus = 'Bonus',
}

/** MMC Audiovisual `SubType`. Required for Trailer/Bonus; the feature uses `Feature`. */
export enum AudiovisualSubType {
    Feature = 'Feature',
    /** Episode main experience (Type=Main). */
    Episode = 'Episode',
    /** Season main experience (Type=Main), where one applies. */
    Season = 'Season',
    Trailer = 'Trailer',
    /** Used for an in-feature-manifest trailer child experience (Type=Promotion). */
    DefaultTrailer = 'Default Trailer',
    Bonus = 'Bonus',
    ShoulderContent = 'ShoulderContent',
}

/** ExperienceChild relationship values per Amazon MMC. */
export enum ExperienceRelationship {
    /** A trailer/promo experience is a promotion for the feature. */
    IsPromotionFor = 'ispromotionfor',
    /** An episode experience belongs to a season/series experience. */
    IsEpisodeOf = 'isepisodeof',
}
