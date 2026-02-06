import { XMLValidator } from 'fast-xml-parser';

export function validateXMLStructure(xml: string): boolean {
    const result = XMLValidator.validate(xml);
    return result === true;
}

export function getXMLValidationErrors(xml: string): string {
    const result = XMLValidator.validate(xml);
    if (result === true) return '';
    return result.err.msg;
}
