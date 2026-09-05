import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { searchYoutubeVideos } from '../../services/youtubeService';
import { YoutubeVideo, RoomModel } from '../../types';
import { VideoCard } from '../../components/VideoCard';
import { useRoomStore } from '../../store/useRoomStore';
import { Theme } from '../../theme';
import { Search, X, Radio, Users, ChevronRight, Hash } from 'lucide-react-native';

export const SearchScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { rooms, searchRooms, subscribeRooms } = useRoomStore();

  const [activeTab, setActiveTab] = useState<'videos' | 'rooms'>('videos');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<YoutubeVideo[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeRooms();
    return () => {
      unsubscribe();
    };
  }, []);

  const handleSearch = async (text: string) => {
    setQuery(text);

    if (text.trim().length < 2) {
      setResults([]);
      return;
    }

    if (activeTab === 'videos') {
      setLoading(true);
      const searchResults = await searchYoutubeVideos(text);
      setResults(searchResults);
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
  };

  const matchedRooms = searchRooms(query);

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Explore & Search</Text>

      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'videos' && styles.activeTabButton]}
          onPress={() => {
            setActiveTab('videos');
            if (query.trim().length >= 2) handleSearch(query);
          }}
        >
          <Text style={[styles.tabText, activeTab === 'videos' && styles.activeTabText]}>
            Videos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'rooms' && styles.activeTabButton]}
          onPress={() => setActiveTab('rooms')}
        >
          <Radio size={14} color={activeTab === 'rooms' ? Theme.colors.primary : Theme.colors.textMuted} style={{ marginRight: 6 }} />
          <Text style={[styles.tabText, activeTab === 'rooms' && styles.activeTabText]}>
            Live Rooms by ID ({rooms.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchBar}>
        <Search size={20} color={Theme.colors.textMuted} style={{ marginRight: 10 }} />
        <TextInput
          style={styles.input}
          placeholder={activeTab === 'videos' ? 'Search songs, artists, videos...' : 'Enter Room ID (e.g. VIBE-4829) or Room Name...'}
          placeholderTextColor={Theme.colors.textMuted}
          value={query}
          onChangeText={handleSearch}
          autoCapitalize="none"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={clearSearch}>
            <X size={20} color={Theme.colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Theme.colors.primary} style={{ marginVertical: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.resultsContent} showsVerticalScrollIndicator={false}>
          {/* ROOMS TAB VIEW */}
          {activeTab === 'rooms' && (
            <View>
              <Text style={styles.sectionHeaderTitle}>
                {query.trim().length > 0 ? `Search Results (${matchedRooms.length})` : 'Active Sync Rooms'}
              </Text>

              {matchedRooms.length === 0 ? (
                <View style={styles.placeholderContainer}>
                  <Hash size={44} color={Theme.colors.textMuted} style={{ marginBottom: 10 }} />
                  <Text style={styles.placeholderTitle}>No Rooms Found</Text>
                  <Text style={styles.placeholderSubtitle}>
                    No sync room matches ID or name "{query}". Verify the unique Room ID and try again.
                  </Text>
                </View>
              ) : (
                matchedRooms.map((room) => (
                  <TouchableOpacity
                    key={room.id}
                    style={styles.roomCard}
                    activeOpacity={0.8}
                    onPress={() =>
                      navigation.navigate('Room', {
                        roomId: room.id,
                        roomName: room.name,
                      })
                    }
                  >
                    <View style={styles.roomCardHeader}>
                      <View style={styles.roomBadgeGroup}>
                        <View style={styles.livePulseDot} />
                        <Text style={styles.liveLabel}>LIVE SYNC</Text>
                      </View>

                      {/* Unique Room ID Badge */}
                      <View style={styles.roomIdPill}>
                        <Hash size={12} color={Theme.colors.accent} style={{ marginRight: 2 }} />
                        <Text style={styles.roomIdPillText}>{room.id}</Text>
                      </View>
                    </View>

                    <Text style={styles.roomTitle}>{room.name}</Text>

                    <View style={styles.roomMetaRow}>
                      <View style={styles.memberMeta}>
                        <Users size={14} color={Theme.colors.textMuted} style={{ marginRight: 6 }} />
                        <Text style={styles.memberMetaText}>{room.members?.length || 1} Listening Now</Text>
                      </View>

                      <View style={styles.joinAction}>
                        <Text style={styles.joinActionText}>Join Room</Text>
                        <ChevronRight size={16} color={Theme.colors.primary} />
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}

          {/* VIDEOS TAB VIEW */}
          {activeTab === 'videos' && (
            <View>
              {/* If query matches a Room ID, show instant Room Banner */}
              {matchedRooms.length > 0 && query.trim().length >= 3 && (
                <View style={styles.roomMatchBanner}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.roomMatchTitle}>Sync Room Found!</Text>
                    <Text style={styles.roomMatchSub}>ID: {matchedRooms[0].id} • {matchedRooms[0].name}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.joinMatchBtn}
                    onPress={() =>
                      navigation.navigate('Room', {
                        roomId: matchedRooms[0].id,
                        roomName: matchedRooms[0].name,
                      })
                    }
                  >
                    <Text style={styles.joinMatchBtnText}>Join Now</Text>
                  </TouchableOpacity>
                </View>
              )}

              {results.length === 0 && query.length >= 2 && (
                <Text style={styles.emptyText}>No videos found for "{query}".</Text>
              )}

              {results.length === 0 && query.length < 2 && (
                <View style={styles.placeholderContainer}>
                  <Search size={48} color={Theme.colors.textMuted} style={{ marginBottom: 12 }} />
                  <Text style={styles.placeholderTitle}>Discover Music & Live Rooms</Text>
                  <Text style={styles.placeholderSubtitle}>
                    Search videos by song name or search live rooms by unique Room ID (e.g. VIBE-4829).
                  </Text>
                </View>
              )}

              {results.map((video) => (
                <VideoCard
                  key={`search_${video.id}`}
                  video={video}
                  onPress={() => navigation.navigate('StandalonePlayer', { video })}
                />
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    paddingTop: 50,
    paddingHorizontal: Theme.spacing.md,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.md,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.glassBackground,
    borderRadius: Theme.borderRadius.md,
    padding: 4,
    marginBottom: Theme.spacing.md,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: Theme.borderRadius.sm,
  },
  activeTabButton: {
    backgroundColor: Theme.colors.cardBackground,
    borderWidth: 1,
    borderColor: Theme.colors.glassBorder,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.textMuted,
  },
  activeTabText: {
    color: Theme.colors.textPrimary,
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.glassBackground,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.glassBorder,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: Theme.spacing.md,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  input: {
    flex: 1,
    color: Theme.colors.textPrimary,
    fontSize: 14,
  },
  resultsContent: {
    paddingBottom: Theme.spacing.xl,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    marginBottom: 12,
  },
  roomCard: {
    backgroundColor: Theme.colors.glassBackground,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.glassBorder,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
  },
  roomCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  roomBadgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  livePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Theme.colors.primary,
    marginRight: 6,
  },
  liveLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Theme.colors.primary,
    letterSpacing: 0.5,
  },
  roomIdPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 229, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Theme.borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.3)',
  },
  roomIdPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: Theme.colors.accent,
    letterSpacing: 0.5,
  },
  roomTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    marginBottom: 12,
  },
  roomMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.cardBorder,
  },
  memberMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberMetaText: {
    fontSize: 13,
    color: Theme.colors.textMuted,
  },
  joinAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  joinActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: Theme.colors.primary,
    marginRight: 2,
  },
  roomMatchBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 0, 85, 0.12)',
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 85, 0.3)',
    padding: 12,
    marginBottom: Theme.spacing.md,
  },
  roomMatchTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Theme.colors.primary,
  },
  roomMatchSub: {
    fontSize: 12,
    color: Theme.colors.textPrimary,
    marginTop: 2,
  },
  joinMatchBtn: {
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Theme.borderRadius.sm,
  },
  joinMatchBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyText: {
    color: Theme.colors.textMuted,
    textAlign: 'center',
    marginTop: 40,
    fontSize: 15,
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    paddingHorizontal: 30,
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    marginBottom: 6,
  },
  placeholderSubtitle: {
    fontSize: 14,
    color: Theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
