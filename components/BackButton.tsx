import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Colors } from '../constants/colors';
import { useAuth } from '../hooks/useAuth';
import { getRoleHomeRoute } from '../utils/routes';

export default function BackButton() {
  const router = useRouter();
  const { profile } = useAuth();

  const handlePress = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(getRoleHomeRoute(profile?.role, profile?.verified) as any);
  };

  return (
    <TouchableOpacity onPress={handlePress} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
      <Ionicons name="arrow-back" size={28} color={Colors.text} />
    </TouchableOpacity>
  );
}
