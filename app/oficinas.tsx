import React, { useState, useEffect } from 'react';
import { Text, View, FlatList, TouchableOpacity, TextInput, Linking, Modal, ScrollView, ActivityIndicator } from 'react-native';
import styles from './oficinas.styles';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { API_ENDPOINTS } from '@/constants/Api';

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

// O MOCK_WORKSHOPS foi movido para o backend

export default function OficinasScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [fullWorkshops, setFullWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchWorkshops();
  }, []);

  const fetchWorkshops = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.WORKSHOPS);
      const data = await response.json();
      setWorkshops(data);
      setFullWorkshops(data);
    } catch (error) {
      console.error('Erro ao buscar oficinas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    const filtered = fullWorkshops.filter(w => 
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

  const handleOpenMap = (address: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    Linking.openURL(url);
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
        <TouchableOpacity 
          style={styles.mapButton}
          onPress={() => handleOpenMap(item.address)}
        >
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

      {loading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.emptyText}>Carregando oficinas...</Text>
        </View>
      ) : (
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
      )}

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
