import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Drawer } from 'expo-router/drawer';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { View, ActivityIndicator } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/context/AuthContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, userInfo, loading } = useAuth();
  
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FF8F00" />
      </View>
    );
  }

  const isWorkshop = userInfo?.role === 'workshop';

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
      headerStyle: {
        backgroundColor: '#FFC680',
        elevation: 0, // Remove sombra no Android
        shadowOpacity: 0, // Remove sombra no iOS
        borderBottomWidth: 1,
        borderBottomColor: '#FFC680',
      },
      headerTintColor: '#1E293B',
      headerTitleStyle: {
        fontWeight: '800',
      },
      drawerStyle: { 
        width: 250,
        backgroundColor: 'rgba(255, 255, 255, 0.94)',
      },
      drawerActiveTintColor: '#FF8F00', // Um laranja mais forte para o menu
      drawerInactiveTintColor: '#64748B',
      drawerActiveBackgroundColor: '#FFF8E1',
      drawerLabelStyle: {
        fontSize: 16,
        fontWeight: '600',
      },
      drawerType: 'front',
      overlayColor: 'rgba(0, 0, 0, 0.5)',
    }}>
      <Drawer.Screen
        name="(tabs)"
        options={{
          drawerLabel: 'Home',
          title: 'My Car',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="perfil-oficina"
        options={{
          drawerLabel: 'Dados da Oficina',
          title: 'Configurar Oficina',
          drawerItemStyle: isWorkshop ? {} : { display: 'none' },
          drawerIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="bloqueio"
        options={{
          drawerLabel: 'Bloquear Horários',
          title: 'Gerenciar Agenda',
          drawerItemStyle: isWorkshop ? {} : { display: 'none' },
          drawerIcon: ({ color, size }) => (
            <Ionicons name="lock-closed-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="veiculos"
        options={{
          drawerLabel: 'Meus Veículos',
          title: 'Meus Veículos',
          drawerItemStyle: isWorkshop ? { display: 'none' } : {},
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
          drawerItemStyle: isWorkshop ? { display: 'none' } : {},
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
