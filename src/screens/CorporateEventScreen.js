import React, { Component, useState, useRef, useEffect, useCallback, useMemo } from "react";
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
} from "react-native";
import Icon2 from "react-native-vector-icons/MaterialCommunityIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useDispatch, useSelector } from 'react-redux'
import { setEventCosts } from "../store/authSlice";
import api from "../api/api";
import * as Animatable from "react-native-animatable";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Calendar } from "react-native-calendars";
import Icon from "react-native-vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";
import * as Linking from "expo-linking";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

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

// Replace the existing typeOrder, typesMapping, categoryToTypeMap, and typeToCategoryMap with the following:

const typeOrder = {
  transport: 1,
  restaurant: 2,
  alcohol: 3,
  cake: 4,
  tamada: 5,
  program: 6,
  "technical-equipment-rental": 7,
  jewelry: 8,
  flowers: 9,
};

const serviceTypeMap = {
  transport: 'Transport',
  restaurant: 'Restaurant',
  alcohol: 'Alcohol',
  cake: 'Cakes',
  tamada: 'Tamada',
  program: 'Program',
  'technical-equipment-rental': 'TechnicalEquipmentRental',
  jewelry: 'Jewelry',
  flowers: 'Flowers',
};

const typesMapping = [
  { key: "transport", costField: "cost", type: "transport", label: "Прокат авто" },
  { key: "restaurants", costField: "averageCost", type: "restaurant", label: "Ресторан" },
  { key: "alcohol", costField: "cost", type: "alcohol", label: "Алкоголь" },
  { key: "cakes", costField: "cost", type: "cake", label: "Торты" },
  { key: "tamada", costField: "cost", type: "tamada", label: "Ведущий" },
  { key: "programs", costField: "cost", type: "program", label: "Шоу программа" },
  { key: "technical-equipment-rentals", costField: "cost", type: "technical-equipment-rental", label: "Аренда технического оборудования" },
  { key: "jewelry", costField: "cost", type: "jewelry", label: "Ювелирные изделия" },
  { key: "flowers", costField: "cost", type: "flowers", label: "Цветы" },
];

const categoryToTypeMap = {
  "Прокат авто": "transport",
  "Ресторан": "restaurant",
  "Алкоголь": "alcohol",
  "Торты": "cake",
  "Ведущий": "tamada",
  "Шоу программа": "program",
  "Аренда технического оборудования": "technical-equipment-rental",
  "Ювелирные изделия": "jewelry",
  "Цветы": "flowers",
};

const typeToCategoryMap = Object.fromEntries(
  Object.entries(categoryToTypeMap).map(([category, type]) => [type, category])
);

// Replace the defaultCategories definition with the following:

const defaultCategories = [
  "Прокат авто",
  "Ресторан",
  "Алкоголь",
  "Торты",
  "Ведущий",
  "Шоу программа",
  "Аренда технического оборудования",
  "Ювелирные изделия",
  "Цветы",
];




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
          item.portfolio,
          item.cakeType,
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
      case "tamada":
        title = `Ведущий: ${item.name} (${cost} ₸)`;
        break;
      case "program":
        title = `Шоу программа: ${item.teamName} (${cost} ₸)`;
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
      case "technical-equipment-rental":
        title = `Техническое оборудование: ${item.name} (${cost} ₸)`;
        break;
      case "jewelry":
        title = `Ювелирные изделия: ${item.name} (${cost} ₸)`;
        break;
      case "flowers":
        title = `Цветы: ${item.name} (${cost} ₸)`;
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
                          styles.filterButtonTextBase,
                          costRange === option.value
                            ? styles.addModalPriceButtonTextActive
                            : styles.addModalPriceButtonText,
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
    if (item.type === "restaurant") {
      setInputGuestCount(guestCount?.toString() || "1");
    }
  }, [guestCount, item.type]);

  const cost = item.type === "restaurant" ? item.averageCost : item.cost;
  const parsedGuestCountForVenue = parseInt(inputGuestCount, 10) || 1;
  const parsedQuantityGeneral = parseInt(inputQuantity, 10) || 1;

  const totalCost =
    item.type === "restaurant"
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
        if (dataItem.type === "restaurant") {
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

    if (item.type === "restaurant" && guestCountNum > item.capacity) {
      guestCountNum = item.capacity;
      alert(`Максимальная вместимость ресторана: ${item.capacity} гостей.`);
    }
    newGuestCountStr = guestCountNum.toString();

    setInputGuestCount(newGuestCountStr);
    if (setGuestCount) {
      setGuestCount(guestCountNum);
    }

    setFilteredData((prevData) => {
      const updatedData = prevData.map((dataItem) => {
        if (dataItem.type === "restaurant") {
          const itemCost = dataItem.averageCost;
          return { ...dataItem, totalCost: itemCost * guestCountNum };
        }
        return dataItem;
      });

      const totalSpent = updatedData.reduce((sum, dataItem) => {
        const key = `${dataItem.type}-${dataItem.id}`;
        const itemCostVal = dataItem.type === "restaurant" ? dataItem.averageCost : dataItem.cost;
        let effectiveCount;
        if (dataItem.type === "restaurant") {
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
    case "tamada":
      title = `${item.name} (${cost} ₸)`;
      break;
    case "program":
      title = `${item.teamName} (${cost} ₸)`;
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
    case "technical-equipment-rental":
      title = `${item.name} (${cost} ₸)`;
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
          {item.type === "restaurant" ? (
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
      case "tamada":
        title = `${item.name} (${cost} ₸)`;
        break;
      case "program":
        title = `${item.teamName} (${cost} ₸)`;
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
      case "technical-equipment-rental":
        title = `${item.name} (${cost} ₸)`;
        break;
      case "jewelry":
        title = `${item.name} (${cost} ₸)`;
        break;
      case "flowers":
        title = `${item.name} (${cost} ₸)`;
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
            if (item.type === "restaurant" && guestCount) {
              const totalGuests = parseInt(guestCount, 10);
              if (totalGuests > item.capacity) {
                alert(
                  `Этот ресторан не может вместить ${totalGuests} гостей. Максимальная вместимость: ${item.capacity}.`
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
            setDetailsModalVisible(true);
          }}
          accessible
          accessibilityLabel="Посмотреть детали"
        >
          <Icon2 name="magnify" size={24} color={MODAL_COLORS.icon} />
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

const CorporateEventScreen = ({ navigation, route }) => {
  const defaultCategories = [
    "Прокат авто",
    "Ресторан",
    "Алкоголь",
    "Торты",
    "Ведущий",
    "Шоу программа",
    "Аренда технического оборудования"
  ];

  console.log('route.params:', route?.params);
  const selectedCategories = route?.params?.selectedCategories || [];
  console.log('Полученные категории:', selectedCategories);
  const [categories, setCategories] = useState(selectedCategories.length > 0 ? selectedCategories : defaultCategories);

  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);

  const [disabledCategories, setDisabledCategories] = useState([]);
  const [data, setData] = useState({
    restaurants: [],
    tamada: [],
    programs: [],
    transport: [],
    cakes: [],
    alcohol: [],
    "technical-equipment-rentals": [],
  });
  const [filteredData, setFilteredData] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [budget, setBudget] = useState("");
  const [guestCount, setGuestCount] = useState("");
  const [remainingBudget, setRemainingBudget] = useState(0);
  const [loading, setLoading] = useState(false);
  const [addItemModalVisible, setAddItemModalVisible] = useState(false);
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

const fetchData = async () => {
  if (!token || !user?.id) return;
  setLoading(true);
  try {
    const responses = await Promise.all([
      api.getRestaurants().catch((err) => {
        console.error("Ошибка получения ресторанов:", err);
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
      api.getTechnicalEquipmentRentals().catch((err) => {
        console.error("Ошибка получения аренды технического оснащения:", err);
        return { data: [] };
      }),
      api.getJewelry().catch((err) => {
        console.error("Ошибка получения ювелирных изделий:", err);
        return { data: [] };
      }),
      api.getFlowers().catch((err) => {
        console.error("Ошибка получения цветов:", err);
        return { data: [] };
      }),
    ]);
    const [
      restaurants,
      tamada,
      programs,
      transport,
      cakes,
      alcohol,
      technicalEquipmentRentals,
      jewelry,
      flowers,
    ] = responses.map((res) => res.data);
    setData({
      restaurants,
      tamada,
      programs,
      transport,
      cakes,
      alcohol,
      'technical-equipment-rentals': technicalEquipmentRentals,
      jewelry,
      flowers,
    });
    console.log('Fetched Data:', JSON.stringify({ jewelry, flowers }, null, 2));
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
          item.type === "restaurant"
            ? parseInt(filteredValue, 10) || 1
            : parseInt(quantities[`${item.type}-${item.id}`], 10) || 1;
        const itemCost = item.type === "restaurant" ? item.averageCost : item.cost;

        if (item.type === "restaurant") {
          if (item.capacity && (parseInt(filteredValue, 10) || 1) > item.capacity) {
            alert(
              `Ресторан ${item.name} вмещает максимум ${item.capacity} гостей.`
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

      if (type === "restaurant") {
        itemsForType = itemsForType.filter((r) => parseFloat(r.capacity) >= guests);
        if (itemsForType.length === 0) {
          console.log(
            `Нет ресторанов для ${guests} гостей в категории ${label}`
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
            `Рестораны в категории ${label} не вписываются в остаток бюджета ${remaining}`
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

      if (itemToAdd.type === "restaurant") {
        if (!guestCount || parseInt(guestCount, 10) <= 0) {
          alert("Пожалуйста, укажите количество гостей перед добавлением ресторана.");
          return;
        }
        if (parseInt(guestCount, 10) > itemToAdd.capacity) {
          alert(
            `Этот ресторан не может вместить ${guestCount} гостей. Максимальная вместимость: ${itemToAdd.capacity}.`
          );
          return;
        }
        setFilteredData((prev) =>
          prev.filter(
            (i) => i.type !== "restaurant" || i.id === itemToAdd.id
          )
        );
      }

      setFilteredData((prevSelected) => {
        const existingItem = prevSelected.find(
          (i) => `${i.type}-${i.id}` === itemKey
        );
        let updatedSelectedItems;
        let newQuantity = "1";

        if (existingItem && itemToAdd.type !== "restaurant") {
          newQuantity = (parseInt(quantities[itemKey] || "1") + 1).toString();
          updatedSelectedItems = prevSelected.map((i) =>
            i.id === itemToAdd.id && i.type === itemToAdd.type
              ? { ...i, totalCost: cost * parseInt(newQuantity) }
              : i
          );
        } else if (!existingItem) {
          const effectiveQuantity =
            itemToAdd.type === "restaurant"
              ? parseInt(guestCount, 10) || 1
              : 1;
          const totalItemCost = cost * effectiveQuantity;
          const newItem = { ...itemToAdd, totalCost: totalItemCost };
          if (itemToAdd.type === "restaurant") {
            updatedSelectedItems = [
              ...prevSelected.filter((i) => i.type !== "restaurant"),
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
              itemToAdd.type === "restaurant"
                ? guestCount || "1"
                : newQuantity,
          };

          const totalSpent = updatedSelectedItems.reduce((sum, selItem) => {
            const qtyKey = `${selItem.type}-${selItem.id}`;
            const itemQty =
              selItem.type === "restaurant"
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
              selItem.type === "restaurant"
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

  const fetchAllBlockedDays = async () => {
    try {
      const response = await api.fetchAllBlockedDays();
      const blocked = response.data.reduce((acc, date) => {
        acc[date] = { disabled: true, disableTouchEvent: true, marked: true, dotColor: COLORS.error };
        return acc;
      }, {});
      setBlockedDays(blocked);
    } catch (error) {
      console.error("Ошибка загрузки заблокированных дат:", error);
      alert("Не удалось загрузить заблокированные даты.");
    }
  };

  useEffect(() => {
    if (token && user?.id) {
      fetchAllBlockedDays();
    }
  }, [token, user?.id]);

  const calculateTotalCost = useMemo(() => {
    return filteredData.reduce((sum, item) => {
      const quantity = parseInt(quantities[`${item.type}-${item.id}`] || "1");
      const cost = item.type === "restaurant" ? item.averageCost : item.cost;
      const effectiveQuantity =
        item.type === "restaurant"
          ? parseInt(guestCount, 10) || 1
          : quantity;
      return sum + cost * effectiveQuantity;
    }, 0);
  }, [filteredData, quantities, guestCount]);

  const handleSubmit = async () => {
    if (!eventName.trim()) {
      alert("Пожалуйста, укажите название мероприятия");
      return;
    }
    if (!eventDate) {
      alert("Пожалуйста, выберите дату мероприятия");
      return;
    }
    if (!budget || isNaN(budget) || parseFloat(budget) <= 0) {
      alert("Пожалуйста, укажите корректный бюджет");
      return;
    }
    if (!guestCount || isNaN(guestCount) || parseInt(guestCount, 10) <= 0) {
      alert("Пожалуйста, укажите корректное количество гостей");
      return;
    }
    if (filteredData.length === 0) {
      alert("Пожалуйста, добавьте хотя бы один элемент для мероприятия");
      return;
    }

    setLoading(true);
    try {
      const categoryResponse = await api.createEventCategory(
        { name: eventName },
        token
      );
      const categoryId = categoryResponse.data.id;

      const totalBudget = parseFloat(budget);
      const spentAmount = calculateTotalCost;
      const remaining = remainingBudget;

      await api.updateEventCategoryTotalCost(categoryId, { total_cost: totalBudget });
      await api.updateEventCategoryPaidAmount(categoryId, { paid_amount: spentAmount });
      await api.updateEventCategoryRemainingBalance(categoryId, { remaining_balance: remaining });

      for (const item of filteredData) {
        const typeMapping = typesMapping.find((mapping) => mapping.type === item.type);
        if (!typeMapping) {
          console.error(`Неизвестный тип услуги: ${item.type}`);
          continue;
        }

        const serviceType = serviceTypeMap[item.type] || item.type;

        const quantity =
          item.type === 'restaurant'
            ? parseInt(guestCount, 10)
            : parseInt(quantities[`${item.type}-${item.id}`] || '1');

        try {
          await api.addServiceToCategory(
            categoryId,
            { serviceId: item.id, serviceType, quantity },
            token
          );
          console.log(`Услуга ${serviceType} успешно добавлена с ID ${item.id} и количеством ${quantity}`);
        } catch (error) {
          console.error(
            `Ошибка при добавлении услуги ${serviceType} (ID: ${item.id}, Type: ${item.type}):`,
            error.response?.data || error.message
          );
        }
      }

      alert('Корпоративное мероприятие успешно создано!');
      setEventName('');
      setEventDate(new Date());
      setBudget('');
      setGuestCount('');
      setFilteredData([]);
      setQuantities({});
      setRemainingBudget(0);
      navigation.goBack();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Ошибка при создании мероприятия:', error.response?.data || error.message);
      alert('Ошибка: ' + (error.response?.data?.error || error.message));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCategory = useCallback(
    (category) => {
      setDisabledCategories((prev) => {
        if (prev.includes(category)) {
          const updatedDisabledCategories = prev.filter(
            (cat) => cat !== category
          );
          const type = categoryToTypeMap[category];
          if (type) {
            const itemsToAdd = combinedData.filter(
              (item) => item.type === type
            );

            let remaining = parseFloat(budget) || 0;
            const currentTotalSpent = filteredData.reduce((sum, dataItem) => {
              const key = `${dataItem.type}-${dataItem.id}`;
              const itemQuantity =
                dataItem.type === "restaurant"
                  ? parseInt(guestCount, 10) || 1
                  : parseInt(quantities[key] || "1");
              const itemCost =
                dataItem.type === "restaurant"
                  ? dataItem.averageCost
                  : dataItem.cost;
              return sum + itemCost * itemQuantity;
            }, 0);
            remaining -= currentTotalSpent;

            const filteredItemsToAdd = itemsToAdd
              .filter((item) => {
                const cost =
                  item.type === "restaurant" ? item.averageCost : item.cost;
                const effectiveQuantity =
                  item.type === "restaurant"
                    ? parseInt(guestCount, 10) || 1
                    : 1;
                const totalCost = cost * effectiveQuantity;
                return totalCost <= remaining;
              })
              .sort((a, b) => {
                const costA = a.type === "restaurant" ? a.averageCost : a.cost;
                const costB = b.type === "restaurant" ? b.averageCost : b.cost;
                return costA - costB;
              });

            const maxItemsToSelect = Math.min(1, filteredItemsToAdd.length);
            const selectedItemsToAdd = [];
            for (let i = 0; i < maxItemsToSelect; i++) {
              const selectedItem = filteredItemsToAdd[i];
              if (selectedItem) {
                const cost =
                  selectedItem.type === "restaurant"
                    ? selectedItem.averageCost
                    : selectedItem.cost;
                const effectiveQuantity =
                  selectedItem.type === "restaurant"
                    ? parseInt(guestCount, 10) || 1
                    : 1;
                const totalCost = cost * effectiveQuantity;
                selectedItemsToAdd.push({ ...selectedItem, totalCost });
                remaining -= totalCost;
              }
            }

            setFilteredData((prevData) => {
              const updatedData = [...prevData, ...selectedItemsToAdd].sort(
                (a, b) => (typeOrder[a.type] || 13) - (typeOrder[b.type] || 13)
              );

              setQuantities((prevQuantities) => ({
                ...prevQuantities,
                ...selectedItemsToAdd.reduce((acc, item) => {
                  const itemKey = `${item.type}-${item.id}`;
                  return { ...acc, [itemKey]: "1" };
                }, {}),
              }));

              const totalSpent = updatedData.reduce((sum, dataItem) => {
                const key = `${dataItem.type}-${dataItem.id}`;
                const itemQuantity =
                  dataItem.type === "restaurant"
                    ? parseInt(guestCount, 10) || 1
                    : parseInt(quantities[key] || "1");
                const itemCost =
                  dataItem.type === "restaurant"
                    ? dataItem.averageCost
                    : dataItem.cost;
                return sum + itemCost * itemQuantity;
              }, 0);
              setRemainingBudget(parseFloat(budget) - totalSpent);

              return updatedData;
            });
          }
          return updatedDisabledCategories;
        } else {
          const type = categoryToTypeMap[category];
          if (type) {
            setFilteredData((prevData) =>
              prevData.filter((item) => item.type !== type)
            );
          }
          setFilteredData((prevData) => {
            const totalSpent = prevData.reduce((sum, dataItem) => {
              const key = `${dataItem.type}-${dataItem.id}`;
              const itemQuantity =
                dataItem.type === "restaurant"
                  ? parseInt(guestCount, 10) || 1
                  : parseInt(quantities[key] || "1");
              const itemCost =
                dataItem.type === "restaurant"
                  ? dataItem.averageCost
                  : dataItem.cost;
              return sum + itemCost * itemQuantity;
            }, 0);
            setRemainingBudget(parseFloat(budget) - totalSpent);
            return prevData;
          });
          return [...prev, category];
        }
      });
    },
    [quantities, budget, guestCount, combinedData]
  );

  const handleDateSelect = (day) => {
    setEventDate(new Date(day.dateString));
    setShowDatePicker(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleOpenCategoryModal = (category, type) => {
    setSelectedCategoryItems(combinedData.filter((dataItem) => dataItem.type === type));
    setSelectedCategoryLabel(category);
    setSelectedCategoryType(type);
    setCategoryModalVisible(true);
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        accessible
        accessibilityLabel="Вернуться назад"
      >
        <Icon name="arrow-back" size={24} color={COLORS.textPrimary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Корпоративное мероприятие</Text>
    </View>
  );

  const renderEventDetails = () => (
    <View style={styles.eventDetailsContainer}>
      <Text style={styles.sectionTitle}>Детали мероприятия</Text>
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
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Дата мероприятия</Text>
        <TouchableOpacity
          style={styles.datePickerButton}
          onPress={() => setShowDatePicker(true)}
          accessible
          accessibilityLabel="Выбрать дату мероприятия"
        >
          <Text style={styles.datePickerText}>
            {eventDate ? eventDate.toLocaleDateString('ru-RU') : 'Выберите дату'}
          </Text>
          <Icon name="calendar-today" size={20} color={MODAL_COLORS.icon} />
        </TouchableOpacity>
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
                  onDayPress={handleDateSelect}
                  markedDates={{
                    ...blockedDays,
                    [eventDate.toISOString().split('T')[0]]: {
                      selected: true,
                      selectedColor: COLORS.primary,
                    },
                  }}
                  minDate={new Date()}
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
                  style={{ width: '100%' }}
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
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Бюджет (₸)</Text>
        <TextInput
          style={styles.input}
          value={formatBudget(budget)}
          onChangeText={handleBudgetChange}
          keyboardType="numeric"
          placeholder="Введите бюджет..."
          placeholderTextColor={MODAL_COLORS.textSecondary}
          accessible
          accessibilityLabel="Бюджет мероприятия"
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Количество гостей</Text>
        <TextInput
          style={styles.input}
          value={guestCount}
          onChangeText={handleGuestCountChange}
          keyboardType="numeric"
          placeholder="Введите количество гостей..."
          placeholderTextColor={MODAL_COLORS.textSecondary}
          accessible
          accessibilityLabel="Количество гостей"
        />
      </View>
      <View style={styles.budgetInfo}>
        <Text style={styles.budgetText}>
          Остаток бюджета: {remainingBudget.toLocaleString()} ₸
          {'\n'}
          {'\n'}
          Общая стоимость: {calculateTotalCost.toLocaleString()} ₸
        </Text>
      </View>
    </View>
  );

  const handleCategoryPress = (category) => {
    const type = categoryToTypeMap[category];
    if (!type) return;
    const itemsForCategoryModal = combinedData.filter((item) => item.type === type);
    setSelectedCategoryItems(itemsForCategoryModal);
    setSelectedCategoryLabel(category);
    setSelectedCategoryType(type);
    setCategoryModalVisible(true);
  };

  const handleCloseCategoryModal = () => {
    setCategoryModalVisible(false);
    setSelectedCategoryItems([]);
    setSelectedCategoryLabel("");
    setSelectedCategoryType("");
  };

const renderCategories = ({ item }) => {
  if (item === "Добавить") {
    return (
      <View style={styles.categoryRow}>
        <TouchableOpacity style={styles.categoryButtonAdd} onPress={() => setAddItemModalVisible(true)}>
          <LinearGradient colors={[COLORS.buttonGradientStart, COLORS.buttonGradientEnd]} style={styles.categoryButtonGradient}>
            <Text style={styles.categoryPlusText}>+</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }
const isDisabled = disabledCategories.includes(item);
  const type = categoryToTypeMap[item];
  const itemsForCategory = filteredData.filter((dataItem) => dataItem.type === type);

  const categoryIcons = {
    "Прокат авто": { on: require("../../assets/prokatAvtoOn.png"), off: require("../../assets/prokatAutooff.png") },
    "Ресторан": { on: require("../../assets/restaurantOn.png"), off: require("../../assets/restaurantTurnOff.png") },
    "Алкоголь": { on: require("../../assets/alcoholOn.png"), off: require("../../assets/alcoholOff.png") },
    "Торты": { on: require("../../assets/torty.png"), off: require("../../assets/tortyTurnOff.png") },
    "Ведущий": { on: require("../../assets/vedushieOn.png"), off: require("../../assets/vedushieOff.png") },
    "Шоу программа": { on: require("../../assets/show.png"), off: require("../../assets/showTurnOff.png") },
    "Аренда технического оборудования":  { on: require("../../assets/show.png"), off: require("../../assets/showTurnOff.png") },
    // { on: require("../../assets/techEquipmentOn.png"), off: require("../../assets/techEquipmentOff.png") },
    // "Ювелирные изделия": { on: require("../../assets/uvizdeliyaOff.png"), off: require("../../assets/uvizdeliyaOff.png") },
    "Ювелирные изделия": { on: require("../../assets/show.png"), off: require("../../assets/show.png") },
    "Цветы": { on: require("../../assets/cvetyOn.png"), off: require("../../assets/cvetyOff.png") },
  };

  const defaultIcon = require("../../assets/join.png");

  return (
    <View style={styles.categoryRow}>
      <TouchableOpacity style={styles.removeCategoryButton} onPress={() => handleRemoveCategory(item)}>
        <Image
          source={isDisabled ? (categoryIcons[item]?.on || defaultIcon) : (categoryIcons[item]?.off || defaultIcon)}
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
              name={
                item === "Прокат авто" ? "directions-car" :
                item === "Ресторан" ? "restaurant" :
                item === "Алкоголь" ? "local-drink" :
                item === "Торты" ? "cake" :
                item === "Ведущий" ? "mic" :
                item === "Шоу программа" ? "theater-comedy" :
                item === "Аренда технического оборудования" ? "settings" :
                item === "Ювелирные изделия" ? "diamond" :
                item === "Цветы" ? "local-florist" :
                "category"
              }
              size={20}
              color={COLORS.white}
              style={{ marginRight: 10 }}
            />
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
  if (!item) return null;

  const renderDetailRow = (label, value) => {
    if (!value) return null;
    return (
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>{label}:</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    );
  };

  const handleOpenLink = (url) => {
    if (url) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Linking.openURL(url).catch((err) => console.error("Ошибка открытия ссылки:", err));
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.detailsModalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {item.type === "restaurant" ? item.name :
               item.type === "tamada" ? item.name :
               item.type === "program" ? item.teamName :
               item.type === "transport" ? `${item.salonName} - ${item.carName}` :
               item.type === "cake" ? item.name :
               item.type === "alcohol" ? `${item.salonName} - ${item.alcoholName}` :
               item.type === "technical-equipment-rental" ? item.name :
               item.type === "jewelry" ? item.name :
               item.type === "flowers" ? item.name :
               "Детали"}
            </Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={onClose}
              accessible
              accessibilityLabel="Закрыть модальное окно"
            >
              <Icon name="close" size={24} color={MODAL_COLORS.closeButtonColor} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={[
              { label: 'Тип', value: typeToCategoryMap[item.type] },
              { label: 'Адрес', value: item.address },
              { label: 'Телефон', value: item.phone },
              { label: 'Кухня', value: item.cuisine },
              { label: 'Вместимость', value: item.capacity },
              { label: 'Категория', value: item.category },
              { label: 'Бренд', value: item.brand },
              { label: 'Портфолио', value: item.portfolio },
              { label: 'Тип торта', value: item.cakeType },
              { label: 'Материал', value: item.material },
              { label: 'Район', value: item.district },
              { 
                label: 'Стоимость',
                value: `${(item.type === 'restaurant' ? item.averageCost : item.cost).toLocaleString()} ₸`
              }
            ].filter(d => d.value)}
            renderItem={({ item }) => renderDetailRow(item.label, item.value)}
            keyExtractor={(item, index) => `${item.label}-${index}`}
            contentContainerStyle={styles.detailsModalContent}
            showsVerticalScrollIndicator={false}
          />
          {item.portfolio && (
            <TouchableOpacity
              style={styles.portfolioButton}
              onPress={() => handleOpenLink(item.portfolio)}
              accessible
              accessibilityLabel="Открыть портфолио"
            >
              <LinearGradient
                colors={[COLORS.buttonGradientStart, COLORS.buttonGradientEnd]}
                style={styles.portfolioButtonGradient}
              >
                <Text style={styles.portfolioButtonText}>Открыть портфолио</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

  const renderMainContent = () => {
    const sections = [
      { type: 'header', id: 'header' },
      { type: 'eventDetails', id: 'eventDetails' },
      { type: 'categories', id: 'categories' },
      { type: 'selectedItemsHeader', id: 'selectedItemsHeader' },
      ...filteredData.map(item => ({ type: 'selectedItem', id: `${item.type}-${item.id}`, data: item })),
      { type: 'submitButton', id: 'submitButton' },
    ];

    return (
      <FlatList
        data={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          switch (item.type) {
            case 'header':
              return renderHeader();
            case 'eventDetails':
              return renderEventDetails();
            case 'categories':
              return (
                <View style={styles.categoriesContainer}>
                  <Text style={styles.sectionTitle}>Категории</Text>
                  <FlatList
                    data={[...categories, 'Добавить']}
                    renderItem={renderCategories}
                    keyExtractor={(item) => item}
                  />
                </View>
              );
            case 'selectedItemsHeader':
              return (
                <View style={styles.selectedItemsContainer}>
                  <Text style={styles.sectionTitle}>Выбранные элементы</Text>
                  {isLoading && <ActivityIndicator size="large" color={COLORS.primary} />}
                  {!isLoading && filteredData.length === 0 && (
                    <Text style={styles.emptyText}>Нет выбранных элементов</Text>
                  )}
                </View>
              );
            case 'selectedItem':
              return renderSelectedItems({ item: item.data });
            case 'submitButton':
              return (
                <TouchableOpacity
                  style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                  onPress={handleSubmit}
                  disabled={loading}
                  accessible
                  accessibilityLabel="Создать корпоративное мероприятие"
                >
                  <LinearGradient
                    colors={[COLORS.buttonGradientStart, COLORS.buttonGradientEnd]}
                    style={styles.submitButtonGradient}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color={COLORS.white} />
                    ) : (
                      <Text style={styles.submitButtonText}>Создать корпоративное мероприятие</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              );
            default:
              return null;
          }
        }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.container}>
        {renderMainContent()}

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

        <DetailsModal
          visible={detailsModalVisible}
          onClose={() => setDetailsModalVisible(false)}
          item={selectedItem}
        />
      </SafeAreaView>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    flex: 1,
    fontSize: 18,
    color: COLORS.textPrimary,
  },
  categoriesContainer: {
    marginBottom: 24,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
    marginBottom: 12,
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
  disabledCategoryButton: {
    opacity: 0.7,
  },
  categoryButtonGradient: {
    padding: 14,
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  categoryButtonAdd: {
    width: '48%',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryPlusText: {
    fontSize: 28,
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
    justifyContent: 'flex-end',
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
    marginBottom: 18,
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
    borderRadius: 16,
    width: '90%',
    padding: 18,
    maxHeight: SCREEN_HEIGHT * 0.7,
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
  calendarContainer: {
  backgroundColor: MODAL_COLORS.background,
  borderRadius: 16,
  padding: 18,
  width: '100%', // Ensure full width
  maxHeight: SCREEN_HEIGHT * 0.7, // Adjust max height if needed
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
});

export default CorporateEventScreen;