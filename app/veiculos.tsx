import React, { useState, useEffect } from 'react';
import { Text, View, FlatList, TouchableOpacity, Modal, TextInput, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import styles from '@/styles/veiculos.styles';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Image, ActivityIndicator } from 'react-native';
import { API_ENDPOINTS } from '@/constants/Api';
import { useAuth } from '@/context/AuthContext';

// Storage Key
const STORAGE_KEY = '@meu-app-expo:veiculos_v2';

interface Plan {
  id: string;
  name: string;
  price: number;
  description: string;
}

interface Vehicle {
  id: string;
  plate: string;
  model: string;
  color: string;
  type: 'Carro' | 'Moto';
  imageUri?: string;
  plan?: string;
  subscription_status?: string;
}

export default function VeiculosScreen() {
  const { userInfo } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const router = useRouter();
  
  // Form State
  const [model, setModel] = useState('');
  const [plate, setPlate] = useState('');
  const [color, setColor] = useState('');
  const [type, setType] = useState<'Carro' | 'Moto'>('Carro');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [plan, setPlan] = useState<'Free' | 'Basic' | 'Premium'>('Free');

  useEffect(() => {
    loadVehicles();
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.PLANS);
      const data = await response.json();
      setPlans(data);
    } catch (error) {
      console.error('Erro ao buscar planos:', error);
    }
  };

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const url = userInfo?.id ? `${API_ENDPOINTS.VEHICLES}?userId=${userInfo.id}` : API_ENDPOINTS.VEHICLES;
      const response = await fetch(url);
      const data = await response.json();
      setVehicles(data);
    } catch (e) {
      console.error('Failed to load vehicles from API', e);
    } finally {
      setLoading(false);
    }
  };

  // saveVehicles locally is no longer needed as we use the API

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5, // Reduzindo um pouco para economizar espaço no DB
      base64: true,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      if (asset.base64) {
        setImageUri(`data:image/jpeg;base64,${asset.base64}`);
      } else {
        setImageUri(asset.uri);
      }
    }
  };

  const handleAddVehicle = async () => {
    if (!model || !plate || !color) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    const vehicleData = {
      model,
      plate,
      color,
      type,
      imageUri: imageUri || undefined,
      plan,
      user_id: userInfo?.id,
    };

    try {
      const response = await fetch(API_ENDPOINTS.VEHICLES, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vehicleData),
      });

      if (response.ok) {
        const newVehicle = await response.json();
        setVehicles([...vehicles, newVehicle]);
        
        // reset form
        setModel('');
        setPlate('');
        setColor('');
        setType('Carro');
        setImageUri(null);
        setPlan('Free');
        setIsModalVisible(false);
      } else {
        Alert.alert('Erro', 'Não foi possível cadastrar o veículo no servidor.');
      }
    } catch (error) {
      console.error('Erro ao cadastrar veículo:', error);
      Alert.alert('Erro', 'Falha na conexão com o servidor.');
    }
  };

  const handleDelete = (item: Vehicle) => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Tem certeza que deseja excluir este veículo?');
      if (confirmed) {
        const performDelete = async () => {
          try {
            const response = await fetch(`${API_ENDPOINTS.VEHICLES}/${item.id}`, {
              method: 'DELETE',
            });
            if (response.ok) {
              setVehicles(vehicles.filter(v => v.id !== item.id));
            } else {
              alert('Erro ao excluir veículo no servidor.');
            }
          } catch (error) {
            console.error('Erro ao excluir veículo:', error);
            alert('Falha na conexão com o servidor.');
          }
        };
        performDelete();
      }
    } else {
      Alert.alert(
        'Excluir Veículo',
        'Tem certeza que deseja excluir este veículo?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Excluir', style: 'destructive', onPress: async () => {
            try {
              const response = await fetch(`${API_ENDPOINTS.VEHICLES}/${item.id}`, {
                method: 'DELETE',
              });
              if (response.ok) {
                setVehicles(vehicles.filter(v => v.id !== item.id));
              } else {
                Alert.alert('Erro', 'Não foi possível excluir o veículo no servidor.');
              }
            } catch (error) {
              console.error('Erro ao excluir veículo:', error);
              Alert.alert('Erro', 'Falha na conexão com o servidor.');
            }
          }},
        ]
      );
    }
  };

  const renderItem = ({ item }: { item: Vehicle }) => (
    <View style={styles.card}>
      <TouchableOpacity 
        style={styles.cardClickable} 
        onPress={() => router.push({
          pathname: '/detalhes-veiculo',
          params: { ...item }
        })}
      >
        <View style={styles.iconContainer}>
          {item.imageUri ? (
            <Image source={{ uri: item.imageUri }} style={styles.vehicleThumbnail} />
          ) : (
            <Ionicons 
              name={item.type === 'Carro' ? 'car' : 'bicycle'} 
              size={32} 
              color="#4A90E2" 
            />
          )}
        </View>
        <View style={styles.infoContainer}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.model}>{item.model}</Text>
            {item.plan && (
              <View style={[styles.planBadge, item.plan === 'Premium' ? styles.premiumBadge : styles.freeBadge]}>
                <Text style={styles.planBadgeText}>{item.plan}</Text>
              </View>
            )}
          </View>
          <Text style={styles.plate}>Placa: {item.plate}</Text>
          <Text style={styles.color}>Cor: {item.color}</Text>
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => handleDelete(item)}
      >
        <Ionicons name="trash-outline" size={20} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Meus Veículos' }} />
      
      {loading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.emptyText}>Carregando veículos...</Text>
        </View>
      ) : (
        <FlatList
          data={vehicles}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <Text style={styles.headerTitle}>Veículos Cadastrados</Text>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhum veículo cadastrado.</Text>
            </View>
          }
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => setIsModalVisible(true)}
      >
        <Ionicons name="add" size={30} color="#FFF" />
      </TouchableOpacity>

      {/* Registration Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Novo Veículo</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <View style={styles.imagePickerContainer}>
                <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
                  {imageUri ? (
                    <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Ionicons name="camera-outline" size={32} color="#4A90E2" />
                      <Text style={styles.imagePlaceholderText}>Adicionar Foto</Text>
                    </View>
                  )}
                </TouchableOpacity>
                {imageUri && (
                  <TouchableOpacity style={styles.removeImageButton} onPress={() => setImageUri(null)}>
                    <Text style={styles.removeImageText}>Remover Foto</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Modelo</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Digite o modelo"
                  value={model}
                  onChangeText={setModel}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Placa</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Digite a placa"
                  value={plate}
                  onChangeText={setPlate}
                  autoCapitalize="characters"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Cor</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Digite a cor"
                  value={color}
                  onChangeText={setColor}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Plano</Text>
                <View style={[styles.planContainer, { flexDirection: 'column' }]}>
                  {plans.map((p) => (
                    <TouchableOpacity 
                      key={p.id}
                      style={[styles.planOption, plan === p.id && styles.planOptionActive, { marginBottom: 8 }]}
                      onPress={() => setPlan(p.id as any)}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        <Ionicons 
                          name={p.id === 'Free' ? 'leaf-outline' : p.id === 'Basic' ? 'shield-outline' : 'ribbon-outline'} 
                          size={20} 
                          color={plan === p.id ? '#FFF' : '#4A90E2'} 
                        />
                        <View style={{ marginLeft: 12 }}>
                          <Text style={[styles.planOptionText, plan === p.id && styles.planOptionTextActive, { fontSize: 16 }]}>
                            {p.name}
                          </Text>
                          <Text style={[styles.planPriceText, plan === p.id && styles.planPriceTextActive]}>
                            {p.price === 0 ? 'Grátis' : `R$ ${p.price.toFixed(2)}/mês`}
                          </Text>
                        </View>
                      </View>
                      {plan === p.id && <Ionicons name="checkmark-circle" size={24} color="#FFF" />}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity style={styles.submitButton} onPress={handleAddVehicle}>
                <Text style={styles.submitButtonText}>Cadastrar Veículo</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
