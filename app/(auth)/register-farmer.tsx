import { useLocalSearchParams, useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppPopup } from '../../components/ui/AppPopup';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { CATEGORIES } from '../../constants/categories';
import { borderRadius, colors, shadows, spacing } from '../../constants/designSystem';
import { districts } from '../../constants/districts';
import { auth, db } from '../../services/firebase';
import { useTranslation } from '../../hooks/useTranslation';
import { getAuthErrorMessage } from '../../utils/authErrors';
import { Routes } from '../../utils/routes';

export default function RegisterFarmerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ phone?: string }>();
  const { t } = useTranslation();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [farmName, setFarmName] = useState('');
  const [district, setDistrict] = useState('');
  const [village, setVillage] = useState('');
  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState<{ type: 'success' | 'error'; title: string; message: string; next?: string } | null>(null);

  const toggleCrop = (crop: string) => {
    if (selectedCrops.includes(crop)) {
      setSelectedCrops(selectedCrops.filter(c => c !== crop));
    } else {
      setSelectedCrops([...selectedCrops, crop]);
    }
  };

  const handleRegister = async () => {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanFarmName = farmName.trim();
    const cleanVillage = village.trim();

    if (!cleanName || !cleanEmail || !password || !cleanFarmName || !district || !cleanVillage || selectedCrops.length === 0) {
      setPopup({ type: 'error', title: 'Almost there', message: 'Please complete every required field and choose at least one crop.' });
      return;
    }

    setLoading(true);

    try {
      // Sign up with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);

      if (!userCredential?.user) {
        throw new Error('Failed to create account');
      }

      // Create user profile in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        user_id: userCredential.user.uid,
        name: cleanName,
        email: cleanEmail,
        phone: params.phone || null,
        role: 'farmer',
        farm_name: cleanFarmName,
        district,
        location: cleanVillage,
        verified: false,
        crops: selectedCrops,
        created_at: new Date().toISOString(),
      });

      setPopup({
        type: 'success',
        title: 'Application sent',
        message: 'Your farmer account was created and is waiting for admin approval.',
        next: Routes.pendingApproval,
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      setPopup({ type: 'error', title: 'Registration failed', message: getAuthErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>Farmer profile</Text>
          <Text style={styles.title}>{t('auth.registerFarmer.title')}</Text>
          <Text style={styles.subtitle}>Create your farm storefront and start receiving local orders.</Text>
        </View>

        <Card padding="lg">
          <Input
            label={t('auth.registerFarmer.fullName')}
            value={name}
            onChangeText={setName}
            placeholder="Enter your full name"
          />

          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Create a password"
            secureTextEntry
          />

          <Input
            label={t('auth.registerFarmer.farmName')}
            value={farmName}
            onChangeText={setFarmName}
            placeholder="Enter your farm name"
          />

          <Text style={styles.label}>{t('auth.registerFarmer.district')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsContainer}>
            {districts.map((d) => (
              <TouchableOpacity
                key={d}
                style={[
                  styles.chip,
                  district === d && styles.chipSelected,
                ]}
                onPress={() => setDistrict(d)}
              >
                <Text style={[
                  styles.chipText,
                  district === d && styles.chipTextSelected,
                ]}>
                  {d}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Input
            label={t('auth.registerFarmer.village')}
            value={village}
            onChangeText={setVillage}
            placeholder="Enter your village or area"
          />

          <Text style={styles.label}>{t('auth.registerFarmer.mainCrops')}</Text>
          <View style={styles.cropsContainer}>
            {CATEGORIES.map((crop) => (
              <TouchableOpacity
                key={crop}
                onPress={() => toggleCrop(crop)}
                style={styles.cropItem}
              >
                <Badge
                  text={crop}
                  variant={selectedCrops.includes(crop) ? 'primary' : 'info'}
                />
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <Card padding="md" style={styles.infoCard}>
          <Text style={styles.infoText}>{t('auth.registerFarmer.verificationNotice')}</Text>
        </Card>

        <Button
          title={t('auth.registerFarmer.createAccount')}
          onPress={handleRegister}
          loading={loading}
          disabled={loading}
        />
      </View>
      <AppPopup
        visible={!!popup}
        type={popup?.type}
        title={popup?.title || ''}
        message={popup?.message || ''}
        actionLabel={popup?.type === 'success' ? 'Continue' : 'Try again'}
        onClose={() => {
          const next = popup?.next;
          setPopup(null);
          if (next) router.replace(next as any);
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: spacing.lg,
    paddingTop: spacing.xxxl,
  },
  hero: {
    marginBottom: spacing.xl,
  },
  kicker: {
    alignSelf: 'flex-start',
    overflow: 'hidden',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: `${colors.accent}22`,
    color: colors.warning,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  chipsContainer: {
    marginBottom: spacing.md,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    ...shadows.small,
  },
  chipText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  chipTextSelected: {
    color: colors.surface,
  },
  cropsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  cropItem: {
    marginBottom: spacing.sm,
  },
  infoCard: {
    backgroundColor: colors.primaryLight + '10',
    marginBottom: spacing.lg,
  },
  infoText: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
});
