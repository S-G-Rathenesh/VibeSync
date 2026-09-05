import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Theme } from '../../theme';
import { Radio, Lock, ArrowLeft } from 'lucide-react-native';

import { useAuthStore } from '../../store/useAuthStore';
import { useRoomStore } from '../../store/useRoomStore';

export const CreateRoomScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const user = useAuthStore((state) => state.user);
  const createRoom = useRoomStore((state) => state.createRoom);

  const [roomName, setRoomName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const finalName = roomName.trim() || 'My Vibe Room';
      const createdRoom = await createRoom(
        finalName,
        isPrivate,
        password,
        user?.uid,
        user?.displayName
      );

      navigation.replace('Room', {
        roomId: createdRoom.id,
        roomName: createdRoom.name,
      });
    } catch (e) {
      console.error('Failed to create room:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color={Theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Sync Room</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.formCard}>
        <Text style={styles.label}>Room Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Chill Music 24/7"
          placeholderTextColor={Theme.colors.textMuted}
          value={roomName}
          onChangeText={setRoomName}
        />

        <View style={styles.switchRow}>
          <View style={styles.switchLabelGroup}>
            <Lock size={18} color={Theme.colors.accent} style={{ marginRight: 8 }} />
            <Text style={styles.switchLabel}>Private Room</Text>
          </View>
          <Switch
            value={isPrivate}
            onValueChange={setIsPrivate}
            trackColor={{ false: '#333', true: Theme.colors.primary }}
          />
        </View>

        {isPrivate && (
          <View style={{ marginTop: 12 }}>
            <Text style={styles.label}>Room Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter room password"
              placeholderTextColor={Theme.colors.textMuted}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>
        )}

        <TouchableOpacity style={styles.submitButton} onPress={handleCreate}>
          <Radio size={20} color="#FFF" style={{ marginRight: 8 }} />
          <Text style={styles.submitButtonText}>Launch Sync Room</Text>
        </TouchableOpacity>
      </View>
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
    maxWidth: 540,
    width: '100%',
    alignSelf: 'center',
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
  formCard: {
    backgroundColor: Theme.colors.glassBackground,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.glassBorder,
    padding: Theme.spacing.lg,
    maxWidth: 540,
    width: '100%',
    alignSelf: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Theme.colors.cardBackground,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.cardBorder,
    paddingHorizontal: 14,
    height: 48,
    color: Theme.colors.textPrimary,
    fontSize: 15,
    marginBottom: 16,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  switchLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Theme.colors.textPrimary,
  },
  submitButton: {
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.md,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
