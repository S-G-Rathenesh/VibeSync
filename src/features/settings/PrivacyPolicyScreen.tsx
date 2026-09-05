import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Theme } from '../../theme';
import { ArrowLeft, ShieldCheck, Lock, PlayCircle, Radio, Sparkles } from 'lucide-react-native';

export const PrivacyPolicyScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color={Theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* App Branding Header Card */}
        <View style={styles.brandingCard}>
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.appName}>VibeSync</Text>
          <Text style={styles.appTagline}>Feel the Beat, Together. Watch Videos in Sync.</Text>

          {/* Created by RsVibe Badge */}
          <View style={styles.creatorBadge}>
            <Sparkles size={14} color={Theme.colors.accent} style={{ marginRight: 6 }} />
            <Text style={styles.creatorText}>Created by <Text style={styles.creatorHighlight}>RsVibe</Text></Text>
          </View>
        </View>

        {/* Introduction Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <ShieldCheck size={20} color={Theme.colors.primary} style={{ marginRight: 10 }} />
            <Text style={styles.sectionTitle}>1. Introduction & Overview</Text>
          </View>
          <Text style={styles.sectionText}>
            Welcome to VibeSync! Your privacy is of fundamental importance to us. This Privacy Policy details how VibeSync protects, uses, and respects your data when you participate in synchronized watch rooms, manage favorites, and connect with friends.
          </Text>
        </View>

        {/* Data Collection */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Lock size={20} color={Theme.colors.accent} style={{ marginRight: 10 }} />
            <Text style={styles.sectionTitle}>2. Information We Collect</Text>
          </View>
          <Text style={styles.sectionText}>
            • <Text style={styles.boldText}>User Account Profile:</Text> When logging in, we collect basic profile details including your display name, email address, unique User ID, and selected avatar to establish your VibeSync identity.
          </Text>
          <Text style={styles.sectionText}>
            • <Text style={styles.boldText}>App Preferences & Activity:</Text> Your custom avatar choices, language preferences, favorite videos, watch history, and playlists are securely saved on your device for a personalized experience.
          </Text>
        </View>

        {/* Streaming & Media Content */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <PlayCircle size={20} color={Theme.colors.primary} style={{ marginRight: 10 }} />
            <Text style={styles.sectionTitle}>3. Media & Content Services</Text>
          </View>
          <Text style={styles.sectionText}>
            VibeSync connects to global online video services to provide video search, display music recommendations, and power real-time media playback across synchronized room participants.
          </Text>
          <Text style={styles.sectionText}>
            By using VibeSync, you agree to adhere to standard content guidelines and privacy standards.
          </Text>
        </View>

        {/* Real-Time Room Sync */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Radio size={20} color={Theme.colors.secondary} style={{ marginRight: 10 }} />
            <Text style={styles.sectionTitle}>4. Real-Time Room Synchronization</Text>
          </View>
          <Text style={styles.sectionText}>
            VibeSync uses secure cloud synchronization channels to instantly broadcast media playback timing (play, pause, seek position) and live chat messages to all participants in active watch rooms.
          </Text>
        </View>

        {/* Footer Credit Card */}
        <View style={styles.footerCreditCard}>
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.smallLogo}
            resizeMode="contain"
          />
          <Text style={styles.footerAppTitle}>VibeSync v1.0.0</Text>
          <Text style={styles.footerCreditText}>Designed & Developed by <Text style={styles.footerHighlight}>RsVibe</Text></Text>
          <Text style={styles.footerRights}>All Rights Reserved © 2026</Text>
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
    paddingHorizontal: Theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.md,
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
  scrollContent: {
    paddingBottom: Theme.spacing.xl,
  },
  brandingCard: {
    alignItems: 'center',
    backgroundColor: Theme.colors.glassBackground,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.glassBorder,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
  },
  logoImage: {
    width: 72,
    height: 72,
    marginBottom: 10,
  },
  appName: {
    fontSize: 26,
    fontWeight: '800',
    color: Theme.colors.textPrimary,
    letterSpacing: 0.5,
  },
  appTagline: {
    fontSize: 13,
    color: Theme.colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  creatorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 85, 0.12)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Theme.borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 85, 0.3)',
  },
  creatorText: {
    fontSize: 13,
    color: Theme.colors.textPrimary,
    fontWeight: '600',
  },
  creatorHighlight: {
    color: Theme.colors.primary,
    fontWeight: '800',
  },
  sectionCard: {
    backgroundColor: Theme.colors.cardBackground,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.cardBorder,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
  },
  sectionText: {
    fontSize: 13,
    color: Theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  boldText: {
    fontWeight: '700',
    color: Theme.colors.textPrimary,
  },
  footerCreditCard: {
    alignItems: 'center',
    paddingVertical: 20,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.cardBorder,
  },
  smallLogo: {
    width: 44,
    height: 44,
    marginBottom: 8,
  },
  footerAppTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
  },
  footerCreditText: {
    fontSize: 13,
    color: Theme.colors.textMuted,
    marginTop: 4,
  },
  footerHighlight: {
    color: Theme.colors.accent,
    fontWeight: '800',
  },
  footerRights: {
    fontSize: 11,
    color: Theme.colors.textMuted,
    marginTop: 6,
  },
});
