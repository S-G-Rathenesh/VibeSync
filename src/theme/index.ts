import { StyleSheet } from 'react-native';

export const Theme = {
  colors: {
    background: '#0A0A0A',
    cardBackground: '#141419',
    cardBorder: 'rgba(255, 255, 255, 0.08)',
    glassBackground: 'rgba(255, 255, 255, 0.04)',
    glassBorder: 'rgba(255, 255, 255, 0.12)',
    primary: '#FF0055', // Vibrant neon magenta
    secondary: '#8A2BE2', // Electric purple
    accent: '#00E5FF', // Neon cyan
    success: '#00E676',
    warning: '#FFD600',
    textPrimary: '#FFFFFF',
    textSecondary: '#D0D0E0',
    textMuted: '#A0A0B5',
    error: '#FF453A',
    overlay: 'rgba(0, 0, 0, 0.75)',
  },
  borderRadius: {
    sm: 8,
    md: 14,
    lg: 22,
    full: 9999,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
};

export const GlobalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  glassCard: {
    backgroundColor: Theme.colors.glassBackground,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.glassBorder,
    padding: Theme.spacing.md,
  },
  titleText: {
    fontSize: 22,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    letterSpacing: 0.3,
  },
  subtitleText: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.textPrimary,
  },
  bodyText: {
    fontSize: 14,
    color: Theme.colors.textSecondary,
  },
  captionText: {
    fontSize: 12,
    color: Theme.colors.textMuted,
  },
  gradientButton: {
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.md,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
