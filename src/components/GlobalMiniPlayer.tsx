import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { usePlayerStore } from '../store/usePlayerStore';
import { Theme } from '../theme';
import { Play, Pause, X, Maximize2, Radio } from 'lucide-react-native';

export const GlobalMiniPlayer: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { currentVideo, roomId, roomName, isPlaying, isMinimized, isSystemPip, togglePlay, expand, close } =
    usePlayerStore();

  if (!currentVideo || !isMinimized || isSystemPip) {
    return null;
  }

  const handlePressBar = () => {
    expand();
    if (roomId) {
      navigation.navigate('Room', {
        roomId,
        roomName: roomName || 'Sync Room',
        initialVideoId: currentVideo.id,
      });
    } else {
      navigation.navigate('StandalonePlayer', {
        video: currentVideo,
      });
    }
  };

  const thumbnailUrl =
    currentVideo.thumbnailUrl || `https://img.youtube.com/vi/${currentVideo.id}/hqdefault.jpg`;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.touchableContent}
        activeOpacity={0.9}
        onPress={handlePressBar}
      >
        {/* Media Thumbnail */}
        <View style={styles.thumbnailWrapper}>
          <Image source={{ uri: thumbnailUrl }} style={styles.thumbnail} />
          {roomId ? (
            <View style={styles.roomTag}>
              <Radio size={10} color={Theme.colors.accent} />
            </View>
          ) : null}
        </View>

        {/* Media Info */}
        <View style={styles.infoWrapper}>
          <Text style={styles.title} numberOfLines={1}>
            {currentVideo.title || 'Playing Music'}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {roomId ? `Room: ${roomName || roomId}` : currentVideo.channelName || 'VibeSync'}
          </Text>
        </View>

        {/* Controls */}
        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={styles.playButton}
            onPress={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
          >
            {isPlaying ? (
              <Pause size={18} color="#FFFFFF" />
            ) : (
              <Play size={18} color="#FFFFFF" fill="#FFFFFF" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.expandButton}
            onPress={(e) => {
              e.stopPropagation();
              handlePressBar();
            }}
          >
            <Maximize2 size={16} color={Theme.colors.accent} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={(e) => {
              e.stopPropagation();
              close();
            }}
          >
            <X size={18} color={Theme.colors.textMuted} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 68,
    left: 12,
    right: 12,
    backgroundColor: '#181824',
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(138, 43, 226, 0.4)',
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 9999,
  },
  touchableContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  thumbnailWrapper: {
    position: 'relative',
    marginRight: 10,
  },
  thumbnail: {
    width: 46,
    height: 46,
    borderRadius: 8,
    backgroundColor: '#222',
  },
  roomTag: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#000',
    borderRadius: 6,
    padding: 2,
    borderWidth: 1,
    borderColor: Theme.colors.accent,
  },
  infoWrapper: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 11,
    color: Theme.colors.primary,
    fontWeight: '600',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButton: {
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.full,
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  expandButton: {
    padding: 6,
    marginRight: 4,
  },
  closeButton: {
    padding: 6,
  },
});
