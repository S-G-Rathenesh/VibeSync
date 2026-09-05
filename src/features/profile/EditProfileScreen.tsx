import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/useAuthStore';
import { Theme } from '../../theme';
import { AVATARS } from '../../constants/avatars';
import { ArrowLeft, User, AtSign, Check, AlertCircle, Image as ImageIcon } from 'lucide-react-native';

export const EditProfileScreen = () => {
  const navigation = useNavigation();
  const { user, updateUserProfile } = useAuthStore();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [username, setUsername] = useState(user?.username || '');
  const [selectedAvatarId, setSelectedAvatarId] = useState(user?.photoUrl || AVATARS[0].id);
  const [errorMsg, setErrorMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSave = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setSaving(true);

    const result = await updateUserProfile(displayName, username, selectedAvatarId);
    setSaving(false);

    if (!result.success) {
      setErrorMsg(result.error || 'Failed to update profile.');
    } else {
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => {
        navigation.goBack();
      }, 1000);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color={Theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          {/* Avatar Selector Section */}
          <View style={styles.avatarSectionHeader}>
            <ImageIcon size={18} color={Theme.colors.primary} style={{ marginRight: 8 }} />
            <Text style={styles.sectionLabel}>Select Account Avatar</Text>
          </View>

          <View style={styles.avatarGrid}>
            {AVATARS.map((avatar) => {
              const isSelected = selectedAvatarId === avatar.id;
              return (
                <TouchableOpacity
                  key={avatar.id}
                  activeOpacity={0.8}
                  style={[styles.avatarChoice, isSelected && styles.selectedAvatarChoice]}
                  onPress={() => setSelectedAvatarId(avatar.id)}
                >
                  <Image source={avatar.image} style={styles.avatarImage} />
                  {isSelected && (
                    <View style={styles.checkBadge}>
                      <Check size={12} color="#FFF" />
                    </View>
                  )}
                  <Text style={[styles.avatarName, isSelected && styles.selectedAvatarName]} numberOfLines={1}>
                    {avatar.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Input Fields */}
          <Text style={[styles.label, { marginTop: 20 }]}>Display Name</Text>
          <View style={styles.inputRow}>
            <User size={18} color={Theme.colors.textMuted} style={{ marginRight: 10 }} />
            <TextInput
              style={styles.input}
              placeholder="Your name..."
              placeholderTextColor={Theme.colors.textMuted}
              value={displayName}
              onChangeText={(text) => {
                setDisplayName(text);
                setErrorMsg('');
              }}
            />
          </View>

          <Text style={[styles.label, { marginTop: 16 }]}>Unique Username</Text>
          <View style={styles.inputRow}>
            <AtSign size={18} color={Theme.colors.primary} style={{ marginRight: 10 }} />
            <TextInput
              style={styles.input}
              placeholder="username"
              placeholderTextColor={Theme.colors.textMuted}
              value={username}
              autoCapitalize="none"
              onChangeText={(text) => {
                setUsername(text.toLowerCase().replace(/[^a-z0-9_]/g, ''));
                setErrorMsg('');
              }}
            />
          </View>
          <Text style={styles.hintText}>
            Only lowercase letters, numbers, and underscores are allowed.
          </Text>

          {errorMsg ? (
            <View style={styles.errorCard}>
              <AlertCircle size={16} color={Theme.colors.error} style={{ marginRight: 8 }} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          {successMsg ? (
            <View style={styles.successCard}>
              <Check size={16} color={Theme.colors.success} style={{ marginRight: 8 }} />
              <Text style={styles.successText}>{successMsg}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={styles.saveButton}
            activeOpacity={0.8}
            disabled={saving}
            onPress={handleSave}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.md,
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
  card: {
    backgroundColor: Theme.colors.glassBackground,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.glassBorder,
    padding: Theme.spacing.lg,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  avatarSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  avatarChoice: {
    width: 60,
    alignItems: 'center',
    marginBottom: 10,
    padding: 4,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  selectedAvatarChoice: {
    borderColor: Theme.colors.primary,
    backgroundColor: 'rgba(255, 0, 85, 0.1)',
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: Theme.borderRadius.full,
    marginBottom: 4,
  },
  checkBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.full,
    padding: 2,
  },
  avatarName: {
    fontSize: 9,
    color: Theme.colors.textMuted,
    textAlign: 'center',
  },
  selectedAvatarName: {
    color: Theme.colors.primary,
    fontWeight: '700',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.cardBackground,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.cardBorder,
    paddingHorizontal: 14,
    height: 48,
  },
  input: {
    flex: 1,
    color: Theme.colors.textPrimary,
    fontSize: 15,
  },
  hintText: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    marginTop: 6,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 69, 58, 0.1)',
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 58, 0.3)',
    padding: 10,
    marginTop: 16,
  },
  errorText: {
    fontSize: 13,
    color: Theme.colors.error,
    flex: 1,
  },
  successCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.3)',
    padding: 10,
    marginTop: 16,
  },
  successText: {
    fontSize: 13,
    color: Theme.colors.success,
    flex: 1,
  },
  saveButton: {
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.md,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
