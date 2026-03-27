import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { API_ENDPOINTS } from '@/constants/Api';
import { Calendar, LocaleConfig } from 'react-native-calendars';

// Configuração do Calendário para Português
LocaleConfig.locales['pt-br'] = {
  monthNames: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
  monthNamesShort: ['Jan.', 'Fev.', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul.', 'Ago', 'Set.', 'Out.', 'Nov.', 'Dez.'],
  dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
  dayNamesShort: ['Dom.', 'Seg.', 'Ter.', 'Qua.', 'Qui.', 'Sex.', 'Sáb.'],
  today: 'Hoje'
};
LocaleConfig.defaultLocale = 'pt-br';

const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
];

export default function BloqueioScreen() {
  const router = useRouter();
  const [date, setDate] = useState(''); // Formato YYYY-MM-DD
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [blockedSlots, setBlockedSlots] = useState<any[]>([]);

  useEffect(() => {
    fetchBlockedSlots();
  }, []);

  const fetchBlockedSlots = async () => {
    try {
      const resp = await fetch(API_ENDPOINTS.BLOCKED_SLOTS);
      const data = await resp.json();
      setBlockedSlots(data);
    } catch (error) {
      console.log('Erro ao buscar bloqueios:', error);
    }
  };

  const toggleTime = (time: string) => {
    if (selectedTimes.includes(time)) {
      setSelectedTimes(selectedTimes.filter(t => t !== time));
    } else {
      setSelectedTimes([...selectedTimes, time]);
    }
  };

  const formatDateToBR = (dateString: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const handleDeleteSlot = async (id: string) => {
    try {
      const resp = await fetch(`${API_ENDPOINTS.BLOCKED_SLOTS}/${id}`, {
        method: 'DELETE',
      });
      if (resp.ok) {
        setBlockedSlots(blockedSlots.filter(s => s.id !== id));
      } else {
        Alert.alert('Erro', 'Não foi possível remover o bloqueio.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha na conexão.');
    }
  };

  const handleBlock = async () => {
    if (!date || selectedTimes.length === 0) {
      Alert.alert('Erro', 'Selecione uma data no calendário e pelo menos um horário.');
      return;
    }

    setLoading(true);
    const dateBR = formatDateToBR(date);
    try {
      const promises = selectedTimes.map(time => 
        fetch(API_ENDPOINTS.BLOCKED_SLOTS, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date: dateBR, time, reason }),
        })
      );

      const results = await Promise.all(promises);
      const allOk = results.every(res => res.ok);

      if (allOk) {
        Alert.alert('Sucesso', `${selectedTimes.length} horário(s) bloqueado(s) para o dia ${dateBR}!`);
        setDate('');
        setSelectedTimes([]);
        setReason('');
        fetchBlockedSlots();
      } else {
        Alert.alert('Aviso', 'Alguns horários podem não ter sido bloqueados.');
        fetchBlockedSlots();
      }
    } catch (error) {
      Alert.alert('Erro', 'Conexão falhou.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.title}>Gerenciar Agenda</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.form}>
          <Text style={styles.label}>Selecione a Data</Text>
          <View style={styles.calendarContainer}>
            <Calendar
              onDayPress={(day: any) => setDate(day.dateString)}
              markedDates={{
                [date]: { selected: true, disableTouchEvent: true, selectedColor: '#4A90E2' }
              }}
              theme={{
                todayTextColor: '#4A90E2',
                selectedDayBackgroundColor: '#4A90E2',
                arrowColor: '#4A90E2',
                textDayFontWeight: '600',
                textMonthFontWeight: 'bold',
                textDayHeaderFontWeight: '600',
              }}
            />
          </View>

          {date ? (
            <View style={styles.timeSection}>
              <Text style={styles.label}>Horários para Bloqueio ({formatDateToBR(date)})</Text>
              <View style={styles.timeGrid}>
                {TIME_SLOTS.map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.timeCard,
                      selectedTimes.includes(time) && styles.timeCardSelected
                    ]}
                    onPress={() => toggleTime(time)}
                  >
                    <Text style={[
                      styles.timeText,
                      selectedTimes.includes(time) && styles.timeTextSelected
                    ]}>
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Motivo (Opcional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Manutenção interna"
                value={reason}
                onChangeText={setReason}
              />

              <TouchableOpacity 
                style={[styles.button, (loading || selectedTimes.length === 0) && { opacity: 0.6 }]} 
                onPress={handleBlock} 
                disabled={loading || selectedTimes.length === 0}
              >
                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Confirmar Bloqueios</Text>}
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.hintText}>Escolha um dia acima para definir os horários.</Text>
          )}
        </View>

        <View style={styles.listSection}>
          <Text style={styles.subtitle}>Horários Bloqueados</Text>
          {blockedSlots.length === 0 ? (
            <Text style={styles.emptyText}>Nenhum horário bloqueado.</Text>
          ) : (
            blockedSlots.map((slot) => (
              <View key={slot.id} style={styles.slotItem}>
                <View>
                  <Text style={styles.slotDateTime}>{slot.date} às {slot.time}</Text>
                  {slot.reason && <Text style={styles.slotReason}>{slot.reason}</Text>}
                </View>
                <Ionicons name="lock-closed" size={20} color="#F44336" />
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#FFF',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  form: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  calendarContainer: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
    marginTop: 8,
  },
  hintText: {
    color: '#64748B',
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 20,
  },
  timeSection: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 20,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  timeCard: {
    width: '30%',
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
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
  timeTextSelected: {
    color: '#FFF',
  },
  button: {
    backgroundColor: '#4A90E2',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  listSection: {
    marginBottom: 40,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  emptyText: {
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 20,
  },
  slotItem: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  slotDateTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  slotReason: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
});
