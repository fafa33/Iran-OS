import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors } from '../theme/colors';
import { LionSunLogo } from '../components/LionSunLogo';

interface Props {
  onFinish: () => void;
}

export const SplashScreen: React.FC<Props> = ({ onFinish }) => {
  const opacity = new Animated.Value(0);
  const scale = new Animated.Value(0.85);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(onFinish, 2800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* خط طلایی بالا — رنگ پرچم */}
      <View style={styles.flagStripe}>
        <View style={[styles.stripe, { backgroundColor: Colors.green }]} />
        <View style={[styles.stripe, { backgroundColor: Colors.white }]} />
        <View style={[styles.stripe, { backgroundColor: Colors.red }]} />
      </View>

      <Animated.View style={[styles.center, { opacity, transform: [{ scale }] }]}>
        <LionSunLogo size={220} color={Colors.gold} />

        <Text style={styles.title}>ایران‌اواس</Text>
        <Text style={styles.subtitle}>سیستم‌عامل حاکمیتی ایران</Text>

        <View style={styles.divider} />

        <Text style={styles.motto}>
          قانون اساسی، کد است. کد، قانون اساسی است.
        </Text>
      </Animated.View>

      <Text style={styles.version}>نسخه ۱.۰ — فروردین ۱۴۰۵</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagStripe: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'column',
    height: 6,
  },
  stripe: {
    flex: 1,
  },
  center: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 38,
    fontWeight: '700',
    color: Colors.gold,
    marginTop: 24,
    writingDirection: 'rtl',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 8,
    writingDirection: 'rtl',
  },
  divider: {
    width: 60,
    height: 1,
    backgroundColor: Colors.goldDim,
    marginVertical: 24,
  },
  motto: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    writingDirection: 'rtl',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  version: {
    position: 'absolute',
    bottom: 40,
    fontSize: 11,
    color: Colors.textMuted,
    writingDirection: 'rtl',
  },
});
