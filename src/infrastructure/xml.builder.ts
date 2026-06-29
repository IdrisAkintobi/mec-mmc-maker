import { XMLBuilder } from 'fast-xml-parser';

export const xmlBuilder = new XMLBuilder({
    attributeNamePrefix: '@',
    textNodeName: '$',
    ignoreAttributes: false,
    format: true,
    // Keep `attr="true"` intact (e.g. md:Type dubbed="true"); the default collapses it to `attr`.
    suppressBooleanAttributes: false,
});

export const XML_PREFIX = '<?xml version="1.0" encoding="UTF-8"?>';
