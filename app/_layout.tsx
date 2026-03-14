import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Drawer } from 'expo-router/drawer';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/context/AuthContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    );
  }

  return (
    <Drawer screenOptions={{ 
      headerShown: true,
      drawerStyle: { width: 250 },
    }}>
      <Drawer.Screen
        name="(tabs)"
        options={{
          drawerLabel: 'Home',
          title: 'Meu App',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
        <Drawer.Screen
          name="veiculos"
          options={{
            drawerLabel: 'Meus Veículos',
            title: 'Meus Veículos',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="car-outline" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="oficinas"
          options={{
            drawerLabel: 'Oficinas',
            title: 'Oficinas Parceiras',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="construct-outline" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="detalhes-veiculo"
          options={{
            drawerLabel: 'Detalhes',
            title: 'Detalhes do Veículo',
            drawerItemStyle: { display: 'none' },
          }}
        />
        <Drawer.Screen
          name="agendamento"
          options={{
            drawerLabel: 'Agendamento',
            title: 'Agendar Horário',
            drawerItemStyle: { display: 'none' },
          }}
        />
    </Drawer>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <RootLayoutContent />
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
