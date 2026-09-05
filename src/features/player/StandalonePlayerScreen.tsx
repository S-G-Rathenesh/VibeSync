import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, BackHandler } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { VibeYoutubePlayer } from '../../components/VibeYoutubePlayer';
import { useFavoritesStore } from '../../store/useFavoritesStore';
import { useHistoryStore } from '../../store/useHistoryStore';
import { useAuthStore } from '../../store/useAuthStore';
import { usePlayerStore } from '../../store/usePlayerStore';
import { Theme } from '../../theme';
import { ArrowLeft, Eye, ThumbsUp, Heart, Radio } from 'lucide-react-native';

export const StandalonePlayerScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'StandalonePlayer'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  const video = route.params?.video;

  const user = useAuthStore((state) => state.user);
  const { toggleFavorite, isFavorite } = useFavoritesStore();
  const addToHistory = useHistoryStore((state) => state.addToHistory);

  const playVideo = usePlayerStore((state) => state.playVideo);
  const minimize = usePlayerStore((state) => state.minimize);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const setPlaying = usePlayerStore((state) => state.setPlaying);

  useEffect(() => {
    if (video?.id) {
      playVideo(video);
    }
    if (user && video?.id) {
      addToHistory(user.uid, video);
    }

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      minimize();
      navigation.goBack();
      return true;
    });

    return () => {
      backHandler.remove();
    };
  }, [video?.id]);

  const handleBack = () => {
    minimize();
    navigation.goBack();
  };

  if (!video) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft size={20} color={Theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Player</Text>
          <View style={{ width: 36 }} />
        </View>
        <VibeYoutubePlayer videoId={null} isPlaying={false} />
      </View>
    );
  }

  const viewCountNum = isNaN(parseInt(video.viewCount || '0', 10))
    ? 0
    : parseInt(video.viewCount || '0', 10);

  const likeCountNum = isNaN(parseInt(video.likeCount || '0', 10))
    ? 0
    : parseInt(video.likeCount || '0', 10);

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
          <ArrowLeft size={20} color={Theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {video.title || 'Video Player'}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      {/* YouTube Player */}
      <VibeYoutubePlayer
        videoId={video.id}
        isPlaying={isPlaying}
        onStateChange={(state) => {
          if (state === 'playing') setPlaying(true);
          if (state === 'paused') setPlaying(false);
        }}
        height={230}
      />

      <ScrollView contentContainerStyle={styles.detailsContent} showsVerticalScrollIndicator={false}>
        {/* Video Info */}
        <Text style={styles.videoTitle}>{video.title || 'Music Video'}</Text>
        <Text style={styles.channelName}>{video.channelName || 'VibeSync'}</Text>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Eye size={16} color={Theme.colors.textMuted} style={{ marginRight: 6 }} />
            <Text style={styles.statText}>
              {viewCountNum.toLocaleString()} views
            </Text>
          </View>
          <View style={styles.statItem}>
            <ThumbsUp size={16} color={Theme.colors.textMuted} style={{ marginRight: 6 }} />
            <Text style={styles.statText}>
              {likeCountNum.toLocaleString()} likes
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionButton, isFavorite(video.id) && styles.favoriteActive]}
            onPress={() => user && toggleFavorite(user.uid, video)}
          >
            <Heart
              size={18}
              color={isFavorite(video.id) ? '#FFF' : Theme.colors.primary}
              fill={isFavorite(video.id) ? '#FFF' : 'transparent'}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.actionText, isFavorite(video.id) && { color: '#FFF' }]}>
              {isFavorite(video.id) ? 'Favorited' : 'Favorite'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButtonPrimary}
            onPress={() =>
              navigation.navigate('Room', {
                roomId: `room_${video.id}`,
                roomName: `${(video.title || 'Music').slice(0, 20)} Room`,
                initialVideoId: video.id,
              })
            }
          >
            <Radio size={18} color="#FFF" style={{ marginRight: 6 }} />
            <Text style={styles.actionTextPrimary}>Start Room</Text>
          </TouchableOpacity>
        </View>

        {/* Description Card */}
        {video.description ? (
          <View style={styles.descriptionCard}>
            <Text style={styles.descriptionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{video.description}</Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    paddingTop: 45,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.md,
    paddingBottom: Theme.spacing.sm,
  },
  backButton: {
    padding: 8,
    backgroundColor: Theme.colors.glassBackground,
    borderRadius: Theme.borderRadius.full,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  detailsContent: {
    padding: Theme.spacing.md,
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Theme.colors.textPrimary,
    marginBottom: 6,
    lineHeight: 24,
  },
  channelName: {
    fontSize: 14,
    color: Theme.colors.primary,
    fontWeight: '600',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  statText: {
    fontSize: 13,
    color: Theme.colors.textMuted,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 0, 85, 0.1)',
    borderRadius: Theme.borderRadius.md,
    paddingVertical: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 85, 0.3)',
  },
  favoriteActive: {
    backgroundColor: Theme.colors.primary,
  },
  actionText: {
    color: Theme.colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  actionButtonPrimary: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.accent,
    borderRadius: Theme.borderRadius.md,
    paddingVertical: 12,
  },
  actionTextPrimary: {
    color: '#000',
    fontSize: 14,
    fontWeight: '800',
  },
  descriptionCard: {
    backgroundColor: Theme.colors.glassBackground,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.glassBorder,
    padding: Theme.spacing.md,
  },
  descriptionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 13,
    color: Theme.colors.textSecondary,
    lineHeight: 18,
  },
});
