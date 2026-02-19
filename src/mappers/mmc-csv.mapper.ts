 
// Ported from mdmec-xml-maker, type definitions need reconciliation
import { calculateAspectRatio } from '../helpers/aspect-ratio.helper';
import { MMCCSVData } from '../types/csv/mmc-parsed.type';
import {
    manifestALIDExperienceMap,
    manifestAudio,
    manifestAudioTrackReference,
    manifestExperience,
    manifestImage,
    manifestPictureGroup,
    manifestPresentation,
    manifestSubtitle,
    manifestSubtitleTrackReference,
    manifestVideo,
    manifestVideoTrackReference,
    MMCSchemaType,
} from '../types/csv/mmc-schema.type';

export class MMCMapper {
    static map(data: MMCCSVData): MMCSchemaType {
        //Number of Experience IDs must be equal to number of Presentation IDs
        // Handle missing IDs with safe defaults
        const experienceIDs = data.ExperienceID?.split(';') || [''];
        const presentationIDs = data.PresentationID?.split('||') || [''];
        if (experienceIDs.length !== presentationIDs.length) {
            throw new Error('ExperienceID and PresentationID must be of the same length');
        }

        const mmcSchema: MMCSchemaType = {
            'manifest:MediaManifest': {
                '@xmlns:manifest': 'http://www.movielabs.com/schema/manifest/v1.10/manifest',
                '@xmlns:md': 'http://www.movielabs.com/schema/md/v2.9/md',
                '@xmlns:xs': 'http://www.w3.org/2001/XMLSchema',
                '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
                '@xsi:schemaLocation': 'http://www.movielabs.com/schema/manifest/v1.10/manifest manifest-v1.10.xsd',
                'manifest:Compatibility': {
                    'manifest:SpecVersion': '1.10',
                    'manifest:Profile': 'MMC-1',
                },
                'manifest:Inventory': {
                    ...(data.AudioTrackID && { 'manifest:Audio': this.mapAudios(data) }),
                    'manifest:Video': this.mapVideos(data),
                    ...(data.SubtitleTrackID && { 'manifest:Subtitle': this.mapSubtitles(data) }),
                    ...(data.ImageID && { 'manifest:Image': this.mapImages(data) }),
                },
                'manifest:Presentations': {
                    'manifest:Presentation': this.mapPresentations(data),
                },
                ...(data.PictureGroupID && { 'manifest:PictureGroups': this.mapPictureGroup(data) }),
                'manifest:Experiences': this.mapExperience(data),
                'manifest:ALIDExperienceMaps': {
                    'manifest:ALIDExperienceMap': this.mapALIDExperience(data),
                },
            },
        };

        return mmcSchema;
    }

    private static mapALIDExperience(data: mmcParsedType): manifestALIDExperienceMap['manifest:ALIDExperienceMap'] {
        const alid = data.ALID?.split(';') || [''];

        // Auto-derive ALIDExperienceID from ExperienceID (redundancy removal)
        const alidExperienceID = data.ExperienceID?.split(';') || [''];

        if (alid.length !== alidExperienceID.length) {
            console.log({ alid, alidExperienceID });
            throw new Error('ALID and ExperienceID must have the same length');
        }

        const alidArray = [];

        for (let i = 0; i < alid.length; i++) {
            alidArray.push({
                'manifest:ALID': alid[i]?.trim(),
                'manifest:ExperienceID': alidExperienceID[i]?.trim(),
            });
        }

        return alidArray;
    }

    private static mapExperience(data: mmcParsedType): manifestExperience[] {
        const experienceID = data.ExperienceID?.split(';') || [''];
        const experienceType = data.ExperienceType.split(';');
        const experienceSubType = data.ExperienceSubType.split(';');
        const presentationID = data.PresentationID?.split('||') || [''];

        // check if it is an episode or season
        const hasChildren = data.ExperienceChildID && data.ExperienceChildRelationship;

        // check if all arrays have the same length
        if (experienceID.length !== experienceType.length || experienceType.length !== experienceSubType.length) {
            console.log({ experienceID, experienceType, experienceSubType });
            throw new Error('ExperienceID, ExperienceType, and ExperienceSubType, must have the same length');
        }

        const manifestPresentations = [];

        for (let i = 0; i < experienceID.length; i++) {
            manifestPresentations.push({
                'manifest:Experience': {
                    '@ExperienceID': experienceID[i]?.trim(),
                    'manifest:Audiovisual': {
                        'manifest:Type': experienceType[i]?.trim(),
                        'manifest:SubType': experienceSubType[i]?.trim(),
                        'manifest:PresentationID': presentationID[i]?.trim(),
                    },
                    ...(data.PictureGroupID && i === 0 && { 'manifest:PictureGroupID': data.PictureGroupID }),
                    ...(hasChildren &&
                        i === 0 && {
                            'manifest:ExperienceChild': this.mapChildExperience(
                                data.ExperienceChildID,
                                data.ExperienceChildRelationship,
                            ),
                        }),
                },
            });
        }

        return manifestPresentations;
    }

    private static mapChildExperience(experienceId: string, relationship: string) {
        const childExperienceID = experienceId.split(';');
        const childRelationship = relationship.split(';');

        if (childExperienceID.length !== childRelationship.length) {
            console.log({ experienceId, relationship });
            throw new Error('ExperienceChildID and ExperienceChildRelationship must have the same length');
        }

        const childExperiences = [];

        for (let i = 0; i < childExperienceID.length; i++) {
            childExperiences.push({
                'manifest:Relationship': childRelationship[i]?.trim(),
                'manifest:ExperienceID': childExperienceID[i]?.trim(),
            });
        }

        return childExperiences;
    }

    private static mapPictureGroup(data: mmcParsedType): manifestPictureGroup[] {
        const pictureGroupIDs = data.PictureGroupID?.split('||') || [''];
        const pictureGroupImageID = data.PictureGroupImageID?.split('||') || [''];

        // check if all arrays have the same length
        if (pictureGroupIDs.length !== pictureGroupImageID.length) {
            console.log({ pictureGroupIDs, pictureGroupImageID });
            throw new Error('PictureGroupID, and PictureGroupImageID, must have the same length');
        }

        const manifestImages = [];

        for (let i = 0; i < pictureGroupIDs.length; i++) {
            manifestImages.push({
                '@PictureGroupID': pictureGroupIDs[i]?.trim(),
                'manifest:Picture': {
                    'manifest:ImageID': this.mapPictureGroupImages(pictureGroupImageID[i]),
                },
            });
        }

        return manifestImages;
    }

    private static mapPictureGroupImages(data: string): Record<'$', string>[] {
        const pictureGroupImages = data.split(';');
        return pictureGroupImages.map(i => ({
            $: i,
        }));
    }

    private static mapPresentations(data: mmcParsedType): manifestPresentation['manifest:Presentation'] {
        const presentationIDs = data.PresentationID?.split('||') || [''];
        const presentationIDTrackNum = data.PresentationIDTrackNum?.split('||') || ['0'];
        const presentationIDVid = data.PresentationIDVid?.split('||') || [''];
        const presentationIDAud = data.PresentationIDAud?.split('||') || [''];
        const presentationIDSub = data.PresentationIDSub?.split('||') || [''];

        // check if all arrays have the same length
        if (
            presentationIDs.length !== presentationIDTrackNum.length ||
            presentationIDVid.length !== presentationIDAud.length ||
            presentationIDSub.length !== presentationIDs.length
        ) {
            console.log({ presentationIDs, presentationIDVid, presentationIDSub });
            throw new Error(
                'PresentationID, PresentationIDTrackNum, PresentationIDVid, presentationIDAud, and presentationIDSub must have the same length',
            );
        }

        const presentations = [];

        for (let i = 0; i < presentationIDs.length; i++) {
            presentations.push({
                '@PresentationID': presentationIDs[i]?.trim(),
                'manifest:TrackMetadata': {
                    'manifest:TrackSelectionNumber': presentationIDTrackNum[i]?.trim(),
                    'manifest:VideoTrackReference': this.mapPresentationVid(presentationIDVid[i]),
                    ...(presentationIDAud[i] && {
                        'manifest:AudioTrackReference': this.mapPresentationAud(presentationIDAud[i]),
                    }),
                    ...(presentationIDSub[i] && {
                        'manifest:SubtitleTrackReference': this.mapPresentationSub(presentationIDSub[i]),
                    }),
                },
            });
        }

        return presentations;
    }

    private static mapPresentationVid(data: string): manifestVideoTrackReference[] {
        const presentationVid = data.split(';');
        return presentationVid.map(i => ({
            'manifest:VideoTrackID': i,
        }));
    }

    private static mapPresentationAud(data: string): manifestAudioTrackReference[] {
        const presentationAud = data.split(';');
        return presentationAud.map(i => ({
            'manifest:AudioTrackID': i,
        }));
    }

    private static mapPresentationSub(data: string): manifestSubtitleTrackReference[] {
        const presentationSub = data.split(';');
        return presentationSub.map(i => ({
            'manifest:SubtitleTrackID': i,
        }));
    }

    private static mapSubtitles(data: mmcParsedType): manifestSubtitle[] {
        const subtitleIDs = data.SubtitleTrackID?.split(';') || [''];
        const types = data.SubtitleType.split(';');
        const languages = data.SubtitleLanguage.split(';');
        const locations = data.SubtitleLocation.split(';');
        const hashes = data.SubtitleHash?.split(';') || [];
        const frameRate = data.SubtitleFrameRate.split(';');
        const frameRateMultiplier = data.SubtitleFrameRateMultiplier.split(';');
        const frameRateTimecode = data.SubtitleFrameRateTimeCode.split(';');

        // check if all arrays have the same length
        if (
            subtitleIDs.length !== types.length ||
            languages.length !== locations.length ||
            frameRateMultiplier.length !== frameRateTimecode.length ||
            frameRateTimecode.length !== frameRate.length
        ) {
            console.log({ subtitleIDs, languages, frameRateMultiplier, frameRateTimecode });
            throw new Error(
                'SubtitleTrackID, SubtitleType, SubtitleLanguage, SubtitleLocation, SubtitleFrameRateMultiplier, SubtitleFrameRate, and SubtitleFrameRateTimeCode  must have the same length',
            );
        }

        const manifestSubtitles = [];

        for (let i = 0; i < subtitleIDs.length; i++) {
            manifestSubtitles.push({
                '@SubtitleTrackID': subtitleIDs[i]?.trim(),
                'md:Type': types[i]?.trim(),
                'md:Language': languages[i]?.trim(),
                'md:Encoding': {
                    'md:FrameRate': {
                        '@multiplier': frameRateMultiplier[i]?.trim(),
                        '@timecode': frameRateTimecode[i]?.trim(),
                        $: frameRate[i]?.trim(),
                    },
                },
                'manifest:ContainerReference': {
                    'manifest:ContainerLocation': locations[i]?.trim(),
                    ...(hashes[i] && {
                        'manifest:Hash': {
                            '@method': 'MD5',
                            $: hashes[i]?.trim(),
                        },
                    }),
                },
            });
        }

        return manifestSubtitles;
    }

    private static mapImages(data: mmcParsedType): manifestImage[] {
        const imageIDs = data.ImageID?.split(';') || [''];
        const purposes = data.ImagePurpose.split(';');
        const languages = data.ImageLanguage.split(';');
        const locations = data.ImageLocation.split(';');

        // check if all arrays have the same length
        if (imageIDs.length !== purposes.length || languages.length !== locations.length) {
            console.log({ imageIDs, purposes, languages, locations });
            throw new Error('ImageID, ImagePurpose, ImageLanguage, and ImageLocation must have the same length');
        }

        const manifestImages = [];

        for (let i = 0; i < imageIDs.length; i++) {
            manifestImages.push({
                '@ImageID': imageIDs[i]?.trim(),
                'md:Purpose': purposes[i]?.trim(),
                'md:Language': languages[i]?.trim(),
                'manifest:ContainerReference': {
                    'manifest:ContainerLocation': locations[i]?.trim(),
                },
            });
        }

        return manifestImages;
    }

    private static mapAudios(data: mmcParsedType): manifestAudio[] {
        const trackIDs = data.AudioTrackID?.split(';') || [''];
        const types = data.AudioType.split(';');
        const languages = data.AudioLanguage.split(';');
        const locations = data.AudioLocation.split(';');
        const hashes = data.AudioHash?.split(';') || [];

        // check if all arrays have the same length
        if (trackIDs.length !== types.length || languages.length !== locations.length) {
            throw new Error('AudioTrackID, AudioType, AudioLanguage, and AudioLocation must have the same length');
        }

        const manifestAudios = [];

        for (let i = 0; i < trackIDs.length; i++) {
            manifestAudios.push({
                '@AudioTrackID': trackIDs[i]?.trim(),
                'md:Type': types[i]?.trim(),
                'md:Language': languages[i]?.trim(),
                'manifest:ContainerReference': {
                    'manifest:ContainerLocation': locations[i]?.trim(),
                    ...(hashes[i] && {
                        'manifest:Hash': {
                            '@method': 'MD5',
                            $: hashes[i]?.trim(),
                        },
                    }),
                },
            });
        }

        return manifestAudios;
    }

    private static mapVideos(data: mmcParsedType): manifestVideo[] {
        // Validate required fields with detailed error messages
        if (!data.VideoType) {
            const fields = Object.keys(data).slice(0, 10).join(', ');
            throw new Error(`VideoType is required. Available fields: ${fields}. VideoType value: "${data.VideoType}"`);
        }
        if (!data.VideoLanguage)
            throw new Error(`VideoLanguage is required. VideoLanguage value: "${data.VideoLanguage}"`);
        if (!data.VideoLocation)
            throw new Error(`VideoLocation is required. VideoLocation value: "${data.VideoLocation}"`);
        if (!data.HeightPixels) throw new Error(`HeightPixels is required. HeightPixels value: "${data.HeightPixels}"`);
        if (!data.WidthPixels) throw new Error(`WidthPixels is required. WidthPixels value: "${data.WidthPixels}"`);

        const trackIDs = data.VideoTrackID?.split(';') || [''];
        const types = data.VideoType.split(';');
        const languages = data.VideoLanguage.split(';');
        const locations = data.VideoLocation.split(';');
        const hashes = data.VideoHash?.split(';') || [];
        const heightPx = data.HeightPixels.split(';');
        const widthPx = data.WidthPixels.split(';');

        // Auto-calculate aspect ratio if not provided
        const aspectRatio = data.AspectRatio
            ? data.AspectRatio.split(';')
            : widthPx.map((width, i) => calculateAspectRatio(width, heightPx[i]));

        const progressive = data.Progressive?.split(';') || [];
        const progressiveScanOrder = data.ProgressiveScanOrder?.split(';') || [];

        // check if all arrays have the same length
        if (trackIDs.length !== types.length || languages.length !== locations.length) {
            console.log({ trackIDs, types, languages, locations });
            throw new Error('VideoTrackID, VideoType, VideoLanguage, and VideoLocation must have the same length');
        }

        // check if all arrays have the same length
        if (heightPx.length !== widthPx.length) {
            console.log({ heightPx, widthPx });
            throw new Error('HeightPixels and WidthPixels must have the same length');
        }

        const manifestVideos = [];

        for (let i = 0; i < trackIDs.length; i++) {
            manifestVideos.push({
                '@VideoTrackID': trackIDs[i]?.trim(),
                'md:Type': types[i]?.trim(),
                'md:Language': languages[i]?.trim(),
                'md:Picture': {
                    'md:HeightPixels': heightPx[i]?.trim(),
                    'md:WidthPixels': widthPx[i]?.trim(),
                    ...(aspectRatio[i] && { 'md:AspectRatio': aspectRatio[i] }),
                    ...(progressive[i] && {
                        ...(progressiveScanOrder[i] && { '@scanOrder': progressiveScanOrder[i] }),
                        'md:Progressive': data.Progressive,
                    }),
                },
                'manifest:ContainerReference': {
                    'manifest:ContainerLocation': locations[i]?.trim(),
                    ...(hashes[i] && {
                        'manifest:Hash': {
                            '@method': 'MD5',
                            $: hashes[i]?.trim(),
                        },
                    }),
                },
            });
        }

        return manifestVideos;
    }
}
