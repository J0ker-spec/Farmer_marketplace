import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GradientBackground } from '../../components/ui/GradientBackground';
import { Colors } from '../../constants/colors';
import { useTranslation } from '../../hooks/useTranslation';
import { Routes } from '../../utils/routes';

export default function RoleSelectScreen() {
  const router = useRouter();
  const { t, language, changeLanguage } = useTranslation();

  return (
    <GradientBackground>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.languageToggle}
          onPress={() => changeLanguage(language === 'en' ? 'krio' : 'en')}
          activeOpacity={0.75}
        >
          <Text style={styles.languageText}>{language === 'en' ? 'EN' : 'KR'}</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.logoMark}>
            <Ionicons name="leaf" size={28} color={Colors.white} />
          </View>
          <Text style={styles.brandLabel}>AGRI-TECH PLATFORM</Text>
          <Text style={styles.title}>{t('auth.roleSelect.title')}</Text>
          <Text style={styles.subtitle}>{t('auth.roleSelect.subtitle')}</Text>
        </View>

        <RoleCard
          icon="leaf-outline"
          title={t('auth.roleSelect.farmer')}
          subtitle="Sell harvests, manage orders, and build trust."
          onPress={() => router.push(Routes.registerFarmer as any)}
        />
        <RoleCard
          icon="basket-outline"
          title={t('auth.roleSelect.buyer')}
          subtitle="Discover fresh food and buy directly from farms."
          onPress={() => router.push(Routes.registerBuyer as any)}
        />
        <RoleCard
          icon="shield-checkmark-outline"
          title={t('auth.roleSelect.admin')}
          subtitle="Review farmers and keep marketplace activity healthy."
          onPress={() => router.push(Routes.login as any)}
        />

        <TouchableOpacity onPress={() => router.push(Routes.login as any)} style={styles.loginLink} activeOpacity={0.75}>
          <Text style={styles.loginLinkText}>Already have an account? Sign in</Text>
        </TouchableOpacity>
      </View>
    </GradientBackground>
  );
}

function RoleCard({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.roleCard} onPress={onPress} activeOpacity={0.78}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={28} color={Colors.primary} />
      </View>
      <View style={styles.cardText}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  languageToggle: {
    position: 'absolute',
    top: 50,
    right: 24,
    backgroundColor: Colors.surfaceGlass,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  languageText: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.primary,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoMark: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    marginBottom: 14,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    elevation: 6,
  },
  brandLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
    textAlign: 'center',
    letterSpacing: 3,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 23,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceGlass,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.primaryGlow,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: Colors.textSecondary,
  },
  loginLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: 15,
    color: Colors.primary,
    fontWeight: '800',
  },
});