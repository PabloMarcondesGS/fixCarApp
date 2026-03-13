import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { styles } from './Dashboard.styles';

const STORAGE_KEY = '@meu-app-expo:veiculos_v2';

export interface UserInfo {
  name: string;
  picture: string;
}

interface DashboardProps {
  token: string;
  userInfo: UserInfo | null;
  onLogout: () => void;
}

export default function Dashboard({ token, userInfo, onLogout }: DashboardProps) {
  const [vehicleCount, setVehicleCount] = useState(0);

  useEffect(() => {
    loadVehicleCount();
  }, []);

  const loadVehicleCount = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const vehicles = JSON.parse(stored);
        setVehicleCount(vehicles.length);
      }
    } catch (e) {
      console.error('Failed to load vehicle count', e);
    }
  };

  return (
    <View style={styles.dashboardContainer}>
      <View style={styles.dashboardHeader}>
        <View style={styles.userInfo}>
          {userInfo?.picture ? (
            <Image source={{ uri: userInfo.picture }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={40} color="#4A90E2" />
            </View>
          )}
          <View>
            <Text style={styles.welcomeText}>Olá, {userInfo?.name || 'Explorador'}!</Text>
            <Text style={styles.tokenText}>Explorando o universo automotivo</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Ionicons name="log-out-outline" size={24} color="#F44336" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.dashboardContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Ionicons name="car-sport" size={40} color="#4A90E2" style={{ marginBottom: 10 }} />
          <Text style={styles.cardTitle}>Gerencie seus veículos</Text>
          <Text style={styles.cardDescription}>Acompanhe o status dos seus veículos, registros de manutenção e histórico completo em um só lugar.</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Ionicons name="construct-outline" size={24} color="#4A90E2" style={{ marginBottom: 4 }} />
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Revisões</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="car-outline" size={24} color="#4A90E2" style={{ marginBottom: 4 }} />
            <Text style={styles.statNumber}>{vehicleCount}</Text>
            <Text style={styles.statLabel}>Veículos</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="notifications-outline" size={24} color="#FF9800" style={{ marginBottom: 8 }} />
          <Text style={styles.infoTitle}>Dica do dia</Text>
          <Text style={styles.infoText}>Mantenha a calibragem dos pneus em dia para economizar combustível e aumentar a segurança.</Text>
        </View>
      </ScrollView>
    </View>
  );
}
