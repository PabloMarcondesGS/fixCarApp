import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Modal, TextInput, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'react-native';

// Storage Key
const STORAGE_KEY = '@meu-app-expo:veiculos_v2';

interface Vehicle {
  id: string;
  plate: string;
  model: string;
  color: string;
  type: 'Carro' | 'Moto';
  imageUri?: string;
}

export default function VeiculosScreen() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const router = useRouter();
  
  // Form State
  const [model, setModel] = useState('');
  const [plate, setPlate] = useState('');
  const [color, setColor] = useState('');
  const [type, setType] = useState<'Carro' | 'Moto'>('Carro');
  const [imageUri, setImageUri] = useState<string | null>(null);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setVehicles(JSON.parse(stored));
      } else {
        setVehicles([]);
      }
    } catch (e) {
      console.error('Failed to load vehicles', e);
    }
  };

  const saveVehicles = async (newVehicles: Vehicle[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newVehicles));
    } catch (e) {
      console.error('Failed to save vehicles', e);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleAddVehicle = () => {
    if (!model || !plate || !color) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    const newVehicle: Vehicle = {
      id: Date.now().toString(),
      model,
      plate,
      color,
      type,
      imageUri: imageUri || undefined,
    };

    const updatedList = [...vehicles, newVehicle];
    setVehicles(updatedList);
    saveVehicles(updatedList);
    
    // reset form
    setModel('');
    setPlate('');
    setColor('');
    setType('Carro');
    setImageUri(null);
    setIsModalVisible(false);
  };

  const handleDelete = (item: Vehicle) => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Tem certeza que deseja excluir este veículo?');
      if (confirmed) {
        const updated = vehicles.filter(v => v.id !== item.id);
        setVehicles(updated);
        saveVehicles(updated);
      }
    } else {
      Alert.alert(
        'Excluir Veículo',
        'Tem certeza que deseja excluir este veículo?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Excluir', style: 'destructive', onPress: () => {
            const updated = vehicles.filter(v => v.id !== item.id);
            setVehicles(updated);
            saveVehicles(updated);
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
          <Text style={styles.model}>{item.model}</Text>
          <Text style={styles.plate}>{item.plate}</Text>
          <Text style={styles.color}>{item.color}</Text>
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
                <Text style={styles.label}>Tipo</Text>
                <View style={styles.typeContainer}>
                  <TouchableOpacity 
                    style={[styles.typeButton, type === 'Carro' && styles.typeButtonActive]}
                    onPress={() => setType('Carro')}
                  >
                    <Ionicons name="car" size={20} color={type === 'Carro' ? '#FFF' : '#64748B'} />
                    <Text style={[styles.typeButtonText, type === 'Carro' && styles.typeButtonTextActive]}>Carro</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.typeButton, type === 'Moto' && styles.typeButtonActive]}
                    onPress={() => setType('Moto')}
                  >
                    <Ionicons name="bicycle" size={20} color={type === 'Moto' ? '#FFF' : '#64748B'} />
                    <Text style={[styles.typeButtonText, type === 'Moto' && styles.typeButtonTextActive]}>Moto</Text>
                  </TouchableOpacity>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardClickable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  infoContainer: {
    flex: 1,
  },
  model: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  plate: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4A90E2',
    letterSpacing: 1,
  },
  color: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  vehicleThumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  deleteButton: {
    padding: 8,
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
  },
  imagePickerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  imagePickerButton: {
    width: 120,
    height: 120,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    alignItems: 'center',
  },
  imagePlaceholderText: {
    marginTop: 8,
    fontSize: 12,
    color: '#4A90E2',
    fontWeight: '600',
  },
  removeImageButton: {
    marginTop: 8,
  },
  removeImageText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1E293B',
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  typeButtonActive: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  typeButtonTextActive: {
    color: '#FFF',
  },
  submitButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#64748B',
    fontSize: 16,
  },
});
