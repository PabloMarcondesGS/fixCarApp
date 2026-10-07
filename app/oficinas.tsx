import React, { useState, useEffect } from 'react';
import { Text, View, FlatList, TouchableOpacity, TextInput, Linking, Modal, ScrollView, ActivityIndicator } from 'react-native';
import styles from '@/styles/oficinas.styles';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { API_ENDPOINTS, apiFetch } from '@/constants/Api';
import { useAuth } from '@/context/AuthContext';

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
  const { accessToken, userInfo } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [fullWorkshops, setFullWorkshops] = useState<Workshop[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const FAVORITES_STORAGE_KEY = userInfo?.id 
    ? `@autocare:fav_workshops_${userInfo.id}` 
    : '@autocare:fav_workshops_default';

  useEffect(() => {
    loadFavorites();
    fetchWorkshops();
  }, [userInfo?.id]);

  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setFavoriteIds(parsed);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
    }
  };

  const applyFilters = (query: string, onlyFavs: boolean, favs: string[], sourceList?: Workshop[]) => {
    const list = sourceList || fullWorkshops;
    let filtered = list;

    if (onlyFavs) {
      filtered = filtered.filter(w => favs.includes(w.id));
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      filtered = filtered.filter(w => 
        w.name.toLowerCase().includes(q) || 
        w.specialties.some(s => s.toLowerCase().includes(q))
      );
    }

    setWorkshops(filtered);
  };

  const fetchWorkshops = async () => {
    try {
      const response = await apiFetch(API_ENDPOINTS.WORKSHOPS, accessToken);
      const data: Workshop[] = await response.json();
      setFullWorkshops(data);
      applyFilters(searchQuery, showFavoritesOnly, favoriteIds, data);
    } catch (error) {
      console.error('Erro ao buscar oficinas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    applyFilters(text, showFavoritesOnly, favoriteIds);
  };

  const handleFilterFavorites = (onlyFavs: boolean) => {
    setShowFavoritesOnly(onlyFavs);
    applyFilters(searchQuery, onlyFavs, favoriteIds);
  };

  const toggleFavorite = async (workshop: Workshop) => {
    try {
      const isFav = favoriteIds.includes(workshop.id);
      let updatedFavs: string[];

      if (isFav) {
        updatedFavs = favoriteIds.filter(id => id !== workshop.id);
        Toast.show({
          type: 'info',
          text1: 'Removido dos Favoritos',
          text2: `${workshop.name} foi removida dos seus favoritos.`,
          position: 'top',
          visibilityTime: 2000,
        });
      } else {
        updatedFavs = [...favoriteIds, workshop.id];
        Toast.show({
          type: 'success',
          text1: 'Favoritado!',
          text2: `${workshop.name} adicionada aos favoritos.`,
          position: 'top',
          visibilityTime: 2000,
        });
      }

      setFavoriteIds(updatedFavs);
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updatedFavs));
      applyFilters(searchQuery, showFavoritesOnly, updatedFavs);
    } catch (error) {
      console.error('Erro ao salvar favoritos:', error);
    }
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

  const renderItem = ({ item }: { item: Workshop }) => {
    const isFavorited = favoriteIds.includes(item.id);

    return (
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
          <TouchableOpacity 
            style={styles.favButton}
            onPress={(e) => {
              e.stopPropagation();
              toggleFavorite(item);
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={isFavorited ? "heart" : "heart-outline"} 
              size={24} 
              color={isFavorited ? "#EF4444" : "#94A3B8"} 
            />
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
            <Ionicons name="map-outline" size={18} color="#FF8F00" />
            <Text style={styles.mapButtonText}>Ver no Mapa</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

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
          {searchQuery ? (
            <TouchableOpacity onPress={() => handleSearch('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterChip, !showFavoritesOnly && styles.filterChipActive]}
            onPress={() => handleFilterFavorites(false)}
          >
            <Text style={[styles.filterChipText, !showFavoritesOnly && styles.filterChipTextActive]}>
              Todas ({fullWorkshops.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, showFavoritesOnly && styles.filterChipActive]}
            onPress={() => handleFilterFavorites(true)}
          >
            <Ionicons 
              name={showFavoritesOnly ? "heart" : "heart-outline"} 
              size={16} 
              color={showFavoritesOnly ? "#FF8F00" : "#64748B"} 
            />
            <Text style={[styles.filterChipText, showFavoritesOnly && styles.filterChipTextActive]}>
              Favoritas ({favoriteIds.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#FF8F00" />
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
              <Ionicons 
                name={showFavoritesOnly ? "heart-dislike-outline" : "search-outline"} 
                size={64} 
                color="#CBD5E1" 
              />
              <Text style={styles.emptyText}>
                {showFavoritesOnly 
                  ? 'Você ainda não favoritou nenhuma oficina.' 
                  : 'Nenhuma oficina encontrada.'}
              </Text>
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
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                {selectedWorkshop && (
                  <TouchableOpacity 
                    onPress={() => toggleFavorite(selectedWorkshop)} 
                    style={styles.favButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons 
                      name={favoriteIds.includes(selectedWorkshop.id) ? "heart" : "heart-outline"} 
                      size={24} 
                      color={favoriteIds.includes(selectedWorkshop.id) ? "#EF4444" : "#64748B"} 
                    />
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="#1E293B" />
                </TouchableOpacity>
              </View>
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
