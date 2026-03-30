/**
 * Utility for handling money formatting and parsing in the ProdManager ecosystem.
 * Follows es-AR locale standards by default.
 */

export interface MoneyFormatOptions {
    currencySymbol?: string;
    currencyCode?: string;
    decimals?: number;
    showDecimals?: boolean;
    useGrouping?: boolean;
}

/**
 * Parses a localized money string back into a numeric value.
 * Handles es-AR format (thousands: ., decimal: ,)
 */
export function parseMoney(value: string | number): number {
    if (typeof value === 'number') return value;
    if (!value) return 0;

    // Remove currency symbols and spaces
    let clean = value.replace(/[$\s]/g, '');

    // Robust approach: 
    // 1. Remove all dots (thousands)
    // 2. Replace comma with dot (decimal)
    const normalized = clean.replace(/\./g, '').replace(/,/g, '.');
    const parsed = parseFloat(normalized);

    return isNaN(parsed) ? 0 : parsed;
}

/**
 * Sanitizes input to allow only valid numeric/money characters.
 */
export function sanitizeMoneyInput(value: string): string {
    // Allow digits, one comma (decimal) and optional leading minus
    // Remove everything else
    let sanitized = value.replace(/[^\d,-]/g, '');
    
    // Ensure only one comma exists
    const commaIndex = sanitized.indexOf(',');
    if (commaIndex !== -1) {
        sanitized = 
            sanitized.substring(0, commaIndex + 1) + 
            sanitized.substring(commaIndex + 1).replace(/,/g, '');
    }

    // Ensure minus is only at the start
    if (sanitized.lastIndexOf('-') > 0) {
        sanitized = sanitized.charAt(0) === '-' 
            ? '-' + sanitized.substring(1).replace(/-/g, '')
            : sanitized.replace(/-/g, '');
    }

    return sanitized;
}

/**
 * Formats a number as a currency string.
 */
export function formatMoney(
    amount: number | string,
    options: MoneyFormatOptions = {}
): string {
    const {
        currencySymbol = '$',
        decimals = 2,
        showDecimals = true,
        useGrouping = true
    } = options;

    const numericValue = typeof amount === 'string' ? parseMoney(amount) : amount;

    if (isNaN(numericValue)) return `${currencySymbol} 0,00`;

    const formatter = new Intl.NumberFormat('es-AR', {
        minimumFractionDigits: showDecimals ? decimals : 0,
        maximumFractionDigits: showDecimals ? decimals : 0,
        useGrouping,
    });

    return `${currencySymbol} ${formatter.format(numericValue)}`;
}

/**
 * Legacy formatter maintained for compatibility.
 */
export function formatARS(amount: number): string {
    return formatMoney(amount, { currencySymbol: '$', decimals: 2 });
}
