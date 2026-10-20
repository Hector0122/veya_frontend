export type ContentSource = 'tmdb' | 'anilist' | 'openlibrary';
export type ContentType = 'movie' | 'series' | 'anime' | 'book';

export interface Content {
  id: string;
  source: ContentSource;
  externalId: string;
  type: ContentType;
  title: string;
  originalTitle: string | null;
  posterUrl: string | null;
  backdropUrl: string | null;
  overview: string | null;
  genres: string[];
  releaseDate: string | null;
  metadata: Record<string, unknown> | null;
  cachedAt: string;
}
