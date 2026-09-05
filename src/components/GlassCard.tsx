import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Theme } from '../theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'normal' | 'glow' | 'accent';
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, style, variant = 'normal' }) => {
  return (
    <View
      style={[
        styles.card,
        variant === 'glow' && styles.glow,
        variant === 'accent' && styles.accent,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Theme.colors.glassBackground,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.glassBorder,
    padding: Theme.spacing.md,
    overflow: 'hidden',
  },
  glow: {
    borderColor: 'rgba(255, 0, 85, 0.4)',
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  accent: {
    borderColor: 'rgba(0, 229, 255, 0.4)',
    shadowColor: Theme.colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
});
