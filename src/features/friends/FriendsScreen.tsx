import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../../store/useAuthStore';
import { Theme } from '../../theme';
import { Users, Radio, UserPlus, X, AtSign } from 'lucide-react-native';

interface Friend {
  uid: string;
  displayName: string;
  username: string;
  photoUrl: string;
  isOnline: boolean;
  currentRoom?: string;
}

export const FriendsScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const user = useAuthStore((state) => state.user);

  const [friends, setFriends] = useState<Friend[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchUsername, setSearchUsername] = useState('');
  const [addError, setAddError] = useState('');

  const storageKey = `vibe_sync_friends_${user?.uid || 'guest'}`;

  useEffect(() => {
    loadFriends();
  }, [user]);

  const loadFriends = async () => {
    try {
      const json = await AsyncStorage.getItem(storageKey);
      if (json) {
        setFriends(JSON.parse(json));
      }
    } catch (e) {
      console.error('Failed to load friends:', e);
    }
  };

  const handleAddFriend = async () => {
    setAddError('');
    const cleanName = searchUsername.trim().toLowerCase().replace('@', '');

    if (!cleanName) {
      setAddError('Please enter a username.');
      return;
    }

    if (user?.username && cleanName === user.username.toLowerCase()) {
      setAddError('You cannot add yourself as a friend.');
      return;
    }

    if (friends.some((f) => f.username.toLowerCase() === cleanName)) {
      setAddError(`@${cleanName} is already in your friends list.`);
      return;
    }

    const newFriend: Friend = {
      uid: `user_${Date.now()}`,
      displayName: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
      username: cleanName,
      photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      isOnline: true,
    };

    const updated = [...friends, newFriend];
    setFriends(updated);
    await AsyncStorage.setItem(storageKey, JSON.stringify(updated));

    setSearchUsername('');
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Friends ({friends.length})</Text>
        <TouchableOpacity style={styles.addFriendButton} onPress={() => setModalVisible(true)}>
          <UserPlus size={18} color={Theme.colors.accent} />
        </TouchableOpacity>
      </View>

      {friends.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Users size={48} color={Theme.colors.textMuted} style={{ marginBottom: 12 }} />
          <Text style={styles.emptyTitle}>No Friends Added Yet</Text>
          <Text style={styles.emptySubtitle}>
            Tap the button above to add friends by their unique @username and invite them to sync rooms.
          </Text>
        </View>
      ) : (
        <FlatList
          data={friends}
          keyExtractor={(item) => item.uid}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.friendCard}>
              <View style={styles.avatarWrapper}>
                <Image source={{ uri: item.photoUrl }} style={styles.avatar} />
                <View style={[styles.statusBadge, item.isOnline ? styles.online : styles.offline]} />
              </View>

              <View style={styles.friendInfo}>
                <Text style={styles.displayName}>{item.displayName}</Text>
                <Text style={styles.username}>@{item.username}</Text>
                {item.currentRoom && (
                  <Text style={styles.roomStatus}>
                    Listening in <Text style={{ color: Theme.colors.primary }}>{item.currentRoom}</Text>
                  </Text>
                )}
              </View>

              <TouchableOpacity
                style={styles.inviteButton}
                onPress={() => navigation.navigate('CreateRoom')}
              >
                <Radio size={14} color="#FFF" style={{ marginRight: 4 }} />
                <Text style={styles.inviteButtonText}>Invite</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      {/* Modal for Adding Friend */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Friend</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={20} color={Theme.colors.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalInputRow}>
              <AtSign size={18} color={Theme.colors.accent} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.modalInput}
                placeholder="Enter unique username..."
                placeholderTextColor={Theme.colors.textMuted}
                value={searchUsername}
                autoCapitalize="none"
                onChangeText={(text) => {
                  setSearchUsername(text);
                  setAddError('');
                }}
              />
            </View>

            {addError ? <Text style={styles.errorText}>{addError}</Text> : null}

            <TouchableOpacity style={styles.modalSubmitButton} onPress={handleAddFriend}>
              <Text style={styles.modalSubmitText}>Add Friend</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.md,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Theme.colors.textPrimary,
  },
  addFriendButton: {
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    borderRadius: Theme.borderRadius.full,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.3)',
  },
  listContent: {
    paddingBottom: Theme.spacing.xl,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.cardBackground,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.cardBorder,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 14,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: Theme.borderRadius.full,
  },
  statusBadge: {
    width: 12,
    height: 12,
    borderRadius: Theme.borderRadius.full,
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: Theme.colors.cardBackground,
  },
  online: {
    backgroundColor: Theme.colors.success,
  },
  offline: {
    backgroundColor: Theme.colors.textMuted,
  },
  friendInfo: {
    flex: 1,
  },
  displayName: {
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
  },
  username: {
    fontSize: 13,
    color: Theme.colors.textMuted,
  },
  roomStatus: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
    marginTop: 2,
  },
  inviteButton: {
    backgroundColor: Theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Theme.borderRadius.full,
  },
  inviteButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Theme.colors.overlay,
    justifyContent: 'center',
    padding: Theme.spacing.lg,
  },
  modalCard: {
    backgroundColor: Theme.colors.cardBackground,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.glassBorder,
    padding: Theme.spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
  },
  modalInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.glassBackground,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.glassBorder,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 10,
  },
  modalInput: {
    flex: 1,
    color: Theme.colors.textPrimary,
    fontSize: 15,
  },
  errorText: {
    fontSize: 12,
    color: Theme.colors.error,
    marginBottom: 10,
  },
  modalSubmitButton: {
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.md,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  modalSubmitText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
