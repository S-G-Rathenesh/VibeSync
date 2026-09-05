import React, { useRef, useCallback } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import YoutubePlayer, { YoutubeIframeRef } from 'react-native-youtube-iframe';
import { Theme } from '../theme';

interface VibeYoutubePlayerProps {
  videoId: string;
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

  const safeVideoId = videoId && videoId.trim().length > 0 ? videoId : 'dQw4w9WgXcQ';

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.wrapper, { height }]}>
        <iframe
          width="100%"
          height={height}
          src={`https://www.youtube.com/embed/${safeVideoId}?autoplay=${isPlaying ? 1 : 0}`}
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
        videoId={safeVideoId}
        onChangeState={handleStateChange}
        onError={handleError}
        webViewProps={{
          allowsInlineMediaPlayback: true,
          allowsFullscreenVideo: true,
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
});
