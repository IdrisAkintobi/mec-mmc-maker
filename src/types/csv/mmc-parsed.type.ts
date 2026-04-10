/**
 * CSV-parsed MMC data structure
 * Used for CSV upload workflows where data is flat with semicolon-delimited arrays
 */

/**
 * CSV-parsed MMC data structure
 * @deprecated Use MMCCSVData instead
 */
export type mmcParsedType = MMCCSVData;

/**
 * MMC data from CSV files
 * Flat structure with semicolon-delimited arrays
 */
export type MMCCSVData = {
    /**
     * Display title for the content
     * OPTIONAL: If provided, will be used to generate content slug for all IDs
     * This ensures MMC IDs match MEC ContentID (same title = same IDs)
     * If not provided, content slug will be extracted from VideoLocation URL
     * @example "Football Nation Episode 1" → slug: "football-nation-episode-1"
     */
    TitleDisplay?: string;

    /**
     * Each Audio element is a string separated by '|' e.g AudiTrackID01;AudiTrackID02
     * OPTIONAL: Will be auto-generated from organization + content slug if not provided
     */
    //Audio Manifest - [Array] - separator('|')
    AudioTrackID?: string;
    AudioType: string;
    AudioLanguage: string;
    AudioLocation: string;
    AudioHash?: string;

    /**
     * Each Video element is a string separated by '|' e.g VideoTrackID001;VideoTrackID002
     * OPTIONAL: Will be auto-generated from organization + content slug if not provided
     */
    //Video Manifest  - [Array] - separator('|')
    VideoTrackID?: string;
    VideoType: string;
    VideoLanguage: string;
    VideoLocation: string;
    VideoHash?: string;

    AspectRatio?: string;
    WidthPixels: string;
    HeightPixels: string;
    Progressive?: string;
    ProgressiveScanOrder?: string;

    /**
     * Each subtitle element is a string separated by '|' e.g SubtitleTrackID1;SubtitleTrackID2
     * OPTIONAL: Will be auto-generated from organization + content slug if not provided
     */
    //Subtitle Manifest - [Array] - separator('|')
    SubtitleTrackID?: string;
    SubtitleType: string;
    SubtitleLanguage: string;
    SubtitleLocation: string;
    SubtitleHash?: string;
    SubtitleFrameRate: string;
    SubtitleFrameRateMultiplier: string;
    SubtitleFrameRateTimeCode: string;

    /**
     * This is optional if the images are already provided in the mec file.
     * The images are of different purposes such as boxart, cover, hero...
     * Each image element is a string separated by '|' e.g ImageID0001;ImageID0002
     * OPTIONAL: Will be auto-generated from organization + content slug if not provided
     */
    //Image Manifest - [Array] - separator('|')
    ImageID?: string;
    ImagePurpose: string;
    ImageLanguage: string;
    ImageLocation: string;

    /**
     * Each presentation are separated by '||' and further separated by the regular ';'
     * E,g PresentationID01||PresentationID02, PresentationIDSub0101;PresentationIDSub0102||PresentationIDSub0201;PresentationIDSub0202
     * We can have more than one presentations and each presentation can have more than one aud and sub which will be separated by '|'
     * OPTIONAL: PresentationID, PresentationIDVid, PresentationIDAud, PresentationIDSub will be auto-generated if not provided
     */
    //Presentation Manifest - [Array]  - separator('||') -childSeparator(';)
    PresentationID?: string;
    PresentationIDTrackNum?: string;
    PresentationIDVid?: string;
    PresentationIDAud?: string;
    PresentationIDSub?: string;

    /**
     * This is optional
     * Each picture group are separated by '||' and the PictureGroupImageID is further separated by the regular ';'
     * E,g PictureGroupID01||PictureGroupID02, PictureGroupImageID0101;PictureGroupImageID0102||PictureGroupImageID0201
     * Image IDs can be more than one. boxart, cover, hero...
     */
    //Picture group - [Array]  - separator('||') -childSeparator(';')
    PictureGroupID?: string;
    PictureGroupImageID?: string;

    /**
     * Experiences are separated by '|'
     * E,g ExperienceID01;ExperienceID02, ExperienceType01;ExperienceType02, ExperienceSubType01;ExperienceSubType02
     * The number of experiences is proportional to the number of presentations
     * OPTIONAL: ExperienceID and ALID will be auto-generated if not provided
     */
    //Experience Manifest - [Array] - separator('|')
    ExperienceID?: string;
    ExperienceType: string;
    ExperienceSubType: string;

    /**
     * Experiences children are separated by '|'
     * E,g PictureGroupID01||PictureGroupID02, ExperienceChildID01;ExperienceChildID02, ExperienceChildRelationship01;ExperienceChildRelationship02
     * If there are more than one video, there could be children such as a trailer to a main video
     */
    //Experience Manifest - [Array] - separator('|')
    ExperienceChildID?: string;
    ExperienceChildRelationship?: string;

    /**
     * ALID are separated by '|'
     * E,g ALID01;ALID02
     * OPTIONAL: Will be auto-generated from organization + content slug if not provided
     */
    //Experience Manifest - [Array] - separator('|')
    ALID?: string;
};
