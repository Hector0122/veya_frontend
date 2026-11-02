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

/** Los mismos estados, dichos como se dicen de un libro. */
export const BOOK_STATUS_LABELS: Record<ContentStatus, string> = {
  pendiente: 'Quiero leer',
  viendo: 'Leyendo',
  terminado: 'Leído',
  abandonado: 'Abandonado',
};

/** Orden de las pestañas de libros: primero lo que se está leyendo. */
export const BOOK_STATUSES: ContentStatus[] = ['viendo', 'pendiente', 'terminado', 'abandonado'];

export interface UserContent {
  id: string;
  userId: string;
  contentId: string;
  status: ContentStatus;
  isFavorite: boolean;
  rating: number | null;
  currentSeason: number | null;
  currentEpisode: number | null;
  /** Solo libros. */
  currentPage: number | null;
  totalPages: number | null;
  addedAt: string;
  updatedAt: string;
  finishedAt: string | null;
  notes: string | null;
  content: Content;
}

export interface CreateTrackingInput {
  contentId: string;
  /** Sin estado, un libro se registra como leído. */
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
  currentPage?: number;
  totalPages?: number;
  notes?: string;
}
