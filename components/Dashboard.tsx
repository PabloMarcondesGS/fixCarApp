import { TouchableOpacity, Text, View, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './Dashboard.styles';
import { useState } from 'react';
import VehicleRegistration, { Vehicle } from './VehicleRegistration';

export interface UserInfo {
  name: string;
  picture: string;
}

interface DashboardProps {
  token: string;
  userInfo: UserInfo | null;
  onLogout: () => void;
}

export default function Dashboard({ token, userInfo, onLogout }: DashboardProps) {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);

  const handleSaveVehicle = (savedVehicle: Vehicle) => {
    setVehicle(savedVehicle);
  };

  const handleEditVehicle = () => {
    // When editing, we set vehicle to null to show the form again,
    // but the `VehicleRegistration` component handles maintaining its own internal state
    // so the data isn't lost while typing. However, to pass the *current* data back down:
    // It's already there in the form state of VehicleRegistration, but we can manage it better
    // if we want to reset completely vs edit. For simple edit, we keep the data in VehicleRegistration and just flip a editing flag,
    // OR just pass the current vehicle back.
  };

  return (
    <View style={styles.dashboardContainer}>
      <View style={styles.dashboardHeader}>
        <View style={styles.userInfo}>
           {userInfo?.picture ? (
             <Image source={{ uri: userInfo.picture }} style={styles.avatarImage} />
           ) : (
             <View style={styles.avatarPlaceholder}>
               <Ionicons name="person" size={40} color="#4A90E2" />
             </View>
           )}
           <View>
             <Text style={styles.welcomeText}>Olá, {userInfo?.name || 'Explorador'}!</Text>
             <Text style={styles.tokenText}>Token: {token.substring(0, 10)}...</Text>
           </View>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Ionicons name="log-out-outline" size={24} color="#F44336" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.dashboardContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
           <Ionicons name="rocket" size={40} color="#FF9800" style={{marginBottom: 10}}/>
           <Text style={styles.cardTitle}>Comece sua jornada</Text>
           <Text style={styles.cardDescription}>Aqui será a área principal do seu aplicativo onde as mágicas acontecem.</Text>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Projetos</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>4.8</Text>
            <Text style={styles.statLabel}>Avaliação</Text>
          </View>
        </View>

        {/* COMPONENTE DE REGISTRO DE VEÍCULO */}
        <View style={{ marginTop: 20, marginBottom: 40 }}>
          <VehicleRegistration 
            vehicle={vehicle} 
            onSave={handleSaveVehicle} 
            onEdit={() => setVehicle(null)} 
           />
        </View>
      </ScrollView>
    </View>
  );
}
