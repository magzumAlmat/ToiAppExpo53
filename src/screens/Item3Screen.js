import React, { useState, useEffect } from 'react';
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
import * as ExpoCalendar from 'expo-calendar';
import * as Contacts from 'expo-contacts';


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
  const BASE_URL = process.env.EXPO_PUBLIC_API_baseURL;

  

  useFocusEffect(
    React.useCallback(() => {
      fetchWeddings();
    }, [])
  );

  useEffect(() => {
    fetchWeddings();
    fetchGoods();
    fetchWeddingItems();
  }, []);

  useEffect(() => {
    console.log('Updated weddings:', weddings);
    console.log('Updated weddingItems:', weddingItems);
  }, [weddings, weddingItems]);

  const fetchWeddingItems = async ({ item }) => {
    console.log('item fron fetchweddingItems=', item);
    try {
      const response = await api.getWeddinItems(token, userId);
      console.log('API response for weddings:', response.data);
      setWeddingItems(response.data.data || []);
    } catch (error) {
      console.error('Ошибка при загрузке свадеб:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить список свадеб');
      setWeddingItems([]);
    }
  };

  const fetchWeddings = async () => {
    console.log('Fetching weddings with id=', userId, 'token=', token);
    setLoadingWeddings(true);
    try {
      const response = await api.getWedding(token);
      console.log('API response for weddings:', response.data);
      setWeddings(response.data.data || []);
    } catch (error) {
      console.error('Ошибка при загрузке свадеб:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить список свадеб');
      setWeddings([]);
    } finally {
      setLoadingWeddings(false);
    }
  };

  const fetchGoods = async () => {
    try {
      const response = await api.getGoods(token);
      setGoods(response.data || []);
    } catch (error) {
      console.error('Ошибка при загрузке товаров:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить список товаров');
    }
  };

  const fetchFiles = async (goodId) => {
    console.log('Starting fetchFiles for good_id:', goodId);
    setLoadingFiles(true);
    setErrorFiles(null);
    try {
      const response = await axios.get(`${BASE_URL}/api/goods/${goodId}/files`);
      console.log('Files response:', response.data);
      return response.data;
    } catch (err) {
      console.error('Ошибка загрузки файлов:', err);
      setErrorFiles('Ошибка загрузки файлов: ' + err.message);
      return [];
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleCreateWedding = async () => {
    if (!weddingName || !weddingDate) {
      Alert.alert('Ошибка', 'Заполните имя и дату свадьбы');
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
      Alert.alert('Успех', 'Свадьба успешно создана');
      setWeddings([...weddings, response.data.data]);
      setModalVisible(false);
      setWeddingName('');
      setWeddingDate('');
    } catch (error) {
      console.error('Ошибка при создании свадьбы:', error);
      Alert.alert('Ошибка', error.response?.data?.error || 'Не удалось создать свадьбу');
    }
  };

  const handleUpdateWedding = async () => {
    if (!selectedWedding || !weddingName || !weddingDate) {
      Alert.alert('Ошибка', 'Заполните имя и дату свадьбы');
      return;
    }
    console.log('Updating wedding:', selectedWedding.id, token, weddingDate, weddingName);

    try {
      const data = {
        name: weddingName,
        date: weddingDate,
      };
      const response = await api.updateWedding(selectedWedding.id, token, data);
      Alert.alert('Успех', 'Свадьба обновлена');
      setWeddings(weddings.map((w) => (w.id === selectedWedding.id ? response.data.data : w)));
      setEditModalVisible(false);
      setWeddingName('');
      setWeddingDate('');
      setSelectedWedding(null);
    } catch (error) {
      console.error('Ошибка при обновлении свадьбы:', error);
      Alert.alert('Ошибка', error.response?.data?.error || 'Не удалось обновить свадьбу');
    }
  };

  const handleDeleteWedding = async (id) => {
    Alert.alert(
      'Подтверждение',
      'Вы уверены, что хотите удалить эту свадьбу?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          onPress: async () => {
            try {
              await api.deleteWedding(id, token);
              setWeddings(weddings.filter((w) => w.id !== id));
              Alert.alert('Успех', 'Свадьба удалена');
            } catch (error) {
              console.error('Ошибка при удалении свадьбы:', error);
              Alert.alert('Ошибка', 'Не удалось удалить свадьбу');
            }
          },
        },
      ]
    );
  };

  const handleAddWishlistItem = async () => {
    if (!selectedGoodId) {
      Alert.alert('Ошибка', 'Выберите подарок из списка');
      return;
    }

    const wishlistData = {
      wedding_id: selectedWedding.id,
      good_id: selectedGoodId,
    };

    try {
      const response = await api.createWish(wishlistData, token);
      Alert.alert('Успех', 'Подарок добавлен');
      setWishlistModalVisible(false);
      setSelectedGoodId('');
      fetchWeddings();
    } catch (error) {
      console.error('Ошибка при добавлении подарка:', error);
      Alert.alert('Ошибка', error.response?.data?.error || 'Не удалось добавить подарок');
    }
  };

  const handleAddCustomGift = async () => {
    try {
      if (!formData.item_name) {
        Alert.alert('Ошибка', 'Пожалуйста, заполните категорию и название товара');
        return;
      }

      const giftData = {
        category: "Прочее",
        item_name: formData.item_name,
        cost: '0',
        supplier_id: userId,
      };

      const response = await api.postGoodsData(giftData);
      const newGood = response.data.data;

      const wishlistData = {
        wedding_id: selectedWedding.id,
        good_id: newGood.id,
      };

      await api.createWish(wishlistData, token);

      Alert.alert('Успех', 'Ваш подарок успешно добавлен!');
      setFormData({ category: '', item_name: '' });
      setWishlistModalVisible(false);
      fetchWishlistItems(selectedWedding.id);
    } catch (error) {
      console.error('Ошибка при добавлении подарка:', error);
      Alert.alert('Ошибка', 'Не удалось добавить подарок');
    }
  };

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
      console.error('Ошибка при загрузке списка подарков:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить список подарков');
    }
  };

  const handleReserveWishlistItem = async (wishlistId) => {
    Alert.alert(
      'Подтверждение',
      'Вы хотите зарезервировать этот подарок?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Зарезервировать',
          onPress: async () => {
            try {
              const response = await api.reserveWishlistItem(wishlistId, token);
              Alert.alert('Успех', 'Подарок зарезервирован');
              setWishlistItems(
                wishlistItems.map((item) =>
                  item.id === wishlistId ? response.data.data : item
                )
              );
            } catch (error) {
              console.error('Ошибка при резервировании подарка:', error);
              Alert.alert('Ошибка', error.response?.data?.error || 'Не удалось зарезервировать подарок');
            }
          },
        },
      ]
    );
  };

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
        title: 'Приглашение на свадьбу',
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('Поделился через:', result.activityType);
        } else {
          console.log('Поделился успешно');
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('Поделиться отменено');
      }
    } catch (error) {
      console.error('Ошибка в handleShareWeddingLink:', error.message, error.stack);
      Alert.alert('Ошибка', 'Не удалось поделиться ссылкой: ' + error.message);
    }
  };

  const openEditModal = (wedding) => {
    setSelectedWedding(wedding);
    setWeddingName(wedding.name);
    setWeddingDate(wedding.date);
    setEditModalVisible(true);
  };

  const onDateChange = (day) => {
    setWeddingDate(day.dateString);
    setShowCalendar(false);
  };

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
          throw new Error('Неизвестный тип элемента');
      }

      const response = await api.fetchByEndpoint(endpoint);

      const details = Array.isArray(response.data) ? response.data[0] : response.data;
      console.log('1', details);
      return details || null;
    } catch (error) {
      console.error(`Ошибка при загрузке деталей для ${itemType}:`, error);
      Alert.alert('Ошибка', 'Не удалось загрузить детали элемента');
      return null;
    } finally {
      setLoadingDetails(false);
    }
  };

  const openDetailsModal = async (weddingItem) => {
    console.log('Сработала кнопка подробнее', weddingItem);
    const details = await fetchItemDetails(weddingItem.item_type, weddingItem.item_id);
    console.log('details= ', details);
    if (details) {
      setSelectedItem({ ...weddingItem, ...details });
    } else {
      setSelectedItem(weddingItem);
    }
    setDetailsModalVisible(true);
  };

  const renderWeddingItem = ({ item }) => {
    return (
      <View style={styles.itemContainer}>
        <Text style={styles.itemText}>
          {item.name} ({item.date})
        </Text>
        {item.WeddingItems && item.WeddingItems.length > 0 ? (
          <View style={styles.weddingItemsContainer}>
            {item.WeddingItems.map((weddingItem) => (
              console.log('map WI= ', weddingItem),
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
                <TouchableOpacity
                  style={styles.detailsButton}
                  onPress={() => openDetailsModal(weddingItem)}
                >
                  <Text style={styles.detailsButtonText}>Подробнее</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.noItems}>Нет элементов для этой свадьбы</Text>
        )}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.actionButtonPrimary} onPress={() => openEditModal(item)}>
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
        <Modal visible={detailsModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Детали элемента</Text>
              {loadingDetails ? (
                <ActivityIndicator size="large" color={COLORS.primary} />
              ) : selectedItem ? (
                <ScrollView style={{ width: '100%' }}>
                  {console.log('SI= = ', selectedItem)}
                  <Text style={styles.modalText}>ID: {selectedItem.id}</Text>
                  <Text style={styles.modalText}>Тип: {selectedItem.item_type}</Text>
                  <Text style={styles.modalText}>
                    Наименование: {selectedItem.name || selectedItem.alcoholName || selectedItem.itemName || selectedItem.teamName || selectedItem.flowerName || selectedItem.carName || 'N/A'}
                  </Text>
                  <Text style={styles.modalText}>Стоимость: {selectedItem.total_cost} тг</Text>
                  <Text style={styles.modalText}>
                    Создан: {new Date(selectedItem.created_at).toLocaleString()}
                  </Text>
                  <Text style={styles.modalText}>
                    Обновлен: {new Date(selectedItem.updated_at).toLocaleString()}
                  </Text>
                  {selectedItem.address && <Text style={styles.modalText}>Адрес: {selectedItem.address}</Text>}
                  {selectedItem.phone && <Text style={styles.modalText}>Телефон: {selectedItem.phone}</Text>}
                  {selectedItem.cuisine && <Text style={styles.modalText}>Кухня: {selectedItem.cuisine}</Text>}
                  {selectedItem.capacity && <Text style={styles.modalText}>Вместимость: {selectedItem.capacity}</Text>}
                  {selectedItem.averageCost && <Text style={styles.modalText}>Средний чек: {selectedItem.averageCost} тг</Text>}
                  {selectedItem.brand && <Text style={styles.modalText}>Бренд: {selectedItem.brand}</Text>}
                  {selectedItem.gender && <Text style={styles.modalText}>Пол: {selectedItem.gender}</Text>}
                  {selectedItem.portfolio && <Text style={styles.modalText}>Портфолио: {selectedItem.portfolio}</Text>}
                  {selectedItem.category && <Text style={styles.modalText}>Категория: {selectedItem.category}</Text>}
                  {selectedItem.flowerType && <Text style={styles.modalText}>Тип цветка: {selectedItem.flowerType}</Text>}
                  {selectedItem.cakeType && <Text style={styles.modalText}>Тип торта: {selectedItem.cakeType}</Text>}
                  {selectedItem.material && <Text style={styles.modalText}>Материал: {selectedItem.material}</Text>}
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
      </View>
    );
  };

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
          ListEmptyComponent={<Text style={styles.noItems}>Свадеб пока нет</Text>}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      <Modal visible={modalVisible} animationType="slide">
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
          <TextInput
            autoComplete="off"
            style={styles.input}
            placeholder="Дата свадьбы (YYYY-MM-DD)"
            placeholderTextColor={COLORS.muted}
            value={weddingDate}
            onChangeText={setWeddingDate}
          />
          <View style={styles.buttonRowModal}>
            <Button title="Создать" onPress={handleCreateWedding} color={COLORS.primary} />
            <Button title="Отмена" onPress={() => setModalVisible(false)} color={COLORS.muted} />
          </View>
        </SafeAreaView>
      </Modal>

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
            <Button title="Сохранить" onPress={handleUpdateWedding} color={COLORS.primary} />
            <Button title="Отмена" onPress={() => { setEditModalVisible(false); setShowCalendar(false); }} color={COLORS.muted} />
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
                <Button title="Сохранить" onPress={handleAddCustomGift} color={COLORS.primary} />
                <Button title="Назад" onPress={() => setIsCustomGift(false)} color={COLORS.muted} />
              </>
            ) : (
              <>
                <Button title="Добавить" onPress={handleAddWishlistItem} color={COLORS.primary} disabled={!selectedGoodId} />
                <Button
                  title="Добавить свой подарок"
                  onPress={() => setIsCustomGift(true)}
                  color={COLORS.secondary}
                />
              </>
            )}
            <Button title="Отмена" onPress={() => { setWishlistModalVisible(false); setIsCustomGift(false); setSelectedGoodId(''); }} color={COLORS.muted} />
          </View>
        </SafeAreaView>
      </Modal>

      <Modal visible={wishlistViewModalVisible} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <Text style={styles.subtitle}>Подарки для свадьбы: {selectedWedding?.name}</Text>
          <FlatList
            data={wishlistItems}
            renderItem={renderWishlistItem}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            ListEmptyComponent={<Text style={styles.noItems}>Подарков пока нет</Text>}
            columnWrapperStyle={styles.columnWrapper}
          />
          <View style={styles.buttonRowModal}>
            <Button title="Закрыть" onPress={() => setWishlistViewModalVisible(false)} color={COLORS.muted} />
          </View>
        </SafeAreaView>
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
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 0.3,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: COLORS.white,
    color: COLORS.text,
    shadowColor: '#000',
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
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    shadowColor: '#000',
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
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  itemText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  weddingItemsContainer: {
    marginBottom: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
  },
  weddingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  subItemText: {
    fontSize: 16,
    color: COLORS.text,
    flex: 1,
    marginRight: 8,
  },
  detailsButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  detailsButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexGrow: 1,
    margin: 4,
    alignItems: 'center',
    minWidth: 100,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  actionButtonSecondary: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexGrow: 1,
    margin: 4,
    alignItems: 'center',
    minWidth: 100,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  actionButtonAccent: {
    backgroundColor: COLORS.accent,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexGrow: 1,
    margin: 4,
    alignItems: 'center',
    minWidth: 100,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  actionButtonError: {
    backgroundColor: COLORS.error,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexGrow: 1,
    margin: 4,
    alignItems: 'center',
    minWidth: 100,
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
    textAlign: 'center',
  },
  noItems: {
    fontSize: 16,
    color: COLORS.muted,
    textAlign: 'center',
    marginVertical: 20,
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
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 20,
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
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
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
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
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
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
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