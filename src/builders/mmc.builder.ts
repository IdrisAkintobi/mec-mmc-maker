import { validateAudioTracks, validateSubtitleTracks, validateVideoTracks } from '../helpers/validation.helper';
import { XML_PREFIX, xmlBuilder } from '../infrastructure/xml.builder';
import { MMCData } from '../types/mmc.types';

export class MMCBuilder {
    static build(data: MMCData): string {
        // Validate video types before building
        if (data.video && data.video.length > 0) {
            const validationResult = validateVideoTracks(data.video);
            if (!validationResult.valid) {
                throw new Error(`Video validation failed: ${validationResult.errors.join('; ')}`);
            }
        }

        // Validate audio types before building
        if (data.audio && data.audio.length > 0) {
            const validationResult = validateAudioTracks(data.audio);
            if (!validationResult.valid) {
                throw new Error(`Audio validation failed: ${validationResult.errors.join('; ')}`);
            }
        }

        // Validate subtitle types before building
        if (data.subtitle && data.subtitle.length > 0) {
            const validationResult = validateSubtitleTracks(data.subtitle);
            if (!validationResult.valid) {
                throw new Error(`Subtitle validation failed: ${validationResult.errors.join('; ')}`);
            }
        }
        const xmlObj = {
            'manifest:MediaManifest': {
                '@xmlns:manifest': 'http://www.movielabs.com/schema/manifest/v1.10/manifest',
                '@xmlns:md': 'http://www.movielabs.com/schema/md/v2.9/md',
                '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
                '@xsi:schemaLocation': 'http://www.movielabs.com/schema/manifest/v1.10/manifest manifest-v1.10.xsd',
                // Compatibility is required as the first child of MediaManifest. Default to the
                // Amazon-current profile (SpecVersion 1.10 / MMC-1) unless the caller overrides.
                'manifest:Compatibility': {
                    'manifest:SpecVersion': data.compatibility?.specVersion ?? '1.10',
                    'manifest:Profile': data.compatibility?.profile ?? 'MMC-1',
                },
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

    /** ContainerReference with an optional MD5 hash (`<manifest:Hash method="MD5">`). */
    private static containerReference(location: string, hash?: string) {
        return {
            'manifest:ContainerLocation': location,
            ...(hash && { 'manifest:Hash': { '@method': 'MD5', $: hash } }),
        };
    }

    private static buildInventory(data: MMCData) {
        return {
            'manifest:Audio': data.audio.map(audio => ({
                '@AudioTrackID': audio.trackId,
                // dubbed/forced -> attributes on md:Type (textNodeName '$' carries the value).
                'md:Type':
                    audio.dubbed || audio.forced
                        ? {
                              ...(audio.dubbed && { '@dubbed': 'true' }),
                              ...(audio.forced && { '@forced': 'true' }),
                              $: audio.type,
                          }
                        : audio.type,
                'md:Language': audio.language,
                'manifest:ContainerReference': this.containerReference(audio.location, audio.hash),
            })),
            'manifest:Video': data.video.map(video => ({
                '@VideoTrackID': video.trackId,
                // Element order matches the Amazon templates: Type, Language, Picture, ContainerReference.
                'md:Type': video.type,
                'md:Language': video.language,
                'md:Picture': {
                    'md:WidthPixels': video.picture.widthPixels,
                    'md:HeightPixels': video.picture.heightPixels,
                    // AspectRatio is optional and omitted by Amazon's templates; emit only when provided.
                    ...(video.picture.aspectRatio && { 'md:AspectRatio': video.picture.aspectRatio }),
                    ...(video.picture.progressive !== undefined && {
                        // scanOrder (e.g. TFF) is an attribute on md:Progressive, not a separate element.
                        'md:Progressive': video.picture.progressiveScanOrder
                            ? { '@scanOrder': video.picture.progressiveScanOrder, $: video.picture.progressive }
                            : video.picture.progressive,
                    }),
                },
                'manifest:ContainerReference': this.containerReference(video.location, video.hash),
            })),
            ...(data.subtitle && {
                'manifest:Subtitle': data.subtitle.map(sub => ({
                    '@SubtitleTrackID': sub.trackId,
                    ...(sub.format && { 'md:Format': sub.format }),
                    'md:Type': sub.type,
                    'md:Language': sub.language,
                    // md:Encoding/md:FrameRate with multiplier + timecode attributes (md namespace).
                    'md:Encoding': {
                        'md:FrameRate': {
                            ...(sub.frameRateMultiplier && { '@multiplier': sub.frameRateMultiplier }),
                            '@timecode': sub.frameRateTimeCode || 'NonDrop',
                            $: sub.frameRate,
                        },
                    },
                    'manifest:ContainerReference': this.containerReference(sub.location, sub.hash),
                })),
            }),
            ...(data.image && {
                'manifest:Image': data.image.map(img => ({
                    '@ImageID': img.id,
                    'md:Purpose': img.purpose,
                    'md:Language': img.language,
                    'manifest:ContainerReference': this.containerReference(img.location),
                })),
            }),
        };
    }

    private static buildPresentations(data: MMCData) {
        return {
            'manifest:Presentation': data.presentation.map(pres => {
                // Each track reference wraps its ID element; a presentation may carry multiple
                // audio and subtitle references (one element each).
                const audioIds = pres.audioIds ?? (pres.audioId ? [pres.audioId] : []);
                const subtitleIds = pres.subtitleIds ?? (pres.subtitleId ? [pres.subtitleId] : []);
                return {
                    '@PresentationID': pres.id,
                    'manifest:TrackMetadata': {
                        'manifest:TrackSelectionNumber': pres.trackNum ?? '0',
                        ...(pres.videoId && {
                            'manifest:VideoTrackReference': { 'manifest:VideoTrackID': pres.videoId },
                        }),
                        ...(audioIds.length && {
                            'manifest:AudioTrackReference': audioIds.map(id => ({ 'manifest:AudioTrackID': id })),
                        }),
                        ...(subtitleIds.length && {
                            'manifest:SubtitleTrackReference': subtitleIds.map(id => ({
                                'manifest:SubtitleTrackID': id,
                            })),
                        }),
                    },
                };
            }),
        };
    }

    private static buildPictureGroups(data: MMCData) {
        return data.pictureGroup?.map(group => ({
            '@PictureGroupID': group.id,
            'manifest:Picture': {
                ...(group.pictureId && { 'manifest:PictureID': group.pictureId }),
                'manifest:ImageID': group.imageIds.map(id => ({ $: id })),
            },
        }));
    }

    private static buildExperiences(data: MMCData) {
        return {
            'manifest:Experience': data.experience.map(exp => ({
                '@ExperienceID': exp.id,
                // Amazon's templates carry version="1.0" on each Experience.
                '@version': exp.version ?? '1.0',
                'manifest:Audiovisual': {
                    'manifest:Type': exp.type,
                    // SubType is required for Trailer/Bonus and used for the feature ("Feature");
                    // omit the element entirely when empty rather than emitting <manifest:SubType/>.
                    ...(exp.subType && { 'manifest:SubType': exp.subType }),
                    ...(exp.presentationId && { 'manifest:PresentationID': exp.presentationId }),
                },
                // PictureGroupID and ExperienceChild follow Audiovisual, in that order.
                ...(exp.pictureGroupId && { 'manifest:PictureGroupID': exp.pictureGroupId }),
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
            'manifest:ALIDExperienceMap': data.alidExperience.map((map, index) => ({
                'manifest:ALID': map.alid,
                // Use the explicit mapping when given (required once there is >1 experience,
                // e.g. feature + trailer); fall back to positional pairing for legacy callers.
                'manifest:ExperienceID': map.experienceId ?? data.experience[index]?.id,
            })),
        };
    }
}
