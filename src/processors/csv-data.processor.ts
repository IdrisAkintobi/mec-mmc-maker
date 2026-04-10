/**
 * CSV Data Processor
 * High-level API for converting CSV-parsed data to XML
 */

import { XMLValidator } from 'fast-xml-parser';
import { autoPopulateMECFields } from '../helpers/auto-populate.helper';
import { autofillMMCIDs } from '../helpers/mmc-id-autofill.helper';
import { validateAudioType, validateSubtitleType, validateVideoType } from '../helpers/validation.helper';
import { xmlBuilder, XML_PREFIX } from '../infrastructure/xml.builder';
import { ImageOnlyMapper } from '../mappers/image-only.mapper';
import { MECMapper } from '../mappers/mec-csv.mapper';
import { MMCMapper } from '../mappers/mmc-csv.mapper';
import { ImageOnlyCSVData } from '../types/csv/image-only-parsed.type';
import { MECCSVData } from '../types/csv/mec-parsed.type';
import { MMCCSVData } from '../types/csv/mmc-parsed.type';

/**
 * Capitalize words for display (e.g., "wiflix" -> "Wiflix", "my-company" -> "My Company")
 */
function capitalizeWords(text: string): string {
    return text
        .split(/[-_\s]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

/**
 * Convert CSV-parsed MEC data to XML string
 * @param data - CSV-parsed MEC data
 * @param organization - Organization name for auto-generating fields (defaults to 'wiflix')
 * @returns XML string or null if validation fails
 * @throws Error if data processing fails
 */
export const dataToMECXml = (data: MECCSVData, organization: string = 'wiflix'): string | null => {
    try {
        // Auto-populate missing fields (ContentID, Organization, CompanyDisplayCredit, etc.)
        const dataWithDefaults = autoPopulateMECFields(data as unknown as Record<string, unknown>, {
            organization,
            organizationRole: 'licensor',
            companyDisplayCredit: capitalizeWords(organization),
            companyCreditLanguage: 'en-US',
        }) as MECCSVData;

        const objData = MECMapper.map(dataWithDefaults);
        const xmlData = XML_PREFIX + xmlBuilder.build(objData);

        // Validate XML and return xmlData if valid
        const validation = XMLValidator.validate(xmlData);
        return validation === true ? xmlData : null;
    } catch (error) {
        console.error('Error converting MEC data to XML:', error);
        throw error; // Re-throw the error instead of returning null
    }
};

/**
 * Convert CSV-parsed MMC data to XML string
 * @param data - CSV-parsed MMC data
 * @param organization - Organization name for auto-generating IDs (defaults to 'wiflix')
 * @returns XML string or null if validation fails
 * @throws Error if video/audio/subtitle type validation fails
 */
export const dataToMMCXml = (data: MMCCSVData, organization: string = 'wiflix'): string | null => {
    // Validate video types before processing
    if (data.VideoType) {
        const videoTypes = data.VideoType.split('|');
        const videoTrackIDs = data.VideoTrackID?.split('|') || [];

        const errors: string[] = [];
        videoTypes.forEach((type, index) => {
            const trimmedType = type.trim();
            const validationResult = validateVideoType(trimmedType);
            if (!validationResult.valid) {
                const trackId = videoTrackIDs[index] ? `"${videoTrackIDs[index].trim()}"` : `[${index}]`;
                errors.push(`Video track ${trackId}: ${validationResult.errors.join(', ')}`);
            }
        });

        if (errors.length > 0) {
            throw new Error(`Video validation failed: ${errors.join('; ')}`);
        }
    }

    // Validate audio types before processing
    if (data.AudioType) {
        const audioTypes = data.AudioType.split('|');
        const audioTrackIDs = data.AudioTrackID?.split('|') || [];

        const errors: string[] = [];
        audioTypes.forEach((type, index) => {
            const trimmedType = type.trim();
            const validationResult = validateAudioType(trimmedType);
            if (!validationResult.valid) {
                const trackId = audioTrackIDs[index] ? `"${audioTrackIDs[index].trim()}"` : `[${index}]`;
                errors.push(`Audio track ${trackId}: ${validationResult.errors.join(', ')}`);
            }
        });

        if (errors.length > 0) {
            throw new Error(`Audio validation failed: ${errors.join('; ')}`);
        }
    }

    // Validate subtitle types before processing
    if (data.SubtitleType) {
        const subtitleTypes = data.SubtitleType.split('|');
        const subtitleTrackIDs = data.SubtitleTrackID?.split('|') || [];

        const errors: string[] = [];
        subtitleTypes.forEach((type, index) => {
            const trimmedType = type.trim();
            const validationResult = validateSubtitleType(trimmedType);
            if (!validationResult.valid) {
                const trackId = subtitleTrackIDs[index] ? `"${subtitleTrackIDs[index].trim()}"` : `[${index}]`;
                errors.push(`Subtitle track ${trackId}: ${validationResult.errors.join(', ')}`);
            }
        });

        if (errors.length > 0) {
            throw new Error(`Subtitle validation failed: ${errors.join('; ')}`);
        }
    }

    try {
        // Auto-fill missing MMC IDs from VideoLocation
        const dataWithIDs = autofillMMCIDs(data, organization);

        const objData = MMCMapper.map(dataWithIDs);
        const xmlData = XML_PREFIX + xmlBuilder.build(objData);

        // Validate XML and return xmlData if valid
        const validation = XMLValidator.validate(xmlData);
        return validation === true ? xmlData : null;
    } catch (error) {
        console.error('Error converting MMC data to XML:', error);
        throw error; // Re-throw the error instead of returning null
    }
};

/**
 * Convert CSV-parsed Image-Only data to XML string
 * @param data - CSV-parsed Image-Only data
 * @param organization - Organization name for auto-generating fields (defaults to 'wiflix')
 * @returns XML string or null if validation fails
 * @throws Error if data processing fails
 */
export const dataToImageOnlyXml = (data: ImageOnlyCSVData, organization: string = 'wiflix'): string | null => {
    try {
        // Auto-populate missing fields
        const dataWithDefaults = autoPopulateMECFields(data as unknown as Record<string, unknown>, {
            organization,
            organizationRole: 'licensor',
            companyDisplayCredit: capitalizeWords(organization),
            companyCreditLanguage: 'en-US',
        }) as ImageOnlyCSVData;

        const objData = ImageOnlyMapper.map(dataWithDefaults);
        const xmlData = XML_PREFIX + xmlBuilder.build(objData);

        // Validate XML and return xmlData if valid
        const validation = XMLValidator.validate(xmlData);
        return validation === true ? xmlData : null;
    } catch (error) {
        console.error('Error converting Image-Only data to XML:', error);
        throw error; // Re-throw the error instead of returning null
    }
};
