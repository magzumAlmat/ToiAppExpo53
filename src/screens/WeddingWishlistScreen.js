// const COLORS = {
//   primary: '#4A90E2',
//   secondary: '#50C878',
//   accent: '#FF6F61',
//   background: '#F7F9FC',
//   text: '#2D3748',
//   muted: '#718096',
//   white: '#FFFFFF',
//   border: '#E2E8F0',
//   error: '#E53E3E',
// };

// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
//   Alert,
//   TextInput,
// } from 'react-native';
// import { useRoute, useNavigation } from '@react-navigation/native';
// import { useSelector } from 'react-redux';
// import api from '../api/api';
// import { SafeAreaView } from 'react-native-safe-area-context';

// export default function WeddingWishlistScreen() {
//   const route = useRoute();
//   const navigation = useNavigation();
//   const token = useSelector((state) => state.auth.token);
//   const userId = useSelector((state) => state.auth.user?.id);

//   const [wishlistItems, setWishlistItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [weddingDetails, setWeddingDetails] = useState({ name: '', date: '' });
//   const weddingId = route.params?.id;

//   console.log('USER=', userId);
//   console.log('WeddingWishlistScreen Started | wishlist=', weddingId);

//   // Fetch wedding details and wishlist items
//   const fetchWeddingAndWishlist = async () => {
//     if (!token || !userId) {
//       Alert.alert('Ошибка', 'Пожалуйста, авторизуйтесь для просмотра деталей свадьбы');
//       setLoading(false);
//       return;
//     }

//     try {
//       setLoading(true);
//       const response = await api.getWeddingsById(weddingId, token);
//       const wedding = response.data.data;
//       console.log('api.getWeddingsById cработал ', wedding);
//       if (wedding) {
//         setWeddingDetails({ name: wedding.name, date: wedding.date });
//       } else {
//         Alert.alert('Ошибка', 'Не удалось найти данные о свадьбе');
//       }

//       const wishlistResponse = await api.getWishlistByWeddingIdWithoutToken(weddingId);
//       setWishlistItems(wishlistResponse.data.data || []);
//     } catch (error) {
//       console.error('Ошибка при загрузке данных:', error);
//       if (error.response?.status === 403) {
//         Alert.alert('Ошибка', 'У вас нет доступа к данным этой свадьбы');
//       } else {
//         Alert.alert('Ошибка', 'Не удалось загрузить данные свадьбы');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch data on mount
//   useEffect(() => {
//     if (weddingId) {
//       fetchWeddingAndWishlist();
//     } else {
//       Alert.alert('Ошибка', 'Не удалось загрузить данные свадьбы');
//       setLoading(false);
//     }
//   }, [weddingId, token, userId]);

//   // Set up the header with navigation buttons
//   useEffect(() => {
//     navigation.setOptions({
//       headerShown: true,
//       title: `Список подарков`,
//       headerLeft: () => (
//         <TouchableOpacity
//           style={styles.headerButton}
//           onPress={() => navigation.goBack()}
//         >
//           <Text style={styles.headerButtonText}>Назад</Text>
//         </TouchableOpacity>
//       ),
//     });
//   }, [navigation, weddingId]);

//   const handleReserveWishlistItem = (wishlistId) => {
//     Alert.prompt(
//       'Резервирование подарка',
//       'Пожалуйста, введите ваше имя:',
//       [
//         { text: 'Отмена', style: 'cancel' },
//         {
//           text: 'Зарезервировать',
//           onPress: async (name) => {
//             if (!name || name.trim() === '') {
//               Alert.alert('Ошибка', 'Имя не может быть пустым');
//               return;
//             }
//             try {
//               console.log('Зерезервировано без токена:', wishlistId, name);
//               const data = { reserved_by_unknown: name.trim() };
//               const response = await api.reserveWishlistItemWithoutToken(wishlistId, data);
//               Alert.alert('Успех', 'Подарок зарезервирован');
//               setWishlistItems(
//                 wishlistItems.map((item) =>
//                   item.id === wishlistId
//                     ? { ...item, is_reserved: true, reserved_by_unknown: name.trim() }
//                     : item
//                 )
//               );
//             } catch (error) {
//               console.error('Ошибка при резервировании подарка:', error);
//               Alert.alert('Ошибка', error.response?.data?.error || 'Не удалось зарезервировать подарок');
//             }
//           },
//         },
//       ],
//       'plain-text'
//     );
//   };

//   const renderWishlistItem = ({ item }) => (
//     <View style={styles.wishlistItemContainer}>
//       <Text style={styles.itemText}>{item.item_name}</Text>
//       <Text style={styles.itemStatus}>
//         {item.is_reserved
//           ? `Зарезервировано${item.reserved_by_unknown ? ` пользователем: ${item.reserved_by_unknown}` : ''}`
//           : 'Свободно'}
//       </Text>
//       {!item.is_reserved && (
//         <TouchableOpacity style={styles.actionButton} onPress={() => handleReserveWishlistItem(item.id)}>
//           <Text style={styles.actionButtonText}>Зарезервировать</Text>
//         </TouchableOpacity>
//       )}
//     </View>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       {loading ? (
//         <Text style={styles.noItems}>Загрузка...</Text>
//       ) : !token || !userId ? (
//         <View style={styles.authMessageContainer}>
//           <Text style={styles.authMessage}>Пожалуйста, авторизуйтесь для просмотра деталей свадьбы</Text>
//         </View>
//       ) : (
//         <>
//           {/* Invitation Section */}
//           <View style={styles.invitationContainer}>
//             <Text style={styles.invitationTitle}>Приглашение на свадьбу</Text>
//             <Text style={styles.invitationText}>
//               Присоединяйтесь к празднованию свадьбы
//             </Text>
//             <Text style={styles.weddingName}>
//               {weddingDetails.name || 'Название свадьбы'}
//             </Text>
//             <Text style={styles.weddingDate}>
//               Дата: {weddingDetails.date || 'Не указана'}
//             </Text>
//             <Text style={styles.invitationFooter}>
//               Выберите подарок из списка ниже, чтобы порадовать молодоженов!
//             </Text>
//           </View>

//           {/* Wishlist Section */}
//           <FlatList
//             data={wishlistItems}
//             renderItem={renderWishlistItem}
//             keyExtractor={(item) => item.id.toString()}
//             ListEmptyComponent={<Text style={styles.noItems}>Подарков пока нет</Text>}
//             contentContainerStyle={{ paddingBottom: 20 }}
//           />
//         </>
//       )}
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: COLORS.background,
//     padding: 16,
//   },
//   invitationContainer: {
//     backgroundColor: COLORS.white,
//     borderRadius: 12,
//     padding: 20,
//     marginBottom: 20,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: COLORS.border,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.15,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   invitationTitle: {
//     fontSize: 24,
//     fontWeight: '700',
//     color: COLORS.primary,
//     textAlign: 'center',
//     marginBottom: 10,
//   },
//   invitationText: {
//     fontSize: 16,
//     color: COLORS.text,
//     textAlign: 'center',
//     marginBottom: 8,
//   },
//   weddingName: {
//     fontSize: 20,
//     fontWeight: '600',
//     color: COLORS.accent,
//     textAlign: 'center',
//     marginBottom: 8,
//   },
//   weddingDate: {
//     fontSize: 16,
//     color: COLORS.text,
//     textAlign: 'center',
//     marginBottom: 12,
//   },
//   invitationFooter: {
//     fontSize: 14,
//     color: COLORS.muted,
//     textAlign: 'center',
//     fontStyle: 'italic',
//   },
//   wishlistItemContainer: {
//     backgroundColor: COLORS.white,
//     borderRadius: 10,
//     padding: 12,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: COLORS.border,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 2,
//   },
//   itemText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: COLORS.text,
//     marginBottom: 6,
//   },
//   itemStatus: {
//     fontSize: 14,
//     color: COLORS.muted,
//     marginBottom: 8,
//   },
//   noItems: {
//     fontSize: 16,
//     color: COLORS.muted,
//     textAlign: 'center',
//     marginTop: 20,
//   },
//   actionButton: {
//     backgroundColor: COLORS.secondary,
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     borderRadius: 6,
//     alignSelf: 'flex-start',
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.2,
//     shadowRadius: 2,
//   },
//   actionButtonText: {
//     color: COLORS.white,
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   headerButton: {
//     padding: 10,
//   },
//   headerButtonText: {
//     fontSize: 16,
//     color: COLORS.primary,
//     fontWeight: '500',
//   },
//   authMessageContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   authMessage: {
//     fontSize: 18,
//     color: COLORS.error,
//     textAlign: 'center',
//     paddingHorizontal: 20,
//   },
// });










import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  Linking,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import api from '../api/api';

const COLORS = {
  primary: '#4A90E2',
  secondary: '#50C878',
  accent: '#FF6F61',
  background: '#F7F9FC',
  text: '#2D3748',
  muted: '#718096',
  white: '#FFFFFF',
  border: '#E2E8F0',
  error: '#E53E3E',
};

export default function WeddingWishlistScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const token = useSelector((state) => state.auth.token);
  const userId = useSelector((state) => state.auth.user?.id);

  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weddingDetails, setWeddingDetails] = useState({ name: '', date: '' });
  const weddingId = route.params?.id;

  console.log('USER=', userId);
  console.log('WeddingWishlistScreen Started | wishlist=', weddingId);

  // Vibration function
  const triggerVibration = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.error('Vibration error:', error);
    }
  };

  // Fetch wedding details and wishlist items
  const fetchWeddingAndWishlist = useCallback(async () => {
    if (!token || !userId) {
      Alert.alert('Ошибка', 'Пожалуйста, авторизуйтесь для просмотра деталей свадьбы');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Token:', token);
      const response = await api.getWeddingsById(weddingId, token);
      const wedding = response.data.data;
      console.log('api.getWeddingsById worked:', wedding);
      if (wedding) {
        setWeddingDetails({ name: wedding.name, date: wedding.date });
      } else {
        Alert.alert('Ошибка', 'Не удалось найти данные о свадьбе');
      }

      const wishlistResponse = await api.getWishlistByWeddingIdWithoutToken(weddingId);
      setWishlistItems(wishlistResponse.data.data || []);
    } catch (error) {
      console.error('Ошибка при загрузке данных:', error);
      if (error.response?.status === 403) {
        Alert.alert('Ошибка', 'У вас нет доступа к данным этой свадьбы', [
          { text: 'OK', onPress: () => navigation.navigate('Login') },
        ]);
      } else {
        Alert.alert('Ошибка', 'Не удалось загрузить данные свадьбы');
      }
    } finally {
      setLoading(false);
    }
  }, [weddingId, token, userId, navigation]);

  // Fetch data on mount
  useEffect(() => {
    if (weddingId) {
      fetchWeddingAndWishlist();
    } else {
      Alert.alert('Ошибка', 'Не удалось загрузить данные свадьбы');
      setLoading(false);
    }
  }, [weddingId, fetchWeddingAndWishlist]);

  // Handle deep links
  useEffect(() => {
    const handleDeepLink = ({ url }) => {
      console.log('Deep link received:', url);
      if (url) {
        const regex = /(?:wishlist\/)(\d+)/;
        const match = url.match(regex);
        if (match && match[1]) {
          const deepLinkWeddingId = match[1];
          console.log('Extracted weddingId from deep link:', deepLinkWeddingId);
          if (deepLinkWeddingId !== weddingId) {
            navigation.setParams({ id: deepLinkWeddingId });
          }
        }
      }
    };

    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => subscription.remove();
  }, [navigation, weddingId]);

  // Set up the header
  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: `Список подарков`,
      headerLeft: () => (
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => {
            triggerVibration();
            navigation.goBack();
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.headerButtonText}>Назад</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  // Fetch item details
  const handleViewDetails = async (goodId) => {
    triggerVibration();
    try {
      // const response = await api.get(`/api/goods/${goodId}`, {
      //   headers: { Authorization: `Bearer ${token}` },
      // });
      const response = await api.getGoodDetailsInfo(goodId);
     

      const itemDetails = response.data;

      console.log('weddingId= ',weddingId,'Item details:', itemDetails);
      Alert.alert(
        'Детали подарка',
        `Название: ${itemDetails.item_name || 'Не указано'}\n` +
        `Категория: ${itemDetails.category || 'Не указана'}\n` +
        `Описание: ${itemDetails.description || 'Нет описания'}\n` +
      `Адрес:${itemDetails.specs?.address || 'Нет описания'}\n` +
      `Телефон: ${itemDetails.specs?.phone || 'Нет описания'}\n` +
        `Цена: ${itemDetails.cost ? itemDetails.cost.toLocaleString() + ' ₸' : 'Не указана'}\n` +
        `Материал: ${itemDetails.specs?.material || 'Не указан'}\n` +
        `Количество: ${itemDetails.specs?.pieces || 'Не указано'}\n` +
        `Дата создания: ${new Date(itemDetails.created_at).toLocaleDateString() || 'Не указана'}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Ошибка при загрузке деталей подарка:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить детали подарка');
    }
  };

  const handleReserveWishlistItem = (wishlistId) => {
    triggerVibration();
    Alert.prompt(
      'Резервирование подарка',
      'Пожалуйста, введите ваше имя:',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Зарезервировать',
          onPress: async (name) => {
            if (!name || name.trim() === '') {
              Alert.alert('Ошибка', 'Имя не может быть пустым');
              return;
            }
            try {
              console.log('Зерезервировано без токена:', wishlistId, name);
              const data = { reserved_by_unknown: name.trim() };
              const response = await api.reserveWishlistItemWithoutToken(wishlistId, data);
              Alert.alert('Успех', 'Подарок зарезервирован');
              setWishlistItems(
                wishlistItems.map((item) =>
                  item.id === wishlistId
                    ? { ...item, is_reserved: true, reserved_by_unknown: name.trim() }
                    : item
                )
              );
            } catch (error) {
              console.error('Ошибка при резервировании подарка:', error);
              Alert.alert('Ошибка', error.response?.data?.error || 'Не удалось зарезервировать подарок');
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const renderWishlistItem = ({ item }) => (
    <View style={styles.wishlistItemContainer}>
      <Text style={styles.itemText}>{item.item_name}</Text>
      <Text style={styles.itemStatus}>
        {item.is_reserved
          ? `Зарезервировано${item.reserved_by_unknown ? ` пользователем: ${item.reserved_by_unknown}` : ''}`
          : 'Свободно'}
      </Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.detailsButton]}
          onPress={() => handleViewDetails(item.good_id)}
          activeOpacity={0.7}
        >
          <Text style={styles.actionButtonText}>Детали</Text>
        </TouchableOpacity>
        {!item.is_reserved && (
          <TouchableOpacity
            style={[styles.actionButton, styles.reserveButton]}
            onPress={() => handleReserveWishlistItem(item.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.actionButtonText}>Зарезервировать</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <Text style={styles.noItems}>Загрузка...</Text>
      ) : !token || !userId ? (
        <View style={styles.authMessageContainer}>
          <Text style={styles.authMessage}>Пожалуйста, авторизуйтесь для просмотра деталей свадьбы</Text>
        </View>
      ) : (
        <>
          <View style={styles.invitationContainer}>
            <Text style={styles.invitationTitle}>Приглашение на свадьбу</Text>
            <Text style={styles.invitationText}>Присоединяйтесь к празднованию свадьбы</Text>
            <Text style={styles.weddingName}>{weddingDetails.name || 'Название свадьбы'}</Text>
            <Text style={styles.weddingDate}>Дата: {weddingDetails.date || 'Не указана'}</Text>
            <Text style={styles.invitationFooter}>
              Выберите подарок из списка ниже, чтобы порадовать молодоженов!
            </Text>
          </View>
          <FlatList
            data={wishlistItems}
            renderItem={renderWishlistItem}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={<Text style={styles.noItems}>Подарков пока нет</Text>}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  invitationContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  invitationTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  invitationText: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  weddingName: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.accent,
    textAlign: 'center',
    marginBottom: 10,
  },
  weddingDate: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 14,
  },
  invitationFooter: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.muted,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  wishlistItemContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  itemStatus: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.muted,
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 12,
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  detailsButton: {
    backgroundColor: COLORS.primary,
  },
  reserveButton: {
    backgroundColor: COLORS.secondary,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  noItems: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.muted,
    textAlign: 'center',
    marginTop: 24,
  },
  headerButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  headerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  authMessageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  authMessage: {
    fontSize: 18,
    fontWeight: '500',
    color: COLORS.error,
    textAlign: 'center',
    lineHeight: 24,
  },
});