/**
 * Language and Genre code validation for Amazon Prime Video
 * Based on RFC 5646 for languages and Amazon's genre list
 */

import { ValidationResult } from './validation.helper';

/**
 * Common RFC 5646 language codes supported by Amazon Prime Video
 * This is not exhaustive but covers the most common cases
 */
const COMMON_LANGUAGE_CODES = [
    'en',
    'en-US',
    'en-GB',
    'en-CA',
    'en-AU',
    'es',
    'es-ES',
    'es-MX',
    'es-AR',
    'fr',
    'fr-FR',
    'fr-CA',
    'de',
    'de-DE',
    'de-AT',
    'it',
    'it-IT',
    'pt',
    'pt-BR',
    'pt-PT',
    'ja',
    'ja-JP',
    'zh',
    'zh-CN',
    'zh-TW',
    'zh-HK',
    'ko',
    'ko-KR',
    'ar',
    'ar-SA',
    'ar-EG',
    'hi',
    'hi-IN',
    'ru',
    'ru-RU',
    'nl',
    'nl-NL',
    'sv',
    'sv-SE',
    'no',
    'no-NO',
    'da',
    'da-DK',
    'fi',
    'fi-FI',
    'pl',
    'pl-PL',
    'tr',
    'tr-TR',
    'th',
    'th-TH',
    'vi',
    'vi-VN',
    'id',
    'id-ID',
    'ms',
    'ms-MY',
    'tl',
    'tl-PH',
];

/**
 * Amazon Prime Video genre codes
 * Based on the Prime Video genre taxonomy
 */
const AMAZON_GENRE_CODES: Record<string, string[]> = {
    // Primary Genres
    action: ['action'],
    adventure: ['adventure'],
    animation: ['animation', 'anime'],
    comedy: ['comedy', 'romantic_comedy', 'dark_comedy', 'slapstick'],
    crime: ['crime', 'true_crime'],
    documentary: ['documentary', 'docuseries'],
    drama: ['drama', 'melodrama', 'family_drama'],
    fantasy: ['fantasy', 'dark_fantasy'],
    horror: ['horror', 'psychological_horror', 'slasher'],
    mystery: ['mystery', 'whodunit'],
    romance: ['romance', 'romantic_drama'],
    scifi: ['scifi', 'sci-fi', 'science_fiction'],
    thriller: ['thriller', 'psychological_thriller', 'spy_thriller'],
    western: ['western', 'neo_western'],

    // Additional Genres
    arthouse: ['arthouse', 'art_house'],
    biographical: ['biographical', 'biopic', 'biography'],
    children: ['children', 'kids', 'family'],
    coming_of_age: ['coming_of_age'],
    disaster: ['disaster'],
    epic: ['epic', 'historical_epic'],
    experimental: ['experimental'],
    faith: ['faith', 'religious', 'spiritual'],
    historical: ['historical', 'period_drama'],
    indie: ['indie', 'independent'],
    lgbt: ['lgbt', 'lgbtq'],
    military: ['military', 'war'],
    musical: ['musical', 'music'],
    noir: ['noir', 'neo_noir'],
    political: ['political'],
    satire: ['satire', 'parody'],
    sports: ['sports', 'sport'],
    superhero: ['superhero', 'comic_book'],
    supernatural: ['supernatural', 'paranormal'],
    suspense: ['suspense'],
    teen: ['teen', 'young_adult'],
    urban: ['urban', 'street'],
};

/**
 * Validate RFC 5646 language code
 * @param languageCode - Language code to validate (e.g., "en-US", "ja-JP")
 * @returns Validation result
 *
 * @example
 * validateLanguageCode("en-US") // { valid: true, errors: [], warnings: [] }
 * validateLanguageCode("invalid") // { valid: false, errors: [...], warnings: [] }
 */
export function validateLanguageCode(languageCode: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!languageCode || typeof languageCode !== 'string') {
        return {
            valid: false,
            errors: ['Language code is required'],
            warnings,
        };
    }

    const code = languageCode.trim();

    // RFC 5646 format: language-region (e.g., en-US)
    // or just language (e.g., en)
    const rfc5646Pattern = /^[a-z]{2,3}(-[A-Z]{2})?$/;

    if (!rfc5646Pattern.test(code)) {
        errors.push(
            `Invalid language code format: "${code}". ` + `Expected RFC 5646 format (e.g., "en", "en-US", "ja-JP")`,
        );
        return { valid: false, errors, warnings };
    }

    // Check against common codes
    if (!COMMON_LANGUAGE_CODES.includes(code)) {
        warnings.push(
            `Uncommon language code: "${code}". ` +
                `If this is correct, ignore this warning. ` +
                `Common codes include: ${COMMON_LANGUAGE_CODES.slice(0, 10).join(', ')}, etc.`,
        );
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
}

/**
 * Validate batch of language codes
 * @param languageCodes - Array or semicolon-separated string of language codes
 * @returns Validation result
 */
export function validateLanguageCodes(languageCodes: string | string[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const codes = Array.isArray(languageCodes) ? languageCodes : languageCodes.split(';');

    if (codes.length === 0) {
        return {
            valid: false,
            errors: ['At least one language code is required'],
            warnings,
        };
    }

    codes.forEach((code, index) => {
        const result = validateLanguageCode(code.trim());
        if (!result.valid) {
            errors.push(`Language[${index}]: ${result.errors.join(', ')}`);
        }
        warnings.push(...result.warnings.map(w => `Language[${index}]: ${w}`));
    });

    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
}

/**
 * Validate genre code against Amazon Prime Video genre list
 * @param genreCode - Genre code to validate
 * @returns Validation result
 *
 * @example
 * validateGenreCode("action") // { valid: true, errors: [], warnings: [] }
 * validateGenreCode("invalid_genre") // { valid: false, errors: [...], warnings: [] }
 */
export function validateGenreCode(genreCode: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!genreCode || typeof genreCode !== 'string') {
        return {
            valid: false,
            errors: ['Genre code is required'],
            warnings,
        };
    }

    const code = genreCode.trim().toLowerCase();

    // Check if genre exists
    const allGenres = Object.values(AMAZON_GENRE_CODES).flat();
    if (!allGenres.includes(code)) {
        errors.push(
            `Unknown genre code: "${genreCode}". ` +
                `Valid genres include: ${Object.keys(AMAZON_GENRE_CODES).slice(0, 10).join(', ')}, etc.`,
        );
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
}

/**
 * Validate batch of genre codes
 * Amazon Prime allows max 3 genres (including subgenres)
 * @param genreCodes - Array or semicolon-separated string of genre codes
 * @returns Validation result
 */
export function validateGenreCodes(genreCodes: string | string[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const codes = Array.isArray(genreCodes) ? genreCodes : genreCodes.split(';');

    if (codes.length === 0) {
        return {
            valid: false,
            errors: ['At least one genre is required'],
            warnings,
        };
    }

    // Amazon Prime limit
    if (codes.length > 3) {
        errors.push(
            `Too many genres: ${codes.length}. Amazon Prime Video allows maximum 3 genres (including subgenres)`,
        );
    }

    codes.forEach((code, index) => {
        const result = validateGenreCode(code.trim());
        if (!result.valid) {
            errors.push(`Genre[${index}]: ${result.errors.join(', ')}`);
        }
        warnings.push(...result.warnings.map(w => `Genre[${index}]: ${w}`));
    });

    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
}

/**
 * Validate rating system for a country
 * @param country - ISO 3166-1 country code
 * @param system - Rating system code
 * @returns Validation result
 */
export function validateRatingSystem(country: string, system: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Common country/system pairs
    const validSystems: Record<string, string[]> = {
        US: ['MPAA', 'TV'],
        GB: ['BBFC'],
        FR: ['CNC'],
        DE: ['FSK'],
        AU: ['ACB'],
        CA: ['CHVRS'],
        JP: ['EIRIN', 'CERO'],
        BR: ['DJCTQ'],
        IN: ['CBFC'],
        MX: ['RTC'],
        NG: ['NFVCB'],
        GH: ['NMC'],
        KE: ['KFCB'],
        ZA: ['FPB'],
    };

    if (!country || !system) {
        return {
            valid: false,
            errors: ['Both country and rating system are required'],
            warnings,
        };
    }

    const countryUpper = country.toUpperCase();
    const systemUpper = system.toUpperCase();

    // Check if country has known rating systems
    if (validSystems[countryUpper]) {
        if (!validSystems[countryUpper].includes(systemUpper)) {
            warnings.push(
                `Rating system "${system}" not typically used in ${country}. ` +
                    `Expected: ${validSystems[countryUpper].join(', ')}`,
            );
        }
    } else {
        warnings.push(`Rating system for country "${country}" not in common list. ` + `Verify this is correct.`);
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
}

/**
 * Get list of supported language codes
 * @returns Array of common language codes
 */
export function getSupportedLanguages(): string[] {
    return [...COMMON_LANGUAGE_CODES];
}

/**
 * Get list of supported genre codes
 * @returns Array of all genre codes
 */
export function getSupportedGenres(): string[] {
    return Object.keys(AMAZON_GENRE_CODES);
}

/**
 * Get genre suggestions based on partial input
 * @param partial - Partial genre code
 * @returns Array of matching genre codes
 */
export function suggestGenres(partial: string): string[] {
    const lowerPartial = partial.toLowerCase();
    return Object.keys(AMAZON_GENRE_CODES).filter(genre => genre.includes(lowerPartial));
}

/**
 * Get language suggestions based on partial input
 * @param partial - Partial language code
 * @returns Array of matching language codes
 */
export function suggestLanguages(partial: string): string[] {
    const lowerPartial = partial.toLowerCase();
    return COMMON_LANGUAGE_CODES.filter(lang => lang.toLowerCase().includes(lowerPartial));
}
