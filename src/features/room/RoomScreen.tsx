import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  Image,
  BackHandler,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';
import { VibeYoutubePlayer } from '../../components/VibeYoutubePlayer';
import { useRoomSync } from '../../hooks/useRoomSync';
import { useRoomQueue } from '../../hooks/useRoomQueue';
import { useAuthStore } from '../../store/useAuthStore';
import { useRoomStore } from '../../store/useRoomStore';
import { searchYoutubeVideos } from '../../services/youtubeService';
import { ChatMessageModel, YoutubeVideo, QueueItemModel } from '../../types';
import { Theme } from '../../theme';
import {
  Play,
  Pause,
  MessageSquare,
  ListMusic,
  Users,
  Send,
  ArrowLeft,
  Share2,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Music,
  Search,
  X,
} from 'lucide-react-native';

import { usePlayerStore } from '../../store/usePlayerStore';

export const RoomScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'Room'>>();
  const navigation = useNavigation();
  const { roomId, roomName = 'Vibe Room', initialVideoId = 'dQw4w9WgXcQ' } = route.params;

  const user = useAuthStore((state) => state.user);
  const getRoomById = useRoomStore((state) => state.getRoomById);
  const activeRoom = getRoomById(roomId);
  const roomMembers = activeRoom?.members || [user?.uid || 'user_1'];

  const isHost = true; // Current user is host for room control

  const { syncState, updateSyncState } = useRoomSync(roomId, user?.uid || 'guest', isHost);
  const { queue, addToQueue, removeFromQueue, moveQueueItem } = useRoomQueue(roomId);

  const [activeTab, setActiveTab] = useState<'chat' | 'queue' | 'members'>('chat');
  const [chatMessages, setChatMessages] = useState<ChatMessageModel[]>([]);
  const [messageText, setMessageText] = useState('');

  // Add Song Modal State
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<YoutubeVideo[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const playVideo = usePlayerStore((state) => state.playVideo);
  const minimize = usePlayerStore((state) => state.minimize);
  const setPlaying = usePlayerStore((state) => state.setPlaying);
  const setVideoId = usePlayerStore((state) => state.setVideoId);

  useEffect(() => {
    const activeVideoId = syncState.videoId || initialVideoId;
    setVideoId(activeVideoId, roomName);

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      minimize();
      navigation.goBack();
      return true;
    });

    return () => {
      backHandler.remove();
    };
  }, [syncState.videoId, initialVideoId, roomName]);

  const handleBack = () => {
    minimize();
    navigation.goBack();
  };

  const handleTogglePlay = () => {
    const nextPlaying = !syncState.isPlaying;
    setPlaying(nextPlaying);
    updateSyncState(
      syncState.videoId,
      syncState.currentPosition,
      nextPlaying,
      syncState.playbackSpeed
    );
  };

  const handleSendMessage = () => {
    if (!messageText.trim()) return;

    const newMessage: ChatMessageModel = {
      id: `m_${Date.now()}`,
      senderId: user?.uid || 'guest',
      senderName: user?.displayName?.split(' ')[0] || 'Guest',
      text: messageText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages([...chatMessages, newMessage]);
    setMessageText('');
  };

  const handleSearchSong = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    const results = await searchYoutubeVideos(query);
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleAddVideoToQueue = async (video: YoutubeVideo) => {
    await addToQueue(video, user);
    setIsAddModalVisible(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handlePlayNow = async (item: QueueItemModel) => {
    setVideoId(item.videoId, item.title);
    updateSyncState(item.videoId, 0, true);
    await removeFromQueue(item.id);
  };

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <View style={styles.topHeader}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBack}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
          <ArrowLeft size={20} color={Theme.colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitleGroup}>
          <Text style={styles.roomName} numberOfLines={1}>{roomName}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
            <View style={styles.roomIdBadge}>
              <Text style={styles.roomIdText}>{roomId}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.backButton}>
          <Share2 size={20} color={Theme.colors.accent} />
        </TouchableOpacity>
      </View>

      {/* Synchronized YouTube Video Player */}
      <VibeYoutubePlayer
        videoId={syncState.videoId || initialVideoId}
        isPlaying={syncState.isPlaying}
        height={220}
      />

      {/* Playback Host Controls */}
      <View style={styles.controlsRow}>
        <TouchableOpacity style={styles.playButton} onPress={handleTogglePlay}>
          {syncState.isPlaying ? (
            <Pause size={22} color="#FFF" />
          ) : (
            <Play size={22} color="#FFF" fill="#FFF" />
          )}
        </TouchableOpacity>

        <View style={styles.nowPlayingInfo}>
          <Text style={styles.nowPlayingLabel}>NOW PLAYING IN SYNC</Text>
          <Text style={styles.nowPlayingStatus} numberOfLines={1}>
            {syncState.isPlaying ? 'Playing in sync' : 'Paused'} • {syncState.videoId}
          </Text>
        </View>
      </View>

      {/* Tab Navigation: Live Chat | Queue | Members */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'chat' && styles.activeTabItem]}
          onPress={() => setActiveTab('chat')}
        >
          <MessageSquare
            size={16}
            color={activeTab === 'chat' ? Theme.colors.primary : Theme.colors.textMuted}
            style={{ marginRight: 6 }}
          />
          <Text style={[styles.tabText, activeTab === 'chat' && styles.activeTabText]}>Live Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'queue' && styles.activeTabItem]}
          onPress={() => setActiveTab('queue')}
        >
          <ListMusic
            size={16}
            color={activeTab === 'queue' ? Theme.colors.primary : Theme.colors.textMuted}
            style={{ marginRight: 6 }}
          />
          <Text style={[styles.tabText, activeTab === 'queue' && styles.activeTabText]}>
            Queue ({queue.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'members' && styles.activeTabItem]}
          onPress={() => setActiveTab('members')}
        >
          <Users
            size={16}
            color={activeTab === 'members' ? Theme.colors.primary : Theme.colors.textMuted}
            style={{ marginRight: 6 }}
          />
          <Text style={[styles.tabText, activeTab === 'members' && styles.activeTabText]}>
            Members ({roomMembers.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content Body */}
      {activeTab === 'chat' && (
        <View style={styles.chatContainer}>
          <ScrollView contentContainerStyle={styles.chatList} showsVerticalScrollIndicator={false}>
            {chatMessages.map((msg) => (
              <View key={msg.id} style={styles.chatBubble}>
                <Text style={styles.chatSender}>{msg.senderName}</Text>
                <Text style={styles.chatText}>{msg.text}</Text>
                <Text style={styles.chatTime}>{msg.timestamp}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Chat Input */}
          <View style={styles.chatInputRow}>
            <TextInput
              style={styles.chatInput}
              placeholder="Send vibe to room..."
              placeholderTextColor={Theme.colors.textMuted}
              value={messageText}
              onChangeText={setMessageText}
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
              <Send size={18} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {activeTab === 'queue' && (
        <View style={{ flex: 1 }}>
          <View style={styles.queueHeaderRow}>
            <Text style={styles.subSectionTitle}>Upcoming Video Queue</Text>
            <TouchableOpacity
              style={styles.addSongBtn}
              onPress={() => setIsAddModalVisible(true)}
            >
              <Plus size={14} color="#FFF" style={{ marginRight: 4 }} />
              <Text style={styles.addSongBtnText}>Add Song</Text>
            </TouchableOpacity>
          </View>

          {queue.length === 0 ? (
            <View style={styles.emptyQueueContainer}>
              <Music size={44} color={Theme.colors.textMuted} style={{ marginBottom: 10 }} />
              <Text style={styles.emptyQueueTitle}>Queue is Empty</Text>
              <Text style={styles.emptyQueueSubtitle}>
                Search YouTube and add something to start your room playlist.
              </Text>
              <TouchableOpacity
                style={styles.searchPromptBtn}
                onPress={() => setIsAddModalVisible(true)}
              >
                <Plus size={16} color="#FFF" style={{ marginRight: 6 }} />
                <Text style={styles.searchPromptBtnText}>Add Song to Queue</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.queueListContainer} showsVerticalScrollIndicator={false}>
              {queue.map((item, index) => (
                <View key={item.id} style={styles.queueCard}>
                  <Text style={styles.queueIndex}>{index + 1}</Text>
                  
                  <Image source={{ uri: item.thumbnailUrl }} style={styles.queueThumb} />

                  <View style={styles.queueMeta}>
                    <Text style={styles.queueTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.queueSubtitle} numberOfLines={1}>
                      {item.channelName} • Added by {item.addedByName}
                    </Text>
                  </View>

                  <View style={styles.queueActions}>
                    <TouchableOpacity
                      style={styles.playNowBtn}
                      onPress={() => handlePlayNow(item)}
                    >
                      <Play size={12} color="#000" fill="#000" />
                    </TouchableOpacity>

                    {index > 0 && (
                      <TouchableOpacity
                        style={styles.reorderBtn}
                        onPress={() => moveQueueItem(index, 'up')}
                      >
                        <ChevronUp size={16} color={Theme.colors.textMuted} />
                      </TouchableOpacity>
                    )}

                    {index < queue.length - 1 && (
                      <TouchableOpacity
                        style={styles.reorderBtn}
                        onPress={() => moveQueueItem(index, 'down')}
                      >
                        <ChevronDown size={16} color={Theme.colors.textMuted} />
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => removeFromQueue(item.id)}
                    >
                      <Trash2 size={16} color={Theme.colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      )}

      {activeTab === 'members' && (
        <ScrollView style={styles.tabContentContainer}>
          <Text style={styles.subSectionTitle}>In This Room Now ({roomMembers.length})</Text>
          {roomMembers.map((memId, idx) => (
            <View key={memId + idx} style={styles.memberRow}>
              <Image
                source={{ uri: user?.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100' }}
                style={styles.memberAvatar}
              />
              <Text style={styles.memberName}>
                {memId === user?.uid ? `${user?.displayName || 'You'} (Host)` : `Member ${idx + 1}`}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Add Song Modal */}
      <Modal
        visible={isAddModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setIsAddModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Song to Room Queue</Text>
            <TouchableOpacity onPress={() => setIsAddModalVisible(false)}>
              <X size={24} color={Theme.colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalSearchBar}>
            <Search size={18} color={Theme.colors.textMuted} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.modalInput}
              placeholder="Search YouTube videos..."
              placeholderTextColor={Theme.colors.textMuted}
              value={searchQuery}
              onChangeText={handleSearchSong}
              autoFocus
            />
          </View>

          {isSearching ? (
            <ActivityIndicator size="large" color={Theme.colors.primary} style={{ marginTop: 40 }} />
          ) : (
            <ScrollView contentContainerStyle={{ padding: Theme.spacing.md }}>
              {searchResults.map((video) => (
                <View key={video.id} style={styles.searchResultCard}>
                  <Image source={{ uri: video.thumbnailUrl }} style={styles.searchResultThumb} />
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.searchResultTitle} numberOfLines={2}>{video.title}</Text>
                    <Text style={styles.searchResultChannel} numberOfLines={1}>{video.channelName}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.addToQueueBtn}
                    onPress={() => handleAddVideoToQueue(video)}
                  >
                    <Plus size={16} color="#FFF" style={{ marginRight: 4 }} />
                    <Text style={styles.addToQueueText}>Add</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    paddingTop: 45,
  },
  topHeader: {
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
  headerTitleGroup: {
    alignItems: 'center',
  },
  roomName: {
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Theme.colors.primary,
    marginRight: 4,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '800',
    color: Theme.colors.primary,
    letterSpacing: 0.5,
  },
  roomIdBadge: {
    backgroundColor: 'rgba(0, 229, 255, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Theme.borderRadius.sm,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.3)',
  },
  roomIdText: {
    fontSize: 10,
    fontWeight: '800',
    color: Theme.colors.accent,
    letterSpacing: 0.5,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.cardBackground,
    marginHorizontal: Theme.spacing.md,
    marginVertical: Theme.spacing.sm,
    padding: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.cardBorder,
  },
  playButton: {
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.full,
    padding: 10,
    marginRight: 12,
  },
  nowPlayingInfo: {
    flex: 1,
  },
  nowPlayingLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Theme.colors.accent,
    letterSpacing: 0.5,
  },
  nowPlayingStatus: {
    fontSize: 13,
    color: Theme.colors.textPrimary,
    fontWeight: '600',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.cardBorder,
    marginHorizontal: Theme.spacing.md,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  activeTabItem: {
    borderBottomWidth: 2,
    borderBottomColor: Theme.colors.primary,
  },
  tabText: {
    fontSize: 13,
    color: Theme.colors.textMuted,
    fontWeight: '600',
  },
  activeTabText: {
    color: Theme.colors.primary,
    fontWeight: '700',
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: Theme.spacing.md,
    paddingBottom: 10,
  },
  chatList: {
    paddingVertical: Theme.spacing.md,
  },
  chatBubble: {
    backgroundColor: Theme.colors.glassBackground,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: Theme.colors.glassBorder,
  },
  chatSender: {
    fontSize: 12,
    fontWeight: '700',
    color: Theme.colors.accent,
    marginBottom: 2,
  },
  chatText: {
    fontSize: 14,
    color: Theme.colors.textPrimary,
  },
  chatTime: {
    fontSize: 10,
    color: Theme.colors.textMuted,
    alignSelf: 'flex-end',
    marginTop: 2,
  },
  chatInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.glassBackground,
    borderRadius: Theme.borderRadius.full,
    borderWidth: 1,
    borderColor: Theme.colors.glassBorder,
    paddingHorizontal: 14,
    height: 46,
  },
  chatInput: {
    flex: 1,
    color: Theme.colors.textPrimary,
    fontSize: 14,
  },
  sendButton: {
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.full,
    padding: 8,
  },
  tabContentContainer: {
    padding: Theme.spacing.md,
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
  },
  queueHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.md,
    paddingTop: Theme.spacing.md,
    paddingBottom: Theme.spacing.sm,
  },
  addSongBtn: {
    backgroundColor: Theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Theme.borderRadius.full,
  },
  addSongBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyQueueContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    marginTop: 30,
  },
  emptyQueueTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    marginBottom: 6,
  },
  emptyQueueSubtitle: {
    fontSize: 13,
    color: Theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  searchPromptBtn: {
    backgroundColor: Theme.colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Theme.borderRadius.full,
  },
  searchPromptBtnText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '800',
  },
  queueListContainer: {
    paddingHorizontal: Theme.spacing.md,
    paddingBottom: Theme.spacing.lg,
  },
  queueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.cardBackground,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.cardBorder,
    padding: 8,
    marginBottom: 8,
  },
  queueIndex: {
    fontSize: 14,
    fontWeight: '800',
    color: Theme.colors.accent,
    width: 22,
    textAlign: 'center',
    marginRight: 6,
  },
  queueThumb: {
    width: 44,
    height: 44,
    borderRadius: 6,
    backgroundColor: '#222',
    marginRight: 10,
  },
  queueMeta: {
    flex: 1,
    marginRight: 6,
  },
  queueTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    marginBottom: 2,
  },
  queueSubtitle: {
    fontSize: 11,
    color: Theme.colors.textMuted,
  },
  queueActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playNowBtn: {
    backgroundColor: Theme.colors.accent,
    borderRadius: Theme.borderRadius.full,
    padding: 6,
    marginRight: 6,
  },
  reorderBtn: {
    padding: 4,
  },
  deleteBtn: {
    padding: 6,
    marginLeft: 4,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.cardBackground,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    marginBottom: 8,
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: Theme.borderRadius.full,
    marginRight: 12,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.textPrimary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    paddingTop: 50,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Theme.colors.textPrimary,
  },
  modalSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.glassBackground,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.glassBorder,
    paddingHorizontal: 14,
    height: 48,
    marginHorizontal: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
  },
  modalInput: {
    flex: 1,
    color: Theme.colors.textPrimary,
    fontSize: 14,
  },
  searchResultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.cardBackground,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.cardBorder,
    padding: 8,
    marginBottom: 8,
  },
  searchResultThumb: {
    width: 60,
    height: 45,
    borderRadius: 6,
    backgroundColor: '#222',
    marginRight: 10,
  },
  searchResultTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    marginBottom: 2,
  },
  searchResultChannel: {
    fontSize: 11,
    color: Theme.colors.primary,
  },
  addToQueueBtn: {
    backgroundColor: Theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Theme.borderRadius.sm,
  },
  addToQueueText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
