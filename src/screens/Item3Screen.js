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
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import Video from "react-native-video";
import * as Linking from "expo-linking";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import api from "../api/api";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import { Calendar } from "react-native-calendars";
import { Picker } from "@react-native-picker/picker";
import { ScrollView } from "react-native";
import ImageProgress from 'react-native-image-progress';
import { ProgressBar } from 'react-native-progress';

import { Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';


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


  mediaSection: {
    marginBottom: 16,
  },
  mediaListContainer: {},
  carouselItem: {
    width: screenWidth - 32,
    height: screenWidth * 0.6,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    overflow: 'hidden',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  media: {
    width: '100%',
    height: '100%',
  },
  unsupportedFile: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.border,
  },
  caption: {
    fontSize: 14,
    color: COLORS.muted,
    marginTop: 8,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 8,
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 6,
  },
  paginationActiveDot: {
    backgroundColor: COLORS.accent,
  },
  paginationInactiveDot: {
    backgroundColor: COLORS.border,
  },
  noFilesContainer: {
    height: screenWidth * 0.6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  noFilesText: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 40,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20,
    padding: 8,
    zIndex: 10,
  },
  fullscreenImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    textAlign: 'center',
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    minHeight: screenWidth * 0.3,
    justifyContent: 'center',
    alignItems: 'center',
  },




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
    height:'3rem',
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
    height:'60%',
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
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    textAlign: "center",
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
  mediaSection: {
    marginTop: 8,
  },
  mediaList: {
    paddingVertical: 8,
  },
  card: {
    marginRight: 8,
    borderRadius: 8,
    overflow: "hidden",
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  serviceDetailsModalContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    margin: 10,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.text,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    color: COLORS.error,
    fontWeight: "600",
  },
  // detailContainer: {
  //   backgroundColor: COLORS.background,
  //   padding: 16,
  //   borderRadius: 8,
  //   marginBottom: 16,
  // },
  // detailLabel: {
  //   fontSize: 16,
  //   fontWeight: "600",
  //   color: COLORS.text,
  //   marginBottom: 4,
  // },
  // detailValue: {
  //   fontSize: 16,
  //   color: COLORS.muted,
  //   marginBottom: 12,
  // },
  detailContainer: {
    paddingBottom: 20, // Ensure space for the button
  },
  detail: {
    marginVertical: 4,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  detailValue: {
    fontSize: 16,
    color: COLORS.muted,
  },




  serviceDetailsModalContainer: {
    width: "90%",
    maxHeight: "80%", // Ограничиваем максимальную высоту
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  closeButton: {
    padding: 10,
  },
  closeButtonText: {
    fontSize: 18,
    color: COLORS.error,
  },
  detailScrollContainer: {
    maxHeight: "90%", // Ограничиваем высоту области прокрутки
    marginBottom: 20,
  },
  detailContainer: {
    paddingBottom: 10,
  },
  detail: {
    marginVertical: 4,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  detailValue: {
    fontSize: 16,
    color: COLORS.muted,
    marginBottom: 5,
  },
  noItems: {
    fontSize: 16,
    color: COLORS.muted,
    textAlign: "center",
    marginVertical: 20,
  },
  createButton: {
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  createButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  loader: {
    marginVertical: 20,
  },



});





const determineCategory = (data) => {
  if (!data) return 'unknown';
  if (Array.isArray(data)) return 'restaurant';
  if (data.teamName) return 'theater';
  if (data.name && data.portfolio) return 'host';
  if (data.cakeType) return 'cake';
  if (data.carName) return 'car';
  if (data.flowerName) return 'flower';
  if (data.itemName && data.material) return 'jewelry';
  if (data.alcoholName || data.serviceType === 'alcohol') return 'alcohol';
  // Fallback to serviceType if available
  if (data.serviceType) {
    const normalizedType = data.serviceType.toLowerCase().replace(/s$/, "");
    return normalizedType in fieldLabelsByCategory ? normalizedType : 'unknown';
  }
  return 'unknown';
};

// Маппинг полей для каждой категории
const fieldLabelsByCategory = {
  theater: {
    teamName: 'Название команды',
    type: 'Тип постановки',
    cost: 'Стоимость',
  },
  restaurant: {
  
    name: 'Название ресторана',
    cuisine: 'Кухня',
    averageCost: 'Средний чек',
    capacity: 'Вместимость',
    address: 'Адрес',
    district: 'Район',
    phone: 'Телефон',

  },
  host: {
    name: 'Имя ведущего',
    portfolio: 'Портфолио',
    cost: 'Стоимость',
  },
  cake: {
    name: 'Название кондитерской',
    cakeType: 'Тип торта',
    cost: 'Стоимость',
    address: 'Адрес',
    district: 'Район',
    phone: 'Телефон',
  },
  cake: {
    name: "Название кондитерской",
    cakeType: "Тип торта",
    cost: "Стоимость",
    address: "Адрес",
    district: "Район",
    phone: "Телефон",
  },
  car: {
    salonName: 'Название салона',
    carName: 'Модель автомобиля',
    brand: 'Бренд',
    color: 'Цвет',
    cost: 'Стоимость',
    address: 'Адрес',
    district: 'Район',
    phone: 'Телефон',
  },
  flower: {
    salonName: 'Название салона',
    flowerName: 'Название цветов',
    flowerType: 'Тип композиции',
    cost: 'Стоимость',
    address: 'Адрес',
    district: 'Район',
    phone: 'Телефон',
  },
  jewelry: {
    storeName: 'Название магазина',
    itemName: 'Название изделия',
    material: 'Материал',
    type: 'Тип изделия',
    cost: 'Стоимость',
    address: 'Адрес',
    district: 'Район',
    phone: 'Телефон',
  },

// {"address": "ул. Масанчи 22", "alcoholName": "Ликер Baileys", "category": "Ликеры", "cost": 9000, "district": "Алмалинский", "id": 4, "phone": "+7 (703) 456-78-90", "salonName": "Ликерная", "supplier_id": 6}
  alcohol: {
    alcoholName: 'Название напитка',
    cost: 'Стоимость',
    category: 'Категория',
    // supplier_id: 'ID поставщика',
     salonName: 'Название салона',
      district: 'Район',
    address:'Адрес',
     
       phone: 'Телефон',

    // Add other relevant fields based on API response
  },

};


const { width: screenWidth } = Dimensions.get('window');


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
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [categoryStatus, setCategoryStatus] = useState("active");
  const [weddingName, setWeddingName] = useState("");
  const [weddingDate, setWeddingDate] = useState("");
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
  const [formData, setFormData] = useState({ category: "", item_name: "" });
  const [isCustomGift, setIsCustomGift] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [loadingServiceDetails, setLoadingServiceDetails] = useState(false);
  const [activeWeddingId, setActiveWeddingId] = useState(null);
  const [hasShownNoWeddingsAlert, setHasShownNoWeddingsAlert] = useState(false);
  const BASE_URL = process.env.EXPO_PUBLIC_API_baseURL;

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
              cost: null,
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

  const fetchWeddings = async () => {
    setLoadingWeddings(true);
    try {
      const response = await api.getWedding(token);
      const weddingData = Array.isArray(response.data)
        ? response.data
        : response.data.data || [];
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
      console.error("Error fetching weddings:", error);
      Alert.alert("Ошибка", "Не удалось загрузить свадьбы");
      setWeddings([]);
      setWeddingItemsCache({});
      return [];
    } finally {
      setLoadingWeddings(false);
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

  // const fetchEventCategoryDetails = async (id) => {
  //   setLoadingDetails(true);
  //   try {
  //     const response = await api.getEventCategoryWithServices(id);
  //     const details = response.data.data || response.data;
  //     setCategoryDetails(details);
  //     setCategoryServicesCache((prev) => ({
  //       ...prev,
  //       [id]: details.services || [],
  //     }));
  //     return details;
  //   } catch (error) {
  //     console.error("Error fetching category details:", error);
  //     Alert.alert("Ошибка", "Не удалось загрузить детали категории");
  //     setCategoryDetails(null);
  //     return null;
  //   } finally {
  //     setLoadingDetails(false);
  //   }
  // };

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



  // const fetchServiceDetails = async (serviceId, serviceType) => {
  //   setLoadingServiceDetails(true);
  //   try {
  //     const normalizedServiceType = serviceType.toLowerCase().replace(/s$/, "");
  //     const methodMap = {
  //       restaurant: "getRestaurantById",
  //       clothing: "getClothingById",
  //       tamada: "getTamadaById",
  //       program: "getProgramById",
  //       traditionalgift: "getTraditionalGiftById",
  //       flowers: "getFlowersById",
  //       cake: "getCakeById",
  //       alcohol: "getAlcoholById",
  //       transport: "getTransportById",
  //       jewelry: "getJewelryById",
  //       wedding: "getWeddingById",
  //       eventcategory: "getEventCategoryById",
  //       wishlist: "getWishlistById",
  //     };
  //     const methodName = methodMap[normalizedServiceType];
  //     if (!methodName || !api[methodName]) {
  //       throw new Error(`Неизвестный тип сервиса: ${normalizedServiceType}`);
  //     }
  //     const response = await api[methodName](serviceId);
  //     const data = response.data.data || response.data;
  //     return {
  //       serviceId,
  //       serviceType: normalizedServiceType,
  //       name: data.name,
  //       description: data.description || null,
  //       cost: data.cost || null,
  //       created_at: data.createdAt || data.created_at || null,
  //       updated_at: data.updatedAt || data.updated_at || null,
  //       address: data.address || null,
  //       cuisine: data.cuisine || null,
  //     };
  //   } catch (error) {
  //     console.error(
  //       `Error fetching service details for ${serviceType}/${serviceId}:`,
  //       error
  //     );
  //     Alert.alert(
  //       "Ошибка",
  //       `Не удалось загрузить детали услуги: ${error.message}`
  //     );
  //     return null;
  //   } finally {
  //     setLoadingServiceDetails(false);
  //   }
  // };

// const fetchServiceDetails = async (serviceId, serviceType) => {
//   setLoadingServiceDetails(true);
//   try {
//     let normalizedServiceType = serviceType.toLowerCase();
//     // Map singular "flower" to plural "flowers"
//     if (normalizedServiceType === "flower") {
//       normalizedServiceType = "flowers";
//     } else {
//       normalizedServiceType = normalizedServiceType.replace(/s$/, "");
//     }
//     const methodMap = {
//       restaurant: "getRestaurantById",
//       clothing: "getClothingById",
//       tamada: "getTamadaById",
//       program: "getProgramById",
//       traditionalgift: "getTraditionalGiftById",
//       flowers: "getFlowersById",
//       cake: "getCakeById",
//       alcohol: "getAlcoholById",
//       transport: "getTransportById",
//       jewelry: "getJewelryById",
//       wedding: "getWeddingById",
//       eventcategory: "getEventCategoryById",
//       wishlist: "getWishlistById",
//     };
//     const methodName = methodMap[normalizedServiceType];
//     if (!methodName || !api[methodName]) {
//       throw new Error(`Неизвестный тип сервиса: ${normalizedServiceType}`);
//     }
//     const response = await api[methodName](serviceId);
//     const data = response.data.data || response.data;
//     console.log('DATA= ', data);
//     return {
//       serviceId,
//       serviceType: normalizedServiceType,
//       ...data, // Spread all fields from the server response
//     };
//   } catch (error) {
//     console.error(
//       `Error fetching service details for ${serviceType}/${serviceId}:`,
//       error
//     );
//     Alert.alert(
//       "Ошибка",
//       `Не удалось загрузить детали услуги: ${error.message}`
//     );
//     return null;
//   } finally {
//     setLoadingServiceDetails(false);
//   }
// };


// const fetchServiceDetails = async (serviceId, serviceType) => {
//   setLoadingServiceDetails(true);
//   try {
//     let normalizedServiceType = serviceType.toLowerCase();
//     if (normalizedServiceType === "flower") {
//       normalizedServiceType = "flowers";
//     } else {
//       normalizedServiceType = normalizedServiceType.replace(/s$/, "");
//     }
//     const methodMap = {
//       restaurant: "getRestaurantById",
//       clothing: "getClothingById",
//       tamada: "getTamadaById",
//       program: "getProgramById",
//       traditionalgift: "getTraditionalGiftById",
//       flowers: "getFlowersById",
//       cake: "getCakeById",
//       alcohol: "getAlcoholById",
//       transport: "getTransportById",
//       jewelry: "getJewelryById",
//       wedding: "getWeddingById",
//       eventcategory: "getEventCategoryById",
//       wishlist: "getWishlistById",
//     };
//     const methodName = methodMap[normalizedServiceType];
//     if (!methodName || !api[methodName]) {
//       throw new Error(`Неизвестный тип сервиса: ${normalizedServiceType}`);
//     }
//     const response = await api[methodName](serviceId);
//     const data = response.data.data || response.data;
//     console.log('DATA= ', data);
//     return {
//       serviceId,
//       serviceType: normalizedServiceType,
//       ...data, // Spread all fields from the server response
//     };
//   } catch (error) {
//     console.error(
//       `Error fetching service details for ${serviceType}/${serviceId}:`,
//       error
//     );
//     Alert.alert(
//       "Ошибка",
//       `Не удалось загрузить детали услуги: ${error.message}`
//     );
//     // Return a fallback object to prevent undefined
//     return {
//       serviceId,
//       serviceType,
//       name: "Неизвестная услуга",
//       cost: null,
//     };
//   } finally {
//     setLoadingServiceDetails(false);
//   }
// };



// const fetchServiceDetails = async (serviceId, serviceType) => {
//   setLoadingServiceDetails(true);
//   try {
//     let normalizedServiceType = serviceType.toLowerCase();
//     if (normalizedServiceType === "flower") {
//       normalizedServiceType = "flowers";
//     } else {
//       normalizedServiceType = normalizedServiceType.replace(/s$/, "");
//     }
//     const methodMap = {
//       restaurant: "getRestaurantById",
//       clothing: "getClothingById",
//       tamada: "getTamadaById",
//       program: "getProgramById",
//       traditionalgift: "getTraditionalGiftById",
//       flowers: "getFlowersById",
//       cake: "getCakeById",
//       alcohol: "getAlcoholById",
//       transport: "getTransportById",
//       jewelry: "getJewelryById",
//       wedding: "getWeddingById",
//       eventcategory: "getEventCategoryById",
//       wishlist: "getWishlistById",
//     };
//     const methodName = methodMap[normalizedServiceType];
//     if (!methodName || !api[methodName]) {
//       throw new Error(`Неизвестный тип сервиса: ${normalizedServiceType}`);
//     }
//     const response = await api[methodName](serviceId);
//     const data = response.data.data || response.data;
//     console.log(`Service Details for ${normalizedServiceType}/${serviceId}:`, JSON.stringify(data, null, 2));

//     // Handle empty array for restaurant
//     if (normalizedServiceType === "restaurant" && Array.isArray(data)) {
//       if (data.length === 0) {
//         return {
//           serviceId,
//           serviceType: normalizedServiceType,
//           name: "Ресторан не найден",
//           cost: null,
//         };
//       }
//       // Return the first item of the array for restaurants
//       return {
//         serviceId,
//         serviceType: normalizedServiceType,
//         ...data[0], // Spread the first object
//       };
//     }

//     return {
//       serviceId,
//       serviceType: normalizedServiceType,
//       ...data,
//     };
//   } catch (error) {
//     console.error(
//       `Error fetching service details for ${serviceType}/${serviceId}:`,
//       error
//     );
//     Alert.alert(
//       "Ошибка",
//       `Не удалось загрузить детали услуги: ${error.message}`
//     );
//     return {
//       serviceId,
//       serviceType: normalizedServiceType,
//       name: "Неизвестная услуга",
//       cost: null,
//     };
//   } finally {
//     setLoadingServiceDetails(false);
//   }
// };


// const fetchServiceDetails = async (serviceId, serviceType) => {
//   setLoadingServiceDetails(true);
//   try {
//     let normalizedServiceType = serviceType.toLowerCase();
//     if (normalizedServiceType === "flower") {
//       normalizedServiceType = "flowers";
//     } else {
//       normalizedServiceType = normalizedServiceType.replace(/s$/, "");
//     }
//     const methodMap = {
//       restaurant: "getRestaurantById",
//       clothing: "getClothingById",
//       tamada: "getTamadaById",
//       program: "getProgramById",
//       traditionalgift: "getTraditionalGiftById",
//       flowers: "getFlowersById",
//       cake: "getCakeById",
//       alcohol: "getAlcoholById",
//       transport: "getTransportById",
//       jewelry: "getJewelryById",
//       wedding: "getWeddingById",
//       eventcategory: "getEventCategoryById",
//       wishlist: "getWishlistById",
//     };
//     const methodName = methodMap[normalizedServiceType];
//     if (!methodName || !api[methodName]) {
//       throw new Error(`Неизвестный тип сервиса: ${normalizedServiceType}`);
//     }
//     const response = await api[methodName](serviceId);
//     const data = response.data.data || response.data;
//     console.log(`Service Details for ${normalizedServiceType}/${serviceId}:`, JSON.stringify(data, null, 2));

//     // Handle empty array for restaurant
//     if (normalizedServiceType === "restaurant" && Array.isArray(data)) {
//       if (data.length === 0) {
//         return {
//           serviceId,
//           serviceType: normalizedServiceType,
//           name: "Ресторан не найден",
//           cost: null,
//         };
//       }
//       // Return the first item of the array for restaurants
//       return {
//         serviceId,
//         serviceType: normalizedServiceType,
//         ...data[0], // Spread the first object
//       };
//     }

//     // Ensure consistent return structure for other types
//     return {
//       serviceId,
//       serviceType: normalizedServiceType,
//       ...data,
//     };
//   } catch (error) {
//     console.error(
//       `Error fetching service details for ${serviceType}/${serviceId}:`,
//       error
//     );
//     Alert.alert(
//       "Ошибка",
//       `Не удалось загрузить детали услуги: ${error.message}`
//     );
//     return {
//       serviceId,
//       serviceType: normalizedServiceType,
//       name: "Неизвестная услуга",
//       cost: null,
//     };
//   } finally {
//     setLoadingServiceDetails(false);
//   }
// };

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

    // Handle array case for restaurants
    if (normalizedServiceType === 'restaurant' && Array.isArray(data)) {
      data = data.length > 0 ? data[0] : { name: 'Ресторан не найден', cost: null };
    }

    // Fetch media files
    try {
      const filesResponse = await axios.get(
        `${BASE_URL}/api/${normalizedServiceType}/${serviceId}/files`
      );

      console.log('FILE response= ',filesResponse)
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
      serviceType: normalizedServiceType,
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

  const handleCreateWedding = async () => {
    if (!weddingName || !weddingDate) {
      Alert.alert("Ошибка", "Введите название и дату свадьбы");
      return;
    }
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(weddingDate)) {
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
      const weddingData = {
        name: weddingName,
        date: weddingDate,
        items,
      };
      const response = await api.createWedding(weddingData, token);
      const newWedding = response.data.data;

      if (newWedding && newWedding.id) {
        const totalBudget = parseFloat(budget); // Use the budget from state
        const spentAmount = newWedding.total_cost || 0; // This is the total cost of items
        const remaining = totalBudget - spentAmount;

        await api.updateWeddingTotalCost(newWedding.id, { total_cost: totalBudget });
        await api.updateWeddingPaidAmount(newWedding.id, { paid_amount: spentAmount });
        await api.updateWeddingRemainingBalance(newWedding.id, { remaining_balance: remaining });

        const updatedWedding = {
            ...newWedding,
            paid_amount: spentAmount.toString(),
            remaining_balance: remaining.toString()
        };
        setWeddings((prev) => [...prev, updatedWedding]);
        dispatch(setEventCosts({ totalCost: totalBudget, paidAmount: spentAmount, remainingBalance: remaining }));
      } else {
        setWeddings((prev) => [...prev, newWedding]);
      }

      const itemsResponse = await api.getWeddingItems(newWedding.id, token);
      setWeddingItemsCache((prev) => ({
        ...prev,
        [newWedding.id]: itemsResponse.data.data || [],
      }));
      Alert.alert("Успех", "Свадьба создана");
      setWeddingModalVisible(false);
      setWeddingName("");
      setWeddingDate("");
      setHasShownNoWeddingsAlert(false);
      setActiveWeddingId(newWedding.id);
    } catch (error) {
      console.error("Error creating wedding:", error);
      Alert.alert(
        "Ошибка",
        error.response?.data?.error || "Не удалось создать свадьбу"
      );
    }
  };

  const handleUpdateWedding = async () => {
    if (!selectedWedding || !weddingName || !weddingDate) {
      Alert.alert("Ошибка", "Введите название и дату свадьбы");
      return;
    }
    try {
      const data = { name: weddingName, date: weddingDate };
      const response = await api.updateWedding(selectedWedding.id, token, data);
      setWeddings((prev) =>
        prev.map((w) => (w.id === selectedWedding.id ? response.data.data : w))
      );
      const itemsResponse = await api.getWeddingItems(
        selectedWedding.id,
        token
      );
      setWeddingItemsCache((prev) => ({
        ...prev,
        [selectedWedding.id]: itemsResponse.data.data || [],
      }));
      Alert.alert("Успех", "Свадьба обновлена");
      setEditWeddingModalVisible(false);
      setWeddingName("");
      setWeddingDate("");
      setSelectedWedding(null);
    } catch (error) {
      console.error("Error updating wedding:", error);
      Alert.alert(
        "Ошибка",
        error.response?.data?.error || "Не удалось обновить свадьбу"
      );
    }
  };

  const handleDeleteWedding = (id) => {
    Alert.alert(
      "Подтверждение",
      "Вы уверены, что хотите удалить эту свадьбу?",
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Удалить",
          onPress: async () => {
            try {
              await api.deleteWedding(id, token);
              setWeddings((prev) => prev.filter((w) => w.id !== id));
              setWeddingItemsCache((prev) => {
                const newCache = { ...prev };
                delete newCache[id];
                return newCache;
              });
              Alert.alert("Успех", "Свадьба удалена");
              if (activeWeddingId === id) {
                const newWeddingId =
                  weddings.find((w) => w.id !== id)?.id || null;
                setActiveWeddingId(newWeddingId);
              }
            } catch (error) {
              console.error("Error deleting wedding:", error);
              Alert.alert("Ошибка", "Не удалось удалить свадьбу");
            }
          },
        },
      ]
    );
  };

  const handleDeleteWeddingItem = async (weddingItemId) => {
    Alert.alert(
      "Подтверждение",
      "Вы уверены, что хотите удалить этот элемент?",
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Удалить",
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

              Alert.alert("Успех", "Элемент удален");
            } catch (error) {
              console.error("Error deleting wedding item:", error);
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
          { wedding_id: selectedWedding.id, good_id: goodId },
          token
        )
      );
      await Promise.all(promises);
      Alert.alert("Успех", "Подарки добавлены");
      setWishlistModalVisible(false);
      setSelectedGoodIds([]);
      const itemsResponse = await api.getWeddingItems(
        selectedWedding.id,
        token
      );
      setWeddingItemsCache((prev) => ({
        ...prev,
        [selectedWedding.id]: itemsResponse.data.data || [],
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
        { wedding_id: selectedWedding.id, good_id: newGood.id },
        token
      );
      Alert.alert("Успех", "Собственный подарок добавлен");
      setFormData({ ...formData, item_name: "" });
      setWishlistModalVisible(false);
      await fetchWishlistItems(selectedWedding.id);
    } catch (error) {
      console.error("Error adding custom gift:", error);
      Alert.alert("Ошибка", "Не удалось добавить подарок");
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

  const handleShareWeddingLink = async (weddingId) => {
    try {
      const webLink = `${BASE_URL}/api/weddingwishes/${weddingId}`;
      await Share.share({
        message: webLink,
        title: "Приглашение на свадьбу",
      });
    } catch (error) {
      console.error("Error sharing wedding link:", error);
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

  // const openServiceDetailsModal = async (service) => {
  //   setServiceDetailsModalVisible(true);
  //   setLoadingServiceDetails(true);
  //   const normalizedServiceType = service.serviceType
  //     .toLowerCase()
  //     .replace(/s$/, "");
  //   const details = await fetchServiceDetails(
  //     service.serviceId,
  //     normalizedServiceType
  //   );
  //   if (details) {
  //     setSelectedService(details);
  //   } else {
  //     setSelectedService(service);
  //     Alert.alert(
  //       "Ошибка",
  //       `Не удалось загрузить полные детали для услуги ${service.name}`
  //     );
  //   }
  //   setLoadingServiceDetails(false);
  // };


//  const openServiceDetailsModal = async (service) => {
//   if (!service.serviceId || !service.serviceType) {
//     Alert.alert("Ошибка", "Некорректные данные услуги");
//     return;
//   }
//   setServiceDetailsModalVisible(true);
//   setLoadingServiceDetails(true);
//   const normalizedServiceType = service.serviceType
//     .toLowerCase()
//     .replace(/s$/, "");
//   const details = await fetchServiceDetails(service.serviceId, normalizedServiceType);
//   setSelectedService(details || {
//     serviceId: service.serviceId,
//     serviceType: normalizedServiceType,
//     name: service.name || "Неизвестная услуга",
//     cost: service.cost || null,
//   });
//   setLoadingServiceDetails(false);
// };




// const openServiceDetailsModal = async (service) => {
//   if (!service.serviceId || !service.serviceType) {
//     Alert.alert("Ошибка", "Некорректные данные услуги");
//     return;
//   }
//   setServiceDetailsModalVisible(true);
//   setLoadingServiceDetails(true);
//   const normalizedServiceType = service.serviceType
//     .toLowerCase()
//     .replace(/s$/, "");
//   const details = await fetchServiceDetails(service.serviceId, normalizedServiceType);
//   console.log('Setting selectedService:', JSON.stringify(details, null, 2));
//   setSelectedService(details || {
//     serviceId: service.serviceId,
//     serviceType: normalizedServiceType,
//     name: service.name || "Неизвестная услуга",
//     cost: service.cost || null,
//   });
//   setLoadingServiceDetails(false);
// };



// const openServiceDetailsModal = async (service) => {
//   if (!service.serviceId || !service.serviceType) {
//     Alert.alert("Ошибка", "Некорректные данные услуги");
//     return;
//   }
//   setServiceDetailsModalVisible(true);
//   setLoadingServiceDetails(true);
//   const normalizedServiceType = service.serviceType.toLowerCase().replace(/s$/, "");
//   const details = await fetchServiceDetails(service.serviceId, normalizedServiceType);
//   console.log('Setting selectedService:', JSON.stringify(details, null, 2));
//   setSelectedService({
//     ...details,
//     originalServiceType: normalizedServiceType, // Store the original type
//   } || {
//     serviceId: service.serviceId,
//     serviceType: normalizedServiceType,
//     name: service.name || "Неизвестная услуга",
//     cost: service.cost || null,
//     originalServiceType: normalizedServiceType,
//   });
//   setLoadingServiceDetails(false);
// };


// const openServiceDetailsModal = async (service) => {
//   if (!service.serviceId || !service.serviceType) {
//     Alert.alert("Ошибка", "Некорректные данные услуги");
//     return;
//   }
//   setServiceDetailsModalVisible(true);
//   setLoadingServiceDetails(true);
//   const normalizedServiceType = service.serviceType.toLowerCase().replace(/s$/, "");
//   console.log(`Opening details for service: ${service.serviceId}, type: ${normalizedServiceType}`);
//   const details = await fetchServiceDetails(service.serviceId, normalizedServiceType);
//   console.log('Fetched service details:', JSON.stringify(details, null, 2));
//   setSelectedService({
//     ...details,
//     originalServiceType: normalizedServiceType,
//   } || {
//     serviceId: service.serviceId,
//     serviceType: normalizedServiceType,
//     name: service.name || "Неизвестная услуга",
//     cost: service.cost || null,
//     originalServiceType: normalizedServiceType,
//   });
//   setLoadingServiceDetails(false);
// };


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


  const openEditWeddingModal = (wedding) => {
    setSelectedWedding(wedding);
    setWeddingName(wedding.name);
    setWeddingDate(wedding.date);
    // setEditWeddingModalVisible(true);
  };

  // const openItemDetailsModal = async (weddingItem) => {
  //   const normalizedItemType = weddingItem.item_type
  //     .toLowerCase()
  //     .replace(/s$/, "");
  //   const details = await fetchItemDetails(
  //     normalizedItemType,
  //     weddingItem.item_id
  //   );
  //   setSelectedItem(details ? { ...weddingItem, ...details } : weddingItem);
  //   setDetailsModalVisible(true);
  // };







// const openItemDetailsModal = async (weddingItem) => {
//   const normalizedItemType = weddingItem.item_type
//     .toLowerCase()
//     .replace(/s$/, "");
//   console.log(`Opening details for item: ${weddingItem.item_id}, type: ${normalizedItemType}`);
//   const details = await fetchItemDetails(normalizedItemType, weddingItem.item_id);
//   console.log('Fetched item details:', JSON.stringify(details, null, 2));
//   setSelectedItem(details ? { ...weddingItem, ...details } : weddingItem);
//   setServiceDetailsModalVisible(true);
// };




const openItemDetailsModal = async (weddingItem) => {
  const normalizedItemType = weddingItem.item_type.toLowerCase().replace(/s$/, '');
  console.log(`Opening details for item: ${weddingItem.item_id}, type: ${normalizedItemType}`);
  setLoadingDetails(true);
  setLoadingFiles(true);
  try {
    const details = await fetchItemDetails(normalizedItemType, weddingItem.item_id);
    setSelectedItem(details ? { ...weddingItem, ...details } : weddingItem);

    // Fetch media files
    try {
      const filesResponse = await axios.get(
        `${BASE_URL}/api/${normalizedItemType}/${weddingItem.item_id}/files`
      );
      setFiles(filesResponse.data || []);
      setErrorFiles(null);
    } catch (fileError) {
      console.error(`Error fetching files for ${normalizedItemType}/${weddingItem.item_id}:`, fileError);
      setErrorFiles('Ошибка загрузки медиафайлов: ' + fileError.message);
      setFiles([]);
    }

    setServiceDetailsModalVisible(true);
  } catch (error) {
    console.error(`Error opening item details:`, error);
    Alert.alert('Ошибка', 'Не удалось загрузить детали элемента');
  } finally {
    setLoadingDetails(false);
    setLoadingFiles(false);
  }
};



  const onDateChange = (day) => {
    setWeddingDate(day.dateString);
    setShowCalendar(false);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchEventCategories(),
      fetchAvailableServices(),
      fetchWeddings(),
      fetchGoods(),
    ]);
    setRefreshing(false);
  }, []);

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
        let categories = Array.isArray(categoriesResponse.data)
          ? categoriesResponse.data
          : categoriesResponse.data.data || [];
        // console.log('Fetched категории мероприятий', JSON.stringify(categories, null, 2));

        if (route.params?.selectedCategories) {
          // console.log('Полученные категории:', route.params.selectedCategories);
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

        const weddingsData = Array.isArray(weddingsResponse.data)
          ? weddingsResponse.data
          : weddingsResponse.data.data || [];
        setWeddings(weddingsData);
        setGoods(Array.isArray(goodsResponse.data)
          ? goodsResponse.data
          : goodsResponse.data.data || []);

        if (weddingsData.length > 0) {
          const itemsPromises = weddingsData.map((wedding) =>
            api.getWeddingItems(wedding.id, token).then((res) => ({
              weddingId: wedding.id,
              items: res.data.data || [],
            }))
          );
          const itemsResults = await Promise.all(itemsPromises);
          const newWeddingCache = itemsResults.reduce(
            (acc, { weddingId, items }) => {
              acc[weddingId] = items;
              return acc;
            },
            {}
          );
          setWeddingItemsCache(newWeddingCache);
        }

        await fetchAvailableServices();
      } catch (error) {
        console.error('Ошибка инициализации:', error);
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
  }, [token, route.params?.selectedCategories]);

  useEffect(() => {
    if (!loadingWeddings && weddings.length === 0 && !hasShownNoWeddingsAlert) {
      // setWeddingModalVisible(true);
      setHasShownNoWeddingsAlert(true);
    }
  }, [loadingWeddings, weddings, hasShownNoWeddingsAlert]);

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

  const renderCategoryModalHeader = () => (
    <View>
      <Text style={styles.subtitle}>
        {selectedCategory ? "Редактировать категорию" : "Создать категорию"}
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

  const renderWishlistModalHeader = () => (
   <SafeAreaView>
   <View>

      
      <View style={styles.switchContainer}>
      
      
        <Text style={styles.switchLabel}>Добавить собственный подарок</Text>
        <TouchableOpacity
          style={[styles.switch, isCustomGift && styles.switchActive]}
          onPress={() => setIsCustomGift(!isCustomGift)}
        >
          <Text style={styles.switchText}>{isCustomGift ? "Вкл" : "Выкл"}</Text>
        </TouchableOpacity>
      </View>
      {isCustomGift && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Название подарка"
            placeholderTextColor={COLORS.muted}
            value={formData.item_name}
            onChangeText={(text) =>
              setFormData({ ...formData, item_name: text })
            }
          />
          <Button
            title="Добавить"
            onPress={handleAddCustomGift}
            color={COLORS.primary}
          />
        </>
      )}
    </View>
    </SafeAreaView>
  );

  const renderWishlistModalFooter = () =>
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
    );

  const renderEventCategoryItem = ({ item }) => {
    const filteredServices = categoryServicesCache[item.id] || [];
    const eventServices = item.EventServices || [];
    // console.log(`Services for category ${item.name} (ID: ${item.id}):`, JSON.stringify(filteredServices, null, 2));
    // console.log(`EventServices for category ${item.name} (ID: ${item.id}):`, JSON.stringify(eventServices, null, 2));

    const allServices = [
      ...filteredServices,
      ...eventServices
        .filter(
          (es) => !filteredServices.some((fs) => fs.serviceId === es.serviceId && fs.serviceType === es.serviceType)
        )
        .map((es) => ({
          id: es.serviceId,
          name: `Service ${es.serviceId}`,
          serviceType: es.serviceType,
          serviceId: es.serviceId,
          cost: null,
        })),
    ];

    const groupedServices = groupItemsByCategory(allServices);
    // console.log(`Grouped services for category ${item.name} (ID: ${item.id}):`, JSON.stringify(groupedServices, null, 2));

    return (
      <View style={styles.itemContainer}>
        <Text style={styles.itemText}>
          {item.name} 
          {/* ({item.status === "active" ? "Активно" : "Неактивно"}) */}
        </Text>
        <Text style={styles.itemSubText}>
          {/* Описание: {item.description || "Нет описания"} */}
        </Text>
        {groupedServices.length > 0 ? (
          <View style={styles.weddingItemsContainer}>
            {groupedServices.map((group) => (
              console.log('group- ',group),
              <View key={group.name} style={styles.categorySection}>
             
                <FlatList
                  data={group.items}
                  renderItem={({ item: service }) => (
                    <View
                      key={`${service.serviceType}-${service.serviceId}`}
                      style={styles.weddingItem}
                    >
                      <Text style={styles.subItemText}>
                        {group.name}
                        {/* {service.name} */}
                         {/* {service.cost ? `- ${service.cost} тг` : ""} */}
                      </Text>
                      <View style={styles.itemActions}>
                        <TouchableOpacity
                          style={styles.detailsButton}
                          onPress={() => openServiceDetailsModal(service)}
                        >
                          <Text style={styles.detailsButtonText}>Подробнее</Text>
                        </TouchableOpacity>
                        {/* <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() =>
                            handleDeleteCategoryService(
                              item.id,
                              service.serviceId,
                              service.serviceType
                            )
                          }
                        >
                          <Text style={styles.deleteButtonText}>Удалить</Text>
                        </TouchableOpacity> */}
                      </View>
                    </View>
                  )}
                  keyExtractor={(service, index) =>
                    `${service.serviceType}-${service.serviceId}-${index}`
                  }
                  contentContainerStyle={{ paddingBottom: 8 }}
                  initialNumToRender={20}
                  windowSize={10}
                />
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
            onPress={() => openEditCategoryModal(item)}
          >
            <Text style={styles.actionButtonText}>Редактировать</Text>
          </TouchableOpacity> */}
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

  const renderWeddingItem = ({ item }) => {
    const filteredItems = weddingItemsCache[item.id] || [];
    const groupedItems = groupItemsByCategory(filteredItems);
    return (
      <View style={styles.itemContainer}>
        <Text style={styles.itemText}>
          {item.name}
           {/* ({item.date}) */}
        </Text>
        {/* <View style={{ marginTop: 8, padding: 8, backgroundColor: '#f0f0f0', borderRadius: 4 }}>
          <Text style={styles.itemSubText}>Общая сумма: {item.total_cost || 0} тг</Text>
          <Text style={styles.itemSubText}>Потрачено: {item.paid_amount || 0} тг</Text>
          <Text style={styles.itemSubText}>Остаток: {item.remaining_balance || 0} тг</Text>
        </View> */}
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
                        const actualWeddingItem =
                          weddingItem.dataValues || weddingItem;
                        switch (actualWeddingItem.item_type) {
                          case "restaurants":
                          case "restaurant":
                            return `Ресторан - ${
                              actualWeddingItem.total_cost || 0
                            } тг`;
                          case "clothing":
                            return `Одежда - ${
                              actualWeddingItem.total_cost || 0
                            } тг`;
                          case "tamada":
                            return `Тамада - ${
                              actualWeddingItem.total_cost || 0
                            } тг`;
                          case "program":
                            return `Программа - ${
                              actualWeddingItem.total_cost || 0
                            } тг`;
                          case "traditionalGift":
                            return `Традиционный подарок - ${
                              actualWeddingItem.total_cost || 0
                            } тг`;
                          case "flowers":
                          case "flower":
                            return `Цветы - ${
                              actualWeddingItem.total_cost || 0
                            } тг`;
                          case "cakes":
                          case "cake":
                            return `Торт - ${
                              actualWeddingItem.total_cost || 0
                            } тг`;
                          case "alcohol":
                            return `Алкоголь - ${
                              actualWeddingItem.total_cost || 0
                            } тг`;
                          case "transport":
                            return `Транспорт - ${
                              actualWeddingItem.total_cost || 0
                            } тг`;
                          case "goods":
                          case "good":
                            return `Товар - ${
                              actualWeddingItem.total_cost || 0
                            } тг`;
                          case "jewelry":
                            return `Ювелирные изделия - ${
                              actualWeddingItem.total_cost || 0
                            } тг`;
                          default:
                            return `Неизвестный элемент - ${
                              actualWeddingItem.total_cost || 0
                            } тг`;
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
                navigation.navigate("AddWeddingItemsScreen", {
                  weddingId: item.id,
                });
              }}
            >
              <Text style={styles.addItemsButtonText}>Добавить элементы</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.buttonRow}>
          {/* <TouchableOpacity
            style={styles.actionButtonPrimary}
            onPress={() => openEditWeddingModal(item)}
          >
            <Text style={styles.actionButtonText}>Редактировать</Text>
          </TouchableOpacity> */}
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
        {item.cost ? `Цена: ${item.cost}` : "Цена не указана"}
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
              ? `Кто подарит: ${
                  item.Reserver?.username || item.reserved_by_unknown
                }`
              : "Свободно"}
          </Text>
          {item.goodLink && (
            <TouchableOpacity onPress={() => Linking.openURL(item.goodLink)}>
              <Text style={styles.linkText}>Открыть ссылку</Text>
            </TouchableOpacity>
          )}
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

  const renderServiceInCategory = ({ item }) => (
    <View style={styles.serviceCard}>
      <Text style={styles.serviceCardTitle}>{item.name}</Text>
      <Text style={styles.serviceCardDescription}>
        {item.description || "Нет описания"}
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

  const renderServiceItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.serviceCard,
        categoryServices.some(
          (s) => s.id === item.id && s.serviceType === item.serviceType
        ) && styles.selectedServiceCard,
      ]}
      onPress={() => {
        setCategoryServices((prev) => {
          const exists = prev.some(
            (s) => s.id === item.id && s.serviceType === item.serviceType
          );
          if (exists) {
            return prev.filter(
              (s) => !(s.id === item.id && s.serviceType === item.serviceType)
            );
          }
          return [
            ...prev,
            { id: item.id, serviceType: item.serviceType, name: item.name },
          ];
        });
      }}
    >
      <Text style={styles.serviceCardTitle}>{item.name}</Text>
      <Text style={styles.serviceCardDescription}>
        {item.description || "Нет описания"}
      </Text>
      <Text style={styles.serviceCardType}>Тип: {item.serviceType}</Text>
      {categoryServices.some(
        (s) => s.id === item.id && s.serviceType === item.serviceType
      ) && <Text style={styles.selectedIndicator}>✓</Text>}
    </TouchableOpacity>
  );

  // const renderCategoryDetailsHeader = () => (
  //   <View>
  //     <Text style={styles.subtitle}>Детали категории</Text>
  //     {loadingDetails ? (
  //       <ActivityIndicator
  //         size="large"
  //         color={COLORS.primary}
  //         style={styles.loader}
  //       />
  //     ) : categoryDetails ? (
  //       <>
  //         <Text style={styles.detail}>Название: {categoryDetails.name}</Text>
  //         <Text style={styles.detail}>
  //           Описание: {categoryDetails.description || "Нет описания"}
  //         </Text>
  //         <Text style={styles.detail}>
  //           Статус:{" "}
  //           {categoryDetails.status === "active" ? "Активно" : "Неактивно"}
  //         </Text>
  //         <Text style={styles.sectionTitle}>Услуги</Text>
  //       </>
  //     ) : (
  //       <Text style={styles.noItems}>Детали недоступны</Text>
  //     )}
  //   </View>
  // );


  const renderCategoryDetailsHeader = () => (
  <View>
    <Text style={styles.subtitle}>Детали категории</Text>
    {loadingDetails ? (
      <ActivityIndicator
        size="large"
        color={COLORS.primary}
        style={styles.loader}
      />
    ) : categoryDetails ? (
      <View>
        {Object.entries(categoryDetails).map(([key, value]) => {
          // Skip rendering services array as it’s handled separately
          if (key === "services") return null;
          // Handle nested objects or arrays by showing a summary
          const displayValue =
            typeof value === "object" && value !== null
              ? JSON.stringify(value)
              : value || "Не указано";
          return (
            <View key={key} style={styles.detailContainer}>
              <Text style={styles.detailLabel}>{key}</Text>
              <Text style={styles.detailValue}>{displayValue}</Text>
            </View>
          );
        })}
        <Text style={styles.sectionTitle}>Услуги</Text>
      </View>
    ) : (
      <Text style={styles.noItems}>Детали недоступны</Text>
    )}
  </View>
);




  const combinedData = [
    ...eventCategories.map((cat) => ({ type: "category", data: cat })),
    ...weddings.map((wed) => ({ type: "wedding", data: wed })),
  ];

  const renderItem = ({ item }) => {
    if (item.type === "category") {
      return renderEventCategoryItem({ item: item.data });
    } else if (item.type === "wedding") {
      return renderWeddingItem({ item: item.data });
    }
    return null;
  };






// Функция для определения категории на основе структуры данных











// const renderServiceDetailsModal = ({ serviceDetailsModalVisible, setServiceDetailsModalVisible, selectedService, setSelectedService, loadingServiceDetails, selectedItem, setSelectedItem }) => {
//   const isService = !!selectedService;
//   const isItem = !!selectedItem;
//   let data = isService ? selectedService : (isItem ? selectedItem : null);

//   // Debug input data
//   console.log('Input data to modal:', JSON.stringify({ isService, isItem, selectedService, selectedItem }, null, 2));

//   // Handle array or nested object case and extract the relevant data
//   let parsedData = null;
//   if (data && Array.isArray(data)) {
//     parsedData = data.length > 0 ? data[0] : null;
//     console.log('Extracted data from array:', JSON.stringify(parsedData, null, 2));
//   } else if (data && typeof data === 'object' && data.hasOwnProperty('0')) {
//     parsedData = data['0']; // Extract the nested object
//     console.log('Extracted nested data from key "0":', JSON.stringify(parsedData, null, 2));
//   } else {
//     parsedData = data;
//     console.log('Data is not an array or nested, using as is:', JSON.stringify(parsedData, null, 2));
//   }

//   // Force category to "restaurant" for testing
//   const category = "restaurant";
//   console.log('Determined category:', category);

//   // Define field labels for restaurant
//   const fieldLabelsByCategory = {
//     restaurant: {
//       name: "Название ресторана",
//       cuisine: "Кухня",
//       averageCost: "Средний чек",
//       capacity: "Вместимость",
//       address: "Адрес",
//       district: "Район",
//       phone: "Телефон",
//     },
//   };

//   const fieldLabels = fieldLabelsByCategory[category] || {
//     name: "Название",
//     address: "Адрес",
//     cost: "Стоимость",
//     district: "Район",
//     phone: "Телефон",
//     type: "Тип",
//   };

//   return (
//     <Modal visible={serviceDetailsModalVisible} animationType="fade" transparent={true}>
//       <SafeAreaView style={styles.modalContainer}>
//         <View style={styles.serviceDetailsModalContainer}>
//           <View style={styles.modalHeader}>
//             <Text style={styles.modalTitle}>Детали {isService ? "услуги" : "элемента"}</Text>
//             <TouchableOpacity
//               style={styles.closeButton}
//               onPress={() => {
//                 setServiceDetailsModalVisible(false);
//                 setSelectedService(null);
//                 setSelectedItem(null);
//               }}
//             >
//               <Text style={styles.closeButtonText}>✕</Text>
//             </TouchableOpacity>
//           </View>
//           {loadingServiceDetails ? (
//             <ActivityIndicator
//               size="large"
//               color={COLORS.primary}
//               style={styles.loader}
//             />
//           ) : parsedData ? (
//             <ScrollView style={styles.detailScrollContainer}>
//               <View style={styles.detailContainer}>
//                 {Object.entries(fieldLabels).map(([key, label]) => {
//                   const value = parsedData[key];
//                   console.log(`Rendering ${label}: ${value}`); // Debug each field
//                   if (value === undefined || value === null) return null; // Skip only if truly undefined/null
//                   const displayValue = (key === 'averageCost' || key === 'cost' || key === 'total_cost')
//                     ? `${value} ₸`
//                     : typeof value === "object" ? JSON.stringify(value) : value;
//                   return (
//                     <View key={key} style={styles.detailRow}>
//                       <Text style={styles.detailLabel}>{label}:</Text>
//                       <Text style={styles.detailValue}>{displayValue}</Text>
//                     </View>
//                   );
//                 })}
//                 {/* Fallback for unmapped fields including metadata */}
//                 {Object.keys(parsedData).map((key) => {
//                   if (
//                     fieldLabels[key] ||
//                     typeof parsedData[key] === "function" ||
//                     key.startsWith("_") ||
//                     parsedData[key] === null ||
//                     parsedData[key] === undefined ||
//                     ["id", "serviceId", "item_id", "originalServiceType", "supplier_id", "wedding_id", "created_at", "updated_at"].includes(key.toLowerCase())
//                   ) return null;
//                   const displayValue = typeof parsedData[key] === "object" ? JSON.stringify(parsedData[key]) : parsedData[key];
//                   return (
//                     <View key={key} style={styles.detailRow}>
//                       <Text style={styles.detailLabel}>{key}:</Text>
//                       <Text style={styles.detailValue}>{displayValue}</Text>
//                     </View>
//                   );
//                 })}
//               </View>
//             </ScrollView>
//           ) : (
//             <Text style={styles.noItems}>Детали недоступны</Text>
//           )}
//           <TouchableOpacity
//             style={[styles.createButton, { backgroundColor: COLORS.error }]}
//             onPress={() => {
//               setServiceDetailsModalVisible(false);
//               setSelectedService(null);
//               setSelectedItem(null);
//             }}
//           >
//             <Text style={styles.createButtonText}>Закрыть</Text>
//           </TouchableOpacity>
//         </View>
//       </SafeAreaView>
//     </Modal>
//   );
// };

const renderServiceDetailsModal = ({
  serviceDetailsModalVisible,
  setServiceDetailsModalVisible,
  selectedService,
  setSelectedService,
  loadingServiceDetails,
  selectedItem,
  setSelectedItem,
}) => {
  const isService = !!selectedService;
  const isItem = !!selectedItem;
  let data = isService ? selectedService : isItem ? selectedItem : null;

  // Handle array or nested object case
  if (data && Array.isArray(data)) {
    data = data.length > 0 ? data[0] : null;
  } else if (data && typeof data === 'object' && data.hasOwnProperty('0')) {
    data = data['0'];
  }

  // Determine category
  const category = isService
    ? selectedService?.originalServiceType || determineCategory(selectedService)
    : isItem
    ? selectedItem.item_type.toLowerCase().replace(/s$/, '')
    : 'unknown';

  const fieldLabels = fieldLabelsByCategory[category] || {
    name: 'Название',
    address: 'Адрес',
    cost: 'Стоимость',
    district: 'Район',
    phone: 'Телефон',
    type: 'Тип',
  };

  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const carouselItemWidth = screenWidth - 32; // Adjust for padding
    const index = Math.round(contentOffsetX / carouselItemWidth);
    setActiveSlide(index);
  };

  const renderFileItem = ({ item: file }) => {
    const fileUrl = `${BASE_URL}/${file.path}`;

    if (file.mimetype.startsWith('image/')) {
      return (
        <TouchableOpacity
          style={styles.carouselItem}
          onPress={() => setSelectedImage(fileUrl)}
          activeOpacity={0.9}
        >
          <ImageProgress
            source={{ uri: fileUrl }}
            indicator={ProgressBar}
            indicatorProps={{
              color: COLORS.primary,
              borderWidth: 0,
              borderRadius: 0,
              unfilledColor: COLORS.muted,
              width: null,
            }}
            style={styles.media}
            resizeMode="cover"
          />
        </TouchableOpacity>
      );
    } else if (file.mimetype === 'video/mp4') {
      return (
        <View style={styles.carouselItem}>
          <Video
            source={{ uri: fileUrl }}
            style={styles.media}
            controls={true}
            resizeMode="cover"
          />
        </View>
      );
    } else {
      return (
        <View style={[styles.carouselItem, styles.unsupportedFile]}>
          <Icon name="broken-image" size={40} color={COLORS.muted} />
          <Text style={styles.caption}>Неподдерживаемый формат: {file.mimetype}</Text>
        </View>
      );
    }
  };

  return (
    <Modal visible={serviceDetailsModalVisible} animationType="fade" transparent={true}>
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.serviceDetailsModalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Детали {isService ? 'услуги' : 'элемента'}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setServiceDetailsModalVisible(false);
                setSelectedService(null);
                setSelectedItem(null);
                setFiles([]);
                setSelectedImage(null);
              }}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.detailScrollContainer}>
            {/* Media Section */}
            <View style={styles.mediaSection}>
              {loadingFiles ? (
                <ActivityIndicator
                  size="large"
                  color={COLORS.primary}
                  style={styles.loader}
                />
              ) : errorFiles ? (
                <Text style={styles.errorText}>{errorFiles}</Text>
              ) : files && files.length > 0 ? (
                <View>
                  <FlatList
                    data={files}
                    renderItem={renderFileItem}
                    keyExtractor={(file) => file.id.toString()}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    snapToInterval={screenWidth - 32}
                    snapToAlignment="center"
                    decelerationRate="fast"
                    contentContainerStyle={styles.mediaListContainer}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                    initialNumToRender={1}
                    maxToRenderPerBatch={1}
                    windowSize={3}
                  />
                  {files.length > 1 && (
                    <View style={styles.paginationContainer}>
                      {files.map((_, index) => (
                        <View
                          key={index}
                          style={[
                            styles.paginationDot,
                            activeSlide === index
                              ? styles.paginationActiveDot
                              : styles.paginationInactiveDot,
                          ]}
                        />
                      ))}
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.noFilesContainer}>
                  <Icon name="image-not-supported" size={50} color={COLORS.muted} />
                  <Text style={styles.noFilesText}>Изображения или видео отсутствуют</Text>
                </View>
              )}
            </View>
            {/* Details Section */}
            {loadingServiceDetails ? (
              <ActivityIndicator
                size="large"
                color={COLORS.primary}
                style={styles.loader}
              />
            ) : data ? (
              <View style={styles.detailContainer}>
                {Object.entries(fieldLabels).map(([key, label]) => {
                  const value = data[key];
                  if (value === undefined || value === null) return null;
                  const displayValue =
                    key === 'cost' || key === 'averageCost' || key === 'total_cost'
                      ? `${value} ₸`
                      : typeof value === 'object'
                      ? JSON.stringify(value)
                      : value;
                  return (
                    <View key={key} style={styles.detail}>
                      <Text style={styles.detailLabel}>{label}</Text>
                      <Text style={styles.detailValue}>{displayValue}</Text>
                    </View>
                  );
                })}
                {Object.entries(data).map(([key, value]) => {
                  if (
                    fieldLabels[key] ||
                    typeof value === 'function' ||
                    key.startsWith('_') ||
                    value === null ||
                    value === undefined ||
                    ['id', 'serviceId', 'item_id', 'originalServiceType', 'supplier_id', 'wedding_id', 'created_at', 'updated_at'].includes(
                      key.toLowerCase()
                    )
                  )
                    return null;
                  const displayValue = typeof value === 'object' ? JSON.stringify(value) : value;
                  return (
                    <View key={key} style={styles.detail}>
                      <Text style={styles.detailLabel}>{key}</Text>
                      <Text style={styles.detailValue}>{displayValue}</Text>
                    </View>
                  );
                })}
              </View>
            ) : (
              <Text style={styles.noItems}>Детали недоступны</Text>
            )}
          </ScrollView>
          <TouchableOpacity
            style={[styles.createButton, { backgroundColor: COLORS.error }]}
            onPress={() => {
              setServiceDetailsModalVisible(false);
              setSelectedService(null);
              setSelectedItem(null);
              setFiles([]);
              setSelectedImage(null);
            }}
          >
            <Text style={styles.createButtonText}>Закрыть</Text>
          </TouchableOpacity>
        </View>
        {/* Fullscreen Image Modal */}
        <Modal
          visible={!!selectedImage}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedImage(null)}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setSelectedImage(null)}
              activeOpacity={0.8}
            >
              <Icon name="close" size={30} color={COLORS.white} />
            </TouchableOpacity>
            <ImageProgress
              source={{ uri: selectedImage }}
              indicator={ProgressBar}
              indicatorProps={{
                color: COLORS.primary,
                borderWidth: 0,
                borderRadius: 0,
                unfilledColor: COLORS.muted,
                width: null,
              }}
              style={styles.fullscreenImage}
              resizeMode="contain"
            />
          </View>
        </Modal>
      </SafeAreaView>
    </Modal>
  );
};





return (
  <SafeAreaView style={styles.container}>
    <Text style={styles.title}>Мои мероприятия</Text>
    <View style={styles.buttonRow}>
      {/* Existing buttons */}
    </View>
    {loadingCategories || loadingWeddings ? (
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
            <Text style={styles.noItems}>Нет мероприятий или свадеб</Text>
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

    {/* Unified Service and Item Details Modal */}
    {renderServiceDetailsModal({
      serviceDetailsModalVisible,
      setServiceDetailsModalVisible,
      selectedService,
      setSelectedService,
      loadingServiceDetails,
      selectedItem,
      setSelectedItem,
    })}

    {/* Add Gift Modal */}
    <Modal
      visible={wishlistModalVisible}
      animationType="slide"
      onRequestClose={() => setWishlistModalVisible(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        {renderWishlistModalHeader()}
        <FlatList
          data={goods}
          renderItem={renderGoodCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={<Text style={styles.noItems}>Нет доступных подарков</Text>}
        />
        {renderWishlistModalFooter()}
      </SafeAreaView>
    </Modal>

    {/* View Wishlist Modal */}
    <Modal
      visible={wishlistViewModalVisible}
      animationType="slide"
      onRequestClose={() => setWishlistViewModalVisible(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <Text style={styles.subtitle}>Список подарков</Text>
        <FlatList
          data={wishlistItems}
          renderItem={renderWishlistItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={<Text style={styles.noItems}>Список желаний пуст</Text>}
        />
        <Button title="Закрыть" onPress={() => setWishlistViewModalVisible(false)} color={COLORS.error} />
      </SafeAreaView>
    </Modal>

    {/* Create/Edit Category Modal */}
    <Modal
      visible={categoryModalVisible}
      animationType="slide"
      onRequestClose={() => setCategoryModalVisible(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        {renderCategoryModalHeader()}
        <FlatList
          data={availableServices}
          renderItem={renderServiceItem}
          keyExtractor={(item) => `${item.id}-${item.serviceType}`}
          contentContainerStyle={styles.serviceList}
          ListEmptyComponent={<Text style={styles.noItems}>Нет доступных услуг</Text>}
        />
        <View style={styles.buttonRowModal}>
          <Button
            title={selectedCategory ? "Обновить" : "Создать"}
            onPress={selectedCategory ? handleUpdateEventCategory : handleCreateEventCategory}
            color={COLORS.primary}
          />
          <Button title="Отмена" onPress={() => setCategoryModalVisible(false)} color={COLORS.error} />
        </View>
      </SafeAreaView>
    </Modal>

    {/* Category Details Modal */}
    <Modal
      visible={categoryDetailsModalVisible}
      animationType="slide"
      onRequestClose={() => setCategoryDetailsModalVisible(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        {renderCategoryDetailsHeader()}
        <FlatList
          data={categoryDetails?.services || []}
          renderItem={renderServiceInCategory}
          keyExtractor={(item) => `${item.serviceId}-${item.serviceType}`}
          ListEmptyComponent={<Text style={styles.noItems}>Для этой категории нет услуг</Text>}
        />
        <Button title="Закрыть" onPress={() => setCategoryDetailsModalVisible(false)} color={COLORS.error} />
      </SafeAreaView>
    </Modal>

    {/* Create Wedding Modal */}
    <Modal
      visible={weddingModalVisible}
      animationType="slide"
      onRequestClose={() => setWeddingModalVisible(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <Text style={styles.subtitle}>Создать свадьбу</Text>
        <TextInput
          style={styles.input}
          placeholder="Название свадьбы"
          value={weddingName}
          onChangeText={setWeddingName}
        />
        <TouchableOpacity onPress={() => setShowCalendar(true)}>
          <Text style={styles.input}>{weddingDate || "Выберите дату"}</Text>
        </TouchableOpacity>
        {showCalendar && (
          <Calendar
            onDayPress={onDateChange}
            markedDates={{ [weddingDate]: { selected: true, selectedColor: COLORS.primary } }}
          />
        )}
        <View style={styles.buttonRowModal}>
          <Button title="Создать" onPress={handleCreateWedding} color={COLORS.primary} />
          <Button title="Отмена" onPress={() => setWeddingModalVisible(false)} color={COLORS.error} />
        </View>
      </SafeAreaView>
    </Modal>

    {/* Edit Wedding Modal */}
    <Modal
      visible={editWeddingModalVisible}
      animationType="slide"
      onRequestClose={() => setEditWeddingModalVisible(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <Text style={styles.subtitle}>Редактировать свадьбу</Text>
        <TextInput
          style={styles.input}
          placeholder="Название свадьбы"
          value={weddingName}
          onChangeText={setWeddingName}
        />
        <TouchableOpacity onPress={() => setShowCalendar(true)}>
          <Text style={styles.input}>{weddingDate || "Выберите дату"}</Text>
        </TouchableOpacity>
        {showCalendar && (
          <Calendar
            onDayPress={onDateChange}
            markedDates={{ [weddingDate]: { selected: true, selectedColor: COLORS.primary } }}
          />
        )}
        <View style={styles.buttonRowModal}>
          <Button title="Обновить" onPress={handleUpdateWedding} color={COLORS.primary} />
          <Button title="Отмена" onPress={() => setEditWeddingModalVisible(false)} color={COLORS.error} />
        </View>
      </SafeAreaView>
    </Modal>
  </SafeAreaView>
);
}
