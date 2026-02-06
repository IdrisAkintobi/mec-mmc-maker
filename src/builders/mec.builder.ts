import { XML_PREFIX, xmlBuilder } from '../infrastructure/xml.builder';
import { CastMember, ContentIdentifier, Genre, LocalizedInfo, MECData, Rating, ReleaseHistory } from '../types/mec.types';


/**
 * Builder class for creating Media Entertainment Core (MEC) XML files.
 * Converts structured MECData objects into valid MEC XML format according to
 * the MovieLabs specification v2.9 for Amazon Prime Video.
 *
 * @example
 * ```typescript
 * import { MECBuilder, MECData } from 'mec-mmc-maker';
 *
 * const data: MECData = {
 *   contentId: 'content123',
 *   localizedInfo: [{ language: 'en-US', titleDisplay: 'Sample Movie' }],
 *   // ... other required fields
 * };
 *
 * const xml = MECBuilder.build(data);
 * console.log(xml); // <?xml version="1.0" encoding="UTF-8"?>...
 * ```
 */
export class MECBuilder {
    /**
     * Builds a complete MEC XML string from the provided data.
     *
     * @param data - The MEC data structure containing all required metadata
     * @returns A complete XML string with XML declaration and proper namespaces
     */
    static build(data: MECData): string {
        const xmlObj = {
            'mdmec:CoreMetadata': {
                '@xmlns:mdmec': 'http://www.movielabs.com/schema/mdmec/v2.9',
                '@xmlns:md': 'http://www.movielabs.com/schema/md/v2.9/md',
                '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
                '@xsi:schemaLocation': 'http://www.movielabs.com/schema/mdmec/v2.9 ../mdmec-v2.9.xsd',
                'mdmec:Basic': this.buildBasicMetadata(data),
            },
        };

        return XML_PREFIX + xmlBuilder.build(xmlObj);
    }

    private static buildBasicMetadata(data: MECData) {
        return {
            '@ContentID': data.contentId,
            'md:LocalizedInfo': this.buildLocalizedInfo(data.localizedInfo, data.genre),
            'md:ReleaseYear': data.releaseYear,
            'md:ReleaseDate': data.releaseDate,
            'md:ReleaseHistory': this.buildReleaseHistory(data.releaseHistory),
            'md:WorkType': data.workType,
            'md:AltIdentifier': this.buildIdentifiers(data.identifier),
            ...(data.rating && { 'md:RatingSet': this.buildRatings(data.rating) }),
            'md:People': this.buildCastMembers(data.cast),
            'md:OriginalLanguage': data.originalLanguage,
            'md:AssociatedOrg': {
                '@organizationID': data.organization.id,
                '@role': data.organization.role,
            },
            'mdmec:CompanyDisplayCredit': {
                'md:DisplayString': {
                    '@language': data.companyDisplayCredit.language,
                    $: data.companyDisplayCredit.value,
                },
            },
            ...(data.category && {
                'md:Parent': {
                    '@relationshipType': this.getRelationshipType(data.category.type),
                    'md:ParentContentID': data.category.parentContentId,
                },
                ...(data.category.sequenceNumber && {
                    'md:SequenceInfo': {
                        'md:Number': data.category.sequenceNumber,
                    },
                }),
            }),
        };
    }

    private static buildLocalizedInfo(localizedInfo: LocalizedInfo[], genre: Genre[]) {
        return localizedInfo.map((info, index) => ({
            '@language': info.language,
            'md:TitleDisplayUnlimited': info.titleDisplay,
            ...(info.titleSort && { 'md:TitleSort': info.titleSort }),
            ...(info.summary190 && { 'md:Summary190': info.summary190 }),
            ...(info.summary400 && { 'md:Summary400': info.summary400 }),
            ...(info.artReference && {
                'md:ArtReference': info.artReference.map(art => ({
                    '@resolution': art.resolution,
                    '@purpose': art.purpose,
                    $: art.reference,
                })),
            }),
            // Add genre only to the first localized info (default language)
            ...(index === 0 && genre.length > 0 && { 'md:Genre': this.buildGenre(genre) }),
        }));
    }

    private static buildReleaseHistory(history: ReleaseHistory[]) {
        return history.map(item => ({
            'md:ReleaseType': item.type,
            'md:DistrTerritory': {
                'md:country': item.country,
            },
            'md:Date': item.date,
        }));
    }

    private static buildIdentifiers(identifiers: ContentIdentifier[]) {
        return identifiers.map(id => ({
            'md:Namespace': id.namespace,
            'md:Identifier': id.value,
        }));
    }

    private static buildRatings(ratings: Rating[]) {
        return {
            'md:Rating': ratings.map(rating => ({
                'md:Region': {
                    'md:country': rating.country,
                },
                'md:System': rating.system,
                'md:Value': rating.value,
            })),
        };
    }

    private static buildCastMembers(cast: CastMember[]) {
        return {
            'md:Person': cast.map(member => ({
                'md:Job': {
                    'md:JobFunction': member.jobFunction,
                    'md:BillingBlockOrder': member.billingBlockOrder,
                },
                'md:Name': {
                    'md:DisplayName': Object.entries(member.displayName).map(([lang, name]) => ({
                        '@language': lang,
                        $: name,
                    })),
                },
            })),
        };
    }

    private static getRelationshipType(category: string): string {
        const relationshipMap = {
            Episode: 'isepisodeof',
            Season: 'isseasonof',
            Promotion: 'ispromotionfor',
        };
        return relationshipMap[category as keyof typeof relationshipMap] || '';
    }

    private static buildGenre(genres: Genre[]): Array<{ '@id': string }> {
        const MAX_GENRE = 3;
        const genreArray: Array<{ '@id': string }> = [];
        let genreCount = 0;

        for (const genre of genres) {
            if (genreCount >= MAX_GENRE) break;

            // Add primary genre
            genreArray.push({
                '@id': `av_genre_${genre.primary}`,
            });
            genreCount++;

            // Add subgenres if available
            if (genre.subGenre && genreCount < MAX_GENRE) {
                for (const subGenre of genre.subGenre) {
                    if (genreCount >= MAX_GENRE) break;
                    genreArray.push({
                        '@id': `av_subgenre_${subGenre}`,
                    });
                    genreCount++;
                }
            }
        }

        return genreArray;
    }
}
