import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './VehicleRegistration.styles';

export interface Vehicle {
  name: string;
  brand: string;
  color: string;
  plate: string;
}

interface VehicleRegistrationProps {
  vehicle: Vehicle | null;
  onSave: (vehicle: Vehicle) => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function VehicleRegistration({ vehicle, onSave, onEdit, onDelete }: VehicleRegistrationProps) {
  const [formData, setFormData] = useState<Vehicle>(
    vehicle || { name: '', brand: '', color: '', plate: '' }
  );

  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const handleSave = () => {
    // Only save if name and plate are at least provided
    if (formData.name.trim() && formData.plate.trim()) {
      onSave(formData);
    } else {
      Alert.alert("Erro", "Por favor, preencha pelo menos o Nome e a Placa do veículo.");
    }
  };

  const handleDelete = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Tem certeza que deseja remover este veículo?');
      if (confirmed) {
        onDelete();
      }
    } else {
      Alert.alert(
        "Excluir Veículo",
        "Tem certeza que deseja remover este veículo?",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Excluir", style: "destructive", onPress: onDelete }
        ]
      );
    }
  };

  // Se o veículo já estiver salvo (e não estivermos em modo de edição), mostra o Card
  if (vehicle) {
    return (
      <View style={styles.container}>
        <View style={styles.vehicleCardHeader}>
          <View>
             <Text style={styles.vehicleName}>{vehicle.name}</Text>
             <Text style={styles.vehicleBrand}>{vehicle.brand}</Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity style={styles.editButton} onPress={onEdit}>
              <Ionicons name="pencil" size={20} color="#4A90E2" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.vehicleDetailsRow}>
          <View style={styles.detailColumn}>
            <Text style={styles.detailLabel}>Cor</Text>
            <Text style={styles.detailValue}>{vehicle.color || 'N/A'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailColumn}>
            <Text style={styles.detailLabel}>Placa</Text>
            <Text style={styles.detailValue}>{vehicle.plate.toUpperCase()}</Text>
          </View>
        </View>
      </View>
    );
  }

  // Senão, mostra o formulário de cadastro
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Ionicons name="car-sport" size={28} color="#4A90E2" />
        <Text style={styles.title}>Vincular Veículo</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nome do Veículo</Text>
          <TextInput
            style={[styles.input, focusedInput === 'name' && styles.inputFocused]}
            placeholder="Digite o nome"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            onFocus={() => setFocusedInput('name')}
            onBlur={() => setFocusedInput(null)}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Marca / Modelo</Text>
          <TextInput
            style={[styles.input, focusedInput === 'brand' && styles.inputFocused]}
            placeholder="Digite o modelo"
            value={formData.brand}
            onChangeText={(text) => setFormData({ ...formData, brand: text })}
            onFocus={() => setFocusedInput('brand')}
            onBlur={() => setFocusedInput(null)}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Cor</Text>
          <TextInput
            style={[styles.input, focusedInput === 'color' && styles.inputFocused]}
            placeholder="Digite a cor"
            value={formData.color}
            onChangeText={(text) => setFormData({ ...formData, color: text })}
            onFocus={() => setFocusedInput('color')}
            onBlur={() => setFocusedInput(null)}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Placa</Text>
          <TextInput
            style={[styles.input, focusedInput === 'plate' && styles.inputFocused]}
            placeholder="Digite a placa"
            autoCapitalize="characters"
            value={formData.plate}
            onChangeText={(text) => setFormData({ ...formData, plate: text })}
            onFocus={() => setFocusedInput('plate')}
            onBlur={() => setFocusedInput(null)}
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Ionicons name="save-outline" size={20} color="#FFF" />
          <Text style={styles.saveButtonText}>Salvar Veículo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
