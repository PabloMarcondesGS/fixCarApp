import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image, ScrollView, Text, TouchableOpacity, View, Linking } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useState, useCallback } from 'react';
import { styles } from './Dashboard.styles';
import { API_ENDPOINTS } from '@/constants/Api';

const STORAGE_KEY = '@meu-app-expo:veiculos_v2';
const APPOINTMENTS_KEY = '@meu-app-expo:agendamentos';

interface Appointment {
  id: string;
  workshopName: string;
  workshopAddress?: string;
  vehicleModel: string;
  vehiclePlate: string;
  date: string;
  time: string;
}

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
  const [nextAppointment, setNextAppointment] = useState<Appointment | null>(null);
  const [appointmentCount, setAppointmentCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    await loadVehicleCount();
    await loadAppointments();
  };

  const loadVehicleCount = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.VEHICLES);
      const data = await response.json();
      setVehicleCount(data.length);
    } catch (e) {
      console.error('Failed to load vehicle count from API', e);
    }
  };

  const loadAppointments = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.APPOINTMENTS);
      const data: Appointment[] = await response.json();
      setAppointmentCount(data.length);
      if (data.length > 0) {
        // Simplificação: pega o último agendamento feito como "próximo"
        setNextAppointment(data[data.length - 1]);
      } else {
        setNextAppointment(null);
      }
    } catch (e) {
      console.error('Failed to load appointments from API', e);
    }
  };

  const handleOpenAddress = (address: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    Linking.openURL(url);
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
        {nextAppointment && (
          <View style={styles.nextAppointmentCard}>
            <View style={styles.nextAppointmentBadge}>
              <Text style={styles.nextAppointmentBadgeText}>Próxima Revisão</Text>
            </View>
            <View style={styles.nextAppointmentContent}>
              <View style={{ flex: 1 }}>
                <Text style={styles.nextAppointmentWorkshop}>{nextAppointment.workshopName}</Text>
                <Text style={styles.nextAppointmentDetail}>{nextAppointment.vehicleModel} • {nextAppointment.vehiclePlate}</Text>
              </View>
              <Ionicons name="calendar-outline" size={32} color="#4A90E2" />
            </View>
            <View style={styles.nextAppointmentDateContainer}>
              <Ionicons name="time-outline" size={20} color="#4A90E2" />
              <Text style={styles.nextAppointmentDate}>{nextAppointment.date} às {nextAppointment.time}</Text>
            </View>

            {nextAppointment.workshopAddress && (
              <TouchableOpacity 
                style={styles.addressButton} 
                onPress={() => handleOpenAddress(nextAppointment.workshopAddress!)}
              >
                <Ionicons name="map-outline" size={20} color="#4A90E2" />
                <Text style={styles.addressButtonText}>Ver Endereço</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={styles.card}>
          <Ionicons name="car-sport" size={40} color="#4A90E2" style={{ marginBottom: 10 }} />
          <Text style={styles.cardTitle}>Gerencie seus veículos</Text>
          <Text style={styles.cardDescription}>Acompanhe o status dos seus veículos, registros de manutenção e histórico completo em um só lugar.</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Ionicons name="construct-outline" size={24} color="#4A90E2" style={{ marginBottom: 4 }} />
            <Text style={styles.statNumber}>{appointmentCount}</Text>
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
