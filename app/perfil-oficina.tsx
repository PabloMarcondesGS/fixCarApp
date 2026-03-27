import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { API_ENDPOINTS } from '@/constants/Api';
import { useAuth } from '@/context/AuthContext';

const SPECIALTIES = [
  'Motor', 'Suspensão', 'Freios', 'Pneus', 'Alinhamento',
  'Balanceamento', 'Elétrica', 'Ar condicionado', 'Pintura', 'Funilaria'
];

export default function PerfilOficinaScreen() {
  const router = useRouter();
  const { userInfo } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);

  useEffect(() => {
    console.log('PerfilOficina: userInfo detectado:', userInfo);
    if (userInfo?.workshop_id) {
      console.log('PerfilOficina: Carregando dados para workshop:', userInfo.workshop_id);
      loadWorkshopData();
    } else if (userInfo) {
      console.log('PerfilOficina: userInfo sem workshop_id! Encerrando loading.');
      setLoading(false);
    }
  }, [userInfo?.workshop_id, userInfo]);

  const loadWorkshopData = async () => {
    try {
      const resp = await fetch(`${API_ENDPOINTS.WORKSHOPS}/${userInfo?.workshop_id}`);
      const data = await resp.json();
      if (resp.ok) {
        setName(data.name || '');
        setAddress(data.address || '');
        setCnpj(data.cnpj || '');
        setImageUri(data.imageUri || null);
        setSelectedSpecialties(data.specialties || []);
      }
    } catch (error) {
      console.log('Erro ao carregar dados da oficina:', error);
    } finally {
      setLoading(false);
    }
  };

  const maskCnpj = (value: string) => {
    return value
      .replace(/\D/g, '') // Remove tudo o que não é dígito
      .replace(/^(\d{2})(\d)/, '$1.$2') // Coloca ponto entre o segundo e o terceiro dígitos
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3') // Coloca ponto entre o quinto e o sexto dígitos
      .replace(/\.(\d{3})(\d)/, '.$1/$2') // Coloca uma barra entre o oitavo e o nono dígitos
      .replace(/(\d{4})(\d)/, '$1-$2') // Coloca um hífen depois do bloco de quatro dígitos
      .slice(0, 18); // Limita o tamanho do CNPJ formatado
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setImageUri(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const toggleSpecialty = (item: string) => {
    if (selectedSpecialties.includes(item)) {
      setSelectedSpecialties(selectedSpecialties.filter(s => s !== item));
    } else {
      if (selectedSpecialties.length >= 3) {
        Alert.alert('Limite Atingido', 'Você pode selecionar no máximo 3 especialidades.');
        return;
      }
      setSelectedSpecialties([...selectedSpecialties, item]);
    }
  };

  const handleSave = async () => {
    if (!name || !address || !cnpj || selectedSpecialties.length === 0) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios e selecione ao menos uma especialidade.');
      return;
    }

    setSaving(true);
    try {
      const resp = await fetch(`${API_ENDPOINTS.WORKSHOPS}/${userInfo?.workshop_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          address,
          cnpj,
          imageUri,
          specialties: selectedSpecialties
        }),
      });

      if (resp.ok) {
        Alert.alert('Sucesso', 'Perfil da oficina atualizado com êxito! Voltando para a Home.');
        router.replace('/(tabs)');
      } else {
        Alert.alert('Erro', 'Não foi possível salvar os dados. Tente novamente.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Conexão falhou.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF8F00" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Configurar Oficina</Text>
      </View>

      <ScrollView style={styles.content}>
        <TouchableOpacity style={styles.imageSection} onPress={pickImage}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="camera-outline" size={40} color="#94A3B8" />
              <Text style={styles.imageText}>Adicionar Foto da Fachada</Text>
            </View>
          )}
          <View style={styles.editIconBadge}>
            <Ionicons name="pencil" size={14} color="#FFF" />
          </View>
        </TouchableOpacity>

        <View style={styles.form}>
          <Text style={styles.label}>Nome da Oficina</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Oficina do Jão"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Endereço Completo</Text>
          <TextInput
            style={styles.input}
            placeholder="Rua, Número, Bairro, Cidade - UF"
            value={address}
            onChangeText={setAddress}
          />

          <Text style={styles.label}>CNPJ</Text>
          <TextInput
            style={styles.input}
            placeholder="00.000.000/0000-00"
            value={cnpj}
            onChangeText={(text) => setCnpj(maskCnpj(text))}
            keyboardType="numeric"
            maxLength={18}
          />

          <Text style={styles.label}>Especialidades (Máximo 3)</Text>
          <View style={styles.specialtiesGrid}>
            {SPECIALTIES.map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.specialtyCard,
                  selectedSpecialties.includes(item) && styles.specialtyCardSelected
                ]}
                onPress={() => toggleSpecialty(item)}
              >
                <Text style={[
                  styles.specialtyText,
                  selectedSpecialties.includes(item) && styles.specialtyTextSelected
                ]}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity 
            style={[styles.saveButton, saving && { opacity: 0.7 }]} 
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.saveButtonText}>Salvar Alterações</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
  },
  content: {
    flex: 1,
  },
  imageSection: {
    width: '100%',
    height: 200,
    backgroundColor: '#F1F5F9',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageText: {
    marginTop: 10,
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
  editIconBadge: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: '#FF8F00',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  form: {
    padding: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    color: '#1F2937',
  },
  specialtiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
    marginBottom: 24,
  },
  specialtyCard: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  specialtyCardSelected: {
    backgroundColor: '#FFF8E1',
    borderColor: '#FFB300',
  },
  specialtyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  specialtyTextSelected: {
    color: '#FF8F00',
  },
  saveButton: {
    backgroundColor: '#FF8F00',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
    elevation: 4,
    shadowColor: '#FF8F00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
