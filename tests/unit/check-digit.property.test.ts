import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  computeCheckDigit,
  isValidCheckDigit,
  normalizeAndValidateCorporateNumber,
} from '../../src/domain/check-digit.js';

const twelveDigitString = fc
  .array(fc.integer({ min: 0, max: 9 }), { minLength: 12, maxLength: 12 })
  .map((digits) => digits.join(''));

describe('check-digit property tests', () => {
  it('computeCheckDigit always returns an integer from 1 to 9', () => {
    fc.assert(
      fc.property(twelveDigitString, (basis) => {
        const digit = computeCheckDigit(basis);
        expect(Number.isInteger(digit)).toBe(true);
        expect(digit).toBeGreaterThanOrEqual(1);
        expect(digit).toBeLessThanOrEqual(9);
      }),
      { numRuns: 1000 },
    );
  });

  it('computed check digit always creates a valid 13-digit corporate number', () => {
    fc.assert(
      fc.property(twelveDigitString, (basis) => {
        const corporateNumber = `${computeCheckDigit(basis)}${basis}`;
        expect(isValidCheckDigit(corporateNumber)).toBe(true);
      }),
      { numRuns: 1000 },
    );
  });

  it('changing the check digit to a different non-zero digit makes the number invalid', () => {
    fc.assert(
      fc.property(twelveDigitString, fc.integer({ min: 1, max: 9 }), (basis, replacement) => {
        const correct = computeCheckDigit(basis);
        fc.pre(replacement !== correct);
        const corporateNumber = `${replacement}${basis}`;
        expect(isValidCheckDigit(corporateNumber)).toBe(false);
      }),
      { numRuns: 1000 },
    );
  });

  it('normalizeAndValidateCorporateNumber accepts full-width digits when the underlying number is valid', () => {
    fc.assert(
      fc.property(twelveDigitString, (basis) => {
        const corporateNumber = `${computeCheckDigit(basis)}${basis}`;
        const fullWidth = corporateNumber.replace(/\d/g, (d) =>
          String.fromCharCode(d.charCodeAt(0) + 0xfee0),
        );
        const result = normalizeAndValidateCorporateNumber(fullWidth);
        expect(result.isValid).toBe(true);
        if (result.isValid) {
          expect(result.normalized).toBe(corporateNumber);
        }
      }),
      { numRuns: 500 },
    );
  });

  it('adding hyphens between valid digits still normalizes correctly', () => {
    fc.assert(
      fc.property(twelveDigitString, (basis) => {
        const corporateNumber = `${computeCheckDigit(basis)}${basis}`;
        const hyphenated = `${corporateNumber.slice(0, 4)}-${corporateNumber.slice(4, 8)}-${corporateNumber.slice(8)}`;
        const result = normalizeAndValidateCorporateNumber(hyphenated);
        expect(result.isValid).toBe(true);
        if (result.isValid) {
          expect(result.normalized).toBe(corporateNumber);
        }
      }),
      { numRuns: 500 },
    );
  });
});
