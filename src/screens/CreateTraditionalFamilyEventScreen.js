
//////////////////////////////////////




import React, { Component, useState, useRef, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
  FlatList,
  Modal,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
} from "react-native";
import Icon2 from "react-native-vector-icons/MaterialCommunityIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useDispatch, useSelector } from "react-redux";
import api from "../api/api";
import * as Animatable from "react-native-animatable";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Calendar } from "react-native-calendars";
import Icon from "react-native-vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";
import * as Linking from "expo-linking";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// COLORS and MODAL_COLORS remain unchanged
export const COLORS = {
  background: "#F1EBDD",
  primary: '#5A4032',
  secondary: '#897066',
  card: '#FDFBF5',
  textPrimary: '#5A4032',
  textSecondary: '#718096',
  accent: '#D3C5B7',
  shadow: 'rgba(45, 55, 72, 0.15)',
  error: '#FF0000',
  white: '#FFFFFF',
  buttonGradientStart: '#D3C5B7',
  buttonGradientEnd: '#A68A6E',
  border: '#B0A092',
  placeholder: 'rgba(255, 255, 255, 0.7)',
}

export const MODAL_COLORS = {
  background: '#EDE7D9',
  cardBackground: '#FDFBF5',
  primaryActionStart: '#D3C5B7',
  primaryActionEnd: '#A68A6E',
  textPrimary: '#5A4032',
  textSecondary: '#718096',
  inputBackground: '#FBF9F7',
  inputBorder: '#B0A092',
  activeFilter: '#A68A6E',
  activeFilterText: '#FFFFFF',
  inactiveFilter: '#EFEBE4',
  inactiveFilterText: '#5A4032',
  separator: '#B0A092',
  shadow: 'rgba(45, 55, 72, 0.15)',
  icon: '#5A4032',
  closeButtonColor: '#5A4032',
  overlayBackground: 'rgba(45, 55, 72, 0.65)',
};


const typeOrder = {
  restaurant: 1,
  hotels: 2,
  tamada: 3,
  program: 4,
  flowers: 5,
  transport: 6,
  cake: 7,
  alcohol: 8,
  jewelry: 9,
  typography: 10,
  "technical-equipment-rental": 11,
  "traditional-gifts": 12,
  "national-costumes": 13,
  musicians: 14,
  photographers: 15,
  videographers: 16,
  decor: 17,
  "event-category": 18,
};

const typesMapping = [
  { key: "restaurants", costField: "averageCost", type: "restaurant", label: "Ресторан" },
  { key: "hotels", costField: "cost", type: "hotels", label: "Гостиницы" },
  { key: "tamada", costField: "cost", type: "tamada", label: "Ведущий" },
  { key: "programs", costField: "cost", type: "program", label: "Шоу программы" },
  { key: "flowers", costField: "cost", type: "flowers", label: "Цветы" },
  { key: "transport", costField: "cost", type: "transport", label: "Прокат авто" },
  { key: "cakes", costField: "cost", type: "cake", label: "Торты" },
  { key: "alcohol", costField: "cost", type: "alcohol", label: "Алкоголь" },
  { key: "jewelry", costField: "cost", type: "jewelry", label: "Ювелирные изделия" },
  { key: "typographies", costField: "cost", type: "typography", label: "Типографии" },
  { key: "technical-equipment-rentals", costField: "cost", type: "technical-equipment-rental", label: "Аренда технического оснащения" },
  { key: "traditional-gifts", costField: "cost", type: "traditional-gifts", label: "Традиционные подарки" },
  { key: "national-costumes", costField: "cost", type: "national-costumes", label: "Национальные костюмы" },
  { key: "musicians", costField: "cost", type: "musicians", label: "Музыканты" },
  { key: "photographers", costField: "cost", type: "photographers", label: "Фотографы" },
  { key: "videographers", costField: "cost", type: "videographers", label: "Видеографы" },
  { key: "decor", costField: "cost", type: "decor", label: "Декор" },
  { key: "event-categories", costField: "cost", type: "event-category", label: "Категории мероприятий" },
];

const categoryToTypeMap = {
  "Ресторан": "restaurant",
  "Отели": "hotels",
  "Ведущий": "tamada",
  "Шоу программа": "program",
  "Цветы": "flowers",
  "Прокат авто": "transport",
  "Торты": "cake",
  "Алкоголь": "alcohol",
  "Ювелирные изделия": "jewelry",
  "Типографии": "typography",
  "Аренда технического оборудования": "technical-equipment-rental",
  "Традиционные подарки": "traditional-gifts",
  "Национальные костюмы": "national-costumes",
  "Музыканты": "musicians",
  "Фотографы": "photographers",
  "Видеографы": "videographers",
  "Декор": "decor",
  "Категории мероприятий": "event-category",
};

const typeToCategoryMap = Object.fromEntries(
  Object.entries(categoryToTypeMap).map(([category, type]) => [type, category])
);

const useDebounce = (callback, delay) => {
  const callbackRef = useRef(callback);
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debouncedCallback = useCallback(
    (...args) => {
      const timeout = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
      return () => clearTimeout(timeout);
    },
    [delay]
  );

  return debouncedCallback;
};

class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Произошла ошибка. Пожалуйста, попробуйте снова.</Text>
        </View>
      );
    }
    return this.props.children;
  }
}





const AddItemModal = ({
  visible,
  onClose,
  filteredItems,
  filteredData,
  handleAddItem,
  setDetailsModalVisible,
  setSelectedItem,
  quantities,
  updateCategories,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState("all");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [costRange, setCostRange] = useState("all");

  const uniqueTypes = useMemo(() => {
    const types = [
      { type: "all", label: "Все" },
      ...filteredItems
        .map((item) => ({
          type: item.type,
          label: typesMapping.find((t) => t.type === item.type)?.label || item.type,
        }))
        .filter(
          (value, index, self) =>
            self.findIndex((t) => t.type === value.type) === index
        )
        .sort((a, b) => (typeOrder[a.type] || 13) - (typeOrder[b.type] || 13)),
    ];
    return types;
  }, [filteredItems]);

  const districts = useMemo(
    () => [
      "all",
      ...new Set(
        filteredItems.map((item) => String(item.district)).filter(Boolean)
      ),
    ],
    [filteredItems]
  );

  const filteredDataMemo = useMemo(() => {
    let result = filteredItems;
    if (searchQuery) {
      result = result.filter((item) =>
        [
          item.name,
          item.itemName,
          item.flowerName,
          item.alcoholName,
          item.carName,
          item.teamName,
          item.salonName,
          item.storeName,
          item.address,
          item.phone,
          item.cuisine,
          item.category,
          item.brand,
          item.gender,
          item.portfolio,
          item.cakeType,
          item.flowerType,
          item.material,
          item.type,
        ]
          .filter(Boolean)
          .some((field) =>
            field.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }
    if (selectedTypeFilter !== "all") {
      result = result.filter((item) => item.type === selectedTypeFilter);
    }
    if (selectedDistrict !== "all") {
      result = result.filter(
        (item) => String(item.district) === selectedDistrict
      );
    }
    if (costRange !== "all") {
      result = result.filter((item) => {
        const cost = item.averageCost || item.cost;
        if (costRange === "0-10000") return cost <= 10000;
        if (costRange === "10000-50000") return cost > 10000 && cost <= 50000;
        if (costRange === "50000+") return cost > 50000;
        return true;
      });
    }
    return result.sort(
      (a, b) => (typeOrder[a.type] || 13) - (typeOrder[b.type] || 13)
    );
  }, [
    filteredItems,
    searchQuery,
    selectedTypeFilter,
    selectedDistrict,
    costRange,
  ]);

  const renderAddItem = useCallback(
    ({ item }) => {
      if (!item || !item.type || !item.id) {
        console.warn("Некорректный элемент в renderAddItem:", item);
        return null;
      }

      const count = filteredData.filter(
        (selectedItem) =>
          `${selectedItem.type}-${selectedItem.id}` ===
          `${item.type}-${item.id}`
      ).length;
      const cost = item.type === "restaurant" ? item.averageCost : item.cost;
      let title;
      switch (item.type) {
        case "restaurant":
          title = `Ресторан: ${item.name} (${cost} ₸)`;
          break;
        case "hotels":
          title = `Гостиница: ${item.name} (${cost} ₸)`;
          break;
        case "tamada":
          title = `Ведущий: ${item.name} (${cost} ₸)`;
          break;
        case "program":
          title = `Шоу программа: ${item.teamName} (${cost} ₸)`;
          break;
        case "flowers":
          title = `Цветы: ${item.salonName} - ${item.flowerName} (${cost} ₸)`;
          break;
        case "transport":
          title = `Прокат авто: ${item.salonName} - ${item.carName} (${cost} ₸)`;
          break;
        case "cake":
          title = `Торты: ${item.name} (${cost} ₸)`;
          break;
        case "alcohol":
          title = `Алкоголь: ${item.salonName} - ${item.alcoholName} (${cost} ₸)`;
          break;
        case "jewelry":
          title = `Ювелирные изделия: ${item.storeName} - ${item.itemName} (${cost} ₸)`;
          break;
        case "traditional-gifts":
          title = `Традиционные подарки: ${item.salonName} - ${item.itemName} (${cost} ₸)`;
          break;
        default:
          title = "Неизвестный элемент";
      }
      return (
        <View style={styles.addModalItemCard}>
          <TouchableOpacity
            style={styles.addModalItemContent}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              handleAddItem(item);
              const category = typeToCategoryMap[item.type];
              if (category) {
                updateCategories(category);
              }
            }}
            accessible
            accessibilityLabel={`Добавить ${title}`}
          >
            <Text style={styles.addModalItemText}>{title}</Text>
            {count > 0 && (
              <Text style={styles.addModalItemCount}>Добавлено: {count}</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.detailsIconButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedItem(item);
              setDetailsModalVisible(true);
            }}
            accessible
            accessibilityLabel="Посмотреть детали"
          >
            <Icon name="search" size={20} color={MODAL_COLORS.icon} />
          </TouchableOpacity>
        </View>
      );
    },
    [
      filteredData,
      handleAddItem,
      setDetailsModalVisible,
      setSelectedItem,
      updateCategories,
    ]
  );

  const closeModal = () => {
    setSearchQuery("");
    setSelectedTypeFilter("all");
    setSelectedDistrict("all");
    setCostRange("all");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={closeModal}
    >
      <SafeAreaView style={styles.modalOverlay}>
        <View style={styles.addModalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Добавить элемент</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={closeModal}
              accessible
              accessibilityLabel="Закрыть модальное окно"
            >
              <Icon name="close" size={24} color={MODAL_COLORS.closeButtonColor} />
            </TouchableOpacity>
          </View>

          <View style={styles.addModalSearchContainer}>
            <Icon
              name="search"
              size={20}
              color={MODAL_COLORS.icon}
              style={styles.addModalSearchIcon}
            />
            <TextInput
              style={styles.addModalSearchInput}
              placeholder="Поиск по названию..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={MODAL_COLORS.textSecondary}
              accessible
              accessibilityLabel="Поиск элементов"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                style={styles.addModalClearIcon}
                onPress={() => setSearchQuery("")}
                accessible
                accessibilityLabel="Очистить поиск"
              >
                <Icon name="clear" size={20} color={MODAL_COLORS.icon} />
              </TouchableOpacity>
            )}
          </View>

          <FlatList
            style={styles.addModalFilterScroll}
            showsVerticalScrollIndicator={false}
            data={[{ key: "filters" }]}
            renderItem={() => (
              <View>
                <Text style={styles.addModalFilterLabel}>Тип</Text>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={uniqueTypes}
                  keyExtractor={(item) => item.type}
                  renderItem={({ item: typeObj }) => (
                    <TouchableOpacity
                      style={[
                        styles.filterButtonBase,
                        selectedTypeFilter === typeObj.type
                          ? styles.addModalTypeButtonActive
                          : styles.addModalTypeButton,
                      ]}
                      onPress={() => setSelectedTypeFilter(typeObj.type)}
                      accessible
                      accessibilityLabel={`Фильтр по типу ${typeObj.label}`}
                    >
                      <Text
                        style={[
                          styles.filterButtonTextBase,
                          selectedTypeFilter === typeObj.type
                            ? styles.addModalTypeButtonTextActive
                            : styles.addModalTypeButtonText,
                        ]}
                      >
                        {typeObj.label}
                      </Text>
                    </TouchableOpacity>
                  )}
                />

                <Text style={styles.addModalFilterLabel}>Район</Text>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={districts}
                  keyExtractor={(district) => district}
                  renderItem={({ item: district }) => (
                    <TouchableOpacity
                      style={[
                        styles.filterButtonBase,
                        selectedDistrict === district
                          ? styles.addModalDistrictButtonActive
                          : styles.addModalDistrictButton,
                      ]}
                      onPress={() => setSelectedDistrict(district)}
                      accessible
                      accessibilityLabel={`Фильтр по району ${district === "all" ? "Все" : district}`}
                    >
                      <Text
                        style={[
                          styles.filterButtonTextBase,
                          selectedDistrict === district
                            ? styles.addModalDistrictButtonTextActive
                            : styles.addModalDistrictButtonText,
                        ]}
                      >
                        {district === "all" ? "Все" : district}
                      </Text>
                    </TouchableOpacity>
                  )}
                />

                <Text style={styles.addModalFilterLabel}>Цена</Text>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={[
                    { label: "Все", value: "all" },
                    { label: "0-10k", value: "0-10000" },
                    { label: "10k-50k", value: "10000-50000" },
                    { label: "50k+", value: "50000+" },
                  ]}
                  keyExtractor={(item) => item.value}
                  renderItem={({ item: option }) => (
                    <TouchableOpacity
                      style={[
                        styles.filterButtonBase,
                        costRange === option.value
                          ? styles.addModalPriceButtonActive
                          : styles.addModalPriceButton,
                      ]}
                      onPress={() => setCostRange(option.value)}
                      accessible
                      accessibilityLabel={`Фильтр по цене ${option.label}`}
                    >

                      
                      <Text
                        style={[
                        styles.filterButtonBase,
                        costRange === option.value ?
                          styles.addModalPriceButtonActive : styles.addModalPriceButton,
                      ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}
          />

          <FlatList
            data={filteredDataMemo}
            renderItem={renderAddItem}
            keyExtractor={(item) => `${item.type}-${item.id}`}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.addModalItemList}
            ListEmptyComponent={
              <Text style={styles.addModalEmptyText}>Ничего не найдено</Text>
            }
            style={styles.addModalScrollView}
            nestedScrollEnabled
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
};



const SelectedItem = ({
  item,
  quantities,
  setQuantities,
  filteredData,
  setFilteredData,
  budget,
  setRemainingBudget,
  handleRemoveItem,
  setDetailsModalVisible,
  setSelectedItem,
  onClose,
  guestCount,
  setGuestCount,
}) => {
  const itemKey = `${item.type}-${item.id}`;
  const [inputQuantity, setInputQuantity] = useState(
    quantities[itemKey] || "1"
  );
  const [inputGuestCount, setInputGuestCount] = useState(
    guestCount?.toString() || "1"
  );
  const isSelected = !!quantities[itemKey];

  useEffect(() => {
    setInputQuantity(quantities[itemKey] || "1");
  }, [quantities, itemKey]);

  useEffect(() => {
    if (item.type === "restaurant" || item.type === "hotels") {
      setInputGuestCount(guestCount?.toString() || "1");
    }
  }, [guestCount, item.type]);

  const cost = item.type === "restaurant" ? item.averageCost : item.cost;
  const parsedGuestCountForVenue = parseInt(inputGuestCount, 10) || 1;
  const parsedQuantityGeneral = parseInt(inputQuantity, 10) || 1;

  const totalCost =
    item.type === "restaurant" || item.type === "hotels"
      ? cost * parsedGuestCountForVenue
      : cost * parsedQuantityGeneral;

  const syncItemQuantity = (value) => {
    let newQuantityStr = value === "" || value === "0" ? "1" : value;
    newQuantityStr = newQuantityStr.replace(/[^0-9]/g, "");
    if (newQuantityStr === "") newQuantityStr = "1";

    setInputQuantity(newQuantityStr);

    setQuantities((prevQuantities) => {
      const updatedQuantities = { ...prevQuantities, [itemKey]: newQuantityStr };

      const totalSpent = filteredData.reduce((sum, dataItem) => {
        const key = `${dataItem.type}-${dataItem.id}`;
        const itemCost = dataItem.type === "restaurant" ? dataItem.averageCost : dataItem.cost;
        let effectiveCount;
        if (dataItem.type === "restaurant" || dataItem.type === "hotels") {
          effectiveCount = parseInt(guestCount, 10) || 1;
        } else {
          effectiveCount = parseInt(updatedQuantities[key], 10) || 1;
        }
        return sum + (itemCost * effectiveCount);
      }, 0);
      setRemainingBudget(parseFloat(budget) - totalSpent);

      const updatedFilteredData = filteredData.map((dItem) => {
        if (`${dItem.type}-${dItem.id}` === itemKey) {
          return { ...dItem, totalCost: cost * (parseInt(newQuantityStr, 10) || 1) };
        }
        return dItem;
      });
      setFilteredData(updatedFilteredData);

      return updatedQuantities;
    });
  };

  const syncVenueGuestCount = (value) => {
    let newGuestCountStr = value === "" || value === "0" ? "1" : value;
    newGuestCountStr = newGuestCountStr.replace(/[^0-9]/g, "");
    if (newGuestCountStr === "") newGuestCountStr = "1";

    let guestCountNum = parseInt(newGuestCountStr, 10) || 1;

    if ((item.type === "restaurant" || item.type === "hotels") && guestCountNum > item.capacity) {
      guestCountNum = item.capacity;
      alert(`Максимальная вместимость ${item.type === "restaurant" ? "ресторана" : "гостиницы"}: ${item.capacity} гостей.`);
    }
    newGuestCountStr = guestCountNum.toString();

    setInputGuestCount(newGuestCountStr);
    if (setGuestCount) {
      setGuestCount(guestCountNum);
    }

    setFilteredData((prevData) => {
      const updatedData = prevData.map((dataItem) => {
        if (dataItem.type === "restaurant" || dataItem.type === "hotels") {
          const itemCost = dataItem.type === "restaurant" ? dataItem.averageCost : dataItem.cost;
          return { ...dataItem, totalCost: itemCost * guestCountNum };
        }
        return dataItem;
      });

      const totalSpent = updatedData.reduce((sum, dataItem) => {
        const key = `${dataItem.type}-${dataItem.id}`;
        const itemCostVal = dataItem.type === "restaurant" ? dataItem.averageCost : dataItem.cost;
        let effectiveCount;
        if (dataItem.type === "restaurant" || dataItem.type === "hotels") {
          effectiveCount = guestCountNum;
        } else {
          effectiveCount = parseInt(quantities[key], 10) || 1;
        }
        return sum + itemCostVal * effectiveCount;
      }, 0);
      setRemainingBudget(parseFloat(budget) - totalSpent);

      return updatedData;
    });
  };

  const handleQuantityChange = (value) => {
    const filteredValue = value.replace(/[^0-9]/g, "");
    setInputQuantity(filteredValue);
  };

  const handleQuantityBlur = () => {
    syncItemQuantity(inputQuantity);
  };

  const incrementQuantity = () => {
    const currentQuantity = parseInt(inputQuantity, 10) || 0;
    syncItemQuantity((currentQuantity + 1).toString());
  };

  const decrementQuantity = () => {
    const currentQuantity = parseInt(inputQuantity, 10) || 1;
    if (currentQuantity > 1) {
      syncItemQuantity((currentQuantity - 1).toString());
    }
  };

  const handleGuestCountChange = (value) => {
    const filteredValue = value.replace(/[^0-9]/g, "");
    setInputGuestCount(filteredValue);
  };

  const handleGuestCountBlur = () => {
    syncVenueGuestCount(inputGuestCount);
  };

  const incrementGuestCount = () => {
    const currentGuestCount = parseInt(inputGuestCount, 10) || 0;
    syncVenueGuestCount((currentGuestCount + 1).toString());
  };

  const decrementGuestCount = () => {
    const currentGuestCount = parseInt(inputGuestCount, 10) || 1;
    if (currentGuestCount > 1) {
      syncVenueGuestCount((currentGuestCount - 1).toString());
    }
  };

  let title;
  switch (item.type) {
    case "restaurant":
      title = `${item.name} (${cost} ₸/гость, Вместимость: ${item.capacity})`;
      break;
    case "hotels":
      title = `${item.name} (${cost} ₸/гость, Вместимость: ${item.capacity})`;
      break;
    case "tamada":
      title = `${item.name} (${cost} ₸)`;
      break;
    case "program":
      title = `${item.teamName} (${cost} ₸)`;
      break;
    case "flowers":
      title = `${item.salonName} - ${item.flowerName} (${cost} ₸)`;
      break;
    case "transport":
      title = `${item.salonName} - ${item.carName} (${cost} ₸)`;
      break;
    case "cake":
      title = `${item.name} (${cost} ₸)`;
      break;
    case "alcohol":
      title = `${item.salonName} - ${item.alcoholName} (${cost} ₸)`;
      break;
    case "jewelry":
      title = `${item.storeName} - ${item.itemName} (${cost} ₸)`;
      break;
    case "traditional-gifts":
      title = `${item.salonName} - ${item.itemName} (${cost} ₸)`;
      break;
    default:
      title = "Неизвестный элемент";
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.titleText} numberOfLines={2} ellipsizeMode="tail">
          {title}
        </Text>
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              handleRemoveItem(item);
            }}
            accessible
            accessibilityLabel={`Удалить ${title}`}
          >
            <Icon2 name="trash-can-outline" size={22} color={MODAL_COLORS.icon} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedItem(item);
              setDetailsModalVisible(true);
              if (onClose) onClose();
            }}
            accessible
            accessibilityLabel={`Посмотреть детали ${title}`}
          >
            <Icon2 name="magnify" size={24} color={MODAL_COLORS.icon} />
          </TouchableOpacity>
        </View>
      </View>

      {isSelected && (
        <>
          {(item.type === "restaurant" || item.type === "hotels") ? (
            <View style={styles.controlRow}>
              <Text style={styles.label}>Гостей</Text>
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={decrementGuestCount}
                  accessible
                  accessibilityLabel="Уменьшить количество гостей"
                >
                  <Icon2 name="minus" size={18} color={MODAL_COLORS.icon} />
                </TouchableOpacity>
                <TextInput
                  style={styles.input}
                  value={inputGuestCount}
                  onChangeText={handleGuestCountChange}
                  onBlur={handleGuestCountBlur}
                  keyboardType="numeric"
                  placeholder="1"
                  placeholderTextColor={MODAL_COLORS.textSecondary}
                  textAlign="center"
                  accessible
                  accessibilityLabel="Количество гостей"
                />
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={incrementGuestCount}
                  accessible
                  accessibilityLabel="Увеличить количество гостей"
                >
                  <Icon2 name="plus" size={18} color={MODAL_COLORS.icon} />
                </TouchableOpacity>
              </View>
              <Text style={styles.totalCost}>
                {totalCost.toLocaleString()} ₸
              </Text>
            </View>
          ) : (
            <View style={styles.controlRow}>
              <Text style={styles.label}>Количество</Text>
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={decrementQuantity}
                  accessible
                  accessibilityLabel="Уменьшить количество"
                >
                  <Icon2 name="minus" size={18} color={MODAL_COLORS.icon} />
                </TouchableOpacity>
                <TextInput
                  style={styles.input}
                  value={inputQuantity}
                  onChangeText={handleQuantityChange}
                  onBlur={handleQuantityBlur}
                  keyboardType="numeric"
                  placeholder="1"
                  placeholderTextColor={MODAL_COLORS.textSecondary}
                  textAlign="center"
                  accessible
                  accessibilityLabel="Количество элементов"
                />
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={incrementQuantity}
                  accessible
                  accessibilityLabel="Увеличить количество"
                >
                  <Icon2 name="plus" size={18} color={MODAL_COLORS.icon} />
                </TouchableOpacity>
              </View>
              <Text style={styles.totalCost}>
                {totalCost.toLocaleString()} ₸
              </Text>
            </View>
          )}
        </>
      )}
    </View>
  );
};

const CategoryItemsModal = ({
  visible,
  onClose,
  categoryItems,
  categoryLabel,
  categoryType,
  filteredData,
  handleAddItem,
  handleRemoveItem,
  setDetailsModalVisible,
  setSelectedItem,
  quantities,
  setQuantities,
  budget,
  setFilteredData,
  setRemainingBudget,
  updateCategories,
  guestCount,
  setGuestCount,
}) => {
  const selectedItemsForThisCategory = filteredData
    .filter((item) => item.type === categoryType)
    .sort((a, b) => (typeOrder[a.type] || 13) - (typeOrder[b.type] || 13));

  const availableItemsForThisCategory = categoryItems
    .filter(
      (catItem) =>
        !selectedItemsForThisCategory.some(
          (selItem) => selItem.id === catItem.id && selItem.type === catItem.type
        )
    )
    .sort((a, b) => (typeOrder[a.type] || 13) - (typeOrder[b.type] || 13));

  const renderAvailableItem = useCallback(
    ({ item }) => {
      if (!item || !item.type || !item.id) {
        console.warn("Некорректный элемент в renderAvailableItem:", item);
        return null;
      }
      const cost = item.type === "restaurant" ? item.averageCost : item.cost;
      let title;
      switch (item.type) {
        case "restaurant":
          title = `${item.name} (${cost} ₸)`;
          break;
        case "hotels":
          title = `${item.name} (${cost} ₸)`;
          break;
        case "tamada":
          title = `${item.name} (${cost} ₸)`;
          break;
        case "program":
          title = `${item.teamName} (${cost} ₸)`;
          break;
        case "flowers":
          title = `${item.salonName} - ${item.flowerName} (${cost} ₸)`;
          break;
        case "transport":
          title = `${item.salonName} - ${item.carName} (${cost} ₸)`;
          break;
        case "cake":
          title = `${item.name} (${cost} ₸)`;
          break;
        case "alcohol":
          title = `${item.salonName} - ${item.alcoholName} (${cost} ₸)`;
          break;
        case "jewelry":
          title = `${item.storeName} - ${item.itemName} (${cost} ₸)`;
          break;
        case "traditional-gifts":
          title = `${item.salonName} - ${item.itemName} (${cost} ₸)`;
          break;
        default:
          title = "Неизвестный элемент";
      }
      return (
        <View style={styles.addModalItemCard}>
          <TouchableOpacity
            style={styles.addModalItemContent}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              if ((item.type === "restaurant" || item.type === "hotels") && guestCount) {
                const totalGuests = parseInt(guestCount, 10);
                if (totalGuests > item.capacity) {
                  alert(
                    `Этот ${item.type === "restaurant" ? "ресторан" : "гостиница"} не может вместить ${totalGuests} гостей. Максимальная вместимость: ${item.capacity}.`
                  );
                  return;
                }
              }
              handleAddItem(item);
              const category = typeToCategoryMap[item.type];
              if (category) {
                updateCategories(category);
              }
            }}
            accessible
            accessibilityLabel={`Добавить ${title}`}
          >
            <Icon2
              name="plus-circle-outline"
              size={22}
              color={MODAL_COLORS.icon}
              style={{ marginRight: 10 }}
            />
            <Text
              style={styles.addModalItemText}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {title}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.detailsIconButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedItem(item);
               onClose();
              setDetailsModalVisible(true);
            }}
            accessible
            accessibilityLabel="Посмотреть детали"
          >
            <Icon2 name="magnify" size={24} color={MODAL_COLORS.icon} padding='l-1' />
          </TouchableOpacity>
        </View>
      );
    },
    [
      handleAddItem,
      setDetailsModalVisible,
      setSelectedItem,
      updateCategories,
      guestCount,
    ]
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalOverlay}>
        <View style={styles.addModalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{categoryLabel}</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={onClose}
              accessible
              accessibilityLabel="Закрыть модальное окно"
            >
              <Icon name="close" size={28} color={MODAL_COLORS.closeButtonColor} />
            </TouchableOpacity>
          </View>

          <FlatList
            contentContainerStyle={styles.addModalItemList}
            data={[{ key: 'categoryItems' }]}
            keyExtractor={(item) => item.key}
            renderItem={() => (
              <>
                {selectedItemsForThisCategory.length > 0 && (
                  <View style={styles.selectedItemContainer}>
                    <Text style={styles.categoryHeader}>
                      Выбранные ({selectedItemsForThisCategory.length}):
                    </Text>
                    <FlatList
                      data={selectedItemsForThisCategory}
                      keyExtractor={(item) => `${item.type}-${item.id}`}
                      renderItem={({item}) => (
                        <SelectedItem
                          item={item}
                          quantities={quantities}
                          setQuantities={setQuantities}
                          filteredData={filteredData}
                          setFilteredData={setFilteredData}
                          budget={budget}
                          setRemainingBudget={setRemainingBudget}
                        handleRemoveItem={handleRemoveItem}
                        setDetailsModalVisible={setDetailsModalVisible}
                        setSelectedItem={setSelectedItem}
                        onClose={onClose}
                        guestCount={guestCount}
                        setGuestCount={setGuestCount}
                      />
                    )}
                    />
                  </View>
                )}

                {availableItemsForThisCategory.length > 0 && (
                  <View>
                    <Text style={styles.categoryHeader}>
                      Доступные ({availableItemsForThisCategory.length}):
                    </Text>
                    <FlatList
                      data={availableItemsForThisCategory}
                      keyExtractor={(item) => `${item.type}-${item.id}`}
                      renderItem={renderAvailableItem}
                    />
                  </View>
                )}

                {selectedItemsForThisCategory.length === 0 &&
                  availableItemsForThisCategory.length === 0 && (
                    <Text style={styles.addModalEmptyText}>
                      Нет элементов для этой категории
                    </Text>
                  )}
              </>
            )}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const AddCategoryModal = ({ visible, onClose, onAddCategory }) => {
  const [newCategoryName, setNewCategoryName] = useState("");

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      alert("Пожалуйста, введите название категории");
      return;
    }
    onAddCategory(newCategoryName.trim());
    setNewCategoryName("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalOverlay}>
        <View style={styles.addModalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Добавить категорию</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={onClose}
              accessible
              accessibilityLabel="Закрыть модальное окно"
            >
              <Icon name="close" size={24} color={MODAL_COLORS.closeButtonColor} />
            </TouchableOpacity>
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Название категории</Text>
            <TextInput
              style={styles.input}
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              placeholder="Введите название категории..."
              placeholderTextColor={MODAL_COLORS.textSecondary}
              accessible
              accessibilityLabel="Название новой категории"
            />
          </View>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleAddCategory}
            accessible
            accessibilityLabel="Добавить категорию"
          >
            <LinearGradient
              colors={[COLORS.buttonGradientStart, COLORS.buttonGradientEnd]}
              style={styles.submitButtonGradient}
            >
              <Text style={styles.submitButtonText}>Добавить</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};




const CreateTraditionalFamilyEventScreen = ({ navigation, route }) => {
  const defaultCategories = [
    "Ресторан",
    "Гостиницы",
    "Ведущий",
    "Шоу программы",
    "Цветы",
    "Прокат авто",
    "Торты",
    "Алкоголь",
    "Ювелирные изделия",
    "Традиционные подарки",
    "Национальные костюмы",
    "Музыканты",
    "Фотографы",
    "Видеографы",
    "Декор"
  ];
 
console.log('route.params:', route?.params);
const selectedCategories = route?.params?.selectedCategories || [];
console.log('Полученные категории:', selectedCategories);
  // const [categories, setCategories] = useState(() => {
  //   const initialCategories = route?.params?.selectedCategories || [];
  //   if (!initialCategories.includes('Ювелирные изделия')) {
  //     return [...initialCategories, 'Ювелирные изделия'];
  //   }
  //   return initialCategories;
  // });

  const [categories, setCategories] = useState(
  route?.params?.selectedCategories || []
);


  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);


  const [disabledCategories, setDisabledCategories] = useState([]);
  const [data, setData] = useState({
    restaurants: [],
    hotels: [],
    tamada: [],
    programs: [],
    flowers: [],
    transport: [],
    cakes: [],
    alcohol: [],
    jewelry: [],
    typographies: [],
    "technical-equipment-rentals": [],
    "traditional-gifts": [],
    "event-categories": [],
  });
  const [filteredData, setFilteredData] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [budget, setBudget] = useState("");
  const [guestCount, setGuestCount] = useState("");
  const [remainingBudget, setRemainingBudget] = useState(0);
  const [loading, setLoading] = useState(false);
  const [addItemModalVisible, setAddItemModalVisible] = useState(false);
  const [addCategoryModalVisible, setAddCategoryModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [selectedCategoryItems, setSelectedCategoryItems] = useState([]);
  const [selectedCategoryLabel, setSelectedCategoryLabel] = useState("");
  const [selectedCategoryType, setSelectedCategoryType] = useState("");
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [shouldFilter, setShouldFilter] = useState(false);
  const [blockedDays, setBlockedDays] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [eventDetailsModalVisible, setEventDetailsModalVisible] = useState(false);

  const updateCategories = useCallback(
    (newCategory) => {
      setCategories((prevCategories) => {
        if (!prevCategories.includes(newCategory)) {
          return [...prevCategories, newCategory];
        }
        return prevCategories;
      });
    },
    []
  );

  const combinedData = useMemo(() => {
    const result = [];
    typesMapping.forEach(({ key, type }) => {
      if (data[key]) {
        result.push(...data[key].map(item => ({ ...item, type })));
      }
    });
    return result.sort((a, b) => (typeOrder[a.type] || 13) - (typeOrder[b.type] || 13));
  }, [data]);

  // Fetch data and other useEffect hooks remain unchanged
  const fetchData = async () => {
    if (!token || !user?.id) return;
    setLoading(true);
    try {
      const responses = await Promise.all([
        api.getRestaurants().catch((err) => {
          console.error("Ошибка получения ресторанов:", err);
          return { data: [] };
        }),
        api.getHotels().catch((err) => {
          console.error("Ошибка получения гостиниц:", err);
          return { data: [] };
        }),
        api.getTamada().catch((err) => {
          console.error("Ошибка получения ведущих:", err);
          return { data: [] };
        }),
        api.getPrograms().catch((err) => {
          console.error("Ошибка получения программ:", err);
          return { data: [] };
        }),
        api.getFlowers().catch((err) => {
          console.error("Ошибка получения цветов:", err);
          return { data: [] };
        }),
        api.getTransport().catch((err) => {
          console.error("Ошибка получения транспорта:", err);
          return { data: [] };
        }),
        api.getCakes().catch((err) => {
          console.error("Ошибка получения тортов:", err);
          return { data: [] };
        }),
        api.getAlcohol().catch((err) => {
          console.error("Ошибка получения алкоголя:", err);
          return { data: [] };
        }),
        api.getJewelry().catch((err) => {
          console.error("Ошибка получения ювелирных изделий:", err);
          return { data: [] };
        }),
        api.getTypographies().catch((err) => {
          console.error("Ошибка получения типографий:", err);
          return { data: [] };
        }),
        api.getTechnicalEquipmentRentals().catch((err) => {
          console.error("Ошибка получения аренды технического оснащения:", err);
          return { data: [] };
        }),
        api.getTraditionalGifts().catch((err) => {
          console.error("Ошибка получения традиционных подарков:", err);
          return { data: [] };
        }),
        api.getEventCategories().catch((err) => {
          console.error("Ошибка получения категорий мероприятий:", err);
          return { data: [] };
        }),
      ]);
      const [
        restaurants,
        hotels,
        tamada,
        programs,
        flowers,
        transport,
        cakes,
        alcohol,
        jewelry,
        typographies,
        technicalEquipmentRentals,
        traditionalGifts,
        eventCategories,
      ] = responses.map((res) => res.data);
      setData({
        restaurants,
        hotels,
        tamada,
        programs,
        flowers,
        transport,
        cakes,
        alcohol,
        jewelry,
        typographies,
        "technical-equipment-rentals": technicalEquipmentRentals,
        "traditional-gifts": traditionalGifts,
        "event-categories": eventCategories,
      });
      if (hotels.length === 0) {
        console.warn("Гостиницы не загружены: пустой ответ от /api/hotels");
      }
    } catch (error) {
      console.error("Общая ошибка загрузки данных:", error);
      alert("Ошибка загрузки данных. Попробуйте снова.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) navigation.navigate("Login");
    else fetchData();
  }, [token, user, navigation]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", fetchData);
    return unsubscribe;
  }, [navigation]);

  const formatBudget = (input) => {
    const cleaned = input.replace(/[^\d]/g, "");
    return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  const handleBudgetChange = (value) => {
    const filteredValue = value.replace(/[^\d]/g, "");
    setBudget(filteredValue);
    setShouldFilter(true);
  };

  const handleGuestCountChange = (value) => {
    const filteredValue = value.replace(/[^0-9]/g, "");
    setGuestCount(filteredValue);
    setShouldFilter(true);
    setFilteredData((prevData) => {
      let newTotalSpent = 0;
      const updatedData = prevData.map((item) => {
        let itemTotalCost = item.totalCost;
        let itemEffectiveQuantity =
          item.type === "restaurant" || item.type === "hotels"
            ? parseInt(filteredValue, 10) || 1
            : parseInt(quantities[`${item.type}-${item.id}`], 10) || 1;
        const itemCost = item.type === "restaurant" ? item.averageCost : item.cost;

        if (item.type === "restaurant" || item.type === "hotels") {
          if (item.capacity && (parseInt(filteredValue, 10) || 1) > item.capacity) {
            alert(
              `${item.type === "restaurant" ? "Ресторан" : "Гостиница"} ${
                item.name
              } вмещает максимум ${item.capacity} гостей.`
            );
            itemEffectiveQuantity = item.capacity;
          }
          itemTotalCost = itemCost * itemEffectiveQuantity;
        }
        newTotalSpent += itemTotalCost;
        return { ...item, totalCost: itemTotalCost };
      });
      setRemainingBudget(parseFloat(budget) - newTotalSpent);
      return updatedData;
    });
  };

  const filterDataByBudget = useDebounce(() => {
    if (!budget || isNaN(budget) || parseFloat(budget) <= 0) {
      alert("Пожалуйста, введите корректную сумму бюджета");
      setIsLoading(false);
      return;
    }
    if (!guestCount || isNaN(guestCount) || parseFloat(guestCount) <= 0) {
      alert("Пожалуйста, введите корректное количество гостей");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const budgetValue = parseFloat(budget);
    const guests = parseInt(guestCount, 10);
    let remaining = budgetValue;
    const newSelectedItems = [];
    const newQuantities = {};

    const activeCategories = categories.filter(
      (cat) => !disabledCategories.includes(cat)
    );
    const allowedTypes = activeCategories
      .map((cat) => categoryToTypeMap[cat])
      .filter(Boolean);

    const typesToProcess = typesMapping.filter(({ type }) =>
      allowedTypes.includes(type)
    );

    for (const { key, costField, type, label } of typesToProcess) {
      let itemsForType = data[key] || [];
      if (itemsForType.length === 0) {
        console.log(`Нет данных для категории ${label}`);
        continue;
      }

      if (type === "restaurant" || type === "hotels") {
        itemsForType = itemsForType.filter((r) => parseFloat(r.capacity) >= guests);
        if (itemsForType.length === 0) {
          console.log(
            `Нет ${type === "restaurant" ? "ресторанов" : "гостиниц"} для ${guests} гостей в категории ${label}`
          );
          continue;
        }

        const suitableVenues = itemsForType
          .filter((item) => parseFloat(item[costField]) * guests <= remaining)
          .sort((a, b) => parseFloat(a[costField]) - parseFloat(b[costField]));

        if (suitableVenues.length > 0) {
          const middleIndex = Math.floor(suitableVenues.length / 2);
          const selectedVenue = suitableVenues[middleIndex];
          const itemCost = parseFloat(selectedVenue[costField]) * guests;
          
          newSelectedItems.push({ ...selectedVenue, type, totalCost: itemCost });
          newQuantities[`${type}-${selectedVenue.id}`] = guests.toString();
          remaining -= itemCost;
        } else {
          console.log(
            `${
              type === "restaurant" ? "Рестораны" : "Гостиницы"
            } в категории ${label} не вписываются в остаток бюджета ${remaining}`
          );
        }
      } else {
        const suitableItems = itemsForType
          .filter((item) => parseFloat(item[costField]) <= remaining)
          .sort((a, b) => parseFloat(a[costField]) - parseFloat(b[costField]));

        if (suitableItems.length > 0) {
          const middleIndex = Math.floor(suitableItems.length / 2);
          const selectedItem = suitableItems[middleIndex];
          const itemCost = parseFloat(selectedItem[costField]);
          
          newSelectedItems.push({ ...selectedItem, type, totalCost: itemCost });
          newQuantities[`${type}-${selectedItem.id}`] = "1";
          remaining -= itemCost;
        } else {
          console.log(
            `Элементы в категории ${label} не вписываются в остаток бюджета ${remaining}`
          );
        }
      }
    }

    if (newSelectedItems.length === 0 && activeCategories.length > 0) {
      alert(
        "Нет элементов, подходящих под ваш бюджет и количество гостей из выбранных категорий."
      );
    }

    newSelectedItems.sort(
      (a, b) => (typeOrder[a.type] || 13) - (typeOrder[b.type] || 13)
    );
    setFilteredData(newSelectedItems);
    setQuantities(newQuantities);
    setRemainingBudget(remaining);
    setIsLoading(false);
  }, 150);

  useEffect(() => {
    if (
      shouldFilter &&
      budget &&
      guestCount &&
      !isNaN(parseFloat(budget)) &&
      !isNaN(parseFloat(guestCount))
    ) {
      filterDataByBudget();
      setShouldFilter(false);
    }
  }, [budget, guestCount, shouldFilter, filterDataByBudget]);

  const handleAddItem = useCallback(
    (itemToAdd) => {
      const itemKey = `${itemToAdd.type}-${itemToAdd.id}`;
      const cost = itemToAdd.type === "restaurant" ? itemToAdd.averageCost : itemToAdd.cost;

      if (itemToAdd.type === "restaurant" || itemToAdd.type === "hotels") {
        if (!guestCount || parseInt(guestCount, 10) <= 0) {
          alert(
            `Пожалуйста, укажите количество гостей перед добавлением ${
              itemToAdd.type === "restaurant" ? "ресторана" : "гостиницы"
            }.`
          );
          return;
        }
        if (parseInt(guestCount, 10) > itemToAdd.capacity) {
          alert(
            `Этот ${
              itemToAdd.type === "restaurant" ? "ресторан" : "гостиница"
            } не может вместить ${guestCount} гостей. Максимальная вместимость: ${
              itemToAdd.capacity
            }.`
          );
          return;
        }
        setFilteredData((prev) =>
          prev.filter(
            (i) =>
              (i.type !== "restaurant" && i.type !== "hotels") ||
              i.id === itemToAdd.id
          )
        );
      }

      setFilteredData((prevSelected) => {
        const existingItem = prevSelected.find(
          (i) => `${i.type}-${i.id}` === itemKey
        );
        let updatedSelectedItems;
        let newQuantity = "1";

        if (existingItem && itemToAdd.type !== "restaurant" && itemToAdd.type !== "hotels") {
          newQuantity = (parseInt(quantities[itemKey] || "1") + 1).toString();
          updatedSelectedItems = prevSelected.map((i) =>
            i.id === itemToAdd.id && i.type === itemToAdd.type
              ? { ...i, totalCost: cost * parseInt(newQuantity) }
              : i
          );
        } else if (!existingItem) {
          const effectiveQuantity =
            itemToAdd.type === "restaurant" || itemToAdd.type === "hotels"
              ? parseInt(guestCount, 10) || 1
              : 1;
          const totalItemCost = cost * effectiveQuantity;
          const newItem = { ...itemToAdd, totalCost: totalItemCost };
          if (itemToAdd.type === "restaurant" || itemToAdd.type === "hotels") {
            updatedSelectedItems = [
              ...prevSelected.filter(
                (i) => i.type !== "restaurant" && i.type !== "hotels"
              ),
              newItem,
            ];
          } else {
            updatedSelectedItems = [...prevSelected, newItem];
          }
        } else {
          updatedSelectedItems = prevSelected;
        }

        setQuantities((prevQtys) => {
          const updatedQtys = {
            ...prevQtys,
            [itemKey]:
              itemToAdd.type === "restaurant" || itemToAdd.type === "hotels"
                ? guestCount || "1"
                : newQuantity,
          };

          const totalSpent = updatedSelectedItems.reduce((sum, selItem) => {
            const qtyKey = `${selItem.type}-${selItem.id}`;
            const itemQty =
              selItem.type === "restaurant" || selItem.type === "hotels"
                ? parseInt(guestCount, 10) || 1
                : parseInt(updatedQtys[qtyKey] || "1", 10);
            const itemCostVal = selItem.type === "restaurant" ? selItem.averageCost : selItem.cost;
            return sum + itemCostVal * itemQty;
          }, 0);

          setRemainingBudget(parseFloat(budget) - totalSpent);
          return updatedQtys;
        });

        return updatedSelectedItems.sort(
          (a, b) => (typeOrder[a.type] || 13) - (typeOrder[b.type] || 13)
        );
      });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      if (categoryModalVisible) setCategoryModalVisible(false);
    },
    [budget, guestCount, quantities, categoryModalVisible]
  );

  const handleRemoveItem = useCallback(
    (itemToRemove) => {
      const itemKey = `${itemToRemove.type}-${itemToRemove.id}`;
      setFilteredData((prevSelected) => {
        const updatedSelected = prevSelected.filter(
          (item) => `${item.type}-${item.id}` !== itemKey
        );
        setQuantities((prevQtys) => {
          const { [itemKey]: _, ...rest } = prevQtys;
          const totalSpent = updatedSelected.reduce((sum, selItem) => {
            const qtyKey = `${selItem.type}-${selItem.id}`;
            const itemQty =
              selItem.type === "restaurant" || selItem.type === "hotels"
                ? parseInt(guestCount, 10) || 1
                : parseInt(rest[qtyKey] || "1", 10);
            const itemCostVal = selItem.type === "restaurant" ? selItem.averageCost : selItem.cost;
            return sum + itemCostVal * itemQty;
          }, 0);
          setRemainingBudget(parseFloat(budget) - totalSpent);
          return rest;
        });
        return updatedSelected;
      });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    },
    [budget, guestCount]
  );

  const fetchAllBlockedDays = useCallback(async () => {
    try {
      const [blockedDaysResponse, restaurantsResponse] = await Promise.all([
        api.fetchAllBlockedDays(),
        api.getRestaurants()
      ]);

      const allRestaurants = restaurantsResponse.data || [];
      const totalRestaurants = allRestaurants.length;
      
      const bookingsByDate = {};
      blockedDaysResponse.data.forEach((entry) => {
        const { date } = entry;
        if (!bookingsByDate[date]) {
          bookingsByDate[date] = new Set();
        }
        bookingsByDate[date].add(entry.restaurantId);
      });

      const blockedDaysData = {};
      blockedDaysResponse.data.forEach((entry) => {
        const { date, restaurantId, restaurantName } = entry;
        if (!blockedDaysData[date]) {
          const isFullyBooked = totalRestaurants > 0 && bookingsByDate[date] && bookingsByDate[date].size >= totalRestaurants;
          blockedDaysData[date] = {
            marked: true,
            dots: [],
            disabled: isFullyBooked,
            disableTouchEvent: isFullyBooked,
            customStyles: {
              container: {
                backgroundColor: isFullyBooked ? '#f2a0a0' : MODAL_COLORS.inactiveFilter,
                borderRadius: 5,
                opacity: 0.7,
              },
              text: {
                color: MODAL_COLORS.textSecondary,
                textDecorationLine: isFullyBooked ? 'line-through' : 'none',
              },
            },
          };
        }
        blockedDaysData[date].dots.push({ key: restaurantId.toString(), restaurantId, restaurantName, color: 'red' });
      });

      setBlockedDays(blockedDaysData);
      console.log('Processed blockedDaysData:', blockedDaysData);
    } catch (error) {
      console.error("Ошибка загрузки заблокированных дней:", error.message);
    }
  }, []);

  useEffect(() => {
    if (token && user?.id) {
      fetchAllBlockedDays();
    }
    const unsubscribe = navigation.addListener('focus', fetchAllBlockedDays);
    return unsubscribe;
  }, [token, user, navigation, fetchAllBlockedDays]);


  const calculateTotalCost = useMemo(() => {
    return filteredData.reduce((sum, item) => {
      const quantity = parseInt(quantities[`${item.type}-${item.id}`] || "1");
      const cost = item.type === "restaurant" ? item.averageCost : item.cost;
      const effectiveQuantity =
        item.type === "restaurant" || item.type === "hotels"
          ? parseInt(guestCount, 10) || 1
          : quantity;
      return sum + cost * effectiveQuantity;
    }, 0);
  }, [filteredData, quantities, guestCount]);

  const handleAddCategory = async (categoryName) => {
    if (!token) {
      alert("Требуется авторизация для добавления категории");
      return;
    }

    try {
      const response = await api.createEventCategory({ name: categoryName }, token);
      const newCategory = response.data;
      const newCategoryType = categoryName.toLowerCase().replace(/\s+/g, '-');
      setCategories((prev) => [...prev, newCategory.name]);
      setData((prevData) => ({
        ...prevData,
        "event-categories": [...prevData["event-categories"], newCategory],
      }));
      categoryToTypeMap[newCategory.name] = newCategoryType;
      typeToCategoryMap[newCategoryType] = newCategory.name;
      typesMapping.push({
        key: `event-categories-${newCategoryType}`,
        costField: "cost",
        type: newCategoryType,
        label: newCategory.name,
      });
      typeOrder[newCategoryType] = Object.keys(typeOrder).length + 1;
      alert(`Категория "${newCategory.name}" успешно добавлена`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Ошибка при создании категории:", error);
      alert("Ошибка: " + (error.response?.data?.error || error.message));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };


      const handleSubmit = async () => {
  // Валидация полей
  if (!eventName.trim()) {
    alert("Пожалуйста, укажите название мероприятия");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    return;
  }
  if (!eventDate) {
    alert("Пожалуйста, выберите дату мероприятия");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    return;
  }
  if (!budget || isNaN(budget) || parseFloat(budget) <= 0) {
    alert("Пожалуйста, укажите корректный бюджет");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    return;
  }
  if (!guestCount || isNaN(guestCount) || parseInt(guestCount, 10) <= 0) {
    alert("Пожалуйста, укажите корректное количество гостей");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    return;
  }
  if (filteredData.length === 0) {
    alert("Пожалуйста, добавьте хотя бы один элемент для мероприятия");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    return;
  }

  const dateString = eventDate.toISOString().split('T')[0];
  const dayInfo = blockedDays[dateString];
  const restaurantToBlock = filteredData.find(item => item.type === 'restaurant');

  if (dayInfo && dayInfo.disabled) {
      alert(`Дата ${dateString} полностью забронирована. Пожалуйста, выберите другую дату.`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
  }
  if (restaurantToBlock && dayInfo && dayInfo.dots) {
      const isRestaurantBooked = dayInfo.dots.some(dot => dot.restaurantId === restaurantToBlock.id);
      if (isRestaurantBooked) {
          alert(`Ресторан "${restaurantToBlock.name}" уже забронирован на ${dateString}. Пожалуйста, выберите другую дату или другой ресторан.`);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          return;
      }
  }

  setLoading(true);
  try {
    console.log('=== Начало создания мероприятия ===');
    console.log('Название:', eventName);
    console.log('Дата:', eventDate);
    console.log('Бюджет:', budget);
    console.log('Гостей:', guestCount);
    console.log('Элементов:', filteredData.length);

    // Пробуем разные варианты payload
    const payloadVariants = [
      // Вариант 1: Только название
      { name: eventName.trim() },
      // Вариант 2: С датой YYYY-MM-DD
      { name: eventName.trim(), date: eventDate.toISOString().split('T')[0] },
      // Вариант 3: С eventDate вместо date
      { name: eventName.trim(), eventDate: eventDate.toISOString().split('T')[0] },
      // Вариант 4: С description
      { name: eventName.trim(), date: eventDate.toISOString().split('T')[0], description: '' },
      // Вариант 5: С budget и guestCount
      { 
        name: eventName.trim(), 
        date: eventDate.toISOString().split('T')[0],
        budget: parseFloat(budget),
        guestCount: parseInt(guestCount, 10)
      },
    ];

    let categoryResponse = null;
    let lastError = null;

    // Пробуем каждый вариант payload
    for (let i = 0; i < payloadVariants.length; i++) {
      const payload = payloadVariants[i];
      console.log(`=== Попытка ${i + 1}/${payloadVariants.length} ===`);
      console.log('Payload:', JSON.stringify(payload, null, 2));

      try {
        categoryResponse = await api.createEventCategory(payload, token);
        console.log('✓ Успех! Категория создана:', categoryResponse.data);
        break; // Выходим из цикла при успехе
      } catch (error) {
        console.error(`✗ Попытка ${i + 1} не удалась`);
        console.error('Status:', error.response?.status || error.status);
        console.error('Message:', error.message);
        console.error('Response data:', JSON.stringify(error.response?.data || error.data, null, 2));
        lastError = error;
        
        // Если это последняя попытка, выбрасываем ошибку
        if (i === payloadVariants.length - 1) {
          throw lastError;
        }
      }
    }

    if (!categoryResponse) {
      throw lastError || new Error('Не удалось создать категорию ни одним из способов');
    }

    const categoryId = categoryResponse.data.data?.id || categoryResponse.data.id;
    if (!categoryId) {
      throw new Error('Не получен ID категории от сервера');
    }

    console.log('=== Категория успешно создана ===');
    console.log('ID категории:', categoryId);

    if (restaurantToBlock) {
        try {
            console.log(`Автоматическое бронирование даты для ресторана: ${restaurantToBlock.name}`);
            await api.addDataBlockToRestaurant(restaurantToBlock.id, eventDate);
            console.log('Дата для ресторана успешно забронирована.');
            fetchAllBlockedDays();
        } catch (bookingError) {
            console.error('Ошибка автоматического бронирования даты:', bookingError.response?.data || bookingError.message);
            alert('Мероприятие создано, но произошла ошибка при автоматическом бронировании даты для ресторана. Пожалуйста, забронируйте вручную.');
        }
    }

    const totalBudget = parseFloat(budget);
    const spentAmount = calculateTotalCost;
    const remaining = remainingBudget;

    console.log('=== Обновление бюджета категории ===');
    console.log('Total:', totalBudget, 'Spent:', spentAmount, 'Remaining:', remaining);

    // Обновляем бюджет категории
    try {
      await api.updateEventCategoryTotalCost(categoryId, { total_cost: totalBudget });
      console.log('✓ Total cost обновлен');
    } catch (error) {
      console.error('✗ Ошибка обновления total cost:', error.message);
    }

    try {
      await api.updateEventCategoryPaidAmount(categoryId, { paid_amount: spentAmount });
      console.log('✓ Paid amount обновлен');
    } catch (error) {
      console.error('✗ Ошибка обновления paid amount:', error.message);
    }

    try {
      await api.updateEventCategoryRemainingBalance(categoryId, { remaining_balance: remaining });
      console.log('✓ Remaining balance обновлен');
    } catch (error) {
      console.error('✗ Ошибка обновления remaining balance:', error.message);
    }

    console.log('=== Добавление услуг к категории ===');
    let successCount = 0;
    let errorCount = 0;

    // Добавляем услуги к категории
    for (const item of filteredData) {
      const typeMapping = typesMapping.find((mapping) => mapping.type === item.type);
      if (!typeMapping) {
        console.error(`Неизвестный тип услуги: ${item.type}`);
        errorCount++;
        continue;
      }

      // Map frontend types to backend-expected serviceType values
      const serviceTypeMap = {
        'restaurant': 'Restaurant',
        'hotels': 'Hotel',
        'tamada': 'Tamada',
        'program': 'Program',
        'flowers': 'Flowers',
        'transport': 'Transport',
        'cake': 'Cakes',
        'alcohol': 'Alcohol',
        'jewelry': 'Jewelry',
        'typography': 'Typography',
        'technical-equipment-rental': 'TechnicalEquipmentRental',
        'traditional-gifts': 'TraditionalGifts',
        'national-costumes': 'NationalCostumes',
        'musicians': 'Musician',
        'photographers': 'Photographer',
        'videographers': 'Videographer',
        'decor': 'Decor',
        'event-category': 'EventCategory',
      };

      const serviceType = serviceTypeMap[item.type] || item.type;

      const quantity =
        item.type === 'restaurant' || item.type === 'hotels'
          ? parseInt(guestCount, 10)
          : parseInt(quantities[`${item.type}-${item.id}`] || '1');

      try {
        console.log(`Добавление: ${serviceType} (ID: ${item.id}, Кол-во: ${quantity})`);
        console.log(`Payload:`, JSON.stringify({ serviceId: item.id, serviceType, quantity }, null, 2));
        await api.addServiceToCategory(
          categoryId,
          { serviceId: item.id, serviceType, quantity },
          token
        );
        console.log(`✓ ${serviceType} добавлен`);
        successCount++;
      } catch (error) {
        console.error(`✗ Ошибка добавления ${serviceType}:`, error.message);
        console.error(`Response:`, error.response?.data);
        console.error(`Status:`, error.response?.status);
        errorCount++;
        // Продолжаем добавление остальных услуг
      }
    }

    console.log('=== Итоги добавления услуг ===');
    console.log(`Успешно: ${successCount}, Ошибок: ${errorCount}`);

    console.log('=== Мероприятие успешно создано ===');
    alert(`Мероприятие успешно создано!Добавлено услуг: ${successCount}/${filteredData.length}`);
    
    // Очищаем форму
    setEventName('');
    setEventDate(new Date());
    setBudget('');
    setGuestCount('');
    setFilteredData([]);
    setQuantities({});
    setRemainingBudget(0);
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    navigation.goBack();
  } catch (error) {
    console.error('=== ОШИБКА при создании мероприятия ===');
    console.error('Тип ошибки:', error.constructor.name);
    console.error('Сообщение:', error.message);
    console.error('Response status:', error.response?.status || error.status);
    console.error('Response data:', JSON.stringify(error.response?.data || error.data, null, 2));
    console.error('Request URL:', error.config?.url);
    console.error('Stack trace:', error.stack);
    
    let errorMessage = 'Ошибка при создании мероприятия';
    
    const responseData = error.response?.data || error.data;
    if (responseData?.error) {
      errorMessage += ':' + responseData.error;
    } else if (responseData?.message) {
      errorMessage += ':' + responseData.message;
    } else if (error.message) {
      errorMessage += ':' + error.message;
    }
    
    // Добавляем подсказку
    errorMessage += '. Проверьте логи в консоли для деталей.';
    
    alert(errorMessage);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } finally {
    setLoading(false);
  }
};

  

  


  const handleCategoryPress = (category) => {
    const type = categoryToTypeMap[category];
    if (!type) return;
    // Pass all items of this type from `combinedData` (all available API items)
    const itemsForCategoryModal = combinedData.filter((item) => item.type === type);
    setSelectedCategoryItems(itemsForCategoryModal);
    setSelectedCategoryLabel(category);
    setSelectedCategoryType(type);
    setCategoryModalVisible(true);
  };


  const handleRemoveCategory = (category) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    setDisabledCategories((prev) => {
      const isCurrentlyDisabled = prev.includes(category);
      
      if (isCurrentlyDisabled) {
        // Включаем категорию (удаляем из disabledCategories)
        console.log(`Категория "${category}" включена`);
        return prev.filter((cat) => cat !== category);
      } else {
        // Отключаем категорию (добавляем в disabledCategories)
        console.log(`Категория "${category}" отключена`);
        
        // Удаляем все элементы этой категории из filteredData
        const type = categoryToTypeMap[category];
        if (type) {
          setFilteredData((prevData) => 
            prevData.filter((item) => item.type !== type)
          );
          
          // Удаляем quantities для этой категории
          setQuantities((prevQuantities) => {
            const newQuantities = { ...prevQuantities };
            Object.keys(newQuantities).forEach((key) => {
              if (key.startsWith(`${type}-`)) {
                delete newQuantities[key];
              }
            });
            return newQuantities;
          });
        }
        
        return [...prev, category];
      }
    });
  };


  const handleCloseCategoryModal = () => {
    setCategoryModalVisible(false);
    setSelectedCategoryItems([]); setSelectedCategoryLabel(""); setSelectedCategoryType("");
  };




  const renderCategories = ({ item }) => {
    if (item === "Добавить") {
      return (
        <View style={styles.categoryRow}>
          {/* <TouchableOpacity
            style={styles.categoryButtonAdd}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setAddCategoryModalVisible(true);
            }}
            accessible
            accessibilityLabel="Добавить новую категорию"
          >
            <LinearGradient
              colors={[COLORS.buttonGradientStart, COLORS.buttonGradientEnd]}
              style={styles.categoryButtonGradient}
            >
              <Text style={styles.categoryPlusText}>+</Text>
            </LinearGradient>
          </TouchableOpacity> */}

          {/* <TouchableOpacity style={styles.categoryButtonAdd} onPress={() => setAddItemModalVisible(true)}>
            <LinearGradient colors={[COLORS.buttonGradientStart, COLORS.buttonGradientEnd]} style={styles.categoryButtonGradient}>
              <Text style={styles.categoryPlusText}>+</Text>
            </LinearGradient>
          </TouchableOpacity> */}

        </View>
      );
    }

    const isDisabled = disabledCategories.includes(item);
    const type = categoryToTypeMap[item];
    const itemsForCategory = filteredData.filter((dataItem) => dataItem.type === type);

    // const isDisabled = disabledCategories.includes(item);
    
    const categoryIcons = {
      Цветы: { on: require("../../assets/cvetyOn.png"), off: require("../../assets/cvetyOff.png") },
      "Прокат авто": { on: require("../../assets/prokatAvtoOn.png"), off: require("../../assets/prokatAutooff.png") },
      "Шоу программа": { on: require("../../assets/show.png"), off: require("../../assets/showTurnOff.png") },
      Ресторан: { on: require("../../assets/restaurantOn.png"), off: require("../../assets/restaurantTurnOff.png") },
      Ведущий: { on: require("../../assets/vedushieOn.png"), off: require("../../assets/vedushieOff.png") },
      "Традиционные подарки": { on: require("../../assets/tradGiftsOn.png"), off: require("../../assets/tradGifts.png") },
      "Свадебный салон": { on: require("../../assets/svadebnyisalon.png"), off: require("../../assets/svadeblyisalonOff.png") },
      Алкоголь: { on: require("../../assets/alcoholOn.png"), off: require("../../assets/alcoholOff.png") },
      "Ювелирные изделия": { on: require("../../assets/uvizdeliyaOn.png"), off: require("../../assets/uvIzdeliyaOff.png") },
      Торты: { on: require("../../assets/torty.png"), off: require("../../assets/tortyTurnOff.png") },
    };

    const defaultIcon = require("../../assets/join.png"); // Fallback


    return (
      <View style={styles.categoryRow}>
        {/* <TouchableOpacity
          style={[
            styles.categoryButton,
            isDisabled && styles.categoryButtonDisabled,
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            handleOpenCategoryModal(item, type);
          }}
          accessible
          accessibilityLabel={`Открыть категорию ${item}`}
        >
          <LinearGradient
            colors={
              isDisabled
                ? [COLORS.textSecondary, COLORS.textSecondary]
                : [COLORS.buttonGradientStart, COLORS.buttonGradientEnd]
            }
            style={styles.categoryButtonGradient}
          >
            <Text
              style={[
                styles.categoryButtonText,
                isDisabled && styles.categoryButtonTextDisabled,
              ]}
            >
              {item} {itemsForCategory.length > 0 ? `(${itemsForCategory.length})` : ""}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.removeCategoryButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            handleRemoveCategory(item);
          }}
          accessible
          accessibilityLabel={isDisabled ? `Включить категорию ${item}` : `Отключить категорию ${item}`}
        >
          <Icon2
            name={isDisabled ? "plus-circle-outline" : "minus-circle-outline"}
            size={24}
            color={isDisabled ? COLORS.accent : COLORS.error}
          />
        </TouchableOpacity> */}



         <TouchableOpacity style={styles.removeCategoryButton} onPress={() => handleRemoveCategory(item)}>
          <Image
            source={isDisabled ? categoryIcons[item]?.on : (categoryIcons[item]?.off || defaultIcon) }
            style={{ width: 60, height: 70, resizeMode: 'contain' }}
          />

        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.categoryButton, isDisabled && styles.disabledCategoryButton]}
          onPress={() => { if (!isDisabled) handleCategoryPress(item); }}
          disabled={isDisabled}
        >
          <LinearGradient colors={[COLORS.buttonGradientStart, COLORS.buttonGradientEnd]} style={styles.categoryButtonGradient}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Icon
                name={ item === "Ресторан" ? "restaurant" : item === "Прокат авто" ? "directions-car" :
                       item === "Фото-видео съёмка" ? "camera-alt" : item === "Ведущий" ? "mic" :
                       item === "Традиционные подарки" ? "card-giftcard" : item === "Свадебный салон" ? "store" :
                       item === "Алкоголь" ? "local-drink" : item === "Ювелирные изделия" ? "diamond" :
                       item === "Торты" ? "cake" : "category"
                } size={20} color={COLORS.white} style={{ marginRight: 10 }} />
              <Text style={styles.categoryText}>{item}</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

      </View>
    );
  };

  const renderSelectedItems = ({ item }) => (
    <SelectedItem
      item={item}
      quantities={quantities}
      setQuantities={setQuantities}
      filteredData={filteredData}
      setFilteredData={setFilteredData}
      budget={budget}
      setRemainingBudget={setRemainingBudget}
      handleRemoveItem={handleRemoveItem}
      setDetailsModalVisible={setDetailsModalVisible}
      setSelectedItem={setSelectedItem}
      guestCount={guestCount}
      setGuestCount={setGuestCount}
    />
  );

            const DetailsModal = ({ visible, onClose, item }) => {
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [files, setFiles] = useState([]);
    const [loadingFiles, setLoadingFiles] = useState(true);
    
    if (!item) return null;

    console.log('=== DetailsModal opened ===');
    console.log('Item:', item);

    const BASE_URL = process.env.EXPO_PUBLIC_API_baseURL;

    // Функция для нормализации типа сервиса
    const getEndpointForServiceType = (serviceType) => {
      let normalizedServiceType = serviceType.toLowerCase();
      if (normalizedServiceType === 'flower') {
        normalizedServiceType = 'flowers';
      } else if (normalizedServiceType === 'technicalequipmentrental') {
        normalizedServiceType = 'technical-equipment-rental';
      } else {
        normalizedServiceType = normalizedServiceType.replace(/s$/, '');
      }
      return normalizedServiceType;
    };

    // Загрузка файлов из API
    useEffect(() => {
      const fetchFiles = async () => {
        if (!item || !item.type || !item.id) {
          console.log('Недостаточно данных для загрузки файлов');
          setLoadingFiles(false);
          return;
        }
        
        try {
          setLoadingFiles(true);
          const endpoint = getEndpointForServiceType(item.type);
          const response = await axios.get(`${BASE_URL}/api/${endpoint}/${item.id}/files`);
          const fetchedFiles = response.data || [];
          setFiles(fetchedFiles);
          console.log(`Загружено ${fetchedFiles.length} файлов для ${item.type} #${item.id}`);
        } catch (err) {
          console.error("Ошибка загрузки файлов:", err);
          setFiles([]);
        } finally {
          setLoadingFiles(false);
        }
      };
      
      if (visible && item) {
        fetchFiles();
      }
    }, [visible, item]);

    const getItemTitle = () => {
      if (item.type === "restaurant") return item.name;
      if (item.type === "hotels") return item.name;
      if (item.type === "tamada") return item.name;
      if (item.type === "program") return item.teamName || item.name;
      if (item.type === "flowers") return `${item.salonName || ''} - ${item.flowerName || ''}`.trim();
      if (item.type === "transport") return `${item.salonName || ''} - ${item.carName || ''}`.trim();
      if (item.type === "cake") return item.name;
      if (item.type === "alcohol") return `${item.salonName || ''} - ${item.alcoholName || ''}`.trim();
      if (item.type === "jewelry") return `${item.storeName || ''} - ${item.itemName || ''}`.trim();
      if (item.type === "traditional-gifts") return `${item.salonName || ''} - ${item.itemName || ''}`.trim();
      return item.name || "Детали";
    };

    // Получаем фотографии из загруженных файлов
    const photoFiles = files.filter(file => file.mimetype && file.mimetype.startsWith('image/'));
    const displayPhotos = photoFiles.length > 0 
      ? photoFiles.map(file => `${BASE_URL}/${file.path}`)
      : ['https://via.placeholder.com/800x400/F1EBDD/897066?text=Нет+фото'];

    const cost = item.type === 'restaurant' ? item.averageCost : item.cost;
    const displayCost = (cost !== null && cost !== undefined) ? `${cost.toLocaleString()} ₸` : 'Не указана';

    const renderField = (label, value) => {
      if (!value) return null;
      return (
        <View style={styles.fullscreenDetailField}>
          <Text style={styles.fullscreenDetailLabel}>{label.toUpperCase()}</Text>
          <Text style={styles.fullscreenDetailValue}>{value}</Text>
        </View>
      );
    };

    const handleScroll = (event) => {
      const slideSize = event.nativeEvent.layoutMeasurement.width;
      const offset = event.nativeEvent.contentOffset.x;
      const currentIndex = Math.round(offset / slideSize);
      setCurrentPhotoIndex(currentIndex);
    };

    return (
      <Modal
        visible={visible}
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.fullscreenModalContainer}>
          {/* Header with back button */}
          <View style={styles.fullscreenModalHeader}>
            <TouchableOpacity
              style={styles.fullscreenBackButton}
              onPress={onClose}
              accessible
              accessibilityLabel="Назад"
            >
              <AntDesign name="left" size={24} color="#5A4032" />
            </TouchableOpacity>
            <Text style={styles.fullscreenModalHeaderTitle}>{getItemTitle()}</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView 
            style={styles.fullscreenModalScroll}
            showsVerticalScrollIndicator={false}
          >
            {/* Photo Slider */}
            <View style={styles.photoSliderWrapper}>
              {loadingFiles ? (
                <View style={[styles.fullscreenPhoto, { justifyContent: 'center', alignItems: 'center' }]}>
                  <ActivityIndicator size="large" color="#897066" />
                  <Text style={{ marginTop: 10, color: '#897066' }}>Загрузка фотографий...</Text>
                </View>
              ) : (
                <>
                  <FlatList
                    data={displayPhotos}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                    keyExtractor={(photo, index) => `photo-${index}`}
                    renderItem={({ item: photo }) => (
                      <Image
                        source={{ uri: photo }}
                        style={styles.fullscreenPhoto}
                        resizeMode="cover"
                      />
                    )}
                  />
                  
                  {/* Photo Indicators */}
                  {displayPhotos.length > 1 && (
                    <View style={styles.photoIndicators}>
                      {displayPhotos.map((_, index) => (
                        <View
                          key={`indicator-${index}`}
                          style={[
                            styles.photoIndicator,
                            index === currentPhotoIndex && styles.photoIndicatorActive
                          ]}
                        />
                      ))}
                    </View>
                  )}
                </>
              )}
            </View>

            {/* Content Card */}
            <View style={styles.fullscreenContentCard}>
              {/* Title */}
              <Text style={styles.fullscreenTitle}>{getItemTitle()}</Text>

              {/* Fields */}
              {renderField('Тип', typeToCategoryMap[item.type] || item.type)}
              {renderField('Вместимость', item.capacity)}
              {renderField('Кухня', item.cuisine)}
              {renderField('Средний чек', displayCost)}
              {renderField('Адрес', item.address)}
              {renderField('Телефон', item.phone)}
              {renderField('Район', item.district)}
              {renderField('Email', item.email)}
              {renderField('Описание', item.description)}
              {renderField('Категория', item.category)}
              {renderField('Бренд', item.brand)}
              {renderField('Материал', item.material)}
              {renderField('Время работы', item.workingHours)}
              {renderField('Рейтинг', item.rating)}
              {renderField('Опыт работы', item.experience)}
              {renderField('Название салона', item.salonName)}
              {renderField('Название магазина', item.storeName)}
              {renderField('Название команды', item.teamName)}
              {renderField('Название машины', item.carName)}
              {renderField('Название цветов', item.flowerName)}
              {renderField('Название алкоголя', item.alcoholName)}
              {renderField('Название изделия', item.itemName)}
              {renderField('Тип торта', item.cakeType)}
              {renderField('Тип цветов', item.flowerType)}
              {renderField('Пол', item.gender)}

              {/* Portfolio Button */}
              {item.portfolio && (
                <TouchableOpacity
                  style={styles.fullscreenPortfolioButton}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    Linking.openURL(item.portfolio).catch((err) => console.error("Ошибка:", err));
                  }}
                >
                  <LinearGradient
                    colors={[COLORS.buttonGradientStart, COLORS.buttonGradientEnd]}
                    style={styles.fullscreenPortfolioGradient}
                  >
                    <Text style={styles.fullscreenPortfolioText}>Открыть портфолио</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </View>
      </Modal>
    );
  };

  // Combine all sections into a single FlatList
  

    return (
    <>
      <LinearGradient 
        colors={["#F1EBDD", "#897066"]} 
        start={{ x: 0, y: 1 }} 
        end={{ x: 0, y: 0 }} 
        style={styles.splashContainer}
      >
        {/* Кнопка назад */}
        <TouchableOpacity 
          style={styles.backButtonTop} 
          onPress={() => navigation.goBack()}
          accessible
          accessibilityLabel="Вернуться назад"
        >
          <AntDesign name="left" size={24} color="black" />
        </TouchableOpacity>

        {/* Логотип */}
        <View style={styles.logoContainer}>
          <Image 
            source={require("../../assets/kazanRevert.png")} 
            style={styles.potIcon} 
            resizeMode="contain" 
          />
        </View>

        {/* Footer паттерн */}
        <Image 
          source={require("../../assets/footer.png")} 
          style={styles.topPatternContainer} 
        />

        {/* Поля ввода */}
        <View style={styles.headerContainer}>
          <View style={styles.budgetContainer}>
            {/* Кнопка добавить */}
            <View style={styles.categoryItemAdd}>
              <TouchableOpacity 
                style={styles.categoryButtonAdd} 
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setAddItemModalVisible(true);
                }}
                accessible
                accessibilityLabel="Добавить элемент"
              >
                <LinearGradient 
                  colors={[COLORS.buttonGradientStart, COLORS.buttonGradientEnd]} 
                  style={styles.categoryButtonGradient}
                >
                  <Text style={styles.categoryPlusText}>+</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Поле бюджета */}
            

            <TextInput
              style={styles.budgetInput}
              placeholder="Бюджет (т)"
              value={formatBudget(budget)}
              onChangeText={handleBudgetChange}
              placeholderTextColor={COLORS.placeholder}
              keyboardType="numeric"
              maxLength={18}
              accessible
              accessibilityLabel="Бюджет мероприятия"
            />

            {/* Поле количества гостей */}
            <TextInput
              style={styles.guestInput}
              placeholder="Гостей"
              value={guestCount}
              onChangeText={handleGuestCountChange}
              placeholderTextColor={COLORS.placeholder}
              keyboardType="numeric"
              maxLength={5}
              accessible
              accessibilityLabel="Количество гостей"
            />
          </View>

          {/* Loader modal */}
          <Modal 
            animationType="fade" 
            transparent={true} 
            visible={isLoading} 
            onRequestClose={() => {}}
          >
            <View style={styles.loaderOverlay}>
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loaderText}>Подбираем...</Text>
              </View>
            </View>
          </Modal>
        </View>

        {/* Список категорий */}
        <View style={styles.listContainer}>
          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} />
          ) : (
            <ScrollView 
              style={styles.scrollView} 
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.categoryGrid}>
                {[...categories, 'Добавить'].map((item, index) => (
                  <View key={index} style={styles.categoryItem}>
                    {renderCategories({ item })}
                  </View>
                ))}
              </View>
              <View style={styles.bottomPadding} />
            </ScrollView>
          )}
        </View>

        {/* Кнопка далее */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity 
            style={styles.nextButton} 
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setEventDetailsModalVisible(true);
            }}
            disabled={loading}
            accessible
            accessibilityLabel="Далее"
          >
            <Image 
              source={require("../../assets/next.png")} 
              style={styles.potIcon3} 
              resizeMode="contain" 
            />
          </TouchableOpacity>
        </View>

        {/* Модальные окна */}
        <AddItemModal
          visible={addItemModalVisible}
          onClose={() => setAddItemModalVisible(false)}
          filteredItems={combinedData}
          filteredData={filteredData}
          handleAddItem={handleAddItem}
          setDetailsModalVisible={setDetailsModalVisible}
          setSelectedItem={setSelectedItem}
          quantities={quantities}
          updateCategories={updateCategories}
        />

        <CategoryItemsModal
          visible={categoryModalVisible}
          onClose={() => setCategoryModalVisible(false)}
          categoryItems={selectedCategoryItems}
          categoryLabel={selectedCategoryLabel}
          categoryType={selectedCategoryType}
          filteredData={filteredData}
          handleAddItem={handleAddItem}
          handleRemoveItem={handleRemoveItem}
          setDetailsModalVisible={setDetailsModalVisible}
          setSelectedItem={setSelectedItem}
          quantities={quantities}
          setQuantities={setQuantities}
          budget={budget}
          setFilteredData={setFilteredData}
          setRemainingBudget={setRemainingBudget}
          updateCategories={updateCategories}
          guestCount={guestCount}
          setGuestCount={setGuestCount}
        />

        <AddCategoryModal
          visible={addCategoryModalVisible}
          onClose={() => setAddCategoryModalVisible(false)}
          onAddCategory={handleAddCategory}
        />

        <DetailsModal
          visible={detailsModalVisible}
          onClose={() => setDetailsModalVisible(false)}
          item={selectedItem}
        />

        {/* Модальное окно для ввода данных мероприятия */}
        <Modal
          visible={eventDetailsModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setEventDetailsModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.eventDetailsModalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Данные мероприятия</Text>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setEventDetailsModalVisible(false)}
                  accessible
                  accessibilityLabel="Закрыть"
                >
                  <Icon name="close" size={24} color={MODAL_COLORS.closeButtonColor} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalContent}>
                {/* Название мероприятия */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Название мероприятия</Text>
                  <TextInput
                    style={styles.input}
                    value={eventName}
                    onChangeText={setEventName}
                    placeholder="Введите название..."
                    placeholderTextColor={MODAL_COLORS.textSecondary}
                    accessible
                    accessibilityLabel="Название мероприятия"
                  />
                </View>

                {/* Дата мероприятия */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Дата мероприятия</Text>
                  <TouchableOpacity
                    style={styles.datePickerButton}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setShowDatePicker(true);
                    }}
                    accessible
                    accessibilityLabel="Выбрать дату"
                  >
                    <Text style={styles.datePickerText}>
                      {eventDate ? eventDate.toLocaleDateString('ru-RU') : 'Выберите дату'}
                    </Text>
                    <Icon name="calendar-today" size={20} color={MODAL_COLORS.icon} />
                  </TouchableOpacity>
                </View>

                {/* Календарь */}
                {showDatePicker && (
                  <Modal
                    visible={showDatePicker}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setShowDatePicker(false)}
                  >
                    <View style={styles.modalOverlay}>
                      <View style={styles.calendarContainer}>
                        <Calendar
                          onDayPress={(day) => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            const dateString = day.dateString;
                            const dayInfo = blockedDays[dateString];

                            // Check if the date is fully blocked
                            if (dayInfo && dayInfo.disabled) {
                              alert(`Дата ${dateString} полностью забронирована.`);
                              return;
                            }

                            // Check if a specific restaurant is selected and if it's blocked on this date
                            const selectedRestaurant = filteredData.find(item => item.type === 'restaurant');
                            if (selectedRestaurant && dayInfo && dayInfo.dots) {
                              const isRestaurantBooked = dayInfo.dots.some(dot => dot.restaurantId === selectedRestaurant.id);
                              if (isRestaurantBooked) {
                                alert(`Ресторан "${selectedRestaurant.name}" уже забронирован на ${dateString}. Пожалуйста, выберите другую дату или другой ресторан.`);
                                return;
                              }
                            }
                            
                            // If not blocked, set the date
                            setEventDate(new Date(dateString));
                            setShowDatePicker(false);
                          }}
                          markingType={'custom'}
                          markedDates={{
                            ...blockedDays,
                            [eventDate.toISOString().split('T')[0]]: {
                              selected: true,
                              disableTouchEvent: true,
                              customStyles: {
                                container: {
                                  backgroundColor: COLORS.primary,
                                  borderRadius: 5,
                                },
                                text: {
                                  color: COLORS.white,
                                  fontWeight: 'bold',
                                },
                              },
                            },
                          }}
                          minDate={new Date().toISOString().split('T')[0]}
                          theme={{
                            backgroundColor: MODAL_COLORS.background,
                            calendarBackground: MODAL_COLORS.background,
                            textSectionTitleColor: MODAL_COLORS.textPrimary,
                            selectedDayBackgroundColor: COLORS.primary,
                            selectedDayTextColor: COLORS.white,
                            todayTextColor: COLORS.accent,
                            dayTextColor: MODAL_COLORS.textPrimary,
                            textDisabledColor: MODAL_COLORS.textSecondary,
                            arrowColor: COLORS.primary,
                          }}
                        />
                        <TouchableOpacity
                          style={styles.closeCalendarButton}
                          onPress={() => setShowDatePicker(false)}
                          accessible
                          accessibilityLabel="Закрыть календарь"
                        >
                          <Text style={styles.closeCalendarText}>Закрыть</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </Modal>
                )}

                {/* Кнопка создать */}
                <TouchableOpacity
                  style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                  onPress={() => {
                    setEventDetailsModalVisible(false);
                    handleSubmit();
                  }}
                  disabled={loading}
                  accessible
                  accessibilityLabel="Создать мероприятие"
                >
                  <LinearGradient
                    colors={[COLORS.buttonGradientStart, COLORS.buttonGradientEnd]}
                    style={styles.submitButtonGradient}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color={COLORS.white} />
                    ) : (
                      <Text style={styles.submitButtonText}>Создать мероприятие</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </LinearGradient>
    </>
  );
};


const styles = StyleSheet.create({
  splashContainer: { 
    flex: 1 
  },
  // Loader
  loaderOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: MODAL_COLORS.overlayBackground,
  },
  loaderContainer: {
    backgroundColor: MODAL_COLORS.cardBackground,
    borderRadius: 15,
    padding: 25,
    alignItems: "center",
    shadowColor: MODAL_COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loaderText: {
    marginTop: 15,
    fontSize: 17,
    color: MODAL_COLORS.textPrimary,
    fontWeight: "500",
  },

  // Кнопка назад
  backButtonTop: {
    marginTop: "15%",
    marginLeft: "2%",
  },

  // Логотип
  logoContainer: {
    alignItems: "center",
    marginVertical: 5,
    marginTop: "0%",
  },
  potIcon: {
    width: 80,
    height: 80,
  },
  potIcon3: { 
    width: 70, 
    height: 70, 
    zIndex: 3 
  },

  // Footer паттерн
  topPatternContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: "15%",
    zIndex: -1,
    resizeMode: "cover",
    opacity: 0.8,
    marginBottom: "1%",
  },

  // Поля ввода
  budgetContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    marginRight:20,
    marginLeft:40
    
  },
  categoryItemAdd: {
    width: "20%",
    marginRight: 10,
  },
  budgetInput: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 10,
    padding: 10,
    marginRight: 10,
    color: COLORS.white,
    fontSize: 16,
  },
  guestInput: {
    flex: 0.6,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 10,
    padding: 10,
    color: COLORS.white,
    fontSize: 16,
  },

  // Список категорий
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 5,
  },
  scrollView: { 
    flex: 1 
  },
  categoryGrid: {
    flexDirection: "column",
    alignItems: "stretch",
  },
  categoryItem: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  // Нижний контейнер
  bottomPadding: { 
    height: 20 
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    backgroundColor: "transparent",
    zIndex: 5,
    marginBottom: "10%",
  },
  nextButton: {
    borderRadius: 25,
    overflow: "hidden",
    marginVertical: 5,
    alignItems: "center",
    zIndex: 6,
  },

  // Обновленные стили кнопок
  categoryPlusText: {
    fontSize: 18,
    color: COLORS.white,
    fontWeight: "bold",
  },
  categoryText: {
    fontSize: 14,
    color: COLORS.white,
    fontWeight: "600",
    textAlign: "center",
    paddingHorizontal: 8,
  },

  scrollContent: {
    padding: 18,
    paddingBottom: 120,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  backButton: {
    padding: 10,
  },
  eventDetailsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 18,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  input: {
    backgroundColor: MODAL_COLORS.inputBackground,
    borderWidth: 1,
    borderColor: MODAL_COLORS.inputBorder,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: MODAL_COLORS.inputBackground,
    borderWidth: 1,
    borderColor: MODAL_COLORS.inputBorder,
    borderRadius: 10,
    padding: 14,
  },
  datePickerText: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  budgetInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  budgetText: {
    flex:1,
    fontSize: 18,
    color: COLORS.textPrimary,
  },
  categoriesContainer: {
    marginBottom: 24,
  },
  categoriesList: {
    paddingBottom: 18,
  },
  categoryRowWrapper: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  categoryButton: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryButtonDisabled: {
    opacity: 0.7,
  },
  categoryButtonGradient: {
    padding: 14,
    alignItems: 'center',
  },
  categoryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  categoryButtonTextDisabled: {
    color: COLORS.white,
  },
  categoryButtonAdd: {
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryPlusText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
  },
  removeCategoryButton: {
    padding: 10,
  },
  selectedItemsContainer: {
    marginBottom: 24,
  },
  selectedItemsList: {
    paddingBottom: 18,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 18,
    marginBottom: 12,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 10,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    padding: 10,
    backgroundColor: MODAL_COLORS.inputBackground,
    borderRadius: 8,
  },
  totalCost: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  emptyText: {
    fontSize: 16,
    color: MODAL_COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 24,
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 24,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonGradient: {
    padding: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: MODAL_COLORS.overlayBackground,
    justifyContent: 'center',
  },
  addModalContainer: {
    backgroundColor: MODAL_COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: '100%',
    maxHeight: SCREEN_HEIGHT * 0.9,
    padding: 18,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: MODAL_COLORS.textPrimary,
  },
  modalCloseButton: {
    padding: 10,
  },
  addModalSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MODAL_COLORS.inputBackground,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: MODAL_COLORS.inputBorder,
    paddingHorizontal: 14,
    marginBottom: 18,
  },
  addModalSearchIcon: {
    marginRight: 10,
  },
  addModalSearchInput: {
    flex: 1,
    fontSize: 16,
    color: MODAL_COLORS.textPrimary,
    paddingVertical: 12,
  },
  addModalClearIcon: {
    padding: 10,
  },
  addModalFilterScroll: {
    maxHeight: 160,
    marginBottom: 18,
  },
  addModalFilterLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: MODAL_COLORS.textPrimary,
    marginBottom: 10,
  },
  filterButtonBase: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    marginRight: 10,
  },
  addModalTypeButton: {
    backgroundColor: MODAL_COLORS.inactiveFilter,
  },
  addModalTypeButtonActive: {
    backgroundColor: MODAL_COLORS.activeFilter,
  },
  addModalTypeButtonText: {
    color: MODAL_COLORS.inactiveFilterText,
  },
  addModalTypeButtonTextActive: {
    color: MODAL_COLORS.activeFilterText,
  },
  addModalDistrictButton: {
    backgroundColor: MODAL_COLORS.inactiveFilter,
  },
  addModalDistrictButtonActive: {
    backgroundColor: MODAL_COLORS.activeFilter,
  },
  addModalDistrictButtonText: {
    color: MODAL_COLORS.inactiveFilterText,
  },
  addModalDistrictButtonTextActive: {
    color: MODAL_COLORS.activeFilterText,
  },
  addModalPriceButton: {
    backgroundColor: MODAL_COLORS.inactiveFilter,
  },
  addModalPriceButtonActive: {
    backgroundColor: MODAL_COLORS.activeFilter,
  },
  addModalPriceButtonText: {
    color: MODAL_COLORS.inactiveFilterText,
  },
  addModalPriceButtonTextActive: {
    color: MODAL_COLORS.activeFilterText,
  },
  filterButtonTextBase: {
    fontSize: 14,
    fontWeight: '500',
  },
  addModalItemList: {
    paddingBottom: 18,
  },
  addModalItemCard: {
    flexDirection: 'row',
    backgroundColor: MODAL_COLORS.cardBackground,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: MODAL_COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  addModalItemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addModalItemText: {
    fontSize: 16,
    color: MODAL_COLORS.textPrimary,
    flex: 1,
  },
  addModalItemCount: {
    fontSize: 14,
    color: MODAL_COLORS.textSecondary,
    marginLeft: 10,
  },
  detailsIconButton: {
    padding: 10,
  },
  addModalEmptyText: {
    fontSize: 16,
    color: MODAL_COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 24,
  },
  addModalScrollView: {
    maxHeight: SCREEN_HEIGHT * 0.5,
  },
  selectedItemContainer: {
    marginBottom: 18,
  },
  categoryHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: MODAL_COLORS.textPrimary,
    marginBottom: 14,
  },
  detailsModalContainer: {
    backgroundColor: MODAL_COLORS.background,
    borderRadius: 20,
    padding: 20,
    margin: 20,
    maxHeight: SCREEN_HEIGHT * 0.8,
  },
  detailsModalContent: {
    paddingBottom: 18,
  },
  detailRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: MODAL_COLORS.separator,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: MODAL_COLORS.textPrimary,
    width: '40%',
  },
  detailValue: {
    fontSize: 16,
    color: MODAL_COLORS.textPrimary,
    flex: 1,
  },
  portfolioButton: {
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 18,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  portfolioButtonGradient: {
    padding: 14,
    alignItems: 'center',
  },
  portfolioButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  detailsButton: {
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 10,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  detailsButtonGradient: {
    padding: 14,
    alignItems: 'center',
  },
  detailsButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },


  // Модальное окно данных мероприятия
  eventDetailsModalContainer: {
    backgroundColor: MODAL_COLORS.background,
    borderRadius: 20,
    padding: 20,
    margin: 20,
    maxHeight: SCREEN_HEIGHT * 0.7,
  },
  modalContent: {
    paddingVertical: 10,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: MODAL_COLORS.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: MODAL_COLORS.inputBackground,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: MODAL_COLORS.textPrimary,
    borderWidth: 1,
    borderColor: MODAL_COLORS.inputBorder,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: MODAL_COLORS.inputBackground,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: MODAL_COLORS.inputBorder,
  },
  datePickerText: {
    fontSize: 16,
    color: MODAL_COLORS.textPrimary,
  },
  submitButton: {
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 20,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonGradient: {
    padding: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  calendarContainer: {
    backgroundColor: MODAL_COLORS.background,
    borderRadius: 16,
    padding: 18,
    // width: '90%',
    marginBottom:'50%',
    margingLeft:'45%',
    

  },
  closeCalendarButton: {
    marginTop: 18,
    alignItems: 'center',
  },
  closeCalendarText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    textAlign: 'center',
  },
  // Photo Slider Styles
  photoSliderContainer: {
    width: '100%',
    height: 250,
    backgroundColor: COLORS.textSecondary,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
  },
  photoSliderImage: {
    width: '100%',
    height: '100%',
  },
  photoNavButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -20 }],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  photoNavButtonLeft: {
    left: 10,
  },
  photoNavButtonRight: {
    right: 10,
  },
  photoCounter: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    zIndex: 10,
  },
  photoCounterText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  photoDotsContainer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  photoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  photoDotActive: {
    backgroundColor: COLORS.white,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  detailsModalScrollView: {
    flex: 1,
  },
  detailsFieldsContainer: {
    paddingTop: 8,
  },
  // Fullscreen Details Modal Styles
  fullscreenModalContainer: {
    flex: 1,
    backgroundColor: '#F1EBDD',
  },
  fullscreenModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#F1EBDD',
  },
  fullscreenBackButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  fullscreenModalHeaderTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#5A4032',
    textAlign: 'center',
    flex: 1,
  },
  fullscreenModalScroll: {
    flex: 1,
  },
  fullscreenPhoto: {
    width: Dimensions.get('window').width,
    height: 400,
    backgroundColor: '#E0D5C7',
  },
  // Photo Slider Styles
  photoSliderWrapper: {
    position: 'relative',
  },
  photoIndicators: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  photoIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  photoIndicatorActive: {
    width: 24,
    backgroundColor: '#FFFFFF',
  },
  fullscreenContentCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    minHeight: 400,
  },
  fullscreenTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D2D2D',
    textAlign: 'center',
    marginBottom: 32,
  },
  fullscreenDetailField: {
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    paddingBottom: 16,
  },
  fullscreenDetailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999999',
    letterSpacing: 1,
    marginBottom: 8,
  },
  fullscreenDetailValue: {
    fontSize: 18,
    fontWeight: '400',
    color: '#2D2D2D',
    lineHeight: 24,
  },
  fullscreenPortfolioButton: {
    marginTop: 32,
    borderRadius: 12,
    overflow: 'hidden',
  },
  fullscreenPortfolioGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  fullscreenPortfolioText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },

});


export default CreateTraditionalFamilyEventScreen;