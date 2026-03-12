import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
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
}

export default function VehicleRegistration({ vehicle, onSave, onEdit }: VehicleRegistrationProps) {
  const [formData, setFormData] = useState<Vehicle>(
    vehicle || { name: '', brand: '', color: '', plate: '' }
  );

  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const handleSave = () => {
    // Only save if name and plate are at least provided
    if (formData.name.trim() && formData.plate.trim()) {
      onSave(formData);
    } else {
      alert("Por favor, preencha pelo menos o Nome e a Placa do veículo.");
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
          <TouchableOpacity style={styles.editButton} onPress={onEdit}>
            <Ionicons name="pencil" size={20} color="#4A90E2" />
          </TouchableOpacity>
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
            placeholder="Ex: Meu Carro de Viagem"
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
            placeholder="Ex: Toyota Corolla"
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
            placeholder="Ex: Prata"
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
            placeholder="Ex: ABC-1234"
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
