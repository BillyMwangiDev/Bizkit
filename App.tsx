import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useProfileStore } from './src/store/profileStore';
import { useDocumentStore } from './src/store/documentStore';
import { palette, fontSize, fontWeight, spacing } from './src/theme';

export default function App() {
  const profileHydrated = useProfileStore((s) => s.hydrated);
  const documentsHydrated = useDocumentStore((s) => s.hydrated);
  const ready = profileHydrated && documentsHydrated;

  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        {ready ? (
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        ) : (
          <View style={styles.splash}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>B</Text>
            </View>
            <Text style={styles.brand}>BizKit</Text>
            <ActivityIndicator color={palette.primary} style={styles.loader} />
          </View>
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.slate50,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { color: palette.white, fontSize: 36, fontWeight: fontWeight.bold },
  brand: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: palette.ink,
    marginTop: spacing.lg,
  },
  loader: { marginTop: spacing.xl },
});
