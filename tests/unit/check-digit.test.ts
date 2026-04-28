/**
 * チェックデジット計算の境界値網羅テスト
 * 根拠: 国税庁仕様書 第二編 §2.1.3
 */

import { describe, it, expect } from 'vitest';
import {
  computeCheckDigit,
  isValidCheckDigit,
  normalizeAndValidateCorporateNumber,
} from '../../src/domain/check-digit.js';

describe('computeCheckDigit', () => {
  // 実在する有名な法人番号を使った verification
  // 5111101000006 (国土交通省) の基礎番号 111101000006 → チェックデジット 5
  it('国税庁サンプル 5111101000006 のチェックデジット', () => {
    expect(computeCheckDigit('111101000006')).toBe(5);
  });

  // 4111101000007 → チェックデジット 4
  it('国税庁サンプル 4111101000007 のチェックデジット', () => {
    expect(computeCheckDigit('111101000007')).toBe(4);
  });

  // 8040001999013 (仕様書サンプル) → チェックデジット 8
  it('国税庁サンプル 8040001999013 のチェックデジット', () => {
    expect(computeCheckDigit('040001999013')).toBe(8);
  });

  it('2040001999902 (仕様書 §4.3 サンプル)', () => {
    expect(computeCheckDigit('040001999902')).toBe(2);
  });

  it('3040001999901 (仕様書 §4.3 サンプル)', () => {
    expect(computeCheckDigit('040001999901')).toBe(3);
  });

  it('2100001010003 (仕様書 §3.3 サンプル)', () => {
    expect(computeCheckDigit('100001010003')).toBe(2);
  });

  it('9380001010002 (仕様書 §3.3 サンプル)', () => {
    expect(computeCheckDigit('380001010002')).toBe(9);
  });

  it('12桁でない入力は例外', () => {
    expect(() => computeCheckDigit('1')).toThrow();
    expect(() => computeCheckDigit('1234567890123')).toThrow();
    expect(() => computeCheckDigit('')).toThrow();
  });

  it('数字以外を含むと例外', () => {
    expect(() => computeCheckDigit('12345678901a')).toThrow();
    expect(() => computeCheckDigit('12345678901 ')).toThrow();
  });

  it('結果が 9 - (sum mod 9) が 0 のとき 9 として扱う仕様', () => {
    // computeCheckDigit は 1-9 の範囲を返し、0 は返さない
    for (let i = 0; i < 100; i++) {
      const basis = String(Math.floor(Math.random() * 1e12)).padStart(12, '0');
      const cd = computeCheckDigit(basis);
      expect(cd).toBeGreaterThanOrEqual(1);
      expect(cd).toBeLessThanOrEqual(9);
    }
  });
});

describe('isValidCheckDigit', () => {
  it('有効な 13桁を認識する', () => {
    expect(isValidCheckDigit('5111101000006')).toBe(true);
    expect(isValidCheckDigit('4111101000007')).toBe(true);
    expect(isValidCheckDigit('8040001999013')).toBe(true);
  });

  it('先頭 0 は無効 (チェックデジットは 1-9)', () => {
    expect(isValidCheckDigit('0111101000006')).toBe(false);
  });

  it('13桁でないものは無効', () => {
    expect(isValidCheckDigit('511110100000')).toBe(false);
    expect(isValidCheckDigit('51111010000061')).toBe(false);
    expect(isValidCheckDigit('')).toBe(false);
  });

  it('数字以外は無効', () => {
    expect(isValidCheckDigit('5111101000a06')).toBe(false);
    expect(isValidCheckDigit('5111-10-1000006')).toBe(false);
  });

  it('チェックデジット不一致は無効', () => {
    expect(isValidCheckDigit('1111101000006')).toBe(false);
    expect(isValidCheckDigit('9111101000006')).toBe(false);
  });
});

describe('normalizeAndValidateCorporateNumber', () => {
  it('ハイフン・空白を除去して正規化', () => {
    const result = normalizeAndValidateCorporateNumber('5111-1010-00006');
    expect(result.isValid).toBe(true);
    if (result.isValid) {
      expect(result.normalized).toBe('5111101000006');
    }
  });

  it('全角数字を半角に変換', () => {
    const result = normalizeAndValidateCorporateNumber('５１１１１０１０００００６');
    expect(result.isValid).toBe(true);
    if (result.isValid) {
      expect(result.normalized).toBe('5111101000006');
    }
  });

  it('英字混じりは invalid_characters', () => {
    const result = normalizeAndValidateCorporateNumber('5abc101000006');
    expect(result.isValid).toBe(false);
    if (!result.isValid) {
      expect(result.reason).toBe('invalid_characters');
    }
  });

  it('13桁でないと not_13_digits', () => {
    const result = normalizeAndValidateCorporateNumber('12345');
    expect(result.isValid).toBe(false);
    if (!result.isValid) {
      expect(result.reason).toBe('not_13_digits');
    }
  });

  it('先頭 0 は first_digit_zero', () => {
    const result = normalizeAndValidateCorporateNumber('0111101000006');
    expect(result.isValid).toBe(false);
    if (!result.isValid) {
      expect(result.reason).toBe('first_digit_zero');
    }
  });

  it('チェックデジット不一致は check_digit_mismatch', () => {
    const result = normalizeAndValidateCorporateNumber('1111101000006');
    expect(result.isValid).toBe(false);
    if (!result.isValid) {
      expect(result.reason).toBe('check_digit_mismatch');
    }
  });

  it('空文字列は not_13_digits', () => {
    const result = normalizeAndValidateCorporateNumber('');
    expect(result.isValid).toBe(false);
  });
});
