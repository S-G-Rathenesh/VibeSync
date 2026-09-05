import React, { useState } from 'react';
import { View, Text, Switch, TouchableOpacity, Modal, FlatList, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/useAuthStore';
import { Theme } from '../../theme';
import { ArrowLeft, Wifi, Bell, Globe, ShieldCheck, Check, X, ChevronRight, Sparkles } from 'lucide-react-native';

const availableLanguages = [
  'Global',
  'Tamil',
  'English (US)',
  'Spanish',
  'Hindi',
  'Japanese',
  'Korean',
  'French',
  'German',
  'Portuguese',
];

export const SettingsScreen = () => {
  const navigation = useNavigation();
  const { user, updateSettings } = useAuthStore();
  const [langModalVisible, setLangModalVisible] = useState(false);

  const settings = user?.settings || {
    dataSaver: false,
    notificationsEnabled: true,
    preferredLanguage: 'Global',
  };

  const handleToggleDataSaver = (val: boolean) => {
    updateSettings({ dataSaver: val });
  };

  const handleToggleNotifications = (val: boolean) => {
    updateSettings({ notificationsEnabled: val });
  };

  const handleSelectLanguage = (lang: string) => {
    updateSettings({ preferredLanguage: lang });
    setLangModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color={Theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>App Settings</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.card}>
        {/* Data Saver */}
        <View style={styles.settingRow}>
          <View style={styles.labelGroup}>
            <Wifi size={20} color={Theme.colors.accent} style={{ marginRight: 12 }} />
            <View>
              <Text style={styles.settingTitle}>Data Saver</Text>
              <Text style={styles.settingSub}>Lower video stream quality on mobile data</Text>
            </View>
          </View>
          <Switch
            value={settings.dataSaver}
            onValueChange={handleToggleDataSaver}
            trackColor={{ false: '#333', true: Theme.colors.primary }}
          />
        </View>

        <View style={styles.divider} />

        {/* Push Notifications */}
        <View style={styles.settingRow}>
          <View style={styles.labelGroup}>
            <Bell size={20} color={Theme.colors.primary} style={{ marginRight: 12 }} />
            <View>
              <Text style={styles.settingTitle}>Push Notifications</Text>
              <Text style={styles.settingSub}>Room invites and friend activity alerts</Text>
            </View>
          </View>
          <Switch
            value={settings.notificationsEnabled}
            onValueChange={handleToggleNotifications}
            trackColor={{ false: '#333', true: Theme.colors.primary }}
          />
        </View>

        <View style={styles.divider} />

        {/* Preferred Language */}
        <TouchableOpacity style={styles.settingRow} onPress={() => setLangModalVisible(true)}>
          <View style={styles.labelGroup}>
            <Globe size={20} color={Theme.colors.secondary} style={{ marginRight: 12 }} />
            <View>
              <Text style={styles.settingTitle}>Preferred Language</Text>
              <Text style={styles.settingSub}>{settings.preferredLanguage}</Text>
            </View>
          </View>
          <ChevronRight size={20} color={Theme.colors.textMuted} />
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* Privacy Policy */}
        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => navigation.navigate('PrivacyPolicy' as never)}
        >
          <View style={styles.labelGroup}>
            <ShieldCheck size={20} color={Theme.colors.success} style={{ marginRight: 12 }} />
            <View>
              <Text style={styles.settingTitle}>Privacy Policy</Text>
              <Text style={styles.settingSub}>Read data usage & privacy terms</Text>
            </View>
          </View>
          <ChevronRight size={20} color={Theme.colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Created by RsVibe Branding Footer */}
      <View style={styles.footerBranding}>
        <Image
          source={require('../../../assets/logo.png')}
          style={styles.footerLogo}
          resizeMode="contain"
        />
        <Text style={styles.footerAppName}>VibeSync v1.0.0</Text>
        <View style={styles.creditBadge}>
          <Sparkles size={12} color={Theme.colors.accent} style={{ marginRight: 4 }} />
          <Text style={styles.creditText}>Created by <Text style={styles.creditHighlight}>RsVibe</Text></Text>
        </View>
      </View>

      {/* Language Selection Modal */}
      <Modal visible={langModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Preferred Language</Text>
              <TouchableOpacity onPress={() => setLangModalVisible(false)}>
                <X size={20} color={Theme.colors.textMuted} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={availableLanguages}
              keyExtractor={(item) => item}
              renderItem={({ item }) => {
                const isSelected = settings.preferredLanguage === item;
                return (
                  <TouchableOpacity
                    style={[styles.langItem, isSelected && styles.selectedLangItem]}
                    onPress={() => handleSelectLanguage(item)}
                  >
                    <Text style={[styles.langText, isSelected && styles.selectedLangText]}>
                      {item}
                    </Text>
                    {isSelected && <Check size={18} color={Theme.colors.primary} />}
                  </TouchableOpacity>
                );
              }}
            />
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
  card: {
    backgroundColor: Theme.colors.glassBackground,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.glassBorder,
    padding: Theme.spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  labelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 10,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.textPrimary,
  },
  settingSub: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Theme.colors.cardBorder,
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
    maxHeight: 450,
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
  langItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: Theme.borderRadius.md,
    marginBottom: 4,
  },
  selectedLangItem: {
    backgroundColor: 'rgba(255, 0, 85, 0.1)',
  },
  langText: {
    fontSize: 15,
    color: Theme.colors.textPrimary,
  },
  selectedLangText: {
    fontWeight: '700',
    color: Theme.colors.primary,
  },
  footerBranding: {
    alignItems: 'center',
    marginTop: Theme.spacing.xl,
    paddingVertical: Theme.spacing.md,
  },
  footerLogo: {
    width: 48,
    height: 48,
    marginBottom: 8,
  },
  footerAppName: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    marginBottom: 6,
  },
  creditBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 85, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Theme.borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 85, 0.25)',
  },
  creditText: {
    fontSize: 12,
    color: Theme.colors.textPrimary,
    fontWeight: '600',
  },
  creditHighlight: {
    color: Theme.colors.primary,
    fontWeight: '800',
  },
});
