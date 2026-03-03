/**
 * CSV Data Processor
 * High-level API for converting CSV-parsed data to XML
 */

import { XMLValidator } from 'fast-xml-parser';
import { autoPopulateMECFields } from '../helpers/auto-populate.helper';
import { autofillMMCIDs } from '../helpers/mmc-id-autofill.helper';
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
        return null;
    }
};

/**
 * Convert CSV-parsed MMC data to XML string
 * @param data - CSV-parsed MMC data
 * @param organization - Organization name for auto-generating IDs (defaults to 'wiflix')
 * @returns XML string or null if validation fails
 */
export const dataToMMCXml = (data: MMCCSVData, organization: string = 'wiflix'): string | null => {
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
        return null;
    }
};

/**
 * Convert CSV-parsed Image-Only data to XML string
 * @param data - CSV-parsed Image-Only data
 * @param organization - Organization name for auto-generating fields (defaults to 'wiflix')
 * @returns XML string or null if validation fails
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
        return null;
    }
};
