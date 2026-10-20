import type { Content } from './content';

export type BookSuggestionStatus = 'suggested' | 'saved' | 'dismissed';

/** De dónde salió la sugerencia: IA, motor de géneros o populares (sin señal). */
export type BookSuggestionSource = 'ai' | 'genre' | 'trending';

export interface BookSuggestion {
  id: string;
  userId: string;
  contentId: string;
  status: BookSuggestionStatus;
  source: BookSuggestionSource;
  synopsis: string | null;
  reason: string | null;
  basedOn: string[];
  createdAt: string;
  expiresAt: string;
  content: Content;
}
