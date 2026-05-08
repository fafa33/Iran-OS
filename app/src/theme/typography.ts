import { StyleSheet } from 'react-native';

export const Typography = StyleSheet.create({
  display: {
    fontSize: 32,
    fontWeight: '700',
    writingDirection: 'rtl',
    textAlign: 'center',
  },
  h1: {
    fontSize: 24,
    fontWeight: '700',
    writingDirection: 'rtl',
  },
  h2: {
    fontSize: 20,
    fontWeight: '600',
    writingDirection: 'rtl',
  },
  h3: {
    fontSize: 17,
    fontWeight: '600',
    writingDirection: 'rtl',
  },
  body: {
    fontSize: 15,
    fontWeight: '400',
    writingDirection: 'rtl',
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    writingDirection: 'rtl',
  },
  mono: {
    fontSize: 13,
    fontFamily: 'monospace',
  },
});
