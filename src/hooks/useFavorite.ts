import { useMemo } from 'react';
import { useMyList } from './queries/useMyList';
import { useTrackingMutations } from './queries/useTrackingMutations';
import type { Content } from '../types/content';
import type { UserContent } from '../types/tracking';

/**
 * Estado + toggle de favorito para cualquier card, esté o no ya en "Mi
 * lista" — si no está, la agrega y la marca favorita en el mismo gesto
 * (mismo flujo que ya usaba el corazón de DetailScreen, ahora reusable
 * desde cualquier lista de cards).
 */
export function useFavorite() {
  const { data: myListData } = useMyList();
  const { addToList, updateTracking } = useTrackingMutations();

  const entryByContentId = useMemo(() => {
    const map = new Map<string, UserContent>();
    for (const row of myListData ?? []) map.set(row.contentId, row);
    return map;
  }, [myListData]);

  const isFavorite = (contentId: string) =>
    entryByContentId.get(contentId)?.isFavorite ?? false;

  const toggleFavorite = (content: Content) => {
    const entry = entryByContentId.get(content.id);
    if (entry) {
      updateTracking.mutate({ id: entry.id, input: { isFavorite: !entry.isFavorite } });
    } else {
      addToList.mutate(
        { contentId: content.id },
        {
          onSuccess: (created) =>
            updateTracking.mutate({ id: created.id, input: { isFavorite: true } }),
        },
      );
    }
  };

  return { isFavorite, toggleFavorite };
}
