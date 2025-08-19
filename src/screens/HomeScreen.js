import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
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
  ScrollView,
  SafeAreaView,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
// import Icon from "react-native-vector-icons/MaterialIcons";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useDispatch, useSelector } from "react-redux";
import api from "../api/api";
import * as Animatable from "react-native-animatable";
import { Calendar } from "react-native-calendars";
import Icon from "react-native-vector-icons/MaterialIcons";
import Icon2 from "react-native-vector-icons/MaterialCommunityIcons";
import * as Haptics from "expo-haptics";
import * as Linking from 'expo-linking';

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const COLORS = {
  primary: "#FF6F61",
  secondary: "#4A90E2",
  background: "#FDFDFD",
  card: "#FFFFFF",
  textPrimary: "#2D3748",
  textSecondary: "#718096",
  accent: "#FBBF24",
  shadow: "rgba(0, 0, 0, 0.3)",
  error: "#FF0000",
  white: "#FFFFFF",
  buttonGradientStart: "#D3C5B7",
  buttonGradientEnd: "#A68A6E",
  placeholder: "rgba(255, 255, 255, 0.7)", // Added for placeholder text on dark bg
};

const MODAL_COLORS = {
  background: '#EDE7D9',
  cardBackground: '#FDFBF5',
  primaryActionStart: COLORS.buttonGradientStart,
  primaryActionEnd: COLORS.buttonGradientEnd,
  textPrimary: '#5A4032',
  textSecondary: '#718096',
  inputBackground: '#FBF9F7',
  inputBorder: '#B0A092',
  activeFilter: COLORS.buttonGradientEnd,
  activeFilterText: COLORS.white,
  inactiveFilter: '#EFEBE4',
  inactiveFilterText: '#5A4032',
  separator: '#DCCFC0',
  shadow: 'rgba(0, 0, 0, 0.15)',
  icon: '#5A4032',
  closeButtonColor: '#5A4032',
  overlayBackground: 'rgba(45, 55, 72, 0.65)',
};


const typeOrder = {
  restaurant: 1,
  clothing: 2,
  tamada: 3,
  program: 4,
  traditionalGift: 5,
  flowers: 6,
  transport: 7,
  cake: 8,
  alcohol: 9,
  goods: 10,
  jewelry: 11,
};

const typesMapping = [
  { key: "clothing", costField: "cost", type: "clothing", label: "Одежда" },
  { key: "tamada", costField: "cost", type: "tamada", label: "Тамада" },
  { key: "programs", costField: "cost", type: "program", label: "Программа" },
  {
    key: "traditionalGifts",
    costField: "cost",
    type: "traditionalGift",
    label: "Традиционные подарки",
  },
  { key: "flowers", costField: "cost", type: "flowers", label: "Цветы" },
  { key: "cakes", costField: "cost", type: "cake", label: "Торты" },
  { key: "alcohol", costField: "cost", type: "alcohol", label: "Алкоголь" },
  {
    key: "transport",
    costField: "cost",
    type: "transport",
    label: "Прокат авто",
  },
  {
    key: "restaurants",
    costField: "averageCost",
    type: "restaurant",
    label: "Ресторан",
  },
  {
    key: "jewelry",
    costField: "cost",
    type: "jewelry",
    label: "Ювелирные изделия",
  },
];

const categoryToTypeMap = {
  "Ведущий": "tamada",
  "Ресторан": "restaurant",
  "Алкоголь": "alcohol",
  "Шоу программа": "program",
  "Ювелирные изделия": "jewelry",
  "Традиционные подарки": "traditionalGift",
  "Свадебный салон": "clothing",
  "Прокат авто": "transport",
  "Торты": "cake",
  "Цветы": "flowers",
};

const typeToCategoryMap = Object.fromEntries(
  Object.entries(categoryToTypeMap).map(([category, type]) => [type, category])
);


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
          label:
            typesMapping.find((t) => t.type === item.type)?.label || item.type,
        }))
        .filter(
          (value, index, self) =>
            self.findIndex((t) => t.type === value.type) === index
        )
        .sort((a, b) => (typeOrder[a.type] || 11) - (typeOrder[b.type] || 11)),
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
    console.log("filteredDataMemo:", result);
    return result.sort(
      (a, b) => (typeOrder[a.type] || 11) - (typeOrder[b.type] || 11)
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
      if (item.type === "goods" && item.category === "Прочее") return null;
      const cost = item.type === "restaurant" ? item.averageCost : item.cost;
      let title;
      switch (item.type) {
        case "restaurant":
          title = `Ресторан: ${item.name} (${cost} ₸)`;
          break;
        case "clothing":
          title = `Одежда: ${item.storeName} - ${item.itemName} (${cost} ₸)`;
          break;
        case "flowers":
          title = `Цветы: ${item.salonName} - ${item.flowerName} (${cost} ₸)`;
          break;
        case "cake":
          title = `Торты: ${item.name} (${cost} ₸)`;
          break;
        case "alcohol":
          title = `Алкоголь: ${item.salonName} - ${item.alcoholName} (${cost} ₸)`;
          break;
        case "program":
          title = `Программа: ${item.teamName} (${cost} ₸)`;
          break;
        case "tamada":
          title = `Тамада: ${item.name} (${cost} ₸)`;
          break;
        case "traditionalGift":
          title = `Традиц. подарки: ${item.salonName} - ${item.itemName} (${cost} ₸)`;
          break;
        case "transport":
          title = `Транспорт: ${item.salonName} - ${item.carName} (${cost} ₸)`;
          break;
        case "goods":
          title = `Товар: ${item.item_name} (${cost} ₸)`;
          break;
        case "jewelry":
          title = `Ювелирные изделия: ${item.storeName} - ${item.itemName} (${cost} ₸)`;
          break;
        default:
          title = "Неизвестный элемент";
      }
      return (
        <View style={styles.addModalItemCard}>
          <TouchableOpacity
            style={styles.addModalItemContent}
            onPress={() => {
              handleAddItem(item);
              const category = typeToCategoryMap[item.type];
              if (category) {
                updateCategories(category);
              }
            }}
          >
            <Text style={styles.addModalItemText}>{title}</Text>
            {count > 0 && (
              <Text style={styles.addModalItemCount}>Добавлено: {count}</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.detailsIconButton}
            onPress={() => {
              setSelectedItem(item);
              setDetailsModalVisible(true);
              
            }}
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
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                style={styles.addModalClearIcon}
                onPress={() => setSearchQuery("")}
              >
                <Icon name="clear" size={20} color={MODAL_COLORS.icon} />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView
            style={styles.addModalFilterScroll}
            showsVerticalScrollIndicator={false}
          >
            <View> {/* Removed addModalFilterContainer style */}
              <View> {/* Removed addModalTypeFilterContainer */}
                <Text style={styles.addModalFilterLabel}>Тип</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {uniqueTypes.map((typeObj) => (
                    <TouchableOpacity
                      key={typeObj.type}
                      style={[
                        styles.filterButtonBase,
                        selectedTypeFilter === typeObj.type ?
                          styles.addModalTypeButtonActive : styles.addModalTypeButton,
                      ]}
                      onPress={() => setSelectedTypeFilter(typeObj.type)}
                    >
                      <Text
                        style={[
                          styles.filterButtonTextBase,
                           selectedTypeFilter === typeObj.type ?
                           styles.addModalTypeButtonTextActive : styles.addModalTypeButtonText,
                        ]}
                      >
                        {typeObj.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              <View> {/* Removed addModalDistrictFilterContainer */}
                <Text style={styles.addModalFilterLabel}>Район</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {districts.map((district) => (
                    <TouchableOpacity
                      key={district}
                       style={[
                        styles.filterButtonBase,
                        selectedDistrict === district ?
                          styles.addModalDistrictButtonActive : styles.addModalDistrictButton,
                      ]}
                      onPress={() => setSelectedDistrict(district)}
                    >
                      <Text
                         style={[
                          styles.filterButtonTextBase,
                           selectedDistrict === district ?
                           styles.addModalDistrictButtonTextActive : styles.addModalDistrictButtonText,
                        ]}
                      >
                        {district === "all" ? "Все" : district}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              <View> {/* Removed addModalPriceFilterContainer */}
                <Text style={styles.addModalFilterLabel}>Цена</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {[
                    { label: "Все", value: "all" },
                    { label: "0-10k", value: "0-10000" },
                    { label: "10k-50k", value: "10000-50000" },
                    { label: "50k+", value: "50000+" },
                  ].map((option) => (
                    <TouchableOpacity
                      key={option.value}
                       style={[
                        styles.filterButtonBase,
                        costRange === option.value ?
                          styles.addModalPriceButtonActive : styles.addModalPriceButton,
                      ]}
                      onPress={() => setCostRange(option.value)}
                    >
                      <Text
                         style={[
                          styles.filterButtonTextBase,
                           costRange === option.value ?
                           styles.addModalPriceButtonTextActive : styles.addModalPriceButtonText,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </ScrollView>

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

// Компонент для отображения выбранного элемента
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
  onClose, // from CategoryItemsModal
  guestCount: initialGuestCount,
  setGuestCount, // Function to update guestCount in parent
}) => {
  const itemKey = `${item.type}-${item.id}`;
  const [inputQuantity, setInputQuantity] = useState(
    quantities[itemKey] || "1"
  );
  // Use initialGuestCount for the TextInput's value, specifically for restaurant type
  const [inputGuestCount, setInputGuestCount] = useState(
     initialGuestCount?.toString() || "1"
  );
  const isSelected = !!quantities[itemKey];


  useEffect(() => {
    setInputQuantity(quantities[itemKey] || "1");
  }, [quantities, itemKey]);

  // Sync inputGuestCount with parent's guestCount, primarily for restaurants
  useEffect(() => {
     if (item.type === "restaurant") {
      setInputGuestCount(initialGuestCount?.toString() || "1");
    }
  }, [initialGuestCount, item.type]);


  const cost = item.type === "restaurant" ? item.averageCost : item.cost;
  
  // Use the state `inputGuestCount` for restaurant calculations within this component
  const parsedGuestCountForRestaurant = parseInt(inputGuestCount, 10) || 1;
  const parsedQuantityGeneral = parseInt(inputQuantity, 10) || 1;

  const totalCost =
    item.type === "restaurant"
      ? cost * parsedGuestCountForRestaurant
      : cost * parsedQuantityGeneral;

  // Sync general item quantity (not restaurant guest count)
  const syncItemQuantity = (value) => {
    let newQuantityStr = value === "" || value === "0" ? "1" : value;
    newQuantityStr = newQuantityStr.replace(/[^0-9]/g, ""); // Ensure only digits
    if (newQuantityStr === "") newQuantityStr = "1"; // Fallback if cleared
    
    setInputQuantity(newQuantityStr);
    
    setQuantities((prevQuantities) => {
      const updatedQuantities = { ...prevQuantities, [itemKey]: newQuantityStr };
      
      // Recalculate total budget based on ALL items and their quantities/guest counts
      const totalSpent = filteredData.reduce((sum, dataItem) => {
        const key = `${dataItem.type}-${dataItem.id}`;
        const itemCost = dataItem.type === "restaurant" ? dataItem.averageCost : dataItem.cost;
        let effectiveCount;
        if (dataItem.type === "restaurant") {
          effectiveCount = parseInt(initialGuestCount, 10) || 1; // Use parent's guest count
        } else {
          effectiveCount = parseInt(updatedQuantities[key], 10) || 1;
        }
        return sum + (itemCost * effectiveCount);
      }, 0);
      setRemainingBudget(parseFloat(budget) - totalSpent);
      
      // Update totalCost for the current item in filteredData (if it exists)
      const updatedFilteredData = filteredData.map(dItem => {
        if (`${dItem.type}-${dItem.id}` === itemKey) {
          return { ...dItem, totalCost: cost * (parseInt(newQuantityStr, 10) || 1) };
        }
        return dItem;
      });
      setFilteredData(updatedFilteredData);
      
      return updatedQuantities;
    });
  };

  // Sync guest count specifically for the restaurant item
  const syncRestaurantGuestCount = (value) => {
    let newGuestCountStr = value === "" || value === "0" ? "1" : value;
    newGuestCountStr = newGuestCountStr.replace(/[^0-9]/g, "");
    if (newGuestCountStr === "") newGuestCountStr = "1";

    let guestCountNum = parseInt(newGuestCountStr, 10) || 1;

    if (guestCountNum > item.capacity) {
        guestCountNum = item.capacity;
        alert(`Максимальная вместимость ресторана: ${item.capacity} гостей.`);
    }
    newGuestCountStr = guestCountNum.toString();
    
    setInputGuestCount(newGuestCountStr); // Update local input state
    if (setGuestCount) {
        setGuestCount(guestCountNum); // Update parent's guest count state
    }

    // Recalculate total budget
     setQuantities((prevQuantities) => { // Even if quantities don't change, this triggers budget recalc
      const totalSpent = filteredData.reduce((sum, dataItem) => {
        const key = `${dataItem.type}-${dataItem.id}`;
        const itemCostVal = dataItem.type === "restaurant" ? dataItem.averageCost : dataItem.cost;
        let effectiveCount;
        if (dataItem.type === "restaurant") {
           // For the current item, use the new guestCountNum, for others, use parent's initialGuestCount
           effectiveCount = (`${dataItem.type}-${dataItem.id}` === itemKey) ? guestCountNum : (parseInt(initialGuestCount, 10) || 1) ;
        } else {
          effectiveCount = parseInt(prevQuantities[key], 10) || 1;
        }
        return sum + (itemCostVal * effectiveCount);
      }, 0);
      setRemainingBudget(parseFloat(budget) - totalSpent);

      const updatedFilteredData = filteredData.map(dItem => {
        if (`${dItem.type}-${dItem.id}` === itemKey) { // Update this restaurant's total cost
          return { ...dItem, totalCost: cost * guestCountNum };
        }
        return dItem;
      });
      setFilteredData(updatedFilteredData);
      
      return prevQuantities; 
    });
  };


  const handleAddItem = () => { // This is if the item was previously removed and is re-added.
    // For restaurant, quantity is tied to guestCount. For others, default to 1.
    syncItemQuantity("1"); 
    if (item.type === "restaurant" && setGuestCount) {
       setGuestCount(parseInt(inputGuestCount, 10) || 1) // Ensure parent guest count is set
    }
  };

  // Handlers for general quantity input
  const handleQuantityChange = (value) => {
    const filteredValue = value.replace(/[^0-9]/g, "");
    setInputQuantity(filteredValue); // Update local state immediately for responsiveness
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
  
  // Handlers for restaurant guest count input
  const handleGuestCountChange = (value) => {
    const filteredValue = value.replace(/[^0-9]/g, "");
    setInputGuestCount(filteredValue); // Update local state immediately
  };
  const handleGuestCountBlur = () => {
    syncRestaurantGuestCount(inputGuestCount);
  };
  const incrementGuestCount = () => {
    const currentGuestCount = parseInt(inputGuestCount, 10) || 0;
    syncRestaurantGuestCount((currentGuestCount + 1).toString());
  };
  const decrementGuestCount = () => {
    const currentGuestCount = parseInt(inputGuestCount, 10) || 1;
    if (currentGuestCount > 1) {
      syncRestaurantGuestCount((currentGuestCount - 1).toString());
    }
  };


  let title;
  switch (item.type) {
    case "restaurant":
      title = `${item.name} (${cost} ₸/гость, Вместимость: ${item.capacity})`;
      break;
    case "clothing":
      title = `${item.storeName} - ${item.itemName} (${cost} ₸)`;
      break;

    case "flowers":
      title = `${item.salonName} - ${item.flowerName} (${cost} ₸)`;
      break;
    case "cake":
      title = `${item.name} (${cost} ₸)`;
      break;
    case "alcohol":
      title = `${item.salonName} - ${item.alcoholName} (${cost} ₸)`;
      break;
    case "program":
      title = `${item.teamName} (${cost} ₸)`;
      break;
    case "tamada":
      title = `${item.name} (${cost} ₸)`;
      break;
    case "traditionalGift":
      title = `${item.salonName} - ${item.itemName} (${cost} ₸)`;
      break;
    case "transport":
      title = `${item.salonName} - ${item.carName} (${cost} ₸)`;
      break;
    case "goods":
      title = `${item.item_name} (${cost} ₸)`;
      break;
    case "jewelry":
      title = `${item.storeName} - ${item.itemName} (${cost} ₸)`;
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
            onPress={() => handleRemoveItem(item)}
          >
            <Icon2 name="trash-can-outline" size={22} color={MODAL_COLORS.icon} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              setSelectedItem(item);
              setDetailsModalVisible(true);
              if (onClose) onClose(); 
            }}
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
                />
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={incrementGuestCount}
                >
                  <Icon2 name="plus" size={18} color={MODAL_COLORS.icon} />
                </TouchableOpacity>
              </View>
              <Text style={styles.totalCost}>
                {totalCost.toLocaleString()} ₸
              </Text>
            </View>
          ) : (
            // For non-restaurant items
            <View style={styles.controlRow}>
                <Text style={styles.label}>Количество</Text>
                <View style={styles.quantityContainer}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={decrementQuantity}
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
                  />
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={incrementQuantity}
                  >
                    <Icon2 name="plus" size={18} color={MODAL_COLORS.icon} />
                  </TouchableOpacity>
                </View>
                 <Text style={styles.totalCost}> {/* Display total for this item */}
                    {totalCost.toLocaleString()} ₸
                </Text>
              </View>
          )}
        </>
      )}
    </View>
  );
};

// Модальное окно для отображения элементов категории
const CategoryItemsModal = ({
  visible,
  onClose,
  categoryItems, // All available items for this category
  categoryLabel,
  categoryType,
  filteredData, // Globally selected items list
  handleAddItem, // Global add item function
  handleRemoveItem, // Global remove item function
  setDetailsModalVisible,
  setSelectedItem,
  quantities,
  setQuantities,
  budget,
  setFilteredData, // To update global list (mainly for cost recalculation)
  setRemainingBudget,
  updateCategories, // To add category to main screen if not present
  guestCount, 
  setGuestCount, // To update guestCount for restaurants
}) => {
  // Items from `filteredData` that belong to the current category
  const selectedItemsForThisCategory = filteredData
    .filter((item) => item.type === categoryType)
    .sort((a, b) => (typeOrder[a.type] || 11) - (typeOrder[b.type] || 11));

  // Available items for this category, excluding those already selected.
  const availableItemsForThisCategory = categoryItems
    .filter(catItem => !selectedItemsForThisCategory.some(selItem => selItem.id === catItem.id && selItem.type === catItem.type))
    .sort((a, b) => (typeOrder[a.type] || 11) - (typeOrder[b.type] || 11));


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
          case "clothing":
            title = `${item.storeName} - ${item.itemName} (${cost} ₸)`;
            break;
          case "flowers":
            title = `${item.salonName} - ${item.flowerName} (${cost} ₸)`;
            break;
          case "cake":
            title = `${item.name} (${cost} ₸)`;
            break;
          case "alcohol":
            title = `${item.salonName} - ${item.alcoholName} (${cost} ₸)`;
            break;
          case "program":
            title = `${item.teamName} (${cost} ₸)`;
            break;
          case "tamada":
            title = `${item.name} (${cost} ₸)`;
            break;
          case "traditionalGift":
            title = `${item.salonName} - ${item.itemName} (${cost} ₸)`;
            break;
          case "transport":
            title = `${item.salonName} - ${item.carName} (${cost} ₸)`;
            break;
          case "goods":
            title = `${item.item_name} (${cost} ₸)`;
            break;
          case "jewelry":
            title = `${item.storeName} - ${item.itemName} (${cost} ₸)`;
            break;
          default:
            title = "Неизвестный элемент";
        }
        return (
          <View style={styles.addModalItemCard}>
            <TouchableOpacity
              style={styles.addModalItemContent}
              onPress={() => {
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
                setSelectedItem(item);
                setDetailsModalVisible(true);
                // Убрали onClose(), чтобы CategoryItemsModal оставался открытым
              }}
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

          <ScrollView contentContainerStyle={styles.addModalItemList}>
            {selectedItemsForThisCategory.length > 0 && (
              <View style={styles.selectedItemContainer}>
                <Text style={styles.categoryHeader}>
                  Выбранные ({selectedItemsForThisCategory.length}):
                </Text>
                {selectedItemsForThisCategory.map((item) => (
                  <SelectedItem
                    key={`${item.type}-${item.id}`}
                    item={item}
                    quantities={quantities}
                    setQuantities={setQuantities}
                    filteredData={filteredData} // Pass the global list
                    setFilteredData={setFilteredData} // To update the global list
                    budget={budget}
                    setRemainingBudget={setRemainingBudget}
                    handleRemoveItem={handleRemoveItem} // Global remove
                    setDetailsModalVisible={setDetailsModalVisible}
                    setSelectedItem={setSelectedItem}
                    onClose={onClose} // Propagate close if needed
                    guestCount={guestCount} 
                    setGuestCount={setGuestCount}
                  />
                ))}
              </View>
            )}
            
            {availableItemsForThisCategory.length > 0 && (
                 <View>
                    <Text style={styles.categoryHeader}>
                        Доступные ({availableItemsForThisCategory.length}):
                    </Text>
                    {availableItemsForThisCategory.map((item) => (
                        <View key={`${item.type}-${item.id}`} /*style={styles.itemWrapper}*/> 
                        {/* itemWrapper was not defined, check if needed or remove */}
                        {renderAvailableItem({ item })}
                        </View>
                    ))}
                </View>
            )}

            {selectedItemsForThisCategory.length === 0 && availableItemsForThisCategory.length === 0 && (
              <Text style={styles.addModalEmptyText}>Нет элементов для этой категории</Text>
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
};


const CreateEventScreen = ({ navigation, route }) => {
  const selectedCategories = route?.params?.selectedCategories || [];

  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);

  const [categories, setCategories] = useState(selectedCategories);
  const [disabledCategories, setDisabledCategories] = useState([]);
  const [data, setData] = useState({
    restaurants: [], clothing: [], tamada: [], programs: [], traditionalGifts: [],
    flowers: [], cakes: [], alcohol: [], transport: [], goods: [], jewelry: [],
  });
  const [filteredData, setFilteredData] = useState([]); // Holds selected items
  const [quantities, setQuantities] = useState({});
  const [budget, setBudget] = useState("");
  const [guestCount, setGuestCount] = useState("");
  const [remainingBudget, setRemainingBudget] = useState(0);
  const [loading, setLoading] = useState(false); // For initial data fetch
  const [addItemModalVisible, setAddItemModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [selectedCategoryItems, setSelectedCategoryItems] = useState([]);
  const [selectedCategoryLabel, setSelectedCategoryLabel] = useState("");
  const [selectedCategoryType, setSelectedCategoryType] = useState("");
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false); // For Create Wedding Modal
  const [weddingName, setWeddingName] = useState("");
  const [weddingDate, setWeddingDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [shouldFilter, setShouldFilter] = useState(false); // For auto-filter on budget/guest change
  const [blockedDays, setBlockedDays] = useState({});
  const scrollViewRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false); // For budget filtering loader

  const updateCategories = useCallback((newCategory) => {
    setCategories((prevCategories) => {
      if (!prevCategories.includes(newCategory)) {
        return [...prevCategories, newCategory];
      }
      return prevCategories;
    });
  }, []);

  const combinedData = useMemo(() => { // All available items from API
    const dataArray = [
      ...(data.restaurants || []).map((item) => ({ ...item, type: "restaurant" })),
      ...(data.clothing || []).map((item) => ({ ...item, type: "clothing" })),
      ...(data.tamada || []).map((item) => ({ ...item, type: "tamada" })),
      ...(data.programs || []).map((item) => ({ ...item, type: "program" })),
      ...(data.traditionalGifts || []).map((item) => ({ ...item, type: "traditionalGift" })),
      ...(data.flowers || []).map((item) => ({ ...item, type: "flowers" })),
      ...(data.cakes || []).map((item) => ({ ...item, type: "cake" })),
      ...(data.alcohol || []).map((item) => ({ ...item, type: "alcohol" })),
      ...(data.transport || []).map((item) => ({ ...item, type: "transport" })),
      ...(data.goods || []).map((item) => ({ ...item, type: "goods" })),
      ...(data.jewelry || []).map((item) => ({ ...item, type: "jewelry" })),
    ].filter((item) => item.type !== "goods" || item.category !== "Прочее");
    return dataArray.sort(
      (a, b) => (typeOrder[a.type] || 11) - (typeOrder[b.type] || 11)
    );
  }, [data]);

  //  const handleRemoveCategory = useCallback(
  //   (category) => {
  //     setDisabledCategories((prevDisabled) => {
  //       const isCurrentlyDisabled = prevDisabled.includes(category);
  //       const type = categoryToTypeMap[category];
  
  //       if (isCurrentlyDisabled) { // Action: Enable category
  //         // Remove from disabled list
  //         return prevDisabled.filter((cat) => cat !== category);
  //       } else { // Action: Disable category
  //         // Add to disabled list
  //         if (type) {
  //           // Remove items of this type from selected items (filteredData)
  //           setFilteredData((prevSelected) => {
  //             const newData = prevSelected.filter((item) => item.type !== type);
  //             // Recalculate budget after removing items
  //             const newTotalSpent = newData.reduce((sum, dataItem) => {
  //               const key = `${dataItem.type}-${dataItem.id}`;
  //               const itemQty = dataItem.type === "restaurant" ? (parseInt(guestCount, 10) || 1) : (parseInt(quantities[key], 10) || 1);
  //               const itemCost = dataItem.type === "restaurant" ? dataItem.averageCost : dataItem.cost;
  //               return sum + (itemCost * itemQty);
  //             }, 0);
  //             setRemainingBudget(parseFloat(budget) - newTotalSpent);
  //             return newData;
  //           });
  //           // Also remove quantities for these items
  //           setQuantities(prevQtys => {
  //               const newQtys = {...prevQtys};
  //               Object.keys(newQtys).forEach(key => {
  //                   if(key.startsWith(type + "-")) {
  //                       delete newQtys[key];
  //                   }
  //               });
  //               return newQtys;
  //           });

  //         }
  //         return [...prevDisabled, category];
  //       }
  //     });
  //   },
  //   [quantities, budget, guestCount, filteredData] // Ensure all dependencies are listed
  // );

  const handleRemoveCategory = useCallback(
    (category) => {
      setDisabledCategories((prev) => {
        if (prev.includes(category)) {
          // Разблокировка категории
          const updatedDisabledCategories = prev.filter(
            (cat) => cat !== category
          );
          const type = categoryToTypeMap[category];
          if (type) {
            // Получаем элементы для разблокированной категории
            const itemsToAdd = combinedData.filter(
              (item) => item.type === type
            );

            // Фильтруем элементы с учётом бюджета и количества гостей
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

            // Добавляем не более 2 элементов из категории
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

            // Обновляем filteredData, добавляя новые элементы
            setFilteredData((prevData) => {
              const updatedData = [...prevData, ...selectedItemsToAdd].sort(
                (a, b) => (typeOrder[a.type] || 11) - (typeOrder[b.type] || 11)
              );

              // Обновляем quantities для новых элементов
              setQuantities((prevQuantities) => ({
                ...prevQuantities,
                ...selectedItemsToAdd.reduce((acc, item) => {
                  const itemKey = `${item.type}-${item.id}`;
                  return { ...acc, [itemKey]: "1" };
                }, {}),
              }));

              // Пересчитываем оставшийся бюджет
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
          // Блокировка категории
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


  const fetchData = async () => {
    if (!token || !user?.id) return;
    setLoading(true);
    try {
      const responses = await Promise.all([
        api.getRestaurants(), api.getClothing(), api.getTamada(), api.getPrograms(),
        api.getTraditionalGifts(), api.getFlowers(), api.getCakes(), api.getAlcohol(),
        api.getTransport(), api.getGoods(token), api.getJewelry(),
      ]);
      const [
        restaurants, clothing, tamada, programs, traditionalGifts,
        flowers, cakes, alcohol, transport, goods, jewelry,
      ] = responses.map(res => res.data);
      setData({
        restaurants, clothing, tamada, programs, traditionalGifts,
        flowers, cakes, alcohol, transport, goods, jewelry,
      });
    } catch (error) {
      console.error("Ошибка загрузки данных:", error);
      // alert("Ошибка загрузки данных. Попробуйте снова.");
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
    setBudget(filteredValue); // Store raw number
    setShouldFilter(true);
  };

  const handleGuestCountChange = (value) => {
    const filteredValue = value.replace(/[^\d]/g, "");
    setGuestCount(filteredValue);
    setShouldFilter(true);
     // If a restaurant is already selected, update its guest count and total cost
     setFilteredData(prevData => {
      let newTotalSpent = 0;
      const updatedData = prevData.map(item => {
        let itemTotalCost = item.totalCost;
        let itemEffectiveQuantity = item.type === "restaurant" 
                                      ? (parseInt(filteredValue, 10) || 1) 
                                      : (parseInt(quantities[`${item.type}-${item.id}`], 10) || 1);
        const itemCost = item.type === "restaurant" ? item.averageCost : item.cost;
        
        if (item.type === "restaurant") {
            // Capacity check for restaurant if guests are changing
            if (item.capacity && (parseInt(filteredValue, 10) || 1) > item.capacity) {
                alert(`Ресторан ${item.name} вмещает максимум ${item.capacity} гостей.`);
                itemEffectiveQuantity = item.capacity; // Cap at capacity
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

  const filterDataByBudget = useCallback(() => {
    setIsLoading(true);
  
    setTimeout(() => {
      if (!budget || isNaN(budget) || parseFloat(budget) <= 0) {
        alert("Пожалуйста, введите корректную сумму бюджета");
        setIsLoading(false); return;
      }
      if (!guestCount || isNaN(guestCount) || parseFloat(guestCount) <= 0) {
        alert("Пожалуйста, введите корректное количество гостей");
        setIsLoading(false); return;
      }
  
      const budgetValue = parseFloat(budget);
      const guests = parseFloat(guestCount);
      let remaining = budgetValue;
      const newSelectedItems = [];
      const newQuantities = {};
  
      const activeCategories = categories.filter(cat => !disabledCategories.includes(cat));
      const allowedTypes = activeCategories.map(cat => categoryToTypeMap[cat]).filter(Boolean);
  
      const typesToProcess = typesMapping.filter(({ type }) => allowedTypes.includes(type));
  
      for (const { key, costField, type, label } of typesToProcess) {
        let itemsForType = data[key] || [];
        if (itemsForType.length === 0) continue;

        if (type === "restaurant") {
          itemsForType = itemsForType.filter(r => parseFloat(r.capacity) >= guests);
          if (itemsForType.length === 0) {
            console.log(`Нет ресторанов для ${guests} гостей в категории ${label}`);
            continue;
          }
          
          const suitableRestaurants = itemsForType
            .filter(item => parseFloat(item[costField]) * guests <= remaining)
            .sort((a, b) => parseFloat(a[costField]) - parseFloat(b[costField]));
          
          if (suitableRestaurants.length > 0) {
            const selectedRestaurant = suitableRestaurants[Math.floor(suitableRestaurants.length / 2)]; // Median choice
            const itemCost = parseFloat(selectedRestaurant[costField]) * guests;
            newSelectedItems.push({ ...selectedRestaurant, type, totalCost: itemCost });
            newQuantities[`${type}-${selectedRestaurant.id}`] = guests.toString(); // Store guest count as "quantity" for restaurants
            remaining -= itemCost;
          } else {
             console.log(`Рестораны в категории ${label} не вписываются в остаток бюджета ${remaining}`);
          }
        } else { // For other types
          const suitableItems = itemsForType
            .filter(item => parseFloat(item[costField]) <= remaining)
            .sort((a, b) => parseFloat(a[costField]) - parseFloat(b[costField]));
          
          if (suitableItems.length > 0) {
            const selectedItem = suitableItems[0]; // Cheapest one
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
  
      newSelectedItems.sort((a, b) => (typeOrder[a.type] || 11) - (typeOrder[b.type] || 11));
      setFilteredData(newSelectedItems);
      setQuantities(newQuantities);
      setRemainingBudget(remaining);
      setIsLoading(false);
    }, 150);
  }, [budget, guestCount, data, categories, disabledCategories, typesMapping]); // Added typesMapping dependency

  useEffect(() => {
    if (shouldFilter && budget && guestCount && !isNaN(parseFloat(budget)) && !isNaN(parseFloat(guestCount))) {
      filterDataByBudget();
      setShouldFilter(false);
    }
  }, [budget, guestCount, filterDataByBudget, shouldFilter]);

  const handleAddItem = useCallback(
    (itemToAdd) => {
      const itemKey = `${itemToAdd.type}-${itemToAdd.id}`;
      const cost = itemToAdd.type === "restaurant" ? itemToAdd.averageCost : itemToAdd.cost;
  
      if (itemToAdd.type === "restaurant") {
        if(!guestCount || parseInt(guestCount, 10) <=0){
           alert("Пожалуйста, укажите количество гостей перед добавлением ресторана.");
           return;
        }
        if (parseInt(guestCount, 10) > itemToAdd.capacity) {
          alert(`Этот ресторан не может вместить ${guestCount} гостей. Максимальная вместимость: ${itemToAdd.capacity}.`);
          return;
        }
        // Remove any other restaurant if one is already selected
        setFilteredData(prev => prev.filter(i => i.type !== 'restaurant' || i.id === itemToAdd.id));
      }
  
      setFilteredData((prevSelected) => {
        const existingItem = prevSelected.find(i => `${i.type}-${i.id}` === itemKey);
        let updatedSelectedItems;
        let newQuantity = "1";
  
        if (existingItem && itemToAdd.type !== "restaurant") { // Allow multiple non-restaurants, update quantity
           newQuantity = (parseInt(quantities[itemKey] || "1") + 1).toString();
           updatedSelectedItems = prevSelected.map(i => 
              i.id === itemToAdd.id && i.type === itemToAdd.type 
              ? { ...i, totalCost: cost * parseInt(newQuantity) }
              : i
           );
        } else if (!existingItem) { // New item or replacing restaurant
          const effectiveQuantity = itemToAdd.type === "restaurant" ? (parseInt(guestCount, 10) || 1) : 1;
          const totalItemCost = cost * effectiveQuantity;
          const newItem = { ...itemToAdd, totalCost: totalItemCost };
          if (itemToAdd.type === "restaurant") {
              updatedSelectedItems = [...prevSelected.filter(i => i.type !== 'restaurant'), newItem];
          } else {
              updatedSelectedItems = [...prevSelected, newItem];
          }
        } else { // Existing restaurant, no quantity change, but ensures it's in list
            updatedSelectedItems = prevSelected;
        }
  
        setQuantities((prevQtys) => ({
          ...prevQtys,
          [itemKey]: itemToAdd.type === "restaurant" ? (guestCount || "1") : newQuantity,
        }));
  
        const totalSpent = updatedSelectedItems.reduce((sum, selItem) => {
            const qtyKey = `${selItem.type}-${selItem.id}`;
            const itemQty = selItem.type === 'restaurant' ? (parseInt(guestCount, 10) || 1) : (parseInt(quantities[qtyKey] || "1", 10));
            const itemCostVal = selItem.type === 'restaurant' ? selItem.averageCost : selItem.cost;
            return sum + (itemCostVal * itemQty);
        },0);

        // If a new item was added, the total spent needs to account for it using its *initial* quantity
        if(!existingItem && itemToAdd.type !== 'restaurant') {
            // this sum doesn't have the newly added item yet from quantities[itemKey]
        }


        setRemainingBudget(parseFloat(budget) - totalSpent);
        return updatedSelectedItems.sort((a, b) => (typeOrder[a.type] || 11) - (typeOrder[b.type] || 11));
      });
      if (categoryModalVisible) setCategoryModalVisible(false); // Close category modal after adding
    },
    [quantities, budget, guestCount, categoryModalVisible] // Dependencies
  );

  const handleRemoveItem = useCallback(
    (itemToRemove) => {
      const itemKey = `${itemToRemove.type}-${itemToRemove.id}`;
      setFilteredData((prevSelected) => {
        const updatedSelected = prevSelected.filter(i => `${i.type}-${i.id}` !== itemKey);
        
        setQuantities((prevQtys) => {
          const newQtys = { ...prevQtys };
          delete newQtys[itemKey];
          return newQtys;
        });
  
        const totalSpent = updatedSelected.reduce((sum, selItem) => {
          const qtyKey = `${selItem.type}-${selItem.id}`;
          // For budget calculation, use current guestCount for restaurants, or stored quantity for others
          const itemQty = selItem.type === 'restaurant' ? (parseInt(guestCount, 10) || 1) : (parseInt(quantities[qtyKey], 10) || 1);
          const itemCostVal = selItem.type === 'restaurant' ? selItem.averageCost : selItem.cost;
          return sum + (itemCostVal * itemQty);
        }, 0);
        setRemainingBudget(parseFloat(budget) - totalSpent);
        return updatedSelected.sort((a, b) => (typeOrder[a.type] || 11) - (typeOrder[b.type] || 11));
      });
    },
    [quantities, budget, guestCount] // Dependencies
  );

  const calculateTotalCost = () => {
    return filteredData.reduce((sum, item) => {
      const quantity = parseInt(quantities[`${item.type}-${item.id}`] || "1");
      const cost = item.type === "restaurant" ? item.averageCost : item.cost;
      const effectiveQuantity = item.type === "restaurant" ? (parseInt(guestCount, 10) || 1) : quantity;
      return sum + cost * effectiveQuantity;
    }, 0);
  };

  useEffect(() => {
    fetchAllBlockedDays();
  }, []);

  const fetchAllBlockedDays = async () => {
    try {
      const response = await api.fetchAllBlockedDays();
      const blockedDaysData = {};
      response.data.forEach((entry) => {
        const { date, restaurantId, restaurantName } = entry;
        if (!blockedDaysData[date]) {
          blockedDaysData[date] = { marked: true, dots: [], disabled: true, disableTouchEvent: true }; // Add disabled properties
        }
        blockedDaysData[date].dots.push({ key: restaurantId.toString(), restaurantId, restaurantName, color: 'red' }); // key and color for dots
      });
      setBlockedDays(blockedDaysData);
    } catch (error) {
      console.error("Ошибка загрузки заблокированных дней:", error.message);
    }
  };

  const handleSubmit = async () => {
    if (!weddingName.trim()) {
      alert("Пожалуйста, укажите название свадьбы"); return;
    }
    if (!filteredData.length) {
      alert("Пожалуйста, выберите хотя бы один элемент для свадьбы"); return;
    }
    if (!user?.id || !token) {
      alert("Ошибка авторизации. Пожалуйста, войдите в систему.");
      navigation.navigate("Login"); return;
    }

    const dateString = weddingDate.toISOString().split("T")[0];
    const restaurantItem = filteredData.find(item => item.type === "restaurant");
    if (restaurantItem && blockedDays[dateString]) {
      const isRestaurantBlocked = blockedDays[dateString].dots.some(dot => dot.restaurantId === restaurantItem.id);
      if (isRestaurantBlocked) {
        alert(`Дата ${dateString} уже забронирована для ресторана ${restaurantItem.name}. Пожалуйста, выберите другую дату.`);
        return;
      }
    }

    const weddingData = {
      name: weddingName.trim(),
      date: dateString,
      host_id: user.id,
      items: filteredData.map((item) => {
        const quantityVal = parseInt(quantities[`${item.type}-${item.id}`] || "1");
        const effectiveQuantity = item.type === "restaurant" ? (parseInt(guestCount, 10) || 1) : quantityVal;
        const costVal = item.type === "restaurant" ? item.averageCost : item.cost;
        return { id: item.id, type: item.type, quantity: effectiveQuantity, totalCost: costVal * effectiveQuantity };
      }),
    };

    try {
      await api.createWedding(weddingData, token);
      alert("Свадьба успешно создана!");
      setModalVisible(false);
      // Reset state
      setWeddingName(""); setWeddingDate(new Date()); setShowDatePicker(false);
      setFilteredData([]); setQuantities({}); setBudget(""); setGuestCount(""); setRemainingBudget(0);
      setDisabledCategories([]); setCategories(selectedCategories); // Reset categories to initial or empty
    } catch (error) {
      console.error("Ошибка при создании свадьбы:", error);
      alert("Ошибка: " + (error.response?.data?.error || error.message));
    }
  };

  const onDateChange = (day) => {
    setWeddingDate(new Date(day.timestamp));
    setShowDatePicker(false);
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

  const handleCloseCategoryModal = () => {
    setCategoryModalVisible(false);
    setSelectedCategoryItems([]); setSelectedCategoryLabel(""); setSelectedCategoryType("");
  };

  const sortedCategories = [...categories].sort((a, b) => {
    const typeA = categoryToTypeMap[a];
    const typeB = categoryToTypeMap[b];
    return (typeOrder[typeA] || 11) - (typeOrder[typeB] || 11);
  });

  const renderCategory = (item) => {
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

  const handleDetailsPress = () => {
    setDetailsModalVisible(false);
    // setSelectedItem(null); // Keep selectedItem for navigation
    if (selectedItem) {
        navigation.navigate("Details", { item: selectedItem });
    }
  };

  return (
    <>
      <LinearGradient colors={["#F1EBDD", "#897066"]} start={{ x: 0, y: 1 }} end={{ x: 0, y: 0 }} style={styles.splashContainer}>
        <TouchableOpacity style={{ marginTop: "15%", marginLeft: "2%" }} onPress={() => navigation.goBack()}>
          <AntDesign name="left" size={24} color="black" />
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <Image source={require("../../assets/kazanRevert.png")} style={styles.potIcon} resizeMode="contain" />
        </View>
        <Image source={require("../../assets/footer.png")} style={styles.topPatternContainer} />

        <View style={styles.headerContainer}>
          <View style={styles.budgetContainer}>
            <View style={styles.categoryItemAdd}>
              {renderCategory("Добавить")}
            </View>
            <TextInput
              style={styles.budgetInput}
              placeholder="Бюджет (т)"
              value={formatBudget(budget)} // Display formatted
              onChangeText={handleBudgetChange} // Handles raw number
              placeholderTextColor={COLORS.placeholder}
              keyboardType="numeric"
              maxLength={18} // Allow for "10 000 000 000" etc.
            />
            <TextInput
              style={styles.guestInput}
              placeholder="Гостей"
              value={guestCount}
              onChangeText={handleGuestCountChange}
              placeholderTextColor={COLORS.placeholder}
              keyboardType="numeric"
              maxLength={5}
            />
          </View>
          <Modal animationType="fade" transparent={true} visible={isLoading} onRequestClose={() => {}}>
            <View style={styles.loaderOverlay}>
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loaderText}>Подбираем...</Text>
              </View>
            </View>
          </Modal>
        </View>

        <View style={styles.listContainer}>
          {loading ? ( <ActivityIndicator size="large" color={COLORS.primary} /> ) : (
            <ScrollView ref={scrollViewRef} style={styles.scrollView} showsVerticalScrollIndicator={false}>
              <View style={styles.categoryGrid}>
                {sortedCategories.map((item, index) => (
                  <View key={index} style={styles.categoryItem}>
                    {renderCategory(item)}
                  </View>
                ))}
              </View>
              <View style={styles.bottomPadding} />
            </ScrollView>
          )}
        </View>

        <View style={styles.bottomContainer}>
          <TouchableOpacity style={styles.nextButton} onPress={() => setModalVisible(true)} disabled={filteredData.length === 0 && !budget && !guestCount}>
            <Image source={require("../../assets/next.png")} style={styles.potIcon3} resizeMode="contain" />
          </TouchableOpacity>
        </View>

        <AddItemModal
          visible={addItemModalVisible}
          onClose={() => setAddItemModalVisible(false)}
          filteredItems={combinedData} // All available items from API
          filteredData={filteredData} // Currently selected items
          handleAddItem={handleAddItem}
          setDetailsModalVisible={setDetailsModalVisible}
          setSelectedItem={setSelectedItem}
          quantities={quantities}
          updateCategories={updateCategories}
        />

        <CategoryItemsModal
          visible={categoryModalVisible}
          onClose={handleCloseCategoryModal}
          categoryItems={selectedCategoryItems} // Items of the specific category from combinedData
          categoryLabel={selectedCategoryLabel}
          categoryType={selectedCategoryType}
          filteredData={filteredData} // Global list of selected items
          handleAddItem={handleAddItem} // Global func to add to filteredData
          handleRemoveItem={handleRemoveItem} // Global func to remove from filteredData
          setDetailsModalVisible={setDetailsModalVisible}
          setSelectedItem={setSelectedItem}
          quantities={quantities}
          setQuantities={setQuantities}
          budget={budget}
          setFilteredData={setFilteredData}
          setRemainingBudget={setRemainingBudget}
          updateCategories={updateCategories}
          guestCount={guestCount}
          setGuestCount={setGuestCount} // Pass setter for guest count
        />

        {/* Details Modal (shows brief info, navigates to full details screen) */}
        <Modal
  visible={detailsModalVisible}
  transparent
  animationType="fade"
  onRequestClose={() => {
    setDetailsModalVisible(false);
    // Не сбрасываем selectedItem, чтобы сохранить его для навигации
  }}
>
  <SafeAreaView
    style={[styles.modalOverlay, { justifyContent: "center", alignItems: "center" }]}
  >
    <Animatable.View
      style={styles.detailsModalContainer}
      animation="zoomIn"
      duration={300}
    >
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>Подробности</Text>
        <TouchableOpacity
          style={styles.modalCloseButton}
          onPress={() => {
            setDetailsModalVisible(false);
            // Не сбрасываем selectedItem
          }}
        >
          <Icon name="close" size={24} color={MODAL_COLORS.closeButtonColor} />
        </TouchableOpacity>
      </View>
      {selectedItem ? (
        <View style={styles.detailsModalContent}>
          {(() => {
            let mainTitle = "Детали элемента";
            let details = [];
            switch (selectedItem.type) {
              case "restaurant":
                mainTitle = selectedItem.name;
                details = [
                  `Кухня: ${selectedItem.cuisine || "Не указано"}`,
                  `Вместимость: ${selectedItem.capacity || "Не указано"}`,
                  `Средний чек: ${selectedItem.averageCost} ₸`,
                ];
                break;
              case "clothing":
                mainTitle = `${selectedItem.storeName} - ${selectedItem.itemName}`;
                details = [
                  `Пол: ${selectedItem.gender || "Не указано"}`,
                  `Стоимость: ${selectedItem.cost} ₸`,
                ];
                break;
              case "flowers":
                mainTitle = `${selectedItem.salonName} - ${selectedItem.flowerName}`;
                details = [
                  `Тип: ${selectedItem.flowerType || "Не указано"}`,
                  `Стоимость: ${selectedItem.cost} ₸`,
                ];
                break;
              case "cake":
                mainTitle = selectedItem.name;
                details = [
                  `Тип торта: ${selectedItem.cakeType || "Не указано"}`,
                  `Стоимость: ${selectedItem.cost} ₸`,
                ];
                break;
              case "alcohol":
                mainTitle = `${selectedItem.salonName} - ${selectedItem.alcoholName}`;
                details = [
                  `Категория: ${selectedItem.category || "Не указано"}`,
                  `Стоимость: ${selectedItem.cost} ₸`,
                ];
                break;
              case "program":
                mainTitle = selectedItem.teamName;
                details = [
                  `Тип программы: ${selectedItem.type || "Не указано"}`,
                  `Стоимость: ${selectedItem.cost} ₸`,
                ];
                break;
              case "tamada":
                mainTitle = selectedItem.name;
                details = [
                  selectedItem.portfolio
                    ? `Портфолио: ${selectedItem.portfolio.substring(0, 50)}...`
                    : "Портфолио не указано",
                  `Стоимость: ${selectedItem.cost} ₸`,
                ];
                if (
                  selectedItem.portfolio &&
                  (selectedItem.portfolio.startsWith("http://") ||
                    selectedItem.portfolio.startsWith("https://"))
                ) {
                  details.push(
                    <TouchableOpacity
                      key="link"
                      onPress={() => Linking.openURL(selectedItem.portfolio)}
                    >
                      <Text
                        style={{
                          color: COLORS.secondary,
                          textDecorationLine: "underline",
                          marginTop: 5,
                        }}
                      >
                        Открыть ссылку
                      </Text>
                    </TouchableOpacity>
                  );
                }
                break;
              case "traditionalGift":
                mainTitle = `${selectedItem.salonName} - ${selectedItem.itemName}`;
                details = [
                  `Тип: ${selectedItem.type || "Не указано"}`,
                  `Стоимость: ${selectedItem.cost} ₸`,
                ];
                break;
              case "transport":
                mainTitle = `${selectedItem.salonName} - ${selectedItem.carName}`;
                details = [
                  `Марка: ${selectedItem.brand || "Не указано"}`,
                  `Цвет: ${selectedItem.color || "Не указано"}`,
                  `Стоимость: ${selectedItem.cost} ₸`,
                ];
                break;
              case "jewelry":
                mainTitle = `${selectedItem.storeName} - ${selectedItem.itemName}`;
                details = [
                  `Материал: ${selectedItem.material || "Не указано"}`,
                  `Стоимость: ${selectedItem.cost}`,
                ];
                break;
              case "goods":
                mainTitle = selectedItem.item_name;
                details = [
                  selectedItem.description || "Описание не указано",
                  `Стоимость: ${selectedItem.cost} ₸`,
                ];
                break;
              default:
                return <Text style={styles.detailsModalText}>Информация недоступна.</Text>;
            }
            return (
              <>
                <Text
                  style={[
                    styles.detailsModalText,
                    { fontWeight: "bold", fontSize: 18, marginBottom: 15 },
                  ]}
                >
                  {mainTitle}
                </Text>
                {details.map((detail, index) =>
                  typeof detail === "string" ? (
                    <Text key={index} style={styles.detailsModalText}>
                      {detail}
                    </Text>
                  ) : (
                    detail
                  )
                )}
              </>
            );
          })()}
          <TouchableOpacity
            style={[styles.modalButton2, styles.confirmButton, { marginTop: 20 }]}
            onPress={handleDetailsPress}
          >
            <Icon name="search" size={20} color={COLORS.white} style={styles.buttonIcon} />
            <Text style={styles.modalButtonText}>Подробнее</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={styles.detailsModalText}>Нет данных для отображения</Text>
      )}
    </Animatable.View>
  </SafeAreaView>
</Modal>
        {/* Create Wedding Event Modal (final save step) */}
        <Modal
          animationType="slide" transparent={true} visible={modalVisible}
          onRequestClose={() => { setModalVisible(false); /* reset some state if needed */ }}
        >
          <SafeAreaView style={[styles.modalOverlay, { justifyContent: 'center', alignItems: 'center' }]}>
            <Animatable.View style={styles.modalContent} animation="zoomIn" duration={300}>
              <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { textAlign: 'center'}]}>Создание мероприятия "Свадьба"</Text>
                  <TouchableOpacity style={styles.modalCloseButton} onPress={() => { setModalVisible(false); /* reset */ }}>
                    <Icon name="close" size={30} color={MODAL_COLORS.closeButtonColor} />
                  </TouchableOpacity>
                </View>

                <View style={styles.inputContainer}>
                  <Icon name="event-note" size={20} color={MODAL_COLORS.icon} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input} // Reusing general input style
                    placeholder="Название свадьбы"
                    value={weddingName}
                    onChangeText={setWeddingName}
                    placeholderTextColor={MODAL_COLORS.textSecondary}
                  />
                </View>
                <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
                  <Icon name="calendar-today" size={20} color={MODAL_COLORS.activeFilter} style={styles.buttonIcon} />
                  <Text style={styles.dateButtonText}>{weddingDate.toLocaleDateString("ru-RU")}</Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <Calendar
                    style={styles.calendar}
                    current={weddingDate.toISOString().split("T")[0]}
                    onDayPress={onDateChange}
                    minDate={new Date().toISOString().split("T")[0]} // Can't select past dates
                    markedDates={blockedDays} // Show blocked days
                    theme={{
                        arrowColor: MODAL_COLORS.activeFilter,
                        selectedDayBackgroundColor: MODAL_COLORS.activeFilter,
                        selectedDayTextColor: MODAL_COLORS.activeFilterText,
                        todayTextColor: MODAL_COLORS.activeFilter,
                        dotColor: MODAL_COLORS.activeFilter,
                        disabledArrowColor: MODAL_COLORS.separator,
                        textDisabledColor: MODAL_COLORS.separator, // For disabled dates by minDate/maxDate or marked as disabled
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
                    ).sort(([typeA], [typeB]) => (typeOrder[typeA] || 11) - (typeOrder[typeB] || 11))
                    .map(([type, items]) => (
                      <View key={type} style={{marginBottom:10}}>
                        <Text style={styles.categoryHeaderSummary}>
                          {typesMapping.find((t) => t.type === type)?.label || type} ({items.length})
                        </Text>
                        {items.map((item) => {
                          console.log('item====   ',item)
                          const quantity = parseInt(quantities[`${item.type}-${item.id}`] || "1");
                          const cost = item.type === "restaurant" ? item.averageCost : item.cost;
                          const effectiveQuantity = item.type === "restaurant" ? (parseInt(guestCount, 10) || 1) : quantity;
                          const totalItemCost = cost * effectiveQuantity;
                          let itemTitle = "";
                           switch (item.type) {
                                case "restaurant": itemTitle = `${item.name} - ${cost} x ${effectiveQuantity} = ${totalItemCost} тг`; break;
                                case "clothing": itemTitle = `${item.itemName} (${item.storeName}) - ${cost} x ${effectiveQuantity} = ${totalItemCost} тг`; break;

                                case "tamada":itemTitle = `${item.name} - ${cost} x ${effectiveQuantity} = ${totalItemCost} тг`; break;
                                case "program":itemTitle = `${item.teamName}  - ${cost} x ${effectiveQuantity} = ${totalItemCost} тг`; break;
                                case "traditionalGift":itemTitle = `${item.itemName} (${item.salonName}) - ${cost} x ${effectiveQuantity} = ${totalItemCost} тг`; break;


      
                                case "alcohol":itemTitle = `${item.alcoholName} (${item.salonName}) - ${cost} x ${effectiveQuantity} = ${totalItemCost} тг`; break;
                                 
                                case "transport":itemTitle = `${item.carName} (${item.brand}) - ${cost} x ${effectiveQuantity} = ${totalItemCost} тг`; break;
                                 
                                
                                 
                                case "jewelry":itemTitle = `${item.itemName} (${item.storeName}) - ${cost} x ${effectiveQuantity} = ${totalItemCost} тг`; break;
                                
                                
                                



                                case "flowers": itemTitle = `${item.flowerName} - ${cost} x ${effectiveQuantity} = ${totalItemCost} тг`; break;
                                case "cake": itemTitle = `${item.name} - ${cost} x ${effectiveQuantity} = ${totalItemCost} тг`; break;
                                default: itemTitle = `${item.name || item.itemName || item.teamName} - ${cost} x ${effectiveQuantity} = ${totalItemCost} тг`;
                            }
                          return (
                            <View key={`${item.type}-${item.id}`} style={styles.itemContainer}>
                              {/* Minimal icon or just text */}
                              <Text style={styles.itemText}>{itemTitle}</Text>
                            </View>
                          );
                        })}
                      </View>
                    ))
                  ) : ( <Text style={styles.noItems}>Нет выбранных элементов</Text> )}
                </View>
                <View style={styles.totalContainer}>
                  <Text style={styles.totalText}>Общая стоимость: {calculateTotalCost().toLocaleString("ru-RU")} тг</Text>
                </View>
                {budget && <Text style={styles.totalText}>Ваш бюджет: {parseFloat(budget).toLocaleString("ru-RU")} ₸</Text> }
                {budget && (
                  <Text style={[styles.budgetInfo, remainingBudget < 0 && styles.budgetError]}>
                    Остаток: {remainingBudget.toLocaleString("ru-RU")} ₸ {remainingBudget < 0 && "(превышение)"}
                  </Text>
                )}
                <View style={styles.modalButtonContainer}>
                  <TouchableOpacity style={[styles.modalButton, styles.confirmButton]} onPress={handleSubmit}>
                    <Icon name="check" size={20} color={MODAL_COLORS.activeFilterText} style={styles.buttonIcon} />
                    <Text style={styles.modalButtonText}>Создать свадьбу</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </Animatable.View>
          </SafeAreaView>
        </Modal>
      </LinearGradient>
    </>
  );
};


// const styles = StyleSheet.create({
//   loaderOverlay: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: MODAL_COLORS.overlayBackground, 
//   },
//   loaderContainer: {
//     backgroundColor: MODAL_COLORS.cardBackground, 
//     borderRadius: 15,
//     padding: 25, 
//     alignItems: "center",
//     shadowColor: MODAL_COLORS.shadow,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 5,
//   },
//   loaderText: {
//     marginTop: 15, 
//     fontSize: 17, 
//     color: MODAL_COLORS.textPrimary,
//     fontWeight: "500",
//   },

//   topPatternContainer: {
//     position: "absolute",
//     bottom: 0,
//     width: "100%",
//     height: "20%",
//     zIndex: 1,
//     resizeMode: "cover",
//     opacity: 0.8,
//     marginBottom: "10%", 
//   },
//   categoryButton: { // For main screen category items
//     flex: 1, // Take available width in its row part
//     height: 50,
//     borderRadius: 10,
//     overflow: "hidden",
//     shadowColor: COLORS.shadow, 
//     shadowOffset: { width: 0, height: 5 },
//     shadowOpacity: 0.5,
//     shadowRadius: 8,
//     elevation: 5,
//     marginVertical: 2,
//   },
//   categoryButtonAdd: { // Specifically for the "+" add button on main screen
//     width: 60, // Fixed width for the "+" button
//     height: 50,
//     borderRadius: 10,
//     overflow: 'hidden',
//     shadowColor: COLORS.shadow,
//     shadowOffset: { width: 0, height: 5 },
//     shadowOpacity: 0.5,
//     shadowRadius: 8,
//     elevation: 5,
//     marginVertical: 2,
//   },
//   categoryButtonGradient: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     borderWidth: 2,
//     borderColor: "#5A4032", 
//     borderRadius: 10,
//   },
//   categoryPlusText: {
//     fontSize: 24,
//     color: COLORS.white, 
//     fontWeight: "bold",
//   },
//   categoryText: {
//     fontSize: 16,
//     color: COLORS.white, 
//     fontWeight: "600",
//     textAlign: "center",
//     paddingHorizontal: 10,
//   },
//   disabledCategoryButton: {
//     opacity: 0.5,
//   },
//   splashContainer: { flex: 1 },
//   headerContainer: {
//     paddingHorizontal: 20,
//     marginTop: 20,
//   },
//   budgetContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginBottom: 20,
//   },
//   categoryItemAdd: { // Wrapper for the "+" button
//      width: "20%", // Adjusted width for the Add button container
//     marginRight: 10,
//   },
//   budgetInput: {
//     flex: 1,
//     backgroundColor: "rgba(255, 255, 255, 0.2)",
//     borderRadius: 10,
//     padding: 10,
//     marginRight: 10,
//     color: COLORS.white, 
//     fontSize: 16,
//   },
//   guestInput: {
//     flex: 0.6, // Slightly less space than budget
//     backgroundColor: "rgba(255, 255, 255, 0.2)",
//     borderRadius: 10,
//     padding: 10,
//     color: COLORS.white, 
//     fontSize: 16,
//   },
//   logoContainer: { alignItems: "center", marginVertical: 10, marginTop: "0%" }, // Reduced vertical margin
//   potIcon: { width: 120, height: 120 }, // Slightly smaller
//   potIcon2: { width: 50, height: 50 },
//   potIcon3: { width: 70, height: 70, zIndex: 3 },
//   listContainer: { flex: 1, paddingHorizontal: 20, marginTop: 10 }, // Added margin top
//   scrollView: { flex: 1 },
//   categoryGrid: {
//     flexDirection: "column",
//     alignItems: "stretch", // Stretch items to fill width
//   },
//   categoryItem: { // Wrapper for each category row on main screen
//     width: "100%", // Full width
//     // padding: 2, // Remove if categoryRow handles spacing
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   categoryRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 10,
//     width: '100%', // Ensure row takes full width
//   },
//   removeCategoryButton: { // Image toggle button for category enable/disable
//     marginRight: 10,
//     padding: 5, // Add some padding for touch area
//   },
//   bottomPadding: { height: 20 },
//   bottomContainer: {
//     paddingHorizontal: 20,
//     paddingBottom: 20,
//     backgroundColor: "transparent",
//     zIndex: 5,
//     marginBottom: "20%", 
//   },
//   nextButton: {
//     borderRadius: 25,
//     overflow: "hidden",
//     marginVertical: 5,
//     alignItems: "center",
//     zIndex: 6,
//   },
  
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: MODAL_COLORS.overlayBackground,
//     // justifyContent: "flex-end", // Default for bottom sheets, overridden for centered
//   },
//   addModalContainer: { // For AddItemModal & CategoryItemsModal (bottom sheet)
//     backgroundColor: MODAL_COLORS.background,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     width: "100%",
//     maxHeight: SCREEN_HEIGHT * 0.9,
//     paddingTop: 10, 
//     paddingBottom: Dimensions.get('window').height > 700 ? 20 : 10,
//     shadowColor: MODAL_COLORS.shadow,
//     shadowOffset: { width: 0, height: -3 },
//     shadowOpacity: 0.2,
//     shadowRadius: 5,
//     elevation: 10,
//     flex: 1, // Ensure it takes up space correctly if SafeAreaView is parent
//   },
//   modalHeader: { 
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingHorizontal: 20,
//     paddingBottom: 16,
//     marginBottom: 10, 
//     borderBottomWidth: 1,
//     borderBottomColor: MODAL_COLORS.separator,
//   },
//   modalTitle: { 
//     fontSize: 20, 
//     fontWeight: "600",
//     color: MODAL_COLORS.textPrimary,
//     flexShrink: 1, // Allow title to shrink if close button needs space
//     marginRight: 10, // Space before close button if title is long
//   },
//   modalCloseButton: { 
//     padding: 8,
//     // position: 'absolute', // Only if needed for specific layout
//     // right: 10,
//     // top: -2, 
//   },
//   addModalSearchContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: MODAL_COLORS.inputBackground,
//     borderRadius: 10,
//     paddingHorizontal: 15,
//     marginHorizontal: 20, 
//     marginBottom: 15,
//     borderWidth: 1,
//     borderColor: MODAL_COLORS.inputBorder,
//   },
//   addModalSearchIcon: {
//     marginRight: 10,
//   },
//   addModalSearchInput: {
//     flex: 1,
//     paddingVertical: 12,
//     fontSize: 16,
//     color: MODAL_COLORS.textPrimary,
//   },
//   addModalClearIcon: { 
//     padding: 5, 
//   },
//   addModalFilterScroll: {
//     maxHeight: SCREEN_HEIGHT * 0.25, // Allow a bit more space for filters
//     paddingHorizontal: 20, 
//     marginBottom: 10,
//   },
//   addModalFilterLabel: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: MODAL_COLORS.textPrimary,
//     marginBottom: 10,
//     marginTop: 10,
//   },
//   filterButtonBase: {
//     paddingVertical: 10,
//     paddingHorizontal: 18,
//     borderRadius: 20,
//     marginRight: 10,
//     marginBottom: 10,
//     borderWidth: 1.5, 
//   },
//   filterButtonTextBase: {
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   addModalTypeButton: { 
//     backgroundColor: MODAL_COLORS.inactiveFilter,
//     borderColor: MODAL_COLORS.inputBorder, 
//   },
//   addModalTypeButtonActive: { 
//     backgroundColor: MODAL_COLORS.activeFilter,
//     borderColor: MODAL_COLORS.activeFilter, 
//   },
//   addModalTypeButtonText: { 
//     color: MODAL_COLORS.inactiveFilterText,
//   },
//   addModalTypeButtonTextActive: { 
//     color: MODAL_COLORS.activeFilterText,
//   },
//   addModalDistrictButton: {
//     backgroundColor: MODAL_COLORS.inactiveFilter,
//     borderColor: MODAL_COLORS.inputBorder,
//   },
//   addModalDistrictButtonActive: {
//     backgroundColor: MODAL_COLORS.activeFilter,
//     borderColor: MODAL_COLORS.activeFilter,
//   },
//   addModalDistrictButtonText: {
//     color: MODAL_COLORS.inactiveFilterText,
//   },
//   addModalDistrictButtonTextActive: {
//     color: MODAL_COLORS.activeFilterText,
//   },
//   addModalPriceButton: {
//     backgroundColor: MODAL_COLORS.inactiveFilter,
//     borderColor: MODAL_COLORS.inputBorder,
//   },
//   addModalPriceButtonActive: {
//     backgroundColor: MODAL_COLORS.activeFilter,
//     borderColor: MODAL_COLORS.activeFilter,
//   },
//   addModalPriceButtonText: {
//     color: MODAL_COLORS.inactiveFilterText,
//   },
//   addModalPriceButtonTextActive: {
//     color: MODAL_COLORS.activeFilterText,
//   },
//   addModalScrollView: { 
//     flex: 1,
//   },
//   addModalItemList: { 
//     paddingHorizontal: 16, 
//     paddingBottom: 20,
//     flexGrow: 1,
//   },
//   addModalItemCard: { 
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: MODAL_COLORS.cardBackground,
//     borderRadius: 12,
//     padding: 15, 
//     marginVertical: 8,
//     shadowColor: MODAL_COLORS.shadow,
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.8,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   addModalItemContent: { 
//     flex: 1,
//     flexDirection: 'row', // To align icon and text
//     alignItems: 'center',
//     marginRight: 10, 
//   },
//   disabledItemContent: { 
//     opacity: 0.6,
//   },
//   addModalItemText: { 
//     fontSize: 16,
//     fontWeight: '500',
//     color: MODAL_COLORS.textPrimary,
//     flexShrink: 1, // Allow text to shrink if icon takes space
//     // marginBottom: 4, 
//   },
//   addModalItemCount: { 
//     fontSize: 13,
//     fontWeight: "600",
//     color: MODAL_COLORS.activeFilter, 
//     marginLeft: 'auto', // Push to the right if in same row as title
//   },
//   detailsIconButton: { 
//     padding: 10,
//     borderRadius: 8, 
//     backgroundColor: MODAL_COLORS.inactiveFilter, 
//   },
//   addModalEmptyText: {
//     fontSize: 16,
//     color: MODAL_COLORS.textSecondary,
//     textAlign: "center",
//     marginTop: 40, 
//     paddingHorizontal: 20,
//   },
//   card: { 
//     backgroundColor: MODAL_COLORS.cardBackground, 
//     borderRadius: 12, 
//     padding: 18, 
//     marginVertical: 10, 
//     marginHorizontal: 16, 
//     shadowColor: MODAL_COLORS.shadow,
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.1, 
//     shadowRadius: 6,
//     elevation: 4,
//   },
//   header: { 
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "flex-start", 
//     marginBottom: 12,
//   },
//   titleText: { 
//     fontSize: 16, 
//     fontWeight: "600",
//     color: MODAL_COLORS.textPrimary,
//     flex: 1, 
//     marginRight: 8, 
//   },
//   actions: { 
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   actionButton: { 
//     padding: 8, 
//     borderRadius: 8,
//     backgroundColor: MODAL_COLORS.inactiveFilter, 
//     marginLeft: 6, 
//   },
//   controlRow: { 
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginBottom: 12, 
//   },
//   label: { 
//     fontSize: 15,
//     fontWeight: "500",
//     color: MODAL_COLORS.textSecondary, 
//     marginRight: 10,
//   },
//   quantityContainer: { 
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: MODAL_COLORS.inputBackground, 
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: MODAL_COLORS.inputBorder,
//     paddingHorizontal: 4, 
//   },
//   quantityButton: { 
//     padding: 10,
//   },
//   input: { 
//     width: 56, 
//     height: 38, 
//     fontSize: 15,
//     fontWeight: "500",
//     color: MODAL_COLORS.textPrimary,
//     textAlign: "center",
//     backgroundColor: MODAL_COLORS.cardBackground, 
//     borderRadius: 6,
//     marginHorizontal: 6, 
//   },
//   totalCost: { 
//     fontSize: 15, 
//     fontWeight: "600",
//     color: MODAL_COLORS.activeFilter, 
//     marginLeft: 'auto', 
//   },
//   selectedItemContainer: { 
//     // No specific style, relies on item margins
//   },
//   categoryHeader: { 
//     fontSize: 18,
//     fontWeight: '600',
//     color: MODAL_COLORS.textPrimary,
//     marginBottom: 10,
//     marginTop: 15, 
//     paddingHorizontal: 20, 
//   },
//   categoryHeaderSummary: { // For summary modal
//     fontSize: 16,
//     fontWeight: '600',
//     color: MODAL_COLORS.textPrimary,
//     marginBottom: 8,
//     // paddingHorizontal: 20, // Not needed if items have padding
//   },
//   detailsModalContainer: { 
//     backgroundColor: MODAL_COLORS.cardBackground,
//     borderRadius: 15,
//     width: "90%", 
//     padding: 20,
//     alignSelf: 'center', 
//     shadowColor: MODAL_COLORS.shadow,
//     shadowOffset: { width: 0, height: 5 },
//     shadowOpacity: 0.3,
//     shadowRadius: 10,
//     elevation: 5,
//     maxHeight: SCREEN_HEIGHT * 0.8, 
//   },
//   detailsModalContent: {
//     marginBottom: 20, 
//   },
//   detailsModalText: {
//     fontSize: 16,
//     color: MODAL_COLORS.textPrimary, 
//     marginBottom: 10,
//     lineHeight: 22, 
//   },
//   modalContent: { // For CreateEvent (save) Modal
//     backgroundColor: MODAL_COLORS.cardBackground,
//     borderRadius: 15,
//     width: "90%",
//     maxHeight: SCREEN_HEIGHT * 0.85,
//     padding: 20,
//     alignSelf: 'center',
//     shadowColor: MODAL_COLORS.shadow,
//     shadowOffset: { width: 0, height: 5 },
//     shadowOpacity: 0.3,
//     shadowRadius: 10,
//     elevation: 5,
//   },
//   scrollViewContent: { 
//     paddingBottom: 20, 
//   },
//   inputContainer: { 
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: MODAL_COLORS.inputBackground, 
//     borderRadius: 10,
//     paddingHorizontal: 15,
//     marginBottom: 15,
//     borderWidth: 1,
//     borderColor: MODAL_COLORS.inputBorder,
//   },
//   inputIcon: { 
//     marginRight: 10,
//   },
//   dateButton: { 
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: MODAL_COLORS.inputBackground, 
//     borderRadius: 10,
//     padding: 15, 
//     marginBottom: 15,
//     borderWidth: 1,
//     borderColor: MODAL_COLORS.inputBorder,
//   },
//   buttonIcon: { 
//     marginRight: 10,
//   },
//   dateButtonText: {
//     fontSize: 16,
//     color: MODAL_COLORS.textPrimary,
//   },
//   calendar: { 
//     borderRadius: 10,
//     marginBottom: 15,
//   },
//   subtitle: { 
//     fontSize: 18,
//     fontWeight: "600",
//     color: MODAL_COLORS.textPrimary,
//     marginBottom: 10,
//     marginTop: 5, 
//   },
//   itemsContainer: { 
//     marginBottom: 20,
//   },
//   itemContainer: { 
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: MODAL_COLORS.inactiveFilter, 
//     borderRadius: 8,
//     padding: 12, 
//     marginBottom: 8, 
//   },
//   itemIcon: { 
//     marginRight: 10,
//   },
//   itemText: { 
//     fontSize: 14, 
//     color: MODAL_COLORS.textPrimary,
//     flex: 1, 
//     lineHeight: 18,
//   },
//   noItems: { 
//     fontSize: 16,
//     color: MODAL_COLORS.textSecondary,
//     textAlign: "center",
//     paddingVertical: 20, 
//   },
//   totalContainer: { 
//     marginBottom: 10,
//     paddingTop: 10, 
//     borderTopWidth: 1, 
//     borderTopColor: MODAL_COLORS.separator,
//   },
//   totalText: { 
//     fontSize: 17, 
//     fontWeight: "600",
//     color: MODAL_COLORS.textPrimary,
//     marginBottom: 5,
//   },
//   budgetInfo: { 
//     fontSize: 16,
//     color: MODAL_COLORS.textPrimary, 
//   },
//   budgetError: { 
//     color: COLORS.error, 
//     fontWeight: 'bold',
//   },
//   modalButtonContainer: { 
//     flexDirection: "row", 
//     justifyContent: "center", 
//     marginTop: 20,
//   },
//   modalButton: { 
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: 'center', 
//     paddingVertical: 14, 
//     paddingHorizontal: 25, 
//     borderRadius: 10, 
//     marginHorizontal: 10, 
//   },
//   modalButton2: { // For "Подробнее" in DetailsModal
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: 'center',
//     paddingVertical: 14,
//     paddingHorizontal: 20, 
//     borderRadius: 10,
//     backgroundColor: MODAL_COLORS.primaryActionEnd, 
//   },
//   confirmButton: { 
//     backgroundColor: MODAL_COLORS.primaryActionEnd, 
//     shadowColor: 'rgba(0,0,0,0.2)',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.8,
//     shadowRadius: 3,
//     elevation: 2,
//   },
//   modalButtonText: { 
//     fontSize: 16,
//     color: MODAL_COLORS.activeFilterText, 
//     fontWeight: "600",
//     marginLeft: 8, 
//   },
// });

const styles = StyleSheet.create({
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

  topPatternContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: "15%", // Reduced from 20% to 15% to save vertical space
    zIndex: -1,
    resizeMode: "cover",
    opacity: 0.8,
    marginBottom: "1%", // Reduced from 10% to 5%
  },
  categoryButton: {
    flex: 1,
    height: 55, // Reduced from 50 to 45 for tighter layout
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
    marginVertical: 1, // Reduced from 2 to 1
    zIndex:11,
  },
  categoryButtonAdd: {
    width: 60,
    height: 45, // Reduced from 50 to 45
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
    marginVertical: 1, // Reduced from 2 to 1
    zIndex:20
  },
  categoryButtonGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#5A4032",
    borderRadius: 10,
  },
  categoryPlusText: {
    fontSize: 24,
    color: COLORS.white,
    fontWeight: "bold",
  },
  categoryText: {
    fontSize: 14, // Reduced from 16 to 14 for compactness
    color: COLORS.white,
    fontWeight: "600",
    textAlign: "center",
    paddingHorizontal: 8, // Reduced from 10 to 8
  },
  disabledCategoryButton: {
    opacity: 0.5,
    zIndex:8
  },
  splashContainer: { flex: 1 },
  headerContainer: {
    paddingHorizontal: 20,
    marginTop: 10, // Reduced from 20 to 10 to bring content up
  },
  budgetContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  categoryItemAdd: {
    width: "20%", // Adjusted width for the Add button container
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
    flex: 0.6, // Slightly less space than budget
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 10,
    padding: 10,
    color: COLORS.white,
    fontSize: 16,
  },
  logoContainer: {
    alignItems: "center",
    marginVertical: 5, // Reduced from 10 to 5 to save vertical space
    marginTop: "0%", // Keep at 0%
  },
  potIcon: {
    width: 80, // Reduced from 120 to 80 to make logo smaller
    height: 80, // Reduced from 120 to 80
  },
  potIcon2: { width: 50, height: 50 },
  potIcon3: { width: 70, height: 70, zIndex: 3 },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 5, // Reduced from 10 to 5 to save space
  },
  scrollView: { flex: 1 },
  categoryGrid: {
    flexDirection: "column",
    alignItems: "stretch",
  },
  categoryItem: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8, // Reduced from 10 to 8 for tighter spacing
    width: "100%",
  },
  removeCategoryButton: {
    marginRight: 10,
    padding: 5,
  },
  bottomPadding: { height: 20 },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    backgroundColor: "transparent",
    zIndex: 5,
    marginBottom: "10%", // Reduced from 20% to 10% to minimize overlap
  },
  nextButton: {
    borderRadius: 25,
    overflow: "hidden",
    marginVertical: 5,
    alignItems: "center",
    zIndex: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: MODAL_COLORS.overlayBackground,
  },
  addModalContainer: {
    backgroundColor: MODAL_COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: "100%",
    maxHeight: SCREEN_HEIGHT * 0.9,
    paddingTop: 10,
    paddingBottom: Dimensions.get("window").height > 700 ? 20 : 10,
    shadowColor: MODAL_COLORS.shadow,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 10,
    flex: 1,
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
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MODAL_COLORS.inputBackground,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginHorizontal: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: MODAL_COLORS.inputBorder,
  },
  addModalSearchIcon: {
    marginRight: 10,
  },
  addModalSearchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: MODAL_COLORS.textPrimary,
  },
  addModalClearIcon: {
    padding: 5,
  },
  addModalFilterScroll: {
    maxHeight: SCREEN_HEIGHT * 0.25,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  addModalFilterLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: MODAL_COLORS.textPrimary,
    marginBottom: 10,
    marginTop: 10,
  },
  filterButtonBase: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1.5,
  },
  filterButtonTextBase: {
    fontSize: 14,
    fontWeight: "500",
  },
  addModalTypeButton: {
    backgroundColor: MODAL_COLORS.inactiveFilter,
    borderColor: MODAL_COLORS.inputBorder,
  },
  addModalTypeButtonActive: {
    backgroundColor: MODAL_COLORS.activeFilter,
    borderColor: MODAL_COLORS.activeFilter,
  },
  addModalTypeButtonText: {
    color: MODAL_COLORS.inactiveFilterText,
  },
  addModalTypeButtonTextActive: {
    color: MODAL_COLORS.activeFilterText,
  },
  addModalDistrictButton: {
    backgroundColor: MODAL_COLORS.inactiveFilter,
    borderColor: MODAL_COLORS.inputBorder,
  },
  addModalDistrictButtonActive: {
    backgroundColor: MODAL_COLORS.activeFilter,
    borderColor: MODAL_COLORS.activeFilter,
  },
  addModalDistrictButtonText: {
    color: MODAL_COLORS.inactiveFilterText,
  },
  addModalDistrictButtonTextActive: {
    color: MODAL_COLORS.activeFilterText,
  },
  addModalPriceButton: {
    backgroundColor: MODAL_COLORS.inactiveFilter,
    borderColor: MODAL_COLORS.inputBorder,
  },
  addModalPriceButtonActive: {
    backgroundColor: MODAL_COLORS.activeFilter,
    borderColor: MODAL_COLORS.activeFilter,
  },
  addModalPriceButtonText: {
    color: MODAL_COLORS.inactiveFilterText,
  },
  addModalPriceButtonTextActive: {
    color: MODAL_COLORS.activeFilterText,
  },
  addModalScrollView: {
    flex: 1,
  },
  addModalItemList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    flexGrow: 1,
  },
  addModalItemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MODAL_COLORS.cardBackground,
    borderRadius: 12,
    padding: 15,
    marginVertical: 8,
    shadowColor: MODAL_COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
  addModalItemContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  disabledItemContent: {
    opacity: 0.6,
  },
  addModalItemText: {
    fontSize: 16,
    fontWeight: "500",
    color: MODAL_COLORS.textPrimary,
    flexShrink: 1,
  },
  addModalItemCount: {
    fontSize: 13,
    fontWeight: "600",
    color: MODAL_COLORS.activeFilter,
    marginLeft: "auto",
  },
  detailsIconButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: MODAL_COLORS.inactiveFilter,
  },
  addModalEmptyText: {
    fontSize: 16,
    color: MODAL_COLORS.textSecondary,
    textAlign: "center",
    marginTop: 40,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: MODAL_COLORS.cardBackground,
    borderRadius: 12,
    padding: 18,
    marginVertical: 10,
    marginHorizontal: 16,
    shadowColor: MODAL_COLORS.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  titleText: {
    fontSize: 16,
    fontWeight: "600",
    color: MODAL_COLORS.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: MODAL_COLORS.inactiveFilter,
    marginLeft: 6,
  },
  controlRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  label: {
    fontSize: 15,
    fontWeight: "500",
    color: MODAL_COLORS.textSecondary,
    marginRight: 10,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MODAL_COLORS.inputBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: MODAL_COLORS.inputBorder,
    paddingHorizontal: 4,
  },
  quantityButton: {
    padding: 10,
  },
  input: {
    width: 150,
    height: 38,
    fontSize: 15,
    fontWeight: "500",
    color: MODAL_COLORS.textPrimary,
    textAlign: "center",
    backgroundColor: MODAL_COLORS.cardBackground,
    borderRadius: 6,
    marginHorizontal: 6,
  },
  totalCost: {
    fontSize: 15,
    fontWeight: "600",
    color: MODAL_COLORS.activeFilter,
    marginLeft: "auto",
  },
  selectedItemContainer: {
    // No specific style, relies on item margins
  },
  categoryHeader: {
    fontSize: 18,
    fontWeight: "600",
    color: MODAL_COLORS.textPrimary,
    marginBottom: 10,
    marginTop: 15,
    paddingHorizontal: 20,
  },
  categoryHeaderSummary: {
    fontSize: 16,
    fontWeight: "600",
    color: MODAL_COLORS.textPrimary,
    marginBottom: 8,
  },
  detailsModalContainer: {
    backgroundColor: MODAL_COLORS.cardBackground,
    borderRadius: 15,
    width: "90%",
    padding: 20,
    alignSelf: "center",
    shadowColor: MODAL_COLORS.shadow,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
    maxHeight: SCREEN_HEIGHT * 0.8,
  },
  detailsModalContent: {
    marginBottom: 20,
  },
  detailsModalText: {
    fontSize: 16,
    color: MODAL_COLORS.textPrimary,
    marginBottom: 10,
    lineHeight: 22,
  },
  modalContent: {
    backgroundColor: MODAL_COLORS.cardBackground,
    borderRadius: 15,
    width: "90%",
    maxHeight: SCREEN_HEIGHT * 0.85,
    padding: 20,
    alignSelf: "center",
    shadowColor: MODAL_COLORS.shadow,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MODAL_COLORS.inputBackground,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: MODAL_COLORS.inputBorder,
  },
  inputIcon: {
    marginRight: 10,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MODAL_COLORS.inputBackground,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: MODAL_COLORS.inputBorder,
  },
  buttonIcon: {
    marginRight: 10,
  },
  dateButtonText: {
    fontSize: 16,
    color: MODAL_COLORS.textPrimary,
  },
  calendar: {
    borderRadius: 10,
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: MODAL_COLORS.textPrimary,
    marginBottom: 10,
    marginTop: 5,
  },
  itemsContainer: {
    marginBottom: 20,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MODAL_COLORS.inactiveFilter,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  itemIcon: {
    marginRight: 10,
  },
  itemText: {
    fontSize: 14,
    color: MODAL_COLORS.textPrimary,
    flex: 1,
    lineHeight: 18,
  },
  noItems: {
    fontSize: 16,
    color: MODAL_COLORS.textSecondary,
    textAlign: "center",
    paddingVertical: 20,
  },
  totalContainer: {
    marginBottom: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: MODAL_COLORS.separator,
  },
  totalText: {
    fontSize: 17,
    fontWeight: "600",
    color: MODAL_COLORS.textPrimary,
    marginBottom: 5,
  },
  budgetInfo: {
    fontSize: 16,
    color: MODAL_COLORS.textPrimary,
  },
  budgetError: {
    color: COLORS.error,
    fontWeight: "bold",
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  modalButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  modalButton2: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: MODAL_COLORS.primaryActionEnd,
  },
  confirmButton: {
    backgroundColor: MODAL_COLORS.primaryActionEnd,
    shadowColor: "rgba(0,0,0,0.2)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 2,
  },
  modalButtonText: {
    fontSize: 16,
    color: MODAL_COLORS.activeFilterText,
    fontWeight: "600",
    marginLeft: 8,
  },
});



export default CreateEventScreen;