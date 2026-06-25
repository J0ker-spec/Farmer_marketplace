import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { auth, db } from '../services/firebase';
import { withUserIds } from '../utils/documents';
import { getRoleHomeRoute, Routes } from '../utils/routes';

const MOCK_PROFILE_KEY = 'mock_profile';

function normalizeProfile(userId: string, data: Record<string, unknown>) {
  return withUserIds(userId, data);
}

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const router = useRouter();

  const fetchProfile = async (userId: string) => {
    try {
      const profileDoc = await getDoc(doc(db, 'users', userId));
      if (profileDoc.exists()) {
        const profileData = normalizeProfile(userId, profileDoc.data() as Record<string, unknown>);
        setProfile(profileData);
        return profileData;
      }
      setProfile(null);
      return null;
    } catch (e) {
      console.warn('Error fetching profile', e);
      return null;
    }
  };

  useEffect(() => {
    let unsubProfile: (() => void) | undefined;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      unsubProfile?.();
      unsubProfile = undefined;

      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          await AsyncStorage.removeItem(MOCK_PROFILE_KEY);
        } catch {
          /* ignore */
        }

        const profileData = await fetchProfile(firebaseUser.uid);
        if (profileData) {
          unsubProfile = onSnapshot(doc(db, 'users', firebaseUser.uid), (snap) => {
            if (snap.exists()) {
              setProfile(normalizeProfile(snap.id, snap.data() as Record<string, unknown>));
            }
          });
        }
      } else {
        try {
          const mockRaw = await AsyncStorage.getItem(MOCK_PROFILE_KEY);
          if (mockRaw) {
            const mockProfile = JSON.parse(mockRaw);
            const userId = mockProfile.user_id || mockProfile.id;
            const normalized = normalizeProfile(userId, mockProfile);
            setProfile(normalized);
            setUser({ uid: userId } as any);
          } else {
            setProfile(null);
            setUser(null);
          }
        } catch {
          setProfile(null);
          setUser(null);
        }
      }

      setLoading(false);
    });

    return () => {
      unsubscribe();
      unsubProfile?.();
    };
  }, []);

  useEffect(() => {
    if (!profile || loading) return;
    if (profile.blocked) {
      const t = setTimeout(() => {
        wrappedSignOut();
        alert('Your account has been blocked. Please contact support for more information.');
      }, 0);
      return () => clearTimeout(t);
    }
    if (profile.role === 'farmer' && !profile.verified) {
      const t = setTimeout(() => {
        router.replace(Routes.pendingApproval as any);
      }, 0);
      return () => clearTimeout(t);
    }
  }, [profile, loading, router]);

  const setMockProfile = async (p: any) => {
    try {
      const userId = p.user_id || p.id;
      const normalized = normalizeProfile(userId, p);
      await AsyncStorage.setItem(MOCK_PROFILE_KEY, JSON.stringify(normalized));
      setProfile(normalized);
      setUser({ uid: userId } as any);
    } catch (e) {
      console.error('Failed to set mock profile', e);
      throw e;
    }
  };

  const wrappedSignOut = async () => {
    try {
      await AsyncStorage.removeItem(MOCK_PROFILE_KEY);
    } catch {
      /* ignore */
    }
    try {
      if (auth.currentUser) {
        await firebaseSignOut(auth);
      }
    } catch (e) {
      console.warn('Sign out failed', e);
    }
    setProfile(null);
    setUser(null);
    router.replace(Routes.login as any);
  };

  const navigateToRoleHome = () => {
    router.replace(getRoleHomeRoute(profile?.role, profile?.verified) as any);
  };

  return {
    user,
    profile,
    loading,
    signOut: wrappedSignOut,
    refetchProfile: fetchProfile,
    setMockProfile,
    navigateToRoleHome,
  };
}
