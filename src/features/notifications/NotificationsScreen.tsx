import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationModel } from '../../types';
import { useAuthStore } from '../../store/useAuthStore';
import { Theme } from '../../theme';
import { ArrowLeft, Bell, CheckCheck, Trash2 } from 'lucide-react-native';

export const NotificationsScreen = () => {
  const navigation = useNavigation();
  const user = useAuthStore((state) => state.user);

  const [notifications, setNotifications] = useState<NotificationModel[]>([]);
  const storageKey = `vibe_sync_notifications_${user?.uid || 'guest'}`;

  useEffect(() => {
    loadNotifications();
  }, [user]);

  const loadNotifications = async () => {
    try {
      const json = await AsyncStorage.getItem(storageKey);
      if (json) {
        setNotifications(JSON.parse(json));
      } else {
        const welcomeNotification: NotificationModel = {
          id: 'n_welcome',
          title: `Welcome @${user?.username || 'user'}! 🎉`,
          body: 'Watch music videos in real-time sync with friends. Explore rooms and playlists!',
          type: 'welcome',
          createdAt: 'Just now',
          read: false,
        };
        setNotifications([welcomeNotification]);
        await AsyncStorage.setItem(storageKey, JSON.stringify([welcomeNotification]));
      }
    } catch (e) {
      console.error('Failed to load notifications:', e);
    }
  };

  const saveNotifications = async (updated: NotificationModel[]) => {
    setNotifications(updated);
    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save notifications:', e);
    }
  };

  const markAllRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    saveNotifications(updated);
  };

  const clearAll = () => {
    saveNotifications([]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color={Theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={markAllRead} style={{ marginRight: 12 }}>
            <CheckCheck size={20} color={Theme.colors.accent} />
          </TouchableOpacity>
          <TouchableOpacity onPress={clearAll}>
            <Trash2 size={20} color={Theme.colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Bell size={48} color={Theme.colors.textMuted} style={{ marginBottom: 12 }} />
          <Text style={styles.emptyTitle}>All Caught Up!</Text>
          <Text style={styles.emptySubtitle}>You have no unread room or app notifications.</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={[styles.card, !item.read && styles.unreadCard]}>
              <View style={styles.iconBadge}>
                <Bell size={18} color={!item.read ? Theme.colors.primary : Theme.colors.textMuted} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.body}>{item.body}</Text>
                <Text style={styles.time}>{item.createdAt}</Text>
              </View>
            </View>
          )}
        />
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: Theme.spacing.xl,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.cardBackground,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.cardBorder,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
  },
  unreadCard: {
    borderColor: 'rgba(255, 0, 85, 0.4)',
    backgroundColor: 'rgba(255, 0, 85, 0.05)',
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Theme.colors.glassBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    marginBottom: 4,
  },
  body: {
    fontSize: 13,
    color: Theme.colors.textSecondary,
    marginBottom: 6,
  },
  time: {
    fontSize: 11,
    color: Theme.colors.textMuted,
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
  },
});
