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

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import api from '../api/api';
import { SafeAreaView } from 'react-native-safe-area-context';

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

  // Fetch wedding details and wishlist items
  const fetchWeddingAndWishlist = async () => {
    if (!token || !userId) {
      Alert.alert('Ошибка', 'Пожалуйста, авторизуйтесь для просмотра деталей свадьбы');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await api.getWeddingsById(weddingId, token);
      const wedding = response.data.data;
      console.log('api.getWeddingsById cработал ', wedding);
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
        Alert.alert('Ошибка', 'У вас нет доступа к данным этой свадьбы');
      } else {
        Alert.alert('Ошибка', 'Не удалось загрузить данные свадьбы');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on mount
  useEffect(() => {
    if (weddingId) {
      fetchWeddingAndWishlist();
    } else {
      Alert.alert('Ошибка', 'Не удалось загрузить данные свадьбы');
      setLoading(false);
    }
  }, [weddingId, token, userId]);

  // Set up the header with navigation buttons
  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: `Список подарков`,
      headerLeft: () => (
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.headerButtonText}>Назад</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, weddingId]);

  const handleReserveWishlistItem = (wishlistId) => {
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
      {!item.is_reserved && (
        <TouchableOpacity style={styles.actionButton} onPress={() => handleReserveWishlistItem(item.id)}>
          <Text style={styles.actionButtonText}>Зарезервировать</Text>
        </TouchableOpacity>
      )}
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
          {/* Invitation Section */}
          <View style={styles.invitationContainer}>
            <Text style={styles.invitationTitle}>Приглашение на свадьбу</Text>
            <Text style={styles.invitationText}>
              Присоединяйтесь к празднованию свадьбы
            </Text>
            <Text style={styles.weddingName}>
              {weddingDetails.name || 'Название свадьбы'}
            </Text>
            <Text style={styles.weddingDate}>
              Дата: {weddingDetails.date || 'Не указана'}
            </Text>
            <Text style={styles.invitationFooter}>
              Выберите подарок из списка ниже, чтобы порадовать молодоженов!
            </Text>
          </View>

          {/* Wishlist Section */}
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
    padding: 16,
  },
  invitationContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  invitationTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 10,
  },
  invitationText: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  weddingName: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.accent,
    textAlign: 'center',
    marginBottom: 8,
  },
  weddingDate: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  invitationFooter: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  wishlistItemContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  itemStatus: {
    fontSize: 14,
    color: COLORS.muted,
    marginBottom: 8,
  },
  noItems: {
    fontSize: 16,
    color: COLORS.muted,
    textAlign: 'center',
    marginTop: 20,
  },
  actionButton: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
  },
  headerButton: {
    padding: 10,
  },
  headerButtonText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '500',
  },
  authMessageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authMessage: {
    fontSize: 18,
    color: COLORS.error,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});