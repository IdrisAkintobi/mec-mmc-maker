/**
 * Safely split a string by delimiter
 * Returns empty array if value is undefined, null, or empty string
 *
 * @param value - String to split
 * @param delimiter - Delimiter to split by
 * @returns Array of strings
 */
export function safeSplit(value: string | undefined | null, delimiter: string): string[] {
    if (!value || value.trim() === '') {
        return [];
    }
    return value.split(delimiter);
}

/**
 * Check if array has any non-empty values
 */
export function hasValues(arr: string[]): boolean {
    return arr.some(v => v && v.trim() !== '');
}
