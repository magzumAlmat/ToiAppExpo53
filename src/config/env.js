// src/config/env.js
import Constants from 'expo-constants';

export const env = {
  // API_baseURL: Constants?.expoConfig?.extra?.EXPO_PUBLIC_API_baseURL || 'http://89.207.250.181:3000',
  API_baseURL: Constants?.expoConfig?.extra?.EXPO_PUBLIC_API_baseURL || 'http://localhost:3000',
  TEST_VAR: Constants?.expoConfig?.extra?.EXPO_PUBLIC_TEST_VAR || 'default',
};