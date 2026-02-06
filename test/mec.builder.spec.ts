import { MECBuilder } from '../src/builders/mec.builder';
import { CategoryEnum, CategoryInfo, MECData, ReleaseType } from '../src/types/mec.types';
import { sampleMECData as sampleData } from './sample-data/mec-sample';

describe('MECBuilder', () => {
    let sampleMECData: MECData;

    beforeEach(() => {
        // Setup sample data before each test
        sampleMECData = { ...sampleData };
    });

    describe('Basic XML Structure', () => {
        it('should build valid MEC XML', () => {
            const xml = MECBuilder.build(sampleMECData);

            // Basic XML structure checks
            expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
            expect(xml).toContain('<mdmec:CoreMetadata');
            expect(xml).toContain('xmlns:mdmec="http://www.movielabs.com/schema/mdmec/v2.9"');

            // Content checks
            expect(xml).toContain(`ContentID="content123"`);
            expect(xml).toContain('<md:TitleDisplayUnlimited>Sample Title</md:TitleDisplayUnlimited>');
            expect(xml).toContain('<md:ReleaseYear>2023</md:ReleaseYear>');
        });

        it('should include all required XML namespaces', () => {
            const xml = MECBuilder.build(sampleMECData);

            expect(xml).toContain('xmlns:mdmec="http://www.movielabs.com/schema/mdmec/v2.9"');
            expect(xml).toContain('xmlns:md="http://www.movielabs.com/schema/md/v2.9/md"');
            expect(xml).toContain('xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"');
        });

        it('should maintain proper XML nesting structure', () => {
            const xml = MECBuilder.build(sampleMECData);

            expect(xml).toMatch(/<mdmec:CoreMetadata[^>]*>[\s\S]*<mdmec:Basic[^>]*>/);
            expect(xml).toMatch(/<mdmec:Basic[^>]*>[\s\S]*<\/mdmec:Basic>/);
        });

        it('should handle optional fields correctly', () => {
            // Remove optional fields
            const minimalData = { ...sampleMECData };
            delete minimalData.rating;
            delete minimalData.category;

            const xml = MECBuilder.build(minimalData);

            expect(xml).not.toContain('<md:RatingSet>');
            expect(xml).not.toContain('<md:Parent>');
            expect(xml).not.toContain('<md:SequenceInfo>');
        });
    });

    describe('LocalizedInfo Handling', () => {
        it('should build localized info correctly', () => {
            const xml = MECBuilder.build(sampleMECData);

            expect(xml).toContain('language="en-US"');
            expect(xml).toContain('language="es-ES"');
            expect(xml).toContain('<md:TitleDisplayUnlimited>Sample Title</md:TitleDisplayUnlimited>');
            expect(xml).toContain('<md:TitleDisplayUnlimited>Título de Muestra</md:TitleDisplayUnlimited>');
        });

        it('should handle multiple languages correctly', () => {
            sampleMECData.localizedInfo.push({
                language: 'ja-JP',
                titleDisplay: '日本語タイトル',
                titleSort: '日本語タイトル',
                summary190: '概要',
            });

            const xml = MECBuilder.build(sampleMECData);
            expect(xml).toContain('language="ja-JP"');
            expect(xml).toContain('日本語タイトル');
            expect(xml).toContain('概要');
        });

        it('should handle special characters in text fields', () => {
            sampleMECData.localizedInfo[0].titleDisplay = 'Title & Special < > Characters';
            const xml = MECBuilder.build(sampleMECData);
            expect(xml).toContain('Title &amp; Special &lt; &gt; Characters');
        });
    });

    describe('Release History', () => {
        it('should handle multiple release types', () => {
            sampleMECData.releaseHistory = [
                {
                    type: ReleaseType.Theatrical,
                    country: 'US',
                    date: '2023-12-25',
                },
                {
                    type: ReleaseType.DVD,
                    country: 'US',
                    date: '2024-03-15',
                },
                {
                    type: ReleaseType.SVOD,
                    country: 'US',
                    date: '2024-06-01',
                },
            ];

            const xml = MECBuilder.build(sampleMECData);
            expect(xml).toContain(ReleaseType.Theatrical);
            expect(xml).toContain(ReleaseType.DVD);
            expect(xml).toContain(ReleaseType.SVOD);
            expect(xml).toContain('2024-03-15');
            expect(xml).toContain('2024-06-01');
        });
    });

    describe('Cast Information', () => {
        it('should build cast members correctly', () => {
            const xml = MECBuilder.build(sampleMECData);

            expect(xml).toContain('<md:JobFunction>Actor</md:JobFunction>');
            expect(xml).toContain('<md:BillingBlockOrder>1</md:BillingBlockOrder>');
            expect(xml).toContain('language="en-US">John Doe</md:DisplayName>');
            expect(xml).toContain('language="es-ES">Juan Pérez</md:DisplayName>');
        });

        it('should handle multiple cast members with different roles', () => {
            sampleMECData.cast = [
                {
                    jobFunction: 'Director',
                    billingBlockOrder: '1',
                    displayName: {
                        'en-US': 'Jane Director',
                        'es-ES': 'Jane Directora',
                    },
                },
                {
                    jobFunction: 'Actor',
                    billingBlockOrder: '2',
                    displayName: {
                        'en-US': 'John Actor',
                        'es-ES': 'Juan Actor',
                    },
                },
                {
                    jobFunction: 'Producer',
                    billingBlockOrder: '3',
                    displayName: {
                        'en-US': 'Bob Producer',
                    },
                },
            ];

            const xml = MECBuilder.build(sampleMECData);
            expect(xml).toContain('<md:JobFunction>Director</md:JobFunction>');
            expect(xml).toContain('<md:JobFunction>Actor</md:JobFunction>');
            expect(xml).toContain('<md:JobFunction>Producer</md:JobFunction>');
            expect(xml).toContain('Jane Directora');
            expect(xml).toContain('Juan Actor');
        });
    });

    describe('Category and Sequence', () => {
        it('should handle different category types correctly', () => {
            const categories = [
                { type: CategoryEnum.Episode, parentContentId: 'series123', sequenceNumber: '5' },
                { type: CategoryEnum.Season, parentContentId: 'series456', sequenceNumber: '2' },
                { type: CategoryEnum.Series, parentContentId: null, sequenceNumber: null },
            ];

            for (const cat of categories) {
                sampleMECData.category = cat as CategoryInfo;
                const xml = MECBuilder.build(sampleMECData);

                if (cat.parentContentId) {
                    expect(xml).toContain(`<md:ParentContentID>${cat.parentContentId}</md:ParentContentID>`);
                }
                if (cat.sequenceNumber) {
                    expect(xml).toContain(`<md:Number>${cat.sequenceNumber}</md:Number>`);
                }
            }
        });
    });

    describe('Genre Handling', () => {
        it('should build genres correctly', () => {
            const xml = MECBuilder.build(sampleMECData);

            expect(xml).toContain('id="av_genre_Action"');
            expect(xml).toContain('id="av_subgenre_Adventure"');
            expect(xml).toContain('id="av_subgenre_Thriller"');
        });

        it('should limit genres to maximum of 3', () => {
            sampleMECData.genre = [
                {
                    primary: 'Action',
                    subGenre: ['Adventure', 'Thriller', 'Drama', 'Comedy'],
                },
            ];

            const xml = MECBuilder.build(sampleMECData);

            // Should have exactly 3 genres (1 primary + 2 subgenres)
            const genreMatches = xml.match(/id="av_(genre|subgenre)_/g);
            expect(genreMatches?.length).toBe(3);
        });

        it('should handle multiple primary genres with subgenres', () => {
            sampleMECData.genre = [
                {
                    primary: 'Action',
                    subGenre: ['Adventure'],
                },
                {
                    primary: 'Drama',
                },
            ];

            const xml = MECBuilder.build(sampleMECData);

            expect(xml).toContain('id="av_genre_Action"');
            expect(xml).toContain('id="av_subgenre_Adventure"');
            expect(xml).toContain('id="av_genre_Drama"');
        });

        it('should only add genres to first localized info', () => {
            const xml = MECBuilder.build(sampleMECData);

            // Count how many LocalizedInfo blocks contain Genre
            const localizedInfoBlocks = xml.split('<md:LocalizedInfo');
            const blocksWithGenre = localizedInfoBlocks.filter(block => block.includes('md:Genre'));

            // Only the first LocalizedInfo should have Genre
            expect(blocksWithGenre.length).toBe(1);
        });
    });
});
