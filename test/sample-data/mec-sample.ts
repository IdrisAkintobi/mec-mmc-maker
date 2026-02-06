import { CategoryEnum, MECData, NamespaceType, ReleaseType, WorkType } from '../../src/types/mec.types';

export const sampleMECData: MECData = {
    contentId: 'content123',
    localizedInfo: [
        {
            language: 'en-US',
            titleDisplay: 'Sample Title',
            titleSort: 'Sample Title',
            summary190: 'Short summary',
            summary400: 'Longer summary',
            artReference: [
                {
                    reference: 'path/to/image.jpg',
                    resolution: '1920x1080',
                    purpose: 'cover',
                },
            ],
        },
        {
            language: 'es-ES',
            titleDisplay: 'Título de Muestra',
            titleSort: 'Título de Muestra',
        },
    ],
    genre: [
        {
            primary: 'Action',
            subGenre: ['Adventure', 'Thriller'],
        },
    ],
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
    rating: [
        {
            country: 'US',
            system: 'MPAA',
            value: 'PG-13',
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
    category: {
        type: CategoryEnum.Feature,
        sequenceNumber: '1',
        parentContentId: 'parent123',
    },
};
