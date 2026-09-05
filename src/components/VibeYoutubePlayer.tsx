import React, { useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import YoutubePlayer, { YoutubeIframeRef } from 'react-native-youtube-iframe';
import { Theme } from '../theme';
import { Video, Music2 } from 'lucide-react-native';

interface VibeYoutubePlayerProps {
  videoId?: string | null;
  isPlaying: boolean;
  onStateChange?: (state: string) => void;
  height?: number;
}

export const VibeYoutubePlayer: React.FC<VibeYoutubePlayerProps> = ({
  videoId,
  isPlaying,
  onStateChange,
  height = 220,
}) => {
  const playerRef = useRef<YoutubeIframeRef>(null);

  const handleStateChange = useCallback(
    (state: string) => {
      if (onStateChange) {
        onStateChange(state);
      }
    },
    [onStateChange]
  );

  const handleError = useCallback((error: string) => {
    console.warn('YouTube Player Warning/Error:', error);
  }, []);

  const cleanVideoId = videoId && videoId.trim().length > 0 ? videoId.trim() : null;

  if (!cleanVideoId) {
    return (
      <View style={[styles.wrapper, styles.emptyContainer, { height }]}>
        <View style={styles.emptyIconBadge}>
          <Music2 size={32} color={Theme.colors.primary} />
        </View>
        <Text style={styles.emptyTitle}>No Video Playing</Text>
        <Text style={styles.emptySubtitle}>
          Add a video to the room queue to start synchronized playback
        </Text>
      </View>
    );
  }

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.wrapper, { height }]}>
        <iframe
          width="100%"
          height={height}
          src={`https://www.youtube.com/embed/${cleanVideoId}?autoplay=${isPlaying ? 1 : 0}`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ borderRadius: 14, border: 'none' }}
        />
      </View>
    );
  }

  return (
    <View style={[styles.wrapper, { height }]}>
      <YoutubePlayer
        ref={playerRef}
        height={height}
        play={isPlaying}
        videoId={cleanVideoId}
        onChangeState={handleStateChange}
        onError={handleError}
        webViewProps={{
          allowsInlineMediaPlayback: true,
          allowsFullscreenVideo: true,
          androidLayerType: 'hardware',
          mediaPlaybackRequiresUserAction: false,
          domStorageEnabled: true,
          javaScriptEnabled: true,
          mixedContentMode: 'always',
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    backgroundColor: '#000000',
    borderRadius: Theme.borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Theme.colors.glassBorder,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.cardBackground,
  },
  emptyIconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 0, 85, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    textAlign: 'center',
    maxWidth: 260,
  },
});
