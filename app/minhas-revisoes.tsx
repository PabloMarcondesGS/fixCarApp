import React, { useState, useCallback } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  Modal, 
  ScrollView, 
  Image, 
  Linking 
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { API_ENDPOINTS, apiFetch } from '@/constants/Api';
import { useAuth } from '@/context/AuthContext';

interface AppointmentClient {
  id: string;
  workshop_id: string;
  workshop_name?: string;
  workshop_address?: string;
  vehicle_id: string;
  model?: string;
  plate?: string;
  brand?: string;
  date: string;
  time: string;
  service: string;
  status: string;
  details?: string;
  cost?: number;
  preliminary_cost?: number;
  parts_images?: string;
  observations?: string;
  observation_media?: string;
}

export default function MinhasRevisoesScreen() {
  const { userInfo, accessToken } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState<AppointmentClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentClient | null>(null);
  const [filter, setFilter] = useState<'todos' | 'agendados' | 'concluidos'>('todos');

  useFocusEffect(
    useCallback(() => {
      fetchAppointments();
    }, [userInfo?.id])
  );

  const fetchAppointments = async () => {
    if (!userInfo?.id) return;
    setLoading(true);
    try {
      const resp = await apiFetch(`${API_ENDPOINTS.APPOINTMENTS}?userId=${userInfo.id}`, accessToken);
      const data = await resp.json();
      
      const sorted = (Array.isArray(data) ? data : []).sort((a: any, b: any) => {
        const da = new Date(a.date.split('/').reverse().join('-') + 'T' + (a.time || '00:00'));
        const db = new Date(b.date.split('/').reverse().join('-') + 'T' + (b.time || '00:00'));
        return db.getTime() - da.getTime();
      });

      setAppointments(sorted);
    } catch (error) {
      console.error('Erro ao buscar revisões do usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pendente':
        return { label: 'Pendente', color: '#F59E0B', bg: '#FEF3C7', icon: 'time-outline' as const };
      case 'em análise':
      case 'em analise':
        return { label: 'Em Análise', color: '#8B5CF6', bg: '#EDE9FE', icon: 'search-outline' as const };
      case 'confirmado':
        return { label: 'Confirmado', color: '#10B981', bg: '#D1FAE5', icon: 'checkmark-circle-outline' as const };
      case 'concluído':
      case 'concluido':
        return { label: 'Concluído', color: '#3B82F6', bg: '#DBEAFE', icon: 'checkmark-done-circle-outline' as const };
      case 'cancelado':
        return { label: 'Cancelado', color: '#EF4444', bg: '#FEE2E2', icon: 'close-circle-outline' as const };
      default:
        return { label: status || 'Agendado', color: '#64748B', bg: '#F1F5F9', icon: 'calendar-outline' as const };
    }
  };

  const formatCurrency = (val?: number) => {
    if (val === undefined || val === null) return null;
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const filteredAppointments = appointments.filter(item => {
    const isConcluded = item.status?.toLowerCase() === 'concluído' || item.status?.toLowerCase() === 'concluido';
    if (filter === 'agendados') return !isConcluded && item.status?.toLowerCase() !== 'cancelado';
    if (filter === 'concluidos') return isConcluded;
    return true;
  });

  const openMaps = (address?: string) => {
    if (!address) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    Linking.openURL(url);
  };

  const renderItem = ({ item }: { item: AppointmentClient }) => {
    const statusInfo = getStatusInfo(item.status);

    return (
      <TouchableOpacity 
        style={styles.card} 
        activeOpacity={0.85}
        onPress={() => setSelectedAppointment(item)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.serviceContainer}>
            <Ionicons name="construct-outline" size={18} color="#FF8F00" />
            <Text style={styles.serviceTitle}>{item.service || 'Revisão Geral'}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
            <Ionicons name={statusInfo.icon} size={13} color={statusInfo.color} style={{ marginRight: 4 }} />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
          </View>
        </View>

        <View style={styles.workshopRow}>
          <Ionicons name="business-outline" size={16} color="#64748B" />
          <Text style={styles.workshopName} numberOfLines={1}>
            {item.workshop_name || 'Oficina AutoCare'}
          </Text>
        </View>

        <View style={styles.vehicleRow}>
          <Ionicons name="car-outline" size={16} color="#64748B" />
          <Text style={styles.vehicleText}>
            {item.model || 'Veículo'} • <Text style={styles.plateText}>{item.plate?.toUpperCase() || 'S/P'}</Text>
          </Text>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.cardFooter}>
          <View style={styles.dateTimeBadge}>
            <Ionicons name="calendar-outline" size={15} color="#FF8F00" />
            <Text style={styles.dateTimeText}>{item.date}</Text>
            <Ionicons name="time-outline" size={15} color="#FF8F00" style={{ marginLeft: 6 }} />
            <Text style={styles.dateTimeText}>{item.time}</Text>
          </View>

          {item.cost ? (
            <Text style={styles.costText}>{formatCurrency(item.cost)}</Text>
          ) : item.preliminary_cost ? (
            <Text style={styles.preliminaryCostText}>{formatCurrency(item.preliminary_cost)} (Est.)</Text>
          ) : (
            <View style={styles.detailsAction}>
              <Text style={styles.detailsActionText}>Ver detalhes</Text>
              <Ionicons name="chevron-forward" size={14} color="#FF8F00" />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Minhas Revisões' }} />

      {/* Tabs de Filtro */}
      <View style={styles.filterTabs}>
        <TouchableOpacity 
          style={[styles.filterTab, filter === 'todos' && styles.filterTabActive]}
          onPress={() => setFilter('todos')}
        >
          <Text style={[styles.filterTabText, filter === 'todos' && styles.filterTabTextActive]}>
            Todas ({appointments.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.filterTab, filter === 'agendados' && styles.filterTabActive]}
          onPress={() => setFilter('agendados')}
        >
          <Text style={[styles.filterTabText, filter === 'agendados' && styles.filterTabTextActive]}>
            Em Andamento
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.filterTab, filter === 'concluidos' && styles.filterTabActive]}
          onPress={() => setFilter('concluidos')}
        >
          <Text style={[styles.filterTabText, filter === 'concluidos' && styles.filterTabTextActive]}>
            Concluídas
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FF8F00" />
          <Text style={styles.loadingText}>Carregando suas revisões...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredAppointments}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={72} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>Nenhuma revisão encontrada</Text>
              <Text style={styles.emptySubtitle}>
                {filter === 'todos' 
                  ? 'Você ainda não possui revisões agendadas.' 
                  : 'Nenhum agendamento com este filtro.'}
              </Text>
              <TouchableOpacity 
                style={styles.scheduleButton}
                onPress={() => router.push('/agendamento')}
              >
                <Ionicons name="add-circle-outline" size={20} color="#FFF" />
                <Text style={styles.scheduleButtonText}>Agendar Revisão</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* MODAL DETALHES COMPLETO DA REVISÃO */}
      <Modal
        visible={selectedAppointment !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedAppointment(null)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setSelectedAppointment(null)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            {selectedAppointment && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalHeader}>
                  <View style={styles.modalIconBox}>
                    <Ionicons name="construct" size={28} color="#FF8F00" />
                  </View>
                  <TouchableOpacity onPress={() => setSelectedAppointment(null)} style={styles.closeBtn}>
                    <Ionicons name="close" size={24} color="#64748B" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.modalTitle}>{selectedAppointment.service || 'Revisão'}</Text>
                
                {/* Status Badge */}
                {(() => {
                  const s = getStatusInfo(selectedAppointment.status);
                  return (
                    <View style={[styles.statusBadgeLarge, { backgroundColor: s.bg }]}>
                      <Ionicons name={s.icon} size={16} color={s.color} style={{ marginRight: 6 }} />
                      <Text style={[styles.statusTextLarge, { color: s.color }]}>{s.label}</Text>
                    </View>
                  );
                })()}

                {/* Veículo e Oficina */}
                <View style={styles.sectionBox}>
                  <View style={styles.detailRow}>
                    <Ionicons name="business" size={18} color="#FF8F00" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.detailLabel}>Oficina</Text>
                      <Text style={styles.detailValue}>{selectedAppointment.workshop_name || 'Oficina AutoCare'}</Text>
                      {selectedAppointment.workshop_address ? (
                        <TouchableOpacity 
                          onPress={() => openMaps(selectedAppointment.workshop_address)}
                          style={styles.addressLink}
                        >
                          <Ionicons name="location-outline" size={14} color="#3B82F6" />
                          <Text style={styles.addressLinkText} numberOfLines={1}>
                            {selectedAppointment.workshop_address}
                          </Text>
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  </View>

                  <View style={[styles.detailRow, { marginTop: 12 }]}>
                    <Ionicons name="car" size={18} color="#FF8F00" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.detailLabel}>Veículo</Text>
                      <Text style={styles.detailValue}>
                        {selectedAppointment.model} • <Text style={styles.plateText}>{selectedAppointment.plate?.toUpperCase()}</Text>
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.detailRow, { marginTop: 12 }]}>
                    <Ionicons name="calendar" size={18} color="#FF8F00" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.detailLabel}>Agendado para</Text>
                      <Text style={styles.detailValue}>
                        {selectedAppointment.date} às {selectedAppointment.time}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Valores */}
                {(selectedAppointment.cost || selectedAppointment.preliminary_cost) ? (
                  <View style={styles.sectionBox}>
                    <Text style={styles.sectionHeaderTitle}>Valores do Serviço</Text>
                    {selectedAppointment.preliminary_cost ? (
                      <View style={styles.valueRow}>
                        <Text style={styles.valueLabel}>Valor Preliminar / Estimado:</Text>
                        <Text style={[styles.valueAmount, { color: '#8B5CF6' }]}>
                          {formatCurrency(selectedAppointment.preliminary_cost)}
                        </Text>
                      </View>
                    ) : null}
                    {selectedAppointment.cost ? (
                      <View style={[styles.valueRow, { marginTop: 6 }]}>
                        <Text style={styles.valueLabel}>Valor Total Final:</Text>
                        <Text style={[styles.valueAmount, { color: '#10B981', fontSize: 18 }]}>
                          {formatCurrency(selectedAppointment.cost)}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                ) : null}

                {/* O que foi feito */}
                {selectedAppointment.details ? (
                  <View style={styles.sectionBox}>
                    <Text style={styles.sectionHeaderTitle}>O que foi feito</Text>
                    <Text style={styles.sectionBodyText}>{selectedAppointment.details}</Text>
                  </View>
                ) : null}

                {/* Observações da oficina */}
                {selectedAppointment.observations ? (
                  <View style={[styles.sectionBox, { backgroundColor: '#F5F3FF', borderColor: '#E9D5FF' }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                      <Ionicons name="information-circle" size={18} color="#8B5CF6" style={{ marginRight: 6 }} />
                      <Text style={[styles.sectionHeaderTitle, { color: '#6B21A8', marginBottom: 0 }]}>
                        Observações da Oficina
                      </Text>
                    </View>
                    <Text style={[styles.sectionBodyText, { color: '#581C87' }]}>
                      {selectedAppointment.observations}
                    </Text>
                  </View>
                ) : null}

                {/* Fotos e Vídeos de Observação */}
                {selectedAppointment.observation_media ? (
                  (() => {
                    try {
                      const mediaList = JSON.parse(selectedAppointment.observation_media);
                      if (!Array.isArray(mediaList) || mediaList.length === 0) return null;
                      return (
                        <View style={styles.sectionBox}>
                          <Text style={styles.sectionHeaderTitle}>Fotos e Vídeos de Observação</Text>
                          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                            {mediaList.map((m: any, idx: number) => (
                              <View key={idx} style={styles.mediaItem}>
                                {m.type === 'video' ? (
                                  <View style={styles.videoThumbnail}>
                                    <Ionicons name="play-circle" size={32} color="#FFF" />
                                    <Text style={styles.videoTag}>VÍDEO</Text>
                                  </View>
                                ) : (
                                  <Image source={{ uri: m.uri }} style={styles.imageThumbnail} />
                                )}
                              </View>
                            ))}
                          </ScrollView>
                        </View>
                      );
                    } catch {
                      return null;
                    }
                  })()
                ) : null}

                {/* Fotos das peças trocadas */}
                {selectedAppointment.parts_images ? (
                  (() => {
                    try {
                      const parts = JSON.parse(selectedAppointment.parts_images);
                      if (!Array.isArray(parts) || parts.length === 0) return null;
                      return (
                        <View style={styles.sectionBox}>
                          <Text style={styles.sectionHeaderTitle}>Fotos das Peças Trocadas</Text>
                          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                            {parts.map((uri: string, idx: number) => (
                              <Image key={idx} source={{ uri }} style={[styles.imageThumbnail, { marginRight: 10 }]} />
                            ))}
                          </ScrollView>
                        </View>
                      );
                    } catch {
                      return null;
                    }
                  })()
                ) : null}

                <TouchableOpacity 
                  style={styles.modalCloseButton} 
                  onPress={() => setSelectedAppointment(null)}
                >
                  <Text style={styles.modalCloseButtonText}>Fechar</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
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
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  filterTabActive: {
    backgroundColor: '#FF8F00',
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  filterTabTextActive: {
    color: '#FFF',
  },
  list: {
    padding: 16,
    gap: 14,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
  },
  workshopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  workshopName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  vehicleText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  plateText: {
    fontWeight: '800',
    color: '#FF8F00',
    letterSpacing: 0.5,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateTimeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  costText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#10B981',
  },
  preliminaryCostText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#8B5CF6',
  },
  detailsAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  detailsActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF8F00',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#334155',
    marginTop: 16,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  scheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FF8F00',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
  },
  scheduleButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 22,
    width: '100%',
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#FFF8E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtn: {
    padding: 6,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 8,
  },
  statusBadgeLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 16,
  },
  statusTextLarge: {
    fontSize: 13,
    fontWeight: '800',
  },
  sectionBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  sectionHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 8,
  },
  sectionBodyText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 2,
  },
  addressLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  addressLinkText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '600',
  },
  valueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  valueLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  valueAmount: {
    fontSize: 15,
    fontWeight: '800',
  },
  mediaItem: {
    marginRight: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  videoThumbnail: {
    width: 90,
    height: 90,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  videoTag: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
    marginTop: 4,
  },
  imageThumbnail: {
    width: 90,
    height: 90,
    borderRadius: 12,
  },
  modalCloseButton: {
    backgroundColor: '#FF8F00',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  modalCloseButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
