import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { YoutubeVideo } from '../types';
import { Theme } from '../theme';
import { Play, Heart } from 'lucide-react-native';

interface VideoCardProps {
  video: YoutubeVideo;
  onPress: () => void;
  onFavoriteToggle?: () => void;
  isFavorite?: boolean;
  horizontal?: boolean;
}

const defaultThumbnail = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500';

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  onPress,
  onFavoriteToggle,
  isFavorite = false,
  horizontal = false,
}) => {
  const thumbnailUri = video?.thumbnailUrl && video.thumbnailUrl.trim().length > 0
    ? video.thumbnailUrl
    : defaultThumbnail;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.container, horizontal ? styles.horizontalContainer : styles.verticalContainer]}
    >
      <View style={styles.thumbnailWrapper}>
        <Image source={{ uri: thumbnailUri }} style={styles.thumbnail} />
        <View style={styles.playOverlay}>
          <Play size={20} color="#FFFFFF" fill="#FFFFFF" />
        </View>
      </View>

      <View style={styles.details}>
        <Text style={styles.title} numberOfLines={2}>
          {video?.title || 'Music Video'}
        </Text>
        <Text style={styles.channelName} numberOfLines={1}>
          {video?.channelName || 'VibeSync'}
        </Text>
      </View>

      {onFavoriteToggle && (
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={(e) => {
            if (e && e.stopPropagation) {
              e.stopPropagation();
            }
            onFavoriteToggle();
          }}
        >
          <Heart
            size={18}
            color={isFavorite ? Theme.colors.primary : Theme.colors.textMuted}
            fill={isFavorite ? Theme.colors.primary : 'transparent'}
          />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Theme.colors.cardBackground,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.cardBorder,
    overflow: 'hidden',
  },
  verticalContainer: {
    width: '100%',
    marginBottom: Theme.spacing.md,
  },
  horizontalContainer: {
    width: 220,
    marginRight: Theme.spacing.md,
  },
  thumbnailWrapper: {
    width: '100%',
    height: 125,
    position: 'relative',
    backgroundColor: '#000',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  playOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(255, 0, 85, 0.85)',
    borderRadius: Theme.borderRadius.full,
    padding: 6,
  },
  details: {
    padding: Theme.spacing.sm,
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.textPrimary,
    marginBottom: 4,
  },
  channelName: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: Theme.borderRadius.full,
    padding: 6,
  },
});
