import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../store/useAuthStore';
import { useFavoritesStore } from '../../store/useFavoritesStore';
import { useHistoryStore } from '../../store/useHistoryStore';
import { usePlaylistsStore } from '../../store/usePlaylistsStore';
import { Theme } from '../../theme';
import { getAvatarSource } from '../../constants/avatars';
import { Heart, Clock, ListMusic, Settings, LogOut, ChevronRight, Pencil } from 'lucide-react-native';

export const ProfileScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, logout } = useAuthStore();
  const favorites = useFavoritesStore((state) => state.favorites);
  const history = useHistoryStore((state) => state.history);
  const playlists = usePlaylistsStore((state) => state.playlists);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Header Card */}
        <View style={styles.profileHeader}>
          {/* Avatar Photo */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.avatarWrapper}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Image
              source={getAvatarSource(user?.photoUrl)}
              style={styles.avatar}
            />
          </TouchableOpacity>

          {/* Display Name with Edit Icon */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.nameRow}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Text style={styles.displayName}>{user?.displayName || 'Music Fan'}</Text>
            <View style={styles.editIconBadge}>
              <Pencil size={14} color={Theme.colors.accent} />
            </View>
          </TouchableOpacity>

          {/* Username with Edit Shortcut */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.usernameRow}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Text style={styles.username}>@{user?.username || 'guest'}</Text>
          </TouchableOpacity>

          {/* Stats Bar */}
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{favorites.length}</Text>
              <Text style={styles.statLabel}>Favorites</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{history.length}</Text>
              <Text style={styles.statLabel}>History</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{playlists.length}</Text>
              <Text style={styles.statLabel}>Playlists</Text>
            </View>
          </View>
        </View>

        {/* Action Menu List */}
        <View style={styles.menuSection}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Favorites')}
          >
            <View style={[styles.menuIconBadge, { backgroundColor: 'rgba(255, 0, 85, 0.15)' }]}>
              <Heart size={20} color={Theme.colors.primary} />
            </View>
            <Text style={styles.menuText}>Favorite Videos</Text>
            <ChevronRight size={20} color={Theme.colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('WatchHistory')}
          >
            <View style={[styles.menuIconBadge, { backgroundColor: 'rgba(0, 229, 255, 0.15)' }]}>
              <Clock size={20} color={Theme.colors.accent} />
            </View>
            <Text style={styles.menuText}>Watch History</Text>
            <ChevronRight size={20} color={Theme.colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Playlists')}
          >
            <View style={[styles.menuIconBadge, { backgroundColor: 'rgba(138, 43, 226, 0.15)' }]}>
              <ListMusic size={20} color={Theme.colors.secondary} />
            </View>
            <Text style={styles.menuText}>Custom Playlists</Text>
            <ChevronRight size={20} color={Theme.colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Settings')}
          >
            <View style={[styles.menuIconBadge, { backgroundColor: 'rgba(255, 255, 255, 0.08)' }]}>
              <Settings size={20} color={Theme.colors.textPrimary} />
            </View>
            <Text style={styles.menuText}>App Settings</Text>
            <ChevronRight size={20} color={Theme.colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={() => logout()}>
          <LogOut size={20} color="#FF6B81" style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
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
  scrollContent: {
    paddingHorizontal: Theme.spacing.md,
    paddingBottom: Theme.spacing.xl,
  },
  profileHeader: {
    alignItems: 'center',
    backgroundColor: Theme.colors.glassBackground,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.glassBorder,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: Theme.borderRadius.full,
    borderWidth: 2,
    borderColor: Theme.colors.primary,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
    maxWidth: '90%',
  },
  displayName: {
    fontSize: 22,
    fontWeight: '800',
    color: Theme.colors.textPrimary,
    flexShrink: 1,
  },
  editIconBadge: {
    backgroundColor: 'rgba(0, 229, 255, 0.12)',
    borderRadius: Theme.borderRadius.full,
    padding: 5,
    marginLeft: 8,
  },
  usernameRow: {
    marginBottom: 20,
  },
  username: {
    fontSize: 14,
    color: Theme.colors.accent,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    paddingTop: Theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.cardBorder,
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: Theme.colors.textPrimary,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Theme.colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: Theme.colors.cardBorder,
  },
  menuSection: {
    backgroundColor: Theme.colors.cardBackground,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.cardBorder,
    marginBottom: Theme.spacing.lg,
    overflow: 'hidden',
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.cardBorder,
  },
  menuIconBadge: {
    width: 38,
    height: 38,
    borderRadius: Theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.textPrimary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 69, 58, 0.22)',
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 69, 58, 0.65)',
    height: 52,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  logoutText: {
    color: '#FF6B81',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
