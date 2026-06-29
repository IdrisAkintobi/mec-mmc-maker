// Builders
export { MECBuilder } from './builders/mec.builder';
export { MMCBuilder } from './builders/mmc.builder';

// Types
export {
    type CategoryEnum,
    type Genre,
    type MECData,
    type NamespaceType,
    type ReleaseType,
    type WorkType,
} from './types/mec.types';
export {
    AudioType,
    AudiovisualSubType,
    AudiovisualType,
    ExperienceRelationship,
    SubtitleType,
    VideoType,
    type ALIDExperience,
    type AudioTrack,
    type Compatibility,
    type Experience,
    type ExperienceChild,
    type ImageAsset,
    type ImagePurpose,
    type MMCData,
    type PictureGroup,
    type Presentation,
    type SubtitleTrack,
    type VideoTrack,
} from './types/mmc.types';

// CSV Types
export { type ImageOnlyCSVData, type ImageOnlyParsedType } from './types/csv/image-only-parsed.type';
export { type CategoryEnum as Category, type MECCSVData, type mecParsedType } from './types/csv/mec-parsed.type';
export { type MMCCSVData, type mmcParsedType } from './types/csv/mmc-parsed.type';

// Legacy exports for backward compatibility
export { type ImageOnlyCSVData as ImageOnlyDataType } from './types/csv/image-only-parsed.type';
export { type MECCSVData as mecDataType } from './types/csv/mec-parsed.type';
export { type MMCCSVData as mmcDataType } from './types/csv/mmc-parsed.type';

// Validation
export { validateXMLStructure } from './helpers/xml-validator';

// Utilities
export { calculateAspectRatio } from './helpers/aspect-ratio.helper';
export {
    autoPopulateMECFields,
    autoPopulateMMCFields,
    createAutoPopulateConfig,
    extractReleaseYear,
    getWorkTypeSuffix,
    titleToSlug,
    type AutoPopulateConfig,
} from './helpers/auto-populate.helper';
export {
    getSupportedGenres,
    getSupportedLanguages,
    suggestGenres,
    suggestLanguages,
    validateGenreCode,
    validateGenreCodes,
    validateLanguageCode,
    validateLanguageCodes,
    validateRatingSystem,
} from './helpers/language-genre-validation.helper';
export {
    extractContentSlug,
    extractOrganization,
    generateMovieLabsID,
    MovieLabsIDGenerator,
    type IDType,
    type MovieLabsIDConfig,
} from './helpers/movielabs-id.generator';
export { generateTitleSort } from './helpers/title-sort.helper';
export {
    validateALIDExperienceMatch,
    validateAspectRatio,
    validateAudioTracks,
    validateAudioType,
    validateBatchIDs,
    validateContentID,
    validateMECData,
    validateMMCData,
    validateMovieLabsID,
    validatePresentationReferences,
    validateSubtitleTracks,
    validateSubtitleType,
    validateVideoTracks,
    validateVideoType,
    type ValidationResult,
} from './helpers/validation.helper';

// CSV Utilities
export { extractContentSlugFromURL } from './helpers/content-slug-extractor.helper';
export { autofillMMCIDs, type MMCDataWithIDs } from './helpers/mmc-id-autofill.helper';
export { hasValues, safeSplit } from './helpers/safe-split.helper';

// CSV Data Processors (for backward compatibility with mdmec-xml-maker)
export { dataToImageOnlyXml, dataToMECXml, dataToMMCXml } from './processors/csv-data.processor';
