import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { YoutubeVideo } from '../../types';
import { getMostPopularMusicVideos, getLanguageRegionCode } from '../../services/youtubeService';
import { useFavoritesStore } from '../../store/useFavoritesStore';
import { useAuthStore } from '../../store/useAuthStore';
import { VideoCard } from '../../components/VideoCard';
import { Theme } from '../../theme';
import { Radio, Flame, Sparkles, Bell, Globe } from 'lucide-react-native';

export const HomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const user = useAuthStore((state) => state.user);
  const { favorites, toggleFavorite, isFavorite, loadFavorites } = useFavoritesStore();

  const preferredLanguage = user?.settings?.preferredLanguage || 'Global';

  const [trendingVideos, setTrendingVideos] = useState<YoutubeVideo[]>([]);
  const [recommendedVideos, setRecommendedVideos] = useState<YoutubeVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadFavorites(user.uid);
    }
    fetchVideos(preferredLanguage);
  }, [user, preferredLanguage]);

  const fetchVideos = async (lang: string) => {
    setLoading(true);
    const regionCode = getLanguageRegionCode(lang);
    const popular = await getMostPopularMusicVideos(regionCode, lang);
    setTrendingVideos(popular.slice(0, 5));
    setRecommendedVideos(popular);
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      {/* App Header */}
      <View style={styles.header}>
        <View style={styles.brandGroup}>
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.brandTitle}>VibeSync</Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.createRoomButton}
            onPress={() => navigation.navigate('CreateRoom')}
          >
            <Radio size={16} color="#FFF" style={{ marginRight: 6 }} />
            <Text style={styles.createRoomText}>Create Room</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Bell size={20} color={Theme.colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Language Badge Header */}
        <View style={styles.languageBar}>
          <Globe size={14} color={Theme.colors.accent} style={{ marginRight: 6 }} />
          <Text style={styles.languageBarText}>
            Showing Recommendations for: <Text style={{ fontWeight: '700', color: '#FFF' }}>{preferredLanguage}</Text>
          </Text>
        </View>

        {/* Trending Section */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Flame size={20} color={Theme.colors.primary} style={{ marginRight: 6 }} />
            <Text style={styles.sectionTitle}>Trending Music ({preferredLanguage})</Text>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={Theme.colors.primary} style={{ marginVertical: 30 }} />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {trendingVideos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                horizontal
                onPress={() => navigation.navigate('StandalonePlayer', { video })}
                onFavoriteToggle={() => user && toggleFavorite(user.uid, video)}
                isFavorite={isFavorite(video.id)}
              />
            ))}
          </ScrollView>
        )}

        {/* Recommended Grid Section */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <View style={styles.sectionTitleRow}>
            <Sparkles size={20} color={Theme.colors.accent} style={{ marginRight: 6 }} />
            <Text style={styles.sectionTitle}>Recommended for You</Text>
          </View>
        </View>

        {recommendedVideos.map((video) => (
          <VideoCard
            key={`rec_${video.id}`}
            video={video}
            onPress={() => navigation.navigate('StandalonePlayer', { video })}
            onFavoriteToggle={() => user && toggleFavorite(user.uid, video)}
            isFavorite={isFavorite(video.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.md,
    paddingBottom: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.cardBorder,
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    width: 36,
    height: 36,
    marginRight: 10,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Theme.colors.textPrimary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  createRoomButton: {
    backgroundColor: Theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Theme.borderRadius.full,
    marginRight: 10,
  },
  createRoomText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  iconButton: {
    padding: 8,
    backgroundColor: Theme.colors.glassBackground,
    borderRadius: Theme.borderRadius.full,
  },
  scrollContent: {
    padding: Theme.spacing.md,
  },
  languageBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  languageBarText: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
  },
  horizontalScroll: {
    marginHorizontal: -Theme.spacing.md,
    paddingHorizontal: Theme.spacing.md,
  },
});
