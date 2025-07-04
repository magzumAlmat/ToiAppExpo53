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
  RefreshControl,
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
import { Picker } from '@react-native-picker/picker';

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
  const [eventCategories, setEventCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [categoryDetailsModalVisible, setCategoryDetailsModalVisible] = useState(false);
  const [serviceDetailsModalVisible, setServiceDetailsModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [categoryStatus, setCategoryStatus] = useState('active');
  const [categoryServices, setCategoryServices] = useState([]);
  const [availableServices, setAvailableServices] = useState([]);
  const [servicesError, setServicesError] = useState(null);
  const [categoryDetails, setCategoryDetails] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [loadingServiceDetails, setLoadingServiceDetails] = useState(false);
  const [weddings, setWeddings] = useState([]);
  const [weddingModalVisible, setWeddingModalVisible] = useState(false);
  const [weddingItemsCache, setWeddingItemsCache] = useState({});
  const [editWeddingModalVisible, setEditWeddingModalVisible] = useState(false);
  const [wishlistModalVisible, setWishlistModalVisible] = useState(false);
  const [wishlistViewModalVisible, setWishlistViewModalVisible] = useState(false);
  const [weddingName, setWeddingName] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedWedding, setSelectedWedding] = useState(null);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [goods, setGoods] = useState([]);
  const [selectedGoodIds, setSelectedGoodIds] = useState([]);
  const [wishlistFiles, setWishlistFiles] = useState({});
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [errorFiles, setErrorFiles] = useState(null);
  const [loadingWeddings, setLoadingWeddings] = useState(false);
  const [formData, setFormData] = useState({ category: '', item_name: '' });
  const [isCustomGift, setIsCustomGift] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [activeWeddingId, setActiveWeddingId] = useState(null);
  const BASE_URL = process.env.EXPO_PUBLIC_API_baseURL;

  const fetchEventCategories = async () => {
    setLoadingCategories(true);
    try {
      console.log('Fetching event categories...');
      const response = await api.getEventCategories();
      console.log('Event Categories Response:', JSON.stringify(response.data, null, 2));
      const categories = Array.isArray(response.data) ? response.data : response.data.data || [];
      setEventCategories(categories);
      if (categories.length === 0) {
        console.log('No event categories found in response');
        Alert.alert('Информация', 'Нет доступных категорий мероприятий. Создайте новую.');
      }
      return categories;
    } catch (error) {
      console.error('Error fetching event categories:', error.message, error.response?.data);
      Alert.alert('Ошибка', `Не удалось загрузить категории: ${error.message}`);
      setEventCategories([]);
      return [];
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchAvailableServices = async () => {
    try {
      console.log('Fetching available services...');
      const response = await api.getServices();
      console.log('Services Response:', JSON.stringify(response.data, null, 2));
      setAvailableServices(response.data.data || response.data || []);
      setServicesError(null);
    } catch (error) {
      console.error('Error fetching services:', error.message, error.response?.data);
      setAvailableServices([]);
      setServicesError('Не удалось загрузить услуги. Вы можете продолжить без выбора услуг.');
      return [];
    }
  };

  const fetchWeddings = async () => {
    setLoadingWeddings(true);
    try {
      console.log('Fetching weddings...');
      const response = await api.getWedding();
      console.log('Weddings Response:', JSON.stringify(response.data, null, 2));
      const weddingData = Array.isArray(response.data) ? response.data : response.data.data || [];
      setWeddings(weddingData);
      const itemsPromises = weddingData.map((wedding) =>
        api.getWeddingItems(wedding.id).then((res) => ({
          weddingId: wedding.id,
          items: res.data.data || [],
        }))
      );
      const itemsResults = await Promise.all(itemsPromises);
      const newCache = itemsResults.reduce((acc, { weddingId, items }) => {
        acc[weddingId] = items;
        return acc;
      }, {});
      setWeddingItemsCache(newCache);
      return weddingData;
    } catch (error) {
      console.error('Error fetching weddings:', error.message, error.response?.data);
      Alert.alert('Ошибка', 'Не удалось загрузить свадьбы');
      setWeddings([]);
      setWeddingItemsCache({});
      return [];
    } finally {
      setLoadingWeddings(false);
    }
  };

  const fetchGoods = async () => {
    try {
      console.log('Fetching goods...');
      const response = await api.getGoods();
      console.log('Goods Response:', JSON.stringify(response.data, null, 2));
      setGoods(Array.isArray(response.data) ? response.data : response.data.data || []);
    } catch (error) {
      console.error('Error fetching goods:', error.message, error.response?.data);
      Alert.alert('Ошибка', 'Не удалось загрузить товары');
    }
  };

  const fetchEventCategoryDetails = async (id) => {
    setLoadingDetails(true);
    try {
      console.log(`Fetching details for category ID: ${id}`);
      const response = await api.getEventCategoryWithServices(id);
      console.log('Category Details Response:', JSON.stringify(response.data, null, 2));
      const details = response.data.data || response.data;
      if (!details.services || details.services.length === 0) {
        console.log('No services found for category ID:', id);
      }
      setCategoryDetails(details);
      return details;
    } catch (error) {
      console.error('Error fetching category details:', error.message, error.response?.data);
      Alert.alert('Ошибка', `Не удалось загрузить детали категории: ${error.message}`);
      setCategoryDetails(null);
      return null;
    } finally {
      setLoadingDetails(false);
    }
  };

  const fetchServiceDetails = async (serviceId, serviceType) => {
    setLoadingServiceDetails(true);
    try {
      console.log(`Fetching details for service ID: ${serviceId}, type: ${serviceType}`);
      const response = await api.fetchByEndpoint(`/api/${serviceType.toLowerCase()}/${serviceId}`);
      console.log('Service Details Response:', JSON.stringify(response.data, null, 2));
      return response.data.data || response.data;
    } catch (error) {
      console.error(`Error fetching service details for ${serviceType}/${serviceId}:`, error.message, error.response?.data);
      return null;
    } finally {
      setLoadingServiceDetails(false);
    }
  };

  const handleCreateEventCategory = async () => {
    if (!categoryName.trim()) {
      Alert.alert('Ошибка', 'Введите название категории');
      return;
    }
    try {
      console.log('Creating event category:', { name: categoryName, description: categoryDescription, status: categoryStatus });
      const response = await api.createEventCategory({
        name: categoryName,
        description: categoryDescription,
        status: categoryStatus,
      });
      console.log('Created Event Category:', JSON.stringify(response.data, null, 2));
      const newCategory = response.data.data || response.data;
      setEventCategories((prev) => [...prev, newCategory]);
      if (categoryServices.length > 0) {
        await api.addServicesToCategory(newCategory.id, {
          service_ids: categoryServices.map((s) => ({ serviceId: s.id, serviceType: s.serviceType })),
        });
        console.log('Added services to category:', categoryServices);
      }
      Alert.alert('Успех', 'Категория мероприятия создана');
      setCategoryName('');
      setCategoryDescription('');
      setCategoryStatus('active');
      setCategoryServices([]);
      setCategoryModalVisible(false);
    } catch (error) {
      console.error('Error creating event category:', error.message, error.response?.data);
      Alert.alert('Ошибка', `Не удалось создать категорию: ${error.message}`);
    }
  };

  const handleUpdateEventCategory = async () => {
    if (!selectedCategory || !categoryName.trim()) {
      Alert.alert('Ошибка', 'Выберите категорию и введите название');
      return;
    }
    try {
      console.log('Updating event category:', {
        id: selectedCategory.id,
        name: categoryName,
        description: categoryDescription,
        status: categoryStatus,
      });
      const response = await api.updateEventCategory(selectedCategory.id, {
        name: categoryName,
        description: categoryDescription,
        status: categoryStatus,
      });
      console.log('Updated Event Category:', JSON.stringify(response.data, null, 2));
      setEventCategories((prev) =>
        prev.map((cat) => (cat.id === selectedCategory.id ? response.data.data || response.data : cat))
      );
      await api.updateServicesForCategory(selectedCategory.id, {
        service_ids: categoryServices.map((s) => ({ serviceId: s.id, serviceType: s.serviceType })),
      });
      console.log('Updated services for category:', categoryServices);
      Alert.alert('Успех', 'Категория мероприятия обновлена');
      setCategoryName('');
      setCategoryDescription('');
      setCategoryStatus('active');
      setCategoryServices([]);
      setSelectedCategory(null);
      setCategoryModalVisible(false);
    } catch (error) {
      console.error('Error updating event category:', error.message, error.response?.data);
      Alert.alert('Ошибка', `Не удалось обновить категорию: ${error.message}`);
    }
  };

  const handleDeleteEventCategory = (id) => {
    Alert.alert(
      'Подтверждение',
      'Вы уверены, что хотите удалить эту категорию?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          onPress: async () => {
            try {
              console.log(`Deleting event category ID: ${id}`);
              await api.deleteEventCategory(id);
              setEventCategories((prev) => prev.filter((cat) => cat.id !== id));
              Alert.alert('Успех', 'Категория мероприятия удалена');
            } catch (error) {
              console.error('Error deleting event category:', error.message, error.response?.data);
              Alert.alert('Ошибка', `Не удалось удалить категорию: ${error.message}`);
            }
          },
        },
      ]
    );
  };

  const handleCreateWedding = async () => {
    if (!weddingName || !weddingDate) {
      Alert.alert('Ошибка', 'Введите название и дату свадьбы');
      return;
    }
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(weddingDate)) {
      Alert.alert('Ошибка', 'Дата должна быть в формате ГГГГ-ММ-ДД');
      return;
    }
    try {
      console.log('Creating wedding:', { name: weddingName, date: weddingDate });
      const response = await api.createWedding({ name: weddingName, date: weddingDate });
      const newWedding = response.data.data;
      setWeddings((prev) => [...prev, newWedding]);
      setWeddingItemsCache((prev) => ({ ...prev, [newWedding.id]: [] }));
      Alert.alert('Успех', 'Свадьба создана');
      setWeddingModalVisible(false);
      setWeddingName('');
      setWeddingDate('');
      setActiveWeddingId(newWedding.id);
    } catch (error) {
      console.error('Error creating wedding:', error.message, error.response?.data);
      Alert.alert('Ошибка', `Не удалось создать свадьбу: ${error.message}`);
    }
  };

  const handleUpdateWedding = async () => {
    if (!selectedWedding || !weddingName || !weddingDate) {
      Alert.alert('Ошибка', 'Введите название и дату свадьбы');
      return;
    }
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(weddingDate)) {
      Alert.alert('Ошибка', 'Дата должна быть в формате ГГГГ-ММ-ДД');
      return;
    }
    try {
      console.log('Updating wedding:', { id: selectedWedding.id, name: weddingName, date: weddingDate });
      const response = await api.updateWedding(selectedWedding.id, { name: weddingName, date: weddingDate });
      setWeddings((prev) =>
        prev.map((w) => (w.id === selectedWedding.id ? response.data.data : w))
      );
      const itemsResponse = await api.getWeddingItems(selectedWedding.id);
      setWeddingItemsCache((prev) => ({
        ...prev,
        [selectedWedding.id]: itemsResponse.data.data || [],
      }));
      Alert.alert('Успех', 'Свадьба обновлена');
      setEditWeddingModalVisible(false);
      setWeddingName('');
      setWeddingDate('');
      setSelectedWedding(null);
    } catch (error) {
      console.error('Error updating wedding:', error.message, error.response?.data);
      Alert.alert('Ошибка', `Не удалось обновить свадьбу: ${error.message}`);
    }
  };

  const handleDeleteWedding = (id) => {
    Alert.alert(
      'Подтверждение',
      'Вы уверены, что хотите удалить эту свадьбу?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          onPress: async () => {
            try {
              console.log(`Deleting wedding ID: ${id}`);
              await api.deleteWedding(id);
              setWeddings((prev) => prev.filter((w) => w.id !== id));
              setWeddingItemsCache((prev) => {
                const newCache = { ...prev };
                delete newCache[id];
                return newCache;
              });
              Alert.alert('Успех', 'Свадьба удалена');
              if (activeWeddingId === id) {
                const newWeddingId = weddings.find((w) => w.id !== id)?.id || null;
                setActiveWeddingId(newWeddingId);
              }
            } catch (error) {
              console.error('Error deleting wedding:', error.message, error.response?.data);
              Alert.alert('Ошибка', `Не удалось удалить свадьбу: ${error.message}`);
            }
          },
        },
      ]
    );
  };

  const handleDeleteWeddingItem = async (weddingItemId) => {
    Alert.alert(
      'Подтверждение',
      'Вы уверены, что хотите удалить этот элемент?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          onPress: async () => {
            try {
              const weddingItem = Object.values(weddingItemsCache)
                .flat()
                .find((item) => item.id === weddingItemId);
              const weddingId = weddingItem?.wedding_id;
              console.log(`Deleting wedding item ID: ${weddingItemId} for wedding ID: ${weddingId}`);
              await api.deleteWeddingItem(weddingItemId);
              const itemsResponse = await api.getWeddingItems(weddingId);
              setWeddingItemsCache((prev) => ({
                ...prev,
                [weddingId]: itemsResponse.data.data || [],
              }));
              Alert.alert('Успех', 'Элемент удален');
            } catch (error) {
              console.error('Error deleting wedding item:', error.message, error.response?.data);
              Alert.alert('Ошибка', `Не удалось удалить элемент: ${error.message}`);
            }
          },
        },
      ]
    );
  };

  const handleAddWishlistItem = async () => {
    if (selectedGoodIds.length === 0) {
      Alert.alert('Ошибка', 'Выберите хотя бы один подарок');
      return;
    }
    try {
      console.log('Adding wishlist items for wedding ID:', selectedWedding.id, 'Goods:', selectedGoodIds);
      const promises = selectedGoodIds.map((goodId) =>
        api.createWish({ wedding_id: selectedWedding.id, good_id: goodId })
      );
      await Promise.all(promises);
      Alert.alert('Успех', 'Подарки добавлены');
      setWishlistModalVisible(false);
      setSelectedGoodIds([]);
      const itemsResponse = await api.getWeddingItems(selectedWedding.id);
      setWeddingItemsCache((prev) => ({
        ...prev,
        [selectedWedding.id]: itemsResponse.data.data || [],
      }));
    } catch (error) {
      console.error('Error adding wishlist items:', error.message, error.response?.data);
      Alert.alert('Ошибка', `Не удалось добавить подарки: ${error.message}`);
    }
  };

  const handleAddCustomGift = async () => {
    if (!formData.item_name) {
      Alert.alert('Ошибка', 'Введите название подарка');
      return;
    }
    try {
      console.log('Adding custom gift:', formData);
      const giftData = {
        category: 'Miscellaneous',
        item_name: formData.item_name,
        cost: '0',
        supplier_id: userId,
      };
      const response = await api.createGood(giftData);
      const newGood = response.data.data;
      await api.createWish({ wedding_id: selectedWedding.id, good_id: newGood.id });
      Alert.alert('Успех', 'Собственный подарок добавлен');
      setFormData({ ...formData, item_name: '' });
      setWishlistModalVisible(false);
      await fetchWishlistItems(selectedWedding.id);
    } catch (error) {
      console.error('Error adding custom gift:', error.message, error.response?.data);
      Alert.alert('Ошибка', `Не удалось добавить подарок: ${error.message}`);
    }
 };

  const fetchWishlistItems = async (weddingId) => {
    try {
      console.log(`Fetching wishlist items for wedding ID: ${weddingId}`);
      const response = await api.getWishlistByWeddingId(weddingId);
      console.log('Wishlist Items Response:', JSON.stringify(response.data, null, 2));
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
      console.error('Error fetching wishlist items:', error.message, error.response?.data);
      Alert.alert('Ошибка', `Не удалось загрузить список желаний: ${error.message}`);
    }
  };

  const fetchFiles = async (goodId) => {
    setLoadingFiles(true);
    setErrorFiles(null);
    try {
      console.log(`Fetching files for good ID: ${goodId}`);
      const response = await axios.get(`${BASE_URL}/api/goods/${goodId}/files`);
      console.log('Files Response:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.error('Error fetching files:', error.message, error.response?.data);
      setErrorFiles(`Не удалось загрузить файлы: ${error.message}`);
      return [];
    } finally {
      setLoadingFiles(false);
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
              console.log(`Reserving wishlist item ID: ${wishlistId}`);
              const response = await api.reserveWishlistItem(wishlistId);
              Alert.alert('Успех', 'Подарок зарезервирован');
              setWishlistItems((prev) =>
                prev.map((item) =>
                  item.id === wishlistId ? response.data.data : item
                )
              );
            } catch (error) {
              console.error('Error reserving wishlist item:', error.message, error.response?.data);
              Alert.alert('Ошибка', `Не удалось зарезервировать подарок: ${error.message}`);
            }
          },
        },
      ]
    );
  };

  const handleShareWeddingLink = async (weddingId) => {
    try {
      console.log(`Sharing wedding link for wedding ID: ${weddingId}`);
      const webLink = `${BASE_URL}/api/weddingwishes/${weddingId}`;
      await Share.share({
        message: webLink,
        title: 'Приглашение на свадьбу',
      });
    } catch (error) {
      console.error('Error sharing wedding link:', error.message);
      Alert.alert('Ошибка', 'Не удалось поделиться ссылкой');
    }
  };

  const openEditCategoryModal = async (category) => {
    console.log('Opening edit modal for category:', category);
    setSelectedCategory(category);
    setCategoryName(category.name);
    setCategoryDescription(category.description || '');
    setCategoryStatus(category.status || 'active');
    const details = await fetchEventCategoryDetails(category.id);
    setCategoryServices(details?.services?.map((s) => ({ id: s.serviceId, serviceType: s.serviceType })) || []);
    setCategoryModalVisible(true);
  };

  const openCategoryDetailsModal = async (category) => {
    console.log('Opening details modal for category:', category);
    setSelectedCategory(category);
    await fetchEventCategoryDetails(category.id);
    setCategoryDetailsModalVisible(true);
  };

  const openServiceDetailsModal = async (service) => {
    console.log('Opening service details modal for:', service);
    const details = await fetchServiceDetails(service.serviceId, service.serviceType);
    setSelectedService(details ? { ...service, ...details } : service);
    setServiceDetailsModalVisible(true);
  };

  const openEditWeddingModal = (wedding) => {
    console.log('Opening edit modal for wedding:', wedding);
    setSelectedWedding(wedding);
    setWeddingName(wedding.name);
    setWeddingDate(wedding.date);
    setEditWeddingModalVisible(true);
  };

  const onDateChange = (day) => {
    console.log('Selected date:', day.dateString);
    setWeddingDate(day.dateString);
    setShowCalendar(false);
  };

  const fetchItemDetails = async (itemType, itemId) => {
    setLoadingDetails(true);
    try {
      console.log(`Fetching details for ${itemType} ID: ${itemId}`);
      const response = await api.fetchByEndpoint(`/api/${itemType}/${itemId}`);
      console.log('Item Details Response:', JSON.stringify(response.data, null, 2));
      return response.data.data || response.data;
    } catch (error) {
      console.error(`Error fetching ${itemType} details:`, error.message, error.response?.data);
      Alert.alert('Ошибка', `Не удалось загрузить детали элемента: ${error.message}`);
      return null;
    } finally {
      setLoadingDetails(false);
    }
  };

  const openItemDetailsModal = async (weddingItem) => {
    console.log('Opening details modal for wedding item:', weddingItem);
    const details = await fetchItemDetails(weddingItem.item_type, weddingItem.item_id);
    setSelectedItem(details ? { ...weddingItem, ...details } : weddingItem);
    setDetailsModalVisible(true);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchEventCategories(), fetchAvailableServices(), fetchWeddings(), fetchGoods()]);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    const initialize = async () => {
      console.log('Initializing Item3Screen...');
      setLoadingCategories(true);
      try {
        const [categoriesResponse, weddingsResponse, goodsResponse] = await Promise.all([
          api.getEventCategories(),
          api.getWedding(),
          api.getGoods(),
        ]);
        setEventCategories(Array.isArray(categoriesResponse.data) ? categoriesResponse.data : categoriesResponse.data.data || []);
        setWeddings(Array.isArray(weddingsResponse.data) ? weddingsResponse.data : weddingsResponse.data.data || []);
        setGoods(Array.isArray(goodsResponse.data) ? goodsResponse.data : goodsResponse.data.data || []);
        const itemsPromises = weddingsResponse.data.data.map((wedding) =>
          api.getWeddingItems(wedding.id).then((res) => ({
            weddingId: wedding.id,
            items: res.data.data || [],
          }))
        );
        const itemsResults = await Promise.all(itemsPromises);
        const newCache = itemsResults.reduce((acc, { weddingId, items }) => {
          acc[weddingId] = items;
          return acc;
        }, {});
        setWeddingItemsCache(newCache);
        // Attempt to fetch services, but don't fail initialization if it errors
        await fetchAvailableServices();
      } catch (error) {
        console.error('Error initializing:', error.message, error.response?.data);
        setEventCategories([]);
        setWeddings([]);
        setGoods([]);
        setWeddingItemsCache({});
      } finally {
        setLoadingCategories(false);
      }
    };
    initialize();
  }, []);

  useFocusEffect(
    useCallback(() => {
      console.log('Screen focused, refreshing data...');
      onRefresh();
    }, [onRefresh])
  );

  const renderEventCategoryItem = ({ item }) => {
    console.log('Rendering event category:', item);
    return (
      <View style={styles.itemContainer}>
        <Text style={styles.itemText}>{item.name}</Text>
        <Text style={styles.itemSubText}>
          Статус: {item.status === 'active' ? 'Активно' : 'Неактивно'}
        </Text>
        <Text style={styles.itemSubText}>
          Описание: {item.description || 'Нет описания'}
        </Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.actionButtonPrimary}
            onPress={() => openCategoryDetailsModal(item)}
          >
            <Text style={styles.actionButtonText}>Подробнее</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButtonSecondary}
            onPress={() => openEditCategoryModal(item)}
          >
            <Text style={styles.actionButtonText}>Редактировать</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButtonError}
            onPress={() => handleDeleteEventCategory(item.id)}
          >
            <Text style={styles.actionButtonText}>Удалить</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderServiceInCategory = ({ item }) => (
    <View style={styles.serviceCard}>
      <Text style={styles.serviceCardTitle}>{item.name}</Text>
      <Text style={styles.serviceCardDescription}>
        {item.description || 'Нет описания'}
      </Text>
      <Text style={styles.serviceCardType}>Тип: {item.serviceType}</Text>
      <TouchableOpacity
        style={styles.detailsButton}
        onPress={() => openServiceDetailsModal(item)}
      >
        <Text style={styles.detailsButtonText}>Подробнее</Text>
      </TouchableOpacity>
    </View>
  );

  const renderWeddingItem = ({ item }) => {
    const filteredItems = weddingItemsCache[item.id] || [];
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
                            return `Ресторан - ${weddingItem.total_cost || 0} тг`;
                          case 'clothing':
                            return `Одежда - ${weddingItem.total_cost || 0} тг`;
                          case 'tamada':
                            return `Тамада - ${weddingItem.total_cost || 0} тг`;
                          case 'program':
                            return `Программа - ${weddingItem.total_cost || 0} тг`;
                          case 'traditionalGift':
                            return `Традиционный подарок - ${weddingItem.total_cost || 0} тг`;
                          case 'flowers':
                            return `Цветы - ${weddingItem.total_cost || 0} тг`;
                          case 'cake':
                            return `Торт - ${weddingItem.total_cost || 0} тг`;
                          case 'alcohol':
                            return `Алкоголь - ${weddingItem.total_cost || 0} тг`;
                          case 'transport':
                            return `Транспорт - ${weddingItem.total_cost || 0} тг`;
                          case 'goods':
                            return `Товар - ${weddingItem.total_cost || 0} тг`;
                          case 'jewelry':
                            return `Ювелирные изделия - ${weddingItem.total_cost || 0} тг`;
                          default:
                            return `Неизвестный элемент (${weddingItem.item_type}) - ${weddingItem.total_cost || 0} тг`;
                        }
                      })()}
                    </Text>
                    <View style={styles.itemActions}>
                      <TouchableOpacity
                        style={styles.detailsButton}
                        onPress={() => openItemDetailsModal(weddingItem)}
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
            onPress={() => openEditWeddingModal(item)}
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
          <TouchableOpacity
            style={styles.actionButtonAccent}
            onPress={() => {
              setSelectedWedding(item);
              fetchWishlistItems(item.id);
            }}
          >
            <Text style={styles.actionButtonText}>Просмотреть подарки</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButtonError}
            onPress={() => handleDeleteWedding(item.id)}
          >
            <Text style={styles.actionButtonText}>Удалить</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButtonPrimary}
            onPress={() => handleShareWeddingLink(item.id)}
          >
            <Text style={styles.actionButtonText}>Поделиться</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderGoodCard = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.goodCard,
        selectedGoodIds.includes(item.id) && styles.selectedGoodCard,
      ]}
      onPress={() => {
        setSelectedGoodIds((prev) =>
          prev.includes(item.id)
            ? prev.filter((id) => id !== item.id)
            : [...prev, item.id]
        );
      }}
    >
      <Text style={styles.goodCardTitle}>{item.item_name}</Text>
      <Text style={styles.goodCardCategory}>Категория: {item.category}</Text>
      <Text style={styles.goodCardCost}>
        {item.cost ? `Цена: ${item.cost}` : 'Цена не указана'}
      </Text>
      {item.specs?.goodLink && (
        <TouchableOpacity
          onPress={() => Linking.openURL(item.specs.goodLink)}
        >
          <Text style={styles.linkText}>Открыть ссылку</Text>
        </TouchableOpacity>
      )}
      {selectedGoodIds.includes(item.id) && (
        <Text style={styles.selectedIndicator}>✓</Text>
      )}
    </TouchableOpacity>
  );

  const renderWishlistItem = ({ item }) => {
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
          {item.goodLink && (
            <TouchableOpacity onPress={() => Linking.openURL(item.goodLink)}>
              <Text style={styles.linkText}>Открыть ссылку</Text>
            </TouchableOpacity>
          )}
          <View style={styles.mediaSection}>
            {loadingFiles ? (
              <ActivityIndicator size="small" color={COLORS.primary} style={styles.loader} />
            ) : errorFiles ? (
              <Text style={styles.errorText}>{errorFiles}</Text>
            ) : files.length > 0 ? (
              <FlatList
                data={files}
                renderItem={({ item: file }) => (
                  <View style={styles.card}>
                    {file.mimetype.startsWith('image/') ? (
                      <Image source={{ uri: `${BASE_URL}/${file.path}` }} style={styles.media} resizeMode="cover" />
                    ) : file.mimetype === 'video/mp4' ? (
                      <Video
                        source={{ uri: `${BASE_URL}/${file.path}` }}
                        style={styles.video}
                        useNativeControls
                        resizeMode="contain"
                        isLooping
                      />
                    ) : (
                      <Text style={styles.detail}>Неподдерживаемый формат: ${file.mimetype}</Text>
                    )}
                  </View>
                )}
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

  const renderServiceItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.serviceCard,
        categoryServices.some((s) => s.id === item.id && s.serviceType === item.serviceType) && styles.selectedServiceCard,
      ]}
      onPress={() => {
        setCategoryServices((prev) => {
          const exists = prev.some((s) => s.id === item.id && s.serviceType === item.serviceType);
          if (exists) {
            return prev.filter((s) => !(s.id === item.id && s.serviceType === item.serviceType));
          }
          return [...prev, { id: item.id, serviceType: item.serviceType }];
        });
      }}
    >
      <Text style={styles.serviceCardTitle}>{item.name}</Text>
      <Text style={styles.serviceCardDescription}>
        {item.description || 'Нет описания'}
      </Text>
      <Text style={styles.serviceCardType}>Тип: {item.serviceType}</Text>
      {categoryServices.some((s) => s.id === item.id && s.serviceType === item.serviceType) && (
        <Text style={styles.selectedIndicator}>✓</Text>
      )}
    </TouchableOpacity>
  );

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

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Мои мероприятия</Text>
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => {
            setCategoryName('');
            setCategoryDescription('');
            setCategoryStatus('active');
            setCategoryServices([]);
            setSelectedCategory(null);
            setCategoryModalVisible(true);
          }}
        >
          <Text style={styles.createButtonText}>Создать категорию</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => {
            setWeddingName('');
            setWeddingDate('');
            setWeddingModalVisible(true);
          }}
        >
          <Text style={styles.createButtonText}>Управление свадьбами</Text>
        </TouchableOpacity>
      </View>
      {loadingCategories ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={eventCategories}
          renderItem={renderEventCategoryItem}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.noItems}>Нет категорий мероприятий</Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => setCategoryModalVisible(true)}
              >
                <Text style={styles.createButtonText}>Создать категорию</Text>
              </TouchableOpacity>
            </View>
          }
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
        />
      )}

      <Modal visible={categoryModalVisible} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <Text style={styles.subtitle}>
            {selectedCategory ? 'Редактировать категорию' : 'Создать категорию'}
          </Text>
          <ScrollView style={{ width: '100%' }}>
            <TextInput
              style={styles.input}
              placeholder="Название категории"
              placeholderTextColor={COLORS.muted}
              value={categoryName}
              onChangeText={setCategoryName}
            />
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="Описание категории"
              placeholderTextColor={COLORS.muted}
              value={categoryDescription}
              onChangeText={setCategoryDescription}
              multiline
              numberOfLines={4}
            />
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Статус</Text>
              <Picker
                selectedValue={categoryStatus}
                onValueChange={(value) => setCategoryStatus(value)}
                style={styles.picker}
              >
                <Picker.Item label="Активно" value="active" />
                <Picker.Item label="Неактивно" value="inactive" />
              </Picker>
            </View>
            <Text
Text style={styles.sectionTitle}>Выберите услуги</Text>
            {servicesError ? (
              <Text style={styles.errorText}>{servicesError}</Text>
            ) : (
              <FlatList
                data={availableServices}
                renderItem={renderServiceItem}
                keyExtractor={(item) => `${item.id}-${item.serviceType}`}
                ListEmptyComponent={<Text style={styles.noItems}>Услуги недоступны</Text>}
                contentContainerStyle={styles.serviceList}
              />
            )}
          </ScrollView>
          <View style={styles.buttonRowModal}>
            <Button
              title={selectedCategory ? 'Сохранить' : 'Создать'}
              onPress={selectedCategory ? handleUpdateEventCategory : handleCreateEventCategory}
              color={COLORS.primary}
            />
            <Button
              title="Отмена"
              onPress={() => {
                setCategoryModalVisible(false);
                setCategoryName('');
                setCategoryDescription('');
                setCategoryStatus('active');
                setCategoryServices([]);
                setSelectedCategory(null);
              }}
              color={COLORS.muted}
            />
          </View>
        </SafeAreaView>
      </Modal>

      <Modal visible={categoryDetailsModalVisible} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <Text style={styles.subtitle}>Детали категории</Text>
          {loadingDetails ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
          ) : categoryDetails ? (
            <ScrollView style={{ width: '100%' }}>
              <Text style={styles.modalText}>Название: {categoryDetails.name}</Text>
              <Text style={styles.modalText}>
                Описание: {categoryDetails.description || 'Нет описания'}
              </Text>
              <Text style={styles.modalText}>
                Статус: {categoryDetails.status === 'active' ? 'Активно' : 'Неактивно'}
              </Text>
              <Text style={styles.modalText}>
                Создано: {new Date(categoryDetails.created_at).toLocaleString()}
              </Text>
              <Text style={styles.modalText}>
                Обновлено: {new Date(categoryDetails.updated_at).toLocaleString()}
              </Text>
              <Text style={styles.sectionTitle}>Услуги</Text>
              <FlatList
                data={categoryDetails.services || []}
                renderItem={renderServiceInCategory}
                keyExtractor={(item) => `${item.serviceId}-${item.serviceType}`}
                ListEmptyComponent={
                  <Text style={styles.noItems}>Нет услуг в этой категории</Text>
                }
                contentContainerStyle={styles.serviceList}
              />
            </ScrollView>
          ) : (
            <Text style={styles.noItems}>Данные недоступны</Text>
          )}
          <View style={styles.buttonRowModal}>
            <Button
              title="Закрыть"
              onPress={() => setCategoryDetailsModalVisible(false)}
              color={COLORS.muted}
            />
          </View>
        </SafeAreaView>
      </Modal>

      <Modal visible={serviceDetailsModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Детали услуги</Text>
            {loadingServiceDetails ? (
              <ActivityIndicator size="large" color={COLORS.primary} />
            ) : selectedService ? (
              <ScrollView style={{ width: '100%' }}>
                <Text style={styles.modalText}>Название: {selectedService.name}</Text>
                <Text style={styles.modalText}>
                  Тип: {selectedService.serviceType}
                </Text>
                <Text style={styles.modalText}>
                  Описание: {selectedService.description || 'Нет описания'}
                </Text>
                {selectedService.cost && (
                  <Text style={styles.modalText}>
                    Стоимость: {selectedService.cost} тг
                  </Text>
                )}
                {selectedService.created_at && (
                  <Text style={styles.modalText}>
                    Создано: {new Date(selectedService.created_at).toLocaleString()}
                  </Text>
                )}
                {selectedService.updated_at && (
                  <Text style={styles.modalText}>
                    Обновлено: {new Date(selectedService.updated_at).toLocaleString()}
                  </Text>
                )}
              </ScrollView>
            ) : (
              <Text style={styles.modalText}>Данные недоступны</Text>
            )}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setServiceDetailsModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Закрыть</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={weddingModalVisible} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <Text style={styles.subtitle}>Управление свадьбами</Text>
          <TextInput
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
                [weddingDate]: { selected: true, selectedColor: COLORS.primary },
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
                setWeddingModalVisible(false);
                setShowCalendar(false);
              }}
              color={COLORS.muted}
            />
          </View>
          {loadingWeddings ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
          ) : (
            <FlatList
              data={weddings}
              renderItem={renderWeddingItem}
              keyExtractor={(item) => item.id.toString()}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.noItems}>Нет созданных свадеб</Text>
                </View>
              }
              contentContainerStyle={styles.listContainer}
            />
          )}
        </SafeAreaView>
      </Modal>

      <Modal visible={editWeddingModalVisible} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <Text style={styles.subtitle}>Редактирование свадьбы</Text>
          <TextInput
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
                [weddingDate]: { selected: true, selectedColor: COLORS.primary },
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
                setEditWeddingModalVisible(false);
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
              contentContainerStyle={styles.listContainer}
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
                  disabled={selectedGoodIds.length === 0}
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
                setSelectedGoodIds([]);
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
            contentContainerStyle={styles.listContainer}
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
                  Наименование: {selectedItem.name || selectedItem.item_name || 'N/A'}
                </Text>
                <Text style={styles.modalText}>
                  Стоимость: {selectedItem.total_cost || '0'} тг
                </Text>
                <Text style={styles.modalText}>
                  Создан: {new Date(selectedItem.created_at).toLocaleString()}
                </Text>
                <Text style={styles.modalText}>
                  Обновлен: {new Date(selectedItem.updated_at).toLocaleString()}
                </Text>
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
  },
  subtitle: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    margin: 4,
    flex: 1,
    alignItems: 'center',
  },
  createButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
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
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: COLORS.white,
  },
  pickerLabel: {
    fontSize: 16,
    color: COLORS.text,
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  picker: {
    fontSize: 16,
    color: COLORS.text,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 12,
  },
  serviceList: {
    paddingBottom: 20,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    backgroundColor: COLORS.white,
    alignItems: 'center',
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
  },
  itemText: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  itemSubText: {
    fontSize: 16,
    color: COLORS.muted,
    marginBottom: 8,
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
  },
  actionButtonSecondary: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexGrow: 1,
    margin: 4,
    alignItems: 'center',
  },
  actionButtonAccent: {
    backgroundColor: COLORS.accent,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexGrow: 1,
    margin: 4,
    alignItems: 'center',
  },
  actionButtonError: {
    backgroundColor: COLORS.error,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexGrow: 1,
    margin: 4,
    alignItems: 'center',
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
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
  },
  addItemsButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
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
  },
  closeButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  serviceCard: {
    padding: 12,
    marginVertical: 8,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedServiceCard: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    backgroundColor: '#E6F0FA',
  },
  serviceCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  serviceCardDescription: {
    fontSize: 14,
    color: COLORS.muted,
    marginTop: 4,
  },
  serviceCardType: {
    fontSize: 14,
    color: COLORS.muted,
    marginTop: 4,
  },
  detailsButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  detailsButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
  },
  goodCard: {
    padding: 12,
    marginVertical: 8,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
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
  linkText: {
    fontSize: 14,
    color: COLORS.primary,
    marginTop: 6,
    textDecorationLine: 'underline',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    fontSize: 20,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  wishlistCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    margin: '1%',
    width: '48%',
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
  },
  media: {
    width: '100%',
    height: '100%',
  },
  video: {
    width: '100%',
    height: '100%',
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
  detail: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
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
  deleteButton: {
    backgroundColor: COLORS.error,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
  },
  infoText: {
    fontSize: 14,
    color: COLORS.muted,
    marginBottom: 10,
  },
});