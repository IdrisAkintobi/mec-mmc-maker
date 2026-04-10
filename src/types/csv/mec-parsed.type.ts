/**
 * CSV-parsed MEC data structure
 * Used for CSV upload workflows where data is flat with semicolon-delimited arrays
 */

export type ReleaseType =
    | 'Original'
    | 'Broadcast'
    | 'DVD'
    | 'Blu-ray'
    | 'PayTV'
    | 'InternetBuy'
    | 'InternetRent'
    | 'Theatrical'
    | 'SVOD';

export type WorkType = 'movie' | 'episode' | 'promotion' | 'season' | 'series' | 'supplemental';

export type RelationshipType = 'isepisodeof' | 'isseasonof' | 'ispromotionfor';

export type NamespaceType = 'EIDR' | 'ISAN' | 'IMDB' | 'ORG';

export type CategoryEnum = 'episode' | 'season';

/**
 * CSV-parsed MEC data structure
 * @deprecated Use MECCSVData instead
 */
export type mecParsedType = MECCSVData;

/**
 * MEC data from CSV files
 * Flat structure with semicolon-delimited arrays
 */
export type MECCSVData = {
    ContentID: string;

    /**
     * These must be of the same length
     * E,g en-US;en-GB, title01;title02 ...
     */
    //LocalizedInfo - [Array] - separator('|')
    'LocalizedInfo:language': string;
    TitleDisplay: string;
    Summary190: string;
    Summary400: string;

    /**
     * These must be of the same length
     * E,g ArtReference01;ArtReference02, 4:3;6:9, cover;hero
     */
    //ArtReference - [Array] - separator('|')
    ArtReference: string;
    'ArtReference:resolution': string;
    'ArtReference:purpose': string;

    //LocalizedInfo - [Array] - separator('|') //Additional subGenre are separated using '||'
    Genre: string;

    ReleaseYear: string;
    ReleaseDate: string;

    /**
     * These must be of the same length
     * E,g Theatre;Cinema, Nigeria;Ghana, 11-11-2001;11-11-2000
     * @optional If not provided, only ReleaseDate will be used
     */
    //ReleaseHistory - [Array] - separator('|')
    'ReleaseHistory:Type'?: string;
    'ReleaseHistory:Country'?: string;
    'ReleaseHistory:Date'?: string;

    WorkType: string;

    /**
     * These must be of the same length
     * E,g Amazon, movie001
     * @optional Will default to ORG namespace with ContentID-derived identifier
     */
    //Identifier - [Array] - separator('|')
    'Identifier:Namespace'?: string;
    Identifier?: string;

    // yes or no
    Rating: string;

    /**
     * These must be of the same length
     * E,g US;NG, MPAA;NFVB, PG-13;18
     * @optional Only required if Rating is "Yes"
     */
    //Rating - [Array] - separator('|')
    'Rating:Country'?: string;
    'Rating:System'?: string;
    'Rating:Value'?: string;

    /**
     * These must be of the same length
     * E,g Actor;Writer, 1;1, en-US;
     * the number of Cast:DisplayName:OtherLanguages will be the length of Cast:DisplayName:language - 1 (which is the default en-US)
     * @optional Can be omitted if cast information is not available
     */
    //People - [Array] - separator('|')
    'Cast:JobFunction'?: string;
    'Cast:BillingBlockOrder'?: string;
    'Cast:DisplayName:language'?: string;
    'Cast:DisplayName'?: string;
    [key: string]: string | undefined; //This is for other languages. e,g Cast:DisplayName:ja-JP

    OriginalLanguage: string;
    OrganizationID: string;
    OrganizationRole: string;
    CompanyDisplayCredit: string;
    'CompanyDisplayCredit:language': string;

    /**
     * @optional Only required for episodic content (episodes, seasons)
     * Note: ParentContentID and SequenceNumber are automatically determined from WorkType.
     * If WorkType is 'episode' or 'season', these fields are required.
     */
    /**
     * @deprecated Category field is no longer needed. Use WorkType instead.
     * The system automatically determines parent/sequence requirements from WorkType.
     */
    Category?: CategoryEnum;
    SequenceNumber?: string;
    ParentContentID?: string;
};
