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
import { LinearGradient } from "expo-linear-gradient";
import { useDispatch, useSelector } from "react-redux";
import api from "../api/api";
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
 accent: "#FBBF24",
  shadow: "rgba(0, 0, 0, 0.3)",
  error: '#FF0000',
  white: '#FFFFFF',
  buttonGradientStart: '#D3C5B7',
 buttonGradientEnd: "#A68A6E",
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
  transport: 1,
  restaurant: 2,
  alcohol: 3,
  cake: 4,
  tamada: 5,
  program: 6,
  "technical-equipment-rental": 7,
  flowers: 8,
  jewelry: 9,
};

const typesMapping = [
  { key: "transport", costField: "cost", type: "transport", label: "Прокат авто" },
  { key: "restaurants", costField: "averageCost", type: "restaurant", label: "Ресторан" },
  { key: "alcohol", costField: "cost", type: "alcohol", label: "Алкоголь" },
  { key: "cakes", costField: "cost", type: "cake", label: "Торты" },
  { key: "tamada", costField: "cost", type: "tamada", label: "Ведущий" },
  { key: "programs", costField: "cost", type: "program", label: "Шоу программа" },
  { key: "technical-equipment-rentals", costField: "cost", type: "technical-equipment-rental", label: "Аренда технического оборудования" },
  { key: "flowers", costField: "cost", type: "flowers", label: "Цветы" },
  { key: "jewelry", costField: "cost", type: "jewelry", label: "Ювелирные изделия" }
];

const categoryToTypeMap = {
  "Прокат авто": "transport",
  "Ресторан": "restaurant",
  "Алкоголь": "alcohol",
  "Торты": "cake",
  "Ведущий": "tamada",
  "Шоу программа": "program",
  "Аренда технического оборудования": "technical-equipment-rental",
  "Цветы": "flowers",
  "Ювелирные изделия": "jewelry"
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
          title = `${item.name} (${cost} ₸)`;
          break;
          case "jewelry":
        title = `Ювелирные изделия: ${item.storeName} - ${item.itemName} (${cost} ₸)`;
        break;
      case "flowers":
        title = `${item.flowerName || 'Без названия'} (${cost} ₸)`;
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
 
      case "jewelry":
    title = `${item.itemName || 'Без названия'} (${cost} ₸)`;
    break;
  case "flowers":
    title = `${item.flowerName || 'Без названия'} (${cost} ₸)`;
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
    title = `${item.itemName || 'Без названия'} (${cost} ₸)`;
    break;
  case "flowers":
    title = `${item.flowerName || 'Без названия'} (${cost} ₸)`;
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
              onClose();
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
      onClose
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

const ConferencesEventScreen = ({ navigation, route }) => {
  const defaultCategories = [
    "Прокат авто",
    "Ресторан",
    "Алкоголь",
    "Торты",
    "Ведущий",
    "Шоу программа",
    "Аренда технического оборудования",
    "Цветы",
    "Ювелирные изделия"
  ];

  const selectedCategories = route?.params?.selectedCategories || [];
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
    flowers: [],
    jewelry: []
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
  const [eventDetailsModalVisible, setEventDetailsModalVisible] = useState(false);

  const serviceTypeMap = {
    'transport': 'Transport',
    'restaurant': 'Restaurant',
    'alcohol': 'Alcohol',
    'cake': 'Cakes',
    'tamada': 'Tamada',
    'program': 'Program',
    'technical-equipment-rental': 'TechnicalEquipmentRental',
    'flowers': 'Flowers',
    'jewelry': 'Jewelry'
  };

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
        api.getRestaurants().catch((err) => { console.error("Ошибка получения ресторанов:", err); return { data: [] }; }),
        api.getTamada().catch((err) => { console.error("Ошибка получения ведущих:", err); return { data: [] }; }),
        api.getPrograms().catch((err) => { console.error("Ошибка получения программ:", err); return { data: [] }; }),
        api.getTransport().catch((err) => { console.error("Ошибка получения транспорта:", err); return { data: [] }; }),
        api.getCakes().catch((err) => { console.error("Ошибка получения тортов:", err); return { data: [] }; }),
        api.getAlcohol().catch((err) => { console.error("Ошибка получения алкоголя:", err); return { data: [] }; }),
        api.getTechnicalEquipmentRentals().catch((err) => { console.error("Ошибка получения аренды технического оснащения:", err); return { data: [] }; }),
        api.getFlowers().catch((err) => { console.error("Ошибка получения цветов:", err); return { data: [] }; }),
        api.getJewelry().catch((err) => { console.error("Ошибка получения ювелирных изделий:", err); return { data: [] }; })
      ]);
      const [
        restaurants,
        tamada,
        programs,
        transport,
        cakes,
        alcohol,
        technicalEquipmentRentals,
        flowers,
        jewelry
      ] = responses.map((res) => res.data);
      setData({
        restaurants: restaurants.map(item => ({ ...item, averageCost: item.averageCost || 0 })),
        tamada: tamada.map(item => ({ ...item, cost: item.cost || 0 })),
        programs: programs.map(item => ({ ...item, cost: item.cost || 0 })),
        transport: transport.map(item => ({ ...item, cost: item.cost || 0 })),
        cakes: cakes.map(item => ({ ...item, cost: item.cost || 0 })),
        alcohol: alcohol.map(item => ({ ...item, cost: item.cost || 0 })),
        "technical-equipment-rentals": technicalEquipmentRentals.map(item => ({ ...item, cost: item.cost || 0 })),
        flowers: flowers.map(item => ({ ...item, cost: item.cost || 0 })),
        jewelry: jewelry.map(item => ({ ...item, cost: item.cost || 0 }))
      });
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
            alert(`Ресторан ${item.name} вмещает максимум ${item.capacity} гостей.`);
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
          console.log(`Нет ресторанов для ${guests} гостей в категории ${label}`);
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
          console.log(`Рестораны в категории ${label} не вписываются в остаток бюджета ${remaining}`);
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
          console.log(`Элементы в категории ${label} не вписываются в остаток бюджета ${remaining}`);
        }
      }
    }

    if (newSelectedItems.length === 0 && activeCategories.length > 0) {
      alert("Нет элементов, подходящих под ваш бюджет и количество гостей из выбранных категорий.");
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
    if (shouldFilter && budget && guestCount && !isNaN(parseFloat(budget)) && !isNaN(parseFloat(guestCount))) {
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
          alert(`Этот ресторан не может вместить ${guestCount} гостей. Максимальная вместимость: ${itemToAdd.capacity}.`);
          return;
        }
        setFilteredData((prev) => prev.filter((i) => i.type !== "restaurant" || i.id === itemToAdd.id));
      }

      setFilteredData((prevSelected) => {
        const existingItem = prevSelected.find((i) => `${i.type}-${i.id}` === itemKey);
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
          const effectiveQuantity = itemToAdd.type === "restaurant" ? parseInt(guestCount, 10) || 1 : 1;
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
          const updatedQtys = { ...prevQtys, [itemKey]: itemToAdd.type === "restaurant" ? guestCount || "1" : newQuantity };
          const totalSpent = updatedSelectedItems.reduce((sum, selItem) => {
            const qtyKey = `${selItem.type}-${selItem.id}`;
            const itemQty = selItem.type === "restaurant" ? parseInt(guestCount, 10) || 1 : parseInt(updatedQtys[qtyKey] || "1", 10);
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
            const itemQty = selItem.type === "restaurant" ? parseInt(guestCount, 10) || 1 : parseInt(rest[qtyKey] || "1", 10);
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
            disableTouchEvent: isFullyBooked
          };
        }
        blockedDaysData[date].dots.push({ key: restaurantId.toString(), restaurantId, restaurantName, color: 'red' });
      });

      setBlockedDays(blockedDaysData);
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
     
   console.log('Current blockedDays state (ConferencesEventScreen):', JSON.stringify(blockedDays, null, 2));
   const calendarMarkedDates = Object.keys(blockedDays).reduce((acc, date) => {
     acc[date] = { ...blockedDays[date], marked: true };
     return acc;
   }, {
     [eventDate.toISOString().split('T')[0]]: {
       selected: true,
       selectedColor: COLORS.primary,
       disableTouchEvent: true,
     },
   });
   console.log('Passing to Calendar markedDates (ConferencesEventScreen):', JSON.stringify(calendarMarkedDates, null, 2));
   
   const calculateTotalCost = useMemo(() => {
     return filteredData.reduce((sum, item) => {
       const qtyKey = `${item.type}-${item.id}`;
       const qty = item.type === "restaurant" ? parseInt(guestCount, 10) || 1 : parseInt(quantities[qtyKey] || "1", 10);
       const itemCost = item.type === "restaurant" ? (item.averageCost || 0) : (item.cost || 0);
       return sum + itemCost * qty;
     }, 0);
   }, [filteredData, quantities, guestCount]);

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
      const totalBudget = parseFloat(budget);
      const spentAmount = calculateTotalCost;
      const remaining = remainingBudget;

      const payload = { 
        name: eventName.trim(), 
        date: eventDate.toISOString().split('T')[0],
        budget: totalBudget,
        total_cost: spentAmount,
        paid_amount: 0, // Assuming paid amount is 0 initially
        remaining_balance: remaining,
        guestCount: parseInt(guestCount, 10),
        type: 'conference'
      };

      const categoryResponse = await api.createEventCategory(payload, token);
      
      const categoryId = categoryResponse.data.id;
      if (!categoryId) {
        throw new Error('Не получен ID категории от сервера');
      }

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
      
      for (const item of filteredData) {
        const serviceType = serviceTypeMap[item.type] || item.type;
        const quantity =
          item.type === 'restaurant'
            ? parseInt(guestCount, 10)
            : parseInt(quantities[`${item.type}-${item.id}`] || '1');

        await api.addServiceToCategory(
          categoryId,
          { serviceId: item.id, serviceType, quantity },
          token
        );
      }

      alert('Конференция успешно создана!');
      
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
      console.error('Ошибка при создании мероприятия:', error.response?.data || error.message);
      let errorMessage = 'Ошибка при создании мероприятия';
      if (error.response?.data?.error) {
        errorMessage += ': ' + error.response.data.error;
      } else if (error.message) {
        errorMessage += ': ' + error.message;
      }
      alert(errorMessage);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
   };
  
  const handleCategoryPress = (category) => {
    const type = categoryToTypeMap[category];
    if (!type) return;
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
        console.log(`Категория "${category}" включена`);
        return prev.filter((cat) => cat !== category);
      } else {
        console.log(`Категория "${category}" отключена`);
        const type = categoryToTypeMap[category];
        if (type) {
          setFilteredData((prevData) => prevData.filter((item) => item.type !== type));
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

  const renderCategories = ({ item }) => {
    if (item === "Добавить") {
      return null;
    }

    const isDisabled = disabledCategories.includes(item);
    
    const categoryIcons = {
      "Прокат авто": { on: require("../../assets/prokatAvtoOn.png"), off: require("../../assets/prokatAutooff.png") },
      "Ресторан": { on: require("../../assets/restaurantOn.png"), off: require("../../assets/restaurantTurnOff.png") },
      "Алкоголь": { on: require("../../assets/alcoholOn.png"), off: require("../../assets/alcoholOff.png") },
      "Торты": { on: require("../../assets/torty.png"), off: require("../../assets/tortyTurnOff.png") },
      "Ведущий": { on: require("../../assets/vedushieOn.png"), off: require("../../assets/vedushieOff.png") },
      "Шоу программа": { on: require("../../assets/show.png"), off: require("../../assets/showTurnOff.png") },
      // "Аренда технического оборудования": { on: require("../../assets/techEquipmentOn.png"), off: require("../../assets/techEquipmentOff.png") },
      "Цветы": { on: require("../../assets/cvetyOn.png"), off: require("../../assets/cvetyOff.png") },
      "Ювелирные изделия": { on: require("../../assets/uvizdeliyaOn.png"), off: require("../../assets/uvIzdeliyaOff.png") }
    };

    const defaultIcon = require("../../assets/join.png");

    return (
      <View style={styles.categoryRow}>
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
                name={
                  item === "Прокат авто" ? "directions-car" :
                  item === "Ресторан" ? "restaurant" :
                  item === "Алкоголь" ? "local-drink" :
                  item === "Торты" ? "cake" :
                  item === "Ведущий" ? "mic" :
                  item === "Шоу программа" ? "theater-comedy" :
                  item === "Аренда технического оборудования" ? "settings" :
                  item === "Цветы" ? "local-florist" :
                  item === "Ювелирные изделия" ? "diamond" :
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

  const DetailsModal = ({ visible, onClose, item }) => {
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [files, setFiles] = useState([]);
    const [loadingFiles, setLoadingFiles] = useState(true);
    
    if (!item) return null;

    const BASE_URL = process.env.EXPO_PUBLIC_API_baseURL;

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

    useEffect(() => {
      const fetchFiles = async () => {
        if (!item || !item.type || !item.id) {
          setLoadingFiles(false);
          return;
        }
        
        try {
          setLoadingFiles(true);
          const endpoint = getEndpointForServiceType(item.type);
          const response = await axios.get(`${BASE_URL}/api/${endpoint}/${item.id}/files`);
          const fetchedFiles = response.data || [];
          setFiles(fetchedFiles);
        } catch (err) {
          if (err.response && err.response.status === 400) {
            console.log("Файлы для данного элемента не найдены или запрос некорректен (400).");
          } else {
            console.error("Ошибка загрузки файлов:", err);
          }
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
        switch (item.type) {
            case "restaurant": return item.name;
            case "tamada": return item.name;
            case "program": return item.teamName || item.name;
            case "transport": return `${item.salonName || ''} - ${item.carName || ''}`.trim();
            case "cake": return item.name;
            case "alcohol": return `${item.salonName || ''} - ${item.alcoholName || ''}`.trim();
            case "flowers": return `${item.salonName || ''} - ${item.flowerName || ''}`.trim();
            case "jewelry": return `${item.storeName || ''} - ${item.itemName || ''}`.trim();
            case "technical-equipment-rental": return item.name;
            default: return item.name || "Детали";
        }
    };

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
      <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
        <View style={styles.fullscreenModalContainer}>
          <View style={styles.fullscreenModalHeader}>
            <TouchableOpacity style={styles.fullscreenBackButton} onPress={onClose} accessible accessibilityLabel="Назад">
              <AntDesign name="left" size={24} color="#5A4032" />
            </TouchableOpacity>
            <Text style={styles.fullscreenModalHeaderTitle} numberOfLines={1}>{getItemTitle()}</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView style={styles.fullscreenModalScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.photoSliderWrapper}>
              {loadingFiles ? (
                <View style={[styles.fullscreenPhoto, { justifyContent: 'center', alignItems: 'center' }]}>
                  <ActivityIndicator size="large" color="#897066" />
                  <Text style={{ marginTop: 10, color: '#897066' }}>Загрузка...</Text>
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
                      <Image source={{ uri: photo }} style={styles.fullscreenPhoto} resizeMode="cover" />
                    )}
                  />
                  {displayPhotos.length > 1 && (
                    <View style={styles.photoIndicators}>
                      {displayPhotos.map((_, index) => (
                        <View key={`indicator-${index}`} style={[styles.photoIndicator, index === currentPhotoIndex && styles.photoIndicatorActive]} />
                      ))}
                    </View>
                  )}
                </>
              )}
            </View>

            <View style={styles.fullscreenContentCard}>
              <Text style={styles.fullscreenTitle}>{getItemTitle()}</Text>
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
              {item.portfolio && (
                <TouchableOpacity style={styles.fullscreenPortfolioButton} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Linking.openURL(item.portfolio).catch((err) => console.error("Ошибка:", err)); }}>
                  <LinearGradient colors={[COLORS.buttonGradientStart, COLORS.buttonGradientEnd]} style={styles.fullscreenPortfolioGradient}>
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

  return (
    <>
      <LinearGradient colors={["#F1EBDD", "#897066"]} start={{ x: 0, y: 1 }} end={{ x: 0, y: 0 }} style={styles.splashContainer}>
        <TouchableOpacity style={styles.backButtonTop} onPress={() => navigation.goBack()} accessible accessibilityLabel="Вернуться назад">
          <AntDesign name="left" size={24} color="black" />
        </TouchableOpacity>
        {/* Fixed Header Content */}
        <View style={styles.logoContainer}>
          <Image source={require("../../assets/kazanRevert.png")} style={styles.potIcon} resizeMode="contain" />
        </View>


        <View style={styles.headerContainer}>
          <View style={styles.budgetContainer}>
            <View style={styles.categoryItemAdd}>
              <TouchableOpacity style={styles.categoryButtonAdd} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setAddItemModalVisible(true); }} accessible accessibilityLabel="Добавить элемент">
                <LinearGradient colors={[COLORS.buttonGradientStart, COLORS.buttonGradientEnd]} style={styles.categoryButtonGradient}>
                  <Text style={styles.categoryPlusText}>+</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
            <TextInput style={styles.budgetInput} placeholder="Бюджет (т)" value={formatBudget(budget)} onChangeText={handleBudgetChange} placeholderTextColor={COLORS.placeholder} keyboardType="numeric" maxLength={18} accessible accessibilityLabel="Бюджет мероприятия" />
            <TextInput style={styles.guestInput} placeholder="Гостей" value={guestCount} onChangeText={handleGuestCountChange} placeholderTextColor={COLORS.placeholder} keyboardType="numeric" maxLength={5} accessible accessibilityLabel="Количество гостей" />
          </View>
          <Modal animationType="fade" transparent={true} visible={isLoading}>
            <View style={styles.loaderOverlay}>
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loaderText}>Подбираем...</Text>
              </View>
            </View>
          </Modal>
        </View>

        {/* Scrollable List Content */}
        <View style={[styles.listContainer, { flex: 1 }]}> 
          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} />
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 200 }}>
              <View style={styles.categoryGrid}>
                {[...categories, 'Добавить'].map((item, index) => (
                  <View key={index} style={styles.categoryItem}>
                    {renderCategories({ item })}
                  </View>
                ))}
              </View>
            </ScrollView>
          )}
        </View>

        {/* Custom Footer - Fixed at bottom */}
        <View style={styles.customFooterContainer}>
          <Image source={require("../../assets/footer.png")} style={styles.footerBackground} resizeMode="cover" />
          
          <View style={styles.footerContent}>
            <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Home")}>
              <Icon name="home" size={24} color="#5A4032" />
              <Text style={styles.navText}>Главная</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("MyEvents")}>
              <Icon name="event" size={24} color="#5A4032" />
              <Text style={styles.navText}>Мои мероприятия</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Profile")}>
              <Icon name="person" size={24} color="#5A4032" />
              <Text style={styles.navText}>Профиль</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.floatingButtonContainer}>
            <TouchableOpacity style={styles.nextButton} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setEventDetailsModalVisible(true); }} disabled={loading} accessible accessibilityLabel="Далее">
              <Image source={require("../../assets/next.png")} style={styles.potIcon3} resizeMode="contain" />
            </TouchableOpacity>
          </View>
        </View>
        <AddItemModal visible={addItemModalVisible} onClose={() => setAddItemModalVisible(false)} filteredItems={combinedData} filteredData={filteredData} handleAddItem={handleAddItem} setDetailsModalVisible={setDetailsModalVisible} setSelectedItem={setSelectedItem} quantities={quantities} updateCategories={updateCategories} />
        <CategoryItemsModal visible={categoryModalVisible} onClose={() => setCategoryModalVisible(false)} categoryItems={selectedCategoryItems} categoryLabel={selectedCategoryLabel} categoryType={selectedCategoryType} filteredData={filteredData} handleAddItem={handleAddItem} handleRemoveItem={handleRemoveItem} setDetailsModalVisible={setDetailsModalVisible} setSelectedItem={setSelectedItem} quantities={quantities} setQuantities={setQuantities} budget={budget} setFilteredData={setFilteredData} setRemainingBudget={setRemainingBudget} updateCategories={updateCategories} guestCount={guestCount} setGuestCount={setGuestCount} />
        <DetailsModal visible={detailsModalVisible} onClose={() => setDetailsModalVisible(false)} item={selectedItem} />
        <Modal visible={eventDetailsModalVisible} transparent animationType="slide" onRequestClose={() => setEventDetailsModalVisible(false)}>
          <SafeAreaView style={[styles.modalOverlay, { justifyContent: 'center', alignItems: 'center' }]}>
            <View style={styles.eventDetailsModalContainer}>
              <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { textAlign: 'center'}]}>Создание мероприятия "Конференция"</Text>
                  <TouchableOpacity style={styles.modalCloseButton} onPress={() => setEventDetailsModalVisible(false)} accessible accessibilityLabel="Закрыть">
                    <Icon name="close" size={30} color={MODAL_COLORS.closeButtonColor} />
                  </TouchableOpacity>
                </View>

                <View style={styles.inputContainer}>
                  {/* <Icon name="event-note" size={20} color={MODAL_COLORS.icon} style={styles.inputIcon} /> */}
                  <TextInput
                    style={styles.input}
                    placeholder="Название конференции"
                    value={eventName}
                    onChangeText={setEventName}
                    placeholderTextColor={MODAL_COLORS.textSecondary}
                  />
                </View>

                <TouchableOpacity style={styles.datePickerButton} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowDatePicker(true); }}>
                  <Icon name="calendar-today" size={20} color={MODAL_COLORS.activeFilter} style={styles.buttonIcon} />
                  <Text style={styles.datePickerText}>{eventDate.toLocaleDateString("ru-RU")}</Text>
                </TouchableOpacity>

                {showDatePicker && (
                  <Calendar
                    style={styles.calendar}
                    current={eventDate.toISOString().split("T")[0]}
                    onDayPress={(day) => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      const dateString = day.dateString;
                      const dayInfo = blockedDays[dateString];

                      if (dayInfo && dayInfo.disabled) {
                        alert(`Дата ${dateString} полностью забронирована.`);
                        return;
                      }

                      const selectedRestaurant = filteredData.find(item => item.type === 'restaurant');
                      if (selectedRestaurant && dayInfo && dayInfo.dots) {
                        const isRestaurantBooked = dayInfo.dots.some(dot => dot.restaurantId === selectedRestaurant.id);
                        if (isRestaurantBooked) {
                          alert(`Ресторан "${selectedRestaurant.name}" уже забронирован на ${dateString}. Пожалуйста, выберите другую дату или другой ресторан.`);
                          return;
                        }
                      }
                      
                      setEventDate(new Date(day.dateString));
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
                    minDate={new Date().toISOString().split("T")[0]}
                    theme={{
                        arrowColor: MODAL_COLORS.activeFilter,
                        selectedDayBackgroundColor: MODAL_COLORS.activeFilter,
                        selectedDayTextColor: MODAL_COLORS.activeFilterText,
                        todayTextColor: MODAL_COLORS.activeFilter,
                        dotColor: MODAL_COLORS.activeFilter,
                        disabledArrowColor: MODAL_COLORS.separator,
                        textDisabledColor: MODAL_COLORS.separator,
                        'stylesheet.calendar.header': {
                            week: { marginTop: 5, flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: MODAL_COLORS.separator, },
                        },
                        dayTextColor: MODAL_COLORS.textPrimary,
                        monthTextColor: MODAL_COLORS.textPrimary,
                        textSectionTitleColor: MODAL_COLORS.textSecondary,
                    }}
                  />
                )}

                <Text style={styles.subtitle}>Выбранные элементы:</Text>
                <View style={styles.itemsContainer}>
                  {filteredData.length > 0 ? (
                    Object.entries(
                      filteredData.reduce((acc, item) => {
                        const type = item.type;
                        if (!acc[type]) acc[type] = [];
                        acc[type].push(item);
                        return acc;
                      }, {})
                    ).sort(([typeA], [typeB]) => (typeOrder[typeA] || 13) - (typeOrder[typeB] || 13))
                    .map(([type, items]) => (
                      <View key={type} style={{marginBottom:10}}>
                        <Text style={styles.categoryHeaderSummary}>
                          {typesMapping.find((t) => t.type === type)?.label || type} ({items.length})
                        </Text>
                        {items.map((item) => {
                          const quantity = parseInt(quantities[`${item.type}-${item.id}`] || "1");
                          const cost = item.type === "restaurant" ? item.averageCost : item.cost;
                          const effectiveQuantity = item.type === "restaurant" ? (parseInt(guestCount, 10) || 1) : quantity;
                          const totalItemCost = cost * effectiveQuantity;
                          let itemTitle = "";
                          switch (item.type) {
                            case "restaurant": itemTitle = `${item.name} - ${cost} x ${effectiveQuantity} = ${totalItemCost} тг`; break;
                            case "tamada": itemTitle = `${item.name} - ${cost} x ${effectiveQuantity} = ${totalItemCost} тг`; break;
                            case "program": itemTitle = `${item.teamName} - ${cost} x ${effectiveQuantity} = ${totalItemCost} тг`; break;
                            case "alcohol": itemTitle = `${item.alcoholName} (${item.salonName}) - ${cost} x ${effectiveQuantity} = ${totalItemCost} тг`; break;
                            case "transport": itemTitle = `${item.carName} (${item.salonName}) - ${cost} x ${effectiveQuantity} = ${totalItemCost} тг`; break;
                            case "jewelry": itemTitle = `${item.itemName} (${item.storeName}) - ${cost} x ${effectiveQuantity} = ${totalItemCost} тг`; break;
                            case "flowers": itemTitle = `${item.flowerName} - ${cost} x ${effectiveQuantity} = ${totalItemCost} тг`; break;
                            case "cake": itemTitle = `${item.name} - ${cost} x ${effectiveQuantity} = ${totalItemCost} тг`; break;
                            case "technical-equipment-rental": itemTitle = `${item.name} - ${cost} x ${effectiveQuantity} = ${totalItemCost} тг`; break;
                            default: itemTitle = `${item.name || item.itemName || item.teamName} - ${cost} x ${effectiveQuantity} = ${totalItemCost} тг`;
                          }
                          return (
                            <View key={`${item.type}-${item.id}`} style={styles.itemContainer}>
                              <Text style={styles.itemText}>{itemTitle}</Text>
                            </View>
                          );
                        })}
                      </View>
                    ))
                  ) : ( <Text style={styles.noItems}>Нет выбранных элементов</Text> )}
                </View>

                <View style={styles.totalContainer}>
                  <Text style={styles.totalText}>Общая стоимость: {calculateTotalCost.toLocaleString("ru-RU")} тг</Text>
                  {budget && <Text style={styles.totalText}>Ваш бюджет: {parseFloat(budget).toLocaleString("ru-RU")} ₸</Text> }
                {budget && (
                  <Text style={[styles.budgetInfo, remainingBudget < 0 && styles.budgetError]}>
                    Остаток: {remainingBudget.toLocaleString("ru-RU")} ₸ {remainingBudget < 0 && "(превышение)"}
                  </Text>
                )}
                </View>
                

                <View style={styles.modalButtonContainer}>
                  <TouchableOpacity style={[styles.modalButton, styles.confirmButton]} onPress={() => { setEventDetailsModalVisible(false); handleSubmit(); }} disabled={loading}>
                    <Icon name="check" size={20} color={MODAL_COLORS.activeFilterText} style={styles.buttonIcon} />
                    <Text style={styles.modalButtonText}>Создать конференцию</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </SafeAreaView>
        </Modal>
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  splashContainer: { 
    flex: 1 
  },
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
  backButtonTop: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
    padding: 10,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 60,
    marginBottom: 20,
  },
  potIcon: {
    width: 80,
    height: 80,
  },
 topPatternContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: "5%", // Reduced from 20% to 15% to save vertical space
    zIndex: -1,
    resizeMode: "cover",
    opacity: 0.8,
    marginBottom: "1%", // Reduced from 10% to 5%
  },

  footerContainer: {
    // alignItems: 'center',
 // Add some top margin to separate it from categories
    paddingBottom: 40, // Add bottom margin for spacing
    // backgroundColor: 'transparent',
  },

  headerContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  budgetContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    textAlign: 'center',
  },
  guestInput: {
    flex: 0.6,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 10,
    padding: 10,
    color: COLORS.white,
    fontSize: 16,
    textAlign: 'center',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 10,
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
    marginBottom: 10,
  },

  bottomContainer: {
    alignItems: 'center',
    marginTop: 150, // Add some top margin to separate it from categories
    marginBottom: 0, // Add bottom margin for spacing
    backgroundColor: 'transparent',
  },
  // nextButton: {
  //   width: 80,
  //   height: 80,
  //   alignItems: 'center',
  //   justifyContent: 'center',
  // },
  potIcon3: { 
    width: 70, 
    height: 70, 
  },
  categoryPlusText: {
    fontSize: 24,
    color: COLORS.white,
    fontWeight: "bold",
  },
  categoryText: {
    fontSize: 14,
    color: COLORS.white,
    fontWeight: "600",
    textAlign: "center",
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 120,
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
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: MODAL_COLORS.textPrimary,
    marginBottom: 10,
  },
  input: {
    backgroundColor: MODAL_COLORS.inputBackground,
    borderWidth: 1,
    borderColor: MODAL_COLORS.inputBorder,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: MODAL_COLORS.textPrimary,
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
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
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
    opacity: 0.5,
  },
  categoryButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center'
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
  removeCategoryButton: {
    padding: 10,
    marginRight: 5,
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
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: MODAL_COLORS.separator,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: MODAL_COLORS.textPrimary,
    flexShrink: 1,
    marginRight: 10,
  },
  modalCloseButton: {
    padding: 8,
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
    marginBottom: 10,
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
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
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
    paddingHorizontal: 5,
  },
  eventDetailsModalContainer: {
    backgroundColor: MODAL_COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    width: '100%',
  },
  modalContent: {
    paddingTop: 10,
  },
  calendarContainer: {
    backgroundColor: MODAL_COLORS.background,
    borderRadius: 16,
    padding: 18,
    marginHorizontal: 20,
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
    width: '100%',
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
    marginHorizontal: 10,
  },
  fullscreenModalScroll: {
    flex: 1,
  },
  fullscreenPhoto: {
    width: Dimensions.get('window').width,
    height: 400,
    backgroundColor: '#E0D5C7',
  },
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
  customFooterContainer: {
    position: 'absolute', 
    bottom: 0,
    left: 0,
    right: 0,
    height: 170, 
    justifyContent: 'flex-end',
    zIndex: 100,
  },
  footerBackground: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    backgroundColor: '#d3c5b722', 
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingBottom: 30, 
    height: '100%',
    zIndex: 102,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    width: 80,
  },
  navText: {
    fontSize: 10,
    color: '#5A4032',
    marginTop: 4,
    fontFamily: 'System', 
    fontWeight: '500',
  },
  floatingButtonContainer: {
    position: 'absolute',
    top: 0, 
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 105,
  },
  nextButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff', 
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
  nextButtonText: {
  },
  subtitle: {
    fontSize: 17,
    fontWeight: "600",
    color: MODAL_COLORS.textPrimary,
    marginBottom: 10,
    marginTop: 15,
    paddingHorizontal: 20,
  },
  itemsContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  itemContainer: {
    // backgroundColor: MODAL_COLORS.inactiveFilter,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,

  },
  itemText: {
    fontSize: 14,
    color: MODAL_COLORS.textPrimary,
    lineHeight: 20,
  },
  noItems: {
    fontSize: 15,
    color: MODAL_COLORS.textSecondary,
    textAlign: "center",
    marginVertical: 20,
  },
  categoryHeaderSummary: {
    fontSize: 16,
    fontWeight: "600",
    color: MODAL_COLORS.textPrimary,
    marginBottom: 8,
  },
  totalContainer: {
    paddingHorizontal: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: MODAL_COLORS.separator,
  },
  totalText: {
    fontSize: 18,
    fontWeight: "700",
    color: MODAL_COLORS.textPrimary,
    marginBottom: 8,
  },
  budgetInfo: {
    fontSize: 16,
    fontWeight: "600",
    color: MODAL_COLORS.textPrimary,
    marginBottom: 8,
  },
  budgetError: {
    color: COLORS.error,
  },
  modalButtonContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  modalButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  confirmButton: {
    backgroundColor: MODAL_COLORS.activeFilter,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: MODAL_COLORS.activeFilterText,
    marginLeft: 8,
  },
  calendar: {
    marginBottom: 15,
    borderRadius: 10,
    overflow: 'hidden',
  },
});


export default ConferencesEventScreen;