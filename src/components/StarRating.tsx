import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

interface StarRatingProps {
  value: number | null;
  onChange?: (value: number) => void;
  size?: number;
}

/** Calificación de 1 a 5 estrellas (VEYA.md > Calificación). */
export function StarRating({ value, onChange, size = 22 }: StarRatingProps) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <View style={styles.row}>
      {stars.map((star) => {
        const filled = (value ?? 0) >= star;
        const StarWrapper = onChange ? Pressable : View;
        return (
          <StarWrapper key={star} onPress={onChange ? () => onChange(star) : undefined}>
            <Text style={{ fontSize: size, color: filled ? colors.primary : colors.muted }}>
              {filled ? '★' : '☆'}
            </Text>
          </StarWrapper>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 4,
  },
});
