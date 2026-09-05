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
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';
import { VibeYoutubePlayer } from '../../components/VibeYoutubePlayer';
import { useRoomSync } from '../../hooks/useRoomSync';
import { useAuthStore } from '../../store/useAuthStore';
import { ChatMessageModel } from '../../types';
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
} from 'lucide-react-native';

import { usePlayerStore } from '../../store/usePlayerStore';

export const RoomScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'Room'>>();
  const navigation = useNavigation();
  const { roomId, roomName = 'Vibe Room', initialVideoId = 'dQw4w9WgXcQ' } = route.params;

  const user = useAuthStore((state) => state.user);
  const isHost = true; // Current user is host for room control

  const { syncState, updateSyncState } = useRoomSync(roomId, user?.uid || 'guest', isHost);
  const [activeTab, setActiveTab] = useState<'chat' | 'queue' | 'members'>('chat');
  const [chatMessages, setChatMessages] = useState<ChatMessageModel[]>([]);
  const [messageText, setMessageText] = useState('');

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
      senderName: user?.displayName.split(' ')[0] || 'Guest',
      text: messageText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages([...chatMessages, newMessage]);
    setMessageText('');
  };

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
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
          <Text style={styles.nowPlayingStatus}>
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
          <Text style={[styles.tabText, activeTab === 'queue' && styles.activeTabText]}>Queue</Text>
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
            Members (4)
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
        <ScrollView style={styles.tabContentContainer}>
          <Text style={styles.subSectionTitle}>Upcoming Video Queue</Text>
          <View style={styles.queueItem}>
            <Text style={styles.queueIndex}>1</Text>
            <Text style={styles.queueTitle} numberOfLines={1}>
              The Weeknd - Blinding Lights (Official Music Video)
            </Text>
          </View>
          <View style={styles.queueItem}>
            <Text style={styles.queueIndex}>2</Text>
            <Text style={styles.queueTitle} numberOfLines={1}>
              Dua Lipa - Levitating Featuring DaBaby
            </Text>
          </View>
        </ScrollView>
      )}

      {activeTab === 'members' && (
        <ScrollView style={styles.tabContentContainer}>
          <Text style={styles.subSectionTitle}>In This Room Now</Text>
          <View style={styles.memberRow}>
            <Image
              source={{ uri: user?.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100' }}
              style={styles.memberAvatar}
            />
            <Text style={styles.memberName}>{user?.displayName || 'You'} (Host)</Text>
          </View>
        </ScrollView>
      )}
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
    marginBottom: 12,
  },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.cardBackground,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    marginBottom: 8,
  },
  queueIndex: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.accent,
    marginRight: 12,
  },
  queueTitle: {
    fontSize: 14,
    color: Theme.colors.textPrimary,
    flex: 1,
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
});
