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

interface AudioTrack {
    trackId: string;
    type: string;
    language: string;
    location: string;
    hash?: string;
}

interface VideoTrack {
    trackId: string;
    type: string;
    language: string;
    location: string;
    hash: string;
    picture: {
        heightPixels: string;
        widthPixels: string;
        aspectRatio?: string;
        progressive?: boolean;
        progressiveScanOrder?: string;
    };
}

interface SubtitleTrack {
    trackId: string;
    type: string;
    language: string;
    location: string;
    hash: string;
    frameRate: string;
    frameRateMultiplier: string;
    frameRateTimeCode: string;
}

interface ImageAsset {
    id: string;
    purpose: ImagePurpose;
    language: string;
    location: string;
}

interface Presentation {
    id: string;
    trackNum: string;
    videoId: string;
    audioId: string;
    subtitleId?: string;
}

interface PictureGroup {
    id: string;
    imageIds: string[];
}

interface Experience {
    id: string;
    type: ExperienceType;
    subType: string;
    child?: ExperienceChild;
}

interface ExperienceChild {
    id: string;
    relationship: string;
}

interface ALIDExperience {
    alid: string;
    experienceId: string;
}

export enum ImagePurpose {
    Boxart = 'Boxart',
    Cover = 'Cover',
    Hero = 'Hero',
}

export enum ExperienceType {
    Movie = 'Movie',
    Series = 'Series',
    Season = 'Season',
    Episode = 'Episode',
}
