import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router, Stack } from 'expo-router';

export default function NotFoundScreen() {
  useEffect(() => {
    // Redireciona de forma segura para a tela inicial
    const timer = setTimeout(() => {
      router.replace('/');
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Stack.Screen options={{ title: 'Carregando...', headerShown: false }} />
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FF8F00" />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});
