/**
 * Formats a number as a currency string.
 * @param amount The amount to format.
 * @param currency The currency code (default: 'USD').
 * @param locale The locale to use for formatting (default: 'en-US').
 * @returns The formatted currency string.
 */
export const formatCurrency = (amount: number, currency: string = 'USD', locale: string = 'en-US'): string => {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
    }).format(amount);
};
