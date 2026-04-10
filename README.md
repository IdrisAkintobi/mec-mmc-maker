# MEC MMC XML Builder

A modern TypeScript library for building MEC (Media Entertainment Core) and MMC (Media Manifest Core) XML files for Amazon Prime Video according to MovieLabs specifications.

## Features

✅ **JavaScript-Friendly**: Clean object structures instead of CSV-like strings  
✅ **Type-Safe**: Full TypeScript support with comprehensive interfaces  
✅ **Modern API**: Builder pattern with intuitive methods  
✅ **Well-Documented**: JSDoc comments for all public APIs  
✅ **Tested**: Comprehensive test coverage  
✅ **Standards-Compliant**: Follows MovieLabs MEC v2.9 and MMC v1.9 specifications

## Installation

```bash
npm install mec-mmc-maker
```

## Quick Start

### Building MEC XML

```typescript
import { MECBuilder, MECData, WorkType, ReleaseType, NamespaceType } from 'mec-mmc-maker';

const mecData: MECData = {
    contentId: 'content123',
    localizedInfo: [
        {
            language: 'en-US',
            titleDisplay: 'Sample Movie',
            titleSort: 'Sample Movie',
            summary190: 'A short summary of the movie',
            summary400: 'A longer, more detailed summary of the movie content',
            artReference: [
                {
                    reference: 'path/to/cover.jpg',
                    resolution: '1920x1080',
                    purpose: 'cover',
                },
            ],
        },
    ],
    genre: [{ primary: 'Action', subGenre: ['Adventure', 'Thriller'] }],
    releaseYear: '2023',
    releaseDate: '2023-12-25',
    releaseHistory: [
        {
            type: ReleaseType.Theatrical,
            country: 'US',
            date: '2023-12-25',
        },
    ],
    workType: WorkType.Movie,
    identifier: [
        {
            namespace: NamespaceType.EIDR,
            value: '10.5240/1234-5678-90AB-CDEF-GHIJ-K',
        },
    ],
    cast: [
        {
            jobFunction: 'Actor',
            billingBlockOrder: '1',
            displayName: {
                'en-US': 'John Doe',
                'es-ES': 'Juan Pérez',
            },
        },
    ],
    originalLanguage: 'en',
    organization: {
        id: 'org123',
        role: 'Producer',
    },
    companyDisplayCredit: {
        value: 'Sample Studios',
        language: 'en-US',
    },
};

const mecXml = MECBuilder.build(mecData);
console.log(mecXml); // <?xml version="1.0" encoding="UTF-8"?>...
```

### Building MMC XML

```typescript
import { MMCBuilder, MMCData, AudioType, ExperienceType, ImagePurpose } from 'mec-mmc-maker';

const mmcData: MMCData = {
    audio: [
        {
            trackId: 'audio1',
            type: AudioType.Primary, // ✅ Valid audio type
            language: 'en',
            location: 'path/to/audio.mp4',
            hash: 'abc123',
        },
    ],
    video: [
        {
            trackId: 'video1',
            type: 'Primary',
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
    presentation: [
        {
            id: 'pres1',
            trackNum: '1',
            videoId: 'video1',
            audioId: 'audio1',
        },
    ],
    experience: [
        {
            id: 'exp1',
            type: ExperienceType.Movie,
            subType: 'Feature',
        },
    ],
    alidExperience: [
        {
            alid: 'alid1',
            experienceId: 'exp1',
        },
    ],
};

const mmcXml = MMCBuilder.build(mmcData);

// Note: MMCBuilder.build() automatically validates audio types
// and throws an error if any invalid types are detected
```

### Automatic Audio Type Validation

The `MMCBuilder.build()` method automatically validates all audio types before generating XML. If an invalid audio type is detected, it will throw an error:

```typescript
import { MMCBuilder, AudioType } from 'mec-mmc-maker';

const mmcData = {
    audio: [
        {
            trackId: 'audio1',
            type: 'InvalidType', // ❌ Invalid audio type
            language: 'en',
            location: 'path/to/audio.mp4',
        },
    ],
    // ... rest of data
};

try {
    const xml = MMCBuilder.build(mmcData);
} catch (error) {
    console.error(error.message);
    // Output: "Audio validation failed: Audio track "audio1": Invalid audio type: "InvalidType". Valid types: Primary, Narration, Dialog Centric, Commentary"
}
```

### XML Validation

The library provides both automatic and manual validation options.

#### Automatic Validation

`MMCBuilder.build()` automatically validates audio types before building XML. Invalid audio types will throw an error immediately.

#### Manual Validation

For more granular control, you can manually validate before building:

```typescript
import { validateXMLStructure, validateAudioType, validateAudioTracks } from 'mec-mmc-maker';

// Validate XML structure
const isValid = validateXMLStructure(xmlString);
if (isValid) {
    console.log('XML is valid!');
}

// Validate a single audio type
const audioTypeResult = validateAudioType('Primary');
if (!audioTypeResult.valid) {
    console.error(audioTypeResult.errors);
}

// Validate multiple audio tracks
const audioTracksResult = validateAudioTracks([
    { type: 'Primary', trackId: 'audio1' },
    { type: 'Commentary', trackId: 'audio2' },
]);
if (!audioTracksResult.valid) {
    console.error(audioTracksResult.errors);
}
```

### Supported Audio Types

According to the MovieLabs specification, the following audio types are supported:

- **`AudioType.Primary`** (`'Primary'`) - Standard audio mix
- **`AudioType.Narration`** (`'Narration'`) - Descriptive Audio tracks (for visually impaired)
- **`AudioType.DialogCentric`** (`'Dialog Centric'`) - Audio mix emphasizing dialog
- **`AudioType.Commentary`** (`'Commentary'`) - Commentary audio track (e.g., director's commentary)

**Note:** Both the direct `MMCBuilder.build()` and CSV processor `dataToMMCXml()` automatically validate audio types and will **throw an error** if invalid types are detected.

Example usage:

```typescript
import { AudioType } from 'mec-mmc-maker';

const audio = [
    {
        trackId: 'audio_en',
        type: AudioType.Primary,
        language: 'en',
        location: 'path/to/audio.mp4',
    },
    {
        trackId: 'audio_narration',
        type: AudioType.Narration,
        language: 'en',
        location: 'path/to/narration.mp4',
    },
    {
        trackId: 'audio_commentary',
        type: AudioType.Commentary,
        language: 'en',
        location: 'path/to/commentary.mp4',
    },
];
```

## API Documentation

All interfaces and methods include comprehensive JSDoc comments. Your IDE will provide full IntelliSense support.

### Key Interfaces

- **`MECData`**: Complete metadata structure for MEC XML
- **`MMCData`**: Complete manifest structure for MMC XML
- **`LocalizedInfo`**: Language-specific metadata
- **`Genre`**: Genre classification (max 3 total)
- **`CastMember`**: Cast and crew information

### Enums

- **`AudioType`**: Valid audio types (`Primary`, `Narration`, `Dialog Centric`, `Commentary`)
- **`ExperienceType`**: Experience types (`Movie`, `Series`, `Season`, `Episode`)
- **`ImagePurpose`**: Image purposes (`Boxart`, `Cover`, `Hero`)
- **`WorkType`**: Work types for MEC content
- **`ReleaseType`**: Release types (e.g., `Theatrical`, `DVD`)
- **`NamespaceType`**: Identifier namespaces (e.g., `EIDR`, `ISAN`)

### Builder Classes

- **`MECBuilder.build(data: MECData): string`**: Generates MEC XML
- **`MMCBuilder.build(data: MMCData): string`**: Generates MMC XML

### Validation Functions

- **`validateXMLStructure(xml: string): boolean`**: Validates XML structure
- **`validateAudioType(audioType: string): ValidationResult`**: Validates a single audio type
- **`validateAudioTracks(tracks: AudioTrack[]): ValidationResult`**: Validates multiple audio tracks
- **`validateMovieLabsID(id: string): ValidationResult`**: Validates MovieLabs ID format
- **`validateAspectRatio(ratio: string): ValidationResult`**: Validates aspect ratio format

## Migration from mdmec-xml-maker

If you're migrating from the old `mdmec-xml-maker` library, see our [Migration Guide](./MIGRATION.md) for detailed instructions and examples.

**Key Changes:**

- Object structures instead of pipe-delimited strings
- camelCase property names instead of PascalCase
- Builder classes instead of function exports
- Strong TypeScript types with full IntelliSense

## Examples

See the [test/sample-data](./test/sample-data/) directory for complete working examples.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Testing

```bash
npm test
```

## License

MIT Licensed. See [LICENSE](./LICENSE) file for details.

## MovieLabs Specification

This library generates XML files compliant with:

- MovieLabs MEC (Media Entertainment Core) v2.9
- MovieLabs MMC (Media Manifest Core) v1.9

### Documentation Resources

- [MovieLabs Specifications](http://www.movielabs.com/md/)
- [Amazon Prime Video - MEC Title Metadata Guide](https://videocentral.amazon.com/support/delivery-experience/mec-title-meta-data)
- [Amazon Prime Video - MMC Asset Manifest Guide](https://videocentral.amazon.com/support/delivery-experience/mmc-asset-manifest)
- [Amazon Prime Video - Metadata Overview](https://videocentral.amazon.com/support/delivery-experience/metadata-guide)
- [Amazon Prime Video Content Delivery](https://videodirect.amazon.com/)

## Related

- [mec-xml-formatter](https://github.com/Wi-flx/mec-mmc-formatter) - REST API service using this library
