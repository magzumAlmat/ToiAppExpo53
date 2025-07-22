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
  const [weddings, setWeddings] = useState([]);
  const [weddingItemsCache, setWeddingItemsCache] = useState({});
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingWeddings, setLoadingWeddings] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [weddingModalVisible, setWeddingModalVisible] = useState(false);
  const [editWeddingModalVisible, setEditWeddingModalVisible] = useState(false);
  const [wishlistModalVisible, setWishlistModalVisible] = useState(false);
  const [wishlistViewModalVisible, setWishlistViewModalVisible] = useState(false);
  const [categoryDetailsModalVisible, setCategoryDetailsModalVisible] = useState(false);
  const [serviceDetailsModalVisible, setServiceDetailsModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [categoryStatus, setCategoryStatus] = useState('active');
  const [weddingName, setWeddingName] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedWedding, setSelectedWedding] = useState(null);
  const [categoryDetails, setCategoryDetails] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [categoryServices, setCategoryServices] = useState([]);
  const [availableServices, setAvailableServices] = useState([]);
  const [servicesError, setServicesError] = useState(null);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [goods, setGoods] = useState([]);
  const [selectedGoodIds, setSelectedGoodIds] = useState([]);
  const [wishlistFiles, setWishlistFiles] = useState({});
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [errorFiles, setErrorFiles] = useState(null);
  const [formData, setFormData] = useState({ category: '', item_name: '' });
  const [isCustomGift, setIsCustomGift] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [loadingServiceDetails, setLoadingServiceDetails] = useState(false);
  const [activeWeddingId, setActiveWeddingId] = useState(null);
  const [hasShownNoWeddingsAlert, setHasShownNoWeddingsAlert] = useState(false);
  const BASE_URL = process.env.EXPO_PUBLIC_API_baseURL;

  // Fetch event categories
  const fetchEventCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await api.getEventCategories();
      const categories = Array.isArray(response.data) ? response.data : response.data.data || [];
      setEventCategories(categories);
      return categories;
    } catch (error) {
      console.error('Error fetching event categories:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить категории мероприятий');
      setEventCategories([]);
      return [];
    } finally {
      setLoadingCategories(false);
    }
  };

  // Fetch available services
  const fetchAvailableServices = async () => {
    try {
      const response = await api.getServices();
      setAvailableServices(response.data.data || response.data || []);
      setServicesError(null);
    } catch (error) {
      console.error('Error fetching services:', error);
      setAvailableServices([]);
      setServicesError('Не удалось загрузить услуги.');
      return [];
    }
  };

  // Fetch weddings
  const fetchWeddings = async () => {
    setLoadingWeddings(true);
    try {
      const response = await api.getWedding(token);
      const weddingData = Array.isArray(response.data) ? response.data : response.data.data || [];
      setWeddings(weddingData);
      const itemsPromises = weddingData.map((wedding) =>
        api.getWeddingItems(wedding.id, token).then((res) => ({
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
      console.error('Error fetching weddings:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить свадьбы');
      setWeddings([]);
      setWeddingItemsCache({});
      return [];
    } finally {
      setLoadingWeddings(false);
    }
  };

  // Fetch goods
  const fetchGoods = async () => {
    try {
      const response = await api.getGoods(token);
      setGoods(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error fetching goods:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить товары');
    }
  };

  // Fetch event category details
  const fetchEventCategoryDetails = async (id) => {
    setLoadingDetails(true);
    try {
      const response = await api.getEventCategoryWithServices(id);
      const details = response.data.data || response.data;
      setCategoryDetails(details);
      return details;
    } catch (error) {
      console.error('Error fetching category details:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить детали категории');
      setCategoryDetails(null);
      return null;
    } finally {
      setLoadingDetails(false);
    }
  };

  // Fetch service details
const fetchServiceDetails = async (serviceId, serviceType) => {
  console.log('fetchServiceDetails started!', serviceId, serviceType);
  setLoadingServiceDetails(true);
  try {
    const endpoint = `/api/${serviceType.toLowerCase()}s/${serviceId}`;
    console.log('endpoint:', endpoint);
    const response = await api.fetchByEndpoint(endpoint);
    console.log('Service details response:', JSON.stringify(response.data, null, 2));
    const data = response.data.data || response.data;
    // Normalize field names
    return {
      serviceId,
      serviceType,
      name: data.name,
      description: data.description || null,
      cost: data.cost || null,
      created_at: data.createdAt || data.created_at || null,
      updated_at: data.updatedAt || data.updated_at || null,
      address: data.address || null,
      cuisine: data.cuisine || null,
      // Add other fields as needed
    };
  } catch (error) {
    console.error(`Error fetching service details for ${serviceType}/${serviceId}:`, error);
    Alert.alert('Ошибка', `Не удалось загрузить детали услуги: ${error.message}`);
    return null;
  } finally {
    setLoadingServiceDetails(false);
  }
};




  // Fetch item details
  const fetchItemDetails = async (itemType, itemId) => {
    setLoadingDetails(true);
    try {
      const endpoint = `/api/${itemType}/${itemId}`;
      const response = await api.fetchByEndpoint(endpoint);
      const details = Array.isArray(response.data) ? response.data[0] : response.data;
      return details || null;
    } catch (error) {
      console.error(`Error fetching details for ${itemType}:`, error);
      Alert.alert('Ошибка', 'Не удалось загрузить детали элемента');
      return null;
    } finally {
      setLoadingDetails(false);
    }
  };

  // Fetch files for wishlist items
  const fetchFiles = async (goodId) => {
    setLoadingFiles(true);
    setErrorFiles(null);
    try {
      const response = await axios.get(`${BASE_URL}/api/goods/${goodId}/files`);
      return response.data;
    } catch (error) {
      console.error('Error fetching files:', error);
      setErrorFiles('Ошибка загрузки файлов: ' + error.message);
      return [];
    } finally {
      setLoadingFiles(false);
    }
  };

  // Create event category
  const handleCreateEventCategory = async () => {
    if (!categoryName.trim()) {
      Alert.alert('Ошибка', 'Введите название категории');
      return;
    }
    try {
      const response = await api.createEventCategory({
        name: categoryName,
        description: categoryDescription,
        status: categoryStatus,
      });
      const newCategory = response.data.data || response.data;
      setEventCategories((prev) => [...prev, newCategory]);
      if (categoryServices.length > 0) {
        await api.addServicesToCategory(newCategory.id, {
          service_ids: categoryServices.map((s) => ({ serviceId: s.id, serviceType: s.serviceType })),
        });
      }
      Alert.alert('Успех', 'Категория мероприятия создана');
      setCategoryName('');
      setCategoryDescription('');
      setCategoryStatus('active');
      setCategoryServices([]);
      setCategoryModalVisible(false);
    } catch (error) {
      console.error('Error creating event category:', error);
      Alert.alert('Ошибка', `Не удалось создать категорию: ${error.message}`);
    }
  };

  // Update event category
  const handleUpdateEventCategory = async () => {
    if (!selectedCategory || !categoryName.trim()) {
      Alert.alert('Ошибка', 'Выберите категорию и введите название');
      return;
    }
    try {
      const response = await api.updateEventCategory(selectedCategory.id, {
        name: categoryName,
        description: categoryDescription,
        status: categoryStatus,
      });
      setEventCategories((prev) =>
        prev.map((cat) => (cat.id === selectedCategory.id ? response.data.data || response.data : cat))
      );
      await api.updateServicesForCategory(selectedCategory.id, {
        service_ids: categoryServices.map((s) => ({ serviceId: s.id, serviceType: s.serviceType })),
      });
      Alert.alert('Успех', 'Категория мероприятия обновлена');
      setCategoryName('');
      setCategoryDescription('');
      setCategoryStatus('active');
      setCategoryServices([]);
      setSelectedCategory(null);
      setCategoryModalVisible(false);
    } catch (error) {
      console.error('Error updating event category:', error);
      Alert.alert('Ошибка', `Не удалось обновить категорию: ${error.message}`);
    }
  };

  // Delete event category
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
              await api.deleteEventCategory(id);
              setEventCategories((prev) => prev.filter((cat) => cat.id !== id));
              Alert.alert('Успех', 'Категория мероприятия удалена');
            } catch (error) {
              console.error('Error deleting event category:', error);
              Alert.alert('Ошибка', `Не удалось удалить категорию: ${error.message}`);
            }
          },
        },
      ]
    );
  };

  // Create wedding
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
      const weddingData = {
        name: weddingName,
        date: weddingDate,
        items: selectedItems.map((item) => ({
          id: item.id,
          type: item.type,
          totalCost: item.totalCost || 0,
        })),
      };
      const response = await api.createWedding(weddingData, token);
      const newWedding = response.data.data;
      setWeddings((prev) => [...prev, newWedding]);
      setWeddingItemsCache((prev) => ({ ...prev, [newWedding.id]: [] }));
      Alert.alert('Успех', 'Свадьба создана');
      setWeddingModalVisible(false);
      setWeddingName('');
      setWeddingDate('');
      setHasShownNoWeddingsAlert(false);
      setActiveWeddingId(newWedding.id);
    } catch (error) {
      console.error('Error creating wedding:', error);
      Alert.alert('Ошибка', error.response?.data?.error || 'Не удалось создать свадьбу');
    }
  };

  // Update wedding
  const handleUpdateWedding = async () => {
    if (!selectedWedding || !weddingName || !weddingDate) {
      Alert.alert('Ошибка', 'Введите название и дату свадьбы');
      return;
    }
    try {
      const data = { name: weddingName, date: weddingDate };
      const response = await api.updateWedding(selectedWedding.id, token, data);
      setWeddings((prev) =>
        prev.map((w) => (w.id === selectedWedding.id ? response.data.data : w))
      );
      const itemsResponse = await api.getWeddingItems(selectedWedding.id, token);
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
      console.error('Error updating wedding:', error);
      Alert.alert('Ошибка', error.response?.data?.error || 'Не удалось обновить свадьбу');
    }
  };

  // Delete wedding
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
              await api.deleteWedding(id, token);
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
              console.error('Error deleting wedding:', error);
              Alert.alert('Ошибка', 'Не удалось удалить свадьбу');
            }
          },
        },
      ]
    );
  };

  // Delete wedding item
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
              await api.deleteWeddingItem(weddingItemId, token);
              const itemsResponse = await api.getWeddingItems(weddingId, token);
              setWeddingItemsCache((prev) => ({
                ...prev,
                [weddingId]: itemsResponse.data.data || [],
              }));
              Alert.alert('Успех', 'Элемент удален');
            } catch (error) {
              console.error('Error deleting wedding item:', error);
              Alert.alert('Ошибка', 'Не удалось удалить элемент: ' + error.message);
            }
          },
        },
      ]
    );
  };

  // Add wishlist item
  const handleAddWishlistItem = async () => {
    if (selectedGoodIds.length === 0) {
      Alert.alert('Ошибка', 'Выберите хотя бы один подарок');
      return;
    }
    try {
      const promises = selectedGoodIds.map((goodId) =>
        api.createWish({ wedding_id: selectedWedding.id, good_id: goodId }, token)
      );
      await Promise.all(promises);
      Alert.alert('Успех', 'Подарки добавлены');
      setWishlistModalVisible(false);
      setSelectedGoodIds([]);
      const itemsResponse = await api.getWeddingItems(selectedWedding.id, token);
      setWeddingItemsCache((prev) => ({
        ...prev,
        [selectedWedding.id]: itemsResponse.data.data || [],
      }));
    } catch (error) {
      console.error('Error adding wishlist items:', error);
      Alert.alert('Ошибка', error.response?.data?.error || 'Не удалось добавить подарки');
    }
  };

  // Add custom gift
  const handleAddCustomGift = async () => {
    if (!formData.item_name) {
      Alert.alert('Ошибка', 'Введите название подарка');
      return;
    }
    try {
      const giftData = {
        category: 'Miscellaneous',
        item_name: formData.item_name,
        cost: '0',
        supplier_id: userId,
      };
      const response = await api.postGoodsData(giftData);
      const newGood = response.data.data;
      await api.createWish({ wedding_id: selectedWedding.id, good_id: newGood.id }, token);
      Alert.alert('Успех', 'Собственный подарок добавлен');
      setFormData({ ...formData, item_name: '' });
      setWishlistModalVisible(false);
      await fetchWishlistItems(selectedWedding.id);
    } catch (error) {
      console.error('Error adding custom gift:', error);
      Alert.alert('Ошибка', 'Не удалось добавить подарок');
    }
  };

  // Fetch wishlist items
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
      Alert.alert('Ошибка', 'Не удалось загрузить список желаний');
    }
  };

  // Reserve wishlist item
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
              setWishlistItems((prev) =>
                prev.map((item) =>
                  item.id === wishlistId ? response.data.data : item
                )
              );
            } catch (error) {
              console.error('Error reserving wishlist item:', error);
              Alert.alert('Ошибка', error.response?.data?.error || 'Не удалось зарезервировать подарок');
            }
          },
        },
      ]
    );
  };

  // Share wedding link
  const handleShareWeddingLink = async (weddingId) => {
    try {
      const webLink = `${BASE_URL}/api/weddingwishes/${weddingId}`;
      await Share.share({
        message: webLink,
        title: 'Приглашение на свадьбу',
      });
    } catch (error) {
      console.error('Error sharing wedding link:', error);
      Alert.alert('Ошибка', 'Не удалось поделиться ссылкой');
    }
  };

  // Open edit category modal
  const openEditCategoryModal = async (category) => {
    setSelectedCategory(category);
    setCategoryName(category.name);
    setCategoryDescription(category.description || '');
    setCategoryStatus(category.status || 'active');
    const details = await fetchEventCategoryDetails(category.id);
    setCategoryServices(details?.services?.map((s) => ({ id: s.serviceId, serviceType: s.serviceType })) || []);
    setCategoryModalVisible(true);
  };

  // Open category details modal
  const openCategoryDetailsModal = async (category) => {
    setSelectedCategory(category);
    await fetchEventCategoryDetails(category.id);
    setCategoryDetailsModalVisible(true);
  };

  // Open service details modal
  // const openServiceDetailsModal = async (service) => {
  //   const details = await fetchServiceDetails(service.serviceId, service.serviceType);
  //   setSelectedService(details ? { ...service, ...details } : service);
  //   setServiceDetailsModalVisible(true);
  // };


  const openServiceDetailsModal = async (service) => {
  setLoadingServiceDetails(true);
  const details = await fetchServiceDetails(service.serviceId, service.serviceType);
  setLoadingServiceDetails(false);
  if (!details) {
    Alert.alert('Ошибка', `Не удалось загрузить детали услуги для ${service.serviceType}/${service.serviceId}`);
    return;
  }
  // Normalize the data to match the expected structure
  const normalizedDetails = {
    serviceId: service.serviceId,
    serviceType: service.serviceType,
    name: details.name || service.name || 'Без названия',
    description: details.description || service.description || 'Нет описания',
    cost: details.cost || service.cost || null,
    created_at: details.created_at || details.createdAt || service.created_at || null,
    updated_at: details.updated_at || details.updatedAt || service.updated_at || null,
    // Add other fields as needed based on API response
  };
  console.log('Normalized selectedService:', normalizedDetails); // Log to verify
  setSelectedService(normalizedDetails);
  setServiceDetailsModalVisible(true);
};




  // Open edit wedding modal
  const openEditWeddingModal = (wedding) => {
    setSelectedWedding(wedding);
    setWeddingName(wedding.name);
    setWeddingDate(wedding.date);
    setEditWeddingModalVisible(true);
  };

  // Open item details modal
  const openItemDetailsModal = async (weddingItem) => {
    const details = await fetchItemDetails(weddingItem.item_type, weddingItem.item_id);
    setSelectedItem(details ? { ...weddingItem, ...details } : weddingItem);
    setDetailsModalVisible(true);
  };

  // Handle date change
  const onDateChange = (day) => {
    setWeddingDate(day.dateString);
    setShowCalendar(false);
  };

  // Refresh data
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchEventCategories(), fetchAvailableServices(), fetchWeddings(), fetchGoods()]);
    setRefreshing(false);
  }, []);

  // Initialize data
  useEffect(() => {
    const initialize = async () => {
      setLoadingCategories(true);
      setLoadingWeddings(true);
      try {
        const [categoriesResponse, weddingsResponse, goodsResponse] = await Promise.all([
          api.getEventCategories(),
          api.getWedding(token),
          api.getGoods(token),
        ]);
        setEventCategories(Array.isArray(categoriesResponse.data) ? categoriesResponse.data : categoriesResponse.data.data || []);
        setWeddings(Array.isArray(weddingsResponse.data) ? weddingsResponse.data : weddingsResponse.data.data || []);
        setGoods(Array.isArray(goodsResponse.data) ? goodsResponse.data : goodsResponse.data.data || []);
        const itemsPromises = weddingsResponse.data.data.map((wedding) =>
          api.getWeddingItems(wedding.id, token).then((res) => ({
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
        await fetchAvailableServices();
      } catch (error) {
        console.error('Error initializing:', error);
        setEventCategories([]);
        setWeddings([]);
        setGoods([]);
        setWeddingItemsCache({});
      } finally {
        setLoadingCategories(false);
        setLoadingWeddings(false);
      }
    };
    initialize();
  }, []);

  // Check for no weddings alert
  useEffect(() => {
    if (!loadingWeddings && weddings.length === 0 && !hasShownNoWeddingsAlert) {
      setWeddingModalVisible(true);
      setHasShownNoWeddingsAlert(true);
    }
  }, [loadingWeddings, weddings, hasShownNoWeddingsAlert]);

  // Handle deep links
  useEffect(() => {
    const handleDeepLink = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        const { path, queryParams } = Linking.parse(initialUrl);
        console.log('Parsed path:', path, 'Params:', queryParams);
      }
      const subscription = Linking.addEventListener('url', ({ url }) => {
        const { path, queryParams } = Linking.parse(url);
        console.log('Parsed path:', path, 'Params:', queryParams);
      });
      return () => subscription.remove();
    };
    handleDeepLink();
  }, []);

  // Group items by category
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

  // Render event category item
  const renderEventCategoryItem = ({ item }) => (
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

  // Render wedding item
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
                            return `Неизвестный элемент - ${weddingItem.total_cost || 0} тг`;
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

  // Render combined list item
  const renderItem = ({ item }) => {
    if (item.type === 'category') {
      return renderEventCategoryItem({ item: item.data });
    } else if (item.type === 'wedding') {
      return renderWeddingItem({ item: item.data });
    }
    return null;
  };

  // Render good card
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
        <TouchableOpacity onPress={() => Linking.openURL(item.specs.goodLink)}>
          <Text style={styles.linkText}>Открыть ссылку</Text>
        </TouchableOpacity>
      )}
      {selectedGoodIds.includes(item.id) && (
        <Text style={styles.selectedIndicator}>✓</Text>
      )}
    </TouchableOpacity>
  );

  // Render wishlist item
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
                      <Text style={styles.detail}>Неподдерживаемый формат: {file.mimetype}</Text>
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

  // Render service in category
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

  // Render service item for selection
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

  // Combine categories and weddings for display
  const combinedData = [
    ...eventCategories.map((cat) => ({ type: 'category', data: cat })),
    ...weddings.map((wed) => ({ type: 'wedding', data: wed })),
  ];

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
          <Text style={styles.createButtonText}>Создать свадьбу</Text>
        </TouchableOpacity>
      </View>
      {loadingCategories || loadingWeddings ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={combinedData}
          renderItem={renderItem}
          keyExtractor={(item) => `${item.type}-${item.data.id}`}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.noItems}>Нет мероприятий или свадеб</Text>
            </View>
          }
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
        />
      )}

      {/* Category Modal */}
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
            <Text style={styles.sectionTitle}>Выберите услуги</Text>
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

      {/* Wedding Modal */}
      <Modal visible={weddingModalVisible} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <Text style={styles.subtitle}>Создание свадьбы</Text>
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
        </SafeAreaView>
      </Modal>

      {/* Edit Wedding Modal */}
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

      {/* Wishlist Modal */}
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

      {/* Wishlist View Modal */}
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

      {/* Category Details Modal */}
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

      {/* Service Details Modal */}
    

      <Modal visible={serviceDetailsModalVisible} transparent animationType="slide">
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Детали услуги</Text>
      {loadingServiceDetails ? (
        <ActivityIndicator size="large" color={COLORS.primary} />
      ) : selectedService ? (
        <ScrollView style={{ width: '100%' }}>
          <Text style={styles.modalText}>
            Название: {selectedService.name || 'Без названия'}
          </Text>
          <Text style={styles.modalText}>
            Тип: {selectedService.serviceType || 'Не указан'}
          </Text>
          <Text style={styles.modalText}>
            Описание: {selectedService.description || 'Нет описания'}
          </Text>
          {selectedService.cost ? (
            <Text style={styles.modalText}>
              Стоимость: {selectedService.cost} тг
            </Text>
          ) : (
            <Text style={styles.modalText}>Стоимость: Не указана</Text>
          )}
          {selectedService.created_at ? (
            <Text style={styles.modalText}>
              Создано: {new Date(selectedService.created_at).toLocaleString()}
            </Text>
          ) : (
            <Text style={styles.modalText}>Создано: Не указано</Text>
          )}
          {selectedService.updated_at ? (
            <Text style={styles.modalText}>
              Обновлено: {new Date(selectedService.updated_at).toLocaleString()}
            </Text>
          ) : (
            <Text style={styles.modalText}>Обновлено: Не указано</Text>
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




      {/* Item Details Modal */}
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
  infoText: {
    fontSize: 14,
    color: COLORS.muted,
    marginBottom: 10,
  },
  listContainer: {
    paddingBottom: 20,
  },
  serviceList: {
    paddingBottom: 20,
  },
});