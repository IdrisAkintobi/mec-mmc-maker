import { XML_PREFIX, xmlBuilder } from '../infrastructure/xml.builder';
import { MMCData } from '../types/mmc.types';

export class MMCBuilder {
    static build(data: MMCData): string {
        const xmlObj = {
            'manifest:MediaManifest': {
                '@xmlns:manifest': 'http://www.movielabs.com/schema/manifest/v1.9/manifest',
                '@xmlns:md': 'http://www.movielabs.com/schema/md/v2.9/md',
                '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
                '@xsi:schemaLocation': 'http://www.movielabs.com/schema/manifest/v1.9/manifest manifest-v1.9.xsd',
                'manifest:Inventory': this.buildInventory(data),
                'manifest:Presentations': this.buildPresentations(data),
                ...(data.pictureGroup && {
                    'manifest:PictureGroups': this.buildPictureGroups(data),
                }),
                'manifest:Experiences': this.buildExperiences(data),
                'manifest:ALIDExperienceMaps': this.buildALIDMaps(data),
            },
        };

        return XML_PREFIX + xmlBuilder.build(xmlObj);
    }

    private static buildInventory(data: MMCData) {
        return {
            'manifest:Audio': data.audio.map(audio => ({
                '@AudioTrackID': audio.trackId,
                'md:Type': audio.type,
                'md:Language': audio.language,
                'manifest:ContainerReference': {
                    'manifest:ContainerLocation': audio.location,
                    ...(audio.hash && { 'manifest:Hash': audio.hash }),
                },
            })),
            'manifest:Video': data.video.map(video => ({
                '@VideoTrackID': video.trackId,
                'md:Type': video.type,
                'md:Language': video.language,
                'manifest:ContainerReference': {
                    'manifest:ContainerLocation': video.location,
                    'manifest:Hash': video.hash,
                },
                'md:Picture': {
                    'md:WidthPixels': video.picture.widthPixels,
                    'md:HeightPixels': video.picture.heightPixels,
                    ...(video.picture.aspectRatio && {
                        'md:AspectRatio': video.picture.aspectRatio,
                    }),
                    ...(video.picture.progressive !== undefined && {
                        'md:Progressive': video.picture.progressive,
                    }),
                    ...(video.picture.progressiveScanOrder && {
                        'md:ProgressiveScanOrder': video.picture.progressiveScanOrder,
                    }),
                },
            })),
            ...(data.subtitle && {
                'manifest:Subtitle': data.subtitle.map(sub => ({
                    '@SubtitleTrackID': sub.trackId,
                    'md:Type': sub.type,
                    'md:Language': sub.language,
                    'manifest:ContainerReference': {
                        'manifest:ContainerLocation': sub.location,
                        'manifest:Hash': sub.hash,
                    },
                    'manifest:Encoding': {
                        'manifest:FrameRate': sub.frameRate,
                        'manifest:FrameRateMultiplier': sub.frameRateMultiplier,
                        'manifest:TimeCodeDropFrame': sub.frameRateTimeCode,
                    },
                })),
            }),
            ...(data.image && {
                'manifest:Image': data.image.map(img => ({
                    '@ImageID': img.id,
                    'md:Purpose': img.purpose,
                    'md:Language': img.language,
                    'manifest:ContainerReference': {
                        'manifest:ContainerLocation': img.location,
                    },
                })),
            }),
        };
    }

    private static buildPresentations(data: MMCData) {
        return {
            'manifest:Presentation': data.presentation.map(pres => ({
                '@PresentationID': pres.id,
                'manifest:TrackMetadata': {
                    'manifest:TrackSelectionNumber': pres.trackNum,
                    'manifest:VideoTrackReference': pres.videoId,
                    'manifest:AudioTrackReference': pres.audioId,
                    ...(pres.subtitleId && {
                        'manifest:SubtitleTrackReference': pres.subtitleId,
                    }),
                },
            })),
        };
    }

    private static buildPictureGroups(data: MMCData) {
        return data.pictureGroup?.map(group => ({
            '@PictureGroupID': group.id,
            'manifest:Picture': {
                'manifest:ImageID': group.imageIds.map(id => ({ $: id })),
            },
        }));
    }

    private static buildExperiences(data: MMCData) {
        return {
            'manifest:Experience': data.experience.map(exp => ({
                '@ExperienceID': exp.id,
                'manifest:Audiovisual': {
                    'manifest:Type': exp.type,
                    'manifest:SubType': exp.subType,
                },
                ...(exp.child && {
                    'manifest:ExperienceChild': {
                        'manifest:Relationship': exp.child.relationship,
                        'manifest:ExperienceID': exp.child.id,
                    },
                }),
            })),
        };
    }

    private static buildALIDMaps(data: MMCData) {
        return {
            'manifest:ALIDExperienceMap': data.alidExperience.map(map => ({
                'manifest:ALID': map.alid,
                'manifest:ExperienceID': map.experienceId,
            })),
        };
    }
}
