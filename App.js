import { Provider } from 'react-redux';
import { store } from './src/store/store';
import Navigation from './src/navigation/index';
import { PaperProvider } from 'react-native-paper';

import * as SecureStore from 'expo-secure-store';
import { loginSuccess, setLoading } from './src/store/authSlice';
import api from './src/api/api';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import * as Font from 'expo-font'; // ← ДОБАВЬ
export default function App() {
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        // 1. Загружаем шрифты
        await Font.loadAsync({
          'CustomFont-Regular': require('./assets/font/Geologica.ttf'),
        });

        // 2. Проверяем токен
        const token = await SecureStore.getItemAsync('token');
        if (token) {
          api.setToken(token);
          const userResponse = await api.getUser();
          store.dispatch(loginSuccess({ user: userResponse.data, token }));
        }
      } catch (error) {
        console.error('Bootstrap error:', error);
        await SecureStore.deleteItemAsync('token');
      } finally {
        store.dispatch(setLoading(false));
        await SplashScreen.hideAsync();
      }
    };

    bootstrapAsync();
  }, []);

  return (
    <Provider store={store}>
      <PaperProvider>
        <Navigation />
      </PaperProvider>
    </Provider>
  );
}



