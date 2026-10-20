import { Content } from './content';

export type ContentStatus = 'pendiente' | 'viendo' | 'terminado' | 'abandonado';

export const CONTENT_STATUSES: ContentStatus[] = [
  'pendiente',
  'viendo',
  'terminado',
  'abandonado',
];

export const CONTENT_STATUS_LABELS: Record<ContentStatus, string> = {
  pendiente: 'Pendiente',
  viendo: 'Viendo',
  terminado: 'Terminado',
  abandonado: 'Abandonado',
};

export interface UserContent {
  id: string;
  userId: string;
  contentId: string;
  status: ContentStatus;
  isFavorite: boolean;
  rating: number | null;
  currentSeason: number | null;
  currentEpisode: number | null;
  addedAt: string;
  updatedAt: string;
  finishedAt: string | null;
  notes: string | null;
  content: Content;
}

export interface CreateTrackingInput {
  contentId: string;
  /** Ignorado para libros: un libro registrado siempre es un libro leído. */
  status?: ContentStatus;
  rating?: number;
  isFavorite?: boolean;
  notes?: string;
}

export interface UpdateTrackingInput {
  status?: ContentStatus;
  isFavorite?: boolean;
  rating?: number;
  currentSeason?: number;
  currentEpisode?: number;
  notes?: string;
}
