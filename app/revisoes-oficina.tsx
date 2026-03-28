import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { API_ENDPOINTS } from '@/constants/Api';
import { useAuth } from '@/context/AuthContext';

interface Appointment {
  id: string;
  workshop_id: string;
  vehicle_id: string;
  date: string;
  time: string;
  service: string;
  status: string;
  user_id?: string;
  // Esses campos podem não vir direto da tabela se não fizermos JOIN, 
  // mas o Dashboard.tsx parece usar campos planos. 
  // Ajustaremos conforme o backend.
  model?: string;
  plate?: string;
}

export default function RevisoesOficinaScreen() {
  const { userInfo } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchAppointments();
    }, [userInfo?.workshop_id])
  );

  const fetchAppointments = async () => {
    if (!userInfo?.workshop_id) return;
    
    setLoading(true);
    try {
      const resp = await fetch(`${API_ENDPOINTS.APPOINTMENTS}?workshopId=${userInfo.workshop_id}`);
      const data = await resp.json();
      
      // Ordena por data (mais recentes primeiro)
      const sorted = data.sort((a: any, b: any) => {
        const dateA = new Date(a.date.split('/').reverse().join('-') + 'T' + a.time);
        const dateB = new Date(b.date.split('/').reverse().join('-') + 'T' + b.time);
        return dateB.getTime() - dateA.getTime();
      });
      
      setAppointments(sorted);
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pendente': return '#F59E0B';
      case 'confirmado': return '#10B981';
      case 'cancelado': return '#EF4444';
      default: return '#64748B';
    }
  };

  const formatString = (val: any) => {
    if (Array.isArray(val)) return val[0] || '';
    return String(val || '');
  };

  const renderItem = ({ item }: { item: Appointment }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.serviceBadge}>
          <Text style={styles.serviceText}>{formatString(item.service) || 'Geral'}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Ionicons name="car-outline" size={20} color="#64748B" />
          <Text style={styles.vehicleInfo}>
            {formatString(item.model) || 'Veículo'} - {formatString(item.plate) || 'S/P'}
          </Text>
        </View>
        
        <View style={styles.dateTimeRow}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={18} color="#FF8F00" />
            <Text style={styles.dateTimeText}>{item.date}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={18} color="#FF8F00" />
            <Text style={styles.dateTimeText}>{item.time}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.detailsButton} 
        onPress={() => router.push({ pathname: '/detalhes-revisao-oficina', params: { id: item.id } })}
      >
        <Text style={styles.detailsButtonText}>Detallar o que foi feito</Text>
        <Ionicons name="create-outline" size={16} color="#FF8F00" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Listagem de Revisões' }} />
      
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FF8F00" />
          <Text style={styles.loadingText}>Carregando agendamentos...</Text>
        </View>
      ) : (
        <FlatList
          data={appointments}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="calendar-outline" size={64} color="#CBD5E1" />
              <Text style={styles.emptyText}>Nenhuma revisão agendada ainda.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  list: {
    padding: 20,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  serviceText: {
    color: '#FF8F00',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cardBody: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 4,
  },
  vehicleInfo: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 8,
  },
  dateTimeText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '600',
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 4,
  },
  detailsButtonText: {
    color: '#FF8F00',
    fontSize: 14,
    fontWeight: '700',
  },
  loadingText: {
    marginTop: 12,
    color: '#64748B',
    fontSize: 16,
  },
  emptyText: {
    marginTop: 16,
    color: '#94A3B8',
    fontSize: 16,
    textAlign: 'center',
  },
});
