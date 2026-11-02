export function formatYear(dateString: string | null): string {
  if (!dateString) return '—';
  const year = new Date(dateString).getFullYear();
  return Number.isNaN(year) ? '—' : String(year);
}

export function formatGenres(genres: string[], max = 3): string {
  if (!genres.length) return 'Sin género';
  return genres.slice(0, max).join(' · ');
}

const CONTENT_TYPE_LABELS: Record<string, string> = {
  movie: 'Película',
  series: 'Serie',
  anime: 'Anime',
  book: 'Libro',
};

export function formatContentType(type: string): string {
  return CONTENT_TYPE_LABELS[type] ?? type;
}

/** Autores de un libro (vienen en `metadata.authors` desde Open Library). */
export function formatAuthors(
  metadata: Record<string, unknown> | null,
  max = 2,
): string | null {
  const authors = metadata?.authors;
  if (!Array.isArray(authors)) return null;
  const names = authors.filter(
    (a): a is string => typeof a === 'string' && a.length > 0,
  );
  if (names.length === 0) return null;
  return names.length > max
    ? `${names.slice(0, max).join(', ')} y otros`
    : names.join(', ');
}

/** Porcentaje leído de un libro (0–100), o null si no se sabe el total. */
export function readingPercent(row: {
  currentPage: number | null;
  totalPages: number | null;
}): number | null {
  if (!row.totalPages) return null;
  return Math.min(
    100,
    Math.round(((row.currentPage ?? 0) / row.totalPages) * 100),
  );
}

/** Dónde va el usuario: "T2 · E5" en series, "Pág. 120 de 300" en libros. */
export function progressLabel(row: {
  content: { type: string };
  currentSeason: number | null;
  currentEpisode: number | null;
  currentPage: number | null;
  totalPages: number | null;
}): string | null {
  if (row.content.type === 'book') {
    if (!row.currentPage) return null;
    return row.totalPages
      ? `Pág. ${row.currentPage} de ${row.totalPages}`
      : `Pág. ${row.currentPage}`;
  }
  if (row.currentSeason || row.currentEpisode) {
    return `T${row.currentSeason ?? 1} · E${row.currentEpisode ?? 0}`;
  }
  return null;
}
