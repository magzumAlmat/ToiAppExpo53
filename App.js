import React, { useCallback, useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { store } from './src/store/store';
import Navigation from './src/navigation/index';
import { PaperProvider } from 'react-native-paper';
import * as SecureStore from 'expo-secure-store';
import { loginSuccess, setLoading } from './src/store/authSlice';
import api from './src/api/api';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { View } from 'react-native';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [fontsLoaded] = useFonts({
    'Geologica-Regular': require('./assets/font/Geologica.ttf'),
    'Geologica-Thin': require('./assets/font/static/Geologica-Thin.ttf'),
    'Geologica-ExtraLight': require('./assets/font/static/Geologica-ExtraLight.ttf'),
    'Geologica-Light': require('./assets/font/static/Geologica-Light.ttf'),
    'Geologica-Medium': require('./assets/font/static/Geologica-Medium.ttf'),
    'Geologica-SemiBold': require('./assets/font/static/Geologica-SemiBold.ttf'),
    'Geologica-Bold': require('./assets/font/static/Geologica-Bold.ttf'),
    'Geologica-ExtraBold': require('./assets/font/static/Geologica-ExtraBold.ttf'),
    'Geologica-Black': require('./assets/font/static/Geologica-Black.ttf'),
  });

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
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
            console.error('API Error during bootstrap:', apiError);
            await SecureStore.deleteItemAsync('token').catch(() => {});
          }
        }
      } catch (error) {
        console.error('Error during bootstrap token check:', error);
      } finally {
        if (isMounted) {
          store.dispatch(setLoading(false));
        }
      }
    };

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <PaperProvider>
        <View onLayout={onLayoutRootView} style={{ flex: 1 }}>
          <Navigation />
        </View>
      </PaperProvider>
    </Provider>
  );
}