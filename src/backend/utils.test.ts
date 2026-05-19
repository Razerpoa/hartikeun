import { describe, it, expect } from 'vitest';
import { normalizeSlang, getCacheKey } from './utils.js';

describe('normalizeSlang', () => {
  it('normalizes entirely repeated vowel sequences to 2 characters', () => {
    expect(normalizeSlang('aa')).toBe('aa');
    expect(normalizeSlang('aaa')).toBe('aa');
    expect(normalizeSlang('aaaa')).toBe('aa');
    expect(normalizeSlang('uuuu')).toBe('uu');
    expect(normalizeSlang('iiii')).toBe('ii');
    expect(normalizeSlang('eeee')).toBe('ee');
  });

  it('collapses repeated vowels (2+) to 1 within mixed words', () => {
    expect(normalizeSlang('maaa')).toBe('ma');
    expect(normalizeSlang('baaang')).toBe('bang');
    expect(normalizeSlang('kuuuciiing')).toBe('kucing');
  });

  it('collapses 3+ repeated consonants to 1 while preserving double consonants', () => {
    expect(normalizeSlang('tttt')).toBe('t');
    expect(normalizeSlang('kkkkk')).toBe('k');
    expect(normalizeSlang('bangeettt')).toBe('banget');
    expect(normalizeSlang('hhh')).toBe('h');
  });

  it('preserves double consonants (exactly 2)', () => {
    expect(normalizeSlang('tt')).toBe('tt');
    expect(normalizeSlang('ll')).toBe('ll');
    expect(normalizeSlang('kk')).toBe('kk');
  });

  it('preserves whitespace', () => {
    expect(normalizeSlang('hello   world')).toBe('hello   world');
    expect(normalizeSlang('  spaced  out  ')).toBe('  spaced  out  ');
  });

  it('handles empty string', () => {
    expect(normalizeSlang('')).toBe('');
  });

  it('handles single character', () => {
    expect(normalizeSlang('a')).toBe('a');
    expect(normalizeSlang('b')).toBe('b');
  });

  it('preserves digits', () => {
    expect(normalizeSlang('test123')).toBe('test123');
    expect(normalizeSlang('123')).toBe('123');
  });

  it('handles mixed content with various patterns', () => {
    expect(normalizeSlang('kumaha aa aaaa')).toBe('kumaha aa aa');
  });
});

describe('getCacheKey', () => {
  it('trims and lowercases the input text', () => {
    expect(getCacheKey('transform', 'id', '  Hello World  ')).toBe('transform:id:hello world');
  });

  it('normalizes eu to e for words longer than 3 characters', () => {
    expect(getCacheKey('transform', 'id', 'hideung')).toBe('transform:id:hideng');
    expect(getCacheKey('transform', 'id', 'heureuy')).toBe('transform:id:herey');
  });

  it('does not normalize eu for words of 3 characters or less', () => {
    expect(getCacheKey('transform', 'id', 'teu')).toBe('transform:id:teu');
    expect(getCacheKey('transform', 'id', 'eu')).toBe('transform:id:eu');
  });

  it('includes extra parameter when provided', () => {
    expect(getCacheKey('transform', 'id', 'halo', '50')).toBe('transform:id:50:halo');
  });

  it('handles multiple words with selective eu normalization', () => {
    expect(getCacheKey('details', 'id', 'hideung teu')).toBe('details:id:hideng teu');
  });

  it('works with different prefixes', () => {
    expect(getCacheKey('details', 'en', 'word')).toBe('details:en:word');
  });

  it('handles empty text gracefully', () => {
    expect(getCacheKey('transform', 'id', '')).toBe('transform:id:');
  });
});
