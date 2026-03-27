import React, { useState, useEffect } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Image, Modal, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import styles from '@/styles/detalhes-veiculo.styles';
import { API_ENDPOINTS } from '@/constants/Api';

interface Maintenance {
  id: string;
  date: string;
  service: string;
  status: string;
  cost?: number;
  details?: string;
  workshop_name?: string;
  parts_images?: string; // JSON string
}

export default function DetalhesVeiculoScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [selectedMaintenance, setSelectedMaintenance] = useState<Maintenance | null>(null);
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState(true);

  // Parse params
  const { id, model, plate, color, type, imageUri } = params;

  useEffect(() => {
    fetchMaintenanceHistory();
  }, [id]);

  const fetchMaintenanceHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_ENDPOINTS.APPOINTMENTS}?vehicleId=${id}`);
      const data = await response.json();
      
      // Filtras apenas as concluídas (ou todas, se preferir histórico completo)
      // O usuário pediu: "quando a oficina concluir a revisao ela deve aparecer na listagem"
      const completed = data.filter((item: Maintenance) => item.status === 'Concluído');
      setMaintenances(completed);
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
    } finally {
      setLoading(false);
    }
  };

  const getServiceIcon = (service: string): keyof typeof Ionicons.glyphMap => {
    const s = service.toLowerCase();
    if (s.includes('óleo')) return 'oil-drop' as any; // Fallback if not in normal glyphs
    if (s.includes('pneu')) return 'construct';
    if (s.includes('revisão')) return 'build';
    return 'settings';
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Detalhes do Veículo',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#4A90E2" />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            {imageUri ? (
              <Image source={{ uri: String(imageUri) }} style={styles.headerImage} />
            ) : (
              <Ionicons 
                name={type === 'Carro' ? 'car' : 'bicycle'} 
                size={64} 
                color="#4A90E2" 
              />
            )}
          </View>
          <Text style={styles.modelTitle}>{model}</Text>
          <View style={styles.plateBadge}>
            <Text style={styles.plateText}>{String(plate).toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Text style={styles.label}>ID do Registro</Text>
            <Text style={styles.value}>{id}</Text>
          </View>
          
          <View style={styles.separator} />

          <View style={styles.detailItem}>
            <Text style={styles.label}>Modelo / Marca</Text>
            <Text style={styles.value}>{model}</Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.detailItem}>
            <Text style={styles.label}>Placa</Text>
            <Text style={styles.value}>{plate}</Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.detailItem}>
            <Text style={styles.label}>Cor</Text>
            <Text style={styles.value}>{color}</Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.detailItem}>
            <Text style={styles.label}>Tipo de Veículo</Text>
            <Text style={styles.value}>{type}</Text>
          </View>
        </View>

        {/* SECTION: ÚLTIMAS MANUTENÇÕES */}
        <View style={styles.maintenanceSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Histórico de Revisões</Text>
            <TouchableOpacity onPress={fetchMaintenanceHistory}>
              <Ionicons name="refresh" size={18} color="#4A90E2" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#4A90E2" style={{ marginVertical: 20 }} />
          ) : maintenances.length > 0 ? (
            maintenances.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.maintenanceCard}
                onPress={() => setSelectedMaintenance(item)}
              >
                <View style={styles.mIconContainer}>
                  <Ionicons name={getServiceIcon(item.service)} size={20} color="#4A90E2" />
                </View>
                <View style={styles.mInfo}>
                  <Text style={styles.mDescription}>{item.service}</Text>
                  <Text style={styles.mDate}>{item.date}</Text>
                </View>
                <Text style={styles.mValue}>
                  {item.cost ? `R$ ${parseFloat(String(item.cost)).toFixed(2)}` : 'Concluído'}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyMaintenance}>
              <Text style={styles.emptyMaintenanceText}>Nenhuma manutenção registrada.</Text>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.editButton} onPress={() => alert('Funcionalidade de edição em breve!')}>
          <Ionicons name="create-outline" size={20} color="#FFF" />
          <Text style={styles.editButtonText}>Editar Veículo</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* MODAL: DETALHES DA MANUTENÇÃO */}
      <Modal
        visible={selectedMaintenance !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedMaintenance(null)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setSelectedMaintenance(null)}
        >
          <View style={styles.modalContent}>
            {selectedMaintenance && (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.modalIconContainer}>
                    <Ionicons name={getServiceIcon(selectedMaintenance.service)} size={32} color="#4A90E2" />
                  </View>
                  <TouchableOpacity onPress={() => setSelectedMaintenance(null)} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color="#64748B" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.modalTitle}>{selectedMaintenance.service}</Text>
                <Text style={styles.modalValue}>
                  {selectedMaintenance.cost ? `R$ ${parseFloat(String(selectedMaintenance.cost)).toFixed(2)}` : 'Concluído'}
                </Text>

                <View style={styles.modalGrid}>
                  <View style={styles.modalGridItem}>
                    <Text style={styles.modalLabel}>Data</Text>
                    <Text style={styles.modalValueSmall}>{selectedMaintenance.date}</Text>
                  </View>
                  <View style={styles.modalGridItem}>
                    <Text style={styles.modalLabel}>Oficina</Text>
                    <Text style={styles.modalValueSmall}>{selectedMaintenance.workshop_name || 'FixCar Workshop'}</Text>
                  </View>
                </View>

                {selectedMaintenance.details && (
                  <View style={styles.notesSection}>
                    <Text style={styles.modalLabel}>O que foi feito</Text>
                    <View style={styles.notesContainer}>
                      <Text style={styles.notesText}>{selectedMaintenance.details}</Text>
                    </View>
                  </View>
                )}

                {selectedMaintenance.parts_images && (
                  <View style={{ marginBottom: 20 }}>
                    <Text style={styles.modalLabel}>Fotos das peças trocadas</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                      {JSON.parse(selectedMaintenance.parts_images).map((img: string, idx: number) => (
                        <Image 
                          key={idx} 
                          source={{ uri: img }} 
                          style={{ width: 100, height: 100, borderRadius: 12, marginRight: 12 }} 
                        />
                      ))}
                    </ScrollView>
                  </View>
                )}

                <TouchableOpacity 
                  style={styles.confirmButton} 
                  onPress={() => setSelectedMaintenance(null)}
                >
                  <Text style={styles.confirmButtonText}>Fechar Detalhes</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
