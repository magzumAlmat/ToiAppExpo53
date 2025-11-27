import React, { useState, useEffect, useCallback } from "react";
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
  ActivityIndicator,
  RefreshControl,
} from "react-native";

import * as Linking from "expo-linking";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import api from "../api/api";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import { Calendar } from "react-native-calendars";
import { Picker } from "@react-native-picker/picker";
import { ScrollView } from "react-native";
import ServiceDetailsModal from "../components/ServiceDetailsModal";
import EventCategoryItem from "../components/EventCategoryItem";
import EventItem from "../components/EventItem";
import GoodCard from "../components/GoodCard";
import WishlistItem from "../components/WishlistItem";
import ServiceCard from "../components/ServiceCard";
import CategoryModalHeader from "../components/CategoryModalHeader";
import WishlistModalHeader from "../components/WishlistModalHeader";
import WishlistModalFooter from "../components/WishlistModalFooter";
import CategoryDetailsHeader from "../components/CategoryDetailsHeader";





const COLORS = {
  primary: "#4A90E2",
  secondary: "#50C878",
  accent: "#FF6F61",
  background: "#F7F9FC",
  text: "#2D3748",
  muted: "#718096",
  white: "#FFFFFF",
  border: "#E2E8F0",
  error: "#E53E3E",
  shadow: "#0000001A",
};



const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    marginVertical: 16,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.text,
    marginVertical: 12,
    textAlign: "center",
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
    fontWeight: "600",
    color: COLORS.text,
  },
  itemSubText: {
    fontSize: 14,
    color: COLORS.muted,
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    flexWrap: "wrap",
  },
  buttonRowModal: {
    flexDirection: "row",
    justifyContent: "space-around",
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
    fontWeight: "600",
    textAlign: "center",
  },
  actionButtonPrimary: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  actionButtonSecondary: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  actionButtonAccent: {
    backgroundColor: COLORS.accent,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  actionButtonError: {
    backgroundColor: COLORS.error,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
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
    textAlignVertical: "top",
  },
  pickerContainer: {
    marginVertical: 8,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: "600",
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
    fontWeight: "600",
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
    fontWeight: "600",
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
    position: "absolute",
    top: 8,
    right: 8,
    fontSize: 20,
    color: COLORS.primary,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  noItems: {
    fontSize: 16,
    color: COLORS.muted,
    textAlign: "center",
  },
  loader: {
    marginVertical: 16,
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
    fontWeight: "600",
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
    textDecorationLine: "underline",
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
    fontWeight: "600",
    color: COLORS.text,
  },
  strikethroughText: {
    textDecorationLine: "line-through",
  },
  wishlistStatus: {
    fontSize: 14,
    color: COLORS.muted,
    marginVertical: 4,
  },
  weddingItemsContainer: {
    marginTop: 8,
  },
  categorySection: {
    marginVertical: 8,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  weddingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  subItemText: {
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
  },
  itemActions: {
    flexDirection: "row",
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
    alignItems: "center",
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
    fontWeight: "600",
  },
  detail: {
    fontSize: 14,
    color: COLORS.text,
    marginVertical: 4,
  },

});



export default function Item3Screen() {

  const [files, setFiles] = useState([]);

  const [selectedImage, setSelectedImage] = useState(null);
  const [activeSlide, setActiveSlide] = useState(0);


  const route = useRoute();
  const navigation = useNavigation();

  const [selectedItems, setSelectedItems] = useState([]);

  const userId = useSelector((state) => state.auth.user?.id);
  const token = useSelector((state) => state.auth.token);
  const [eventCategories, setEventCategories] = useState([]);
  const [events, setEvents] = useState([]);
  const [eventItemsCache, setEventItemsCache] = useState({});
  const [categoryServicesCache, setCategoryServicesCache] = useState({});
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true); // Declared loadingEvents
  const [refreshing, setRefreshing] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [addItemModalVisible, setAddItemModalVisible] = useState(false);
  const [eventCreationModalVisible, setEventCreationModalVisible] = useState(false);
  const [eventEditModalVisible, setEventEditModalVisible] = useState(false);
  const [wishlistModalVisible, setWishlistModalVisible] = useState(false);
  const [wishlistViewModalVisible, setWishlistViewModalVisible] = useState(false);
  const [categoryDetailsModalVisible, setCategoryDetailsModalVisible] = useState(false);
  const [serviceDetailsModalVisible, setServiceDetailsModalVisible] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [categoryStatus, setCategoryStatus] = useState("active");
  const [activeEventName, setActiveEventName] = useState("");
  const [activeEventDate, setActiveEventDate] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [activeEvent, setActiveEvent] = useState(null);
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
  const [formData, setFormData] = useState({ category: "", item_name: "" });
  const [isCustomGift, setIsCustomGift] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [loadingServiceDetails, setLoadingServiceDetails] = useState(false);
  const [activeEventId, setActiveEventId] = useState(null);
  const [hasShownNoEventsAlert, setHasShownNoEventsAlert] = useState(false);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [budget, setBudget] = useState('0'); // Declared budget
  const BASE_URL = process.env.EXPO_PUBLIC_API_baseURL;
  const dispatch = useDispatch(); // Initialized dispatch

  const categoryMap = {
    restaurant: "Рестораны",
    clothing: "Одежда",
    tamada: "Тамада",
    program: "Программы",
    traditionalgift: "Традиционные подарки",
    flowers: "Цветы",
    cake: "Торты",
    cakes: "Торты",
    alcohol: "Алкоголь",
    transport: "Транспорт",
    good: "Товары",
    jewelry: "Ювелирные изделия",
  };

  const categoryMapRuToEn = {
    Ведущий: "tamada",
    "Традиционные подарки": "traditionalgift",
    Алкоголь: "alcohol",
    Торты: "cakes",
    "Прокат авто": "transport",
    Ресторан: "restaurant",
    "Шоу программа": "program",
    "Ювелирные изделия": "jewelry",
   Цветы: "flowers",
  };

  useEffect(() => {
    if (route.params?.selectedCategories) {
      console.log("Полученные категории:", route.params.selectedCategories);
      setSelectedItems(route.params.selectedCategories);
      navigation.setParams({ selectedCategories: undefined });
    }
  }, [route.params?.selectedCategories]);

  const fetchEventCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await api.getEventCategories();
      const categories = Array.isArray(response.data)
        ? response.data
        : response.data.data || [];
      console.log('Raw Event Categories API response:', JSON.stringify(response.data, null, 2));

      const servicesPromises = categories.map(async (category) => {
        const apiServices = await api.getEventCategoryWithServices(category.id, { page: 1, limit: 100 }).then((res) => {
          console.log(`Raw services response for category ${category.id}:`, JSON.stringify(res.data, null, 2));
          return res.data.data.services || [];
        });
        const eventServices = category.EventServices || [];

        const allServices = await Promise.all(
          eventServices.map(async (es) => {
            const existingService = apiServices.find(
              (as) => as.serviceId === es.serviceId && as.serviceType === es.serviceType
            );
            if (existingService) {
              return existingService;
            }
            const details = await fetchServiceDetails(es.serviceId, es.serviceType);
            return details ? { ...details, id: es.serviceId, serviceId: es.serviceId, serviceType: es.serviceType } : {
              id: es.serviceId,
              name: `Service ${es.serviceId}`,
              serviceType: es.serviceType,
              serviceId: es.serviceId,
              cost: details?.cost || 0,
            };
          })
        );

        return {
          categoryId: category.id,
          services: allServices.filter((s) => s !== null),
        };
      });

      const servicesResults = await Promise.all(servicesPromises);
      const newCache = servicesResults.reduce((acc, { categoryId, services }) => {
        acc[categoryId] = services;
        console.log(`Services for category ${categoryId}:`, JSON.stringify(services, null, 2));
        return acc;
      }, {});
      setCategoryServicesCache(newCache);
      setEventCategories(categories);
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

  const fetchAvailableServices = async () => {
    try {
      const response = await api.getServices();
      const services = response.data.data || response.data || [];
      setAvailableServices(services);
      setServicesError(null);

      if (selectedItems.length > 0) {
        const newCategoryCache = { ...categoryServicesCache };
        for (const categoryName of selectedItems) {
          const serviceType = categoryMapRuToEn[categoryName];
          if (serviceType) {
            const matchingServices = services.filter(
              (service) => service.serviceType.toLowerCase().replace(/s$/, '') === serviceType
            );
            const category = eventCategories.find((cat) => cat.name === categoryName);
            if (category) {
              newCategoryCache[category.id] = matchingServices.map((service) => ({
                id: service.id,
                name: service.name,
                serviceType: service.serviceType,
                serviceId: service.id,
                cost: service.cost || null,
              }));
            }
          }
        }
        setCategoryServicesCache(newCategoryCache);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      setAvailableServices([]);
      setServicesError('Не удалось загрузить услуги.');
      return [];
    }
  };

  const fetchEvents = async () => {
    setLoadingEvents(true);
    try {
      const response = await api.getWedding(token);
      const weddingData = Array.isArray(response.data)
        ? response.data
        : response.data.data || [];
      setEvents(eventsData);
      const itemsPromises = eventsData.map((event) =>
        api.getEventItems(event.id, token).then((res) => ({
          eventId: event.id,
          items: res.data.data || [],
        }))
      );
      const itemsResults = await Promise.all(itemsPromises);
      const newCache = itemsResults.reduce((acc, { eventId, items }) => {
        acc[eventId] = items;
        return acc;
      }, {});
      setEventItemsCache(newCache);
      return eventsData;
    } catch (error) {
      console.error("Error fetching events:", error);
      Alert.alert("Ошибка", "Не удалось загрузить события");
      setEvents([]);
      setEventItemsCache({});
      return [];
    } finally {
      setLoadingEvents(false);
    }
  };

  const fetchGoods = async () => {
  try {
    const response = await api.getGoods(token);
    setGoods(response.data.data || response.data || []);
  } catch (error) {
    console.error("Error fetching goods:", error);
    Alert.alert("Ошибка", "Не удалось загрузить товары. Проверьте соединение и попробуйте снова.");
  }
};

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
    console.error("Error fetching category details:", error);
    Alert.alert("Ошибка", "Не удалось загрузить детали категории");
    setCategoryDetails(null);
    return null;
  } finally {
    setLoadingDetails(false);
  }
};

const fetchServiceDetails = async (serviceId, serviceType) => {
  setLoadingServiceDetails(true);
  setLoadingFiles(true);
  try {
    let normalizedServiceType = serviceType.toLowerCase();
    if (normalizedServiceType === 'flower') {
      normalizedServiceType = 'flowers';
    } else {
      normalizedServiceType = normalizedServiceType.replace(/s$/, '');
    }
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
    let data = response.data.data || response.data;

    if (normalizedServiceType === 'restaurant' && Array.isArray(data)) {
      data = data.length > 0 ? data[0] : { name: 'Ресторан не найден', cost: null };
    }

    try {
      const filesResponse = await axios.get(
        `${BASE_URL}/api/${normalizedServiceType}/${serviceId}/files`
      );
      console.log('FILE response=', filesResponse);
      setFiles(filesResponse.data || []);
      setErrorFiles(null);
    } catch (fileError) {
      console.error(`Error fetching files for ${normalizedServiceType}/${serviceId}:`, fileError);
      setErrorFiles('Ошибка загрузки медиафайлов: ' + fileError.message);
      setFiles([]);
    }

    console.log(`Service Details for ${normalizedServiceType}/${serviceId}:`, JSON.stringify(data, null, 2));
    return {
      serviceId,
      serviceType: normalizedServiceType,
      ...data,
    };
  } catch (error) {
    console.error(`Error fetching service details for ${serviceType}/${serviceId}:`, error);
    Alert.alert('Ошибка', `Не удалось загрузить детали услуги: ${error.message}`);
    return {
      serviceId,
      serviceType: normalizedServiceType || serviceType.toLowerCase().replace(/s$/, ''),
      name: 'Неизвестная услуга',
      cost: null,
    };
  } finally {
    setLoadingServiceDetails(false);
    setLoadingFiles(false);
  }
};

  const fetchItemDetails = async (itemType, itemId) => {
    setLoadingDetails(true);
    try {
      const normalizedItemType = itemType.toLowerCase().replace(/s$/, "");
      const methodMap = {
        restaurant: "getRestaurantById",
        clothing: "getClothingById",
        tamada: "getTamadaById",
        program: "getProgramById",
        traditionalgift: "getTraditionalGiftById",
        flower: "getFlowersById",
        cake: "getCakeById",
        alcohol: "getAlcoholById",
        transport: "getTransportById",
        goods: "getGoodById",
        jewelry: "getJewelryById",
      };
      const methodName = methodMap[normalizedItemType];
      if (!methodName || !api[methodName]) {
        throw new Error(`Неизвестный тип элемента: ${normalizedItemType}`);
      }
      const response = await api[methodName](itemId);
      console.log("Full response from server for event details:", JSON.stringify(response, null, 2));
      const details = response.data.data || response.data;
      console.log('DETAILS= ',details)
      return details || null;
    } catch (error) {
      console.error(`Error fetching details for ${itemType}:`, error);
      Alert.alert("Ошибка", "Не удалось загрузить детали элемента");
      return null;
    } finally {
      setLoadingDetails(false);
    }
  };

  const fetchFiles = async (goodId) => {
    setLoadingFiles(true);
    setErrorFiles(null);
    try {
      const response = await axios.get(`${BASE_URL}/api/goods/${goodId}/files`);
      return response.data;
    } catch (error) {
      console.error("Error fetching files:", error);
      setErrorFiles("Ошибка загрузки файлов: " + error.message);
      return [];
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleCreateEventCategory = async () => {
    if (!categoryName.trim()) {
      Alert.alert("Ошибка", "Введите название категории");
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
          service_ids: categoryServices.map((s) => ({
            serviceId: s.id,
            serviceType: s.serviceType,
          })),
        });
        setCategoryServicesCache((prev) => ({
          ...prev,
          [newCategory.id]: categoryServices,
        }));
      }
      Alert.alert("Успех", "Категория мероприятия создана");
      setCategoryName("");
      setCategoryDescription("");
      setCategoryStatus("active");
      setCategoryServices([]);
      setCategoryModalVisible(false);
    } catch (error) {
      console.error("Error creating event category:", error);
      Alert.alert("Ошибка", `Не удалось создать категорию: ${error.message}`);
    }
  };

  const handleUpdateEventCategory = async () => {
    if (!selectedCategory || !categoryName.trim()) {
      Alert.alert("Ошибка", "Выберите категорию и введите название");
      return;
    }
    try {
      const response = await api.updateEventCategory(selectedCategory.id, {
        name: categoryName,
        description: categoryDescription,
        status: categoryStatus,
      });
      setEventCategories((prev) =>
        prev.map((cat) =>
          cat.id === selectedCategory.id
            ? response.data.data || response.data
            : cat
        )
      );
      await api.updateServicesForCategory(selectedCategory.id, {
        service_ids: categoryServices.map((s) => ({
          serviceId: s.id,
          serviceType: s.serviceType,
        })),
      });
      setCategoryServicesCache((prev) => ({
        ...prev,
        [selectedCategory.id]: categoryServices,
      }));
      Alert.alert("Успех", "Категория мероприятия обновлена");
      setCategoryName("");
      setCategoryDescription("");
      setCategoryStatus("active");
      setCategoryServices([]);
      setSelectedCategory(null);
      setCategoryModalVisible(false);
    } catch (error) {
      console.error("Error updating event category:", error);
      Alert.alert("Ошибка", `Не удалось обновить категорию: ${error.message}`);
    }
  };

  const handleDeleteEventCategory = (id) => {
    Alert.alert(
      "Подтверждение",
      "Вы уверены, что хотите удалить эту категорию?",
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Удалить",
          onPress: async () => {
            try {
              await api.deleteEventCategory(id);
              setEventCategories((prev) => prev.filter((cat) => cat.id !== id));
              setCategoryServicesCache((prev) => {
                const newCache = { ...prev };
                delete newCache[id];
                return newCache;
              });
              Alert.alert("Успех", "Категория мероприятия удалена");
            } catch (error) {
              console.error("Error deleting event category:", error);
              Alert.alert(
                "Ошибка",
                `Не удалось удалить категорию: ${error.message}`
              );
            }
          },
        },
      ]
    );
  };

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
              console.log('Deleting service with:', { categoryId, serviceId, serviceType });

              if (!categoryId || !serviceId || !serviceType) {
                Alert.alert('Ошибка', 'Некорректные данные для удаления услуги');
                return;
              }

              const serviceExists = categoryServicesCache[categoryId]?.some(
                (s) => s.serviceId === serviceId && s.serviceType === serviceType
              );
              if (!serviceExists) {
                Alert.alert('Ошибка', 'Услуга не найдена в этой категории');
                return;
              }

              const normalizedServiceType = serviceType.toLowerCase().replace(/s$/, '');
              console.log('Normalized serviceType:', normalizedServiceType);

              const response = await api.getEventCategoryWithServices(categoryId);
              const services = response.data.data.services || [];
              setCategoryServicesCache((prev) => ({
                ...prev,
                [categoryId]: services,
              }));

              console.log('Calling API with:', { categoryId, serviceId, serviceType: normalizedServiceType });
              await api.removeServiceFromCategory(categoryId, {
                serviceId,
                serviceType: normalizedServiceType,
              });

              setCategoryServicesCache((prev) => ({
                ...prev,
                [categoryId]: prev[categoryId].filter(
                  (s) => !(s.serviceId === serviceId && s.serviceType === serviceType)
                ),
              }));

              Alert.alert('Успех', 'Услуга удалена из категории');
            } catch (error) {
              console.error('Error deleting category service:', error);
              console.error('Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
              });
              Alert.alert(
                'Ошибка',
                `Не удалось удалить услугу: ${error.response?.data?.error || error.message}`
              );
            }
          },
        },
      ]
    );
  };

  const handleCreateEvent = async () => {
    if (!activeEventName || !activeEventDate) {
      Alert.alert("Ошибка", "Введите название и дату события");
      return;
    }
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(activeEventDate)) {
      Alert.alert("Ошибка", "Дата должна быть в формате ГГГГ-ММ-ДД");
      return;
    }
    try {
      let categories = [...eventCategories];
      for (const categoryName of selectedItems) {
        const existingCategory = categories.find((cat) => cat.name === categoryName);
        if (!existingCategory) {
          const response = await api.createEventCategory({
            name: categoryName,
            description: `Категория ${categoryName}`,
            status: 'active',
          });
          const newCategory = response.data.data || response.data;
          categories.push(newCategory);
          console.log(`Created category for ${categoryName}:`, newCategory);

          const serviceType = categoryMapRuToEn[categoryName];
          if (serviceType) {
            const servicesResponse = await api.getServices();
            const services = servicesResponse.data.data || servicesResponse.data || [];
            const matchingServices = services.filter(
              (service) => service.serviceType.toLowerCase().replace(/s$/, '') === serviceType
            );
            if (matchingServices.length > 0) {
              await api.addServicesToCategory(newCategory.id, {
                service_ids: matchingServices.map((s) => ({
                  serviceId: s.id,
                  serviceType: s.serviceType,
                })),
              });
              setCategoryServicesCache((prev) => ({
                ...prev,
                [newCategory.id]: matchingServices.map((service) => ({
                  id: service.id,
                  name: service.name,
                  serviceType: service.serviceType,
                  serviceId: service.id,
                  cost: service.cost || null,
                })),
              }));
            }
          }
        }
      }
      setEventCategories(categories);

      const items = selectedItems.map((item) => {
        const serviceType = categoryMapRuToEn[item] || item.toLowerCase().replace(/s$/, '');
        const category = categories.find((cat) => cat.name === item);
        return {
          id: null,
          type: serviceType,
          totalCost: 0,
          categoryId: category?.id,
        };
      });
      const eventData = {
        name: activeEventName,
        date: activeEventDate,
        items,
      };
      const response = await api.createEvent(eventData, token); // Assuming api.createEvent now exists and generalizes createWedding
      const newEvent = response.data.data;

      if (newEvent && newEvent.id) {
        const totalBudget = parseFloat(budget); // Use the budget from state
        const spentAmount = newEvent.total_cost || 0; // This is the total cost of items
        const remaining = totalBudget - spentAmount;

        await api.updateEventTotalCost(newEvent.id, { total_cost: totalBudget }); // Assuming api.updateEventTotalCost now exists and generalizes createWedding
        await api.updateEventPaidAmount(newEvent.id, { paid_amount: spentAmount }); // Assuming api.updateEventPaidAmount now exists and generalizes createWedding
        await api.updateEventRemainingBalance(newEvent.id, { remaining_balance: remaining }); // Assuming api.updateEventRemainingBalance now exists and generalizes createWedding

        const updatedEvent = {
            ...newEvent,
            paid_amount: spentAmount.toString(),
            remaining_balance: remaining.toString()
        };
        setEvents((prev) => [...prev, updatedEvent]);
        dispatch(setEventCosts({ totalCost: totalBudget, paidAmount: spentAmount, remainingBalance: remaining }));
      } else {
        setEvents((prev) => [...prev, newEvent]);
      }

      const itemsResponse = await api.getEventItems(newEvent.id, token); // Assuming api.getEventItems now exists and generalizes createWedding
      setEventItemsCache((prev) => ({
        ...prev,
        [newEvent.id]: itemsResponse.data.data || [],
      }));
      Alert.alert("Успех", "Событие создано");
      setEventCreationModalVisible(false);
      setActiveEventName("");
      setActiveEventDate("");
      setHasShownNoEventsAlert(false);
      setActiveEventId(newEvent.id);
    } catch (error) {
      console.error("Error creating wedding:", error);
      Alert.alert(
        "Ошибка",
        error.response?.data?.error || "Не удалось создать свадьбу"
      );
    }
  };

  const handleUpdateEvent = async () => {
    if (!activeEvent || !activeEventName || !activeEventDate) {
      Alert.alert("Ошибка", "Введите название и дату события");
      return;
    }
    try {
      const data = { name: activeEventName, date: activeEventDate };
      const response = await api.updateEvent(activeEvent.id, token, data); // Assuming api.updateEvent now exists and generalizes updateWedding
      setEvents((prev) =>
        prev.map((e) => (e.id === activeEvent.id ? response.data.data : e))
      );
      const itemsResponse = await api.getEventItems( // Assuming api.getEventItems now exists and generalizes getWeddingItems
        activeEvent.id,
        token
      );
      setEventItemsCache((prev) => ({
        ...prev,
        [activeEvent.id]: itemsResponse.data.data || [],
      }));
      Alert.alert("Успех", "Событие обновлено");
      setEventEditModalVisible(false);
      setActiveEventName("");
      setActiveEventDate("");
      setActiveEvent(null);
    } catch (error) {
      console.error("Error updating event:", error);
      Alert.alert(
        "Ошибка",
        error.response?.data?.error || "Не удалось обновить событие"
      );
    }
  };

  const handleDeleteEvent = (id) => {
    Alert.alert(
      "Подтверждение",
      "Вы уверены, что хотите удалить это событие?",
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Удалить",
          onPress: async () => {
            try {
              await api.deleteEvent(id, token);
              setEvents((prev) => prev.filter((e) => e.id !== id));
              setEventItemsCache((prev) => {
                const newCache = { ...prev };
                delete newCache[id];
                return newCache;
              });
              Alert.alert("Успех", "Событие удалено");
              if (activeEventId === id) {
                const newEventId =
                  events.find((e) => e.id !== id)?.id || null;
                setActiveEventId(newEventId);
              }
            } catch (error) {
              console.error("Error deleting event:", error);
              Alert.alert("Ошибка", "Не удалось удалить событие");
            }
          },
        },
      ]
    );
  };

  const handleDeleteEventItem = async (eventItemId) => {
    Alert.alert(
      "Подтверждение",
      "Вы уверены, что хотите удалить этот элемент?",
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Удалить",
          onPress: async () => {
            try {
              const eventItem = Object.values(eventItemsCache)
                .flat()
                .find((item) => item.id === eventItemId);
              const eventId = eventItem?.event_id; // Assuming event_id now
              await api.deleteEventItem(eventItemId, token); // Assuming api.deleteEventItem exists
              const itemsResponse = await api.getEventItems(eventId, token); // Assuming api.getEventItems exists
              setEventItemsCache((prev) => ({
                ...prev,
                [eventId]: itemsResponse.data.data || [],
              }));

              Alert.alert("Успех", "Элемент удален");
            } catch (error) {
              console.error("Error deleting event item:", error);
              Alert.alert(
                "Ошибка",
                "Не удалось удалить элемент: " + error.message
              );
            }
          },
        },
      ]
    );
  };

  const handleAddWishlistItem = async () => {
    if (selectedGoodIds.length === 0) {
      Alert.alert("Ошибка", "Выберите хотя бы один подарок");
      return;
    }
    try {
      const promises = selectedGoodIds.map((goodId) =>
        api.createWish(
          { event_id: activeEvent.id, good_id: goodId },
          token
        )
      );
      await Promise.all(promises);
      Alert.alert("Успех", "Подарки добавлены");
      setWishlistModalVisible(false);
      setSelectedGoodIds([]);
      const itemsResponse = await api.getEventItems( // assuming api.getEventItems
        activeEvent.id,
        token
      );
      setEventItemsCache((prev) => ({
        ...prev,
        [activeEvent.id]: itemsResponse.data.data || [],
      }));
    } catch (error) {
      console.error("Error adding wishlist items:", error);
      Alert.alert(
        "Ошибка",
        error.response?.data?.error || "Не удалось добавить подарки"
      );
    }
  };

  const handleAddCustomGift = async () => {
    if (!formData.item_name) {
      Alert.alert("Ошибка", "Введите название подарка");
      return;
    }
    try {
      const giftData = {
        category: "Miscellaneous",
        item_name: formData.item_name,
        cost: "0",
        supplier_id: userId,
      };
      const response = await api.postGoodsData(giftData);
      const newGood = response.data.data;
      await api.createWish(
        { event_id: activeEvent.id, good_id: newGood.id },
        token
      );
      Alert.alert("Успех", "Собственный подарок добавлен");
      setFormData({ ...formData, item_name: "" });
      setWishlistModalVisible(false);
      await fetchWishlistItems(activeEvent.id);
    } catch (error) {
      console.error("Error adding custom gift:", error);
      Alert.alert("Ошибка", "Не удалось добавить подарок");
    }
  };

  const fetchWishlistItems = async (eventId) => {
    try {
      const response = await api.getWishlistByEventId(eventId, token);
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
      console.error("Error fetching wishlist items:", error);
      Alert.alert("Ошибка", "Не удалось загрузить список желаний");
    }
  };

  const handleReserveWishlistItem = async (wishlistId) => {
    Alert.alert("Подтверждение", "Вы хотите зарезервировать этот подарок?", [
      { text: "Отмена", style: "cancel" },
      {
        text: "Зарезервировать",
        onPress: async () => {
          try {
            const response = await api.reserveWishlistItem(wishlistId, token);
            Alert.alert("Успех", "Подарок зарезервирован");
            setWishlistItems((prev) =>
              prev.map((item) =>
                item.id === wishlistId ? response.data.data : item
              )
            );
          } catch (error) {
            console.error("Error reserving wishlist item:", error);
            Alert.alert(
              "Ошибка",
              error.response?.data?.error ||
                "Не удалось зарезервировать подарок"
            );
          }
        },
      },
    ]);
  };

  const handleShareEventLink = async (eventId) => {
    try {
      const webLink = `${BASE_URL}/api/eventwishes/${eventId}`; // assuming eventwishes endpoint
      await Share.share({
        message: webLink,
        title: "Приглашение на событие", // Generalized title
      });
    } catch (error) {
      console.error("Error sharing event link:", error);
      Alert.alert("Ошибка", "Не удалось поделиться ссылкой");
    }
  };

  const openEditCategoryModal = async (category) => {
    setSelectedCategory(category);
    setCategoryName(category.name);
    setCategoryDescription(category.description || "");
    setCategoryStatus(category.status || "active");
    const details = await fetchEventCategoryDetails(category.id);
    setCategoryServices(
      details?.services?.map((s) => ({
        id: s.serviceId,
        serviceType: s.serviceType,
        name: s.name,
      })) || []
    );
    setCategoryModalVisible(true);
  };

  const openCategoryDetailsModal = async (category) => {
    setSelectedCategory(category);
    await fetchEventCategoryDetails(category.id);
    setCategoryDetailsModalVisible(true);
  };

const openServiceDetailsModal = async (service) => {
  if (!service.serviceId || !service.serviceType) {
    Alert.alert("Ошибка", "Некорректные данные услуги");
    return;
  }
  setServiceDetailsModalVisible(true);
  setLoadingServiceDetails(true);
  const normalizedServiceType = service.serviceType.toLowerCase().replace(/s$/, "");
  console.log(`Opening details for service: ${service.serviceId}, type: ${normalizedServiceType}`);
  const details = await fetchServiceDetails(service.serviceId, normalizedServiceType);
  console.log('Fetched and parsed service details:', JSON.stringify(details, null, 2));
  setSelectedService({
    ...details,
    originalServiceType: normalizedServiceType,
  } || {
    serviceId: service.serviceId,
    serviceType: normalizedServiceType,
    name: service.name || "Неизвестная услуга",
    cost: service.cost || null,
    originalServiceType: normalizedServiceType,
  });
  setLoadingServiceDetails(false);
};


  const openEditEventModal = (event) => {
    setActiveEvent(event);
    setActiveEventName(event.name);
    setActiveEventDate(event.date);
    // setEventEditModalVisible(true);
  };

const openDetailsModal = async (item) => {
  setAddItemModalVisible(false);
  setCategoryModalVisible(false);
  setLoadingDetails(true);
  setLoadingFiles(true);
  try {
    const details = await fetchItemDetails(item.item_type, item.item_id);
    setSelectedItem(details ? { ...item, ...details } : item);

    const filesResponse = await axios.get(
      `${BASE_URL}/api/${item.item_type}/${item.item_id}/files`
    );
    setFiles(filesResponse.data || []);
    setErrorFiles(null);
  } catch (error) {
    console.error("Error in openDetailsModal:", error);
    setErrorFiles('Ошибка загрузки данных: ' + error.message);
    setFiles([]);
  } finally {
    setLoadingDetails(false);
    setLoadingFiles(false);
    setServiceDetailsModalVisible(true); // Changed from setDetailsModalVisible(true)
  }
};

const handleDetailsPress = () => {
  console.log("Navigation object:", navigation);
  console.log("Selected item:", selectedItem);
  if (selectedItem) {
    setTimeout(() => {
      navigation.navigate("Details", { item: selectedItem });
      setSelectedItem(null);
    }, 100);
  } else {
    console.warn("No selected item for navigation");
    alert("Ошибка: Не выбран элемент для просмотра деталей.");
  }
};

  const onDateChange = (day) => {
    setActiveEventDate(day.dateString);
    setShowCalendar(false);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchEventCategories(),
      fetchAvailableServices(),
      fetchEvents(),
      fetchGoods(),
    ]);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    const initialize = async () => {
      setLoadingCategories(true);
      setLoadingEvents(true);
      try {
        const [categoriesResponse, eventsResponse, goodsResponse] = await Promise.all([
          api.getEventCategories(),
          api.getEvents(token),
          api.getGoods(token),
        ]);
        let categories = Array.isArray(categoriesResponse.data)
          ? categoriesResponse.data
          : categoriesResponse.data.data || [];

        if (route.params?.selectedCategories) {

          setSelectedItems(route.params.selectedCategories);

          const existingCategoryNames = categories.map((cat) => cat.name);
          const newCategories = route.params.selectedCategories.filter(
            (cat) => !existingCategoryNames.includes(cat)
          );

          for (const categoryName of newCategories) {
            try {
              console.log(`Создание категории: ${categoryName}`);
              const response = await api.createEventCategory({
                name: categoryName,
                description: `Категория ${categoryName}`,
                status: 'active',
              });
              const newCategory = response.data.data || response.data;
              console.log(`Создана категория: ${JSON.stringify(newCategory, null, 2)}`);
              categories.push(newCategory);

              const serviceType = categoryMapRuToEn[categoryName];
              if (serviceType) {
                console.log(`Получение сервисов для serviceType: ${serviceType}`);
                const servicesResponse = await api.getServices();
                const services = servicesResponse.data.data || servicesResponse.data || [];
                console.log(`Доступные сервисы: ${JSON.stringify(services, null, 2)}`);
                const matchingServices = services.filter(
                  (service) => service.serviceType.toLowerCase().replace(/s$/, '') === serviceType
                );
                console.log(`Соответствующие сервисы для ${serviceType}: ${JSON.stringify(matchingServices, null, 2)}`);
                if (matchingServices.length > 0) {
                  await api.addServicesToCategory(newCategory.id, {
                    service_ids: matchingServices.map((s) => ({
                      serviceId: s.id,
                      serviceType: s.serviceType,
                    })),
                  });
                  setCategoryServicesCache((prev) => ({
                    ...prev,
                    [newCategory.id]: matchingServices.map((service) => ({
                      id: service.id,
                      name: service.name,
                      serviceType: service.serviceType,
                      serviceId: service.id,
                      cost: service.cost || null,
                    })),
                  }));
                } else {
                  console.warn(`Сервисы для serviceType ${serviceType} не найдены`);
                  setCategoryServicesCache((prev) => ({
                    ...prev,
                    [newCategory.id]: [],
                  }));
                }
              } else {
                console.warn(`serviceType для категории ${categoryName} не найден`);
              }
            } catch (error) {
              console.error(`Ошибка при создании категории ${categoryName}:`, error);
            }
          }
          setEventCategories(categories);
          navigation.setParams({ selectedCategories: undefined });
        } else {
          setEventCategories(categories);
        }

        const eventsData = Array.isArray(eventsResponse.data)
          ? eventsResponse.data
          : eventsResponse.data.data || [];
        setEvents(eventsData);
        setGoods(Array.isArray(goodsResponse.data)
          ? goodsResponse.data
          : goodsResponse.data.data || []);

        if (eventsData.length > 0) {
          const itemsPromises = eventsData.map((event) =>
            api.getEventItems(event.id, token).then((res) => ({
              eventId: event.id,
              items: res.data.data || [],
            }))
          );
          const itemsResults = await Promise.all(itemsPromises);
          const newEventCache = itemsResults.reduce(
            (acc, { eventId, items }) => {
              acc[eventId] = items;
              return acc;
            },
            {}
          );
          setEventItemsCache(newEventCache);
        }

        await fetchAvailableServices();
      } catch (error) {
        console.error('Ошибка инициализации:', error);
        setEventCategories([]);
        setEvents([]);
        setGoods([]);
        setEventItemsCache({});
        setCategoryServicesCache({});
      } finally {
        setLoadingCategories(false);
        setLoadingEvents(false);
      }
    };
    initialize();
  }, [token, route.params?.selectedCategories, budget]);

  useEffect(() => {
    if (!loadingEvents && events.length === 0 && !hasShownNoEventsAlert) {
      // setEventCreationModalVisible(true);
      setHasShownNoEventsAlert(true);
    }
  }, [loadingEvents, events, hasShownNoEventsAlert]);

  useEffect(() => {
    const handleDeepLink = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        const { path, queryParams } = Linking.parse(initialUrl);
      }
      const subscription = Linking.addEventListener("url", ({ url }) => {
        const { path, queryParams } = Linking.parse(url);
      });
      return () => subscription.remove();
    };
    handleDeepLink();
  }, []);

  const openPhotoModal = (images, index) => {
    setSelectedImages(images);
    setSelectedImageIndex(index);
    setPhotoModalVisible(true);
  };

  const groupItemsByCategory = (items) => {
    const categoryMap = {
      restaurant: "Рестораны",
      clothing: "Одежда",
      tamada: "Тамада",
      program: "Программы",
      "traditionalgift": "Традиционные подарки",
      flower: "Цветы",
      cake: "Торты",
      alcohol: "Алкоголь",
      transport: "Транспорт",
      good: "Товары",
      jewelry: "Ювелирные изделия",
    };
    const grouped = items.reduce((acc, item) => {
      const actualItem = item.dataValues || item; // Handle Sequelize model instances
      let category =
        actualItem.item_type || actualItem.serviceType || actualItem.type || "";
      const normalizedCategory = category.toLowerCase().replace(/s$/, "");
      if (!acc[normalizedCategory]) {
        acc[normalizedCategory] = {
          name: categoryMap[normalizedCategory] || category,
          items: [],
        };
      }
      acc[normalizedCategory].items.push(item);
      return acc;
    }, {});
    return Object.values(grouped).sort((a, b) => a.name.localeCompare(b.name));
  };






















  const combinedData = [
    ...eventCategories.map((cat) => ({ type: "category", data: cat })),
    ...events.map((event) => ({ type: "event", data: event })), // Change type to "event"
  ];

  const renderItem = ({ item }) => {
    if (item.type === "category") {
      return (
        <EventCategoryItem
          item={item.data}
          categoryServicesCache={categoryServicesCache}
          groupItemsByCategory={groupItemsByCategory}
          openServiceDetailsModal={openServiceDetailsModal}
          openEditCategoryModal={openEditCategoryModal}
          setActiveEvent={setActiveEvent}
          setWishlistModalVisible={setWishlistModalVisible}
          fetchWishlistItems={fetchWishlistItems}
          handleDeleteEventCategory={handleDeleteEventCategory}
          handleShareEventLink={handleShareEventLink}
          styles={styles}
          COLORS={COLORS}
        />
      );
    } else if (item.type === "event") { // Change type to "event"
      return (
        <EventItem
          item={item.data}
          eventItemsCache={eventItemsCache}
          groupItemsByCategory={groupItemsByCategory}
          openDetailsModal={openDetailsModal}
          handleDeleteEventItem={handleDeleteEventItem}
          navigation={navigation}
          setActiveEvent={setActiveEvent}
          setWishlistModalVisible={setWishlistModalVisible}
          fetchWishlistItems={fetchWishlistItems}
          handleDeleteEvent={handleDeleteEvent}
          handleShareEventLink={handleShareEventLink}
          styles={styles}
          COLORS={COLORS}
        />
      );
    }
    return null;
  };



return (
  <SafeAreaView style={styles.container}>
    <Text style={styles.title}>Мои мероприятия</Text>
    <View style={styles.buttonRow}></View>
    {loadingCategories || loadingEvents ? (
      <ActivityIndicator
        size="large"
        color={COLORS.primary}
        style={styles.loader}
      />
    ) : (
      <FlatList
        data={combinedData}
        renderItem={renderItem}
        keyExtractor={(item) => `${item.type}-${item.data.id}`}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.noItems}>Нет мероприятий или событий</Text>
          </View>
        }
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
        initialNumToRender={10}
        windowSize={5}
      />
    )}

    <ServiceDetailsModal
      serviceDetailsModalVisible={serviceDetailsModalVisible}
      setServiceDetailsModalVisible={setServiceDetailsModalVisible}
      selectedService={selectedService}
      setSelectedService={setSelectedService}
      loadingServiceDetails={loadingServiceDetails}
      selectedItem={selectedItem}
      setSelectedItem={setSelectedItem}
      BASE_URL={BASE_URL}
      files={files}
      setFiles={setFiles}
      loadingFiles={loadingFiles}
      errorFiles={errorFiles}
      openPhotoModal={openPhotoModal}
      selectedImage={selectedImage}
      setSelectedImage={setSelectedImage}
      photoModalVisible={photoModalVisible}
      setPhotoModalVisible={setPhotoModalVisible}
      selectedImages={selectedImages}
      setSelectedImageIndex={setSelectedImageIndex}
    />

    <Modal
      visible={wishlistModalVisible}
      animationType="slide"
      onRequestClose={() => setWishlistModalVisible(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <WishlistModalHeader
          isCustomGift={isCustomGift}
          setIsCustomGift={setIsCustomGift}
          formData={formData}
          setFormData={setFormData}
          handleAddCustomGift={handleAddCustomGift}
          styles={styles}
          COLORS={COLORS}
        />
        <FlatList
          data={goods}
          renderItem={({ item }) => (
            <GoodCard
              item={item}
              selectedGoodIds={selectedGoodIds}
              setSelectedGoodIds={setSelectedGoodIds}
              styles={styles}
              COLORS={COLORS}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={styles.noItems}>Нет доступных подарков</Text>
          }
        />
        <WishlistModalFooter
          isCustomGift={isCustomGift}
          handleAddWishlistItem={handleAddWishlistItem}
          selectedGoodIds={selectedGoodIds}
          setWishlistModalVisible={setWishlistModalVisible}
          setSelectedGoodIds={setSelectedGoodIds}
          setIsCustomGift={setIsCustomGift}
          styles={styles}
          COLORS={COLORS}
        />
      </SafeAreaView>
    </Modal>

    <Modal
      visible={wishlistViewModalVisible}
      animationType="slide"
      onRequestClose={() => setWishlistViewModalVisible(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <Text style={styles.subtitle}>Список подарков</Text>
        <FlatList
          data={wishlistItems}
          renderItem={({ item }) => (
            <WishlistItem
              item={item}
              wishlistFiles={wishlistFiles}
              handleReserveWishlistItem={handleReserveWishlistItem}
              styles={styles}
              COLORS={COLORS}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={styles.noItems}>Список желаний пуст</Text>
          }
        />
        <Button
          title="Закрыть"
          onPress={() => setWishlistViewModalVisible(false)}
          color={COLORS.error}
        />
      </SafeAreaView>
    </Modal>

    <Modal
      visible={categoryModalVisible}
      animationType="slide"
      onRequestClose={() => setCategoryModalVisible(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <CategoryModalHeader
          selectedCategory={selectedCategory}
          categoryName={categoryName}
          setCategoryName={setCategoryName}
          categoryDescription={categoryDescription}
          setCategoryDescription={setCategoryDescription}
          categoryStatus={categoryStatus}
          setCategoryStatus={setCategoryStatus}
          servicesError={servicesError}
          styles={styles}
          COLORS={COLORS}
        />
        <FlatList
          data={availableServices}
          renderItem={({ item }) => (
            <ServiceCard
              item={item}
              categoryServices={categoryServices}
              setCategoryServices={setCategoryServices}
              isInCategoryView={false}
              styles={styles}
              COLORS={COLORS}
            />
          )}
          keyExtractor={(item) => `${item.id}-${item.serviceType}`}
          contentContainerStyle={styles.serviceList}
          ListEmptyComponent={
            <Text style={styles.noItems}>Нет доступных услуг</Text>
          }
        />
        <View style={styles.buttonRowModal}>
          <Button
            title={selectedCategory ? "Обновить" : "Создать"}
            onPress={
              selectedCategory
                ? handleUpdateEventCategory
                : handleCreateEventCategory
            }
            color={COLORS.primary}
          />
          <Button
            title="Отмена"
            onPress={() => setCategoryModalVisible(false)}
            color={COLORS.error}
          />
        </View>
      </SafeAreaView>
    </Modal>

    <Modal
      visible={categoryDetailsModalVisible}
      animationType="slide"
      onRequestClose={() => setCategoryDetailsModalVisible(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <CategoryDetailsHeader
          loadingDetails={loadingDetails}
          categoryDetails={categoryDetails}
          styles={styles}
          COLORS={COLORS}
        />
        <FlatList
          data={categoryDetails?.services || []}
          renderItem={({ item }) => (
            <ServiceCard
              item={item}
              isInCategoryView={true}
              openServiceDetailsModal={openServiceDetailsModal}
              styles={styles}
              COLORS={COLORS}
            />
          )}
          keyExtractor={(item) => `${item.serviceId}-${item.serviceType}`}
          ListEmptyComponent={
            <Text style={styles.noItems}>Для этой категории нет услуг</Text>
          }
        />
        <Button
          title="Закрыть"
          onPress={() => setCategoryDetailsModalVisible(false)}
          color={COLORS.error}
        />
      </SafeAreaView>
    </Modal>

    <Modal
      visible={eventCreationModalVisible}
      animationType="slide"
      onRequestClose={() => setEventCreationModalVisible(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <Text style={styles.subtitle}>Создать событие</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Название события"
                    value={activeEventName}
                    onChangeText={setActiveEventName}
                  />        <TouchableOpacity onPress={() => setShowCalendar(true)}>
          <Text style={styles.input}>{activeEventDate || "Выберите дату"}</Text>
        </TouchableOpacity>
        {showCalendar && (
          <Calendar
            onDayPress={onDateChange}
            markedDates={{
              [activeEventDate]: { selected: true, selectedColor: COLORS.primary },
            }}
          />
        )}
        <TextInput
          style={styles.input}
          placeholder="Бюджет"
          value={budget}
          onChangeText={setBudget}
          keyboardType="numeric"
        />
        <View style={styles.buttonRowModal}>
          <Button
            title="Создать"
            onPress={handleCreateEvent}
            color={COLORS.primary}
          />
          <Button
            title="Отмена"
            onPress={() => setEventCreationModalVisible(false)}
            color={COLORS.error}
          />
        </View>
      </SafeAreaView>
    </Modal>

    <Modal
      visible={eventEditModalVisible}
      animationType="slide"
      onRequestClose={() => setEventEditModalVisible(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <Text style={styles.subtitle}>Редактировать событие</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Название события"
                    value={activeEventName}
                    onChangeText={setActiveEventName}
                  />        <TouchableOpacity onPress={() => setShowCalendar(true)}>
          <Text style={styles.input}>{activeEventDate || "Выберите дату"}</Text>
        </TouchableOpacity>
        {showCalendar && (
          <Calendar
            onDayPress={onDateChange}
            markedDates={{
              [activeEventDate]: { selected: true, selectedColor: COLORS.primary },
            }}
          />
        )}
        <View style={styles.buttonRowModal}>
          <Button
            title="Обновить"
            onPress={handleUpdateEvent}
            color={COLORS.primary}
          />
          <Button
            title="Отмена"
            onPress={() => setEventEditModalVisible(false)}
            color={COLORS.error}
          />
        </View>
      </SafeAreaView>
    </Modal>






  </SafeAreaView>
);
}
