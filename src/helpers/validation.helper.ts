/**
 * Validation utilities for MovieLabs IDs and Amazon Prime Video compliance
 */

/**
 * Validation result interface
 */
export interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}

/**
 * MEC data interface
 */
export interface MECData {
    ContentID?: string;
    TitleDisplay?: string;
    ReleaseDate?: string;
    WorkType?: string;
    Identifier?: string;
    OrganizationID?: string;
    [key: string]: string | undefined;
}

/**
 * MMC data interface
 */
export interface MMCData {
    VideoTrackID?: string;
    AudioTrackID?: string;
    WidthPixels?: number;
    HeightPixels?: number;
    AspectRatio?: string;
    ALID?: string;
    ExperienceID?: string;
    [key: string]: string | number | undefined;
}

/**
 * Valid MovieLabs ID types
 */
const VALID_ID_TYPES = [
    'cid',
    'vidtrackid',
    'audtrackid',
    'subtitletrackid',
    'imageid',
    'presentationid',
    'experienceid',
    'ALID',
    'picturegroupid',
    'playablesequenceid',
];

/**
 * Valid identifier schemes
 */
const VALID_SCHEMES = ['org', 'eidr-x'];

/**
 * Validate MovieLabs ID format
 * Format: md:{type}:{scheme}:{organization}:{content}:{additional}
 *
 * @param id - The ID to validate
 * @returns Validation result
 *
 * @example
 * validateMovieLabsID("md:cid:org:wiflix:Chioma")
 * // { valid: true, errors: [], warnings: [] }
 *
 * validateMovieLabsID("invalid:id")
 * // { valid: false, errors: ["Invalid ID format"], warnings: [] }
 */
export function validateMovieLabsID(id: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if ID is provided
    if (!id || typeof id !== 'string') {
        return {
            valid: false,
            errors: ['ID is required and must be a string'],
            warnings,
        };
    }

    const parts = id.split(':');

    // Check minimum parts (md:type:scheme:organization:content)
    if (parts.length < 5) {
        errors.push(
            `Invalid ID format. Expected at least 5 parts, got ${parts.length}`,
            `Format should be: md:type:scheme:organization:content[:additional]`,
        );
        return { valid: false, errors, warnings };
    }

    // Validate namespace (always "md")
    if (parts[0] !== 'md') {
        errors.push(`Invalid namespace: "${parts[0]}". Must be "md"`);
    }

    // Validate type
    const type = parts[1];
    if (!VALID_ID_TYPES.includes(type)) {
        errors.push(`Invalid ID type: "${type}". Valid types: ${VALID_ID_TYPES.join(', ')}`);
    }

    // Validate scheme
    const scheme = parts[2];
    if (!VALID_SCHEMES.includes(scheme)) {
        errors.push(`Invalid scheme: "${scheme}". Valid schemes: ${VALID_SCHEMES.join(', ')}`);
    }

    // Validate organization (not empty)
    const organization = parts[3];
    if (!organization || organization.trim() === '') {
        errors.push('Organization/Business Alias is required');
    }

    // Validate content identifier (not empty)
    const content = parts[4];
    if (!content || content.trim() === '') {
        errors.push('Content identifier is required');
    }

    // Check for special characters in content ID (basic validation)
    if (content && /[<>:"\\|?*]/.test(content)) {
        warnings.push('Content ID contains special characters that may cause issues');
    }

    // Scheme-specific validation
    if (scheme === 'eidr-x' && parts.length < 6) {
        warnings.push('EIDR scheme typically requires additional information (partner alias after EIDR)');
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
}

/**
 * Validate ContentID format
 * @param contentID - Content ID to validate
 * @returns Validation result
 */
export function validateContentID(contentID: string): ValidationResult {
    const result = validateMovieLabsID(contentID);

    // Additional ContentID-specific checks
    const parts = contentID.split(':');
    if (parts.length >= 2 && parts[1] !== 'cid') {
        result.errors.push(`ContentID must have type "cid", got "${parts[1]}"`);
        result.valid = false;
    }

    return result;
}

/**
 * Validate batch of IDs
 * @param ids - Array of IDs to validate
 * @param idName - Name of the ID type for error messages
 * @returns Validation result
 */
export function validateBatchIDs(ids: string[], idName: string = 'ID'): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!Array.isArray(ids) || ids.length === 0) {
        return {
            valid: false,
            errors: [`${idName} array is empty or invalid`],
            warnings,
        };
    }

    ids.forEach((id, index) => {
        const result = validateMovieLabsID(id);
        if (!result.valid) {
            errors.push(`${idName}[${index}]: ${result.errors.join(', ')}`);
        }
        warnings.push(...result.warnings.map(w => `${idName}[${index}]: ${w}`));
    });

    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
}

/**
 * Validate ALID and ExperienceID match
 * According to Amazon: "The ALID... should match the AltID in the avail"
 *
 * @param alid - ALID value
 * @param experienceID - Experience ID value
 * @returns Validation result
 */
export function validateALIDExperienceMatch(alid: string, experienceID: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate individual IDs first
    const alidResult = validateMovieLabsID(alid);
    const expResult = validateMovieLabsID(experienceID);

    if (!alidResult.valid) {
        errors.push(...alidResult.errors.map(e => `ALID: ${e}`));
    }
    if (!expResult.valid) {
        errors.push(...expResult.errors.map(e => `ExperienceID: ${e}`));
    }

    if (errors.length > 0) {
        return { valid: false, errors, warnings };
    }

    // Extract content slugs
    const alidParts = alid.split(':');
    const expParts = experienceID.split(':');

    // Get org:content (parts 3 and 4, excluding any suffixes)
    const alidContent = alidParts.slice(3, 5).join(':'); // org:content
    const expContent = expParts.slice(3, 5).join(':'); // org:content

    // Check if they match
    if (alidContent !== expContent) {
        errors.push(`ALID and ExperienceID content don't match. ALID: "${alidContent}", ExperienceID: "${expContent}"`);
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
}

/**
 * Validate presentation track references
 * Ensures PresentationIDVid references a valid VideoTrackID, etc.
 *
 * @param videoTrackIDs - Array of video track IDs from inventory
 * @param audioTrackIDs - Array of audio track IDs from inventory
 * @param presentationVidRefs - Array of video references in presentations
 * @param presentationAudRefs - Array of audio references in presentations
 * @returns Validation result
 */
export function validatePresentationReferences(
    videoTrackIDs: string[],
    audioTrackIDs: string[],
    presentationVidRefs: string[],
    presentationAudRefs: string[],
): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check video references
    presentationVidRefs.forEach((ref, index) => {
        if (ref && !videoTrackIDs.includes(ref)) {
            errors.push(`PresentationIDVid[${index}] references unknown VideoTrackID: "${ref}"`);
        }
    });

    // Check audio references
    presentationAudRefs.forEach((ref, index) => {
        if (ref && !audioTrackIDs.includes(ref)) {
            errors.push(`PresentationIDAud[${index}] references unknown AudioTrackID: "${ref}"`);
        }
    });

    // Warn if no audio
    if (audioTrackIDs.length === 0 && presentationAudRefs.some(Boolean)) {
        warnings.push('Audio track references provided but no audio tracks in inventory');
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
}

/**
 * Validate aspect ratio format
 * @param aspectRatio - Aspect ratio string (e.g., "16:9")
 * @returns Validation result
 */
export function validateAspectRatio(aspectRatio: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!aspectRatio || typeof aspectRatio !== 'string') {
        return {
            valid: false,
            errors: ['Aspect ratio is required'],
            warnings,
        };
    }

    // Check format (should be "width:height")
    const parts = aspectRatio.split(':');
    if (parts.length !== 2) {
        errors.push(`Invalid aspect ratio format: "${aspectRatio}". Expected format: "width:height" (e.g., "16:9")`);
        return { valid: false, errors, warnings };
    }

    const [width, height] = parts.map(p => Number.parseInt(p, 10));

    if (Number.isNaN(width) || Number.isNaN(height)) {
        errors.push(`Aspect ratio must contain numbers: "${aspectRatio}"`);
    }

    if (width <= 0 || height <= 0) {
        errors.push(`Aspect ratio values must be positive: "${aspectRatio}"`);
    }

    // Common aspect ratios check
    const common = ['16:9', '4:3', '21:9', '2.39:1', '1.85:1', '3:4', '9:16'];
    if (!errors.length && !common.includes(aspectRatio)) {
        warnings.push(`Unusual aspect ratio: "${aspectRatio}". Common ratios: ${common.join(', ')}`);
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
}

/**
 * Validate complete MEC data
 * @param data - MEC data object
 * @returns Validation result
 */
export function validateMECData(data: MECData): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    const requiredFields = ['ContentID', 'TitleDisplay', 'ReleaseDate', 'WorkType', 'Identifier', 'OrganizationID'];

    requiredFields.forEach(field => {
        if (!data[field]) {
            errors.push(`Required field missing: ${field}`);
        }
    });

    // Validate ContentID format
    if (data.ContentID) {
        const idResult = validateContentID(data.ContentID);
        errors.push(...idResult.errors);
        warnings.push(...idResult.warnings);
    }

    // Validate release date format (YYYY-MM-DD)
    if (data.ReleaseDate && !/^\d{4}-\d{2}-\d{2}$/.test(data.ReleaseDate)) {
        errors.push(`Invalid ReleaseDate format: "${data.ReleaseDate}". Expected YYYY-MM-DD`);
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
}

/**
 * Validate complete MMC data
 * @param data - MMC data object
 * @returns Validation result
 */
export function validateMMCData(data: MMCData): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate track IDs
    if (data.VideoTrackID) {
        const vidResult = validateMovieLabsID(data.VideoTrackID);
        if (!vidResult.valid) {
            errors.push(...vidResult.errors.map(e => `VideoTrackID: ${e}`));
        }
    } else {
        errors.push('VideoTrackID is required');
    }

    // Validate dimensions
    if (!data.WidthPixels || !data.HeightPixels) {
        errors.push('WidthPixels and HeightPixels are required');
    }

    // Validate aspect ratio if provided
    if (data.AspectRatio) {
        const arResult = validateAspectRatio(data.AspectRatio);
        errors.push(...arResult.errors);
        warnings.push(...arResult.warnings);
    }

    // Validate ALID and Experience match
    if (data.ALID && data.ExperienceID) {
        const matchResult = validateALIDExperienceMatch(data.ALID, data.ExperienceID);
        errors.push(...matchResult.errors);
        warnings.push(...matchResult.warnings);
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
}
