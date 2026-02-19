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

// CSV Types
export { type MECCSVData, type mecParsedType } from './types/csv/mec-parsed.type';
export { type MMCCSVData, type mmcParsedType } from './types/csv/mmc-parsed.type';
export { type ImageOnlyCSVData, type ImageOnlyParsedType } from './types/csv/image-only-parsed.type';
export { type CategoryEnum as Category } from './types/csv/mec-parsed.type';

// Legacy exports for backward compatibility
export { type MECCSVData as mecDataType } from './types/csv/mec-parsed.type';
export { type MMCCSVData as mmcDataType } from './types/csv/mmc-parsed.type';
export { type ImageOnlyCSVData as ImageOnlyDataType } from './types/csv/image-only-parsed.type';

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
    titleToSlug,
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

// CSV Utilities
export { extractContentSlugFromURL } from './helpers/content-slug-extractor.helper';
export { autofillMMCIDs, type MMCDataWithIDs } from './helpers/mmc-id-autofill.helper';
export { safeSplit, hasValues } from './helpers/safe-split.helper';

// CSV Data Processors (for backward compatibility with mdmec-xml-maker)
export { dataToMECXml, dataToMMCXml, dataToImageOnlyXml } from './processors/csv-data.processor';
