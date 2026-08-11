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
};

export function formatContentType(type: string): string {
  return CONTENT_TYPE_LABELS[type] ?? type;
}
