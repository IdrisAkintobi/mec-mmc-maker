import { MECBuilder } from '../src/builders/mec.builder';
import { MMCBuilder } from '../src/builders/mmc.builder';
import { getXMLValidationErrors, validateXMLStructure } from '../src/helpers/xml-validator';
import { sampleMECData } from './sample-data/mec-sample';
import { sampleMMCData } from './sample-data/mmc-sample';

describe('XML Validation', () => {
    it('should generate valid XML for MEC', () => {
        const xml = MECBuilder.build(sampleMECData);
        expect(validateXMLStructure(xml)).toBe(true);
        expect(getXMLValidationErrors(xml)).toBe('');
    });

    it('should generate valid XML for MMC', () => {
        const xml = MMCBuilder.build(sampleMMCData);
        expect(validateXMLStructure(xml)).toBe(true);
        expect(getXMLValidationErrors(xml)).toBe('');
    });
});
