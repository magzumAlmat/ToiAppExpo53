// src/config/index.js
import Constants from 'expo-constants';

const ENV = {
  dev: {
    API_baseURL: 'http://192.168.1.100:3000',
    TEST_VAR: 'dev-mode',
  },
  staging: {
    API_baseURL: 'http://89.207.250.181:3000',
    TEST_VAR: 'staging',
  },
  prod: {
    API_baseURL: 'http://89.207.250.181:3000', // твой прод
    TEST_VAR: 'production',
  },
};

// Это ключевой момент!
const getEnvVars = () => {
  if (__DEV__) {
    return ENV.dev; // в expo go — всегда dev
  }

  // В production-билде (TestFlight) — читаем из eas.json
  if (Constants.expoConfig?.extra) {
    return {
      API_baseURL: Constants.expoConfig.extra.EXPO_PUBLIC_API_baseURL,
      TEST_VAR: Constants.expoConfig.extra.EXPO_PUBLIC_TEST_VAR,
    };
  }

  return ENV.prod; // fallback
};

export default getEnvVars();