import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  FlatList,
  Modal,
  Alert,
  TouchableOpacity,
  Share,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import Video from 'react-native-video';
import * as Linking from 'expo-linking';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import api from '../api/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';

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
  shadow: '#0000001A',
};

export default function Item3Screen() {
  const route = useRoute();
  const navigation = useNavigation();
  const selectedItems = route.params?.data || [];
  const userId = useSelector((state) => state.auth.user?.id);
  const token = useSelector((state) => state.auth.token);
  const [weddingItems, setWeddingItems] = useState([]);
  const [weddings, setWeddings] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [wishlistModalVisible, setWishlistModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [wishlistViewModalVisible, setWishlistViewModalVisible] = useState(false);
  const [weddingName, setWeddingName] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedWedding, setSelectedWedding] = useState(null);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [goods, setGoods] = useState([]);
  const [selectedGoodId, setSelectedGoodId] = useState('');
  const [wishlistFiles, setWishlistFiles] = useState({});
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [errorFiles, setErrorFiles] = useState(null);
  const [loadingWeddings, setLoadingWeddings] = useState(true);
  const [formData, setFormData] = useState({ category: '', item_name: '' });
  const [isCustomGift, setIsCustomGift] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [hasShownNoWeddingsAlert, setHasShownNoWeddingsAlert] = useState(false);
  const [activeWeddingId, setActiveWeddingId] = useState(null);
  const BASE_URL = process.env.EXPO_PUBLIC_API_baseURL;

  // Получение списка свадеб
  const fetchWeddings = async () => {
    console.log('Fetching weddings with id=', userId, 'token=', token);
    setLoadingWeddings(true);
    try {
      const response = await api.getWedding(token);
      console.log('API response for weddings:', response.data);
      const weddingData = response.data.data || [];
      setWeddings(weddingData);
      return weddingData;
    } catch (error) {
      console.error('Error fetching weddings:', error);
      Alert.alert('Error', 'Failed to load weddings');
      setWeddings([]);
      return [];
    } finally {
      setLoadingWeddings(false);
    }
  };

  // Получение элементов свадьбы
  const fetchWeddingItems = async (weddingId) => {
    if (!weddingId) {
      console.log('No weddingId provided, skipping fetchWeddingItems');
      setWeddingItems([]);
      return;
    }

    try {
      const response = await api.getWeddingItems(weddingId, token);
      console.log('API response for wedding items:', response.data);

      if (!response.data.success && response.data.error === 'Свадьба не создана') {
        Alert.alert(
          'Информация',
          'Свадьба не найдена. Пожалуйста, создайте свадьбу.',
          [
            { text: 'Отмена', style: 'cancel' },
            { text: 'Создать', onPress: () => setModalVisible(true) },
          ]
        );
        setWeddingItems([]);
        return;
      }

      if (response.data.message === 'Элементы свадьбы не найдены') {
        Alert.alert('Информация', 'Элементы свадьбы не найдены. Добавьте элементы в вашу свадьбу.');
        setWeddingItems([]);
        return;
      }

      setWeddingItems(response.data.data || []);
    } catch (error) {
      console.error('Error fetching wedding items:', error);
      let errorMessage = 'Не удалось загрузить элементы свадьбы';
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = 'Свадьба не найдена или элементы недоступны.';
          Alert.alert(
            'Ошибка',
            errorMessage,
            [
              { text: 'Отмена', style: 'cancel' },
              { text: 'Создать свадьбу', onPress: () => setModalVisible(true) },
            ]
          );
        } else if (error.response.status === 403) {
          errorMessage = 'Доступ запрещён. Проверьте ваши учетные данные.';
          Alert.alert('Ошибка', errorMessage);
        } else if (error.response.status === 400) {
          errorMessage = 'Недействительный запрос. Проверьте данные свадьбы.';
          Alert.alert('Ошибка', errorMessage);
        } else {
          errorMessage = error.response.data?.error || 'Ошибка сервера';
          Alert.alert('Ошибка', errorMessage);
        }
      } else if (error.request) {
        errorMessage = 'Ошибка сети. Проверьте подключение к интернету.';
        Alert.alert('Ошибка', errorMessage);
      } else {
        errorMessage = error.message;
        Alert.alert('Ошибка', errorMessage);
      }
      setWeddingItems([]);
    }
  };

  // Получение товаров
  const fetchGoods = async () => {
    try {
      const response = await api.getGoods(token);
      setGoods(response.data || []);
    } catch (error) {
      console.error('Error fetching goods:', error);
      Alert.alert('Error', 'Failed to load goods');
    }
  };

  // Инициализация при монтировании компонента
  useEffect(() => {
    const initialize = async () => {
      const weddingData = await fetchWeddings();
      await fetchGoods();
      if (weddingData.length > 0) {
        const weddingId = weddingData[0].id;
        setActiveWeddingId(weddingId);
        await fetchWeddingItems(weddingId);
      } else {
        setWeddingItems([]);
      }
    };
    initialize();
  }, []); // Пустой массив зависимостей — выполняется только при монтировании

  // Обновление данных при фокусе экрана
  useFocusEffect(
    useCallback(() => {
      const refresh = async () => {
        const weddingData = await fetchWeddings();
        if (weddingData.length > 0) {
          const weddingId = activeWeddingId || weddingData[0].id;
          setActiveWeddingId(weddingId);
          await fetchWeddingItems(weddingId);
        } else {
          setWeddingItems([]);
        }
      };
      refresh();
    }, []) // Пустой массив зависимостей — выполняется при фокусе
  );

  // Проверка, нужно ли показать модал создания свадьбы
  useEffect(() => {
    console.log('Checking weddings:', weddings, 'loadingWeddings:', loadingWeddings);
    if (!loadingWeddings && weddings.length === 0 && !hasShownNoWeddingsAlert) {
      setModalVisible(true);
      setHasShownNoWeddingsAlert(true);
    }
  }, [loadingWeddings, hasShownNoWeddingsAlert]);

  // Получение файлов для товара
  const fetchFiles = async (goodId) => {
    console.log('Starting fetchFiles for good_id:', goodId);
    setLoadingFiles(true);
    setErrorFiles(null);
    try {
      const response = await axios.get(`${BASE_URL}/api/goods/${goodId}/files`);
      console.log('Files response:', response.data);
      return response.data;
    } catch (err) {
      console.error('Error fetching files:', err);
      setErrorFiles('Error loading files: ' + err.message);
      return [];
    } finally {
      setLoadingFiles(false);
    }
  };

  // Создание свадьбы
  const handleCreateWedding = async () => {
    if (!weddingName || !weddingDate) {
      Alert.alert('Error', 'Please fill in the wedding name and date');
      return;
    }

    const weddingData = {
      name: weddingName,
      date: weddingDate,
      items: selectedItems.map((item) => ({
        id: item.id,
        type: item.type,
        totalCost: item.totalCost || 0,
      })),
    };

    try {
      const response = await api.createWedding(weddingData, token);
      const newWedding = response.data.data;
      Alert.alert('Success', 'Wedding created successfully');
      setWeddings((prev) => [...prev, newWedding]);
      setModalVisible(false);
      setWeddingName('');
      setWeddingDate('');
      setHasShownNoWeddingsAlert(false);
      setActiveWeddingId(newWedding.id);
      await fetchWeddingItems(newWedding.id);
    } catch (error) {
      console.error('Error creating wedding:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to create wedding');
    }
  };

  // Обновление свадьбы
  const handleUpdateWedding = async () => {
    if (!selectedWedding || !weddingName || !weddingDate) {
      Alert.alert('Error', 'Please fill in the wedding name and date');
      return;
    }
    console.log('Updating wedding:', selectedWedding.id, token, weddingDate, weddingName);

    try {
      const data = {
        name: weddingName,
        date: weddingDate,
      };
      
      const response = await api.updateWedding(selectedWedding.id, token, data);
      
      Alert.alert('Success', 'Wedding updated successfully');
      setWeddings((prev) =>
        prev.map((w) => (w.id === selectedWedding.id ? response.data.data : w))
      );
      setEditModalVisible(false);
      setWeddingName('');
      setWeddingDate('');
      setSelectedWedding(null);
    } catch (error) {
      console.error('Error updating wedding:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to update wedding');
    }
  };

  // Удаление свадьбы
  const handleDeleteWedding = async (id) => {
    Alert.alert(
      'Confirmation',
      'Are you sure you want to delete this wedding?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await api.deleteWedding(id, token);
              setWeddings((prev) => prev.filter((w) => w.id !== id));
              Alert.alert('Success', 'Wedding deleted successfully');
              if (weddings.length === 1) {
                setHasShownNoWeddingsAlert(false);
                setModalVisible(true);
              }
              if (activeWeddingId === id) {
                const newWeddingId = weddings.find((w) => w.id !== id)?.id || null;
                setActiveWeddingId(newWeddingId);
                await fetchWeddingItems(newWeddingId);
              }
            } catch (error) {
              console.error('Error deleting wedding:', error);
              Alert.alert('Error', 'Failed to delete wedding');
            }
          },
        },
      ]
    );
  };

  // Удаление элемента свадьбы
  const handleDeleteWeddingItem = async (weddingItemId) => {
    console.log('handleDeleteWeddingItem started', weddingItemId);
    Alert.alert(
      'Confirmation',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              const weddingItem = weddingItems.find((item) => item.id === weddingItemId);
              const weddingId = weddingItem?.wedding_id;
              if (!weddingId) {
                throw new Error('Wedding ID not found for the item');
              }

              await api.deleteWeddingItem(weddingItemId, token);
              await fetchWeddingItems(weddingId);
              Alert.alert('Success', 'Item deleted successfully');
            } catch (error) {
              console.error('Error deleting wedding item:', error);
              Alert.alert('Error', 'Failed to delete item: ' + error.message);
            }
          },
        },
      ]
    );
  };

  // Добавление подарка в вишлист
  const handleAddWishlistItem = async () => {
    if (!selectedGoodId) {
      Alert.alert('Error', 'Please select a gift from the list');
      return;
    }

    const wishlistData = {
      wedding_id: selectedWedding.id,
      good_id: selectedGoodId,
    };

    try {
      const response = await api.createWish(wishlistData, token);
      Alert.alert('Success', 'Gift added successfully');
      setWishlistModalVisible(false);
      setSelectedGoodId('');
      const weddingData = await fetchWeddings();
      if (weddingData.length > 0) {
        const weddingId = activeWeddingId || weddingData[0].id;
        setActiveWeddingId(weddingId);
        await fetchWeddingItems(weddingId);
      }
    } catch (error) {
      console.error('Error adding gift:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to add gift');
    }
  };

  // Добавление кастомного подарка
  const handleAddCustomGift = async () => {
    try {
      if (!formData.item_name) {
        Alert.alert('Error', 'Please fill in the item name');
        return;
      }

      const giftData = {
        category: 'Miscellaneous',
        item_name: formData.item_name,
        cost: '0',
        supplier_id: userId,
      };

      const response = await api.postGoodsData(giftData);
      const newGood = response.data.data;

      console.log('add custom gift= ', newGood);
      const wishlistData = {
        wedding_id: selectedWedding.id,
        good_id: newGood.id,
      };

      await api.createWish(wishlistData, token);

      Alert.alert('Success', 'Custom gift added successfully!');
      setFormData({ category: '', item_name: '' });
      setWishlistModalVisible(false);
      await fetchWishlistItems(selectedWedding.id);
    } catch (error) {
      console.error('Error adding custom gift:', error);
      Alert.alert('Error', 'Failed to add custom gift');
    }
  };

  // Получение вишлиста
  const fetchWishlistItems = async (weddingId) => {
    try {
      const response = await api.getWishlistByWeddingId(weddingId, token);
      const items = response.data.data;
      setWishlistItems(items);

      const filesPromises = items
        .filter((item) => item.good_id)
        .map((item) =>
          fetchFiles(item.good_id).then((files) => ({
            goodId: item.good_id,
            files,
          }))
        );
      const filesResults = await Promise.all(filesPromises);
      const newWishlistFiles = filesResults.reduce((acc, { goodId, files }) => {
        acc[goodId] = files;
        return acc;
      }, {});
      setWishlistFiles((prev) => ({ ...prev, ...newWishlistFiles }));

      setWishlistViewModalVisible(true);
    } catch (error) {
      console.error('Error fetching wishlist items:', error);
      Alert.alert('Error', 'Failed to load wishlist items');
    }
  };

  // Резервирование подарка
  const handleReserveWishlistItem = async (wishlistId) => {
    Alert.alert(
      'Confirmation',
      'Do you want to reserve this gift?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reserve',
          onPress: async () => {
            try {
              const response = await api.reserveWishlistItem(wishlistId, token);
              Alert.alert('Success', 'Gift reserved successfully');
              setWishlistItems((prev) =>
                prev.map((item) =>
                  item.id === wishlistId ? response.data.data : item
                )
              );
            } catch (error) {
              console.error('Error reserving gift:', error);
              Alert.alert('Error', error.response?.data?.error || 'Failed to reserve gift');
            }
          },
        },
      ]
    );
  };

  // Обработка диплинков
  useEffect(() => {
    const handleDeepLink = async () => {
      const initialUrl = await Linking.getInitialURL();
      console.log('Initial URL:', initialUrl);
      if (initialUrl) {
        const { path, queryParams } = Linking.parse(initialUrl);
        console.log('Parsed path:', path, 'Params:', queryParams);
      }

      const subscription = Linking.addEventListener('url', ({ url }) => {
        console.log('Received URL:', url);
        const { path, queryParams } = Linking.parse(url);
        console.log('Parsed path:', path, 'Params:', queryParams);
      });

      return () => subscription.remove();
    };

    handleDeepLink();
  }, []);

  // Поделиться ссылкой на свадьбу
  const handleShareWeddingLink = async (weddingId) => {
    console.log('handleShareWeddingLink started with weddingId:', weddingId);
    try {
      const appLink = Linking.createURL(`wishlist/${weddingId}`);
      const webLink = `${process.env.EXPO_PUBLIC_API_baseURL}/api/weddingwishes/${weddingId}`;

      console.log('appLink:', appLink);
      console.log('webLink:', webLink);

      const message = webLink;

      const result = await Share.share({
        message,
        title: 'Wedding Invitation',
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('Shared via:', result.activityType);
        } else {
          console.log('Shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dismissed');
      }
    } catch (error) {
      console.error('Error in handleShareWeddingLink:', error.message, error.stack);
      Alert.alert('Error', 'Failed to share link: ' + error.message);
    }
  };

  // Открытие модала редактирования
  const openEditModal = (wedding) => {
    setSelectedWedding(wedding);
    setWeddingName(wedding.name);
    setWeddingDate(wedding.date);
    setEditModalVisible(true);
  };

  // Обработка выбора даты
  const onDateChange = (day) => {
    setWeddingDate(day.dateString);
    setShowCalendar(false);
  };

  // Получение деталей элемента
  const fetchItemDetails = async (itemType, itemId) => {
    setLoadingDetails(true);
    try {
      let endpoint;
      switch (itemType) {
        case 'restaurant':
          endpoint = `/api/restaurantbyid/${itemId}`;
          break;
        case 'clothing':
          endpoint = `/api/clothing/${itemId}`;
          break;
        case 'tamada':
          endpoint = `/api/tamada/${itemId}`;
          break;
        case 'program':
          endpoint = `/api/programs/${itemId}`;
          break;
        case 'traditionalGift':
          endpoint = `/api/traditional-gifts/${itemId}`;
          break;
        case 'flowers':
          endpoint = `/api/flowers/${itemId}`;
          break;
        case 'cake':
          endpoint = `/api/cakes/${itemId}`;
          break;
        case 'alcohol':
          endpoint = `/api/alcohol/${itemId}`;
          break;
        case 'transport':
          endpoint = `/api/transport/${itemId}`;
          break;
        case 'goods':
          endpoint = `/api/goods/${itemId}`;
          break;
        case 'jewelry':
          endpoint = `/api/jewelry/${itemId}`;
          break;
        default:
          throw new Error('Unknown item type');
      }

      const response = await api.fetchByEndpoint(endpoint);

      const details = Array.isArray(response.data) ? response.data[0] : response.data;
      console.log('Details:', details);
      return details || null;
    } catch (error) {
      console.error(`Error fetching details for ${itemType}:`, error);
      Alert.alert('Error', 'Failed to load item details');
      return null;
    } finally {
      setLoadingDetails(false);
    }
  };

  // Открытие модала с деталями
  const openDetailsModal = async (weddingItem) => {
    console.log('Details button pressed', weddingItem);
    const details = await fetchItemDetails(weddingItem.item_type, weddingItem.item_id);
    console.log('Details:', details);
    if (details) {
      setSelectedItem({ ...weddingItem, ...details });
    } else {
      setSelectedItem(weddingItem);
    }
    setDetailsModalVisible(true);
  };

  // Группировка элементов по категориям
  const groupItemsByCategory = (items) => {
    const categoryMap = {
      restaurant: 'Рестораны',
      clothing: 'Одежда',
      tamada: 'Тамада',
      program: 'Программы',
      traditionalGift: 'Традиционные подарки',
      flowers: 'Цветы',
      cake: 'Торты',
      alcohol: 'Алкоголь',
      transport: 'Транспорт',
      goods: 'Товары',
      jewelry: 'Ювелирные изделия',
    };

    const grouped = items.reduce((acc, item) => {
      const category = item.item_type;
      if (!acc[category]) {
        acc[category] = { name: categoryMap[category] || category, items: [] };
      }
      acc[category].items.push(item);
      return acc;
    }, {});

    return Object.values(grouped).sort((a, b) => a.name.localeCompare(b.name));
  };

  // Рендеринг элемента свадьбы
  const renderWeddingItem = ({ item }) => {
    const filteredItems = weddingItems.filter((wi) => wi.wedding_id === item.id);
    console.log('Rendering wedding:', item.id, 'Filtered items:', filteredItems);
    const groupedItems = groupItemsByCategory(filteredItems);

    return (
      <View style={styles.itemContainer}>
        <Text style={styles.itemText}>
          {item.name} ({item.date})
        </Text>
        {groupedItems.length > 0 ? (
          <View style={styles.weddingItemsContainer}>
            {groupedItems.map((category) => (
              <View key={category.name} style={styles.categorySection}>
                <Text style={styles.categoryTitle}>{category.name}</Text>
                {category.items.map((weddingItem) => (
                  <View
                    key={`${weddingItem.item_type}-${weddingItem.id}`}
                    style={styles.weddingItem}
                  >
                    <Text style={styles.subItemText}>
                      {(() => {
                        switch (weddingItem.item_type) {
                          case 'restaurant':
                            return `Ресторан - ${weddingItem.total_cost} тг`;
                          case 'clothing':
                            return `Одежда - ${weddingItem.total_cost} тг`;
                          case 'tamada':
                            return `Тамада - ${weddingItem.total_cost} тг`;
                          case 'program':
                            return `Программа - ${weddingItem.total_cost} тг`;
                          case 'traditionalGift':
                            return `Традиционный подарок - ${weddingItem.total_cost} тг`;
                          case 'flowers':
                            return `Цветы - ${weddingItem.total_cost} тг`;
                          case 'cake':
                            return `Торт - ${weddingItem.total_cost} тг`;
                          case 'alcohol':
                            return `Алкоголь - ${weddingItem.total_cost} тг`;
                          case 'transport':
                            return `Транспорт - ${weddingItem.total_cost} тг`;
                          case 'goods':
                            return `Товар - ${weddingItem.total_cost} тг`;
                          case 'jewelry':
                            return `Ювелирные изделия - ${weddingItem.total_cost} тг`;
                          default:
                            return `Неизвестный элемент - ${weddingItem.total_cost} тг`;
                        }
                      })()}
                    </Text>
                    <View style={styles.itemActions}>
                      <TouchableOpacity
                        style={styles.detailsButton}
                        onPress={() => openDetailsModal(weddingItem)}
                      >
                        <Text style={styles.detailsButtonText}>Подробнее</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteWeddingItem(weddingItem.id)}
                      >
                        <Text style={styles.deleteButtonText}>Удалить</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyItemsContainer}>
            <Text style={styles.noItems}>Нет элементов для этой свадьбы</Text>
            <TouchableOpacity
              style={styles.addItemsButton}
              onPress={() => {
                navigation.navigate('AddWeddingItemsScreen', { weddingId: item.id });
              }}
            >
              <Text style={styles.addItemsButtonText}>Добавить элементы</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.actionButtonPrimary}
            onPress={() => openEditModal(item)}
          >
            <Text style={styles.actionButtonText}>Редактировать</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButtonSecondary}
            onPress={() => {
              setSelectedWedding(item);
              setWishlistModalVisible(true);
            }}
          >
            <Text style={styles.actionButtonText}>Добавить подарок</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.buttonRow, { marginTop: 8 }]}>
          <TouchableOpacity
            style={styles.actionButtonSecondary}
            onPress={() => {
              setSelectedWedding(item);
              fetchWishlistItems(item.id);
            }}
          >
            <Text style={styles.actionButtonText}>Просмотреть подарки</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButtonAccent}
            onPress={() => {
              console.log('Share button pressed for weddingId:', item.id);
              handleShareWeddingLink(item.id);
            }}
          >
            <Text style={styles.actionButtonText}>Поделиться</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButtonError}
            onPress={() => handleDeleteWedding(item.id)}
          >
            <Text style={styles.actionButtonText}>Удалить</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Рендеринг файлов
  const renderFileItem = ({ item: file }) => {
    const fileUrl = `${BASE_URL}/${file.path}`;
    console.log('fileUrl', fileUrl);

    if (file.mimetype.startsWith('image/')) {
      return (
        <View style={styles.card}>
          <TouchableOpacity>
            <Image source={{ uri: fileUrl }} style={styles.media} resizeMode="cover" />
          </TouchableOpacity>
        </View>
      );
    } else if (file.mimetype === 'video/mp4') {
      return (
        <View style={styles.card}>
          <Video
            source={{ uri: fileUrl }}
            style={styles.video}
            useNativeControls
            resizeMode="contain"
            isLooping
          />
          <Text style={styles.caption}>{file.name}</Text>
        </View>
      );
    } else {
      return (
        <View style={styles.card}>
          <Text style={styles.detail}>Неподдерживаемый формат: {file.mimetype}</Text>
        </View>
      );
    }
  };

  // Рендеринг элемента вишлиста
  const renderWishlistItem = ({ item }) => {
    console.log('ITEMS=====', item);
    const files = wishlistFiles[item.good_id] || [];

    return (
      <View style={styles.wishlistCard}>
        <ScrollView contentContainerStyle={styles.wishlistCardContent}>
          <Text
            style={[
              styles.wishlistTitle,
              item.is_reserved && styles.strikethroughText,
            ]}
          >
            {item.item_name}
          </Text>
          <Text style={styles.wishlistStatus}>
            {item.is_reserved
              ? `Кто подарит: ${item.Reserver?.username || item.reserved_by_unknown}`
              : 'Свободно'}
          </Text>
          <View style={styles.mediaSection}>
            {loadingFiles ? (
              <ActivityIndicator size="small" color={COLORS.primary} style={styles.loader} />
            ) : errorFiles ? (
              <Text style={styles.errorText}>{errorFiles}</Text>
            ) : files.length > 0 ? (
              <FlatList
                data={files}
                renderItem={renderFileItem}
                keyExtractor={(file) => file.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.mediaList}
              />
            ) : (
              <Text style={styles.noFilesText}>Файлы отсутствуют</Text>
            )}
          </View>
        </ScrollView>
      </View>
    );
  };

  // Рендеринг карточки товара
  const renderGoodCard = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.goodCard,
        selectedGoodId === item.id && styles.selectedGoodCard,
      ]}
      onPress={() => setSelectedGoodId(item.id)}
    >
      <Text style={styles.goodCardTitle}>{item.item_name}</Text>
      <Text style={styles.goodCardCategory}>Категория: {item.category}</Text>
      <Text style={styles.goodCardCost}>
        {item.cost ? `Цена: ${item.cost}` : 'Цена не указана'}
      </Text>
      {item.description && (
        <Text style={styles.goodCardDescription}>{item.description}</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Мои мероприятия</Text>
      {loadingWeddings ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={weddings}
          renderItem={renderWeddingItem}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.noItems}>Вы ещё не создали мероприятия</Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      {/* <Modal visible={modalVisible} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <Text style={styles.subtitle}>Создание свадьбы</Text>
          <TextInput
            autoComplete="off"
            style={styles.input}
            placeholder="Название свадьбы"
            placeholderTextColor={COLORS.muted}
            value={weddingName}
            onChangeText={setWeddingName}
          />
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowCalendar(true)}
          >
            <Text style={styles.dateButtonText}>
              {weddingDate || 'Выберите дату свадьбы'}
            </Text>
          </TouchableOpacity>
          {showCalendar && (
            <Calendar
              current={weddingDate || new Date().toISOString().split('T')[0]}
              onDayPress={onDateChange}
              minDate={new Date().toISOString().split('T')[0]}
              markedDates={{
                [weddingDate]: {
                  selected: true,
                  selectedColor: COLORS.primary,
                },
              }}
              theme={{
                selectedDayBackgroundColor: COLORS.primary,
                todayTextColor: COLORS.accent,
                arrowColor: COLORS.primary,
              }}
            />
          )}
          <View style={styles.buttonRowModal}>
            <Button
              title="Создать"
              onPress={handleCreateWedding}
              color={COLORS.primary}
            />
            <Button
              title="Отмена"
              onPress={() => {
                setModalVisible(false);
                setShowCalendar(false);
              }}
              color={COLORS.muted}
            />
          </View>
        </SafeAreaView>
      </Modal> */}

      <Modal visible={editModalVisible} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <Text style={styles.subtitle}>Редактирование свадьбы</Text>
          <TextInput
            autoComplete="off"
            style={styles.input}
            placeholder="Название свадьбы"
            placeholderTextColor={COLORS.muted}
            value={weddingName}
            onChangeText={setWeddingName}
          />
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowCalendar(true)}
          >
            <Text style={styles.dateButtonText}>
              {weddingDate || 'Выберите дату свадьбы'}
            </Text>
          </TouchableOpacity>
          {showCalendar && (
            <Calendar
              current={weddingDate || new Date().toISOString().split('T')[0]}
              onDayPress={onDateChange}
              minDate={new Date().toISOString().split('T')[0]}
              markedDates={{
                [weddingDate]: {
                  selected: true,
                  selectedColor: COLORS.primary,
                },
              }}
              theme={{
                selectedDayBackgroundColor: COLORS.primary,
                todayTextColor: COLORS.accent,
                arrowColor: COLORS.primary,
              }}
            />
          )}
          <View style={styles.buttonRowModal}>
            <Button
              title="Сохранить"
              onPress={handleUpdateWedding}
              color={COLORS.primary}
            />
            <Button
              title="Отмена"
              onPress={() => {
                setEditModalVisible(false);
                setShowCalendar(false);
              }}
              color={COLORS.muted}
            />
          </View>
        </SafeAreaView>
      </Modal>

      <Modal visible={wishlistModalVisible} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <Text style={styles.subtitle}>
            {isCustomGift ? 'Добавить свой подарок' : 'Добавить подарок'}
          </Text>
          {isCustomGift ? (
            <>
              <TextInput
                style={styles.input}
                placeholder="Название подарка"
                placeholderTextColor={COLORS.muted}
                value={formData.item_name}
                onChangeText={(text) => setFormData({ ...formData, item_name: text })}
              />
              <Text style={styles.infoText}>Категория: Прочее</Text>
            </>
          ) : (
            <FlatList
              data={goods}
              renderItem={renderGoodCard}
              keyExtractor={(item) => item.id.toString()}
              ListEmptyComponent={<Text style={styles.noItems}>Товаров пока нет</Text>}
              contentContainerStyle={styles.goodList}
            />
          )}
          <View style={styles.buttonRowModal}>
            {isCustomGift ? (
              <>
                <Button
                  title="Сохранить"
                  onPress={handleAddCustomGift}
                  color={COLORS.primary}
                />
                <Button
                  title="Назад"
                  onPress={() => setIsCustomGift(false)}
                  color={COLORS.muted}
                />
              </>
            ) : (
              <>
                <Button
                  title="Добавить"
                  onPress={handleAddWishlistItem}
                  color={COLORS.primary}
                  disabled={!selectedGoodId}
                />
                <Button
                  title="Добавить свой подарок"
                  onPress={() => setIsCustomGift(true)}
                  color={COLORS.secondary}
                />
              </>
            )}
            <Button
              title="Отмена"
              onPress={() => {
                setWishlistModalVisible(false);
                setIsCustomGift(false);
                setSelectedGoodId('');
              }}
              color={COLORS.muted}
            />
          </View>
        </SafeAreaView>
      </Modal>

      <Modal visible={wishlistViewModalVisible} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <Text style={styles.subtitle}>
            Подарки для свадьбы: {selectedWedding?.name}
          </Text>
          <FlatList
            data={wishlistItems}
            renderItem={renderWishlistItem}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            ListEmptyComponent={<Text style={styles.noItems}>Подарков пока нет</Text>}
            columnWrapperStyle={styles.columnWrapper}
          />
          <View style={styles.buttonRowModal}>
            <Button
              title="Закрыть"
              onPress={() => setWishlistViewModalVisible(false)}
              color={COLORS.muted}
            />
          </View>
        </SafeAreaView>
      </Modal>

      <Modal visible={detailsModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Детали элемента</Text>
            {loadingDetails ? (
              <ActivityIndicator size="large" color={COLORS.primary} />
            ) : selectedItem ? (
              <ScrollView style={{ width: '100%' }}>
                <Text style={styles.modalText}>ID: {selectedItem.id}</Text>
                <Text style={styles.modalText}>Тип: {selectedItem.item_type}</Text>
                <Text style={styles.modalText}>
                  Наименование:{' '}
                  {selectedItem.name ||
                    selectedItem.alcoholName ||
                    selectedItem.itemName ||
                    selectedItem.teamName ||
                    selectedItem.flowerName ||
                    selectedItem.carName ||
                    'N/A'}
                </Text>
                <Text style={styles.modalText}>
                  Стоимость: {selectedItem.total_cost} тг
                </Text>
                <Text style={styles.modalText}>
                  Создан: {new Date(selectedItem.created_at).toLocaleString()}
                </Text>
                <Text style={styles.modalText}>
                  Обновлен: {new Date(selectedItem.updated_at).toLocaleString()}
                </Text>
                {selectedItem.address && (
                  <Text style={styles.modalText}>Адрес: {selectedItem.address}</Text>
                )}
                {selectedItem.phone && (
                  <Text style={styles.modalText}>Телефон: {selectedItem.phone}</Text>
                )}
                {selectedItem.cuisine && (
                  <Text style={styles.modalText}>Кухня: {selectedItem.cuisine}</Text>
                )}
                {selectedItem.capacity && (
                  <Text style={styles.modalText}>
                    Вместимость: {selectedItem.capacity}
                  </Text>
                )}
                {selectedItem.averageCost && (
                  <Text style={styles.modalText}>
                    Средний чек: {selectedItem.averageCost} тг
                  </Text>
                )}
                {selectedItem.brand && (
                  <Text style={styles.modalText}>Бренд: {selectedItem.brand}</Text>
                )}
                {selectedItem.gender && (
                  <Text style={styles.modalText}>Пол: {selectedItem.gender}</Text>
                )}
                {selectedItem.portfolio && (
                  <Text style={styles.modalText}>
                    Портфолио: {selectedItem.portfolio}
                  </Text>
                )}
                {selectedItem.category && (
                  <Text style={styles.modalText}>
                    Категория: {selectedItem.category}
                  </Text>
                )}
                {selectedItem.flowerType && (
                  <Text style={styles.modalText}>
                    Тип цветка: {selectedItem.flowerType}
                  </Text>
                )}
                {selectedItem.cakeType && (
                  <Text style={styles.modalText}>
                    Тип торта: {selectedItem.cakeType}
                  </Text>
                )}
                {selectedItem.material && (
                  <Text style={styles.modalText}>
                    Материал: {selectedItem.material}
                  </Text>
                )}
              </ScrollView>
            ) : (
              <Text style={styles.modalText}>Данные недоступны</Text>
            )}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setDetailsModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Закрыть</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 0.3,
  },
  createButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignSelf: 'center',
    marginBottom: 16,
    elevation: 3,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  createButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: COLORS.white,
    color: COLORS.text,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoText: {
    fontSize: 16,
    color: COLORS.muted,
    marginBottom: 15,
    textAlign: 'center',
  },
  dateButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dateButtonText: {
    fontSize: 16,
    color: COLORS.text,
  },
  itemContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 4,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  itemText: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  weddingItemsContainer: {
    marginBottom: 12,
  },
  categorySection: {
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
    paddingBottom: 4,
  },
  weddingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  subItemText: {
    fontSize: 16,
    color: COLORS.text,
    flex: 1,
    marginRight: 12,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailsButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  detailsButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: COLORS.error,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  deleteButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  buttonRowModal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    width: '100%',
  },
  actionButtonPrimary: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexGrow: 1,
    margin: 4,
    alignItems: 'center',
    minWidth: 100,
    elevation: 3,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  actionButtonSecondary: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexGrow: 1,
    margin: 4,
    alignItems: 'center',
    minWidth: 100,
    elevation: 3,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  actionButtonAccent: {
    backgroundColor: COLORS.accent,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexGrow: 1,
    margin: 4,
    alignItems: 'center',
    minWidth: 100,
    elevation: 3,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  actionButtonError: {
    backgroundColor: COLORS.error,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexGrow: 1,
    margin: 4,
    alignItems: 'center',
    minWidth: 100,
    elevation: 3,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  noItems: {
    fontSize: 18,
    color: COLORS.muted,
    textAlign: 'center',
    marginVertical: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyItemsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  addItemsButton: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
    elevation: 3,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  addItemsButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  modalText: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 10,
    textAlign: 'left',
    width: '100%',
  },
  closeButton: {
    backgroundColor: COLORS.muted,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 20,
    elevation: 3,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  closeButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  goodList: {
    paddingBottom: 20,
    width: '100%',
  },
  goodCard: {
    padding: 12,
    marginVertical: 8,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedGoodCard: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    backgroundColor: '#E6F0FA',
  },
  goodCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  goodCardCategory: {
    fontSize: 14,
    color: COLORS.muted,
    marginTop: 4,
  },
  goodCardCost: {
    fontSize: 14,
    color: COLORS.muted,
    marginTop: 4,
  },
  goodCardDescription: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 6,
  },
  mediaSection: {
    marginTop: 12,
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaList: {
    paddingVertical: 8,
  },
  card: {
    width: 150,
    height: 150,
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  media: {
    width: '100%',
    height: '100%',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  caption: {
    fontSize: 12,
    color: COLORS.muted,
    position: 'absolute',
    bottom: 4,
    left: 4,
    right: 4,
    textAlign: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingVertical: 2,
  },
  loader: {
    marginVertical: 20,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    textAlign: 'center',
    marginVertical: 12,
  },
  noFilesText: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
    marginVertical: 12,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  wishlistCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    margin: '1%',
    width: '48%',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  wishlistCardContent: {
    padding: 12,
  },
  wishlistTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  wishlistStatus: {
    fontSize: 13,
    color: COLORS.muted,
    marginBottom: 8,
  },
  strikethroughText: {
    textDecorationLine: 'line-through',
    color: COLORS.muted,
  },
  detail: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
  },
});