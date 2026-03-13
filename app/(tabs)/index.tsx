// ... imports mantidos (apenas o que mudou abaixoo)
import { StyleSheet, TouchableOpacity, Text, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';

import Dashboard, { UserInfo } from '@/components/Dashboard';

import { useAuth } from '@/context/AuthContext';

WebBrowser.maybeCompleteAuthSession();

export default function HomeScreen() {
  const { isAuthenticated, login, logout, accessToken, userInfo } = useAuth();

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: "203284143716-opfmi37sbfb76etc99afrli04l90u3vr.apps.googleusercontent.com",
    scopes: ['profile', 'email'],
    redirectUri: AuthSession.makeRedirectUri({
      scheme: 'meuappexpo',
    }),
  });

  useEffect(() => {
    if (response?.type === 'success' && response.authentication) {
      fetchUserInfo(response.authentication.accessToken);
    }
  }, [response]);

  const fetchUserInfo = async (token: string) => {
    try {
      const resp = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = await resp.json();
      login(token, user);
    } catch (error) {
      console.log('Erro ao buscar dados do usuário:', error);
    }
  };

  if (isAuthenticated) {
    return <Dashboard token={accessToken} userInfo={userInfo} onLogout={logout} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Ionicons name="planet" size={80} color="#4A90E2" style={styles.icon} />
        <Text style={styles.title}>Bem-vindo</Text>
        <Text style={styles.subtitle}>Faça login para continuar explorando o universo do seu novo app.</Text>
      </View>

      <View style={styles.formContainer}>
        <TouchableOpacity 
          style={[styles.button, !request && styles.buttonDisabled]} 
          disabled={!request}
          activeOpacity={0.8}
          onPress={() => promptAsync()}
        >
          <Ionicons name="logo-google" size={24} color="#FFF" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Continuar com o Google</Text>
        </TouchableOpacity>

        {response?.type === 'error' && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={20} color="#F44336" />
            <Text style={styles.errorText}>Erro ao fazer login.</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    padding: 24,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  icon: {
    marginBottom: 20,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#4A90E2',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  buttonDisabled: {
    backgroundColor: '#A0C4E8',
    shadowOpacity: 0.1,
  },
  buttonIcon: {
    marginRight: 12,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  errorBox: {
    flexDirection: 'row',
    marginTop: 20,
    padding: 12,
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
  },
  errorText: {
    marginLeft: 8,
    color: '#C62828',
    fontWeight: '500',
  },
});
