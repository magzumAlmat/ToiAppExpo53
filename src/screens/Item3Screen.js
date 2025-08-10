
// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   Button,
//   StyleSheet,
//   FlatList,
//   Modal,
//   Alert,
//   TouchableOpacity,
//   Share,
//   ScrollView,
//   Image,
//   ActivityIndicator,
//   RefreshControl,
// } from 'react-native';
// import Video from 'react-native-video';
// import * as Linking from 'expo-linking';
// import { useRoute, useNavigation } from '@react-navigation/native';
// import { useSelector } from 'react-redux';
// import api from '../api/api';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import axios from 'axios';
// import { Calendar } from 'react-native-calendars';
// import { Picker } from '@react-native-picker/picker';

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
//   shadow: '#0000001A',
// };

// export default function Item3Screen() {
//   const route = useRoute();
//   const navigation = useNavigation();
//   const selectedItems = route.params?.data || [];
//   const userId = useSelector((state) => state.auth.user?.id);
//   const token = useSelector((state) => state.auth.token);
//   const [eventCategories, setEventCategories] = useState([]);
//   const [weddings, setWeddings] = useState([]);
//   const [weddingItemsCache, setWeddingItemsCache] = useState({});
//   const [categoryServicesCache, setCategoryServicesCache] = useState({});
//   const [loadingCategories, setLoadingCategories] = useState(true);
//   const [loadingWeddings, setLoadingWeddings] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [categoryModalVisible, setCategoryModalVisible] = useState(false);
//   const [weddingModalVisible, setWeddingModalVisible] = useState(false);
//   const [editWeddingModalVisible, setEditWeddingModalVisible] = useState(false);
//   const [wishlistModalVisible, setWishlistModalVisible] = useState(false);
//   const [wishlistViewModalVisible, setWishlistViewModalVisible] = useState(false);
//   const [categoryDetailsModalVisible, setCategoryDetailsModalVisible] = useState(false);
//   const [serviceDetailsModalVisible, setServiceDetailsModalVisible] = useState(false);
//   const [detailsModalVisible, setDetailsModalVisible] = useState(false);
//   const [categoryName, setCategoryName] = useState('');
//   const [categoryDescription, setCategoryDescription] = useState('');
//   const [categoryStatus, setCategoryStatus] = useState('active');
//   const [weddingName, setWeddingName] = useState('');
//   const [weddingDate, setWeddingDate] = useState('');
//   const [showCalendar, setShowCalendar] = useState(false);
//   const [selectedCategory, setSelectedCategory] = useState(null);
//   const [selectedWedding, setSelectedWedding] = useState(null);
//   const [categoryDetails, setCategoryDetails] = useState(null);
//   const [selectedService, setSelectedService] = useState(null);
//   const [categoryServices, setCategoryServices] = useState([]);
//   const [availableServices, setAvailableServices] = useState([]);
//   const [servicesError, setServicesError] = useState(null);
//   const [wishlistItems, setWishlistItems] = useState([]);
//   const [goods, setGoods] = useState([]);
//   const [selectedGoodIds, setSelectedGoodIds] = useState([]);
//   const [wishlistFiles, setWishlistFiles] = useState({});
//   const [loadingFiles, setLoadingFiles] = useState(false);
//   const [errorFiles, setErrorFiles] = useState(null);
//   const [formData, setFormData] = useState({ category: '', item_name: '' });
//   const [isCustomGift, setIsCustomGift] = useState(false);
//   const [selectedItem, setSelectedItem] = useState(null);
//   const [loadingDetails, setLoadingDetails] = useState(false);
//   const [loadingServiceDetails, setLoadingServiceDetails] = useState(false);
//   const [activeWeddingId, setActiveWeddingId] = useState(null);
//   const [hasShownNoWeddingsAlert, setHasShownNoWeddingsAlert] = useState(false);
//   const BASE_URL = process.env.EXPO_PUBLIC_API_baseURL;

//   // Fetch event categories with services
//   const fetchEventCategories = async () => {
//     setLoadingCategories(true);
//     try {
//       const response = await api.getEventCategories();
//       const categories = Array.isArray(response.data) ? response.data : response.data.data || [];
//       setEventCategories(categories);

//       // Fetch services for each category
//       const servicesPromises = categories.map((category) =>
//         api.getEventCategoryWithServices(category.id).then((res) => ({
//           categoryId: category.id,
//           services: res.data.data.services || [],
//         }))
//       );
//       const servicesResults = await Promise.all(servicesPromises);
//       const newCache = servicesResults.reduce((acc, { categoryId, services }) => {
//         acc[categoryId] = services;
//         return acc;
//       }, {});
//       setCategoryServicesCache(newCache);
//       return categories;
//     } catch (error) {
//       console.error('Error fetching event categories:', error);
//       Alert.alert('Ошибка', 'Не удалось загрузить категории мероприятий');
//       setEventCategories([]);
//       setCategoryServicesCache({});
//       return [];
//     } finally {
//       setLoadingCategories(false);
//     }
//   };

//   // Fetch available services
//   const fetchAvailableServices = async () => {
//     try {
//       const response = await api.getServices();
//       setAvailableServices(response.data.data || response.data || []);
//       setServicesError(null);
//     } catch (error) {
//       console.error('Error fetching services:', error);
//       setAvailableServices([]);
//       setServicesError('Не удалось загрузить услуги.');
//       return [];
//     }
//   };

//   // Fetch weddings
//   const fetchWeddings = async () => {
//     setLoadingWeddings(true);
//     try {
//       const response = await api.getWedding(token);
//       const weddingData = Array.isArray(response.data) ? response.data : response.data.data || [];
//       setWeddings(weddingData);
//       const itemsPromises = weddingData.map((wedding) =>
//         api.getWeddingItems(wedding.id, token).then((res) => ({
//           weddingId: wedding.id,
//           items: res.data.data || [],
//         }))
//       );
//       const itemsResults = await Promise.all(itemsPromises);
//       const newCache = itemsResults.reduce((acc, { weddingId, items }) => {
//         acc[weddingId] = items;
//         return acc;
//       }, {});
//       setWeddingItemsCache(newCache);
//       return weddingData;
//     } catch (error) {
//       console.error('Error fetching weddings:', error);
//       Alert.alert('Ошибка', 'Не удалось загрузить свадьбы');
//       setWeddings([]);
//       setWeddingItemsCache({});
//       return [];
//     } finally {
//       setLoadingWeddings(false);
//     }
//   };

//   // Fetch goods
//   const fetchGoods = async () => {
//     try {
//       const response = await api.getGoods(token);
//       setGoods(response.data.data || response.data || []);
//     } catch (error) {
//       console.error('Error fetching goods:', error);
//       Alert.alert('Ошибка', 'Не удалось загрузить товары');
//     }
//   };

//   // Fetch event category details

//   const fetchEventCategoryDetails = async (id) => {
//     setLoadingDetails(true);
//     try {
//       const response = await api.getEventCategoryWithServices(id);
//       const details = response.data.data || response.data;
//       setCategoryDetails(details);
//       setCategoryServicesCache((prev) => ({
//         ...prev,
//         [id]: details.services || [],
//       }));
//       return details;
//     } catch (error) {
//       console.error('Error fetching category details:', error);
//       Alert.alert('Ошибка', 'Не удалось загрузить детали категории');
//       setCategoryDetails(null);
//       return null;
//     } finally {
//       setLoadingDetails(false);
//     }
//   };

//   // Fetch service details

 
//   //   const response = await api.getCakeById(id); // Используем правильный метод
   


//   // const fetchServiceDetails = async (serviceId, serviceType) => {
//   //   setLoadingServiceDetails(true);
//   //   try {
//   //     // Map serviceType to correct endpoint path
//   //     const endpointMap = {
//   //       restaurant: 'restaurants',
//   //       clothing: 'clothing',
//   //       tamada: 'tamada',
//   //       program: 'program',
//   //       traditionalGift: 'traditional-gift',
//   //       flowers: 'flowers',
//   //       cake: 'cake',
//   //       alcohol: 'alcohol',
//   //       transport: 'transport',
//   //       jewelry: 'jewelry',
//   //     };
//   //     const endpointPath = endpointMap[serviceType] || serviceType;
//   //     const endpoint = `/api/${endpointPath}/${serviceId}`;
//   //     const response = await api.fetchByEndpoint(endpoint);
//   //     const data = response.data.data || response.data;
//   //     return {
//   //       serviceId,
//   //       serviceType,
//   //       name: data.name,
//   //       description: data.description || null,
//   //       cost: data.cost || null,
//   //       created_at: data.createdAt || data.created_at || null,
//   //       updated_at: data.updatedAt || data.updated_at || null,
//   //       address: data.address || null,
//   //       cuisine: data.cuisine || null,
//   //     };
//   //   } catch (error) {
//   //     console.error(`Error fetching service details for ${serviceType}/${serviceId}:`, error);
//   //     Alert.alert('Ошибка', `Не удалось загрузить детали услуги: ${error.message}`);
//   //     return null;
//   //   } finally {
//   //     setLoadingServiceDetails(false);
//   //   }
//   // };




// const fetchServiceDetails = async (serviceId, serviceType) => {
//   setLoadingServiceDetails(true);
//   try {
//     // Map serviceType to the correct API method
//     const methodMap = {
//       restaurant: 'getRestaurantById',
//       clothing: 'getClothingById',
//       tamada: 'getTamadaById',
//       program: 'getProgramById',
//       traditionalGift: 'getTraditionalGiftById',
//       flowers: 'getFlowersById',
//       cake: 'getCakeById',
//       alcohol: 'getAlcoholById',
//       transport: 'getTransportById',
//       jewelry: 'getJewelryById',
//       wedding: 'getWeddingById',
//       eventCategory: 'getEventCategoryById',
//       wishlist: 'getWishlistById', // Если есть метод для получения wishlist по ID
//     };

//     // Получаем метод API для указанного типа сервиса
//     const methodName = methodMap[serviceType];
//     if (!methodName || !api[methodName]) {
//       throw new Error(`Неизвестный тип сервиса: ${serviceType}`);
//     }

//     // Вызываем соответствующий метод API
//     const response = await api[methodName](serviceId);
//     const data = response.data.data || response.data;

//     // Формируем единообразный ответ
//     return {
//       serviceId,
//       serviceType,
//       name: data.name,
//       description: data.description || null,
//       cost: data.cost || null,
//       created_at: data.createdAt || data.created_at || null,
//       updated_at: data.updatedAt || data.updated_at || null,
//       address: data.address || null,
//       cuisine: data.cuisine || null,
//     };
//   } catch (error) {
//     console.error(`Error fetching service details for ${serviceType}/${serviceId}:`, error);
//     Alert.alert('Ошибка', `Не удалось загрузить детали услуги: ${error.message}`);
//     return null;
//   } finally {
//     setLoadingServiceDetails(false);
//   }
// };



//   // Fetch item details


//   const fetchItemDetails = async (itemType, itemId) => {
//     setLoadingDetails(true);
//     try {
//       // Map itemType to correct endpoint path
//       const endpointMap = {
//         restaurant: 'restaurants',
//         clothing: 'clothing',
//         tamada: 'tamada',
//         program: 'program',
//         traditionalGift: 'traditional-gift',
//         flowers: 'flowers',
//         cake: 'cake',
//         alcohol: 'alcohol',
//         transport: 'transport',
//         goods: 'goods',
//         jewelry: 'jewelry',
//       };
//       const endpointPath = endpointMap[itemType] || itemType;
//       const endpoint = `/api/${endpointPath}/${itemId}`;
//       const response = await api.fetchByEndpoint(endpoint);
//       const details = Array.isArray(response.data) ? response.data[0] : response.data;
//       return details || null;
//     } catch (error) {
//       console.error(`Error fetching details for ${itemType}:`, error);
//       Alert.alert('Ошибка', 'Не удалось загрузить детали элемента');
//       return null;
//     } finally {
//       setLoadingDetails(false);
//     }
//   };

//   // Fetch files for wishlist items
//   const fetchFiles = async (goodId) => {
//     setLoadingFiles(true);
//     setErrorFiles(null);
//     try {
//       const response = await axios.get(`${BASE_URL}/api/goods/${goodId}/files`);
//       return response.data;
//     } catch (error) {
//       console.error('Error fetching files:', error);
//       setErrorFiles('Ошибка загрузки файлов: ' + error.message);
//       return [];
//     } finally {
//       setLoadingFiles(false);
//     }
//   };

//   // Create event category
//   const handleCreateEventCategory = async () => {
//     if (!categoryName.trim()) {
//       Alert.alert('Ошибка', 'Введите название категории');
//       return;
//     }
//     try {
//       const response = await api.createEventCategory({
//         name: categoryName,
//         description: categoryDescription,
//         status: categoryStatus,
//       });
//       const newCategory = response.data.data || response.data;
//       setEventCategories((prev) => [...prev, newCategory]);
//       if (categoryServices.length > 0) {
//         await api.addServicesToCategory(newCategory.id, {
//           service_ids: categoryServices.map((s) => ({ serviceId: s.id, serviceType: s.serviceType })),
//         });
//         setCategoryServicesCache((prev) => ({
//           ...prev,
//           [newCategory.id]: categoryServices,
//         }));
//       }
//       Alert.alert('Успех', 'Категория мероприятия создана');
//       setCategoryName('');
//       setCategoryDescription('');
//       setCategoryStatus('active');
//       setCategoryServices([]);
//       setCategoryModalVisible(false);
//     } catch (error) {
//       console.error('Error creating event category:', error);
//       Alert.alert('Ошибка', `Не удалось создать категорию: ${error.message}`);
//     }
//   };

//   // Update event category
//   const handleUpdateEventCategory = async () => {
//     if (!selectedCategory || !categoryName.trim()) {
//       Alert.alert('Ошибка', 'Выберите категорию и введите название');
//       return;
//     }
//     try {
//       const response = await api.updateEventCategory(selectedCategory.id, {
//         name: categoryName,
//         description: categoryDescription,
//         status: categoryStatus,
//       });
//       setEventCategories((prev) =>
//         prev.map((cat) => (cat.id === selectedCategory.id ? response.data.data || response.data : cat))
//       );
//       await api.updateServicesForCategory(selectedCategory.id, {
//         service_ids: categoryServices.map((s) => ({ serviceId: s.id, serviceType: s.serviceType })),
//       });
//       setCategoryServicesCache((prev) => ({
//         ...prev,
//         [selectedCategory.id]: categoryServices,
//       }));
//       Alert.alert('Успех', 'Категория мероприятия обновлена');
//       setCategoryName('');
//       setCategoryDescription('');
//       setCategoryStatus('active');
//       setCategoryServices([]);
//       setSelectedCategory(null);
//       setCategoryModalVisible(false);
//     } catch (error) {
//       console.error('Error updating event category:', error);
//       Alert.alert('Ошибка', `Не удалось обновить категорию: ${error.message}`);
//     }
//   };

//   // Delete event category
//   const handleDeleteEventCategory = (id) => {
//     Alert.alert(
//       'Подтверждение',
//       'Вы уверены, что хотите удалить эту категорию?',
//       [
//         { text: 'Отмена', style: 'cancel' },
//         {
//           text: 'Удалить',
//           onPress: async () => {
//             try {
//               await api.deleteEventCategory(id);
//               setEventCategories((prev) => prev.filter((cat) => cat.id !== id));
//               setCategoryServicesCache((prev) => {
//                 const newCache = { ...prev };
//                 delete newCache[id];
//                 return newCache;
//               });
//               Alert.alert('Успех', 'Категория мероприятия удалена');
//             } catch (error) {
//               console.error('Error deleting event category:', error);
//               Alert.alert('Ошибка', `Не удалось удалить категорию: ${error.message}`);
//             }
//           },
//         },
//       ]
//     );
//   };

//   // Delete service from category
//   const handleDeleteCategoryService = async (categoryId, serviceId, serviceType) => {
//     Alert.alert(
//       'Подтверждение',
//       'Вы уверены, что хотите удалить эту услугу из категории?',
//       [
//         { text: 'Отмена', style: 'cancel' },
//         {
//           text: 'Удалить',
//           onPress: async () => {
//             try {
//               await api.removeServiceFromCategory(categoryId, { serviceId, serviceType });
//               setCategoryServicesCache((prev) => ({
//                 ...prev,
//                 [categoryId]: prev[categoryId].filter(
//                   (s) => !(s.serviceId === serviceId && s.serviceType === serviceType)
//                 ),
//               }));
//               Alert.alert('Успех', 'Услуга удалена из категории');
//             } catch (error) {
//               console.error('Error deleting category service:', error);
//               Alert.alert('Ошибка', 'Не удалось удалить услугу: ' + error.message);
//             }
//           },
//         },
//       ]
//     );
//   };

//   // Create wedding
//   const handleCreateWedding = async () => {
//     if (!weddingName || !weddingDate) {
//       Alert.alert('Ошибка', 'Введите название и дату свадьбы');
//       return;
//     }
//     const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
//     if (!dateRegex.test(weddingDate)) {
//       Alert.alert('Ошибка', 'Дата должна быть в формате ГГГГ-ММ-ДД');
//       return;
//     }
//     try {
//       const weddingData = {
//         name: weddingName,
//         date: weddingDate,
//         items: selectedItems.map((item) => ({
//           id: item.id,
//           type: item.type,
//           totalCost: item.totalCost || 0,
//         })),
//       };
//       const response = await api.createWedding(weddingData, token);
//       const newWedding = response.data.data;
//       setWeddings((prev) => [...prev, newWedding]);
//       setWeddingItemsCache((prev) => ({ ...prev, [newWedding.id]: [] }));
//       Alert.alert('Успех', 'Свадьба создана');
//       setWeddingModalVisible(false);
//       setWeddingName('');
//       setWeddingDate('');
//       setHasShownNoWeddingsAlert(false);
//       setActiveWeddingId(newWedding.id);
//     } catch (error) {
//       console.error('Error creating wedding:', error);
//       Alert.alert('Ошибка', error.response?.data?.error || 'Не удалось создать свадьбу');
//     }
//   };

//   // Update wedding
//   const handleUpdateWedding = async () => {
//     if (!selectedWedding || !weddingName || !weddingDate) {
//       Alert.alert('Ошибка', 'Введите название и дату свадьбы');
//       return;
//     }
//     try {
//       const data = { name: weddingName, date: weddingDate };
//       const response = await api.updateWedding(selectedWedding.id, token, data);
//       setWeddings((prev) =>
//         prev.map((w) => (w.id === selectedWedding.id ? response.data.data : w))
//       );
//       const itemsResponse = await api.getWeddingItems(selectedWedding.id, token);
//       setWeddingItemsCache((prev) => ({
//         ...prev,
//         [selectedWedding.id]: itemsResponse.data.data || [],
//       }));
//       Alert.alert('Успех', 'Свадьба обновлена');
//       setEditWeddingModalVisible(false);
//       setWeddingName('');
//       setWeddingDate('');
//       setSelectedWedding(null);
//     } catch (error) {
//       console.error('Error updating wedding:', error);
//       Alert.alert('Ошибка', error.response?.data?.error || 'Не удалось обновить свадьбу');
//     }
//   };

//   // Delete wedding
//   const handleDeleteWedding = (id) => {
//     Alert.alert(
//       'Подтверждение',
//       'Вы уверены, что хотите удалить эту свадьбу?',
//       [
//         { text: 'Отмена', style: 'cancel' },
//         {
//           text: 'Удалить',
//           onPress: async () => {
//             try {
//               await api.deleteWedding(id, token);
//               setWeddings((prev) => prev.filter((w) => w.id !== id));
//               setWeddingItemsCache((prev) => {
//                 const newCache = { ...prev };
//                 delete newCache[id];
//                 return newCache;
//               });
//               Alert.alert('Успех', 'Свадьба удалена');
//               if (activeWeddingId === id) {
//                 const newWeddingId = weddings.find((w) => w.id !== id)?.id || null;
//                 setActiveWeddingId(newWeddingId);
//               }
//             } catch (error) {
//               console.error('Error deleting wedding:', error);
//               Alert.alert('Ошибка', 'Не удалось удалить свадьбу');
//             }
//           },
//         },
//       ]
//     );
//   };

//   // Delete wedding item
//   const handleDeleteWeddingItem = async (weddingItemId) => {
//     Alert.alert(
//       'Подтверждение',
//       'Вы уверены, что хотите удалить этот элемент?',
//       [
//         { text: 'Отмена', style: 'cancel' },
//         {
//           text: 'Удалить',
//           onPress: async () => {
//             try {
//               const weddingItem = Object.values(weddingItemsCache)
//                 .flat()
//                 .find((item) => item.id === weddingItemId);
//               const weddingId = weddingItem?.wedding_id;
//               await api.deleteWeddingItem(weddingItemId, token);
//               const itemsResponse = await api.getWeddingItems(weddingId, token);
//               setWeddingItemsCache((prev) => ({
//                 ...prev,
//                 [weddingId]: itemsResponse.data.data || [],
//               }));
//               Alert.alert('Успех', 'Элемент удален');
//             } catch (error) {
//               console.error('Error deleting wedding item:', error);
//               Alert.alert('Ошибка', 'Не удалось удалить элемент: ' + error.message);
//             }
//           },
//         },
//       ]
//     );
//   };

//   // Add wishlist item
//   const handleAddWishlistItem = async () => {
//     if (selectedGoodIds.length === 0) {
//       Alert.alert('Ошибка', 'Выберите хотя бы один подарок');
//       return;
//     }
//     try {
//       const promises = selectedGoodIds.map((goodId) =>
//         api.createWish({ wedding_id: selectedWedding.id, good_id: goodId }, token)
//       );
//       await Promise.all(promises);
//       Alert.alert('Успех', 'Подарки добавлены');
//       setWishlistModalVisible(false);
//       setSelectedGoodIds([]);
//       const itemsResponse = await api.getWeddingItems(selectedWedding.id, token);
//       setWeddingItemsCache((prev) => ({
//         ...prev,
//         [selectedWedding.id]: itemsResponse.data.data || [],
//       }));
//     } catch (error) {
//       console.error('Error adding wishlist items:', error);
//       Alert.alert('Ошибка', error.response?.data?.error || 'Не удалось добавить подарки');
//     }
//   };

//   // Add custom gift
//   const handleAddCustomGift = async () => {
//     if (!formData.item_name) {
//       Alert.alert('Ошибка', 'Введите название подарка');
//       return;
//     }
//     try {
//       const giftData = {
//         category: 'Miscellaneous',
//         item_name: formData.item_name,
//         cost: '0',
//         supplier_id: userId,
//       };
//       const response = await api.postGoodsData(giftData);
//       const newGood = response.data.data;
//       await api.createWish({ wedding_id: selectedWedding.id, good_id: newGood.id }, token);
//       Alert.alert('Успех', 'Собственный подарок добавлен');
//       setFormData({ ...formData, item_name: '' });
//       setWishlistModalVisible(false);
//       await fetchWishlistItems(selectedWedding.id);
//     } catch (error) {
//       console.error('Error adding custom gift:', error);
//       Alert.alert('Ошибка', 'Не удалось добавить подарок');
//     }
//   };

//   // Fetch wishlist items
//   const fetchWishlistItems = async (weddingId) => {
//     try {
//       const response = await api.getWishlistByWeddingId(weddingId, token);
//       const items = response.data.data;
//       setWishlistItems(items);
//       const filesPromises = items
//         .filter((item) => item.good_id)
//         .map((item) =>
//           fetchFiles(item.good_id).then((files) => ({
//             goodId: item.good_id,
//             files,
//           }))
//         );
//       const filesResults = await Promise.all(filesPromises);
//       const newWishlistFiles = filesResults.reduce((acc, { goodId, files }) => {
//         acc[goodId] = files;
//         return acc;
//       }, {});
//       setWishlistFiles((prev) => ({ ...prev, ...newWishlistFiles }));
//       setWishlistViewModalVisible(true);
//     } catch (error) {
//       console.error('Error fetching wishlist items:', error);
//       Alert.alert('Ошибка', 'Не удалось загрузить список желаний');
//     }
//   };

//   // Reserve wishlist item
//   const handleReserveWishlistItem = async (wishlistId) => {
//     Alert.alert(
//       'Подтверждение',
//       'Вы хотите зарезервировать этот подарок?',
//       [
//         { text: 'Отмена', style: 'cancel' },
//         {
//           text: 'Зарезервировать',
//           onPress: async () => {
//             try {
//               const response = await api.reserveWishlistItem(wishlistId, token);
//               Alert.alert('Успех', 'Подарок зарезервирован');
//               setWishlistItems((prev) =>
//                 prev.map((item) =>
//                   item.id === wishlistId ? response.data.data : item
//                 )
//               );
//             } catch (error) {
//               console.error('Error reserving wishlist item:', error);
//               Alert.alert('Ошибка', error.response?.data?.error || 'Не удалось зарезервировать подарок');
//             }
//           },
//         },
//       ]
//     );
//   };

//   // Share wedding link
//   const handleShareWeddingLink = async (weddingId) => {
//     try {
//       const webLink = `${BASE_URL}/api/weddingwishes/${weddingId}`;
//       await Share.share({
//         message: webLink,
//         title: 'Приглашение на свадьбу',
//       });
//     } catch (error) {
//       console.error('Error sharing wedding link:', error);
//       Alert.alert('Ошибка', 'Не удалось поделиться ссылкой');
//     }
//   };

//   // Open edit category modal
//   const openEditCategoryModal = async (category) => {
//     setSelectedCategory(category);
//     setCategoryName(category.name);
//     setCategoryDescription(category.description || '');
//     setCategoryStatus(category.status || 'active');
//     const details = await fetchEventCategoryDetails(category.id);
//     setCategoryServices(details?.services?.map((s) => ({ id: s.serviceId, serviceType: s.serviceType })) || []);
//     setCategoryModalVisible(true);
//   };

//   // Open category details modal
//   const openCategoryDetailsModal = async (category) => {
//     setSelectedCategory(category);
//     await fetchEventCategoryDetails(category.id);
//     setCategoryDetailsModalVisible(true);
//   };

//   // Open service details modal
//   const openServiceDetailsModal = async (service) => {
//     console.log('Service details:', service); // Логируем объект service
//     setServiceDetailsModalVisible(true);
//     setLoadingServiceDetails(true);
//     const details = await fetchServiceDetails(service.serviceId, service.serviceType);
//     if (details) {
//       setSelectedService(details);
//     } else {
//       setSelectedService(service);
//       Alert.alert('Ошибка', `Не удалось загрузить полные детали для услуги ${service.name}`);
//     }
//     setLoadingServiceDetails(false);
//   };

//   // Open edit wedding modal
//   const openEditWeddingModal = (wedding) => {
//     setSelectedWedding(wedding);
//     setWeddingName(wedding.name);
//     setWeddingDate(wedding.date);
//     setEditWeddingModalVisible(true);
//   };

//   // Open item details modal
//   const openItemDetailsModal = async (weddingItem) => {
//     const details = await fetchItemDetails(weddingItem.item_type, weddingItem.item_id);
//     setSelectedItem(details ? { ...weddingItem, ...details } : weddingItem);
//     setDetailsModalVisible(true);
//   };

//   // Handle date change
//   const onDateChange = (day) => {
//     setWeddingDate(day.dateString);
//     setShowCalendar(false);
//   };

//   // Refresh data
//   const onRefresh = useCallback(async () => {
//     setRefreshing(true);
//     await Promise.all([fetchEventCategories(), fetchAvailableServices(), fetchWeddings(), fetchGoods()]);
//     setRefreshing(false);
//   }, []);

//   // Initialize data
//   useEffect(() => {
//     const initialize = async () => {
//       setLoadingCategories(true);
//       setLoadingWeddings(true);
//       try {
//         const [categoriesResponse, weddingsResponse, goodsResponse] = await Promise.all([
//           api.getEventCategories(),
//           api.getWedding(token),
//           api.getGoods(token),
//         ]);
//         const categories = Array.isArray(categoriesResponse.data) ? categoriesResponse.data : categoriesResponse.data.data || [];
//         setEventCategories(categories);
//         setWeddings(Array.isArray(weddingsResponse.data) ? weddingsResponse.data : weddingsResponse.data.data || []);
//         setGoods(Array.isArray(goodsResponse.data) ? goodsResponse.data : goodsResponse.data.data || []);

//         // Cache wedding items
//         const itemsPromises = weddingsResponse.data.data.map((wedding) =>
//           api.getWeddingItems(wedding.id, token).then((res) => ({
//             weddingId: wedding.id,
//             items: res.data.data || [],
//           }))
//         );
//         const itemsResults = await Promise.all(itemsPromises);
//         const newWeddingCache = itemsResults.reduce((acc, { weddingId, items }) => {
//           acc[weddingId] = items;
//           return acc;
//         }, {});
//         setWeddingItemsCache(newWeddingCache);

//         // Cache category services
//         const servicesPromises = categories.map((category) =>
//           api.getEventCategoryWithServices(category.id).then((res) => ({
//             categoryId: category.id,
//             services: res.data.data.services || [],
//           }))
//         );
//         const servicesResults = await Promise.all(servicesPromises);
//         const newCategoryCache = servicesResults.reduce((acc, { categoryId, services }) => {
//           acc[categoryId] = services;
//           return acc;
//         }, {});
//         setCategoryServicesCache(newCategoryCache);

//         await fetchAvailableServices();
//       } catch (error) {
//         console.error('Error initializing:', error);
//         setEventCategories([]);
//         setWeddings([]);
//         setGoods([]);
//         setWeddingItemsCache({});
//         setCategoryServicesCache({});
//       } finally {
//         setLoadingCategories(false);
//         setLoadingWeddings(false);
//       }
//     };
//     initialize();
//   }, []);

//   // Check for no weddings alert
//   useEffect(() => {
//     if (!loadingWeddings && weddings.length === 0 && !hasShownNoWeddingsAlert) {
//       setWeddingModalVisible(true);
//       setHasShownNoWeddingsAlert(true);
//     }
//   }, [loadingWeddings, weddings, hasShownNoWeddingsAlert]);

//   // Handle deep links
//   useEffect(() => {
//     const handleDeepLink = async () => {
//       const initialUrl = await Linking.getInitialURL();
//       if (initialUrl) {
//         const { path, queryParams } = Linking.parse(initialUrl);
//         console.log('Parsed path:', path, 'Params:', queryParams);
//       }
//       const subscription = Linking.addEventListener('url', ({ url }) => {
//         const { path, queryParams } = Linking.parse(url);
//         console.log('Parsed path:', path, 'Params:', queryParams);
//       });
//       return () => subscription.remove();
//     };
//     handleDeepLink();
//   }, []);

//   // Group items by category
//   const groupItemsByCategory = (items) => {
//     const categoryMap = {
//       restaurants: 'Рестораны',
//       clothing: 'Одежда',
//       tamada: 'Тамада',
//       program: 'Программы',
//       'traditional-gift': 'Традиционные подарки',
//       flowers: 'Цветы',
//       cakes: 'Торты',
//       alcohol: 'Алкоголь',
//       transport: 'Транспорт',
//       goods: 'Товары',
//       jewelry: 'Ювелирные изделия',
//     };
//     const grouped = items.reduce((acc, item) => {
//       const category = item.item_type || item.serviceType;
//       if (!acc[category]) {
//         acc[category] = { name: categoryMap[category] || category, items: [] };
//       }
//       acc[category].items.push(item);
//       return acc;
//     }, {});
//     return Object.values(grouped).sort((a, b) => a.name.localeCompare(b.name));
//   };

//   // Render event category item
//   const renderEventCategoryItem = ({ item }) => {
//     const filteredServices = categoryServicesCache[item.id] || [];
//     const groupedServices = groupItemsByCategory(filteredServices);
//     return (
//       <View style={styles.itemContainer}>
//         <Text style={styles.itemText}>
//           {item.name} ({item.status === 'active' ? 'Активно' : 'Неактивно'})
//         </Text>
//         <Text style={styles.itemSubText}>
//           Описание: {item.description || 'Нет описания'}
//         </Text>
//         {groupedServices.length > 0 ? (
//           <View style={styles.weddingItemsContainer}>
//             {groupedServices.map((group) => (
//               <View key={group.name} style={styles.categorySection}>
//                 <Text style={styles.categoryTitle}>{group.name}</Text>
//                 {group.items.map((service) => (
//                   <View
//                     key={`${service.serviceType}-${service.serviceId}`}
//                     style={styles.weddingItem}
//                   >
//                     <Text style={styles.subItemText}>
//                       {service.name} {service.cost ? `- ${service.cost} тг` : ''}
//                     </Text>
//                     <View style={styles.itemActions}>
//                       <TouchableOpacity
//                         style={styles.detailsButton}
//                         onPress={() => openServiceDetailsModal(service)}
//                       >
//                         <Text style={styles.detailsButtonText}>Подробнее</Text>
//                       </TouchableOpacity>
//                       <TouchableOpacity
//                         style={styles.deleteButton}
//                         onPress={() => handleDeleteCategoryService(item.id, service.serviceId, service.serviceType)}
//                       >
//                         <Text style={styles.deleteButtonText}>Удалить</Text>
//                       </TouchableOpacity>
//                     </View>
//                   </View>
//                 ))}
//               </View>
//             ))}
//           </View>
//         ) : (
//           <View style={styles.emptyItemsContainer}>
//             <Text style={styles.noItems}>Нет услуг для этой категории</Text>
//             <TouchableOpacity
//               style={styles.addItemsButton}
//               onPress={() => openEditCategoryModal(item)}
//             >
//               <Text style={styles.addItemsButtonText}>Добавить услуги</Text>
//             </TouchableOpacity>
//           </View>
//         )}
//         <View style={styles.buttonRow}>
//           <TouchableOpacity
//             style={styles.actionButtonPrimary}
//             onPress={() => openCategoryDetailsModal(item)}
//           >
//             <Text style={styles.actionButtonText}>Подробнее</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={styles.actionButtonSecondary}
//             onPress={() => openEditCategoryModal(item)}
//           >
//             <Text style={styles.actionButtonText}>Редактировать</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={styles.actionButtonError}
//             onPress={() => handleDeleteEventCategory(item.id)}
//           >
//             <Text style={styles.actionButtonText}>Удалить</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     );
//   };

//   // Render wedding item
//   const renderWeddingItem = ({ item }) => {
//     const filteredItems = weddingItemsCache[item.id] || [];
//     const groupedItems = groupItemsByCategory(filteredItems);
//     return (
//       <View style={styles.itemContainer}>
//         <Text style={styles.itemText}>
//           {item.name} ({item.date})
//         </Text>
//         {groupedItems.length > 0 ? (
//           <View style={styles.weddingItemsContainer}>
//             {groupedItems.map((category) => (
//               <View key={category.name} style={styles.categorySection}>
//                 <Text style={styles.categoryTitle}>{category.name}</Text>
//                 {category.items.map((weddingItem) => (
//                   <View
//                     key={`${weddingItem.item_type}-${weddingItem.id}`}
//                     style={styles.weddingItem}
//                   >
//                     <Text style={styles.subItemText}>
//                       {(() => {
//                         switch (weddingItem.item_type) {
//                           case 'restaurants':
//                             return `Ресторан - ${weddingItem.total_cost || 0} тг`;
//                           case 'clothing':
//                             return `Одежда - ${weddingItem.total_cost || 0} тг`;
//                           case 'tamada':
//                             return `Тамада - ${weddingItem.total_cost || 0} тг`;
//                           case 'program':
//                             return `Программа - ${weddingItem.total_cost || 0} тг`;
//                           case 'traditional-gift':
//                             return `Традиционный подарок - ${weddingItem.total_cost || 0} тг`;
//                           case 'flowers':
//                             return `Цветы - ${weddingItem.total_cost || 0} тг`;
//                           case 'cakes':
//                             return `Торт - ${weddingItem.total_cost || 0} тг`;
//                           case 'alcohol':
//                             return `Алкоголь - ${weddingItem.total_cost || 0} тг`;
//                           case 'transport':
//                             return `Транспорт - ${weddingItem.total_cost || 0} тг`;
//                           case 'goods':
//                             return `Товар - ${weddingItem.total_cost || 0} тг`;
//                           case 'jewelry':
//                             return `Ювелирные изделия - ${weddingItem.total_cost || 0} тг`;
//                           default:
//                             return `Неизвестный элемент - ${weddingItem.total_cost || 0} тг`;
//                         }
//                       })()}
//                     </Text>
//                     <View style={styles.itemActions}>
//                       <TouchableOpacity
//                         style={styles.detailsButton}
//                         onPress={() => openItemDetailsModal(weddingItem)}
//                       >
//                         <Text style={styles.detailsButtonText}>Подробнее</Text>
//                       </TouchableOpacity>
//                       <TouchableOpacity
//                         style={styles.deleteButton}
//                         onPress={() => handleDeleteWeddingItem(weddingItem.id)}
//                       >
//                         <Text style={styles.deleteButtonText}>Удалить</Text>
//                       </TouchableOpacity>
//                     </View>
//                   </View>
//                 ))}
//               </View>
//             ))}
//           </View>
//         ) : (
//           <View style={styles.emptyItemsContainer}>
//             <Text style={styles.noItems}>Нет элементов для этой свадьбы</Text>
//             <TouchableOpacity
//               style={styles.addItemsButton}
//               onPress={() => {
//                 navigation.navigate('AddWeddingItemsScreen', { weddingId: item.id });
//               }}
//             >
//               <Text style={styles.addItemsButtonText}>Добавить элементы</Text>
//             </TouchableOpacity>
//           </View>
//         )}
//         <View style={styles.buttonRow}>
//           <TouchableOpacity
//             style={styles.actionButtonPrimary}
//             onPress={() => openEditWeddingModal(item)}
//           >
//             <Text style={styles.actionButtonText}>Редактировать</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={styles.actionButtonSecondary}
//             onPress={() => {
//               setSelectedWedding(item);
//               setWishlistModalVisible(true);
//             }}
//           >
//             <Text style={styles.actionButtonText}>Добавить подарок</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={styles.actionButtonAccent}
//             onPress={() => {
//               setSelectedWedding(item);
//               fetchWishlistItems(item.id);
//             }}
//           >
//             <Text style={styles.actionButtonText}>Просмотреть подарки</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={styles.actionButtonError}
//             onPress={() => handleDeleteWedding(item.id)}
//           >
//             <Text style={styles.actionButtonText}>Удалить</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={styles.actionButtonPrimary}
//             onPress={() => handleShareWeddingLink(item.id)}
//           >
//             <Text style={styles.actionButtonText}>Поделиться</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     );
//   };

//   // Render combined list item
//   const renderItem = ({ item }) => {
//     if (item.type === 'category') {
//       return renderEventCategoryItem({ item: item.data });
//     } else if (item.type === 'wedding') {
//       return renderWeddingItem({ item: item.data });
//     }
//     return null;
//   };

//   // Render good card
//   const renderGoodCard = ({ item }) => (
//     <TouchableOpacity
//       style={[
//         styles.goodCard,
//         selectedGoodIds.includes(item.id) && styles.selectedGoodCard,
//       ]}
//       onPress={() => {
//         setSelectedGoodIds((prev) =>
//           prev.includes(item.id)
//             ? prev.filter((id) => id !== item.id)
//             : [...prev, item.id]
//         );
//       }}
//     >
//       <Text style={styles.goodCardTitle}>{item.item_name}</Text>
//       <Text style={styles.goodCardCategory}>Категория: {item.category}</Text>
//       <Text style={styles.goodCardCost}>
//         {item.cost ? `Цена: ${item.cost}` : 'Цена не указана'}
//       </Text>
//       {item.specs?.goodLink && (
//         <TouchableOpacity onPress={() => Linking.openURL(item.specs.goodLink)}>
//           <Text style={styles.linkText}>Открыть ссылку</Text>
//         </TouchableOpacity>
//       )}
//       {selectedGoodIds.includes(item.id) && (
//         <Text style={styles.selectedIndicator}>✓</Text>
//       )}
//     </TouchableOpacity>
//   );

//   // Render wishlist item
//   const renderWishlistItem = ({ item }) => {
//     const files = wishlistFiles[item.good_id] || [];
//     return (
//       <View style={styles.wishlistCard}>
//         <ScrollView contentContainerStyle={styles.wishlistCardContent}>
//           <Text
//             style={[
//               styles.wishlistTitle,
//               item.is_reserved && styles.strikethroughText,
//             ]}
//           >
//             {item.item_name}
//           </Text>
//           <Text style={styles.wishlistStatus}>
//             {item.is_reserved
//               ? `Кто подарит: ${item.Reserver?.username || item.reserved_by_unknown}`
//               : 'Свободно'}
//           </Text>
//           {item.goodLink && (
//             <TouchableOpacity onPress={() => Linking.openURL(item.goodLink)}>
//               <Text style={styles.linkText}>Открыть ссылку</Text>
//             </TouchableOpacity>
//           )}
//           <View style={styles.mediaSection}>
//             {loadingFiles ? (
//               <ActivityIndicator size="small" color={COLORS.primary} style={styles.loader} />
//             ) : errorFiles ? (
//               <Text style={styles.errorText}>{errorFiles}</Text>
//             ) : files.length > 0 ? (
//               <FlatList
//                 data={files}
//                 renderItem={({ item: file }) => (
//                   <View style={styles.card}>
//                     {file.mimetype.startsWith('image/') ? (
//                       <Image source={{ uri: `${BASE_URL}/${file.path}` }} style={styles.media} resizeMode="cover" />
//                     ) : file.mimetype === 'video/mp4' ? (
//                       <Video
//                         source={{ uri: `${BASE_URL}/${file.path}` }}
//                         style={styles.video}
//                         useNativeControls
//                         resizeMode="contain"
//                         isLooping
//                       />
//                     ) : (
//                       <Text style={styles.detail}>Неподдерживаемый формат: {file.mimetype}</Text>
//                     )}
//                   </View>
//                 )}
//                 keyExtractor={(file) => file.id.toString()}
//                 horizontal
//                 showsHorizontalScrollIndicator={false}
//                 contentContainerStyle={styles.mediaList}
//               />
//             ) : (
//               <Text style={styles.noFilesText}>Файлы отсутствуют</Text>
//             )}
//           </View>
//         </ScrollView>
//       </View>
//     );
//   };

//   // Render service in category
//   const renderServiceInCategory = ({ item }) => (
//     <View style={styles.serviceCard}>
//       <Text style={styles.serviceCardTitle}>{item.name}</Text>
//       <Text style={styles.serviceCardDescription}>
//         {item.description || 'Нет описания'}
//       </Text>
//       <Text style={styles.serviceCardType}>Тип: {item.serviceType}</Text>
//       <TouchableOpacity
//         style={styles.detailsButton}
//         onPress={() => openServiceDetailsModal(item)}
//       >
//         <Text style={styles.detailsButtonText}>Подробнее</Text>
//       </TouchableOpacity>
//     </View>
//   );

//   // Render service item for selection
//   const renderServiceItem = ({ item }) => (
//     <TouchableOpacity
//       style={[
//         styles.serviceCard,
//         categoryServices.some((s) => s.id === item.id && s.serviceType === item.serviceType) && styles.selectedServiceCard,
//       ]}
//       onPress={() => {
//         setCategoryServices((prev) => {
//           const exists = prev.some((s) => s.id === item.id && s.serviceType === item.serviceType);
//           if (exists) {
//             return prev.filter((s) => !(s.id === item.id && s.serviceType === item.serviceType));
//           }
//           return [...prev, { id: item.id, serviceType: item.serviceType }];
//         });
//       }}
//     >
//       <Text style={styles.serviceCardTitle}>{item.name}</Text>
//       <Text style={styles.serviceCardDescription}>
//         {item.description || 'Нет описания'}
//       </Text>
//       <Text style={styles.serviceCardType}>Тип: {item.serviceType}</Text>
//       {categoryServices.some((s) => s.id === item.id && s.serviceType === item.serviceType) && (
//         <Text style={styles.selectedIndicator}>✓</Text>
//       )}
//     </TouchableOpacity>
//   );

//   // Combine categories and weddings for display
//   const combinedData = [
//     ...eventCategories.map((cat) => ({ type: 'category', data: cat })),
//     ...weddings.map((wed) => ({ type: 'wedding', data: wed })),
//   ];

//   return (
//     <SafeAreaView style={styles.container}>
//       <Text style={styles.title}>Мои мероприятия</Text>
//       <View style={styles.buttonRow}>
//         <TouchableOpacity
//           style={styles.createButton}
//           onPress={() => {
//             setCategoryName('');
//             setCategoryDescription('');
//             setCategoryStatus('active');
//             setCategoryServices([]);
//             setSelectedCategory(null);
//             setCategoryModalVisible(true);
//           }}
//         >
//           <Text style={styles.createButtonText}>Создать категорию</Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={styles.createButton}
//           onPress={() => {
//             setWeddingName('');
//             setWeddingDate('');
//             setWeddingModalVisible(true);
//           }}
//         >
//           <Text style={styles.createButtonText}>Создать свадьбу</Text>
//         </TouchableOpacity>
//       </View>
//       {loadingCategories || loadingWeddings ? (
//         <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
//       ) : (
//         <FlatList
//           data={combinedData}
//           renderItem={renderItem}
//           keyExtractor={(item) => `${item.type}-${item.data.id}`}
//           ListEmptyComponent={
//             <View style={styles.emptyContainer}>
//               <Text style={styles.noItems}>Нет мероприятий или свадеб</Text>
//             </View>
//           }
//           contentContainerStyle={styles.listContainer}
//           refreshControl={
//             <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
//           }
//         />
//       )}

//       {/* Category Modal */}
//       <Modal visible={categoryModalVisible} animationType="slide">
//         <SafeAreaView style={styles.modalContainer}>
//           <Text style={styles.subtitle}>
//             {selectedCategory ? 'Редактировать категорию' : 'Создать категорию'}
//           </Text>
//           <ScrollView style={{ width: '100%' }}>
//             <TextInput
//               style={styles.input}
//               placeholder="Название категории"
//               placeholderTextColor={COLORS.muted}
//               value={categoryName}
//               onChangeText={setCategoryName}
//             />
//             <TextInput
//               style={[styles.input, styles.multilineInput]}
//               placeholder="Описание категории"
//               placeholderTextColor={COLORS.muted}
//               value={categoryDescription}
//               onChangeText={setCategoryDescription}
//               multiline
//               numberOfLines={4}
//             />
//             <View style={styles.pickerContainer}>
//               <Text style={styles.pickerLabel}>Статус</Text>
//               <Picker
//                 selectedValue={categoryStatus}
//                 onValueChange={(value) => setCategoryStatus(value)}
//                 style={styles.picker}
//               >
//                 <Picker.Item label="Активно" value="active" />
//                 <Picker.Item label="Неактивно" value="inactive" />
//               </Picker>
//             </View>
//             <Text style={styles.sectionTitle}>Выберите услуги</Text>
//             {servicesError ? (
//               <Text style={styles.errorText}>{servicesError}</Text>
//             ) : (
//               <FlatList
//                 data={availableServices}
//                 renderItem={renderServiceItem}
//                 keyExtractor={(item) => `${item.id}-${item.serviceType}`}
//                 ListEmptyComponent={<Text style={styles.noItems}>Услуги недоступны</Text>}
//                 contentContainerStyle={styles.serviceList}
//               />
//             )}
//           </ScrollView>
//           <View style={styles.buttonRowModal}>
//             <Button
//               title={selectedCategory ? 'Сохранить' : 'Создать'}
//               onPress={selectedCategory ? handleUpdateEventCategory : handleCreateEventCategory}
//               color={COLORS.primary}
//             />
//             <Button
//               title="Отмена"
//               onPress={() => {
//                 setCategoryName('');
//                 setCategoryDescription('');
//                 setCategoryStatus('active');
//                 setCategoryServices([]);
//                 setSelectedCategory(null);
//                 setCategoryModalVisible(false);
//               }}
//               color={COLORS.error}
//             />
//           </View>
//         </SafeAreaView>
//       </Modal>

//       {/* Wedding Modal */}
//       <Modal visible={weddingModalVisible} animationType="slide">
//         <SafeAreaView style={styles.modalContainer}>
//           <Text style={styles.subtitle}>Создать свадьбу</Text>
//           <TextInput
//             style={styles.input}
//             placeholder="Название свадьбы"
//             placeholderTextColor={COLORS.muted}
//             value={weddingName}
//             onChangeText={setWeddingName}
//           />
//           <TextInput
//             style={styles.input}
//             placeholder="Дата свадьбы (ГГГГ-ММ-ДД)"
//             placeholderTextColor={COLORS.muted}
//             value={weddingDate}
//             onChangeText={setWeddingDate}
//             onFocus={() => setShowCalendar(true)}
//           />
//           {showCalendar && (
//             <Calendar
//               onDayPress={onDateChange}
//               markedDates={{
//                 [weddingDate]: { selected: true, marked: true, selectedColor: COLORS.primary },
//               }}
//               style={styles.calendar}
//             />
//           )}
//           <View style={styles.buttonRowModal}>
//             <Button
//               title="Создать"
//               onPress={handleCreateWedding}
//               color={COLORS.primary}
//             />
//             <Button
//               title="Отмена"
//               onPress={() => {
//                 setWeddingModalVisible(false);
//                 setWeddingName('');
//                 setWeddingDate('');
//                 setShowCalendar(false);
//               }}
//               color={COLORS.error}
//             />
//           </View>
//         </SafeAreaView>
//       </Modal>

//       {/* Edit Wedding Modal */}
//       <Modal visible={editWeddingModalVisible} animationType="slide">
//         <SafeAreaView style={styles.modalContainer}>
//           <Text style={styles.subtitle}>Редактировать свадьбу</Text>
//           <TextInput
//             style={styles.input}
//             placeholder="Название свадьбы"
//             placeholderTextColor={COLORS.muted}
//             value={weddingName}
//             onChangeText={setWeddingName}
//           />
//           <TextInput
//             style={styles.input}
//             placeholder="Дата свадьбы (ГГГГ-ММ-ДД)"
//             placeholderTextColor={COLORS.muted}
//             value={weddingDate}
//             onChangeText={setWeddingDate}
//             onFocus={() => setShowCalendar(true)}
//           />
//           {showCalendar && (
//             <Calendar
//               onDayPress={onDateChange}
//               markedDates={{
//                 [weddingDate]: { selected: true, marked: true, selectedColor: COLORS.primary },
//               }}
//               style={styles.calendar}
//             />
//           )}
//           <View style={styles.buttonRowModal}>
//             <Button
//               title="Сохранить"
//               onPress={handleUpdateWedding}
//               color={COLORS.primary}
//             />
//             <Button
//               title="Отмена"
//               onPress={() => {
//                 setEditWeddingModalVisible(false);
//                 setWeddingName('');
//                 setWeddingDate('');
//                 setSelectedWedding(null);
//                 setShowCalendar(false);
//               }}
//               color={COLORS.error}
//             />
//           </View>
//         </SafeAreaView>
//       </Modal>

//       {/* Wishlist Modal */}
//       <Modal visible={wishlistModalVisible} animationType="slide">
//         <SafeAreaView style={styles.modalContainer}>
//           <Text style={styles.subtitle}>Добавить подарок</Text>
//           <View style={styles.switchContainer}>
//             <Text style={styles.switchLabel}>Добавить собственный подарок</Text>
//             <TouchableOpacity
//               style={[styles.switch, isCustomGift && styles.switchActive]}
//               onPress={() => setIsCustomGift(!isCustomGift)}
//             >
//               <Text style={styles.switchText}>{isCustomGift ? 'Вкл' : 'Выкл'}</Text>
//             </TouchableOpacity>
//           </View>
//           {isCustomGift ? (
//             <>
//               <TextInput
//                 style={styles.input}
//                 placeholder="Название подарка"
//                 placeholderTextColor={COLORS.muted}
//                 value={formData.item_name}
//                 onChangeText={(text) => setFormData({ ...formData, item_name: text })}
//               />
//               <Button
//                 title="Добавить"
//                 onPress={handleAddCustomGift}
//                 color={COLORS.primary}
//               />
//             </>
//           ) : (
//             <FlatList
//               data={goods}
//               renderItem={renderGoodCard}
//               keyExtractor={(item) => item.id.toString()}
//               ListEmptyComponent={<Text style={styles.noItems}>Товары недоступны</Text>}
//               contentContainerStyle={styles.listContainer}
//             />
//           )}
//           {!isCustomGift && (
//             <View style={styles.buttonRowModal}>
//               <Button
//                 title="Добавить выбранные"
//                 onPress={handleAddWishlistItem}
//                 color={COLORS.primary}
//                 disabled={selectedGoodIds.length === 0}
//               />
//               <Button
//                 title="Отмена"
//                 onPress={() => {
//                   setWishlistModalVisible(false);
//                   setSelectedGoodIds([]);
//                   setIsCustomGift(false);
//                 }}
//                 color={COLORS.error}
//               />
//             </View>
//           )}
//         </SafeAreaView>
//       </Modal>

//       {/* Wishlist View Modal */}
//       <Modal visible={wishlistViewModalVisible} animationType="slide">
//         <SafeAreaView style={styles.modalContainer}>
//           <Text style={styles.subtitle}>Список желаний</Text>
//           <FlatList
//             data={wishlistItems}
//             renderItem={renderWishlistItem}
//             keyExtractor={(item) => item.id.toString()}
//             ListEmptyComponent={<Text style={styles.noItems}>Список желаний пуст</Text>}
//             contentContainerStyle={styles.listContainer}
//           />
//           <Button
//             title="Закрыть"
//             onPress={() => setWishlistViewModalVisible(false)}
//             color={COLORS.error}
//           />
//         </SafeAreaView>
//       </Modal>

//       {/* Category Details Modal */}
//       <Modal visible={categoryDetailsModalVisible} animationType="slide">
//         <SafeAreaView style={styles.modalContainer}>
//           <Text style={styles.subtitle}>Детали категории</Text>
//           {loadingDetails ? (
//             <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
//           ) : categoryDetails ? (
//             <ScrollView style={{ width: '100%' }}>
//               <Text style={styles.detail}>Название: {categoryDetails.name}</Text>
//               <Text style={styles.detail}>
//                 Описание: {categoryDetails.description || 'Нет описания'}
//               </Text>
//               <Text style={styles.detail}>
//                 Статус: {categoryDetails.status === 'active' ? 'Активно' : 'Неактивно'}
//               </Text>
//               <Text style={styles.sectionTitle}>Услуги</Text>
//               <FlatList
//                 data={categoryServicesCache[categoryDetails.id] || []}
//                 renderItem={renderServiceInCategory}
//                 keyExtractor={(item) => `${item.serviceType}-${item.serviceId}`}
//                 ListEmptyComponent={<Text style={styles.noItems}>Нет услуг</Text>}
//                 contentContainerStyle={styles.serviceList}
//               />
//             </ScrollView>
//           ) : (
//             <Text style={styles.noItems}>Детали недоступны</Text>
//           )}
//           <Button
//             title="Закрыть"
//             onPress={() => {
//               setCategoryDetailsModalVisible(false);
//               setCategoryDetails(null);
//             }}
//             color={COLORS.error}
//           />
//         </SafeAreaView>
//       </Modal>

//       {/* Service Details Modal */}
//       <Modal visible={serviceDetailsModalVisible} animationType="slide">
//         <SafeAreaView style={styles.modalContainer}>
//           <Text style={styles.subtitle}>Детали услуги</Text>
//           {loadingServiceDetails ? (
//             <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
//           ) : selectedService ? (
//             <ScrollView style={{ width: '100%' }}>
//               <Text style={styles.detail}>Название: {selectedService.name}</Text>
//               <Text style={styles.detail}>
//                 Тип: {selectedService.serviceType}
//               </Text>
//               <Text style={styles.detail}>
//                 Описание: {selectedService.description || 'Нет описания'}
//               </Text>
//               <Text style={styles.detail}>
//                 Стоимость: {selectedService.cost ? `${selectedService.cost} тг` : 'Не указана'}
//               </Text>
//               {selectedService.address && (
//                 <Text style={styles.detail}>Адрес: {selectedService.address}</Text>
//               )}
//               {selectedService.cuisine && (
//                 <Text style={styles.detail}>Кухня: {selectedService.cuisine}</Text>
//               )}
//               <Text style={styles.detail}>
//                 Создано: {selectedService.created_at || 'Не указано'}
//               </Text>
//               <Text style={styles.detail}>
//                 Обновлено: {selectedService.updated_at || 'Не указано'}
//               </Text>
//             </ScrollView>
//           ) : (
//             <Text style={styles.noItems}>Детали недоступны</Text>
//           )}
//           <Button
//             title="Закрыть"
//             onPress={() => {
//               setServiceDetailsModalVisible(false);
//               setSelectedService(null);
//             }}
//             color={COLORS.error}
//           />
//         </SafeAreaView>
//       </Modal>

//       {/* Item Details Modal */}
//       <Modal visible={detailsModalVisible} animationType="slide">
//         <SafeAreaView style={styles.modalContainer}>
//           <Text style={styles.subtitle}>Детали элемента</Text>
//           {loadingDetails ? (
//             <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
//           ) : selectedItem ? (
//             <ScrollView style={{ width: '100%' }}>
//               <Text style={styles.detail}>
//                 Тип: {selectedItem.item_type || 'Не указано'}
//               </Text>
//               <Text style={styles.detail}>
//                 Стоимость: {selectedItem.total_cost ? `${selectedItem.total_cost} тг` : 'Не указана'}
//               </Text>
//               {selectedItem.name && (
//                 <Text style={styles.detail}>Название: {selectedItem.name}</Text>
//               )}
//               {selectedItem.description && (
//                 <Text style={styles.detail}>Описание: {selectedItem.description}</Text>
//               )}
//             </ScrollView>
//           ) : (
//             <Text style={styles.noItems}>Детали недоступны</Text>
//           )}
//           <Button
//             title="Закрыть"
//             onPress={() => {
//               setDetailsModalVisible(false);
//               setSelectedItem(null);
//             }}
//             color={COLORS.error}
//           />
//         </SafeAreaView>
//       </Modal>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: COLORS.background,
//     paddingHorizontal: 16,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: COLORS.text,
//     marginVertical: 16,
//     textAlign: 'center',
//   },
//   subtitle: {
//     fontSize: 20,
//     fontWeight: '600',
//     color: COLORS.text,
//     marginVertical: 12,
//     textAlign: 'center',
//   },
//   itemContainer: {
//     backgroundColor: COLORS.white,
//     padding: 16,
//     marginVertical: 8,
//     borderRadius: 8,
//     shadowColor: COLORS.shadow,
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   itemText: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: COLORS.text,
//   },
//   itemSubText: {
//     fontSize: 14,
//     color: COLORS.muted,
//     marginTop: 4,
//   },
//   buttonRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 12,
//     flexWrap: 'wrap',
//   },
//   buttonRowModal: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     marginVertical: 16,
//   },
//   createButton: {
//     backgroundColor: COLORS.primary,
//     paddingVertical: 10,
//     paddingHorizontal: 16,
//     borderRadius: 8,
//     marginVertical: 8,
//     flex: 1,
//     marginHorizontal: 4,
//   },
//   createButtonText: {
//     color: COLORS.white,
//     fontSize: 16,
//     fontWeight: '600',
//     textAlign: 'center',
//   },
//   actionButtonPrimary: {
//     backgroundColor: COLORS.primary,
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     borderRadius: 6,
//     marginHorizontal: 4,
//     flex: 1,
//   },
//   actionButtonSecondary: {
//     backgroundColor: COLORS.secondary,
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     borderRadius: 6,
//     marginHorizontal: 4,
//     flex: 1,
//   },
//   actionButtonAccent: {
//     backgroundColor: COLORS.accent,
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     borderRadius: 6,
//     marginHorizontal: 4,
//     flex: 1,
//   },
//   actionButtonError: {
//     backgroundColor: COLORS.error,
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     borderRadius: 6,
//     marginHorizontal: 4,
//     flex: 1,
//   },
//   actionButtonText: {
//     color: COLORS.white,
//     fontSize: 14,
//     fontWeight: '600',
//     textAlign: 'center',
//   },
//   modalContainer: {
//     flex: 1,
//     backgroundColor: COLORS.background,
//     padding: 16,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: COLORS.border,
//     borderRadius: 8,
//     padding: 12,
//     marginVertical: 8,
//     fontSize: 16,
//     color: COLORS.text,
//     backgroundColor: COLORS.white,
//   },
//   multilineInput: {
//     height: 100,
//     textAlignVertical: 'top',
//   },
//   pickerContainer: {
//     marginVertical: 8,
//   },
//   pickerLabel: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: COLORS.text,
//     marginBottom: 4,
//   },
//   picker: {
//     backgroundColor: COLORS.white,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: COLORS.border,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: COLORS.text,
//     marginVertical: 12,
//   },
//   serviceList: {
//     paddingBottom: 16,
//   },
//   serviceCard: {
//     backgroundColor: COLORS.white,
//     padding: 12,
//     marginVertical: 8,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: COLORS.border,
//   },
//   selectedServiceCard: {
//     borderColor: COLORS.primary,
//     borderWidth: 2,
//   },
//   serviceCardTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: COLORS.text,
//   },
//   serviceCardDescription: {
//     fontSize: 14,
//     color: COLORS.muted,
//     marginVertical: 4,
//   },
//   serviceCardType: {
//     fontSize: 14,
//     color: COLORS.muted,
//   },
//   selectedIndicator: {
//     position: 'absolute',
//     top: 8,
//     right: 8,
//     fontSize: 20,
//     color: COLORS.primary,
//     fontWeight: 'bold',
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 16,
//   },
//   noItems: {
//     fontSize: 16,
//     color: COLORS.muted,
//     textAlign: 'center',
//   },
//   loader: {
//     marginVertical: 16,
//   },
//   errorText: {
//     color: COLORS.error,
//     fontSize: 14,
//     textAlign: 'center',
//     marginVertical: 8,
//   },
//   listContainer: {
//     paddingBottom: 16,
//   },
//   goodCard: {
//     backgroundColor: COLORS.white,
//     padding: 12,
//     marginVertical: 8,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: COLORS.border,
//   },
//   selectedGoodCard: {
//     borderColor: COLORS.primary,
//     borderWidth: 2,
//   },
//   goodCardTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: COLORS.text,
//   },
//   goodCardCategory: {
//     fontSize: 14,
//     color: COLORS.muted,
//     marginVertical: 4,
//   },
//   goodCardCost: {
//     fontSize: 14,
//     color: COLORS.muted,
//   },
//   linkText: {
//     color: COLORS.primary,
//     fontSize: 14,
//     marginVertical: 4,
//     textDecorationLine: 'underline',
//   },
//   wishlistCard: {
//     backgroundColor: COLORS.white,
//     padding: 12,
//     marginVertical: 8,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: COLORS.border,
//   },
//   wishlistCardContent: {
//     paddingBottom: 16,
//   },
//   wishlistTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: COLORS.text,
//   },
//   strikethroughText: {
//     textDecorationLine: 'line-through',
//   },
//   wishlistStatus: {
//     fontSize: 14,
//     color: COLORS.muted,
//     marginVertical: 4,
//   },
//   mediaSection: {
//     marginTop: 8,
//   },
//   mediaList: {
//     paddingVertical: 8,
//   },
//   card: {
//     marginRight: 8,
//     borderRadius: 8,
//     overflow: 'hidden',
//   },
//   media: {
//     width: 100,
//     height: 100,
//   },
//   video: {
//     width: 100,
//     height: 100,
//   },
//   noFilesText: {
//     fontSize: 14,
//     color: COLORS.muted,
//   },
//   switchContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginVertical: 8,
//   },
//   switchLabel: {
//     fontSize: 16,
//     color: COLORS.text,
//   },
//   switch: {
//     backgroundColor: COLORS.muted,
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     borderRadius: 8,
//   },
//   switchActive: {
//     backgroundColor: COLORS.primary,
//   },
//   switchText: {
//     color: COLORS.white,
//     fontSize: 14,
//   },
//   calendar: {
//     marginVertical: 8,
//     borderRadius: 8,
//   },
//   weddingItemsContainer: {
//     marginTop: 8,
//   },
//   categorySection: {
//     marginVertical: 8,
//   },
//   categoryTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: COLORS.text,
//     marginBottom: 4,
//   },
//   weddingItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 4,
//   },
//   subItemText: {
//     fontSize: 14,
//     color: COLORS.text,
//     flex: 1,
//   },
//   itemActions: {
//     flexDirection: 'row',
//   },
//   detailsButton: {
//     backgroundColor: COLORS.primary,
//     paddingVertical: 6,
//     paddingHorizontal: 10,
//     borderRadius: 6,
//     marginHorizontal: 4,
//   },
//   detailsButtonText: {
//     color: COLORS.white,
//     fontSize: 12,
//   },
//   deleteButton: {
//     backgroundColor: COLORS.error,
//     paddingVertical: 6,
//     paddingHorizontal: 10,
//     borderRadius: 6,
//     marginHorizontal: 4,
//   },
//   deleteButtonText: {
//     color: COLORS.white,
//     fontSize: 12,
//   },
//   emptyItemsContainer: {
//     alignItems: 'center',
//     marginTop: 8,
//   },
//   addItemsButton: {
//     backgroundColor: COLORS.secondary,
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     borderRadius: 6,
//     marginTop: 8,
//   },
//   addItemsButtonText: {
//     color: COLORS.white,
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   detail: {
//     fontSize: 14,
//     color: COLORS.text,
//     marginVertical: 4,
//   },
// });



















// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   Button,
//   StyleSheet,
//   FlatList,
//   Modal,
//   Alert,
//   TouchableOpacity,
//   Share,
//   ScrollView,
//   Image,
//   ActivityIndicator,
//   RefreshControl,
// } from 'react-native';
// import Video from 'react-native-video';
// import * as Linking from 'expo-linking';
// import { useRoute, useNavigation } from '@react-navigation/native';
// import { useSelector } from 'react-redux';
// import api from '../api/api';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import axios from 'axios';
// import { Calendar } from 'react-native-calendars';
// import { Picker } from '@react-native-picker/picker';

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
//   shadow: '#0000001A',
// };

// export default function Item3Screen() {
//   const route = useRoute();
//   const navigation = useNavigation();
//   const selectedItems = route.params?.data || [];
//   const userId = useSelector((state) => state.auth.user?.id);
//   const token = useSelector((state) => state.auth.token);
//   const [eventCategories, setEventCategories] = useState([]);
//   const [weddings, setWeddings] = useState([]);
//   const [weddingItemsCache, setWeddingItemsCache] = useState({});
//   const [categoryServicesCache, setCategoryServicesCache] = useState({});
//   const [loadingCategories, setLoadingCategories] = useState(true);
//   const [loadingWeddings, setLoadingWeddings] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [categoryModalVisible, setCategoryModalVisible] = useState(false);
//   const [weddingModalVisible, setWeddingModalVisible] = useState(false);
//   const [editWeddingModalVisible, setEditWeddingModalVisible] = useState(false);
//   const [wishlistModalVisible, setWishlistModalVisible] = useState(false);
//   const [wishlistViewModalVisible, setWishlistViewModalVisible] = useState(false);
//   const [categoryDetailsModalVisible, setCategoryDetailsModalVisible] = useState(false);
//   const [serviceDetailsModalVisible, setServiceDetailsModalVisible] = useState(false);
//   const [detailsModalVisible, setDetailsModalVisible] = useState(false);
//   const [categoryName, setCategoryName] = useState('');
//   const [categoryDescription, setCategoryDescription] = useState('');
//   const [categoryStatus, setCategoryStatus] = useState('active');
//   const [weddingName, setWeddingName] = useState('');
//   const [weddingDate, setWeddingDate] = useState('');
//   const [showCalendar, setShowCalendar] = useState(false);
//   const [selectedCategory, setSelectedCategory] = useState(null);
//   const [selectedWedding, setSelectedWedding] = useState(null);
//   const [categoryDetails, setCategoryDetails] = useState(null);
//   const [selectedService, setSelectedService] = useState(null);
//   const [categoryServices, setCategoryServices] = useState([]);
//   const [availableServices, setAvailableServices] = useState([]);
//   const [servicesError, setServicesError] = useState(null);
//   const [wishlistItems, setWishlistItems] = useState([]);
//   const [goods, setGoods] = useState([]);
//   const [selectedGoodIds, setSelectedGoodIds] = useState([]);
//   const [wishlistFiles, setWishlistFiles] = useState({});
//   const [loadingFiles, setLoadingFiles] = useState(false);
//   const [errorFiles, setErrorFiles] = useState(null);
//   const [formData, setFormData] = useState({ category: '', item_name: '' });
//   const [isCustomGift, setIsCustomGift] = useState(false);
//   const [selectedItem, setSelectedItem] = useState(null);
//   const [loadingDetails, setLoadingDetails] = useState(false);
//   const [loadingServiceDetails, setLoadingServiceDetails] = useState(false);
//   const [activeWeddingId, setActiveWeddingId] = useState(null);
//   const [hasShownNoWeddingsAlert, setHasShownNoWeddingsAlert] = useState(false);
//   const BASE_URL = process.env.EXPO_PUBLIC_API_baseURL;

//   // Fetch event categories with services
//   const fetchEventCategories = async () => {
//     setLoadingCategories(true);
//     try {
//       const response = await api.getEventCategories();
//       const categories = Array.isArray(response.data) ? response.data : response.data.data || [];
//       setEventCategories(categories);

//       // Fetch services for each category
//       const servicesPromises = categories.map((category) =>
//         api.getEventCategoryWithServices(category.id).then((res) => ({
//           categoryId: category.id,
//           services: res.data.data.services || [],
//         }))
//       );
//       const servicesResults = await Promise.all(servicesPromises);
//       const newCache = servicesResults.reduce((acc, { categoryId, services }) => {
//         acc[categoryId] = services;
//         return acc;
//       }, {});
//       setCategoryServicesCache(newCache);
//       return categories;
//     } catch (error) {
//       console.error('Error fetching event categories:', error);
//       Alert.alert('Ошибка', 'Не удалось загрузить категории мероприятий');
//       setEventCategories([]);
//       setCategoryServicesCache({});
//       return [];
//     } finally {
//       setLoadingCategories(false);
//     }
//   };

//   // Fetch available services
//   const fetchAvailableServices = async () => {
//     try {
//       const response = await api.getServices();
//       setAvailableServices(response.data.data || response.data || []);
//       setServicesError(null);
//     } catch (error) {
//       console.error('Error fetching services:', error);
//       setAvailableServices([]);
//       setServicesError('Не удалось загрузить услуги.');
//       return [];
//     }
//   };

//   // Fetch weddings
//   const fetchWeddings = async () => {
//     setLoadingWeddings(true);
//     try {
//       const response = await api.getWedding(token);
//       const weddingData = Array.isArray(response.data) ? response.data : response.data.data || [];
//       setWeddings(weddingData);
//       const itemsPromises = weddingData.map((wedding) =>
//         api.getWeddingItems(wedding.id, token).then((res) => ({
//           weddingId: wedding.id,
//           items: res.data.data || [],
//         }))
//       );
//       const itemsResults = await Promise.all(itemsPromises);
//       const newCache = itemsResults.reduce((acc, { weddingId, items }) => {
//         acc[weddingId] = items;
//         return acc;
//       }, {});
//       setWeddingItemsCache(newCache);
//       return weddingData;
//     } catch (error) {
//       console.error('Error fetching weddings:', error);
//       Alert.alert('Ошибка', 'Не удалось загрузить свадьбы');
//       setWeddings([]);
//       setWeddingItemsCache({});
//       return [];
//     } finally {
//       setLoadingWeddings(false);
//     }
//   };

//   // Fetch goods
//   const fetchGoods = async () => {
//     try {
//       const response = await api.getGoods(token);
//       setGoods(response.data.data || response.data || []);
//     } catch (error) {
//       console.error('Error fetching goods:', error);
//       Alert.alert('Ошибка', 'Не удалось загрузить товары');
//     }
//   };

//   // Fetch event category details
//   const fetchEventCategoryDetails = async (id) => {
//     setLoadingDetails(true);
//     try {
//       const response = await api.getEventCategoryWithServices(id);
//       const details = response.data.data || response.data;
//       setCategoryDetails(details);
//       setCategoryServicesCache((prev) => ({
//         ...prev,
//         [id]: details.services || [],
//       }));
//       return details;
//     } catch (error) {
//       console.error('Error fetching category details:', error);
//       Alert.alert('Ошибка', 'Не удалось загрузить детали категории');
//       setCategoryDetails(null);
//       return null;
//     } finally {
//       setLoadingDetails(false);
//     }
//   };

//   // Fetch service details
//   const fetchServiceDetails = async (serviceId, serviceType) => {
//     setLoadingServiceDetails(true);
//     try {
//       // Нормализуем serviceType (приводим к нижнему регистру и единственному числу)
//       const normalizedServiceType = serviceType.toLowerCase().replace(/s$/, '');
//       // Map serviceType to the correct API method
//       const methodMap = {
//         restaurant: 'getRestaurantById',
//         clothing: 'getClothingById',
//         tamada: 'getTamadaById',
//         program: 'getProgramById',
//         traditionalgift: 'getTraditionalGiftById',
//         flowers: 'getFlowersById',
//         cake: 'getCakeById',
//         alcohol: 'getAlcoholById',
//         transport: 'getTransportById',
//         jewelry: 'getJewelryById',
//         wedding: 'getWeddingById',
//         eventcategory: 'getEventCategoryById',
//         wishlist: 'getWishlistById',
//       };

//       // Получаем метод API для указанного типа сервиса
//       const methodName = methodMap[normalizedServiceType];
//       if (!methodName || !api[methodName]) {
//         throw new Error(`Неизвестный тип сервиса: ${normalizedServiceType}`);
//       }

//       // Вызываем соответствующий метод API
//       const response = await api[methodName](serviceId);
//       const data = response.data.data || response.data;

//       // Формируем единообразный ответ
//       return {
//         serviceId,
//         serviceType: normalizedServiceType,
//         name: data.name,
//         description: data.description || null,
//         cost: data.cost || null,
//         created_at: data.createdAt || data.created_at || null,
//         updated_at: data.updatedAt || data.updated_at || null,
//         address: data.address || null,
//         cuisine: data.cuisine || null,
//       };
//     } catch (error) {
//       console.error(`Error fetching service details for ${serviceType}/${serviceId}:`, error);
//       Alert.alert('Ошибка', `Не удалось загрузить детали услуги: ${error.message}`);
//       return null;
//     } finally {
//       setLoadingServiceDetails(false);
//     }
//   };

//   // Fetch item details
//   const fetchItemDetails = async (itemType, itemId) => {
//     setLoadingDetails(true);
//     try {
//       // Нормализуем itemType (приводим к нижнему регистру и единственному числу)
//       const normalizedItemType = itemType.toLowerCase().replace(/s$/, '');
//       // Map itemType to correct API method
//       const methodMap = {
//         restaurant: 'getRestaurantById',
//         clothing: 'getClothingById',
//         tamada: 'getTamadaById',
//         program: 'getProgramById',
//         traditionalgift: 'getTraditionalGiftById',
//         flowers: 'getFlowersById',
//         cake: 'getCakeById',
//         alcohol: 'getAlcoholById',
//         transport: 'getTransportById',
//         goods: 'getGoodById',
//         jewelry: 'getJewelryById',
//       };
//       const methodName = methodMap[normalizedItemType];
//       if (!methodName || !api[methodName]) {
//         throw new Error(`Неизвестный тип элемента: ${normalizedItemType}`);
//       }
//       const response = await api[methodName](itemId);
//       const details = response.data.data || response.data;
//       return details || null;
//     } catch (error) {
//       console.error(`Error fetching details for ${itemType}:`, error);
//       Alert.alert('Ошибка', 'Не удалось загрузить детали элемента');
//       return null;
//     } finally {
//       setLoadingDetails(false);
//     }
//   };

//   // Fetch files for wishlist items
//   const fetchFiles = async (goodId) => {
//     setLoadingFiles(true);
//     setErrorFiles(null);
//     try {
//       const response = await axios.get(`${BASE_URL}/api/goods/${goodId}/files`);
//       return response.data;
//     } catch (error) {
//       console.error('Error fetching files:', error);
//       setErrorFiles('Ошибка загрузки файлов: ' + error.message);
//       return [];
//     } finally {
//       setLoadingFiles(false);
//     }
//   };

//   // Create event category
//   const handleCreateEventCategory = async () => {
//     if (!categoryName.trim()) {
//       Alert.alert('Ошибка', 'Введите название категории');
//       return;
//     }
//     try {
//       const response = await api.createEventCategory({
//         name: categoryName,
//         description: categoryDescription,
//         status: categoryStatus,
//       });
//       const newCategory = response.data.data || response.data;
//       setEventCategories((prev) => [...prev, newCategory]);
//       if (categoryServices.length > 0) {
//         await api.addServicesToCategory(newCategory.id, {
//           service_ids: categoryServices.map((s) => ({ serviceId: s.id, serviceType: s.serviceType })),
//         });
//         setCategoryServicesCache((prev) => ({
//           ...prev,
//           [newCategory.id]: categoryServices,
//         }));
//       }
//       Alert.alert('Успех', 'Категория мероприятия создана');
//       setCategoryName('');
//       setCategoryDescription('');
//       setCategoryStatus('active');
//       setCategoryServices([]);
//       setCategoryModalVisible(false);
//     } catch (error) {
//       console.error('Error creating event category:', error);
//       Alert.alert('Ошибка', `Не удалось создать категорию: ${error.message}`);
//     }
//   };

//   // Update event category
//   const handleUpdateEventCategory = async () => {
//     if (!selectedCategory || !categoryName.trim()) {
//       Alert.alert('Ошибка', 'Выберите категорию и введите название');
//       return;
//     }
//     try {
//       const response = await api.updateEventCategory(selectedCategory.id, {
//         name: categoryName,
//         description: categoryDescription,
//         status: categoryStatus,
//       });
//       setEventCategories((prev) =>
//         prev.map((cat) => (cat.id === selectedCategory.id ? response.data.data || response.data : cat))
//       );
//       await api.updateServicesForCategory(selectedCategory.id, {
//         service_ids: categoryServices.map((s) => ({ serviceId: s.id, serviceType: s.serviceType })),
//       });
//       setCategoryServicesCache((prev) => ({
//         ...prev,
//         [selectedCategory.id]: categoryServices,
//       }));
//       Alert.alert('Успех', 'Категория мероприятия обновлена');
//       setCategoryName('');
//       setCategoryDescription('');
//       setCategoryStatus('active');
//       setCategoryServices([]);
//       setSelectedCategory(null);
//       setCategoryModalVisible(false);
//     } catch (error) {
//       console.error('Error updating event category:', error);
//       Alert.alert('Ошибка', `Не удалось обновить категорию: ${error.message}`);
//     }
//   };

//   // Delete event category
//   const handleDeleteEventCategory = (id) => {
//     Alert.alert(
//       'Подтверждение',
//       'Вы уверены, что хотите удалить эту категорию?',
//       [
//         { text: 'Отмена', style: 'cancel' },
//         {
//           text: 'Удалить',
//           onPress: async () => {
//             try {
//               await api.deleteEventCategory(id);
//               setEventCategories((prev) => prev.filter((cat) => cat.id !== id));
//               setCategoryServicesCache((prev) => {
//                 const newCache = { ...prev };
//                 delete newCache[id];
//                 return newCache;
//               });
//               Alert.alert('Успех', 'Категория мероприятия удалена');
//             } catch (error) {
//               console.error('Error deleting event category:', error);
//               Alert.alert('Ошибка', `Не удалось удалить категорию: ${error.message}`);
//             }
//           },
//         },
//       ]
//     );
//   };

//   // Delete service from category
//   const handleDeleteCategoryService = async (categoryId, serviceId, serviceType) => {
//     Alert.alert(
//       'Подтверждение',
//       'Вы уверены, что хотите удалить эту услугу из категории?',
//       [
//         { text: 'Отмена', style: 'cancel' },
//         {
//           text: 'Удалить',
//           onPress: async () => {
//             try {
//               await api.removeServiceFromCategory(categoryId, { serviceId, serviceType });
//               setCategoryServicesCache((prev) => ({
//                 ...prev,
//                 [categoryId]: prev[categoryId].filter(
//                   (s) => !(s.serviceId === serviceId && s.serviceType === serviceType)
//                 ),
//               }));
//               Alert.alert('Успех', 'Услуга удалена из категории');
//             } catch (error) {
//               console.error('Error deleting category service:', error);
//               Alert.alert('Ошибка', 'Не удалось удалить услугу: ' + error.message);
//             }
//           },
//         },
//       ]
//     );
//   };

//   // Create wedding
//   const handleCreateWedding = async () => {
//     if (!weddingName || !weddingDate) {
//       Alert.alert('Ошибка', 'Введите название и дату свадьбы');
//       return;
//     }
//     const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
//     if (!dateRegex.test(weddingDate)) {
//       Alert.alert('Ошибка', 'Дата должна быть в формате ГГГГ-ММ-ДД');
//       return;
//     }
//     try {
//       const weddingData = {
//         name: weddingName,
//         date: weddingDate,
//         items: selectedItems.map((item) => ({
//           id: item.id,
//           type: item.type,
//           totalCost: item.totalCost || 0,
//         })),
//       };
//       const response = await api.createWedding(weddingData, token);
//       const newWedding = response.data.data;
//       setWeddings((prev) => [...prev, newWedding]);
//       setWeddingItemsCache((prev) => ({ ...prev, [newWedding.id]: [] }));
//       Alert.alert('Успех', 'Свадьба создана');
//       setWeddingModalVisible(false);
//       setWeddingName('');
//       setWeddingDate('');
//       setHasShownNoWeddingsAlert(false);
//       setActiveWeddingId(newWedding.id);
//     } catch (error) {
//       console.error('Error creating wedding:', error);
//       Alert.alert('Ошибка', error.response?.data?.error || 'Не удалось создать свадьбу');
//     }
//   };

//   // Update wedding
//   const handleUpdateWedding = async () => {
//     if (!selectedWedding || !weddingName || !weddingDate) {
//       Alert.alert('Ошибка', 'Введите название и дату свадьбы');
//       return;
//     }
//     try {
//       const data = { name: weddingName, date: weddingDate };
//       const response = await api.updateWedding(selectedWedding.id, token, data);
//       setWeddings((prev) =>
//         prev.map((w) => (w.id === selectedWedding.id ? response.data.data : w))
//       );
//       const itemsResponse = await api.getWeddingItems(selectedWedding.id, token);
//       setWeddingItemsCache((prev) => ({
//         ...prev,
//         [selectedWedding.id]: itemsResponse.data.data || [],
//       }));
//       Alert.alert('Успех', 'Свадьба обновлена');
//       setEditWeddingModalVisible(false);
//       setWeddingName('');
//       setWeddingDate('');
//       setSelectedWedding(null);
//     } catch (error) {
//       console.error('Error updating wedding:', error);
//       Alert.alert('Ошибка', error.response?.data?.error || 'Не удалось обновить свадьбу');
//     }
//   };

//   // Delete wedding
//   const handleDeleteWedding = (id) => {
//     Alert.alert(
//       'Подтверждение',
//       'Вы уверены, что хотите удалить эту свадьбу?',
//       [
//         { text: 'Отмена', style: 'cancel' },
//         {
//           text: 'Удалить',
//           onPress: async () => {
//             try {
//               await api.deleteWedding(id, token);
//               setWeddings((prev) => prev.filter((w) => w.id !== id));
//               setWeddingItemsCache((prev) => {
//                 const newCache = { ...prev };
//                 delete newCache[id];
//                 return newCache;
//               });
//               Alert.alert('Успех', 'Свадьба удалена');
//               if (activeWeddingId === id) {
//                 const newWeddingId = weddings.find((w) => w.id !== id)?.id || null;
//                 setActiveWeddingId(newWeddingId);
//               }
//             } catch (error) {
//               console.error('Error deleting wedding:', error);
//               Alert.alert('Ошибка', 'Не удалось удалить свадьбу');
//             }
//           },
//         },
//       ]
//     );
//   };

//   // Delete wedding item
//   const handleDeleteWeddingItem = async (weddingItemId) => {
//     Alert.alert(
//       'Подтверждение',
//       'Вы уверены, что хотите удалить этот элемент?',
//       [
//         { text: 'Отмена', style: 'cancel' },
//         {
//           text: 'Удалить',
//           onPress: async () => {
//             try {
//               const weddingItem = Object.values(weddingItemsCache)
//                 .flat()
//                 .find((item) => item.id === weddingItemId);
//               const weddingId = weddingItem?.wedding_id;
//               await api.deleteWeddingItem(weddingItemId, token);
//               const itemsResponse = await api.getWeddingItems(weddingId, token);
//               setWeddingItemsCache((prev) => ({
//                 ...prev,
//                 [weddingId]: itemsResponse.data.data || [],
//               }));
//               Alert.alert('Успех', 'Элемент удален');
//             } catch (error) {
//               console.error('Error deleting wedding item:', error);
//               Alert.alert('Ошибка', 'Не удалось удалить элемент: ' + error.message);
//             }
//           },
//         },
//       ]
//     );
//   };

//   // Add wishlist item
//   const handleAddWishlistItem = async () => {
//     if (selectedGoodIds.length === 0) {
//       Alert.alert('Ошибка', 'Выберите хотя бы один подарок');
//       return;
//     }
//     try {
//       const promises = selectedGoodIds.map((goodId) =>
//         api.createWish({ wedding_id: selectedWedding.id, good_id: goodId }, token)
//       );
//       await Promise.all(promises);
//       Alert.alert('Успех', 'Подарки добавлены');
//       setWishlistModalVisible(false);
//       setSelectedGoodIds([]);
//       const itemsResponse = await api.getWeddingItems(selectedWedding.id, token);
//       setWeddingItemsCache((prev) => ({
//         ...prev,
//         [selectedWedding.id]: itemsResponse.data.data || [],
//       }));
//     } catch (error) {
//       console.error('Error adding wishlist items:', error);
//       Alert.alert('Ошибка', error.response?.data?.error || 'Не удалось добавить подарки');
//     }
//   };

//   // Add custom gift
//   const handleAddCustomGift = async () => {
//     if (!formData.item_name) {
//       Alert.alert('Ошибка', 'Введите название подарка');
//       return;
//     }
//     try {
//       const giftData = {
//         category: 'Miscellaneous',
//         item_name: formData.item_name,
//         cost: '0',
//         supplier_id: userId,
//       };
//       const response = await api.postGoodsData(giftData);
//       const newGood = response.data.data;
//       await api.createWish({ wedding_id: selectedWedding.id, good_id: newGood.id }, token);
//       Alert.alert('Успех', 'Собственный подарок добавлен');
//       setFormData({ ...formData, item_name: '' });
//       setWishlistModalVisible(false);
//       await fetchWishlistItems(selectedWedding.id);
//     } catch (error) {
//       console.error('Error adding custom gift:', error);
//       Alert.alert('Ошибка', 'Не удалось добавить подарок');
//     }
//   };

//   // Fetch wishlist items
//   const fetchWishlistItems = async (weddingId) => {
//     try {
//       const response = await api.getWishlistByWeddingId(weddingId, token);
//       const items = response.data.data;
//       setWishlistItems(items);
//       const filesPromises = items
//         .filter((item) => item.good_id)
//         .map((item) =>
//           fetchFiles(item.good_id).then((files) => ({
//             goodId: item.good_id,
//             files,
//           }))
//         );
//       const filesResults = await Promise.all(filesPromises);
//       const newWishlistFiles = filesResults.reduce((acc, { goodId, files }) => {
//         acc[goodId] = files;
//         return acc;
//       }, {});
//       setWishlistFiles((prev) => ({ ...prev, ...newWishlistFiles }));
//       setWishlistViewModalVisible(true);
//     } catch (error) {
//       console.error('Error fetching wishlist items:', error);
//       Alert.alert('Ошибка', 'Не удалось загрузить список желаний');
//     }
//   };

//   // Reserve wishlist item
//   const handleReserveWishlistItem = async (wishlistId) => {
//     Alert.alert(
//       'Подтверждение',
//       'Вы хотите зарезервировать этот подарок?',
//       [
//         { text: 'Отмена', style: 'cancel' },
//         {
//           text: 'Зарезервировать',
//           onPress: async () => {
//             try {
//               const response = await api.reserveWishlistItem(wishlistId, token);
//               Alert.alert('Успех', 'Подарок зарезервирован');
//               setWishlistItems((prev) =>
//                 prev.map((item) =>
//                   item.id === wishlistId ? response.data.data : item
//                 )
//               );
//             } catch (error) {
//               console.error('Error reserving wishlist item:', error);
//               Alert.alert('Ошибка', error.response?.data?.error || 'Не удалось зарезервировать подарок');
//             }
//           },
//         },
//       ]
//     );
//   };

//   // Share wedding link
//   const handleShareWeddingLink = async (weddingId) => {
//     try {
//       const webLink = `${BASE_URL}/api/weddingwishes/${weddingId}`;
//       await Share.share({
//         message: webLink,
//         title: 'Приглашение на свадьбу',
//       });
//     } catch (error) {
//       console.error('Error sharing wedding link:', error);
//       Alert.alert('Ошибка', 'Не удалось поделиться ссылкой');
//     }
//   };

//   // Open edit category modal
//   const openEditCategoryModal = async (category) => {
//     setSelectedCategory(category);
//     setCategoryName(category.name);
//     setCategoryDescription(category.description || '');
//     setCategoryStatus(category.status || 'active');
//     const details = await fetchEventCategoryDetails(category.id);
//     setCategoryServices(details?.services?.map((s) => ({ id: s.serviceId, serviceType: s.serviceType })) || []);
//     setCategoryModalVisible(true);
//   };

//   // Open category details modal
//   const openCategoryDetailsModal = async (category) => {
//     setSelectedCategory(category);
//     await fetchEventCategoryDetails(category.id);
//     setCategoryDetailsModalVisible(true);
//   };

//   // Open service details modal
//   const openServiceDetailsModal = async (service) => {
//     console.log('Service details:', service);
//     setServiceDetailsModalVisible(true);
//     setLoadingServiceDetails(true);
//     const normalizedServiceType = service.serviceType.toLowerCase().replace(/s$/, '');
//     const details = await fetchServiceDetails(service.serviceId, normalizedServiceType);
//     if (details) {
//       setSelectedService(details);
//     } else {
//       setSelectedService(service);
//       Alert.alert('Ошибка', `Не удалось загрузить полные детали для услуги ${service.name}`);
//     }
//     setLoadingServiceDetails(false);
//   };

//   // Open edit wedding modal
//   const openEditWeddingModal = (wedding) => {
//     setSelectedWedding(wedding);
//     setWeddingName(wedding.name);
//     setWeddingDate(wedding.date);
//     setEditWeddingModalVisible(true);
//   };

//   // Open item details modal
//   const openItemDetailsModal = async (weddingItem) => {
//     const normalizedItemType = weddingItem.item_type.toLowerCase().replace(/s$/, '');
//     const details = await fetchItemDetails(normalizedItemType, weddingItem.item_id);
//     setSelectedItem(details ? { ...weddingItem, ...details } : weddingItem);
//     setDetailsModalVisible(true);
//   };

//   // Handle date change
//   const onDateChange = (day) => {
//     setWeddingDate(day.dateString);
//     setShowCalendar(false);
//   };

//   // Refresh data
//   const onRefresh = useCallback(async () => {
//     setRefreshing(true);
//     await Promise.all([fetchEventCategories(), fetchAvailableServices(), fetchWeddings(), fetchGoods()]);
//     setRefreshing(false);
//   }, []);

//   // Initialize data
//   useEffect(() => {
//     const initialize = async () => {
//       setLoadingCategories(true);
//       setLoadingWeddings(true);
//       try {
//         const [categoriesResponse, weddingsResponse, goodsResponse] = await Promise.all([
//           api.getEventCategories(),
//           api.getWedding(token),
//           api.getGoods(token),
//         ]);
//         const categories = Array.isArray(categoriesResponse.data) ? categoriesResponse.data : categoriesResponse.data.data || [];
//         setEventCategories(categories);
//         setWeddings(Array.isArray(weddingsResponse.data) ? weddingsResponse.data : weddingsResponse.data.data || []);
//         setGoods(Array.isArray(goodsResponse.data) ? goodsResponse.data : goodsResponse.data.data || []);

//         // Cache wedding items
//         const itemsPromises = weddingsResponse.data.data.map((wedding) =>
//           api.getWeddingItems(wedding.id, token).then((res) => ({
//             weddingId: wedding.id,
//             items: res.data.data || [],
//           }))
//         );
//         const itemsResults = await Promise.all(itemsPromises);
//         const newWeddingCache = itemsResults.reduce((acc, { weddingId, items }) => {
//           acc[weddingId] = items;
//           return acc;
//         }, {});
//         setWeddingItemsCache(newWeddingCache);

//         // Cache category services
//         const servicesPromises = categories.map((category) =>
//           api.getEventCategoryWithServices(category.id).then((res) => ({
//             categoryId: category.id,
//             services: res.data.data.services || [],
//           }))
//         );
//         const servicesResults = await Promise.all(servicesPromises);
//         const newCategoryCache = servicesResults.reduce((acc, { categoryId, services }) => {
//           acc[categoryId] = services;
//           return acc;
//         }, {});
//         setCategoryServicesCache(newCategoryCache);

//         await fetchAvailableServices();
//       } catch (error) {
//         console.error('Error initializing:', error);
//         setEventCategories([]);
//         setWeddings([]);
//         setGoods([]);
//         setWeddingItemsCache({});
//         setCategoryServicesCache({});
//       } finally {
//         setLoadingCategories(false);
//         setLoadingWeddings(false);
//       }
//     };
//     initialize();
//   }, []);

//   // Check for no weddings alert
//   useEffect(() => {
//     if (!loadingWeddings && weddings.length === 0 && !hasShownNoWeddingsAlert) {
//       setWeddingModalVisible(true);
//       setHasShownNoWeddingsAlert(true);
//     }
//   }, [loadingWeddings, weddings, hasShownNoWeddingsAlert]);

//   // Handle deep links
//   useEffect(() => {
//     const handleDeepLink = async () => {
//       const initialUrl = await Linking.getInitialURL();
//       if (initialUrl) {
//         const { path, queryParams } = Linking.parse(initialUrl);
//         console.log('Parsed path:', path, 'Params:', queryParams);
//       }
//       const subscription = Linking.addEventListener('url', ({ url }) => {
//         const { path, queryParams } = Linking.parse(url);
//         console.log('Parsed path:', path, 'Params:', queryParams);
//       });
//       return () => subscription.remove();
//     };
//     handleDeepLink();
//   }, []);

//   // Group items by category
//   const groupItemsByCategory = (items) => {
//     const categoryMap = {
//       restaurants: 'Рестораны',
//       clothing: 'Одежда',
//       tamada: 'Тамада',
//       program: 'Программы',
//       'traditional-gift': 'Традиционные подарки',
//       flowers: 'Цветы',
//       cakes: 'Торты',
//       alcohol: 'Алкоголь',
//       transport: 'Транспорт',
//       goods: 'Товары',
//       jewelry: 'Ювелирные изделия',
//     };
//     const grouped = items.reduce((acc, item) => {
//       const category = item.item_type || item.serviceType;
//       if (!acc[category]) {
//         acc[category] = { name: categoryMap[category] || category, items: [] };
//       }
//       acc[category].items.push(item);
//       return acc;
//     }, {});
//     return Object.values(grouped).sort((a, b) => a.name.localeCompare(b.name));
//   };

//   // Render event category item
//   const renderEventCategoryItem = ({ item }) => {
//     const filteredServices = categoryServicesCache[item.id] || [];
//     const groupedServices = groupItemsByCategory(filteredServices);
//     return (
//       <View style={styles.itemContainer}>
//         <Text style={styles.itemText}>
//           {item.name} ({item.status === 'active' ? 'Активно' : 'Неактивно'})
//         </Text>
//         <Text style={styles.itemSubText}>
//           Описание: {item.description || 'Нет описания'}
//         </Text>
//         {groupedServices.length > 0 ? (
//           <View style={styles.weddingItemsContainer}>
//             {groupedServices.map((group) => (
//               <View key={group.name} style={styles.categorySection}>
//                 <Text style={styles.categoryTitle}>{group.name}</Text>
//                 {group.items.map((service) => (
//                   <View
//                     key={`${service.serviceType}-${service.serviceId}`}
//                     style={styles.weddingItem}
//                   >
//                     <Text style={styles.subItemText}>
//                       {service.name} {service.cost ? `- ${service.cost} тг` : ''}
//                     </Text>
//                     <View style={styles.itemActions}>
//                       <TouchableOpacity
//                         style={styles.detailsButton}
//                         onPress={() => openServiceDetailsModal(service)}
//                       >
//                         <Text style={styles.detailsButtonText}>Подробнее</Text>
//                       </TouchableOpacity>
//                       <TouchableOpacity
//                         style={styles.deleteButton}
//                         onPress={() => handleDeleteCategoryService(item.id, service.serviceId, service.serviceType)}
//                       >
//                         <Text style={styles.deleteButtonText}>Удалить</Text>
//                       </TouchableOpacity>
//                     </View>
//                   </View>
//                 ))}
//               </View>
//             ))}
//           </View>
//         ) : (
//           <View style={styles.emptyItemsContainer}>
//             <Text style={styles.noItems}>Нет услуг для этой категории</Text>
//             <TouchableOpacity
//               style={styles.addItemsButton}
//               onPress={() => openEditCategoryModal(item)}
//             >
//               <Text style={styles.addItemsButtonText}>Добавить услуги</Text>
//             </TouchableOpacity>
//           </View>
//         )}
//         <View style={styles.buttonRow}>
//           <TouchableOpacity
//             style={styles.actionButtonPrimary}
//             onPress={() => openCategoryDetailsModal(item)}
//           >
//             <Text style={styles.actionButtonText}>Подробнее</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={styles.actionButtonSecondary}
//             onPress={() => openEditCategoryModal(item)}
//           >
//             <Text style={styles.actionButtonText}>Редактировать</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={styles.actionButtonError}
//             onPress={() => handleDeleteEventCategory(item.id)}
//           >
//             <Text style={styles.actionButtonText}>Удалить</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     );
//   };

//   // Render wedding item
//   const renderWeddingItem = ({ item }) => {
//     const filteredItems = weddingItemsCache[item.id] || [];
//     const groupedItems = groupItemsByCategory(filteredItems);
//     return (
//       <View style={styles.itemContainer}>
//         <Text style={styles.itemText}>
//           {item.name} ({item.date})
//         </Text>
//         {groupedItems.length > 0 ? (
//           <View style={styles.weddingItemsContainer}>
//             {groupedItems.map((category) => (
//               <View key={category.name} style={styles.categorySection}>
//                 <Text style={styles.categoryTitle}>{category.name}</Text>
//                 {category.items.map((weddingItem) => (
//                   <View
//                     key={`${weddingItem.item_type}-${weddingItem.id}`}
//                     style={styles.weddingItem}
//                   >
//                     <Text style={styles.subItemText}>
//                       {(() => {
//                         switch (weddingItem.item_type) {
//                           case 'restaurants':
//                             return `Ресторан - ${weddingItem.total_cost || 0} тг`;
//                           case 'clothing':
//                             return `Одежда - ${weddingItem.total_cost || 0} тг`;
//                           case 'tamada':
//                             return `Тамада - ${weddingItem.total_cost || 0} тг`;
//                           case 'program':
//                             return `Программа - ${weddingItem.total_cost || 0} тг`;
//                           case 'traditional-gift':
//                             return `Традиционный подарок - ${weddingItem.total_cost || 0} тг`;
//                           case 'flowers':
//                             return `Цветы - ${weddingItem.total_cost || 0} тг`;
//                           case 'cakes':
//                             return `Торт - ${weddingItem.total_cost || 0} тг`;
//                           case 'alcohol':
//                             return `Алкоголь - ${weddingItem.total_cost || 0} тг`;
//                           case 'transport':
//                             return `Транспорт - ${weddingItem.total_cost || 0} тг`;
//                           case 'goods':
//                             return `Товар - ${weddingItem.total_cost || 0} тг`;
//                           case 'jewelry':
//                             return `Ювелирные изделия - ${weddingItem.total_cost || 0} тг`;
//                           default:
//                             return `Неизвестный элемент - ${weddingItem.total_cost || 0} тг`;
//                         }
//                       })()}
//                     </Text>
//                     <View style={styles.itemActions}>
//                       <TouchableOpacity
//                         style={styles.detailsButton}
//                         onPress={() => openItemDetailsModal(weddingItem)}
//                       >
//                         <Text style={styles.detailsButtonText}>Подробнее</Text>
//                       </TouchableOpacity>
//                       <TouchableOpacity
//                         style={styles.deleteButton}
//                         onPress={() => handleDeleteWeddingItem(weddingItem.id)}
//                       >
//                         <Text style={styles.deleteButtonText}>Удалить</Text>
//                       </TouchableOpacity>
//                     </View>
//                   </View>
//                 ))}
//               </View>
//             ))}
//           </View>
//         ) : (
//           <View style={styles.emptyItemsContainer}>
//             <Text style={styles.noItems}>Нет элементов для этой свадьбы</Text>
//             <TouchableOpacity
//               style={styles.addItemsButton}
//               onPress={() => {
//                 navigation.navigate('AddWeddingItemsScreen', { weddingId: item.id });
//               }}
//             >
//               <Text style={styles.addItemsButtonText}>Добавить элементы</Text>
//             </TouchableOpacity>
//           </View>
//         )}
//         <View style={styles.buttonRow}>
//           <TouchableOpacity
//             style={styles.actionButtonPrimary}
//             onPress={() => openEditWeddingModal(item)}
//           >
//             <Text style={styles.actionButtonText}>Редактировать</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={styles.actionButtonSecondary}
//             onPress={() => {
//               setSelectedWedding(item);
//               setWishlistModalVisible(true);
//             }}
//           >
//             <Text style={styles.actionButtonText}>Добавить подарок</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={styles.actionButtonAccent}
//             onPress={() => {
//               setSelectedWedding(item);
//               fetchWishlistItems(item.id);
//             }}
//           >
//             <Text style={styles.actionButtonText}>Просмотреть подарки</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={styles.actionButtonError}
//             onPress={() => handleDeleteWedding(item.id)}
//           >
//             <Text style={styles.actionButtonText}>Удалить</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={styles.actionButtonPrimary}
//             onPress={() => handleShareWeddingLink(item.id)}
//           >
//             <Text style={styles.actionButtonText}>Поделиться</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     );
//   };

//   // Render combined list item
//   const renderItem = ({ item }) => {
//     if (item.type === 'category') {
//       return renderEventCategoryItem({ item: item.data });
//     } else if (item.type === 'wedding') {
//       return renderWeddingItem({ item: item.data });
//     }
//     return null;
//   };

//   // Render good card
//   const renderGoodCard = ({ item }) => (
//     <TouchableOpacity
//       style={[
//         styles.goodCard,
//         selectedGoodIds.includes(item.id) && styles.selectedGoodCard,
//       ]}
//       onPress={() => {
//         setSelectedGoodIds((prev) =>
//           prev.includes(item.id)
//             ? prev.filter((id) => id !== item.id)
//             : [...prev, item.id]
//         );
//       }}
//     >
//       <Text style={styles.goodCardTitle}>{item.item_name}</Text>
//       <Text style={styles.goodCardCategory}>Категория: {item.category}</Text>
//       <Text style={styles.goodCardCost}>
//         {item.cost ? `Цена: ${item.cost}` : 'Цена не указана'}
//       </Text>
//       {item.specs?.goodLink && (
//         <TouchableOpacity onPress={() => Linking.openURL(item.specs.goodLink)}>
//           <Text style={styles.linkText}>Открыть ссылку</Text>
//         </TouchableOpacity>
//       )}
//       {selectedGoodIds.includes(item.id) && (
//         <Text style={styles.selectedIndicator}>✓</Text>
//       )}
//     </TouchableOpacity>
//   );

//   // Render wishlist item
//   const renderWishlistItem = ({ item }) => {
//     const files = wishlistFiles[item.good_id] || [];
//     return (
//       <View style={styles.wishlistCard}>
//         <ScrollView contentContainerStyle={styles.wishlistCardContent}>
//           <Text
//             style={[
//               styles.wishlistTitle,
//               item.is_reserved && styles.strikethroughText,
//             ]}
//           >
//             {item.item_name}
//           </Text>
//           <Text style={styles.wishlistStatus}>
//             {item.is_reserved
//               ? `Кто подарит: ${item.Reserver?.username || item.reserved_by_unknown}`
//               : 'Свободно'}
//           </Text>
//           {item.goodLink && (
//             <TouchableOpacity onPress={() => Linking.openURL(item.goodLink)}>
//               <Text style={styles.linkText}>Открыть ссылку</Text>
//             </TouchableOpacity>
//           )}
//           <View style={styles.mediaSection}>
//             {loadingFiles ? (
//               <ActivityIndicator size="small" color={COLORS.primary} style={styles.loader} />
//             ) : errorFiles ? (
//               <Text style={styles.errorText}>{errorFiles}</Text>
//             ) : files.length > 0 ? (
//               <FlatList
//                 data={files}
//                 renderItem={({ item: file }) => (
//                   <View style={styles.card}>
//                     {file.mimetype.startsWith('image/') ? (
//                       <Image source={{ uri: `${BASE_URL}/${file.path}` }} style={styles.media} resizeMode="cover" />
//                     ) : file.mimetype === 'video/mp4' ? (
//                       <Video
//                         source={{ uri: `${BASE_URL}/${file.path}` }}
//                         style={styles.video}
//                         useNativeControls
//                         resizeMode="contain"
//                         isLooping
//                       />
//                     ) : (
//                       <Text style={styles.detail}>Неподдерживаемый формат: {file.mimetype}</Text>
//                     )}
//                   </View>
//                 )}
//                 keyExtractor={(file) => file.id.toString()}
//                 horizontal
//                 showsHorizontalScrollIndicator={false}
//                 contentContainerStyle={styles.mediaList}
//               />
//             ) : (
//               <Text style={styles.noFilesText}>Файлы отсутствуют</Text>
//             )}
//           </View>
//         </ScrollView>
//       </View>
//     );
//   };

//   // Render service in category
//   const renderServiceInCategory = ({ item }) => (
//     <View style={styles.serviceCard}>
//       <Text style={styles.serviceCardTitle}>{item.name}</Text>
//       <Text style={styles.serviceCardDescription}>
//         {item.description || 'Нет описания'}
//       </Text>
//       <Text style={styles.serviceCardType}>Тип: {item.serviceType}</Text>
//       <TouchableOpacity
//         style={styles.detailsButton}
//         onPress={() => openServiceDetailsModal(item)}
//       >
//         <Text style={styles.detailsButtonText}>Подробнее</Text>
//       </TouchableOpacity>
//     </View>
//   );

//   // Render service item for selection
//   const renderServiceItem = ({ item }) => (
//     <TouchableOpacity
    
//       onPress={() => {
//         setCategoryServices((prev) => {
//           const exists = prev.some((s) => s.id === item.id && s.serviceType === item.serviceType);
//           if (exists) {
//             return prev.filter((s) => !(s.id === item.id && s.serviceType === item.serviceType));
//           }
//           return [...prev, { id: item.id, serviceType: item.serviceType }];
//         });
//       }}
//     >
//       <Text style={styles.serviceCardTitle}>{item.name}</Text>
//       <Text style={styles.serviceCardDescription}>
//         {item.description || 'Нет описания'}
//       </Text>
//       <Text style={styles.serviceCardType}>Тип: {item.serviceType}</Text>
//       {categoryServices.some((s) => s.id === item.id && s.serviceType === item.serviceType) && (
//         <Text style={styles.selectedIndicator}>✓</Text>
//       )}
//     </TouchableOpacity>
//   );

//   // Combine categories and weddings for display
//   const combinedData = [
//     ...eventCategories.map((cat) => ({ type: 'category', data: cat })),
//     ...weddings.map((wed) => ({ type: 'wedding', data: wed })),
//   ];

//   return (
//     <SafeAreaView style={styles.container}>
//       <Text style={styles.title}>Мои мероприятия</Text>
//       <View style={styles.buttonRow}>
      
//       </View>
//       {loadingCategories || loadingWeddings ? (
//         <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
//       ) : (
//         <FlatList
//           data={combinedData}
//           renderItem={renderItem}
//           keyExtractor={(item) => `${item.type}-${item.data.id}`}
//           ListEmptyComponent={
//             <View style={styles.emptyContainer}>
//               <Text style={styles.noItems}>Нет мероприятий или свадеб</Text>
//             </View>
//           }
//           contentContainerStyle={styles.listContainer}
//           refreshControl={
//             <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
//           }
//         />
//       )}

    
    

//       {/* Wedding Modal */}
//       <Modal visible={weddingModalVisible} animationType="slide">
//         <SafeAreaView style={styles.modalContainer}>
//           <Text style={styles.subtitle}>Создать свадьбу</Text>
//           <TextInput
//             style={styles.input}
//             placeholder="Название свадьбы"
//             placeholderTextColor={COLORS.muted}
//             value={weddingName}
//             onChangeText={setWeddingName}
//           />
//           <TextInput
//             style={styles.input}
//             placeholder="Дата свадьбы (ГГГГ-ММ-ДД)"
//             placeholderTextColor={COLORS.muted}
//             value={weddingDate}
//             onChangeText={setWeddingDate}
//             onFocus={() => setShowCalendar(true)}
//           />
//           {showCalendar && (
//             <Calendar
//               onDayPress={onDateChange}
//               markedDates={{
//                 [weddingDate]: { selected: true, marked: true, selectedColor: COLORS.primary },
//               }}
//               style={styles.calendar}
//             />
//           )}
//           <View style={styles.buttonRowModal}>
//             <Button
//               title="Создать"
//               onPress={handleCreateWedding}
//               color={COLORS.primary}
//             />
//             <Button
//               title="Отмена"
//               onPress={() => {
//                 setWeddingModalVisible(false);
//                 setWeddingName('');
//                 setWeddingDate('');
//                 setShowCalendar(false);
//               }}
//               color={COLORS.error}
//             />
//           </View>
//         </SafeAreaView>
//       </Modal>

//       {/* Edit Wedding Modal */}
//       <Modal visible={editWeddingModalVisible} animationType="slide">
//         <SafeAreaView style={styles.modalContainer}>
//           <Text style={styles.subtitle}>Редактировать свадьбу</Text>
//           <TextInput
//             style={styles.input}
//             placeholder="Название свадьбы"
//             placeholderTextColor={COLORS.muted}
//             value={weddingName}
//             onChangeText={setWeddingName}
//           />
//           <TextInput
//             style={styles.input}
//             placeholder="Дата свадьбы (ГГГГ-ММ-ДД)"
//             placeholderTextColor={COLORS.muted}
//             value={weddingDate}
//             onChangeText={setWeddingDate}
//             onFocus={() => setShowCalendar(true)}
//           />
//           {showCalendar && (
//             <Calendar
//               onDayPress={onDateChange}
//               markedDates={{
//                 [weddingDate]: { selected: true, marked: true, selectedColor: COLORS.primary },
//               }}
//               style={styles.calendar}
//             />
//           )}
//           <View style={styles.buttonRowModal}>
//             <Button
//               title="Сохранить"
//               onPress={handleUpdateWedding}
//               color={COLORS.primary}
//             />
//             <Button
//               title="Отмена"
//               onPress={() => {
//                 setEditWeddingModalVisible(false);
//                 setWeddingName('');
//                 setWeddingDate('');
//                 setSelectedWedding(null);
//                 setShowCalendar(false);
//               }}
//               color={COLORS.error}
//             />
//           </View>
//         </SafeAreaView>
//       </Modal>

//       {/* Wishlist Modal */}
//       <Modal visible={wishlistModalVisible} animationType="slide">
//         <SafeAreaView style={styles.modalContainer}>
//           <Text style={styles.subtitle}>Добавить подарок</Text>
//           <View style={styles.switchContainer}>
//             <Text style={styles.switchLabel}>Добавить собственный подарок</Text>
//             <TouchableOpacity
//               style={[styles.switch, isCustomGift && styles.switchActive]}
//               onPress={() => setIsCustomGift(!isCustomGift)}
//             >
//               <Text style={styles.switchText}>{isCustomGift ? 'Вкл' : 'Выкл'}</Text>
//             </TouchableOpacity>
//           </View>
//           {isCustomGift ? (
//             <>
//               <TextInput
//                 style={styles.input}
//                 placeholder="Название подарка"
//                 placeholderTextColor={COLORS.muted}
//                 value={formData.item_name}
//                 onChangeText={(text) => setFormData({ ...formData, item_name: text })}
//               />
//               <Button
//                 title="Добавить"
//                 onPress={handleAddCustomGift}
//                 color={COLORS.primary}
//               />
//             </>
//           ) : (
//             <FlatList
//               data={goods}
//               renderItem={renderGoodCard}
//               keyExtractor={(item) => item.id.toString()}
//               ListEmptyComponent={<Text style={styles.noItems}>Товары недоступны</Text>}
//               contentContainerStyle={styles.listContainer}
//             />
//           )}
//           {!isCustomGift && (
//             <View style={styles.buttonRowModal}>
//               <Button
//                 title="Добавить выбранные"
//                 onPress={handleAddWishlistItem}
//                 color={COLORS.primary}
//                 disabled={selectedGoodIds.length === 0}
//               />
//               <Button
//                 title="Отмена"
//                 onPress={() => {
//                   setWishlistModalVisible(false);
//                   setSelectedGoodIds([]);
//                   setIsCustomGift(false);
//                 }}
//                 color={COLORS.error}
//               />
//             </View>
//           )}
//         </SafeAreaView>
//       </Modal>

//       {/* Wishlist View Modal */}
//       <Modal visible={wishlistViewModalVisible} animationType="slide">
//         <SafeAreaView style={styles.modalContainer}>
//           <Text style={styles.subtitle}>Список желаний</Text>
//           <FlatList
//             data={wishlistItems}
//             renderItem={renderWishlistItem}
//             keyExtractor={(item) => item.id.toString()}
//             ListEmptyComponent={<Text style={styles.noItems}>Список желаний пуст</Text>}
//             contentContainerStyle={styles.listContainer}
//           />
//           <Button
//             title="Закрыть"
//             onPress={() => setWishlistViewModalVisible(false)}
//             color={COLORS.error}
//           />
//         </SafeAreaView>
//       </Modal>

//       {/* Category Details Modal */}
//       <Modal visible={categoryDetailsModalVisible} animationType="slide">
//         <SafeAreaView style={styles.modalContainer}>
//           <Text style={styles.subtitle}>Детали категории</Text>
//           {loadingDetails ? (
//             <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
//           ) : categoryDetails ? (
//             <ScrollView style={{ width: '100%' }}>
//               <Text style={styles.detail}>Название: {categoryDetails.name}</Text>
//               <Text style={styles.detail}>
//                 Описание: {categoryDetails.description || 'Нет описания'}
//               </Text>
//               <Text style={styles.detail}>
//                 Статус: {categoryDetails.status === 'active' ? 'Активно' : 'Неактивно'}
//               </Text>
//               <Text style={styles.sectionTitle}>Услуги</Text>
//               <FlatList
//                 data={categoryServicesCache[categoryDetails.id] || []}
//                 renderItem={renderServiceInCategory}
//                 keyExtractor={(item) => `${item.serviceType}-${item.serviceId}`}
//                 ListEmptyComponent={<Text style={styles.noItems}>Нет услуг</Text>}
//                 contentContainerStyle={styles.serviceList}
//               />
//             </ScrollView>
//           ) : (
//             <Text style={styles.noItems}>Детали недоступны</Text>
//           )}
//           <Button
//             title="Закрыть"
//             onPress={() => {
//               setCategoryDetailsModalVisible(false);
//               setCategoryDetails(null);
//             }}
//             color={COLORS.error}
//           />
//         </SafeAreaView>
//       </Modal>

//       {/* Service Details Modal */}
//       <Modal visible={serviceDetailsModalVisible} animationType="slide">
//         <SafeAreaView style={styles.modalContainer}>
//           <Text style={styles.subtitle}>Детали услуги</Text>
//           {loadingServiceDetails ? (
//             <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
//           ) : selectedService ? (
//             <ScrollView style={{ width: '100%' }}>
//               <Text style={styles.detail}>Название: {selectedService.name}</Text>
//               <Text style={styles.detail}>
//                 Тип: {selectedService.serviceType}
//               </Text>
//               <Text style={styles.detail}>
//                 Описание: {selectedService.description || 'Нет описания'}
//               </Text>
//               <Text style={styles.detail}>
//                 Стоимость: {selectedService.cost ? `${selectedService.cost} тг` : 'Не указана'}
//               </Text>
//               {selectedService.address && (
//                 <Text style={styles.detail}>Адрес: {selectedService.address}</Text>
//               )}
//               {selectedService.cuisine && (
//                 <Text style={styles.detail}>Кухня: {selectedService.cuisine}</Text>
//               )}
//               <Text style={styles.detail}>
//                 Создано: {selectedService.created_at || 'Не указано'}
//               </Text>
//               <Text style={styles.detail}>
//                 Обновлено: {selectedService.updated_at || 'Не указано'}
//               </Text>
//             </ScrollView>
//           ) : (
//             <Text style={styles.noItems}>Детали недоступны</Text>
//           )}
//           <Button
//             title="Закрыть"
//             onPress={() => {
//               setServiceDetailsModalVisible(false);
//               setSelectedService(null);
//             }}
//             color={COLORS.error}
//           />
//         </SafeAreaView>
//       </Modal>

//       {/* Item Details Modal */}
//    <Modal visible={detailsModalVisible} animationType="slide">
//   <SafeAreaView style={styles.modalContainer}>
//     <Text style={styles.subtitle}>Детали элемента</Text>
//     {loadingDetails ? (
//       <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
//     ) : selectedItem ? (
//       <ScrollView style={{ width: '100%' }}>
//         <Text style={styles.detail}>
//           Тип: {selectedItem.item_type || 'Не указано'}
//         </Text>
//         <Text style={styles.detail}>
//           Стоимость: {selectedItem.total_cost ? `${selectedItem.total_cost} тг` : 'Не указана'}
//         </Text>
//         {selectedItem.name && (
//           <Text style={styles.detail}>Название: {selectedItem.name}</Text>
//         )}
//         {selectedItem.description && (
//           <Text style={styles.detail}>Описание: {selectedItem.description}</Text>
//         )}
//         {selectedItem.address && (
//           <Text style={styles.detail}>Адрес: {selectedItem.address}</Text>
//         )}
//         {selectedItem.cuisine && (
//           <Text style={styles.detail}>Кухня: {selectedItem.cuisine}</Text>
//         )}
//         {selectedItem.created_at && (
//           <Text style={styles.detail}>Создано: {selectedItem.created_at}</Text>
//         )}
//         {selectedItem.updated_at && (
//           <Text style={styles.detail}>Обновлено: {selectedItem.updated_at}</Text>
//         )}
//         {selectedItem.serviceId && (
//           <Text style={styles.detail}>ID услуги: {selectedItem.serviceId}</Text>
//         )}
//         {selectedItem.wedding_id && (
//           <Text style={styles.detail}>ID свадьбы: {selectedItem.wedding_id}</Text>
//         )}
//         {selectedItem.item_id && (
//           <Text style={styles.detail}>ID элемента: {selectedItem.item_id}</Text>
//         )}
//         {selectedItem.status && (
//           <Text style={styles.detail}>Статус: {selectedItem.status}</Text>
//         )}
//         {selectedItem.specs && typeof selectedItem.specs === 'object' && (
//           <View style={styles.detail}>
//             <Text style={styles.detail}>Характеристики:</Text>
//             {Object.entries(selectedItem.specs).map(([key, value]) => (
//               <Text key={key} style={styles.detail}>
//                 {key}: {value}
//               </Text>
//             ))}
//           </View>
//         )}
//       </ScrollView>
//     ) : (
//       <Text style={styles.noItems}>Детали недоступны</Text>
//     )}
//     <Button
//       title="Закрыть"
//       onPress={() => {
//         setDetailsModalVisible(false);
//         setSelectedItem(null);
//       }}
//       color={COLORS.error}
//     />
//   </SafeAreaView>
// </Modal>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: COLORS.background,
//     paddingHorizontal: 16,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: COLORS.text,
//     marginVertical: 16,
//     textAlign: 'center',
//   },
//   subtitle: {
//     fontSize: 20,
//     fontWeight: '600',
//     color: COLORS.text,
//     marginVertical: 12,
//     textAlign: 'center',
//   },
//   itemContainer: {
//     backgroundColor: COLORS.white,
//     padding: 16,
//     marginVertical: 8,
//     borderRadius: 8,
//     shadowColor: COLORS.shadow,
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   itemText: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: COLORS.text,
//   },
//   itemSubText: {
//     fontSize: 14,
//     color: COLORS.muted,
//     marginTop: 4,
//   },
//   buttonRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 12,
//     flexWrap: 'wrap',
//   },
//   buttonRowModal: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     marginVertical: 16,
//   },
//   createButton: {
//     backgroundColor: COLORS.primary,
//     paddingVertical: 10,
//     paddingHorizontal: 16,
//     borderRadius: 8,
//     marginVertical: 8,
//     flex: 1,
//     marginHorizontal: 4,
//   },
//   createButtonText: {
//     color: COLORS.white,
//     fontSize: 16,
//     fontWeight: '600',
//     textAlign: 'center',
//   },
//   actionButtonPrimary: {
//     backgroundColor: COLORS.primary,
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     borderRadius: 6,
//     marginHorizontal: 4,
//     flex: 1,
//   },
//   actionButtonSecondary: {
//     backgroundColor: COLORS.secondary,
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     borderRadius: 6,
//     marginHorizontal: 4,
//     flex: 1,
//   },
//   actionButtonAccent: {
//     backgroundColor: COLORS.accent,
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     borderRadius: 6,
//     marginHorizontal: 4,
//     flex: 1,
//   },
//   actionButtonError: {
//     backgroundColor: COLORS.error,
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     borderRadius: 6,
//     marginHorizontal: 4,
//     flex: 1,
//   },
//   actionButtonText: {
//     color: COLORS.white,
//     fontSize: 14,
//     fontWeight: '600',
//     textAlign: 'center',
//   },
//   modalContainer: {
//     flex: 1,
//     backgroundColor: COLORS.background,
//     padding: 16,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: COLORS.border,
//     borderRadius: 8,
//     padding: 12,
//     marginVertical: 8,
//     fontSize: 16,
//     color: COLORS.text,
//     backgroundColor: COLORS.white,
//   },
//   multilineInput: {
//     height: 100,
//     textAlignVertical: 'top',
//   },
//   pickerContainer: {
//     marginVertical: 8,
//   },
//   pickerLabel: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: COLORS.text,
//     marginBottom: 4,
//   },
//   picker: {
//     backgroundColor: COLORS.white,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: COLORS.border,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: COLORS.text,
//     marginVertical: 12,
//   },
//   serviceList: {
//     paddingBottom: 16,
//   },
//   serviceCard: {
//     backgroundColor: COLORS.white,
//     padding: 12,
//     marginVertical: 8,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: COLORS.border,
//   },
//   selectedServiceCard: {
//     borderColor: COLORS.primary,
//     borderWidth: 2,
//   },
//   serviceCardTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: COLORS.text,
//   },
//   serviceCardDescription: {
//     fontSize: 14,
//     color: COLORS.muted,
//     marginVertical: 4,
//   },
//   serviceCardType: {
//     fontSize: 14,
//     color: COLORS.muted,
//   },
//   selectedIndicator: {
//     position: 'absolute',
//     top: 8,
//     right: 8,
//     fontSize: 20,
//     color: COLORS.primary,
//     fontWeight: 'bold',
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 16,
//   },
//   noItems: {
//     fontSize: 16,
//     color: COLORS.muted,
//     textAlign: 'center',
//   },
//   loader: {
//     marginVertical: 16,
//   },
//   errorText: {
//     color: COLORS.error,
//     fontSize: 14,
//     textAlign: 'center',
//     marginVertical: 8,
//   },
//   listContainer: {
//     paddingBottom: 16,
//   },
//   goodCard: {
//     backgroundColor: COLORS.white,
//     padding: 12,
//     marginVertical: 8,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: COLORS.border,
//   },
//   selectedGoodCard: {
//     borderColor: COLORS.primary,
//     borderWidth: 2,
//   },
//   goodCardTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: COLORS.text,
//   },
//   goodCardCategory: {
//     fontSize: 14,
//     color: COLORS.muted,
//     marginVertical: 4,
//   },
//   goodCardCost: {
//     fontSize: 14,
//     color: COLORS.muted,
//   },
//   linkText: {
//     color: COLORS.primary,
//     fontSize: 14,
//     marginVertical: 4,
//     textDecorationLine: 'underline',
//   },
//   wishlistCard: {
//     backgroundColor: COLORS.white,
//     padding: 12,
//     marginVertical: 8,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: COLORS.border,
//   },
//   wishlistCardContent: {
//     paddingBottom: 16,
//   },
//   wishlistTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: COLORS.text,
//   },
//   strikethroughText: {
//     textDecorationLine: 'line-through',
//   },
//   wishlistStatus: {
//     fontSize: 14,
//     color: COLORS.muted,
//     marginVertical: 4,
//   },
//   mediaSection: {
//     marginTop: 8,
//   },
//   mediaList: {
//     paddingVertical: 8,
//   },
//   card: {
//     marginRight: 8,
//     borderRadius: 8,
//     overflow: 'hidden',
//   },
//   media: {
//     width: 100,
//     height: 100,
//   },
//   video: {
//     width: 100,
//     height: 100,
//   },
//   noFilesText: {
//     fontSize: 14,
//     color: COLORS.muted,
//   },
//   switchContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginVertical: 8,
//   },
//   switchLabel: {
//     fontSize: 16,
//     color: COLORS.text,
//   },
//   switch: {
//     backgroundColor: COLORS.muted,
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     borderRadius: 8,
//   },
//   switchActive: {
//     backgroundColor: COLORS.primary,
//   },
//   switchText: {
//     color: COLORS.white,
//     fontSize: 14,
//   },
//   calendar: {
//     marginVertical: 8,
//     borderRadius: 8,
//   },
//   weddingItemsContainer: {
//     marginTop: 8,
//   },
//   categorySection: {
//     marginVertical: 8,
//   },
//   categoryTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: COLORS.text,
//     marginBottom: 4,
//   },
//   weddingItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 4,
//   },
//   subItemText: {
//     fontSize: 14,
//     color: COLORS.text,
//     flex: 1,
//   },
//   itemActions: {
//     flexDirection: 'row',
//   },
//   detailsButton: {
//     backgroundColor: COLORS.primary,
//     paddingVertical: 6,
//     paddingHorizontal: 10,
//     borderRadius: 6,
//     marginHorizontal: 4,
//   },
//   detailsButtonText: {
//     color: COLORS.white,
//     fontSize: 12,
//   },
//   deleteButton: {
//     backgroundColor: COLORS.error,
//     paddingVertical: 6,
//     paddingHorizontal: 10,
//     borderRadius: 6,
//     marginHorizontal: 4,
//   },
//   deleteButtonText: {
//     color: COLORS.white,
//     fontSize: 12,
//   },
//   emptyItemsContainer: {
//     alignItems: 'center',
//     marginTop: 8,
//   },
//   addItemsButton: {
//     backgroundColor: COLORS.secondary,
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     borderRadius: 6,
//     marginTop: 8,
//   },
//   addItemsButtonText: {
//     color: COLORS.white,
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   detail: {
//     fontSize: 14,
//     color: COLORS.text,
//     marginVertical: 4,
//   },
// });








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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginVertical: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginVertical: 12,
    textAlign: 'center',
  },
  itemContainer: {
    backgroundColor: COLORS.white,
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  itemSubText: {
    fontSize: 14,
    color: COLORS.muted,
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    flexWrap: 'wrap',
  },
  buttonRowModal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  createButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  createButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  actionButtonPrimary: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginHorizontal: 4,
    flex: 1,
  },
  actionButtonSecondary: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginHorizontal: 4,
    flex: 1,
  },
  actionButtonAccent: {
    backgroundColor: COLORS.accent,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginHorizontal: 4,
    flex: 1,
  },
  actionButtonError: {
    backgroundColor: COLORS.error,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginHorizontal: 4,
    flex: 1,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.white,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    marginVertical: 8,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  picker: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginVertical: 12,
  },
  serviceList: {
    paddingBottom: 16,
  },
  serviceCard: {
    backgroundColor: COLORS.white,
    padding: 12,
    marginVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedServiceCard: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  serviceCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  serviceCardDescription: {
    fontSize: 14,
    color: COLORS.muted,
    marginVertical: 4,
  },
  serviceCardType: {
    fontSize: 14,
    color: COLORS.muted,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    fontSize: 20,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  noItems: {
    fontSize: 16,
    color: COLORS.muted,
    textAlign: 'center',
  },
  loader: {
    marginVertical: 16,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 8,
  },
  listContainer: {
    paddingBottom: 16,
  },
  goodCard: {
    backgroundColor: COLORS.white,
    padding: 12,
    marginVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedGoodCard: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  goodCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  goodCardCategory: {
    fontSize: 14,
    color: COLORS.muted,
    marginVertical: 4,
  },
  goodCardCost: {
    fontSize: 14,
    color: COLORS.muted,
  },
  linkText: {
    color: COLORS.primary,
    fontSize: 14,
    marginVertical: 4,
    textDecorationLine: 'underline',
  },
  wishlistCard: {
    backgroundColor: COLORS.white,
    padding: 12,
    marginVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  wishlistCardContent: {
    flexShrink: 1,
  },
  wishlistTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  strikethroughText: {
    textDecorationLine: 'line-through',
  },
  wishlistStatus: {
    fontSize: 14,
    color: COLORS.muted,
    marginVertical: 4,
  },
  mediaSection: {
    marginTop: 8,
  },
  mediaList: {
    paddingVertical: 8,
  },
  card: {
    marginRight: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  media: {
    width: 100,
    height: 100,
  },
  video: {
    width: 100,
    height: 100,
  },
  noFilesText: {
    fontSize: 14,
    color: COLORS.muted,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  switchLabel: {
    fontSize: 16,
    color: COLORS.text,
  },
  switch: {
    backgroundColor: COLORS.muted,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  switchActive: {
    backgroundColor: COLORS.primary,
  },
  switchText: {
    color: COLORS.white,
    fontSize: 14,
  },
  calendar: {
    marginVertical: 8,
    borderRadius: 8,
  },
  weddingItemsContainer: {
    marginTop: 8,
  },
  categorySection: {
    marginVertical: 8,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  weddingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  subItemText: {
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
  },
  itemActions: {
    flexDirection: 'row',
  },
  detailsButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  detailsButtonText: {
    color: COLORS.white,
    fontSize: 12,
  },
  deleteButton: {
    backgroundColor: COLORS.error,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  deleteButtonText: {
    color: COLORS.white,
    fontSize: 12,
  },
  emptyItemsContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  addItemsButton: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginTop: 8,
  },
  addItemsButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  detail: {
    fontSize: 14,
    color: COLORS.text,
    marginVertical: 4,
  },
});

export default function Item3Screen() {
  const route = useRoute();
  const navigation = useNavigation();
  const selectedItems = route.params?.data || [];
  const userId = useSelector((state) => state.auth.user?.id);
  const token = useSelector((state) => state.auth.token);
  const [eventCategories, setEventCategories] = useState([]);
  const [weddings, setWeddings] = useState([]);
  const [weddingItemsCache, setWeddingItemsCache] = useState({});
  const [categoryServicesCache, setCategoryServicesCache] = useState({});
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

  // Fetch event categories with services
  const fetchEventCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await api.getEventCategories();
      const categories = Array.isArray(response.data) ? response.data : response.data.data || [];
      setEventCategories(categories);

      const servicesPromises = categories.map((category) =>
        api.getEventCategoryWithServices(category.id).then((res) => ({
          categoryId: category.id,
          services: res.data.data.services || [],
        }))
      );
      const servicesResults = await Promise.all(servicesPromises);
      const newCache = servicesResults.reduce((acc, { categoryId, services }) => {
        acc[categoryId] = services;
        return acc;
      }, {});
      setCategoryServicesCache(newCache);
      return categories;
    } catch (error) {
      console.error('Error fetching event categories:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить категории мероприятий');
      setEventCategories([]);
      setCategoryServicesCache({});
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
      setCategoryServicesCache((prev) => ({
        ...prev,
        [id]: details.services || [],
      }));
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
    setLoadingServiceDetails(true);
    try {
      const normalizedServiceType = serviceType.toLowerCase().replace(/s$/, '');
      const methodMap = {
        restaurant: 'getRestaurantById',
        clothing: 'getClothingById',
        tamada: 'getTamadaById',
        program: 'getProgramById',
        traditionalgift: 'getTraditionalGiftById',
        flowers: 'getFlowersById',
        cake: 'getCakeById',
        alcohol: 'getAlcoholById',
        transport: 'getTransportById',
        jewelry: 'getJewelryById',
        wedding: 'getWeddingById',
        eventcategory: 'getEventCategoryById',
        wishlist: 'getWishlistById',
      };
      const methodName = methodMap[normalizedServiceType];
      if (!methodName || !api[methodName]) {
        throw new Error(`Неизвестный тип сервиса: ${normalizedServiceType}`);
      }
      const response = await api[methodName](serviceId);
      const data = response.data.data || response.data;
      return {
        serviceId,
        serviceType: normalizedServiceType,
        name: data.name,
        description: data.description || null,
        cost: data.cost || null,
        created_at: data.createdAt || data.created_at || null,
        updated_at: data.updatedAt || data.updated_at || null,
        address: data.address || null,
        cuisine: data.cuisine || null,
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
      const normalizedItemType = itemType.toLowerCase().replace(/s$/, '');
      const methodMap = {
        restaurant: 'getRestaurantById',
        clothing: 'getClothingById',
        tamada: 'getTamadaById',
        program: 'getProgramById',
        traditionalgift: 'getTraditionalGiftById',
        flower: 'getFlowersById',
        cake: 'getCakeById',
        alcohol: 'getAlcoholById',
        transport: 'getTransportById',
        goods: 'getGoodById',
        jewelry: 'getJewelryById',
      };
      const methodName = methodMap[normalizedItemType];
      if (!methodName || !api[methodName]) {
        throw new Error(`Неизвестный тип элемента: ${normalizedItemType}`);
      }
      const response = await api[methodName](itemId);
      const details = response.data.data || response.data;
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
        setCategoryServicesCache((prev) => ({
          ...prev,
          [newCategory.id]: categoryServices,
        }));
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
      setCategoryServicesCache((prev) => ({
        ...prev,
        [selectedCategory.id]: categoryServices,
      }));
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
              setCategoryServicesCache((prev) => {
                const newCache = { ...prev };
                delete newCache[id];
                return newCache;
              });
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

  // Delete service from category
  const handleDeleteCategoryService = async (categoryId, serviceId, serviceType) => {
    Alert.alert(
      'Подтверждение',
      'Вы уверены, что хотите удалить эту услугу из категории?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          onPress: async () => {
            try {
              await api.removeServiceFromCategory(categoryId, { serviceId, serviceType });
              setCategoryServicesCache((prev) => ({
                ...prev,
                [categoryId]: prev[categoryId].filter(
                  (s) => !(s.serviceId === serviceId && s.serviceType === serviceType)
                ),
              }));
              Alert.alert('Успех', 'Услуга удалена из категории');
            } catch (error) {
              console.error('Error deleting category service:', error);
              Alert.alert('Ошибка', 'Не удалось удалить услугу: ' + error.message);
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
    setCategoryServices(details?.services?.map((s) => ({ id: s.serviceId, serviceType: s.serviceType, name: s.name })) || []);
    setCategoryModalVisible(true);
  };

  // Open category details modal
  const openCategoryDetailsModal = async (category) => {
    setSelectedCategory(category);
    await fetchEventCategoryDetails(category.id);
    setCategoryDetailsModalVisible(true);
  };

  // Open service details modal
  const openServiceDetailsModal = async (service) => {
    setServiceDetailsModalVisible(true);
    setLoadingServiceDetails(true);
    const normalizedServiceType = service.serviceType.toLowerCase().replace(/s$/, '');
    const details = await fetchServiceDetails(service.serviceId, normalizedServiceType);
    if (details) {
      setSelectedService(details);
    } else {
      setSelectedService(service);
      Alert.alert('Ошибка', `Не удалось загрузить полные детали для услуги ${service.name}`);
    }
    setLoadingServiceDetails(false);
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
    const normalizedItemType = weddingItem.item_type.toLowerCase().replace(/s$/, '');
    const details = await fetchItemDetails(normalizedItemType, weddingItem.item_id);
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
        const categories = Array.isArray(categoriesResponse.data) ? categoriesResponse.data : categoriesResponse.data.data || [];
        setEventCategories(categories);
        setWeddings(Array.isArray(weddingsResponse.data) ? weddingsResponse.data : weddingsResponse.data.data || []);
        setGoods(Array.isArray(goodsResponse.data) ? goodsResponse.data : goodsResponse.data.data || []);

        const itemsPromises = weddingsResponse.data.data.map((wedding) =>
          api.getWeddingItems(wedding.id, token).then((res) => ({
            weddingId: wedding.id,
            items: res.data.data || [],
          }))
        );
        const itemsResults = await Promise.all(itemsPromises);
        const newWeddingCache = itemsResults.reduce((acc, { weddingId, items }) => {
          acc[weddingId] = items;
          return acc;
        }, {});
        setWeddingItemsCache(newWeddingCache);

        const servicesPromises = categories.map((category) =>
          api.getEventCategoryWithServices(category.id).then((res) => ({
            categoryId: category.id,
            services: res.data.data.services || [],
          }))
        );
        const servicesResults = await Promise.all(servicesPromises);
        const newCategoryCache = servicesResults.reduce((acc, { categoryId, services }) => {
          acc[categoryId] = services;
          return acc;
        }, {});
        setCategoryServicesCache(newCategoryCache);

        await fetchAvailableServices();
      } catch (error) {
        console.error('Error initializing:', error);
        setEventCategories([]);
        setWeddings([]);
        setGoods([]);
        setWeddingItemsCache({});
        setCategoryServicesCache({});
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
      restaurants: 'Рестораны',
      clothing: 'Одежда',
      tamada: 'Тамада',
      program: 'Программы',
      'traditional-gift': 'Традиционные подарки',
      flowers: 'Цветы',
      cakes: 'Торты',
      alcohol: 'Алкоголь',
      transport: 'Транспорт',
      goods: 'Товары',
      jewelry: 'Ювелирные изделия',
    };
    const grouped = items.reduce((acc, item) => {
      const category = item.item_type || item.serviceType;
      if (!acc[category]) {
        acc[category] = { name: categoryMap[category] || category, items: [] };
      }
      acc[category].items.push(item);
      return acc;
    }, {});
    return Object.values(grouped).sort((a, b) => a.name.localeCompare(b.name));
  };

  // Render category modal header
  const renderCategoryModalHeader = () => (
    <View>
      <Text style={styles.subtitle}>
        {selectedCategory ? 'Редактировать категорию' : 'Создать категорию'}
      </Text>
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
      {servicesError && <Text style={styles.errorText}>{servicesError}</Text>}
    </View>
  );

  // Render wishlist modal header
  const renderWishlistModalHeader = () => (
    <View>
      <Text style={styles.subtitle}>Добавить подарок</Text>
      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Добавить собственный подарок</Text>
        <TouchableOpacity
          style={[styles.switch, isCustomGift && styles.switchActive]}
          onPress={() => setIsCustomGift(!isCustomGift)}
        >
          <Text style={styles.switchText}>{isCustomGift ? 'Вкл' : 'Выкл'}</Text>
        </TouchableOpacity>
      </View>
      {isCustomGift && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Название подарка"
            placeholderTextColor={COLORS.muted}
            value={formData.item_name}
            onChangeText={(text) => setFormData({ ...formData, item_name: text })}
          />
          <Button
            title="Добавить"
            onPress={handleAddCustomGift}
            color={COLORS.primary}
          />
        </>
      )}
    </View>
  );

  // Render wishlist modal footer
  const renderWishlistModalFooter = () => (
    !isCustomGift && (
      <View style={styles.buttonRowModal}>
        <Button
          title="Добавить выбранные"
          onPress={handleAddWishlistItem}
          color={COLORS.primary}
          disabled={selectedGoodIds.length === 0}
        />
        <Button
          title="Отмена"
          onPress={() => {
            setWishlistModalVisible(false);
            setSelectedGoodIds([]);
            setIsCustomGift(false);
          }}
          color={COLORS.error}
        />
      </View>
    )
  );

  // Render event category item
  const renderEventCategoryItem = ({ item }) => {
    const filteredServices = categoryServicesCache[item.id] || [];
    const groupedServices = groupItemsByCategory(filteredServices);
    return (
      <View style={styles.itemContainer}>
        <Text style={styles.itemText}>
          {item.name} ({item.status === 'active' ? 'Активно' : 'Неактивно'})
        </Text>
        <Text style={styles.itemSubText}>
          Описание: {item.description || 'Нет описания'}
        </Text>
        {groupedServices.length > 0 ? (
          <View style={styles.weddingItemsContainer}>
            {groupedServices.map((group) => (
              <View key={group.name} style={styles.categorySection}>
                <Text style={styles.categoryTitle}>{group.name}</Text>
                {group.items.map((service) => (
                  <View
                    key={`${service.serviceType}-${service.serviceId}`}
                    style={styles.weddingItem}
                  >
                    <Text style={styles.subItemText}>
                      {service.name} {service.cost ? `- ${service.cost} тг` : ''}
                    </Text>
                    <View style={styles.itemActions}>
                      <TouchableOpacity
                        style={styles.detailsButton}
                        onPress={() => openServiceDetailsModal(service)}
                      >
                        <Text style={styles.detailsButtonText}>Подробнее</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteCategoryService(item.id, service.serviceId, service.serviceType)}
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
            <Text style={styles.noItems}>Нет услуг для этой категории</Text>
            <TouchableOpacity
              style={styles.addItemsButton}
              onPress={() => openEditCategoryModal(item)}
            >
              <Text style={styles.addItemsButtonText}>Добавить услуги</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.buttonRow}>
          {/* <TouchableOpacity
            style={styles.actionButtonPrimary}
            onPress={() => openCategoryDetailsModal(item)}
          >
            <Text style={styles.actionButtonText}>Подробнее</Text>
          </TouchableOpacity> */}
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
                          case 'restaurants':
                            return `Ресторан - ${weddingItem.total_cost || 0} тг`;
                          case 'clothing':
                            return `Одежда - ${weddingItem.total_cost || 0} тг`;
                          case 'tamada':
                            return `Тамада - ${weddingItem.total_cost || 0} тг`;
                          case 'program':
                            return `Программа - ${weddingItem.total_cost || 0} тг`;
                          case 'traditional-gift':
                            return `Традиционный подарок - ${weddingItem.total_cost || 0} тг`;
                          case 'flowers':
                            return `Цветы - ${weddingItem.total_cost || 0} тг`;
                          case 'cakes':
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
        <View style={styles.wishlistCardContent}>
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
          {!item.is_reserved && (
            <Button
              title="Зарезервировать"
              onPress={() => handleReserveWishlistItem(item.id)}
              color={COLORS.primary}
            />
          )}
        </View>
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
          return [...prev, { id: item.id, serviceType: item.serviceType, name: item.name }];
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

  // Render category details header
  const renderCategoryDetailsHeader = () => (
    <View>
      <Text style={styles.subtitle}>Детали категории</Text>
      {loadingDetails ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
      ) : categoryDetails ? (
        <>
          <Text style={styles.detail}>Название: {categoryDetails.name}</Text>
          <Text style={styles.detail}>
            Описание: {categoryDetails.description || 'Нет описания'}
          </Text>
          <Text style={styles.detail}>
            Статус: {categoryDetails.status === 'active' ? 'Активно' : 'Неактивно'}
          </Text>
          <Text style={styles.sectionTitle}>Услуги</Text>
        </>
      ) : (
        <Text style={styles.noItems}>Детали недоступны</Text>
      )}
    </View>
  );

  // Combine categories and weddings for display
  const combinedData = [
    ...eventCategories.map((cat) => ({ type: 'category', data: cat })),
    ...weddings.map((wed) => ({ type: 'wedding', data: wed })),
  ];

  // Render combined list item
  const renderItem = ({ item }) => {
    if (item.type === 'category') {
      return renderEventCategoryItem({ item: item.data });
    } else if (item.type === 'wedding') {
      return renderWeddingItem({ item: item.data });
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Мои мероприятия</Text>
      <View style={styles.buttonRow}>
        {/* <TouchableOpacity
          style={styles.createButton}
          onPress={() => {
            setCategoryModalVisible(true);
            fetchAvailableServices();
          }}
        >
          <Text style={styles.createButtonText}>Создать категорию</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setWeddingModalVisible(true)}
        >
          <Text style={styles.createButtonText}>Создать свадьбу</Text>
        </TouchableOpacity> */}
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
          initialNumToRender={10}
          windowSize={5}
        />
      )}

      {/* Category Modal */}
      <Modal visible={categoryModalVisible} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <FlatList
            data={availableServices}
            renderItem={renderServiceItem}
            keyExtractor={(item) => `${item.id}-${item.serviceType}`}
            ListHeaderComponent={renderCategoryModalHeader}
            ListEmptyComponent={<Text style={styles.noItems}>Услуги недоступны</Text>}
            contentContainerStyle={styles.serviceList}
            initialNumToRender={10}
            windowSize={5}
          />
          <View style={styles.buttonRowModal}>
            <Button
              title={selectedCategory ? 'Сохранить' : 'Создать'}
              onPress={selectedCategory ? handleUpdateEventCategory : handleCreateEventCategory}
              color={COLORS.primary}
            />
            <Button
              title="Отмена"
              onPress={() => {
                setCategoryName('');
                setCategoryDescription('');
                setCategoryStatus('active');
                setCategoryServices([]);
                setSelectedCategory(null);
                setCategoryModalVisible(false);
              }}
              color={COLORS.error}
            />
          </View>
        </SafeAreaView>
      </Modal>

      {/* Wedding Modal */}
      {/* <Modal visible={weddingModalVisible} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <Text style={styles.subtitle}>Создать свадьбу</Text>
          <TextInput
            style={styles.input}
            placeholder="Название свадьбы"
            placeholderTextColor={COLORS.muted}
            value={weddingName}
            onChangeText={setWeddingName}
          />
          <TextInput
            style={styles.input}
            placeholder="Дата свадьбы (ГГГГ-ММ-ДД)"
            placeholderTextColor={COLORS.muted}
            value={weddingDate}
            onChangeText={setWeddingDate}
            onFocus={() => setShowCalendar(true)}
          />
          {showCalendar && (
            <Calendar
              onDayPress={onDateChange}
              markedDates={{
                [weddingDate]: { selected: true, marked: true, selectedColor: COLORS.primary },
              }}
              style={styles.calendar}
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
                setWeddingName('');
                setWeddingDate('');
                setShowCalendar(false);
              }}
              color={COLORS.error}
            />
          </View>
        </SafeAreaView>
      </Modal> */}

      {/* Edit Wedding Modal */}
      <Modal visible={editWeddingModalVisible} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <Text style={styles.subtitle}>Редактировать свадьбу</Text>
          <TextInput
            style={styles.input}
            placeholder="Название свадьбы"
            placeholderTextColor={COLORS.muted}
            value={weddingName}
            onChangeText={setWeddingName}
          />
          <TextInput
            style={styles.input}
            placeholder="Дата свадьбы (ГГГГ-ММ-ДД)"
            placeholderTextColor={COLORS.muted}
            value={weddingDate}
            onChangeText={setWeddingDate}
            onFocus={() => setShowCalendar(true)}
          />
          {showCalendar && (
            <Calendar
              onDayPress={onDateChange}
              markedDates={{
                [weddingDate]: { selected: true, marked: true, selectedColor: COLORS.primary },
              }}
              style={styles.calendar}
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
                setWeddingName('');
                setWeddingDate('');
                setSelectedWedding(null);
                setShowCalendar(false);
              }}
              color={COLORS.error}
            />
          </View>
        </SafeAreaView>
      </Modal>

      {/* Wishlist Modal */}
      <Modal visible={wishlistModalVisible} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          {isCustomGift ? (
            renderWishlistModalHeader()
          ) : (
            <FlatList
              data={goods}
              renderItem={renderGoodCard}
              keyExtractor={(item) => item.id.toString()}
              ListHeaderComponent={renderWishlistModalHeader}
              ListFooterComponent={renderWishlistModalFooter}
              ListEmptyComponent={<Text style={styles.noItems}>Товары недоступны</Text>}
              contentContainerStyle={styles.listContainer}
              initialNumToRender={10}
              windowSize={5}
            />
          )}
        </SafeAreaView>
      </Modal>

      {/* Wishlist View Modal */}
      <Modal visible={wishlistViewModalVisible} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <Text style={styles.subtitle}>Список желаний</Text>
          <FlatList
            data={wishlistItems}
            renderItem={renderWishlistItem}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={<Text style={styles.noItems}>Список желаний пуст</Text>}
            contentContainerStyle={styles.listContainer}
            initialNumToRender={10}
            windowSize={5}
          />
          <Button
            title="Закрыть"
            onPress={() => setWishlistViewModalVisible(false)}
            color={COLORS.error}
          />
        </SafeAreaView>
      </Modal>

      {/* Category Details Modal */}
      <Modal visible={categoryDetailsModalVisible} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <FlatList
            data={categoryServicesCache[categoryDetails?.id] || []}
            renderItem={renderServiceInCategory}
            keyExtractor={(item) => `${item.serviceType}-${item.serviceId}`}
            ListHeaderComponent={renderCategoryDetailsHeader}
            ListEmptyComponent={<Text style={styles.noItems}>Нет услуг</Text>}
            contentContainerStyle={styles.serviceList}
            initialNumToRender={10}
            windowSize={5}
          />
          <Button
            title="Закрыть"
            onPress={() => {
              setCategoryDetailsModalVisible(false);
              setCategoryDetails(null);
            }}
            color={COLORS.error}
          />
        </SafeAreaView>
      </Modal>

      {/* Service Details Modal */}
      <Modal visible={serviceDetailsModalVisible} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <Text style={styles.subtitle}>Детали услуги</Text>
          {loadingServiceDetails ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
          ) : selectedService ? (
            <View style={{ width: '100%' }}>
              <Text style={styles.detail}>Название: {selectedService.name}</Text>
              <Text style={styles.detail}>
                Тип: {selectedService.serviceType}
              </Text>
              <Text style={styles.detail}>
                Описание: {selectedService.description || 'Нет описания'}
              </Text>
              <Text style={styles.detail}>
                Стоимость: {selectedService.cost ? `${selectedService.cost} тг` : 'Не указана'}
              </Text>
              {selectedService.address && (
                <Text style={styles.detail}>Адрес: {selectedService.address}</Text>
              )}
              {selectedService.cuisine && (
                <Text style={styles.detail}>Кухня: {selectedService.cuisine}</Text>
              )}
              <Text style={styles.detail}>
                Создано: {selectedService.created_at || 'Не указано'}
              </Text>
              <Text style={styles.detail}>
                Обновлено: {selectedService.updated_at || 'Не указано'}
              </Text>
              <Text style={styles.detail}>ID услуги: {selectedService.serviceId}</Text>
            </View>
          ) : (
            <Text style={styles.noItems}>Детали недоступны</Text>
          )}
          <Button
            title="Закрыть"
            onPress={() => {
              setServiceDetailsModalVisible(false);
              setSelectedService(null);
            }}
            color={COLORS.error}
          />
        </SafeAreaView>
      </Modal>

      {/* Item Details Modal */}
      <Modal visible={detailsModalVisible} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <Text style={styles.subtitle}>Детали элемента</Text>
          {loadingDetails ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
          ) : selectedItem ? (
            <View style={{ width: '100%' }}>
              <Text style={styles.detail}>
                Тип: {selectedItem.item_type || selectedItem.type || 'Не указано'}
              </Text>
              <Text style={styles.detail}>
                Стоимость: {selectedItem.total_cost || selectedItem.cost ? `${selectedItem.total_cost || selectedItem.cost} тг` : 'Не указана'}
              </Text>
              {selectedItem.name && (
                <Text style={styles.detail}>Название: {selectedItem.name}</Text>
              )}
              {selectedItem.description && (
                <Text style={styles.detail}>Описание: {selectedItem.description}</Text>
              )}
              {selectedItem.address && (
                <Text style={styles.detail}>Адрес: {selectedItem.address}</Text>
              )}
              {selectedItem.cuisine && (
                <Text style={styles.detail}>Кухня: {selectedItem.cuisine}</Text>
              )}
              {(selectedItem.created_at || selectedItem.createdAt) && (
                <Text style={styles.detail}>Создано: {selectedItem.created_at || selectedItem.createdAt}</Text>
              )}
              {(selectedItem.updated_at || selectedItem.updatedAt) && (
                <Text style={styles.detail}>Обновлено: {selectedItem.updated_at || selectedItem.updatedAt}</Text>
              )}
              {selectedItem.serviceId && (
                <Text style={styles.detail}>ID услуги: {selectedItem.serviceId}</Text>
              )}
              {selectedItem.wedding_id && (
                <Text style={styles.detail}>ID свадьбы: {selectedItem.wedding_id}</Text>
              )}
              {selectedItem.item_id && (
                <Text style={styles.detail}>ID элемента: {selectedItem.item_id}</Text>
              )}
              {selectedItem.status && (
                <Text style={styles.detail}>Статус: {selectedItem.status}</Text>
              )}
              {selectedItem.specs && typeof selectedItem.specs === 'object' && (
                <View style={styles.detail}>
                  <Text style={styles.detail}>Характеристики:</Text>
                  {Object.entries(selectedItem.specs).map(([key, value]) => (
                    <Text key={key} style={styles.detail}>
                      {key}: {value}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          ) : (
            <Text style={styles.noItems}>Детали недоступны</Text>
          )}
          <Button
            title="Закрыть"
            onPress={() => {
              setDetailsModalVisible(false);
              setSelectedItem(null);
            }}
            color={COLORS.error}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
