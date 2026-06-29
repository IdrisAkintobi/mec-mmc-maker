import { MMCBuilder } from '../src/builders/mmc.builder';
import { validateXMLStructure } from '../src/helpers/xml-validator';
import { AudioType, AudiovisualType, MMCData, SubtitleType, VideoType } from '../src/types/mmc.types';
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
            expect(xml).toContain('xmlns:manifest="http://www.movielabs.com/schema/manifest/v1.10/manifest"');
            expect(xml).toContain('<manifest:SpecVersion>1.10</manifest:SpecVersion>');
            expect(xml).toContain('<manifest:Profile>MMC-1</manifest:Profile>');
        });

        it('should build inventory correctly', () => {
            const xml = MMCBuilder.build(sampleMMCData);

            // Audio checks
            expect(xml).toContain('AudioTrackID="audio1"');
            expect(xml).toContain('<md:Type>primary</md:Type>');
            expect(xml).toContain('<manifest:ContainerLocation>path/to/audio.mp4</manifest:ContainerLocation>');

            // Video checks
            expect(xml).toContain('VideoTrackID="video1"');
            expect(xml).toContain('<md:WidthPixels>1920</md:WidthPixels>');
            expect(xml).toContain('<md:HeightPixels>1080</md:HeightPixels>');

            // Subtitle checks — Encoding uses md:FrameRate with a timecode attribute.
            expect(xml).toContain('SubtitleTrackID="sub1"');
            expect(xml).toContain('<md:Encoding>');
            expect(xml).toContain('timecode="NonDrop">24</md:FrameRate>');
        });

        it('should build presentations correctly', () => {
            const xml = MMCBuilder.build(sampleMMCData);

            expect(xml).toContain('PresentationID="pres1"');
            expect(xml).toContain('<manifest:TrackSelectionNumber>1</manifest:TrackSelectionNumber>');
            // Track references wrap their ID element (VideoTrackReference > VideoTrackID).
            expect(xml).toContain('<manifest:VideoTrackID>video1</manifest:VideoTrackID>');
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
            expect(xml).toContain('<manifest:Type>Main</manifest:Type>');
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
                    type: AudioType.Primary,
                    language: 'en',
                    location: 'path/to/audio_en.mp4',
                    hash: 'hash123',
                },
                {
                    trackId: 'audio_es',
                    type: AudioType.Primary,
                    language: 'es',
                    location: 'path/to/audio_es.mp4',
                    hash: 'hash456',
                },
                {
                    trackId: 'audio_commentary',
                    type: AudioType.Commentary,
                    language: 'en',
                    location: 'path/to/commentary.mp4',
                    hash: 'hash789',
                },
            ];

            const xml = MMCBuilder.build(sampleMMCData);
            expect(xml).toContain('audio_en');
            expect(xml).toContain('audio_es');
            expect(xml).toContain('audio_commentary');
            expect(xml).toContain('commentary');
        });

        it('should handle audio tracks without optional hash', () => {
            sampleMMCData.audio = [
                {
                    trackId: 'audio1',
                    type: AudioType.Primary,
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
                    type: VideoType.Primary,
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
                    type: VideoType.Primary,
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
                    type: SubtitleType.SDH,
                    language: 'en',
                    location: 'path/to/cc_en.srt',
                    hash: 'hash123',
                    frameRate: '24',
                    frameRateMultiplier: '1000/1001',
                    frameRateTimeCode: 'true',
                },
                {
                    trackId: 'sub_es',
                    type: SubtitleType.Normal,
                    language: 'es',
                    location: 'path/to/sub_es.srt',
                    hash: 'hash456',
                    frameRate: '24',
                    frameRateMultiplier: '1000/1001',
                    frameRateTimeCode: 'true',
                },
            ];

            const xml = MMCBuilder.build(sampleMMCData);
            expect(xml).toContain('sdh');
            expect(xml).toContain('normal');
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
                    type: AudiovisualType.Main,
                    subType: 'Feature',
                    child: {
                        id: 'trailer',
                        relationship: 'Trailer',
                    },
                },
                {
                    id: 'trailer',
                    type: AudiovisualType.Main,
                    subType: 'Trailer',
                },
                {
                    id: 'behind_scenes',
                    type: AudiovisualType.Main,
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

    describe('Audio Type Validation', () => {
        it('should throw error for invalid audio type', () => {
            sampleMMCData.audio = [
                {
                    trackId: 'audio1',
                    type: 'InvalidType',
                    language: 'en',
                    location: 'path/to/audio.mp4',
                },
            ];

            expect(() => MMCBuilder.build(sampleMMCData)).toThrow(
                'Audio validation failed: Audio track "audio1": Invalid audio type: "InvalidType". Valid types: primary, narration, dialog centric, commentary',
            );
        });

        it('should throw error for multiple invalid audio types', () => {
            sampleMMCData.audio = [
                {
                    trackId: 'audio1',
                    type: 'InvalidType1',
                    language: 'en',
                    location: 'path/to/audio1.mp4',
                },
                {
                    trackId: 'audio2',
                    type: 'InvalidType2',
                    language: 'es',
                    location: 'path/to/audio2.mp4',
                },
            ];

            expect(() => MMCBuilder.build(sampleMMCData)).toThrow('Audio validation failed');
        });

        it('should accept valid audio types', () => {
            sampleMMCData.audio = [
                {
                    trackId: 'audio1',
                    type: AudioType.Primary,
                    language: 'en',
                    location: 'path/to/audio.mp4',
                },
                {
                    trackId: 'audio2',
                    type: AudioType.Narration,
                    language: 'en',
                    location: 'path/to/narration.mp4',
                },
                {
                    trackId: 'audio3',
                    type: AudioType.Commentary,
                    language: 'en',
                    location: 'path/to/commentary.mp4',
                },
                {
                    trackId: 'audio4',
                    type: AudioType.DialogCentric,
                    language: 'en',
                    location: 'path/to/dialog.mp4',
                },
            ];

            expect(() => MMCBuilder.build(sampleMMCData)).not.toThrow();
        });

        it('should accept valid audio types as strings', () => {
            sampleMMCData.audio = [
                {
                    trackId: 'audio1',
                    type: 'Primary',
                    language: 'en',
                    location: 'path/to/audio.mp4',
                },
                {
                    trackId: 'audio2',
                    type: 'Narration',
                    language: 'en',
                    location: 'path/to/narration.mp4',
                },
            ];

            expect(() => MMCBuilder.build(sampleMMCData)).not.toThrow();
        });
    });
});
