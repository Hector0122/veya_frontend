import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';
import { colors } from '../theme';
import { motion } from '../theme/tokens';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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
      {stars.map((star) => (
        <Star
          key={star}
          filled={(value ?? 0) >= star}
          justSelected={value === star}
          onPress={onChange ? () => onChange(star) : undefined}
          size={size}
        />
      ))}
    </View>
  );
}

function Star({
  filled,
  justSelected,
  onPress,
  size,
}: {
  filled: boolean;
  justSelected: boolean;
  onPress?: () => void;
  size: number;
}) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (justSelected) {
      scale.value = withSequence(
        withSpring(1.3, motion.spring.press),
        withSpring(1, motion.spring.press),
      );
    }
  }, [justSelected, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const StarWrapper = onPress ? AnimatedPressable : Animated.View;

  return (
    <StarWrapper onPress={onPress} style={animatedStyle}>
      <Text style={{ fontSize: size, color: filled ? colors.primary : colors.muted }}>
        {filled ? '★' : '☆'}
      </Text>
    </StarWrapper>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 4,
  },
});
