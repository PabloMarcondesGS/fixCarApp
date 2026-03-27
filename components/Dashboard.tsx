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
  id?: string;
  name: string;
  picture: string;
  role?: 'client' | 'workshop';
  workshop_id?: string;
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
      const url = userInfo?.id ? `${API_ENDPOINTS.VEHICLES}?userId=${userInfo.id}` : API_ENDPOINTS.VEHICLES;
      const response = await fetch(url);
      const data = await response.json();
      setVehicleCount(data.length);
    } catch (e) {
      console.error('Failed to load vehicle count', e);
    }
  };

  const loadAppointments = async () => {
    try {
      let url = API_ENDPOINTS.APPOINTMENTS;
      if (userInfo?.role === 'workshop' && userInfo?.workshop_id) {
        url += `?workshopId=${userInfo.workshop_id}`;
      } else if (userInfo?.id) {
        url += `?userId=${userInfo.id}`;
      }
      
      const response = await fetch(url);
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

  const isWorkshop = userInfo?.role === 'workshop';

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
            <Text style={styles.tokenText}>{isWorkshop ? 'Painel de Controle da Oficina' : 'Explorando o universo automotivo'}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Ionicons name="log-out-outline" size={24} color="#F44336" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.dashboardContent} showsVerticalScrollIndicator={false}>
        {isWorkshop ? (
          <View style={styles.workshopSection}>
            <Text style={styles.sectionTitle}>Próximos Agendamentos</Text>
            {appointmentCount === 0 ? (
              <Text style={styles.emptyText}>Nenhum agendamento encontrado.</Text>
            ) : (
              // Mostra todos os agendamentos para a oficina
              <View>
                {/* Aqui poderíamos iterar sobre uma lista completa de agendamentos se tivéssemos o estado */}
                {/* Por simplicidade no MVP, vamos mostrar o próximo agendamento com um estilo de lista */}
                <View style={styles.nextAppointmentCard}>
                   <View style={styles.nextAppointmentContent}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.nextAppointmentWorkshop}>{nextAppointment?.vehicleModel || 'Carro'} - {nextAppointment?.vehiclePlate}</Text>
                        <Text style={styles.nextAppointmentDetail}>Serviço agendado para {nextAppointment?.date}</Text>
                      </View>
                      <View style={styles.timeBadge}>
                        <Text style={styles.timeBadgeText}>{nextAppointment?.time}</Text>
                      </View>
                   </View>
                </View>
                {/* Simulação de outros itens para visualização */}
                <View style={[styles.nextAppointmentCard, { opacity: 0.7 }]}>
                   <View style={styles.nextAppointmentContent}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.nextAppointmentWorkshop}>Honda Civic - ABC-1234</Text>
                        <Text style={styles.nextAppointmentDetail}>Troca de Óleo • 15/04</Text>
                      </View>
                      <View style={[styles.timeBadge, { backgroundColor: '#E2E8F0' }]}>
                        <Text style={[styles.timeBadgeText, { color: '#64748B' }]}>14:30</Text>
                      </View>
                   </View>
                </View>
              </View>
            )}

            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Ionicons name="calendar-outline" size={24} color="#4A90E2" style={{ marginBottom: 4 }} />
                <Text style={styles.statNumber}>{appointmentCount}</Text>
                <Text style={styles.statLabel}>Agendamentos</Text>
              </View>
              <View style={styles.statBox}>
                <Ionicons name="lock-closed-outline" size={24} color="#4A90E2" style={{ marginBottom: 4 }} />
                <Text style={styles.statNumber}>3</Text>
                <Text style={styles.statLabel}>Bloqueios</Text>
              </View>
            </View>
          </View>
        ) : (
          <>
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
          </>
        )}
      </ScrollView>
    </View>
  );
}
