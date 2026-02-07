/**
 * Generate a sortable title from display title by removing leading articles
 * According to Amazon Prime Video MEC spec, TitleSort is required by MovieLabs XSD
 * but isn't used by Amazon. It's permissible to provide empty tags.
 *
 * @param titleDisplay - The display title (e.g., "The Lost Cafe")
 * @returns Sortable title with leading articles removed (e.g., "Lost Cafe")
 *
 * @example
 * generateTitleSort("The Lost Cafe") // returns "Lost Cafe"
 * generateTitleSort("A Beautiful Mind") // returns "Beautiful Mind"
 * generateTitleSort("An American Tale") // returns "American Tale"
 * generateTitleSort("Chioma") // returns "Chioma"
 */
export function generateTitleSort(titleDisplay: string): string {
    if (!titleDisplay || typeof titleDisplay !== 'string') {
        return '';
    }

    const trimmed = titleDisplay.trim();

    // Remove leading articles (The, A, An) - case insensitive
    const withoutArticles = trimmed.replace(/^(The|A|An)\s+/i, '');

    return withoutArticles;
}
