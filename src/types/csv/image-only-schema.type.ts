/**
 * XML schema types for Image-Only MEC content
 */

export interface ImageOnly {
    'mdmec:CoreMetadata': MdmecCoreMetadata;
}

export interface MdmecCoreMetadata {
    '@xmlns:mdmec': string;
    '@xmlns:md': string;
    '@xmlns:xsi': string;
    '@xsi:schemaLocation': string;
    'mdmec:Compatibility': MdmecCompatibility;
    'mdmec:Basic': MdmecBasic;
}

export interface MdmecCompatibility {
    'md:SpecVersion': string;
    'md:Profile': string;
}

export interface MdmecBasic {
    '@ContentID': string;
    'md:LocalizedInfo': MdLocalizedInfo[];
    'md:ReleaseYear': string;
    'md:WorkType': string;
    'md:AltIdentifier': MdAltIdentifier[];
    'md:AssociatedOrg': MdAssociatedOrg;
}

export interface MdLocalizedInfo {
    '@language': string;
    'md:ArtReference': MdArtReference[];
}

export interface MdArtReference {
    '@resolution': string;
    '@purpose': string;
    $: string;
}

export interface MdAltIdentifier {
    'md:Namespace': string;
    'md:Identifier': string;
}

export interface MdAssociatedOrg {
    '@organizationID': string;
    '@role': string;
}
