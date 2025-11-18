// App.js — РАБОЧАЯ ВЕРСИЯ ДЛЯ TESTFLIGHT
import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './src/store/store';
import Navigation from './src/navigation/index';
import { PaperProvider } from 'react-native-paper';
import * as SecureStore from 'expo-secure-store';
import { loginSuccess, setLoading } from './src/store/authSlice';
import api from './src/api/api';
import * as SplashScreen from 'expo-splash-screen';
import { View } from 'react-native';

// Это КРИТИЧЕСКИ ВАЖНО для iOS production билдов
SplashScreen.preventAutoHideAsync();

export default function App() {
  useEffect(() => {
    let mounted = true;

    const prepare = async () => {
      try {
        // Твой код авторизации
        const token = await SecureStore.getItemAsync('token');
        if (token && mounted) {
          try {
            api.setToken(token);
            const res = await api.getUser();
            if (res?.data) {
              store.dispatch(loginSuccess({ user: res.data, token }));
            }
          } catch (e) {
            await SecureStore.deleteItemAsync('token');
          }
        }
      } catch (e) {
        console.warn(e);
      } finally {
        // ВОТ ЭТО ГЛАВНОЕ — ЖДЁМ 100мс + ВСЕГДА скрываем
        setTimeout(async () => {
          if (mounted) {
            store.dispatch(setLoading(false));
            try {
              await SplashScreen.hideAsync();
            } catch (e) {
              // Иногда hideAsync кидает ошибку — игнорируем
            }
          }
        }, 100);
      }
    };

    prepare();

    return () => {
      mounted = false;
    };
  }, []);

  // ОБЯЗАТЕЛЬНО: View с onLayout, иначе iOS не скроет Splash в production!
  return (
    <Provider store={store}>
      <PaperProvider>
        <View style={{ flex: 1 }} onLayout={() => {}}>
          <Navigation />
        </View>
      </PaperProvider>
    </Provider>
  );
}