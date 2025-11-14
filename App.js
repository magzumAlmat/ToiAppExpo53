// App.js
import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './src/store/store';
import Navigation from './src/navigation/index';
import { PaperProvider } from 'react-native-paper';
import * as SecureStore from 'expo-secure-store';
import { loginSuccess, setLoading } from './src/store/authSlice';
import api from './src/api/api';
import * as SplashScreen from 'expo-splash-screen';

// УБИРАЕМ Font.loadAsync — он НЕ НУЖЕН в production
// Expo автоматически подгружает шрифты из assets

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  useEffect(() => {
    let isMounted = true;
    let timeoutId = null;

    const hideSplash = async () => {
      if (isMounted) {
        store.dispatch(setLoading(false));
        try {
          await SplashScreen.hideAsync();
        } catch (e) {
          console.warn('Splash hide error:', e);
        }
      }
    };

    const bootstrap = async () => {
      // 1. Запускаем таймер — скрываем Splash через 4 сек В ЛЮБОМ СЛУЧАЕ
      timeoutId = setTimeout(hideSplash, 4000);

      try {
        const token = await SecureStore.getItemAsync('token');
        if (token && isMounted) {
          try {
            api.setToken(token);
            const res = await api.getUser();
            if (res?.data && isMounted) {
              store.dispatch(loginSuccess({ user: res.data, token }));
            }
          } catch (apiError) {
            await SecureStore.deleteItemAsync('token').catch(() => {});
          }
        }
      } catch (error) {
        // Игнорируем все ошибки
      } finally {
        // Если таймер не сработал — скрываем вручную
        clearTimeout(timeoutId);
        hideSplash();
      }
    };

    bootstrap();

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  return (
    <Provider store={store}>
      <PaperProvider>
        <Navigation />
      </PaperProvider>
    </Provider>
  );
}