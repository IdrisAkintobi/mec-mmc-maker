export type MMCSchemaType = {
    'manifest:MediaManifest': MediaManifest;
};

export type MediaManifest = {
    '@xmlns:manifest': string;
    '@xmlns:md': string;
    '@xmlns:xs': string;
    '@xmlns:xsi': string;
    '@xsi:schemaLocation': string;
    'manifest:Compatibility': manifestCompatibility;
    'manifest:Inventory': manifestInventory;
    'manifest:Presentations': manifestPresentation;
    'manifest:PictureGroups': manifestPictureGroup[];
    'manifest:Experiences': manifestExperience[];
    'manifest:ALIDExperienceMaps': manifestALIDExperienceMap;
};

export type manifestCompatibility = {
    'manifest:SpecVersion': string;
    'manifest:Profile': string;
};

export type manifestInventory = {
    'manifest:Audio': manifestAudio[];
    'manifest:Video': manifestVideo[];
    'manifest:Subtitle'?: manifestSubtitle[];
    'manifest:Image'?: manifestImage[];
};

export type manifestPresentation = {
    'manifest:Presentation': Array<{
        '@PresentationID': string;
        'manifest:TrackMetadata': manifestTrackMetadata;
    }>;
};

export type manifestPictureGroup = {
    'manifest:PictureGroup': {
        '@PictureGroupID': string;
        'manifest:Picture': manifestPicture;
    };
};

export type manifestExperience = {
    'manifest:Experience': {
        '@ExperienceID': string;
        'manifest:Audiovisual': manifestAudiovisual;
        'manifest:PictureGroupID'?: string;
        'manifest:ExperienceChild'?: manifestExperienceChild;
    };
};

export type manifestALIDExperienceMap = {
    'manifest:ALIDExperienceMap': Array<{
        'manifest:ALID': string;
        'manifest:ExperienceID': string;
    }>;
};

export type manifestAudio = {
    '@AudioTrackID': string;
    'md:Type': string;
    'md:Language': string;
    'manifest:ContainerReference': manifestContainerReference;
};

export type manifestAudiovisual = {
    'manifest:Type': string;
    'manifest:SubType': string;
    'manifest:PresentationID': string;
};

export type manifestExperienceChild = {
    'manifest:Relationship': string;
    'manifest:ExperienceID': string;
};

export type manifestPicture = {
    'manifest:ImageID': string[];
};

export type manifestTrackMetadata = {
    'manifest:TrackSelectionNumber': string;
    'manifest:VideoTrackReference': manifestVideoTrackReference;
    'manifest:AudioTrackReference': manifestAudioTrackReference;
    'manifest:SubtitleTrackReference': manifestSubtitleTrackReference[];
};

export type manifestVideoTrackReference = {
    'manifest:VideoTrackID': string;
};

export type manifestAudioTrackReference = {
    'manifest:AudioTrackID': string;
};

export type manifestSubtitleTrackReference = {
    'manifest:SubtitleTrackID': string;
};

export type manifestSubtitle = {
    '@SubtitleTrackID': string;
    'md:Type': string;
    'md:Language': string;
    'md:Encoding': mdEncoding;
    'manifest:ContainerReference': manifestContainerReference;
};

export type manifestImage = {
    '@ImageID': string;
    'md:Purpose': string;
    'md:Language': string;
    'manifest:ContainerReference': manifestContainerReference;
};

export type manifestVideo = {
    '@VideoTrackID': string;
    'md:Type': string;
    'md:Language': string;
    'md:Picture': mdPicture;
    'manifest:ContainerReference': manifestContainerReference;
};

export type mdEncoding = {
    'md:FrameRate': mdFrameRate;
};

export type mdFrameRate = {
    '@multiplier': string;
    '@timecode': string;
    $: string;
};

export type mdPicture = {
    'md:AspectRatio'?: string;
    'md:WidthPixels': string;
    'md:HeightPixels': string;
    'md:Progressive'?: {
        '@scanOrder': string;
        $: string;
    };
};

export type manifestContainerReference = {
    'manifest:ContainerLocation': string;
    'manifest:Hash'?: manifestHash;
};

export type manifestHash = {
    '@method': string;
    $: string;
};
