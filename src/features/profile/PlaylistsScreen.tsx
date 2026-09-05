import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { usePlaylistsStore } from '../../store/usePlaylistsStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Theme } from '../../theme';
import { ArrowLeft, ListMusic, Plus, Trash2, X } from 'lucide-react-native';

export const PlaylistsScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const user = useAuthStore((state) => state.user);
  const { playlists, createPlaylist, deletePlaylist } = usePlaylistsStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [playlistName, setPlaylistName] = useState('');

  const handleCreate = () => {
    if (!playlistName.trim() || !user) return;
    createPlaylist(user.uid, playlistName.trim());
    setPlaylistName('');
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color={Theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Custom Playlists</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Plus size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      {playlists.length === 0 ? (
        <View style={styles.emptyContainer}>
          <ListMusic size={48} color={Theme.colors.textMuted} style={{ marginBottom: 12 }} />
          <Text style={styles.emptyTitle}>No Playlists Yet</Text>
          <Text style={styles.emptySubtitle}>
            Create custom playlists to group your favorite music videos together.
          </Text>
        </View>
      ) : (
        <FlatList
          data={playlists}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.playlistCard}>
              <View style={styles.playlistIconBadge}>
                <ListMusic size={22} color={Theme.colors.secondary} />
              </View>
              <View style={styles.playlistInfo}>
                <Text style={styles.playlistName}>{item.name}</Text>
                <Text style={styles.videoCount}>{item.videos.length} videos</Text>
              </View>
              <TouchableOpacity onPress={() => user && deletePlaylist(user.uid, item.id)}>
                <Trash2 size={18} color={Theme.colors.textMuted} />
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      {/* Modal for Creating New Playlist */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Playlist</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={20} color={Theme.colors.textMuted} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Playlist Name..."
              placeholderTextColor={Theme.colors.textMuted}
              value={playlistName}
              onChangeText={setPlaylistName}
            />

            <TouchableOpacity style={styles.modalSubmitButton} onPress={handleCreate}>
              <Text style={styles.modalSubmitText}>Create Playlist</Text>
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
    marginBottom: Theme.spacing.lg,
  },
  backButton: {
    padding: 8,
    backgroundColor: Theme.colors.glassBackground,
    borderRadius: Theme.borderRadius.full,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Theme.colors.textPrimary,
  },
  addButton: {
    padding: 8,
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.full,
  },
  listContent: {
    paddingBottom: Theme.spacing.xl,
  },
  playlistCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.cardBackground,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.cardBorder,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
  },
  playlistIconBadge: {
    width: 44,
    height: 44,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: 'rgba(138, 43, 226, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  playlistInfo: {
    flex: 1,
  },
  playlistName: {
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
  },
  videoCount: {
    fontSize: 13,
    color: Theme.colors.textMuted,
    marginTop: 2,
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
  modalInput: {
    backgroundColor: Theme.colors.glassBackground,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.glassBorder,
    paddingHorizontal: 14,
    height: 48,
    color: Theme.colors.textPrimary,
    fontSize: 15,
    marginBottom: 20,
  },
  modalSubmitButton: {
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.md,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSubmitText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
