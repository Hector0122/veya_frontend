import { useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { trackingService } from '../../services/tracking.service';
import type { CreateTrackingInput, UpdateTrackingInput } from '../../types/tracking';

/** Agregar/actualizar/quitar contenido de "Mi lista", con invalidación de queries. */
export function useTrackingMutations() {
  const queryClient = useQueryClient();

  const invalidateLists = () => {
    queryClient.invalidateQueries({ queryKey: ['myList'] });
    // Un libro marcado como leído sale de "para leer después".
    queryClient.invalidateQueries({ queryKey: ['savedBooks'] });
  };

  const addToList = useMutation({
    mutationFn: (input: CreateTrackingInput) => trackingService.create(input),
    onSuccess: () => {
      invalidateLists();
      Toast.show({ type: 'success', text1: 'Guardado en tu lista' });
    },
    onError: () => {
      Toast.show({ type: 'error', text1: 'No se pudo guardar' });
    },
  });

  const updateTracking = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTrackingInput }) =>
      trackingService.update(id, input),
    onSuccess: invalidateLists,
    onError: () => {
      Toast.show({ type: 'error', text1: 'No se pudo actualizar' });
    },
  });

  const removeFromList = useMutation({
    mutationFn: (id: string) => trackingService.remove(id),
    onSuccess: () => {
      invalidateLists();
      Toast.show({ type: 'success', text1: 'Quitado de tu lista' });
    },
    onError: () => {
      Toast.show({ type: 'error', text1: 'No se pudo quitar' });
    },
  });

  return { addToList, updateTracking, removeFromList };
}
