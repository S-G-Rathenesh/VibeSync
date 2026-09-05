import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useHistoryStore } from '../../store/useHistoryStore';
import { useAuthStore } from '../../store/useAuthStore';
import { VideoCard } from '../../components/VideoCard';
import { Theme } from '../../theme';
import { ArrowLeft, Clock, Trash2 } from 'lucide-react-native';

export const WatchHistoryScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const user = useAuthStore((state) => state.user);
  const { history, clearHistory } = useHistoryStore();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color={Theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Watch History</Text>
        {history.length > 0 ? (
          <TouchableOpacity onPress={() => user && clearHistory(user.uid)}>
            <Trash2 size={20} color={Theme.colors.error} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 36 }} />
        )}
      </View>

      {history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Clock size={48} color={Theme.colors.textMuted} style={{ marginBottom: 12 }} />
          <Text style={styles.emptyTitle}>History is Empty</Text>
          <Text style={styles.emptySubtitle}>
            Videos you watch in standalone player or live rooms will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item, idx) => `hist_${item.id}_${idx}`}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <VideoCard
              video={item}
              onPress={() => navigation.navigate('StandalonePlayer', { video: item })}
            />
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
  listContent: {
    paddingBottom: Theme.spacing.xl,
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
});
