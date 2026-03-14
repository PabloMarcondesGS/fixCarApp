import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput, Linking, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';

interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

interface Workshop {
  id: string;
  name: string;
  rating: number;
  reviews: number;
  address: string;
  specialties: string[];
  phone: string;
  location: { lat: number; lng: number };
  description: string;
  reviews_list: Review[];
}

const MOCK_WORKSHOPS: Workshop[] = [
  {
    id: '1',
    name: 'Oficina do Jão',
    rating: 4.8,
    reviews: 124,
    address: 'Av. Paulista, 1000 - São Paulo, SP',
    specialties: ['Motor', 'Suspensão', 'Freios'],
    phone: '11999999999',
    location: { lat: -23.561, lng: -46.655 },
    description: 'Especializada em mecânica pesada e diagnósticos complexos. Mais de 20 anos de experiência no mercado.',
    reviews_list: [
      { id: 'r1', userName: 'Carlos Silva', rating: 5, comment: 'Ótimo atendimento e preço justo.', date: '10/03/2026' },
      { id: 'r2', userName: 'Ana Oliveira', rating: 4, comment: 'Serviço de qualidade, mas demorou um pouco.', date: '05/03/2026' }
    ]
  },
  {
    id: '2',
    name: 'Pneus Express',
    rating: 4.5,
    reviews: 89,
    address: 'Rua das Flores, 450 - São Paulo, SP',
    specialties: ['Pneus', 'Alinhamento', 'Balanceamento'],
    phone: '11888888888',
    location: { lat: -23.570, lng: -46.640 },
    description: 'Foco total em pneus e geometria veicular. Equipamentos de última geração para alinhamento 3D.',
    reviews_list: [
      { id: 'r3', userName: 'Pedro Santos', rating: 5, comment: 'Rápido e eficiente.', date: '12/03/2026' }
    ]
  },
  {
    id: '3',
    name: 'Elétrica Voltagem',
    rating: 4.9,
    reviews: 56,
    address: 'Av. Brasil, 2500 - São Paulo, SP',
    specialties: ['Elétrica', 'Baterias', 'Injeção'],
    phone: '11777777777',
    location: { lat: -23.550, lng: -46.670 },
    description: 'Especialistas em sistemas elétricos modernos e injeção eletrônica. Diagnóstico por scanner.',
    reviews_list: [
      { id: 'r4', userName: 'Marcos Souza', rating: 5, comment: 'Resolveram o problema que ninguém achava.', date: '01/03/2026' }
    ]
  },
  {
    id: '4',
    name: 'Centro Automotivo Estrela',
    rating: 4.7,
    reviews: 210,
    address: 'Al. Santos, 120 - São Paulo, SP',
    specialties: ['Revisão Geral', 'Troca de Óleo', 'Ar Condicionado'],
    phone: '11666666666',
    location: { lat: -23.565, lng: -46.650 },
    description: 'Centro completo para revisão preventiva e corretiva. Higienização de ar condicionado certificada.',
    reviews_list: [
      { id: 'r5', userName: 'Julia Lima', rating: 4, comment: 'Muito atenciosos.', date: '15/02/2026' }
    ]
  }
];

export default function OficinasScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [workshops, setWorkshops] = useState(MOCK_WORKSHOPS);
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    const filtered = MOCK_WORKSHOPS.filter(w => 
      w.name.toLowerCase().includes(text.toLowerCase()) || 
      w.specialties.some(s => s.toLowerCase().includes(text.toLowerCase()))
    );
    setWorkshops(filtered);
  };

  const openDetails = (workshop: Workshop) => {
    setSelectedWorkshop(workshop);
    setModalVisible(true);
  };

  const handleSchedule = (workshop: Workshop) => {
    setModalVisible(false);
    router.push({
      pathname: '/agendamento',
      params: { 
        workshopId: workshop.id, 
        workshopName: workshop.name,
        workshopAddress: workshop.address
      }
    });
  };

  const renderStars = (rating: number, reviewCount: number) => {
    return (
      <View style={styles.ratingContainer}>
        <Ionicons name="star" size={16} color="#FFB000" />
        <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
        <Text style={styles.reviewsText}>({reviewCount})</Text>
      </View>
    );
  };

  const renderItem = ({ item }: { item: Workshop }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => openDetails(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.titleGroup}>
          <Text style={styles.workshopName}>{item.name}</Text>
          {renderStars(item.rating, item.reviews)}
        </View>
        <TouchableOpacity style={styles.favButton}>
          <Ionicons name="heart-outline" size={24} color="#64748B" />
        </TouchableOpacity>
      </View>

      <View style={styles.addressRow}>
        <Ionicons name="location-outline" size={16} color="#64748B" />
        <Text style={styles.addressText}>{item.address}</Text>
      </View>

      <View style={styles.specialtiesContainer}>
        {item.specialties.map((s, index) => (
          <View key={index} style={styles.specialtyBadge}>
            <Text style={styles.specialtyText}>{s}</Text>
          </View>
        ))}
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity 
          style={styles.callButton}
          onPress={() => handleSchedule(item)}
        >
          <Ionicons name="calendar-outline" size={18} color="#FFF" />
          <Text style={styles.callButtonText}>Agendar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.mapButton}>
          <Ionicons name="map-outline" size={18} color="#4A90E2" />
          <Text style={styles.mapButtonText}>Ver no Mapa</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Oficinas Parceiras' }} />
      
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#94A3B8" style={styles.searchIcon} />
          <TextInput
            placeholder="Buscar por nome ou especialidade..."
            style={styles.input}
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
      </View>

      <FlatList
        data={workshops}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={64} color="#CBD5E1" />
            <Text style={styles.emptyText}>Nenhuma oficina encontrada.</Text>
          </View>
        }
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalhes da Oficina</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#1E293B" />
              </TouchableOpacity>
            </View>

            {selectedWorkshop && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.detailName}>{selectedWorkshop.name}</Text>
                {renderStars(selectedWorkshop.rating, selectedWorkshop.reviews)}
                
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Sobre</Text>
                  <Text style={styles.descriptionText}>{selectedWorkshop.description}</Text>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Especialidades</Text>
                  <View style={styles.specialtiesContainer}>
                    {selectedWorkshop.specialties.map((s, index) => (
                      <View key={index} style={styles.specialtyBadge}>
                        <Text style={styles.specialtyText}>{s}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Avaliações</Text>
                  {selectedWorkshop.reviews_list.map((review) => (
                    <View key={review.id} style={styles.reviewCard}>
                      <View style={styles.reviewHeader}>
                        <Text style={styles.reviewUser}>{review.userName}</Text>
                        <Text style={styles.reviewDate}>{review.date}</Text>
                      </View>
                      <View style={styles.reviewStars}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Ionicons 
                            key={star} 
                            name={star <= review.rating ? "star" : "star-outline"} 
                            size={14} 
                            color="#FFB000" 
                          />
                        ))}
                      </View>
                      <Text style={styles.reviewComment}>{review.comment}</Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            )}

            <TouchableOpacity 
              style={styles.mainActionButton}
              onPress={() => selectedWorkshop && handleSchedule(selectedWorkshop)}
            >
              <Text style={styles.mainActionButtonText}>Agendar Agora</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  searchContainer: {
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 50,
  },
  searchIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1E293B',
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleGroup: {
    flex: 1,
  },
  workshopName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginLeft: 4,
  },
  reviewsText: {
    fontSize: 13,
    color: '#64748B',
    marginLeft: 4,
  },
  favButton: {
    padding: 4,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  addressText: {
    fontSize: 13,
    color: '#64748B',
    marginLeft: 8,
    flex: 1,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  specialtyBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  specialtyText: {
    fontSize: 11,
    color: '#4A90E2',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  callButton: {
    flex: 1,
    backgroundColor: '#4A90E2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  callButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  mapButton: {
    flex: 1,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  mapButtonText: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#94A3B8',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  closeButton: {
    padding: 4,
  },
  detailName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 8,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 22,
  },
  reviewCard: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  reviewUser: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  reviewDate: {
    fontSize: 12,
    color: '#94A3B8',
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 8,
  },
  reviewComment: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  mainActionButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  mainActionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
