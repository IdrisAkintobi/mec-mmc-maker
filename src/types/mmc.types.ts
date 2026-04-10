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
 *   experience: [{ id: 'exp1', type: ExperienceType.Movie, subType: 'Feature' }],
 *   alidExperience: [{ alid: 'alid1', experienceId: 'exp1' }]
 * };
 * ```
 */
export interface MMCData {
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
    /** Audio Track ID - OPTIONAL: Will be auto-generated if not provided */
    audioId?: string;
    /** Subtitle Track ID - OPTIONAL: Only needed if subtitles exist */
    subtitleId?: string;
}

export interface PictureGroup {
    /** Picture Group ID - OPTIONAL: Will be auto-generated if not provided */
    id?: string;
    imageIds: string[];
}

export interface Experience {
    /** Experience ID - OPTIONAL: Will be auto-generated if not provided */
    id?: string;
    type: ExperienceType;
    subType: string;
    child?: ExperienceChild;
}

export interface ExperienceChild {
    id: string;
    relationship: string;
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

export enum ExperienceType {
    Movie = 'Movie',
    Series = 'Series',
    Season = 'Season',
    Episode = 'Episode',
}
