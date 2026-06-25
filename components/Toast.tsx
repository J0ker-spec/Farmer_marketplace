import React from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/colors';
import { useToast } from '../context/ToastContext';

export default function Toast() {
  const { current } = useToast();
  const [opacity] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    if (current) {
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
      const t = setTimeout(() => {
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start();
      }, 2200);
      return () => clearTimeout(t);
    }
  }, [current, opacity]);

  if (!current) return null;

  return (
    <Animated.View style={[styles.container, { opacity }]}> 
      <View style={styles.toast}>
        <Text style={styles.text}>{current.message}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 40,
    alignItems: 'center',
  },
  toast: {
    backgroundColor: Colors.text,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  text: {
    color: Colors.white,
    fontWeight: '600',
  },
});
