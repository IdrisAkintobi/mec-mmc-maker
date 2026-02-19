import { RelationshipTypeEnum } from './enum/domain.enums';

export type MECSchemaType = {
    'mdmec:CoreMetadata': MdmecCoreMetadata;
};

export type MdmecCoreMetadata = {
    '@xmlns:xsi': string;
    '@xmlns:md': string;
    '@xmlns:mdmec': string;
    '@xsi:schemaLocation': string;
    'mdmec:Basic': MdmecBasic;
    'mdmec:CompanyDisplayCredit': MdmecCompanyDisplayCredit;
};

export type MdmecBasic = {
    '@ContentID': string;
    'md:LocalizedInfo': MdLocalizedInfo[];
    'md:ReleaseYear': string;
    'md:ReleaseDate': string;
    'md:ReleaseHistory': MdReleaseHistory[];
    'md:WorkType': string;
    'md:AltIdentifier': MdAltIdentifier[];
    'md:RatingSet': MdRatingSet | { 'md:NotRated': string };
    'md:People': MdPerson[];
    'md:OriginalLanguage': string;
    'md:AssociatedOrg': MdAssociatedOrg;
    'md:SequenceInfo'?: MdSequenceInfo;
    'md:Parent'?: MdParent;
};

export type MdAltIdentifier = {
    'md:Namespace': string;
    'md:Identifier': string;
};

export type MdAssociatedOrg = {
    '@organizationID': string;
    '@role': string;
};

export type MdLocalizedInfo = {
    '@language': string;
    'md:TitleDisplayUnlimited'?: string;
    'md:TitleSort'?: MdSummary190Class;
    'md:ArtReference'?: MdArtReference[];
    'md:Summary190'?: MdSummary190Class;
    'md:Summary400': string;
    'md:Genre'?: MdGenre[];
};

export type MdArtReference = {
    '@resolution': string;
    '@purpose': string;
    $: string;
};

export type MdGenre = {
    '@id': string;
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type MdSummary190Class = {};

export type MdPerson = {
    'md:Job': MdJob;
    'md:Name': MdName;
};

export type MdJob = {
    'md:JobFunction': string;
    'md:BillingBlockOrder': string;
};

export type MdName = {
    'md:DisplayName': MdDisplay[];
};

export type MdDisplay = {
    '@language': string;
    $: string;
};

export type MdRatingSet = {
    'md:Rating': MdRating[];
};

export type MdRating = {
    'md:Region': MdDistrTerritoryClass;
    'md:System': string;
    'md:Value': string;
};

export type MdDistrTerritoryClass = {
    'md:country': string;
};

export type MdReleaseHistory = {
    'md:ReleaseType': string;
    'md:DistrTerritory': MdDistrTerritoryClass;
    'md:Date': string;
};

export type MdmecCompanyDisplayCredit = {
    'md:DisplayString': MdDisplay;
};

export type MdSequenceInfo = {
    'md:Number': string;
};

export type MdParent = {
    '@relationshipType': RelationshipTypeEnum;
    'md:ParentContentID': string;
};
