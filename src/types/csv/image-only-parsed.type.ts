/**
 * CSV-parsed Image-Only MEC data structure
 * @deprecated Use ImageOnlyCSVData instead
 */
export type ImageOnlyParsedType = ImageOnlyCSVData;

/**
 * Image-Only MEC data from CSV files
 * Used for image-only content (no video/audio)
 */
export type ImageOnlyCSVData = {
    ContentID: string;
    'LocalizedInfo:language': string;
    ArtReference: string;
    'ArtReference:resolution': string;
    'ArtReference:purpose': string;
    ReleaseYear: string;
    WorkType: string;
    'Identifier:Namespace': string;
    Identifier: string;
    OrganizationID: string;
    OrganizationRole: string;
};
