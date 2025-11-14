// import { Provider } from 'react-redux';
// import { store } from './src/store/store';
// import Navigation from './src/navigation/index';
// import { PaperProvider } from 'react-native-paper';

// import * as SecureStore from 'expo-secure-store';
// import { loginSuccess, setLoading } from './src/store/authSlice';
// import api from './src/api/api';
// import * as SplashScreen from 'expo-splash-screen';
// import { useEffect } from 'react';
// import * as Font from 'expo-font'; // ← ДОБАВЬ
// export default function App() {
//   useEffect(() => {
//     const bootstrapAsync = async () => {
//       try {
//         // 1. Загружаем шрифты
//         await Font.loadAsync({
//           'CustomFont-Regular': require('./assets/font/Geologica.ttf'),
//         });

//         // 2. Проверяем токен
//         const token = await SecureStore.getItemAsync('token');
//         if (token) {
//           api.setToken(token);
//           const userResponse = await api.getUser();
//           store.dispatch(loginSuccess({ user: userResponse.data, token }));
//         }
//       } catch (error) {
//         console.error('Bootstrap error:', error);
//         await SecureStore.deleteItemAsync('token');
//       } finally {
//         store.dispatch(setLoading(false));
//         await SplashScreen.hideAsync();
//       }
//     };

//     bootstrapAsync();
//   }, []);

//   return (
//     <Provider store={store}>
//       <PaperProvider>
//         <Navigation />
//       </PaperProvider>
//     </Provider>
//   );
// }

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
import * as Font from 'expo-font';

// 1. ПРЕДОТВРАЩАЕМ АВТО-СКРЫТИЕ
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  useEffect(() => {
    let isMounted = true;
    let timeoutId = null;

    const hideSplashWithTimeout = async () => {
      // ЗАЩИТА: скрываем Splash через 5 секунд В ЛЮБОМ СЛУЧАЕ
      timeoutId = setTimeout(async () => {
        if (isMounted) {
          store.dispatch(setLoading(false));
          try {
            await SplashScreen.hideAsync();
          } catch {}
        }
      }, 5000);
    };

    const bootstrapAsync = async () => {
      hideSplashWithTimeout(); // ← Запускаем таймер сразу

      try {
        // Шрифты
        try {
          await Font.loadAsync({
            'CustomFont-Regular': require('./assets/font/Geologica.ttf'),
          });
        } catch {}

        // Токен
        let token = null;
        try {
          token = await SecureStore.getItemAsync('token');
        } catch {}

        if (token && isMounted) {
          try {
            api.setToken(token);
            const userResponse = await api.getUser();
            if (userResponse?.data && isMounted) {
              store.dispatch(loginSuccess({ user: userResponse.data, token }));
            }
          } catch {
            try { await SecureStore.deleteItemAsync('token'); } catch {}
          }
        }
      } catch (error) {
        // Любая ошибка — игнорируем
      } finally {
        // Если таймер не сработал — скрываем вручную
        if (isMounted) {
          store.dispatch(setLoading(false));
          try {
            await SplashScreen.hideAsync();
          } catch {}
        }
      }
    };

    bootstrapAsync();

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