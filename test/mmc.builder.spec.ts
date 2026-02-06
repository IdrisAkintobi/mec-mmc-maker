import { MMCBuilder } from '../src/builders/mmc.builder';
import { validateXMLStructure } from '../src/helpers/xml-validator';
import { ExperienceType, MMCData } from '../src/types/mmc.types';
import { sampleMMCData as sampleData } from './sample-data/mmc-sample';

describe('MMCBuilder', () => {
    let sampleMMCData: MMCData;

    beforeEach(() => {
        sampleMMCData = { ...sampleData };
    });

    describe('XML Validation', () => {
        it('should generate valid XML with all optional fields', () => {
            const xml = MMCBuilder.build(sampleMMCData);
            expect(validateXMLStructure(xml)).toBe(true);
        });

        it('should generate valid XML with minimum required fields', () => {
            const minimalData = {
                audio: [sampleMMCData.audio[0]],
                video: [sampleMMCData.video[0]],
                presentation: [sampleMMCData.presentation[0]],
                experience: [sampleMMCData.experience[0]],
                alidExperience: [sampleMMCData.alidExperience[0]],
            };

            const xml = MMCBuilder.build(minimalData);
            expect(validateXMLStructure(xml)).toBe(true);
        });

        it('should build valid MMC XML', () => {
            const xml = MMCBuilder.build(sampleMMCData);

            expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
            expect(xml).toContain('<manifest:MediaManifest');
            expect(xml).toContain('xmlns:manifest="http://www.movielabs.com/schema/manifest/v1.9/manifest"');
        });

        it('should build inventory correctly', () => {
            const xml = MMCBuilder.build(sampleMMCData);

            // Audio checks
            expect(xml).toContain('AudioTrackID="audio1"');
            expect(xml).toContain('<md:Type>Primary</md:Type>');
            expect(xml).toContain('<manifest:ContainerLocation>path/to/audio.mp4</manifest:ContainerLocation>');

            // Video checks
            expect(xml).toContain('VideoTrackID="video1"');
            expect(xml).toContain('<md:WidthPixels>1920</md:WidthPixels>');
            expect(xml).toContain('<md:HeightPixels>1080</md:HeightPixels>');

            // Subtitle checks
            expect(xml).toContain('SubtitleTrackID="sub1"');
            expect(xml).toContain('<manifest:FrameRate>24</manifest:FrameRate>');
        });

        it('should build presentations correctly', () => {
            const xml = MMCBuilder.build(sampleMMCData);

            expect(xml).toContain('PresentationID="pres1"');
            expect(xml).toContain('<manifest:TrackSelectionNumber>1</manifest:TrackSelectionNumber>');
            expect(xml).toContain('<manifest:VideoTrackReference>video1</manifest:VideoTrackReference>');
        });

        it('should handle optional picture groups correctly', () => {
            const dataWithoutPictureGroups = { ...sampleMMCData };
            delete dataWithoutPictureGroups.pictureGroup;

            const xml = MMCBuilder.build(dataWithoutPictureGroups);
            expect(xml).not.toContain('<manifest:PictureGroups>');
        });

        it('should build experiences correctly', () => {
            const xml = MMCBuilder.build(sampleMMCData);

            expect(xml).toContain('ExperienceID="exp1"');
            expect(xml).toContain('<manifest:Type>Movie</manifest:Type>');
            expect(xml).toContain('<manifest:SubType>Feature</manifest:SubType>');
            expect(xml).toContain('<manifest:Relationship>Trailer</manifest:Relationship>');
        });

        it('should build ALID maps correctly', () => {
            const xml = MMCBuilder.build(sampleMMCData);

            expect(xml).toContain('<manifest:ALID>alid1</manifest:ALID>');
            expect(xml).toContain('<manifest:ExperienceID>exp1</manifest:ExperienceID>');
        });
    });

    describe('Audio Tracks', () => {
        it('should handle multiple audio tracks with different languages', () => {
            sampleMMCData.audio = [
                {
                    trackId: 'audio_en',
                    type: 'Primary',
                    language: 'en',
                    location: 'path/to/audio_en.mp4',
                    hash: 'hash123',
                },
                {
                    trackId: 'audio_es',
                    type: 'Primary',
                    language: 'es',
                    location: 'path/to/audio_es.mp4',
                    hash: 'hash456',
                },
                {
                    trackId: 'audio_commentary',
                    type: 'Commentary',
                    language: 'en',
                    location: 'path/to/commentary.mp4',
                    hash: 'hash789',
                },
            ];

            const xml = MMCBuilder.build(sampleMMCData);
            expect(xml).toContain('audio_en');
            expect(xml).toContain('audio_es');
            expect(xml).toContain('audio_commentary');
            expect(xml).toContain('Commentary');
        });

        it('should handle audio tracks without optional hash', () => {
            sampleMMCData.audio = [
                {
                    trackId: 'audio1',
                    type: 'Primary',
                    language: 'en',
                    location: 'path/to/audio.mp4',
                },
            ];

            const xml = MMCBuilder.build(sampleMMCData);
            expect(xml).toContain('audio1');
        });
    });

    describe('Video Tracks', () => {
        it('should handle multiple video qualities', () => {
            sampleMMCData.video = [
                {
                    trackId: 'video_hd',
                    type: 'Primary',
                    language: 'en',
                    location: 'path/to/video_hd.mp4',
                    hash: 'hash123',
                    picture: {
                        heightPixels: '1080',
                        widthPixels: '1920',
                        aspectRatio: '16:9',
                        progressive: true,
                    },
                },
                {
                    trackId: 'video_sd',
                    type: 'Primary',
                    language: 'en',
                    location: 'path/to/video_sd.mp4',
                    hash: 'hash456',
                    picture: {
                        heightPixels: '480',
                        widthPixels: '854',
                        aspectRatio: '16:9',
                        progressive: false,
                    },
                },
            ];

            const xml = MMCBuilder.build(sampleMMCData);
            expect(xml).toContain('1920');
            expect(xml).toContain('1080');
            expect(xml).toContain('854');
            expect(xml).toContain('480');
        });
    });

    describe('Subtitle Tracks', () => {
        it('should handle multiple subtitle formats and languages', () => {
            sampleMMCData.subtitle = [
                {
                    trackId: 'sub_en_cc',
                    type: 'ClosedCaption',
                    language: 'en',
                    location: 'path/to/cc_en.srt',
                    hash: 'hash123',
                    frameRate: '24',
                    frameRateMultiplier: '1000/1001',
                    frameRateTimeCode: 'true',
                },
                {
                    trackId: 'sub_es',
                    type: 'Normal',
                    language: 'es',
                    location: 'path/to/sub_es.srt',
                    hash: 'hash456',
                    frameRate: '24',
                    frameRateMultiplier: '1000/1001',
                    frameRateTimeCode: 'true',
                },
            ];

            const xml = MMCBuilder.build(sampleMMCData);
            expect(xml).toContain('ClosedCaption');
            expect(xml).toContain('Normal');
            expect(xml).toContain('sub_en_cc');
            expect(xml).toContain('sub_es');
        });
    });

    describe('Picture Groups', () => {
        it('should handle multiple picture groups with various images', () => {
            sampleMMCData.pictureGroup = [
                {
                    id: 'marketing',
                    imageIds: ['cover', 'hero', 'thumbnail'],
                },
                {
                    id: 'production',
                    imageIds: ['still1', 'still2', 'still3'],
                },
            ];

            const xml = MMCBuilder.build(sampleMMCData);
            expect(xml).toContain('marketing');
            expect(xml).toContain('production');
            expect(xml).toContain('cover');
            expect(xml).toContain('still1');
        });
    });

    describe('Experiences', () => {
        it('should handle nested experiences correctly', () => {
            sampleMMCData.experience = [
                {
                    id: 'main_movie',
                    type: ExperienceType.Movie,
                    subType: 'Feature',
                    child: {
                        id: 'trailer',
                        relationship: 'Trailer',
                    },
                },
                {
                    id: 'trailer',
                    type: ExperienceType.Movie,
                    subType: 'Trailer',
                },
                {
                    id: 'behind_scenes',
                    type: ExperienceType.Movie,
                    subType: 'BehindTheScenes',
                },
            ];

            const xml = MMCBuilder.build(sampleMMCData);
            expect(xml).toContain('main_movie');
            expect(xml).toContain('trailer');
            expect(xml).toContain('behind_scenes');
            expect(xml).toContain('BehindTheScenes');
        });
    });
});
