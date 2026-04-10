import { AudioType, ExperienceType, ImagePurpose, VideoType } from '../../src/types/mmc.types';

export const sampleMMCData = {
    audio: [
        {
            trackId: 'audio1',
            type: AudioType.Primary,
            language: 'en',
            location: 'path/to/audio.mp4',
            hash: 'abc123',
        },
    ],
    video: [
        {
            trackId: 'video1',
            type: VideoType.Primary,
            language: 'en',
            location: 'path/to/video.mp4',
            hash: 'def456',
            picture: {
                heightPixels: '1080',
                widthPixels: '1920',
                aspectRatio: '16:9',
                progressive: true,
                progressiveScanOrder: 'Top',
            },
        },
    ],
    subtitle: [
        {
            trackId: 'sub1',
            type: 'Normal',
            language: 'es',
            location: 'path/to/subtitle.srt',
            hash: 'ghi789',
            frameRate: '24',
            frameRateMultiplier: '1000/1001',
            frameRateTimeCode: 'true',
        },
    ],
    image: [
        {
            id: 'img1',
            purpose: ImagePurpose.Cover,
            language: 'en',
            location: 'path/to/cover.jpg',
        },
    ],
    presentation: [
        {
            id: 'pres1',
            trackNum: '1',
            videoId: 'video1',
            audioId: 'audio1',
            subtitleId: 'sub1',
        },
    ],
    pictureGroup: [
        {
            id: 'pg1',
            imageIds: ['img1'],
        },
    ],
    experience: [
        {
            id: 'exp1',
            type: ExperienceType.Movie,
            subType: 'Feature',
            child: {
                id: 'exp2',
                relationship: 'Trailer',
            },
        },
    ],
    alidExperience: [
        {
            alid: 'alid1',
            experienceId: 'exp1',
        },
    ],
};
