import React, { useState } from 'react';
import { I18nManager, StatusBar } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Colors } from './src/theme/colors';
import { SplashScreen }       from './src/screens/SplashScreen';
import { DashboardScreen }    from './src/screens/DashboardScreen';
import { CitizenCardScreen }  from './src/screens/CitizenCardScreen';
import { WalletScreen }       from './src/screens/WalletScreen';
import { BillsScreen }        from './src/screens/BillsScreen';
import { StakingScreen }      from './src/screens/StakingScreen';
import { KernelStatusScreen } from './src/screens/KernelStatusScreen';

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

const Tab   = createBottomTabNavigator();
const Stack = createStackNavigator();

const NavTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: Colors.background,
    card:       Colors.surface,
    text:       Colors.textPrimary,
    border:     Colors.border,
  },
};

const TAB_ICONS: Record<string, [string, string]> = {
  Dashboard:   ['home',         'home-outline'],
  CitizenCard: ['card',         'card-outline'],
  Wallet:      ['wallet',       'wallet-outline'],
  Bills:       ['receipt',      'receipt-outline'],
  Staking:     ['lock-closed',  'lock-closed-outline'],
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle:      { backgroundColor: Colors.surface, borderBottomColor: Colors.border },
        headerTintColor:  Colors.textPrimary,
        tabBarStyle:      { backgroundColor: Colors.surface, borderTopColor: Colors.border },
        tabBarActiveTintColor:   Colors.gold,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: { fontSize: 10, writingDirection: 'rtl' },
        tabBarIcon: ({ focused, color, size }) => {
          const [active, inactive] = TAB_ICONS[route.name] ?? ['ellipse', 'ellipse-outline'];
          return <Ionicons name={(focused ? active : inactive) as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'داشبورد', headerTitle: 'ایران‌اواس' }}
      />
      <Tab.Screen
        name="CitizenCard"
        component={CitizenCardScreen}
        options={{ title: 'کارت شهروندی', headerTitle: 'کارت شهروندی دیجیتال' }}
      />
      <Tab.Screen
        name="Wallet"
        component={WalletScreen}
        options={{ title: 'کیف‌پول', headerTitle: 'کیف‌پول پهلوی' }}
      />
      <Tab.Screen
        name="Bills"
        component={BillsScreen}
        options={{ title: 'قبوض', headerTitle: 'پرداخت قبوض' }}
      />
      <Tab.Screen
        name="Staking"
        component={StakingScreen}
        options={{ title: 'استیکینگ', headerTitle: 'صندوق ثروت ملی — L2' }}
      />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen
        name="KernelStatus"
        component={KernelStatusScreen}
        options={{
          headerShown:  true,
          headerTitle:  'وضعیت هسته (Kernel)',
          headerStyle:  { backgroundColor: Colors.surface },
          headerTintColor: Colors.textPrimary,
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);

  if (!ready) {
    return <SplashScreen onFinish={() => setReady(true)} />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <NavigationContainer theme={NavTheme}>
        <RootNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
