import { formatAuthors, formatContentType } from '../src/utils/format';

describe('formatAuthors', () => {
  it('joins up to the max and summarizes the rest', () => {
    expect(formatAuthors({ authors: ['Blake Crouch'] })).toBe('Blake Crouch');
    expect(formatAuthors({ authors: ['A', 'B', 'C'] })).toBe('A, B y otros');
    expect(formatAuthors({ authors: ['A', 'B', 'C'] }, 3)).toBe('A, B, C');
  });

  it('returns null without usable authors', () => {
    expect(formatAuthors(null)).toBeNull();
    expect(formatAuthors({})).toBeNull();
    expect(formatAuthors({ authors: 'Blake Crouch' })).toBeNull();
    expect(formatAuthors({ authors: ['', 3] })).toBeNull();
  });
});

it('labels books', () => {
  expect(formatContentType('book')).toBe('Libro');
});
