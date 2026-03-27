import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, FlatList, Image } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS } from '@/constants/Api';
import { useAuth } from '@/context/AuthContext';

const STORAGE_KEY = '@meu-app-expo:veiculos_v2';
const APPOINTMENTS_KEY = '@meu-app-expo:agendamentos';

const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', 
  '13:00', '14:00', '15:00', '16:00', '17:00'
];

interface Appointment {
  id: string;
  workshopId: string;
  workshopName: string;
  workshopAddress?: string;
  vehicleId: string;
  vehicleModel: string;
  vehiclePlate: string;
  date: string;
  time: string;
  user_id?: string;
}

interface Vehicle {
  id: string;
  plate: string;
  model: string;
  color: string;
  type: 'Carro' | 'Moto';
  imageUri?: string;
}

export default function AgendamentoScreen() {
  const { userInfo } = useAuth();
  const params = useLocalSearchParams();
  const workshopId = params.workshopId as string;
  const workshopName = params.workshopName as string || 'Oficina';
  const workshopAddress = params.workshopAddress as string || '';
  
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<number>(0);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      const url = userInfo?.id ? `${API_ENDPOINTS.VEHICLES}?userId=${userInfo.id}` : API_ENDPOINTS.VEHICLES;
      const response = await fetch(url);
      const data = await response.json();
      setVehicles(data);
      if (data.length > 0) {
        setSelectedVehicle(data[0].id);
      }
    } catch (e) {
      console.error('Failed to load vehicles from API', e);
    }
  };

  // Generate next 7 days
  const getDays = () => {
    const days = [];
    const now = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() + i);
      days.push({
        dayName: date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''),
        dayNum: date.getDate(),
        fullDate: date.toLocaleDateString('pt-BR')
      });
    }
    return days;
  };

  const days = getDays();

  const handleConfirm = () => {
    if (!selectedVehicle) {
      alert('Por favor, selecione um veículo.');
      return;
    }
    if (!selectedTime) {
      alert('Por favor, selecione um horário.');
      return;
    }
    const vehicle = vehicles.find(v => v.id === selectedVehicle);
    const newAppointment: Appointment = {
      id: Date.now().toString(),
      workshopId,
      workshopName,
      workshopAddress,
      vehicleId: selectedVehicle || '',
      vehicleModel: vehicle?.model || '',
      vehiclePlate: vehicle?.plate || '',
      date: days[selectedDate].fullDate,
      time: selectedTime,
      user_id: userInfo?.id
    };
    
    sendAppointmentToBackend(newAppointment);
    saveAppointment(newAppointment); // Mantém local também
  };

  const sendAppointmentToBackend = async (appointment: Appointment) => {
    try {
      const response = await fetch(API_ENDPOINTS.APPOINTMENTS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointment),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        alert(`${result.message}\nOficina: ${appointment.workshopName}\nData: ${appointment.date} às ${appointment.time}`);
        router.back();
      } else {
        alert('Erro ao realizar agendamento no servidor.');
      }
    } catch (error) {
      console.error('Erro ao enviar agendamento:', error);
      alert('Agendamento salvo apenas localmente (erro de conexão com o servidor).');
      router.back();
    }
  };

  const saveAppointment = async (appointment: any) => {
    try {
      const stored = await AsyncStorage.getItem(APPOINTMENTS_KEY);
      const appointments = stored ? JSON.parse(stored) : [];
      appointments.push(appointment);
      await AsyncStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
    } catch (e) {
      console.error('Failed to save appointment', e);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Agendar Horário', headerBackTitle: 'Voltar' }} />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.workshopTitle}>{workshopName}</Text>
          <Text style={styles.subtitle}>Escolha o veículo e o melhor horário para o serviço.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Selecione seu Veículo</Text>
          {vehicles.length > 0 ? (
            <FlatList
              horizontal
              data={vehicles}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.vehicleList}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[styles.vehicleCard, selectedVehicle === item.id && styles.vehicleCardSelected]}
                  onPress={() => setSelectedVehicle(item.id)}
                >
                  <View style={styles.vehicleIconContainer}>
                    {item.imageUri ? (
                      <Image source={{ uri: item.imageUri }} style={styles.vehicleThumbnail} />
                    ) : (
                      <Ionicons 
                        name={item.type === 'Carro' ? 'car' : 'bicycle'} 
                        size={24} 
                        color={selectedVehicle === item.id ? '#FFF' : '#4A90E2'} 
                      />
                    )}
                  </View>
                  <Text style={[styles.vehicleModel, selectedVehicle === item.id && styles.textSelected]} numberOfLines={1}>
                    {item.model}
                  </Text>
                  <Text style={[styles.vehiclePlate, selectedVehicle === item.id && styles.textSelected]}>
                    {item.plate}
                  </Text>
                </TouchableOpacity>
              )}
            />
          ) : (
            <TouchableOpacity style={styles.addVehicleReminder} onPress={() => router.push('/veiculos')}>
              <Ionicons name="add-circle-outline" size={32} color="#4A90E2" />
              <Text style={styles.addVehicleReminderText}>Cadastre um veículo para agendar</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Selecione o Dia</Text>
          <FlatList
            horizontal
            data={days}
            keyExtractor={(_, index) => index.toString()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateList}
            renderItem={({ item, index }) => (
              <TouchableOpacity 
                style={[styles.dateCard, selectedDate === index && styles.dateCardSelected]}
                onPress={() => setSelectedDate(index)}
              >
                <Text style={[styles.dayName, selectedDate === index && styles.textSelected]}>
                  {item.dayName.toUpperCase()}
                </Text>
                <Text style={[styles.dayNum, selectedDate === index && styles.textSelected]}>
                  {item.dayNum}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Horários Disponíveis</Text>
          <View style={styles.timeGrid}>
            {TIME_SLOTS.map((time) => (
              <TouchableOpacity
                key={time}
                style={[styles.timeCard, selectedTime === time && styles.timeCardSelected]}
                onPress={() => setSelectedTime(time)}
              >
                <Text style={[styles.timeText, selectedTime === time && styles.textSelected]}>
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmButtonText}>Confirmar Agendamento</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  workshopTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    lineHeight: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  vehicleList: {
    paddingRight: 24,
  },
  vehicleCard: {
    width: 120,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  vehicleCardSelected: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  vehicleIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  vehicleThumbnail: {
    width: '100%',
    height: '100%',
  },
  vehicleModel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
    textAlign: 'center',
  },
  vehiclePlate: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  addVehicleReminder: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  addVehicleReminderText: {
    marginTop: 12,
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '600',
  },
  dateList: {
    paddingRight: 24,
  },
  dateCard: {
    width: 70,
    height: 90,
    backgroundColor: '#FFF',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dateCardSelected: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  dayName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 4,
  },
  dayNum: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  timeCard: {
    width: '30%',
    paddingVertical: 14,
    backgroundColor: '#FFF',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timeCardSelected: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
  },
  textSelected: {
    color: '#FFF',
  },
  footer: {
    padding: 24,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  confirmButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
