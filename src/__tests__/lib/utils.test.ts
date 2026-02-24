import '@testing-library/jest-dom';
import {
    cn,
    formatPrice,
    calculateDiscount,
    generateSlug,
    truncateText,
    isValidEmail,
    isValidPhone,
    isValidPincode,
    formatPhone,
    calculateDeliveryDate,
    generateId,
    getInitials,
    calculateCartTotals,
    isOnSale,
    getRatingStars,
    formatNumber,
    getTimeAgo,
    shuffleArray,
    groupBy,
} from '@/lib/utils';

// ---------------------------------------------------------------------------
// cn (class merge)
// ---------------------------------------------------------------------------
describe('cn', () => {
    it('merges class names', () => {
        expect(cn('foo', 'bar')).toBe('foo bar');
    });

    it('handles conditional classes', () => {
        expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
    });

    it('deduplicates Tailwind classes', () => {
        expect(cn('px-2', 'px-4')).toBe('px-4');
    });
});

// ---------------------------------------------------------------------------
// formatPrice
// ---------------------------------------------------------------------------
describe('formatPrice', () => {
    it('formats a whole dollar amount as AUD', () => {
        const result = formatPrice(100);
        expect(result).toContain('100');
        expect(result).toMatch(/A?\$|AUD/);
    });

    it('formats price with two decimal places', () => {
        const result = formatPrice(49.9);
        expect(result).toContain('49.90');
    });

    it('formats zero correctly', () => {
        const result = formatPrice(0);
        expect(result).toContain('0.00');
    });

    it('formats large numbers', () => {
        const result = formatPrice(1234.56);
        expect(result).toContain('1,234.56');
    });
});

// ---------------------------------------------------------------------------
// calculateDiscount
// ---------------------------------------------------------------------------
describe('calculateDiscount', () => {
    it('returns correct discount percentage', () => {
        expect(calculateDiscount(100, 75)).toBe(25);
    });

    it('returns 0 for same price', () => {
        expect(calculateDiscount(100, 100)).toBe(0);
    });

    it('rounds to nearest integer', () => {
        // (100 - 33) / 100 * 100 = 67%
        expect(calculateDiscount(100, 33)).toBe(67);
    });

    it('handles decimal prices', () => {
        const discount = calculateDiscount(199.99, 99.99);
        expect(discount).toBeGreaterThan(49);
        expect(discount).toBeLessThan(51);
    });
});

// ---------------------------------------------------------------------------
// generateSlug
// ---------------------------------------------------------------------------
describe('generateSlug', () => {
    it('converts spaces to hyphens', () => {
        expect(generateSlug('Hello World')).toBe('hello-world');
    });

    it('removes special characters', () => {
        expect(generateSlug('Raadhya! Ethnica@')).toBe('raadhya-ethnica');
    });

    it('lowercases the result', () => {
        expect(generateSlug('UPPERCASE')).toBe('uppercase');
    });

    it('trims leading/trailing hyphens', () => {
        expect(generateSlug('-leading trailing-')).toBe('leading-trailing');
    });

    it('collapses multiple spaces', () => {
        expect(generateSlug('a   b')).toBe('a-b');
    });
});

// ---------------------------------------------------------------------------
// truncateText
// ---------------------------------------------------------------------------
describe('truncateText', () => {
    it('returns text unchanged when within limit', () => {
        expect(truncateText('Hello', 10)).toBe('Hello');
    });

    it('truncates and appends ellipsis', () => {
        const result = truncateText('Hello World', 5);
        expect(result).toBe('Hello...');
    });

    it('handles exact length', () => {
        expect(truncateText('Hello', 5)).toBe('Hello');
    });
});

// ---------------------------------------------------------------------------
// isValidEmail
// ---------------------------------------------------------------------------
describe('isValidEmail', () => {
    it('returns true for valid emails', () => {
        expect(isValidEmail('user@example.com')).toBe(true);
        expect(isValidEmail('test.user+tag@sub.domain.org')).toBe(true);
    });

    it('returns false for invalid emails', () => {
        expect(isValidEmail('notanemail')).toBe(false);
        expect(isValidEmail('missing@dot')).toBe(false);
        expect(isValidEmail('@nodomain.com')).toBe(false);
        expect(isValidEmail('')).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// isValidPhone
// ---------------------------------------------------------------------------
describe('isValidPhone', () => {
    it('accepts valid Australian mobile numbers (04xxxxxxxx)', () => {
        expect(isValidPhone('0412345678')).toBe(true);
    });

    it('accepts valid Australian numbers with +61 prefix', () => {
        expect(isValidPhone('+61412345678')).toBe(true);
    });

    it('rejects landlines and invalid numbers', () => {
        expect(isValidPhone('0299887766')).toBe(false); // landline
        expect(isValidPhone('1234')).toBe(false);
        expect(isValidPhone('')).toBe(false);
    });

    it('handles numbers with spaces', () => {
        expect(isValidPhone('0412 345 678')).toBe(true);
    });
});

// ---------------------------------------------------------------------------
// isValidPincode
// ---------------------------------------------------------------------------
describe('isValidPincode', () => {
    it('accepts valid 4-digit AU postcodes', () => {
        expect(isValidPincode('2000')).toBe(true);
        expect(isValidPincode('4000')).toBe(true);
    });

    it('rejects invalid postcodes', () => {
        expect(isValidPincode('200')).toBe(false);
        expect(isValidPincode('20000')).toBe(false);
        expect(isValidPincode('ABCD')).toBe(false);
        expect(isValidPincode('')).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// formatPhone
// ---------------------------------------------------------------------------
describe('formatPhone', () => {
    it('formats Australian mobile to +61 format', () => {
        expect(formatPhone('0412345678')).toBe('+61 412 345 678');
    });

    it('returns the original string if format unrecognised', () => {
        expect(formatPhone('1234567890')).toBe('1234567890');
    });
});

// ---------------------------------------------------------------------------
// calculateCartTotals
// ---------------------------------------------------------------------------
describe('calculateCartTotals', () => {
    it('applies free shipping above $150', () => {
        const result = calculateCartTotals(200, 0, 10);
        expect(result.shipping).toBe(0);
    });

    it('applies shipping charge below $150', () => {
        const result = calculateCartTotals(100, 0, 10);
        expect(result.shipping).toBe(10);
    });

    it('calculates 5% GST on (subtotal - discount)', () => {
        const result = calculateCartTotals(100, 0, 0);
        expect(result.tax).toBe(5); // 5% of 100
    });

    it('applies discount before calculating tax', () => {
        const result = calculateCartTotals(100, 20, 0);
        expect(result.tax).toBe(4); // 5% of 80
    });

    it('computes total correctly', () => {
        const result = calculateCartTotals(100, 10, 10);
        // tax = Math.round((100-10) * 0.05) = Math.round(4.5) = 5
        // total: 100 - 10 + 10 + 5 = 105
        expect(result.tax).toBe(5);
        expect(result.total).toBe(105);
    });

    it('defaults discount and shipping to 0', () => {
        const result = calculateCartTotals(50);
        expect(result.discount).toBe(0);
        expect(result.shipping).toBe(0);
    });
});

// ---------------------------------------------------------------------------
// isOnSale
// ---------------------------------------------------------------------------
describe('isOnSale', () => {
    it('returns true when salePrice < originalPrice', () => {
        expect(isOnSale(100, 80)).toBe(true);
    });

    it('returns false when prices are equal', () => {
        expect(isOnSale(100, 100)).toBe(false);
    });

    it('returns false when salePrice > originalPrice', () => {
        expect(isOnSale(80, 100)).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// getRatingStars
// ---------------------------------------------------------------------------
describe('getRatingStars', () => {
    it('returns correct filled/half/empty for a whole rating', () => {
        const stars = getRatingStars(3);
        expect(stars.filled).toBe(3);
        expect(stars.half).toBe(false);
        expect(stars.empty).toBe(2);
    });

    it('returns half star for .5 rating', () => {
        const stars = getRatingStars(3.5);
        expect(stars.filled).toBe(3);
        expect(stars.half).toBe(true);
        expect(stars.empty).toBe(1);
    });

    it('handles 5 stars', () => {
        const stars = getRatingStars(5);
        expect(stars.filled).toBe(5);
        expect(stars.half).toBe(false);
        expect(stars.empty).toBe(0);
    });

    it('handles 0 stars', () => {
        const stars = getRatingStars(0);
        expect(stars.filled).toBe(0);
        expect(stars.half).toBe(false);
        expect(stars.empty).toBe(5);
    });
});

// ---------------------------------------------------------------------------
// getInitials
// ---------------------------------------------------------------------------
describe('getInitials', () => {
    it('returns uppercase initials for two-word name', () => {
        expect(getInitials('John Doe')).toBe('JD');
    });

    it('returns single initial for one-word name', () => {
        expect(getInitials('Raadhya')).toBe('R');
    });

    it('returns at most 2 initials for long names', () => {
        expect(getInitials('John Michael Doe')).toBe('JM');
    });
});

// ---------------------------------------------------------------------------
// formatNumber
// ---------------------------------------------------------------------------
describe('formatNumber', () => {
    it('returns plain string for numbers below 1000', () => {
        expect(formatNumber(500)).toBe('500');
    });

    it('returns K suffix for thousands', () => {
        expect(formatNumber(1500)).toBe('1.5K');
        expect(formatNumber(1000)).toBe('1.0K');
    });

    it('returns M suffix for millions', () => {
        expect(formatNumber(2500000)).toBe('2.5M');
    });
});

// ---------------------------------------------------------------------------
// getTimeAgo
// ---------------------------------------------------------------------------
describe('getTimeAgo', () => {
    it('returns "just now" for very recent timestamps', () => {
        const now = new Date();
        expect(getTimeAgo(now)).toBe('just now');
    });

    it('returns minutes for timestamps < 1 hour ago', () => {
        const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000);
        expect(getTimeAgo(tenMinsAgo)).toMatch(/\d+ minutes ago/);
    });

    it('returns hours for timestamps < 1 day ago', () => {
        const twoHoursAgo = new Date(Date.now() - 2 * 3600 * 1000);
        expect(getTimeAgo(twoHoursAgo)).toMatch(/\d+ hours ago/);
    });

    it('returns days for timestamps < 1 week ago', () => {
        const twoDaysAgo = new Date(Date.now() - 2 * 86400 * 1000);
        expect(getTimeAgo(twoDaysAgo)).toMatch(/\d+ days ago/);
    });
});

// ---------------------------------------------------------------------------
// shuffleArray
// ---------------------------------------------------------------------------
describe('shuffleArray', () => {
    it('returns array with same elements', () => {
        const input = [1, 2, 3, 4, 5];
        const shuffled = shuffleArray(input);
        expect(shuffled).toHaveLength(input.length);
        expect(shuffled.sort()).toEqual(input.sort());
    });

    it('does not mutate the original array', () => {
        const input = [1, 2, 3];
        const original = [...input];
        shuffleArray(input);
        expect(input).toEqual(original);
    });
});

// ---------------------------------------------------------------------------
// groupBy
// ---------------------------------------------------------------------------
describe('groupBy', () => {
    it('groups array items by key', () => {
        const items = [
            { type: 'a', value: 1 },
            { type: 'b', value: 2 },
            { type: 'a', value: 3 },
        ];
        const grouped = groupBy(items, 'type');
        expect(grouped['a']).toHaveLength(2);
        expect(grouped['b']).toHaveLength(1);
    });

    it('returns empty object for empty array', () => {
        expect(groupBy([], 'key' as never)).toEqual({});
    });
});

// ---------------------------------------------------------------------------
// generateId
// ---------------------------------------------------------------------------
describe('generateId', () => {
    it('generates a non-empty string', () => {
        const id = generateId();
        expect(typeof id).toBe('string');
        expect(id.length).toBeGreaterThan(0);
    });

    it('generates unique IDs', () => {
        const ids = new Set(Array.from({ length: 100 }, generateId));
        expect(ids.size).toBe(100);
    });
});
