import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', 
  '13:00', '14:00', '15:00', '16:00', '17:00'
];

export default function AgendamentoScreen() {
  const params = useLocalSearchParams();
  const workshopName = params.workshopName as string || 'Oficina';
  
  const [selectedDate, setSelectedDate] = useState<number>(0);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Generate next 7 days
  const getDays = () => {
    const days = [];
    const now = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() + i);
      days.push({
        dayName: date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''),
        dayNum: date.getDate(),
        fullDate: date.toLocaleDateString('pt-BR')
      });
    }
    return days;
  };

  const days = getDays();

  const handleConfirm = () => {
    if (!selectedTime) {
      alert('Por favor, selecione um horário.');
      return;
    }
    alert(`Agendamento confirmado para ${workshopName} em ${days[selectedDate].fullDate} às ${selectedTime}!`);
    router.back();
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Agendar Horário', headerBackTitle: 'Voltar' }} />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.workshopTitle}>{workshopName}</Text>
          <Text style={styles.subtitle}>Escolha o melhor dia e horário para o seu serviço.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Selecione o Dia</Text>
          <FlatList
            horizontal
            data={days}
            keyExtractor={(_, index) => index.toString()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateList}
            renderItem={({ item, index }) => (
              <TouchableOpacity 
                style={[styles.dateCard, selectedDate === index && styles.dateCardSelected]}
                onPress={() => setSelectedDate(index)}
              >
                <Text style={[styles.dayName, selectedDate === index && styles.textSelected]}>
                  {item.dayName.toUpperCase()}
                </Text>
                <Text style={[styles.dayNum, selectedDate === index && styles.textSelected]}>
                  {item.dayNum}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Horários Disponíveis</Text>
          <View style={styles.timeGrid}>
            {TIME_SLOTS.map((time) => (
              <TouchableOpacity
                key={time}
                style={[styles.timeCard, selectedTime === time && styles.timeCardSelected]}
                onPress={() => setSelectedTime(time)}
              >
                <Text style={[styles.timeText, selectedTime === time && styles.textSelected]}>
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmButtonText}>Confirmar Agendamento</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  workshopTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    lineHeight: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  dateList: {
    paddingRight: 24,
  },
  dateCard: {
    width: 70,
    height: 90,
    backgroundColor: '#FFF',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dateCardSelected: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  dayName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 4,
  },
  dayNum: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  timeCard: {
    width: '30%',
    paddingVertical: 14,
    backgroundColor: '#FFF',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timeCardSelected: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
  },
  textSelected: {
    color: '#FFF',
  },
  footer: {
    padding: 24,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  confirmButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
