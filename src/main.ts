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
    type ExperienceType,
    type ImagePurpose,
    type MMCData,
    type AudioTrack,
    type VideoTrack,
    type SubtitleTrack,
    type ImageAsset,
    type Presentation,
    type PictureGroup,
    type Experience,
    type ExperienceChild,
    type ALIDExperience,
} from './types/mmc.types';

// Validation
export { validateXMLStructure } from './helpers/xml-validator';

// Utilities
export { calculateAspectRatio } from './helpers/aspect-ratio.helper';
export { generateTitleSort } from './helpers/title-sort.helper';
export {
    generateMovieLabsID,
    extractContentSlug,
    extractOrganization,
    MovieLabsIDGenerator,
    type MovieLabsIDConfig,
    type IDType,
} from './helpers/movielabs-id.generator';
export {
    extractReleaseYear,
    getWorkTypeSuffix,
    autoPopulateMECFields,
    autoPopulateMMCFields,
    createAutoPopulateConfig,
    type AutoPopulateConfig,
} from './helpers/auto-populate.helper';
export {
    validateMovieLabsID,
    validateContentID,
    validateBatchIDs,
    validateALIDExperienceMatch,
    validatePresentationReferences,
    validateAspectRatio,
    validateMECData,
    validateMMCData,
    type ValidationResult,
} from './helpers/validation.helper';
export {
    validateLanguageCode,
    validateLanguageCodes,
    validateGenreCode,
    validateGenreCodes,
    validateRatingSystem,
    getSupportedLanguages,
    getSupportedGenres,
    suggestGenres,
    suggestLanguages,
} from './helpers/language-genre-validation.helper';
