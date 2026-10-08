import React, { useState, useEffect } from 'react';
import { Text, View, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Image as RNImage } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { API_ENDPOINTS, apiFetch } from '@/constants/Api';
import { useAuth } from '@/context/AuthContext';
import styles from '@/styles/detalhes-revisao-oficina.styles';

interface MediaItem {
  type: 'image' | 'video';
  uri: string;
}

interface AppointmentDetail {
  id: string;
  workshop_id: string;
  vehicle_id: string;
  date: string;
  time: string;
  service: string;
  status: string;
  details: string;
  cost: number;
  preliminary_cost?: number;
  parts_images: string;
  observations?: string;
  observation_media?: string;
  model: string;
  plate: string;
  brand: string;
  year: string;
  color: string;
}

import Toast from 'react-native-toast-message';

const formatCurrency = (value: string | number): string => {
  if (value === undefined || value === null || value === '') return 'R$ 0,00';
  
  if (typeof value === 'number') {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  const cleanNumber = value.replace(/\D/g, '');
  if (!cleanNumber) return 'R$ 0,00';

  const numericValue = parseFloat(cleanNumber) / 100;
  return numericValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const parseCurrencyToNumber = (formattedValue: string): number => {
  const cleanNumber = formattedValue.replace(/\D/g, '');
  if (!cleanNumber) return 0;
  return parseFloat(cleanNumber) / 100;
};

export default function DetalhesRevisaoOficinaScreen() {
  const params = useLocalSearchParams();
  const { accessToken } = useAuth();
  const router = useRouter();
  const appointmentId = params.id as string;

  const [appointment, setAppointment] = React.useState<AppointmentDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [details, setDetails] = React.useState('');
  const [cost, setCost] = React.useState('');
  const [preliminaryCost, setPreliminaryCost] = React.useState('');
  const [partsImages, setPartsImages] = React.useState<string[]>([]);
  const [observations, setObservations] = React.useState('');
  const [observationMedia, setObservationMedia] = React.useState<MediaItem[]>([]);
  const [saving, setSaving] = React.useState(false);

  const handleCostChange = (text: string) => {
    const digits = text.replace(/\D/g, '');
    setCost(formatCurrency(digits));
  };

  const handlePreliminaryCostChange = (text: string) => {
    const digits = text.replace(/\D/g, '');
    setPreliminaryCost(formatCurrency(digits));
  };

  React.useEffect(() => {
    fetchAppointment();
  }, [appointmentId]);

  const fetchAppointment = async () => {
    try {
      const resp = await apiFetch(`${API_ENDPOINTS.APPOINTMENTS}/${appointmentId}`, accessToken);
      const data = await resp.json();
      if (resp.ok) {
        setAppointment(data);
        setDetails(data.details || '');
        setCost(data.cost ? formatCurrency(data.cost) : 'R$ 0,00');
        setPreliminaryCost(data.preliminary_cost ? formatCurrency(data.preliminary_cost) : 'R$ 0,00');
        setObservations(data.observations || '');
        if (data.parts_images) {
          try {
            setPartsImages(JSON.parse(data.parts_images));
          } catch (e) {
            setPartsImages([]);
          }
        }
        if (data.observation_media) {
          try {
            setObservationMedia(JSON.parse(data.observation_media));
          } catch (e) {
            setObservationMedia([]);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes:', error);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets) {
      const newImages = result.assets
        .filter(asset => asset.base64)
        .map(asset => `data:image/jpeg;base64,${asset.base64}`);
      
      setPartsImages(prev => [...prev, ...newImages]);
    }
  };

  const pickObservationMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsMultipleSelection: true,
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets) {
      const newMedia: MediaItem[] = result.assets.map(asset => {
        const isVideo = asset.type === 'video' || (asset.mimeType && asset.mimeType.startsWith('video'));
        const uri = asset.base64 
          ? `data:${asset.mimeType || (isVideo ? 'video/mp4' : 'image/jpeg')};base64,${asset.base64}`
          : asset.uri;
        return {
          type: isVideo ? 'video' : 'image',
          uri,
        };
      });

      setObservationMedia(prev => [...prev, ...newMedia]);
    }
  };

  const removeImage = (index: number) => {
    setPartsImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeObservationMedia = (index: number) => {
    setObservationMedia(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async (targetStatus: 'Em Análise' | 'Concluído') => {
    if (!details.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Atenção',
        text2: 'Por favor, descreva o que foi feito na revisão.',
        position: 'top',
      });
      return;
    }

    setSaving(true);
    try {
      const resp = await apiFetch(`${API_ENDPOINTS.APPOINTMENTS}/${appointmentId}`, accessToken, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: targetStatus,
          details: details,
          cost: parseCurrencyToNumber(cost),
          preliminary_cost: parseCurrencyToNumber(preliminaryCost),
          parts_images: partsImages,
          observations: observations,
          observation_media: observationMedia,
        }),
      });

      if (resp.ok) {
        setAppointment(prev => prev ? { ...prev, status: targetStatus } : null);
        Toast.show({
          type: 'success',
          text1: targetStatus === 'Concluído' ? 'Revisão Concluída!' : 'Status Atualizado!',
          text2: targetStatus === 'Concluído' 
            ? 'Os detalhes da revisão foram concluídos com sucesso.' 
            : 'Revisão salva em análise com sucesso.',
          position: 'top',
          visibilityTime: 3000,
        });

        setTimeout(() => {
          router.back();
        }, 1200);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Erro ao Salvar',
          text2: 'Não foi possível salvar os detalhes da revisão.',
          position: 'top',
        });
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro de Conexão',
        text2: 'Falha na conexão com o servidor.',
        position: 'top',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF8F00" />
      </View>
    );
  }

  if (!appointment) {
    return (
      <View style={styles.center}>
        <Text>Agendamento não encontrado.</Text>
      </View>
    );
  }

  const formatString = (val: any) => {
    if (Array.isArray(val)) return val[0] || '';
    return String(val || '');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Detalhamento da Revisão' }} />
      
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.vehicleCard}>
            <Ionicons name="car" size={40} color="#FF8F00" />
            <View>
              <Text style={styles.modelText}>{formatString(appointment.model)} ({formatString(appointment.brand)})</Text>
              <View style={styles.plateBadge}>
                <Text style={styles.plateText}>{formatString(appointment.plate).toUpperCase()}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>DATA</Text>
              <Text style={styles.infoValue}>{appointment.date}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>HORA</Text>
              <Text style={styles.infoValue}>{appointment.time}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>STATUS ATUAL</Text>
              <Text style={[styles.infoValue, { color: appointment.status === 'Concluído' ? '#10B981' : appointment.status === 'Em Análise' ? '#8B5CF6' : '#FF8F00' }]}>
                {appointment.status || 'Pendente'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionLabel}>O que foi feito / Diagnóstico</Text>
          <Text style={styles.sectionSubtitle}>Descreva detalhadamente o diagnóstico, peças trocadas e serviços realizados.</Text>
          
          <TextInput
            style={styles.detailsInput}
            multiline
            numberOfLines={6}
            placeholder="Ex: Em análise: checando ruído na suspensão... ou Revisão concluída: troca de óleo e filtros realizada."
            value={details}
            onChangeText={setDetails}
            textAlignVertical="top"
          />
        </View>

        <View style={[styles.formSection, { marginTop: 24 }]}>
          <Text style={styles.sectionLabel}>Fotos das peças trocadas</Text>
          <Text style={styles.sectionSubtitle}>Adicione fotos das peças novas ou peças trocadas.</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesContainer}>
            <TouchableOpacity style={styles.addButton} onPress={pickImage}>
              <Ionicons name="camera-outline" size={32} color="#FF8F00" />
              <Text style={styles.addButtonText}>Adicionar</Text>
            </TouchableOpacity>

            {partsImages.map((uri, index) => (
              <View key={index} style={styles.imageWrapper}>
                <RNImage source={{ uri }} style={styles.partsImage} />
                <TouchableOpacity style={styles.removeImageButton} onPress={() => removeImage(index)}>
                  <Ionicons name="close-circle" size={24} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={[styles.formSection, { marginTop: 24 }]}>
          <Text style={styles.sectionLabel}>Valor Total (R$)</Text>
          <TextInput
            style={styles.costInput}
            keyboardType="numeric"
            placeholder="0,00"
            value={cost}
            onChangeText={handleCostChange}
          />
        </View>

        <View style={[styles.formSection, { marginTop: 24, marginBottom: 40 }]}>
          <Text style={styles.sectionLabel}>Observações Adicionais</Text>
          <Text style={styles.sectionSubtitle}>Anotações extras, avarias pré-existentes, fotos ou vídeos de diagnóstico.</Text>
          
          <TextInput
            style={[styles.detailsInput, { minHeight: 80 }]}
            multiline
            numberOfLines={3}
            placeholder="Ex: Pneu dianteiro com desgaste acentuado no ombro; recomendada troca futura."
            value={observations}
            onChangeText={setObservations}
            textAlignVertical="top"
          />

          <Text style={[styles.sectionLabel, { fontSize: 15, marginTop: 8 }]}>Fotos e Vídeos de Observação</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.imagesContainer, { marginTop: 8 }]}>
            <TouchableOpacity style={styles.addMediaButton} onPress={pickObservationMedia}>
              <Ionicons name="videocam-outline" size={26} color="#8B5CF6" />
              <Text style={styles.addMediaButtonText}>+ Foto/Vídeo</Text>
            </TouchableOpacity>

            {observationMedia.map((item, index) => (
              <View key={index} style={styles.mediaWrapper}>
                {item.type === 'video' ? (
                  <View style={styles.videoPlaceholder}>
                    <Ionicons name="play-circle" size={36} color="#FFF" />
                    <Text style={styles.videoTag}>VÍDEO</Text>
                  </View>
                ) : (
                  <RNImage source={{ uri: item.uri }} style={styles.partsImage} />
                )}
                <TouchableOpacity style={styles.removeImageButton} onPress={() => removeObservationMedia(index)}>
                  <Ionicons name="close-circle" size={24} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={[styles.formSection, { marginTop: 8, marginBottom: 40 }]}>
          <Text style={styles.sectionLabel}>Valor Preliminar (R$)</Text>
          <Text style={styles.sectionSubtitle}>Estimativa inicial ou orçamento prévio enquanto a revisão está em análise.</Text>
          <TextInput
            style={[styles.costInput, { color: '#8B5CF6' }]}
            keyboardType="numeric"
            placeholder="0,00"
            value={preliminaryCost}
            onChangeText={handlePreliminaryCostChange}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.analysisButton, saving && { opacity: 0.7 }]} 
          onPress={() => handleSave('Em Análise')}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#8B5CF6" />
          ) : (
            <>
              <Ionicons name="search-outline" size={20} color="#8B5CF6" />
              <Text style={styles.analysisButtonText}>Em Análise</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.saveButton, saving && { opacity: 0.7 }]} 
          onPress={() => handleSave('Concluído')}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" />
              <Text style={styles.saveButtonText}>Concluir</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
