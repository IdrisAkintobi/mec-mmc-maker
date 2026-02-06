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
            artReference: [{
                reference: 'path/to/cover.jpg',
                resolution: '1920x1080',
                purpose: 'cover'
            }]
        }
    ],
    genre: [
        { primary: 'Action', subGenre: ['Adventure', 'Thriller'] }
    ],
    releaseYear: '2023',
    releaseDate: '2023-12-25',
    releaseHistory: [{
        type: ReleaseType.Theatrical,
        country: 'US',
        date: '2023-12-25'
    }],
    workType: WorkType.Movie,
    identifier: [{
        namespace: NamespaceType.EIDR,
        value: '10.5240/1234-5678-90AB-CDEF-GHIJ-K'
    }],
    cast: [{
        jobFunction: 'Actor',
        billingBlockOrder: '1',
        displayName: {
            'en-US': 'John Doe',
            'es-ES': 'Juan Pérez'
        }
    }],
    originalLanguage: 'en',
    organization: {
        id: 'org123',
        role: 'Producer'
    },
    companyDisplayCredit: {
        value: 'Sample Studios',
        language: 'en-US'
    }
};

const mecXml = MECBuilder.build(mecData);
console.log(mecXml); // <?xml version="1.0" encoding="UTF-8"?>...
```

### Building MMC XML

```typescript
import { MMCBuilder, MMCData, ExperienceType, ImagePurpose } from 'mec-mmc-maker';

const mmcData: MMCData = {
    audio: [{
        trackId: 'audio1',
        type: 'Primary',
        language: 'en',
        location: 'path/to/audio.mp4',
        hash: 'abc123'
    }],
    video: [{
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
            progressiveScanOrder: 'Top'
        }
    }],
    presentation: [{
        id: 'pres1',
        trackNum: '1',
        videoId: 'video1',
        audioId: 'audio1'
    }],
    experience: [{
        id: 'exp1',
        type: ExperienceType.Movie,
        subType: 'Feature'
    }],
    alidExperience: [{
        alid: 'alid1',
        experienceId: 'exp1'
    }]
};

const mmcXml = MMCBuilder.build(mmcData);
```

### XML Validation

```typescript
import { validateXMLStructure } from 'mec-mmc-maker';

const isValid = validateXMLStructure(xmlString);
if (isValid) {
    console.log('XML is valid!');
}
```

## API Documentation

All interfaces and methods include comprehensive JSDoc comments. Your IDE will provide full IntelliSense support.

### Key Interfaces

- **`MECData`**: Complete metadata structure for MEC XML
- **`MMCData`**: Complete manifest structure for MMC XML
- **`LocalizedInfo`**: Language-specific metadata
- **`Genre`**: Genre classification (max 3 total)
- **`CastMember`**: Cast and crew information

### Builder Classes

- **`MECBuilder.build(data: MECData): string`**: Generates MEC XML
- **`MMCBuilder.build(data: MMCData): string`**: Generates MMC XML

## Migration from mdmec-xml-maker

If you're migrating from the old `mdmec-xml-maker` library, see our [Migration Guide](./MIGRATION.md) for detailed instructions and examples.

**Key Changes:**
- Object structures instead of semicolon-delimited strings
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

## Related

- [MovieLabs Specifications](http://www.movielabs.com/md/)
- [Amazon Prime Video Content Delivery](https://videodirect.amazon.com/)
