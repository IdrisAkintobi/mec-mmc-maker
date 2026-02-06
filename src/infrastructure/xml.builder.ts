import { XMLBuilder } from 'fast-xml-parser';

export const xmlBuilder = new XMLBuilder({
    attributeNamePrefix: '@',
    textNodeName: '$',
    ignoreAttributes: false,
    format: true,
});

export const XML_PREFIX = '<?xml version="1.0" encoding="UTF-8"?>';
