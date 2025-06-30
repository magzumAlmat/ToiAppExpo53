
// import React, { Component, useState, useRef, useEffect, useCallback, useMemo } from "react";
// import {
//   View,
//   Image,
//   StyleSheet,
//   TouchableOpacity,
//   Text,
//   Dimensions,
//   FlatList,
//   Modal,
//   TextInput,
//   ActivityIndicator,
//   ScrollView,
//   SafeAreaView,
// } from "react-native";
// import { LinearGradient } from "expo-linear-gradient";
// import AntDesign from "@expo/vector-icons/AntDesign";
// import { useDispatch, useSelector } from "react-redux";
// import api from "../api/api";
// import * as Animatable from "react-native-animatable";
// import { Calendar } from "react-native-calendars";
// import Icon from "react-native-vector-icons/MaterialIcons";
// import Icon2 from "react-native-vector-icons/MaterialCommunityIcons";
// import * as Haptics from "expo-haptics";
// import * as Linking from "expo-linking";

// const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// const COLORS = {
//   primary: "#FF6F61",
//   secondary: "#4A90E2",
//   background: "#FDFDFD",
//   card: "#FFFFFF",
//   textPrimary: "#2D3748",
//   textSecondary: "#718096",
//   accent: "#FBBF24",
//   shadow: "rgba(0, 0, 0, 0.3)",
//   error: "#FF0000",
//   white: "#FFFFFF",
//   buttonGradientStart: "#D3C5B7",
//   buttonGradientEnd: "#A68A6E",
//   placeholder: "rgba(255, 255, 255, 0.7)",
// };

// const MODAL_COLORS = {
//   background: "#EDE7D9",
//   cardBackground: "#FDFBF5",
//   primaryActionStart: COLORS.buttonGradientStart,
//   primaryActionEnd: COLORS.buttonGradientEnd,
//   textPrimary: "#5A4032",
//   textSecondary: "#718096",
//   inputBackground: "#FBF9F7",
//   inputBorder: "#B0A092",
//   activeFilter: COLORS.buttonGradientEnd,
//   activeFilterText: COLORS.white,
//   inactiveFilter: "#EFEBE4",
//   inactiveFilterText: "#5A4032",
//   separator: "#DCCFC0",
//   shadow: "rgba(0, 0, 0, 0.15)",
//   icon: "#5A4032",
//   closeButtonColor: "#5A4032",
//   overlayBackground: "rgba(45, 55, 72, 0.65)",
// };

// const typeOrder = {
//   restaurant: 1,
//   hotels: 2,
//   tamada: 3,
//   program: 4,
//   flowers: 5,
//   transport: 6,
//   cake: 7,
//   alcohol: 8,
//   jewelry: 9,
//   typography: 10,
//   "technical-equipment-rental": 11,
//   "event-category": 12,
// };

// const typesMapping = [
//     { key: "restaurants", costField: "averageCost", type: "restaurant", label: "Ресторан" },
//     { key: "hotels", costField: "cost", type: "hotels", label: "Гостиницы" },
//     { key: "tamada", costField: "cost", type: "tamada", label: "Ведущие" },
//     { key: "programs", costField: "cost", type: "program", label: "Шоу программы" },
//     { key: "flowers", costField: "cost", type: "flowers", label: "Цветы" },
//     { key: "transport", costField: "cost", type: "transport", label: "Прокат авто" },
//     { key: "cakes", costField: "cost", type: "cake", label: "Торты" },
//     { key: "alcohol", costField: "cost", type: "alcohol", label: "Алкоголь" },
//     { key: "jewelry", costField: "cost", type: "jewelry", label: "Ювелирные изделия" },
//     { key: "typographies", costField: "cost", type: "typography", label: "Типографии" },
//     { key: "technical-equipment-rentals", costField: "cost", type: "technical-equipment-rental", label: "Аренда технического оснащения" },
//     { key: "event-categories", costField: "cost", type: "event-category", label: "Категории мероприятий" },
//   ];

// const categoryToTypeMap = {
//   "Ресторан": "restaurant",
//   "Гостиницы": "hotels",
//   "Ведущие": "tamada",
//   "Шоу программы": "program",
//   "Цветы": "flowers",
//   "Прокат авто": "transport",
//   "Торты": "cake",
//   "Алкоголь": "alcohol",
//   "Ювелирные изделия": "jewelry",
//   "Типографии": "typography",
//   "Аренда технического оснащения": "technical-equipment-rental",
//   "Категории мероприятий": "event-category",
// };

// const typeToCategoryMap = Object.fromEntries(
//   Object.entries(categoryToTypeMap).map(([category, type]) => [type, category])
// );

// const useDebounce = (callback, delay) => {
//   const callbackRef = useRef(callback);
//   useEffect(() => {
//     callbackRef.current = callback;
//   }, [callback]);

//   const debouncedCallback = useCallback(
//     (...args) => {
//       const timeout = setTimeout(() => {
//         callbackRef.current(...args);
//       }, delay);
//       return () => clearTimeout(timeout);
//     },
//     [delay]
//   );

//   return debouncedCallback;
// };

// class ErrorBoundary extends Component {
//   state = { hasError: false };

//   static getDerivedStateFromError(error) {
//     return { hasError: true };
//   }

//   componentDidCatch(error, errorInfo) {
//     console.error("ErrorBoundary caught an error:", error, errorInfo);
//   }

//   render() {
//     if (this.state.hasError) {
//       return (
//         <View style={styles.errorContainer}>
//           <Text style={styles.errorText}>Произошла ошибка. Пожалуйста, попробуйте снова.</Text>
//         </View>
//       );
//     }
//     return this.props.children;
//   }
// }

// const AddItemModal = ({
//   visible,
//   onClose,
//   filteredItems,
//   filteredData,
//   handleAddItem,
//   setDetailsModalVisible,
//   setSelectedItem,
//   quantities,
//   updateCategories,
// }) => {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedTypeFilter, setSelectedTypeFilter] = useState("all");
//   const [selectedDistrict, setSelectedDistrict] = useState("all");
//   const [costRange, setCostRange] = useState("all");

//   const uniqueTypes = useMemo(() => {
//     const types = [
//       { type: "all", label: "Все" },
//       ...filteredItems
//         .map((item) => ({
//           type: item.type,
//           label:
//             typesMapping.find((t) => t.type === item.type)?.label || item.type,
//         }))
//         .filter(
//           (value, index, self) =>
//             self.findIndex((t) => t.type === value.type) === index
//         )
//         .sort((a, b) => (typeOrder[a.type] || 9) - (typeOrder[b.type] || 9)),
//     ];
//     return types;
//   }, [filteredItems]);

//   const districts = useMemo(
//     () => [
//       "all",
//       ...new Set(
//         filteredItems.map((item) => String(item.district)).filter(Boolean)
//       ),
//     ],
//     [filteredItems]
//   );

//   const filteredDataMemo = useMemo(() => {
//     let result = filteredItems;
//     if (searchQuery) {
//       result = result.filter((item) =>
//         [
//           item.name,
//           item.itemName,
//           item.flowerName,
//           item.alcoholName,
//           item.carName,
//           item.teamName,
//           item.salonName,
//           item.storeName,
//           item.address,
//           item.phone,
//           item.cuisine,
//           item.category,
//           item.brand,
//           item.gender,
//           item.portfolio,
//           item.cakeType,
//           item.flowerType,
//           item.material,
//           item.type,
//         ]
//           .filter(Boolean)
//           .some((field) =>
//             field.toLowerCase().includes(searchQuery.toLowerCase())
//           )
//       );
//     }
//     if (selectedTypeFilter !== "all") {
//       result = result.filter((item) => item.type === selectedTypeFilter);
//     }
//     if (selectedDistrict !== "all") {
//       result = result.filter(
//         (item) => String(item.district) === selectedDistrict
//       );
//     }
//     if (costRange !== "all") {
//       result = result.filter((item) => {
//         const cost = item.averageCost || item.cost;
//         if (costRange === "0-10000") return cost <= 10000;
//         if (costRange === "10000-50000") return cost > 10000 && cost <= 50000;
//         if (costRange === "50000+") return cost > 50000;
//         return true;
//       });
//     }
//     return result.sort(
//       (a, b) => (typeOrder[a.type] || 9) - (typeOrder[b.type] || 9)
//     );
//   }, [
//     filteredItems,
//     searchQuery,
//     selectedTypeFilter,
//     selectedDistrict,
//     costRange,
//   ]);

//   const renderAddItem = useCallback(
//     ({ item }) => {
//       if (!item || !item.type || !item.id) {
//         console.warn("Некорректный элемент в renderAddItem:", item);
//         return null;
//       }

//       const count = filteredData.filter(
//         (selectedItem) =>
//           `${selectedItem.type}-${selectedItem.id}` ===
//           `${item.type}-${item.id}`
//       ).length;
//       const cost = item.type === "restaurant" ? item.averageCost : item.cost;
//       let title;
//       switch (item.type) {
//         case "restaurant":
//           title = `Ресторан: ${item.name} (${cost} ₸)`;
//           break;
//         case "hotels":
//           title = `Гостиница: ${item.name} (${cost} ₸)`;
//           break;
//         case "tamada":
//           title = `Ведущий: ${item.name} (${cost} ₸)`;
//           break;
//         case "program":
//           title = `Шоу программа: ${item.teamName} (${cost} ₸)`;
//           break;
//         case "flowers":
//           title = `Цветы: ${item.salonName} - ${item.flowerName} (${cost} ₸)`;
//           break;
//         case "transport":
//           title = `Прокат авто: ${item.salonName} - ${item.carName} (${cost} ₸)`;
//           break;
//         case "cake":
//           title = `Торты: ${item.name} (${cost} ₸)`;
//           break;
//         case "alcohol":
//           title = `Алкоголь: ${item.salonName} - ${item.alcoholName} (${cost} ₸)`;
//           break;
//         case "jewelry":
//           title = `Ювелирные изделия: ${item.storeName} - ${item.itemName} (${cost} ₸)`;
//           break;
//         default:
//           title = "Неизвестный элемент";
//       }
//       return (
//         <View style={styles.addModalItemCard}>
//           <TouchableOpacity
//             style={styles.addModalItemContent}
//             onPress={() => {
//               Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
//               handleAddItem(item);
//               const category = typeToCategoryMap[item.type];
//               if (category) {
//                 updateCategories(category);
//               }
//             }}
//           >
//             <Text style={styles.addModalItemText}>{title}</Text>
//             {count > 0 && (
//               <Text style={styles.addModalItemCount}>Добавлено: {count}</Text>
//             )}
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={styles.detailsIconButton}
//             onPress={() => {
//               Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//               setSelectedItem(item);
//               setDetailsModalVisible(true);
//             }}
//           >
//             <Icon name="search" size={20} color={MODAL_COLORS.icon} />
//           </TouchableOpacity>
//         </View>
//       );
//     },
//     [
//       filteredData,
//       handleAddItem,
//       setDetailsModalVisible,
//       setSelectedItem,
//       updateCategories,
//     ]
//   );

//   const closeModal = () => {
//     setSearchQuery("");
//     setSelectedTypeFilter("all");
//     setSelectedDistrict("all");
//     setCostRange("all");
//     onClose();
//   };

//   return (
//     <Modal
//       visible={visible}
//       transparent
//       animationType="slide"
//       onRequestClose={closeModal}
//     >
//       <SafeAreaView style={styles.modalOverlay}>
//         <View style={styles.addModalContainer}>
//           <View style={styles.modalHeader}>
//             <Text style={styles.modalTitle}>Добавить элемент</Text>
//             <TouchableOpacity
//               style={styles.modalCloseButton}
//               onPress={closeModal}
//             >
//               <Icon name="close" size={24} color={MODAL_COLORS.closeButtonColor} />
//             </TouchableOpacity>
//           </View>

//           <View style={styles.addModalSearchContainer}>
//             <Icon
//               name="search"
//               size={20}
//               color={MODAL_COLORS.icon}
//               style={styles.addModalSearchIcon}
//             />
//             <TextInput
//               style={styles.addModalSearchInput}
//               placeholder="Поиск по названию..."
//               value={searchQuery}
//               onChangeText={setSearchQuery}
//               placeholderTextColor={MODAL_COLORS.textSecondary}
//             />
//             {searchQuery.length > 0 && (
//               <TouchableOpacity
//                 style={styles.addModalClearIcon}
//                 onPress={() => setSearchQuery("")}
//               >
//                 <Icon name="clear" size={20} color={MODAL_COLORS.icon} />
//               </TouchableOpacity>
//             )}
//           </View>

//           <ScrollView
//             style={styles.addModalFilterScroll}
//             showsVerticalScrollIndicator={false}
//           >
//             <View>
//               <View>
//                 <Text style={styles.addModalFilterLabel}>Тип</Text>
//                 <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//                   {uniqueTypes.map((typeObj) => (
//                     <TouchableOpacity
//                       key={typeObj.type}
//                       style={[
//                         styles.filterButtonBase,
//                         selectedTypeFilter === typeObj.type
//                           ? styles.addModalTypeButtonActive
//                           : styles.addModalTypeButton,
//                       ]}
//                       onPress={() => setSelectedTypeFilter(typeObj.type)}
//                     >
//                       <Text
//                         style={[
//                           styles.filterButtonTextBase,
//                           selectedTypeFilter === typeObj.type
//                             ? styles.addModalTypeButtonTextActive
//                             : styles.addModalTypeButtonText,
//                         ]}
//                       >
//                         {typeObj.label}
//                       </Text>
//                     </TouchableOpacity>
//                   ))}
//                 </ScrollView>
//               </View>
//               <View>
//                 <Text style={styles.addModalFilterLabel}>Район</Text>
//                 <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//                   {districts.map((district) => (
//                     <TouchableOpacity
//                       key={district}
//                       style={
//                         selectedDistrict === district
//                           ? [styles.filterButtonBase, styles.addModalDistrictButtonActive]
//                           : [styles.filterButtonBase, styles.addModalDistrictButton]
//                       }
//                       onPress={() => setSelectedDistrict(district)}
//                     >
//                       <Text
//                         style={
//                           selectedDistrict === district
//                             ? [styles.filterButtonTextBase, styles.addModalDistrictButtonTextActive]
//                             : [styles.filterButtonTextBase, styles.addModalDistrictButtonText]
//                         }
//                       >
//                         {district === "all" ? "Все" : district}
//                       </Text>
//                     </TouchableOpacity>
//                   ))}
//                 </ScrollView>
//               </View>
//               <View>
//                 <Text style={styles.addModalFilterLabel}>Цена</Text>
//                 <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//                   {[
//                     { label: "Все", value: "all" },
//                     { label: "0-10k", value: "0-10000" },
//                     { label: "10k-50k", value: "10000-50000" },
//                     { label: "50k+", value: "50000+" },
//                   ].map((option) => (
//                     <TouchableOpacity
//                       key={option.value}
//                       style={[
//                         styles.filterButtonBase,
//                         costRange === option.value
//                           ? styles.addModalPriceButtonActive
//                           : styles.addModalPriceButton,
//                       ]}
//                       onPress={() => setCostRange(option.value)}
//                     >
//                       <Text
//                         style={[
//                           styles.filterButtonTextBase,
//                           costRange === option.value
//                             ? styles.addModalPriceButtonTextActive
//                             : styles.addModalPriceButtonText,
//                         ]}
//                       >
//                         {option.label}
//                       </Text>
//                     </TouchableOpacity>
//                   ))}
//                 </ScrollView>
//               </View>
//             </View>
//           </ScrollView>

//           <FlatList
//             data={filteredDataMemo}
//             renderItem={renderAddItem}
//             keyExtractor={(item) => `${item.type}-${item.id}`}
//             showsVerticalScrollIndicator={true}
//             contentContainerStyle={styles.addModalItemList}
//             ListEmptyComponent={
//               <Text style={styles.addModalEmptyText}>Ничего не найдено</Text>
//             }
//             style={styles.addModalScrollView}
//             nestedScrollEnabled
//           />
//         </View>
//       </SafeAreaView>
//     </Modal>
//   );
// };

// const SelectedItem = ({
//   item,
//   quantities,
//   setQuantities,
//   filteredData,
//   setFilteredData,
//   budget,
//   setRemainingBudget,
//   handleRemoveItem,
//   setDetailsModalVisible,
//   setSelectedItem,
//   onClose,
//   guestCount,
//   setGuestCount,
// }) => {
//   const itemKey = `${item.type}-${item.id}`;
//   const [inputQuantity, setInputQuantity] = useState(
//     quantities[itemKey] || "1"
//   );
//   const [inputGuestCount, setInputGuestCount] = useState(
//     guestCount?.toString() || "1"
//   );
//   const isSelected = !!quantities[itemKey];

//   useEffect(() => {
//     setInputQuantity(quantities[itemKey] || "1");
//   }, [quantities, itemKey]);

//   useEffect(() => {
//     if (item.type === "restaurant" || item.type === "hotels") {
//       setInputGuestCount(guestCount?.toString() || "1");
//     }
//   }, [guestCount, item.type]);

//   const cost = item.type === "restaurant" ? item.averageCost : item.cost;
//   const parsedGuestCountForVenue = parseInt(inputGuestCount, 10) || 1;
//   const parsedQuantityGeneral = parseInt(inputQuantity, 10) || 1;

//   const totalCost =
//     item.type === "restaurant" || item.type === "hotels"
//       ? cost * parsedGuestCountForVenue
//       : cost * parsedQuantityGeneral;

//   const syncItemQuantity = (value) => {
//     let newQuantityStr = value === "" || value === "0" ? "1" : value;
//     newQuantityStr = newQuantityStr.replace(/[^0-9]/g, "");
//     if (newQuantityStr === "") newQuantityStr = "1";

//     setInputQuantity(newQuantityStr);

//     setQuantities((prevQuantities) => {
//       const updatedQuantities = { ...prevQuantities, [itemKey]: newQuantityStr };

//       const totalSpent = filteredData.reduce((sum, dataItem) => {
//         const key = `${dataItem.type}-${dataItem.id}`;
//         const itemCost = dataItem.type === "restaurant" ? dataItem.averageCost : dataItem.cost;
//         let effectiveCount;
//         if (dataItem.type === "restaurant" || dataItem.type === "hotels") {
//           effectiveCount = parseInt(guestCount, 10) || 1;
//         } else {
//           effectiveCount = parseInt(updatedQuantities[key], 10) || 1;
//         }
//         return sum + (itemCost * effectiveCount);
//       }, 0);
//       setRemainingBudget(parseFloat(budget) - totalSpent);

//       const updatedFilteredData = filteredData.map((dItem) => {
//         if (`${dItem.type}-${dItem.id}` === itemKey) {
//           return { ...dItem, totalCost: cost * (parseInt(newQuantityStr, 10) || 1) };
//         }
//         return dItem;
//       });
//       setFilteredData(updatedFilteredData);

//       return updatedQuantities;
//     });
//   };

//   const syncVenueGuestCount = (value) => {
//     let newGuestCountStr = value === "" || value === "0" ? "1" : value;
//     newGuestCountStr = newGuestCountStr.replace(/[^0-9]/g, "");
//     if (newGuestCountStr === "") newGuestCountStr = "1";

//     let guestCountNum = parseInt(newGuestCountStr, 10) || 1;

//     if ((item.type === "restaurant" || item.type === "hotels") && guestCountNum > item.capacity) {
//       guestCountNum = item.capacity;
//       alert(`Максимальная вместимость ${item.type === "restaurant" ? "ресторана" : "гостиницы"}: ${item.capacity} гостей.`);
//     }
//     newGuestCountStr = guestCountNum.toString();

//     setInputGuestCount(newGuestCountStr);
//     if (setGuestCount) {
//       setGuestCount(guestCountNum);
//     }

//     setFilteredData((prevData) => {
//       const updatedData = prevData.map((dataItem) => {
//         if (dataItem.type === "restaurant" || dataItem.type === "hotels") {
//           const itemCost = dataItem.type === "restaurant" ? dataItem.averageCost : dataItem.cost;
//           return { ...dataItem, totalCost: itemCost * guestCountNum };
//         }
//         return dataItem;
//       });

//       const totalSpent = updatedData.reduce((sum, dataItem) => {
//         const key = `${dataItem.type}-${dataItem.id}`;
//         const itemCostVal = dataItem.type === "restaurant" ? dataItem.averageCost : dataItem.cost;
//         let effectiveCount;
//         if (dataItem.type === "restaurant" || dataItem.type === "hotels") {
//           effectiveCount = guestCountNum;
//         } else {
//           effectiveCount = parseInt(quantities[key], 10) || 1;
//         }
//         return sum + itemCostVal * effectiveCount;
//       }, 0);
//       setRemainingBudget(parseFloat(budget) - totalSpent);

//       return updatedData;
//     });
//   };

//   const handleAddItem = () => {
//     syncItemQuantity("1");
//     if ((item.type === "restaurant" || item.type === "hotels") && setGuestCount) {
//       setGuestCount(parseInt(inputGuestCount, 10) || 1);
//     }
//   };

//   const handleQuantityChange = (value) => {
//     const filteredValue = value.replace(/[^0-9]/g, "");
//     setInputQuantity(filteredValue);
//   };

//   const handleQuantityBlur = () => {
//     syncItemQuantity(inputQuantity);
//   };

//   const incrementQuantity = () => {
//     const currentQuantity = parseInt(inputQuantity, 10) || 0;
//     syncItemQuantity((currentQuantity + 1).toString());
//   };

//   const decrementQuantity = () => {
//     const currentQuantity = parseInt(inputQuantity, 10) || 1;
//     if (currentQuantity > 1) {
//       syncItemQuantity((currentQuantity - 1).toString());
//     }
//   };

//   const handleGuestCountChange = (value) => {
//     const filteredValue = value.replace(/[^0-9]/g, "");
//     setInputGuestCount(filteredValue);
//   };

//   const handleGuestCountBlur = () => {
//     syncVenueGuestCount(inputGuestCount);
//   };

//   const incrementGuestCount = () => {
//     const currentGuestCount = parseInt(inputGuestCount, 10) || 0;
//     syncVenueGuestCount((currentGuestCount + 1).toString());
//   };

//   const decrementGuestCount = () => {
//     const currentGuestCount = parseInt(inputGuestCount, 10) || 1;
//     if (currentGuestCount > 1) {
//       syncVenueGuestCount((currentGuestCount - 1).toString());
//     }
//   };

//   let title;
//   switch (item.type) {
//     case "restaurant":
//       title = `${item.name} (${cost} ₸/гость, Вместимость: ${item.capacity})`;
//       break;
//     case "hotels":
//       title = `${item.name} (${cost} ₸/гость, Вместимость: ${item.capacity})`;
//       break;
//     case "tamada":
//       title = `${item.name} (${cost} ₸)`;
//       break;
//     case "program":
//       title = `${item.teamName} (${cost} ₸)`;
//       break;
//     case "flowers":
//       title = `${item.salonName} - ${item.flowerName} (${cost} ₸)`;
//       break;
//     case "transport":
//       title = `${item.salonName} - ${item.carName} (${cost} ₸)`;
//       break;
//     case "cake":
//       title = `${item.name} (${cost} ₸)`;
//       break;
//     case "alcohol":
//       title = `${item.salonName} - ${item.alcoholName} (${cost} ₸)`;
//       break;
//     case "jewelry":
//       title = `${item.storeName} - ${item.itemName} (${cost} ₸)`;
//       break;
//     default:
//       title = "Неизвестный элемент";
//   }

//   return (
//     <View style={styles.card}>
//       <View style={styles.header}>
//         <Text style={styles.titleText} numberOfLines={2} ellipsizeMode="tail">
//           {title}
//         </Text>
//         <View style={styles.actions}>
//           <TouchableOpacity
//             style={styles.actionButton}
//             onPress={() => {
//               Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
//               handleRemoveItem(item);
//             }}
//           >
//             <Icon2 name="trash-can-outline" size={22} color={MODAL_COLORS.icon} />
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={styles.actionButton}
//             onPress={() => {
//               Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//               setSelectedItem(item);
//               setDetailsModalVisible(true);
//               if (onClose) onClose();
//             }}
//           >
//             <Icon2 name="magnify" size={24} color={MODAL_COLORS.icon} />
//           </TouchableOpacity>
//         </View>
//       </View>

//       {isSelected && (
//         <>
//           {(item.type === "restaurant" || item.type === "hotels") ? (
//             <View style={styles.controlRow}>
//               <Text style={styles.label}>Гостей</Text>
//               <View style={styles.quantityContainer}>
//                 <TouchableOpacity
//                   style={styles.quantityButton}
//                   onPress={decrementGuestCount}
//                 >
//                   <Icon2 name="minus" size={18} color={MODAL_COLORS.icon} />
//                 </TouchableOpacity>
//                 <TextInput
//                   style={styles.input}
//                   value={inputGuestCount}
//                   onChangeText={handleGuestCountChange}
//                   onBlur={handleGuestCountBlur}
//                   keyboardType="numeric"
//                   placeholder="1"
//                   placeholderTextColor={MODAL_COLORS.textSecondary}
//                   textAlign="center"
//                 />
//                 <TouchableOpacity
//                   style={styles.quantityButton}
//                   onPress={incrementGuestCount}
//                 >
//                   <Icon2 name="plus" size={18} color={MODAL_COLORS.icon} />
//                 </TouchableOpacity>
//               </View>
//               <Text style={styles.totalCost}>
//                 {totalCost.toLocaleString()} ₸
//               </Text>
//             </View>
//           ) : (
//             <View style={styles.controlRow}>
//               <Text style={styles.label}>Количество</Text>
//               <View style={styles.quantityContainer}>
//                 <TouchableOpacity
//                   style={styles.quantityButton}
//                   onPress={decrementQuantity}
//                 >
//                   <Icon2 name="minus" size={18} color={MODAL_COLORS.icon} />
//                 </TouchableOpacity>
//                 <TextInput
//                   style={styles.input}
//                   value={inputQuantity}
//                   onChangeText={handleQuantityChange}
//                   onBlur={handleQuantityBlur}
//                   keyboardType="numeric"
//                   placeholder="1"
//                   placeholderTextColor={MODAL_COLORS.textSecondary}
//                   textAlign="center"
//                 />
//                 <TouchableOpacity
//                   style={styles.quantityButton}
//                   onPress={incrementQuantity}
//                 >
//                   <Icon2 name="plus" size={18} color={MODAL_COLORS.icon} />
//                 </TouchableOpacity>
//               </View>
//               <Text style={styles.totalCost}>
//                 {totalCost.toLocaleString()} ₸
//               </Text>
//             </View>
//           )}
//         </>
//       )}
//     </View>
//   );
// };

// const CategoryItemsModal = ({
//   visible,
//   onClose,
//   categoryItems,
//   categoryLabel,
//   categoryType,
//   filteredData,
//   handleAddItem,
//   handleRemoveItem,
//   setDetailsModalVisible,
//   setSelectedItem,
//   quantities,
//   setQuantities,
//   budget,
//   setFilteredData,
//   setRemainingBudget,
//   updateCategories,
//   guestCount,
//   setGuestCount,
// }) => {
//   const selectedItemsForThisCategory = filteredData
//     .filter((item) => item.type === categoryType)
//     .sort((a, b) => (typeOrder[a.type] || 9) - (typeOrder[b.type] || 9));

//   const availableItemsForThisCategory = categoryItems
//     .filter(
//       (catItem) =>
//         !selectedItemsForThisCategory.some(
//           (selItem) => selItem.id === catItem.id && selItem.type === catItem.type
//         )
//     )
//     .sort((a, b) => (typeOrder[a.type] || 9) - (typeOrder[b.type] || 9));

//   const renderAvailableItem = useCallback(
//     ({ item }) => {
//       if (!item || !item.type || !item.id) {
//         console.warn("Некорректный элемент в renderAvailableItem:", item);
//         return null;
//       }
//       const cost = item.type === "restaurant" ? item.averageCost : item.cost;
//       let title;
//       switch (item.type) {
//         case "restaurant":
//           title = `${item.name} (${cost} ₸)`;
//           break;
//         case "hotels":
//           title = `${item.name} (${cost} ₸)`;
//           break;
//         case "tamada":
//           title = `${item.name} (${cost} ₸)`;
//           break;
//         case "program":
//           title = `${item.teamName} (${cost} ₸)`;
//           break;
//         case "flowers":
//           title = `${item.salonName} - ${item.flowerName} (${cost} ₸)`;
//           break;
//         case "transport":
//           title = `${item.salonName} - ${item.carName} (${cost} ₸)`;
//           break;
//         case "cake":
//           title = `${item.name} (${cost} ₸)`;
//           break;
//         case "alcohol":
//           title = `${item.salonName} - ${item.alcoholName} (${cost} ₸)`;
//           break;
//         case "jewelry":
//           title = `${item.storeName} - ${item.itemName} (${cost} ₸)`;
//           break;
//         default:
//           title = "Неизвестный элемент";
//       }
//       return (
//         <View style={styles.addModalItemCard}>
//           <TouchableOpacity
//             style={styles.addModalItemContent}
//             onPress={() => {
//               Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
//               if ((item.type === "restaurant" || item.type === "hotels") && guestCount) {
//                 const totalGuests = parseInt(guestCount, 10);
//                 if (totalGuests > item.capacity) {
//                   alert(
//                     `Этот ${item.type === "restaurant" ? "ресторан" : "гостиница"} не может вместить ${totalGuests} гостей. Максимальная вместимость: ${item.capacity}.`
//                   );
//                   return;
//                 }
//               }
//               handleAddItem(item);
//               const category = typeToCategoryMap[item.type];
//               if (category) {
//                 updateCategories(category);
//               }
//             }}
//           >
//             <Icon2
//               name="plus-circle-outline"
//               size={22}
//               color={MODAL_COLORS.icon}
//               style={{ marginRight: 10 }}
//             />
//             <Text
//               style={styles.addModalItemText}
//               numberOfLines={1}
//               ellipsizeMode="tail"
//             >
//               {title}
//             </Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={styles.detailsIconButton}
//             onPress={() => {
//               Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//               setSelectedItem(item);
//               setDetailsModalVisible(true);
//             }}
//           >
//             <Icon2 name="magnify" size={24} color={MODAL_COLORS.icon} />
//           </TouchableOpacity>
//         </View>
//       );
//     },
//     [
//       handleAddItem,
//       setDetailsModalVisible,
//       setSelectedItem,
//       updateCategories,
//       guestCount,
//     ]
//   );

//   return (
//     <Modal
//       visible={visible}
//       transparent
//       animationType="slide"
//       onRequestClose={onClose}
//     >
//       <SafeAreaView style={styles.modalOverlay}>
//         <View style={styles.addModalContainer}>
//           <View style={styles.modalHeader}>
//             <Text style={styles.modalTitle}>{categoryLabel}</Text>
//             <TouchableOpacity
//               style={styles.modalCloseButton}
//               onPress={onClose}
//               accessible
//               accessibilityLabel="Закрыть модальное окно"
//             >
//               <Icon name="close" size={28} color={MODAL_COLORS.closeButtonColor} />
//             </TouchableOpacity>
//           </View>

//           <ScrollView contentContainerStyle={styles.addModalItemList}>
//             {selectedItemsForThisCategory.length > 0 && (
//               <View style={styles.selectedItemContainer}>
//                 <Text style={styles.categoryHeader}>
//                   Выбранные ({selectedItemsForThisCategory.length}):
//                 </Text>
//                 {selectedItemsForThisCategory.map((item) => (
//                   <SelectedItem
//                     key={`${item.type}-${item.id}`}
//                     item={item}
//                     quantities={quantities}
//                     setQuantities={setQuantities}
//                     filteredData={filteredData}
//                     setFilteredData={setFilteredData}
//                     budget={budget}
//                     setRemainingBudget={setRemainingBudget}
//                     handleRemoveItem={handleRemoveItem}
//                     setDetailsModalVisible={setDetailsModalVisible}
//                     setSelectedItem={setSelectedItem}
//                     onClose={onClose}
//                     guestCount={guestCount}
//                     setGuestCount={setGuestCount}
//                   />
//                 ))}
//               </View>
//             )}

//             {availableItemsForThisCategory.length > 0 && (
//               <View>
//                 <Text style={styles.categoryHeader}>
//                   Доступные ({availableItemsForThisCategory.length}):
//                 </Text>
//                 {availableItemsForThisCategory.map((item) => (
//                   <View key={`${item.type}-${item.id}`}>
//                     {renderAvailableItem({ item })}
//                   </View>
//                 ))}
//               </View>
//             )}

//             {selectedItemsForThisCategory.length === 0 &&
//               availableItemsForThisCategory.length === 0 && (
//                 <Text style={styles.addModalEmptyText}>
//                   Нет элементов для этой категории
//                 </Text>
//               )}
//           </ScrollView>
//         </View>
//       </SafeAreaView>
//     </Modal>
//   );
// };

// const CreateTraditionalFamilyEventScreen = ({ navigation, route }) => {
//   const defaultCategories = [
//     "Ресторан",
//     "Гостиницы",
//     "Ведущие",
//     "Шоу программы",
//     "Цветы",
//     "Прокат авто",
//     "Торты",
//     "Алкоголь",
//     "Ювелирные изделия",
//   ];
//   const selectedCategories = route?.params?.selectedCategories || defaultCategories;

//   const dispatch = useDispatch();
//   const { token, user } = useSelector((state) => state.auth);

//   const [categories, setCategories] = useState(selectedCategories);
//   const [disabledCategories, setDisabledCategories] = useState([]);
//   const [data, setData] = useState({
//     restaurants: [],
//     hotels: [],
//     tamada: [],
//     programs: [],
//     flowers: [],
//     transport: [],
//     cakes: [],
//     alcohol: [],
//     jewelry: [],
//   });
//   const [filteredData, setFilteredData] = useState([]);
//   const [quantities, setQuantities] = useState({});
//   const [budget, setBudget] = useState("");
//   const [guestCount, setGuestCount] = useState("");
//   const [remainingBudget, setRemainingBudget] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [addItemModalVisible, setAddItemModalVisible] = useState(false);
//   const [categoryModalVisible, setCategoryModalVisible] = useState(false);
//   const [selectedCategoryItems, setSelectedCategoryItems] = useState([]);
//   const [selectedCategoryLabel, setSelectedCategoryLabel] = useState("");
//   const [selectedCategoryType, setSelectedCategoryType] = useState("");
//   const [detailsModalVisible, setDetailsModalVisible] = useState(false);
//   const [selectedItem, setSelectedItem] = useState(null);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [eventName, setEventName] = useState("");
//   const [eventDate, setEventDate] = useState(new Date());
//   const [showDatePicker, setShowDatePicker] = useState(false);
//   const [shouldFilter, setShouldFilter] = useState(false);
//   const [blockedDays, setBlockedDays] = useState({});
//   const scrollViewRef = useRef(null);
//   const [isLoading, setIsLoading] = useState(false);

//   const updateCategories = useCallback(
//     (newCategory) => {
//       setCategories((prevCategories) => {
//         if (!prevCategories.includes(newCategory)) {
//           return [...prevCategories, newCategory];
//         }
//         return prevCategories;
//       });
//     },
//     []
//   );

//   const combinedData = useMemo(() => {
//     return [
//       ...(data.restaurants || []).map((item) => ({ ...item, type: "restaurant" })),
//       ...(data.hotels || []).map((item) => ({ ...item, type: "hotels" })),
//       ...(data.tamada || []).map((item) => ({ ...item, type: "tamada" })),
//       ...(data.programs || []).map((item) => ({ ...item, type: "program" })),
//       ...(data.flowers || []).map((item) => ({ ...item, type: "flowers" })),
//       ...(data.transport || []).map((item) => ({ ...item, type: "transport" })),
//       ...(data.cakes || []).map((item) => ({ ...item, type: "cake" })),
//       ...(data.alcohol || []).map((item) => ({ ...item, type: "alcohol" })),
//       ...(data.jewelry || []).map((item) => ({ ...item, type: "jewelry" })),
//       ...(data.typographies || []).map((item) => ({ ...item, type: "typography" })),
//       ...(data["technical-equipment-rentals"] || []).map((item) => ({ ...item, type: "technical-equipment-rental" })),
//       ...(data["event-categories"] || []).map((item) => ({ ...item, type: "event-category" })),
//     ].sort((a, b) => (typeOrder[a.type] || 12) - (typeOrder[b.type] || 12));
//   }, [data]);

//   const handleRemoveCategory = useCallback(
//     (category) => {
//       setDisabledCategories((prev) => {
//         if (prev.includes(category)) {
//           const updatedDisabledCategories = prev.filter(
//             (cat) => cat !== category
//           );
//           const type = categoryToTypeMap[category];
//           if (type) {
//             const itemsToAdd = combinedData.filter(
//               (item) => item.type === type
//             );

//             let remaining = parseFloat(budget) || 0;
//             const currentTotalSpent = filteredData.reduce((sum, dataItem) => {
//               const key = `${dataItem.type}-${dataItem.id}`;
//               const itemQuantity =
//                 dataItem.type === "restaurant" || dataItem.type === "hotels"
//                   ? parseInt(guestCount, 10) || 1
//                   : parseInt(quantities[key] || "1");
//               const itemCost =
//                 dataItem.type === "restaurant"
//                   ? dataItem.averageCost
//                   : dataItem.cost;
//               return sum + itemCost * itemQuantity;
//             }, 0);
//             remaining -= currentTotalSpent;

//             const filteredItemsToAdd = itemsToAdd
//               .filter((item) => {
//                 const cost =
//                   item.type === "restaurant" ? item.averageCost : item.cost;
//                 const effectiveQuantity =
//                   item.type === "restaurant" || item.type === "hotels"
//                     ? parseInt(guestCount, 10) || 1
//                     : 1;
//                 const totalCost = cost * effectiveQuantity;
//                 return totalCost <= remaining;
//               })
//               .sort((a, b) => {
//                 const costA = a.type === "restaurant" ? a.averageCost : a.cost;
//                 const costB = b.type === "restaurant" ? b.averageCost : b.cost;
//                 return costA - costB;
//               });

//             const maxItemsToSelect = Math.min(1, filteredItemsToAdd.length);
//             const selectedItemsToAdd = [];
//             for (let i = 0; i < maxItemsToSelect; i++) {
//               const selectedItem = filteredItemsToAdd[i];
//               if (selectedItem) {
//                 const cost =
//                   selectedItem.type === "restaurant"
//                     ? selectedItem.averageCost
//                     : selectedItem.cost;
//                 const effectiveQuantity =
//                   selectedItem.type === "restaurant" || selectedItem.type === "hotels"
//                     ? parseInt(guestCount, 10) || 1
//                     : 1;
//                 const totalCost = cost * effectiveQuantity;
//                 selectedItemsToAdd.push({ ...selectedItem, totalCost });
//                 remaining -= totalCost;
//               }
//             }

//             setFilteredData((prevData) => {
//               const updatedData = [...prevData, ...selectedItemsToAdd].sort(
//                 (a, b) => (typeOrder[a.type] || 9) - (typeOrder[b.type] || 9)
//               );

//               setQuantities((prevQuantities) => ({
//                 ...prevQuantities,
//                 ...selectedItemsToAdd.reduce((acc, item) => {
//                   const itemKey = `${item.type}-${item.id}`;
//                   return { ...acc, [itemKey]: "1" };
//                 }, {}),
//               }));

//               const totalSpent = updatedData.reduce((sum, dataItem) => {
//                 const key = `${dataItem.type}-${dataItem.id}`;
//                 const itemQuantity =
//                   dataItem.type === "restaurant" || dataItem.type === "hotels"
//                     ? parseInt(guestCount, 10) || 1
//                     : parseInt(quantities[key] || "1");
//                 const itemCost =
//                   dataItem.type === "restaurant"
//                     ? dataItem.averageCost
//                     : dataItem.cost;
//                 return sum + itemCost * itemQuantity;
//               }, 0);
//               setRemainingBudget(parseFloat(budget) - totalSpent);

//               return updatedData;
//             });
//           }
//           return updatedDisabledCategories;
//         } else {
//           const type = categoryToTypeMap[category];
//           if (type) {
//             setFilteredData((prevData) =>
//               prevData.filter((item) => item.type !== type)
//             );
//           }
//           setFilteredData((prevData) => {
//             const totalSpent = prevData.reduce((sum, dataItem) => {
//               const key = `${dataItem.type}-${dataItem.id}`;
//               const itemQuantity =
//                 dataItem.type === "restaurant" || dataItem.type === "hotels"
//                   ? parseInt(guestCount, 10) || 1
//                   : parseInt(quantities[key] || "1");
//               const itemCost =
//                 dataItem.type === "restaurant"
//                   ? dataItem.averageCost
//                   : dataItem.cost;
//               return sum + itemCost * itemQuantity;
//             }, 0);
//             setRemainingBudget(parseFloat(budget) - totalSpent);
//             return prevData;
//           });
//           return [...prev, category];
//         }
//       });
//     },
//     [quantities, budget, guestCount, combinedData]
//   );





  
//   const fetchData = async () => {
//     if (!token || !user?.id) return;
//     setLoading(true);
//     try {
//       const responses = await Promise.all([
//         api.getRestaurants().catch((err) => {
//           console.error("Ошибка получения ресторанов:", err);
//           return { data: [] };
//         }),
//         api.getHotels().catch((err) => {
//           console.error("Ошибка получения гостиниц:", err);
//           return { data: [] };
//         }),
//         api.getTamada().catch((err) => {
//           console.error("Ошибка получения ведущих:", err);
//           return { data: [] };
//         }),
//         api.getPrograms().catch((err) => {
//           console.error("Ошибка получения программ:", err);
//           return { data: [] };
//         }),
//         api.getFlowers().catch((err) => {
//           console.error("Ошибка получения цветов:", err);
//           return { data: [] };
//         }),
//         api.getTransport().catch((err) => {
//           console.error("Ошибка получения транспорта:", err);
//           return { data: [] };
//         }),
//         api.getCakes().catch((err) => {
//           console.error("Ошибка получения тортов:", err);
//           return { data: [] };
//         }),
//         api.getAlcohol().catch((err) => {
//           console.error("Ошибка получения алкоголя:", err);
//           return { data: [] };
//         }),
//         api.getJewelry().catch((err) => {
//           console.error("Ошибка получения ювелирных изделий:", err);
//           return { data: [] };
//         }),
//         api.getTypographies().catch((err) => {
//           console.error("Ошибка получения типографий:", err);
//           return { data: [] };
//         }),
//         api.getTechnicalEquipmentRentals().catch((err) => {
//           console.error("Ошибка получения аренды технического оснащения:", err);
//           return { data: [] };
//         }),
//         api.getEventCategories().catch((err) => {
//           console.error("Ошибка получения категорий мероприятий:", err);
//           return { data: [] };
//         }),
//       ]);
//       const [
//         restaurants,
//         hotels,
//         tamada,
//         programs,
//         flowers,
//         transport,
//         cakes,
//         alcohol,
//         jewelry,
//         typographies,
//         technicalEquipmentRentals,
//         eventCategories,
//       ] = responses.map((res) => res.data);
//       setData({
//         restaurants,
//         hotels,
//         tamada,
//         programs,
//         flowers,
//         transport,
//         cakes,
//         alcohol,
//         jewelry,
//         typographies,
//         "technical-equipment-rentals": technicalEquipmentRentals,
//         "event-categories": eventCategories,
//       });
//       if (hotels.length === 0) {
//         console.warn("Гостиницы не загружены: пустой ответ от /api/hotels");
//       }
//     } catch (error) {
//       console.error("Общая ошибка загрузки данных:", error);
//       alert("Ошибка загрузки данных. Попробуйте снова.");
//     } finally {
//       setLoading(false);
//     }
//   };





//   useEffect(() => {
//     if (!token) navigation.navigate("Login");
//     else fetchData();
//   }, [token, user, navigation]);

//   useEffect(() => {
//     const unsubscribe = navigation.addListener("focus", fetchData);
//     return unsubscribe;
//   }, [navigation]);

//   const formatBudget = (input) => {
//     const cleaned = input.replace(/[^\d]/g, "");
//     return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
//   };

//   const handleBudgetChange = (value) => {
//     const filteredValue = value.replace(/[^\d]/g, "");
//     setBudget(filteredValue);
//     setShouldFilter(true);
//   };

//   const handleGuestCountChange = (value) => {
//     const filteredValue = value.replace(/[^0-9]/g, "");
//     setGuestCount(filteredValue);
//     setShouldFilter(true);
//     setFilteredData((prevData) => {
//       let newTotalSpent = 0;
//       const updatedData = prevData.map((item) => {
//         let itemTotalCost = item.totalCost;
//         let itemEffectiveQuantity =
//           item.type === "restaurant" || item.type === "hotels"
//             ? parseInt(filteredValue, 10) || 1
//             : parseInt(quantities[`${item.type}-${item.id}`], 10) || 1;
//         const itemCost = item.type === "restaurant" ? item.averageCost : item.cost;

//         if (item.type === "restaurant" || item.type === "hotels") {
//           if (item.capacity && (parseInt(filteredValue, 10) || 1) > item.capacity) {
//             alert(
//               `${item.type === "restaurant" ? "Ресторан" : "Гостиница"} ${
//                 item.name
//               } вмещает максимум ${item.capacity} гостей.`
//             );
//             itemEffectiveQuantity = item.capacity;
//           }
//           itemTotalCost = itemCost * itemEffectiveQuantity;
//         }
//         newTotalSpent += itemTotalCost;
//         return { ...item, totalCost: itemTotalCost };
//       });
//       setRemainingBudget(parseFloat(budget) - newTotalSpent);
//       return updatedData;
//     });
//   };

// //   const filterDataByBudget = useDebounce(() => {
// //     if (!budget || isNaN(budget) || parseFloat(budget) <= 0) {
// //       alert("Пожалуйста, введите корректную сумму бюджета");
// //       setIsLoading(false);
// //       return;
// //     }
// //     if (!guestCount || isNaN(guestCount) || parseFloat(guestCount) <= 0) {
// //       alert("Пожалуйста, введите корректное количество гостей");
// //       setIsLoading(false);
// //       return;
// //     }

// //     setIsLoading(true);
// //     const budgetValue = parseFloat(budget);
// //     const guests = parseFloat(guestCount);
// //     let remaining = budgetValue;
// //     const newSelectedItems = [];
// //     const newQuantities = {};

// //     const activeCategories = categories.filter(
// //       (cat) => !disabledCategories.includes(cat)
// //     );
// //     const allowedTypes = activeCategories
// //       .map((cat) => categoryToTypeMap[cat])
// //       .filter(Boolean);

// //     const typesToProcess = typesMapping.filter(({ type }) =>
// //       allowedTypes.includes(type)
// //     );

// //     for (const { key, costField, type, label } of typesToProcess) {
// //       let itemsForType = data[key] || [];
// //       if (itemsForType.length === 0) continue;

// //       if (type === "restaurant" || type === "hotels") {
// //         itemsForType = itemsForType.filter((r) => parseFloat(r.capacity) >= guests);
// //         if (itemsForType.length === 0) {
// //           console.log(
// //             `Нет ${type === "restaurant" ? "ресторанов" : "гостиниц"} для ${guests} гостей в категории ${label}`
// //           );
// //           continue;
// //         }

// //         const suitableVenues = itemsForType
// //           .filter((item) => parseFloat(item[costField]) * guests <= remaining)
// //           .sort((a, b) => parseFloat(a[costField]) - parseFloat(b[costField]));

// //         if (suitableVenues.length > 0) {
// //           const selectedVenue = suitableVenues[Math.floor(suitableVenues.length / 2)];
// //           const itemCost = parseFloat(selectedVenue[costField]) * guests;
// //           newSelectedItems.push({ ...selectedVenue, type, totalCost: itemCost });
// //           newQuantities[`${type}-${selectedVenue.id}`] = guests.toString();
// //           remaining -= itemCost;
// //         } else {
// //           console.log(
// //             `${
// //               type === "restaurant" ? "Рестораны" : "Гостиницы"
// //             } в категории ${label} не вписываются в остаток бюджета ${remaining}`
// //           );
// //         }
// //       } else {
// //         const suitableItems = itemsForType
// //           .filter((item) => parseFloat(item[costField]) <= remaining)
// //           .sort((a, b) => parseFloat(a[costField]) - parseFloat(b[costField]));

// //         if (suitableItems.length > 0) {
// //           const selectedItem = suitableItems[0];
// //           const itemCost = parseFloat(selectedItem[costField]);
// //           newSelectedItems.push({ ...selectedItem, type, totalCost: itemCost });
// //           newQuantities[`${type}-${selectedItem.id}`] = "1";
// //           remaining -= itemCost;
// //         } else {
// //           console.log(
// //             `Элементы в категории ${label} не вписываются в остаток бюджета ${remaining}`
// //           );
// //         }
// //       }
// //     }

// //     if (newSelectedItems.length === 0 && activeCategories.length > 0) {
// //       alert(
// //         "Нет элементов, подходящих под ваш бюджет и количество гостей из выбранных категорий."
// //       );
// //     }

// //     newSelectedItems.sort(
// //       (a, b) => (typeOrder[a.type] || 9) - (typeOrder[b.type] || 9)
// //     );
// //     setFilteredData(newSelectedItems);
// //     setQuantities(newQuantities);
// //     setRemainingBudget(remaining);
// //     setIsLoading(false);
// //   }, 150);

// const filterDataByBudget = useDebounce(() => {
//     if (!budget || isNaN(budget) || parseFloat(budget) <= 0) {
//       alert("Пожалуйста, введите корректную сумму бюджета");
//       setIsLoading(false);
//       return;
//     }
//     if (!guestCount || isNaN(guestCount) || parseFloat(guestCount) <= 0) {
//       alert("Пожалуйста, введите корректное количество гостей");
//       setIsLoading(false);
//       return;
//     }
  
//     setIsLoading(true);
//     const budgetValue = parseFloat(budget);
//     const guests = parseInt(guestCount, 10);
//     let remaining = budgetValue;
//     const newSelectedItems = [];
//     const newQuantities = {};
  
//     // Include all possible types, including new ones
//     const allTypesMapping = [
//       ...typesMapping,
//       { key: "typographies", costField: "cost", type: "typography", label: "Типографии" },
//       { key: "technical-equipment-rentals", costField: "cost", type: "technical-equipment-rental", label: "Аренда технического оснащения" },
//       { key: "event-categories", costField: "cost", type: "event-category", label: "Категории мероприятий" },
//     ];
  
//     const activeCategories = categories.filter(
//       (cat) => !disabledCategories.includes(cat)
//     );
//     const allowedTypes = activeCategories
//       .map((cat) => categoryToTypeMap[cat])
//       .filter(Boolean);
  
//     const typesToProcess = allTypesMapping.filter(({ type }) =>
//       allowedTypes.includes(type)
//     );
  
//     for (const { key, costField, type, label } of typesToProcess) {
//       let itemsForType = data[key] || [];
//       if (itemsForType.length === 0) {
//         console.log(`Нет данных для категории ${label}`);
//         continue;
//       }
  
//       if (type === "restaurant" || type === "hotels") {
//         // Filter venues that can accommodate the guest count
//         itemsForType = itemsForType.filter((r) => parseFloat(r.capacity) >= guests);
//         if (itemsForType.length === 0) {
//           console.log(
//             `Нет ${type === "restaurant" ? "ресторанов" : "гостиниц"} для ${guests} гостей в категории ${label}`
//           );
//           continue;
//         }
  
//         // Sort by cost and select up to one venue (or adjust for multiple if needed)
//         const suitableVenues = itemsForType
//           .filter((item) => parseFloat(item[costField]) * guests <= remaining)
//           .sort((a, b) => parseFloat(a[costField]) - parseFloat(b[costField]));
  
//         if (suitableVenues.length > 0) {
//           const selectedVenue = suitableVenues[0]; // Select cheapest suitable venue
//           const itemCost = parseFloat(selectedVenue[costField]) * guests;
//           newSelectedItems.push({ ...selectedVenue, type, totalCost: itemCost });
//           newQuantities[`${type}-${selectedVenue.id}`] = guests.toString();
//           remaining -= itemCost;
//         } else {
//           console.log(
//             `${
//               type === "restaurant" ? "Рестораны" : "Гостиницы"
//             } в категории ${label} не вписываются в остаток бюджета ${remaining}`
//           );
//         }
//       } else {
//         // For non-venue categories, select multiple items if budget allows
//         const suitableItems = itemsForType
//           .filter((item) => parseFloat(item[costField]) <= remaining)
//           .sort((a, b) => parseFloat(a[costField]) - parseFloat(b[costField]));
  
//         for (const selectedItem of suitableItems) {
//           const itemCost = parseFloat(selectedItem[costField]);
//           if (itemCost <= remaining) {
//             newSelectedItems.push({ ...selectedItem, type, totalCost: itemCost });
//             newQuantities[`${type}-${selectedItem.id}`] = "1";
//             remaining -= itemCost;
//           } else {
//             break; // Stop if budget is exhausted
//           }
//         }
  
//         if (suitableItems.length === 0) {
//           console.log(
//             `Элементы в категории ${label} не вписываются в остаток бюджета ${remaining}`
//           );
//         }
//       }
//     }
  
//     if (newSelectedItems.length === 0 && activeCategories.length > 0) {
//       alert(
//         "Нет элементов, подходящих под ваш бюджет и количество гостей из выбранных категорий."
//       );
//     }
  
//     newSelectedItems.sort(
//       (a, b) => (typeOrder[a.type] || 10) - (typeOrder[b.type] || 10)
//     );
//     setFilteredData(newSelectedItems);
//     setQuantities(newQuantities);
//     setRemainingBudget(remaining);
//     setIsLoading(false);
//   }, 150);




//   useEffect(() => {
//     if (
//       shouldFilter &&
//       budget &&
//       guestCount &&
//       !isNaN(parseFloat(budget)) &&
//       !isNaN(parseFloat(guestCount))
//     ) {
//       filterDataByBudget();
//       setShouldFilter(false);
//     }
//   }, [budget, guestCount, shouldFilter, filterDataByBudget]);

 


//   const handleAddItem = useCallback(
//     (itemToAdd) => {
//       const itemKey = `${itemToAdd.type}-${itemToAdd.id}`;
//       const cost = itemToAdd.type === "restaurant" ? itemToAdd.averageCost : itemToAdd.cost;
  
//       if (itemToAdd.type === "restaurant" || itemToAdd.type === "hotels") {
//         if (!guestCount || parseInt(guestCount, 10) <= 0) {
//           alert(
//             `Пожалуйста, укажите количество гостей перед добавлением ${
//               itemToAdd.type === "restaurant" ? "ресторана" : "гостиницы"
//             }.`
//           );
//           return;
//         }
//         if (parseInt(guestCount, 10) > itemToAdd.capacity) {
//           alert(
//             `Этот ${
//               itemToAdd.type === "restaurant" ? "ресторан" : "гостиница"
//             } не может вместить ${guestCount} гостей. Максимальная вместимость: ${
//               itemToAdd.capacity
//             }.`
//           );
//           return;
//         }
//         setFilteredData((prev) =>
//           prev.filter(
//             (i) =>
//               (i.type !== "restaurant" && i.type !== "hotels") ||
//               i.id === itemToAdd.id
//           )
//         );
//       }
  
//       setFilteredData((prevSelected) => {
//         const existingItem = prevSelected.find(
//           (i) => `${i.type}-${i.id}` === itemKey
//         );
//         let updatedSelectedItems;
//         let newQuantity = "1";
  
//         if (existingItem && itemToAdd.type !== "restaurant" && itemToAdd.type !== "hotels") {
//           newQuantity = (parseInt(quantities[itemKey] || "1") + 1).toString();
//           updatedSelectedItems = prevSelected.map((i) =>
//             i.id === itemToAdd.id && i.type === itemToAdd.type
//               ? { ...i, totalCost: cost * parseInt(newQuantity) }
//               : i
//           );
//         } else if (!existingItem) {
//           const effectiveQuantity =
//             itemToAdd.type === "restaurant" || itemToAdd.type === "hotels"
//               ? parseInt(guestCount, 10) || 1
//               : 1;
//           const totalItemCost = cost * effectiveQuantity;
//           const newItem = { ...itemToAdd, totalCost: totalItemCost };
//           if (itemToAdd.type === "restaurant" || itemToAdd.type === "hotels") {
//             updatedSelectedItems = [
//               ...prevSelected.filter(
//                 (i) => i.type !== "restaurant" && i.type !== "hotels"
//               ),
//               newItem,
//             ];
//           } else {
//             updatedSelectedItems = [...prevSelected, newItem];
//           }
//         } else {
//           updatedSelectedItems = prevSelected;
//         }
  
//         setQuantities((prevQtys) => {
//           const updatedQtys = {
//             ...prevQtys,
//             [itemKey]:
//               itemToAdd.type === "restaurant" || itemToAdd.type === "hotels"
//                 ? guestCount || "1"
//                 : newQuantity,
//           };
  
//           const totalSpent = updatedSelectedItems.reduce((sum, selItem) => {
//             const qtyKey = `${selItem.type}-${selItem.id}`;
//             const itemQty =
//               selItem.type === "restaurant" || selItem.type === "hotels"
//                 ? parseInt(guestCount, 10) || 1
//                 : parseInt(updatedQtys[qtyKey] || "1", 10);
//             const itemCostVal = selItem.type === "restaurant" ? selItem.averageCost : selItem.cost;
//             return sum + itemCostVal * itemQty;
//           }, 0);
  
//           setRemainingBudget(parseFloat(budget) - totalSpent);
//           return updatedQtys;
//         });
  
//         return updatedSelectedItems.sort(
//           (a, b) => (typeOrder[a.type] || 9) - (typeOrder[b.type] || 9)
//         );
//       });
//       Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
//       if (categoryModalVisible) setCategoryModalVisible(false);
//     },
//     [budget, guestCount, quantities, categoryModalVisible]
//   );


//   const handleRemoveItem = useCallback(
//     (itemToRemove) => {
//       const itemKey = `${itemToRemove.type}-${itemToRemove.id}`;
//       setFilteredData((prevSelected) => {
//         const updatedSelected = prevSelected.filter(
//           (item) => `${item.type}-${item.id}` !== itemKey
//         );
//         setQuantities((prevQtys) => {
//           const { [itemKey]: _, ...rest } = prevQtys;
//           const totalSpent = updatedSelected.reduce((sum, selItem) => {
//             const qtyKey = `${selItem.type}-${selItem.id}`;
//             const itemQty =
//               selItem.type === "restaurant" || selItem.type === "hotels"
//                 ? parseInt(guestCount, 10) || 1
//                 : parseInt(rest[qtyKey] || "1", 10);
//             const itemCostVal = selItem.type === "restaurant" ? selItem.averageCost : selItem.cost;
//             return sum + itemCostVal * itemQty;
//           }, 0);
//           setRemainingBudget(parseFloat(budget) - totalSpent);
//           return rest;
//         });
//         return updatedSelected;
//       });
//       Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
//     },
//     [budget, guestCount]
//   );




//   const fetchAllBlockedDays = async () => {
//     try {
//       const response = await api.fetchAllBlockedDays();
//       const blocked = response.data.reduce((acc, date) => {
//         acc[date] = { disabled: true, disableTouchEvent: true, marked: true, dotColor: COLORS.error };
//         return acc;
//       }, {});
//       setBlockedDays(blocked);
//     } catch (error) {
//       console.error("Ошибка загрузки заблокированных дат:", error);
//       alert("Не удалось загрузить заблокированные даты.");
//     }
//   };
  
//   useEffect(() => {
//     if (token && user?.id) {
//       fetchAllBlockedDays();
//     }
//   }, [token, user?.id]);



//   const calculateTotalCost = useMemo(() => {
//     return filteredData.reduce((sum, item) => {
//       const quantity = parseInt(quantities[`${item.type}-${item.id}`] || "1");
//       const cost = item.type === "restaurant" ? item.averageCost : item.cost;
//       const effectiveQuantity =
//         item.type === "restaurant" || item.type === "hotels"
//           ? parseInt(guestCount, 10) || 1
//           : quantity;
//       return sum + cost * effectiveQuantity;
//     }, 0);
//   }, [filteredData, quantities, guestCount]);



//   const handleSubmit = async () => {
//     if (!eventName.trim()) {
//       alert("Пожалуйста, укажите название мероприятия");
//       return;
//     }
//     if (!eventDate) {
//       alert("Пожалуйста, выберите дату мероприятия");
//       return;
//     }
//     if (!budget || isNaN(budget) || parseFloat(budget) <= 0) {
//       alert("Пожалуйста, укажите корректный бюджет");
//       return;
//     }
//     if (!guestCount || isNaN(guestCount) || parseInt(guestCount, 10) <= 0) {
//       alert("Пожалуйста, укажите корректное количество гостей");
//       return;
//     }
//     if (filteredData.length === 0) {
//       alert("Пожалуйста, добавьте хотя бы один элемент для мероприятия");
//       return;
//     }

//     const eventData = {
//       name: eventName,
//       date: eventDate.toISOString().split("T")[0],
//       budget: parseFloat(budget),
//       guestCount: parseInt(guestCount, 10),
//       items: filteredData.map((item) => ({
//         type: item.type,
//         id: item.id,
//         quantity:
//           item.type === "restaurant" || item.type === "hotels"
//             ? parseInt(guestCount, 10)
//             : parseInt(quantities[`${item.type}-${item.id}`] || "1"),
//       })),
//       userId: user?.id,
//     };

//     Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
//     try {
//       // Note: api.createTraditionalFamilyEvent is not defined in api.js.
//       // Assuming it exists in the backend. If not, replace with an appropriate endpoint.
//       await api.createTraditionalFamilyEvent(eventData, token);
//       alert("Мероприятие успешно создано!");
//       setEventName("");
//       setEventDate(new Date());
//       setBudget("");
//       setGuestCount("");
//       setFilteredData([]);
//       setQuantities({});
//       setRemainingBudget(0);
//       navigation.goBack();
//     } catch (error) {
//       Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
//       console.error("Ошибка при создании мероприятия:", error);
//       alert("Ошибка: " + (error.response?.data?.error || error.message));
//     }
//   };

//   const renderCategory = ({ item }) => {
//     if (item === "Добавить") {
//       return (
//         <View style={styles.categoryRow}>
//           <TouchableOpacity
//             style={styles.categoryButtonAdd}
//             onPress={() => {
//               Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
//               setAddItemModalVisible(true);
//             }}
//           >
//             <LinearGradient
//               colors={[COLORS.buttonGradientStart, COLORS.buttonGradientEnd]}
//               style={styles.categoryButtonGradient}
//             >
//               <Text style={styles.categoryPlusText}>+</Text>
//             </LinearGradient>
//           </TouchableOpacity>
//         </View>
//       );
//     }
  
//     const isDisabled = disabledCategories.includes(item);
//     const type = categoryToTypeMap[item];
//     const itemsForCategory = filteredData.filter((dataItem) => dataItem.type === type);
  
//     return (
//       <View style={styles.categoryRow}>
//         <TouchableOpacity
//           style={[
//             styles.categoryButton,
//             isDisabled && styles.categoryButtonDisabled,
//           ]}
//           onPress={() => {
//             Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
//             setSelectedCategoryItems(
//               combinedData.filter((dataItem) => dataItem.type === type)
//             );
//             setSelectedCategoryLabel(item);
//             setSelectedCategoryType(type);
//             setCategoryModalVisible(true);
//           }}
//         >
//           <LinearGradient
//             colors={
//               isDisabled
//                 ? [COLORS.textSecondary, COLORS.textSecondary]
//                 : [COLORS.buttonGradientStart, COLORS.buttonGradientEnd]
//             }
//             style={styles.categoryButtonGradient}
//           >
//             <Text
//               style={[
//                 styles.categoryButtonText,
//                 isDisabled && styles.categoryButtonTextDisabled,
//               ]}
//             >
//               {item} {itemsForCategory.length > 0 ? `(${itemsForCategory.length})` : ""}
//             </Text>
//           </LinearGradient>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={styles.removeCategoryButton}
//           onPress={() => {
//             Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
//             handleRemoveCategory(item);
//           }}
//         >
//           <Icon2
//             name={isDisabled ? "plus-circle-outline" : "minus-circle-outline"}
//             size={24}
//             color={isDisabled ? COLORS.accent : COLORS.error}
//           />
//         </TouchableOpacity>
//       </View>
//     );
//   };


//   const renderItem = ({ item }) => (
//     <SelectedItem
//       item={item}
//       quantities={quantities}
//       setQuantities={setQuantities}
//       filteredData={filteredData}
//       setFilteredData={setFilteredData}
//       budget={budget}
//       setRemainingBudget={setRemainingBudget}
//       handleRemoveItem={handleRemoveItem}
//       setDetailsModalVisible={setDetailsModalVisible}
//       setSelectedItem={setSelectedItem}
//       guestCount={guestCount}
//       setGuestCount={setGuestCount}
//     />
//   );


//   const DetailsModal = ({ visible, onClose, item }) => {
//     if (!item) return null;
  
//     const renderDetailRow = (label, value) => {
//       if (!value) return null;
//       return (
//         <View style={styles.detailRow}>
//           <Text style={styles.detailLabel}>{label}:</Text>
//           <Text style={styles.detailValue}>{value}</Text>
//         </View>
//       );
//     };
  
//     const handleOpenLink = (url) => {
//       if (url) {
//         Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//         Linking.openURL(url).catch((err) => console.error("Ошибка открытия ссылки:", err));
//       }
//     };
  
//     return (
//       <Modal
//         visible={visible}
//         transparent
//         animationType="fade"
//         onRequestClose={onClose}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.detailsModalContainer}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>
//                 {item.type === "restaurant" ? item.name :
//                  item.type === "hotels" ? item.name :
//                  item.type === "tamada" ? item.name :
//                  item.type === "program" ? item.teamName :
//                  item.type === "flowers" ? `${item.salonName} - ${item.flowerName}` :
//                  item.type === "transport" ? `${item.salonName} - ${item.carName}` :
//                  item.type === "cake" ? item.name :
//                  item.type === "alcohol" ? `${item.salonName} - ${item.alcoholName}` :
//                  item.type === "jewelry" ? `${item.storeName} - ${item.itemName}` :
//                  "Детали"}
//               </Text>
//               <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
//                 <Icon name="close" size={24} color={MODAL_COLORS.closeButtonColor} />
//               </TouchableOpacity>
//             </View>
//             <ScrollView style={styles.detailsContent}>
//               {renderDetailRow("Тип", typeToCategoryMap[item.type])}
//               {renderDetailRow("Адрес", item.address)}
//               {renderDetailRow("Телефон", item.phone)}
//               {renderDetailRow("Кухня", item.cuisine)}
//               {renderDetailRow("Вместимость", item.capacity)}
//               {renderDetailRow("Категория", item.category)}
//               {renderDetailRow("Бренд", item.brand)}
//               {renderDetailRow("Пол", item.gender)}
//               {renderDetailRow("Портфолио", item.portfolio)}
//               {renderDetailRow("Тип торта", item.cakeType)}
//               {renderDetailRow("Тип цветов", item.flowerType)}
//               {renderDetailRow("Материал", item.material)}
//               {renderDetailRow(
//                 "Стоимость",
//                 `${(item.type === "restaurant" ? item.averageCost : item.cost).toLocaleString()} ₸`
//               )}
//               {item.website && (
//                 <TouchableOpacity
//                   style={styles.websiteButton}
//                   onPress={() => handleOpenLink(item.website)}
//                 >
//                   <Text style={styles.websiteButtonText}>Открыть сайт</Text>
//                 </TouchableOpacity>
//               )}
//             </ScrollView>
//           </View>
//         </View>
//       </Modal>
//     );
//   };



//   return (
//     <ErrorBoundary>
//       <SafeAreaView style={styles.splashContainer}>
//         <ScrollView ref={scrollViewRef} contentContainerStyle={styles.scrollContent}>
//           <View style={styles.headerContainer}>
//             <TouchableOpacity
//               style={styles.backButton}
//               onPress={() => navigation.goBack()}
//             >
//               <AntDesign name="arrowleft" size={24} color={COLORS.textPrimary} />
//             </TouchableOpacity>
//             <Text style={styles.headerText}>Создать мероприятие</Text>
//           </View>
  
//           <View style={styles.inputContainer}>
//             <Text style={styles.label}>Название мероприятия</Text>
//             <TextInput
//               style={styles.input}
//               value={eventName}
//               onChangeText={setEventName}
//               placeholder="Введите название..."
//               placeholderTextColor={COLORS.textSecondary}
//             />
//           </View>
  
//           <View style={styles.inputContainer}>
//             <Text style={styles.label}>Дата мероприятия</Text>
//             <TouchableOpacity
//               style={styles.dateButton}
//               onPress={() => {
//                 Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
//                 setShowDatePicker(true);
//               }}
//             >
//               <Text style={styles.dateText}>
//                 {eventDate.toLocaleDateString("ru-RU")}
//               </Text>
//             </TouchableOpacity>
//             {showDatePicker && (
//               <Modal transparent animationType="fade">
//                 <View style={styles.modalOverlay}>
//                   <View style={styles.calendarContainer}>
//                     <Calendar
//                       current={eventDate.toISOString().split("T")[0]}
//                       onDayPress={(day) => {
//                         if (!blockedDays[day.dateString]) {
//                           setEventDate(new Date(day.dateString));
//                           setShowDatePicker(false);
//                           Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//                         } else {
//                           alert("Эта дата заблокирована.");
//                         }
//                       }}
//                       markedDates={{
//                         ...blockedDays,
//                         [eventDate.toISOString().split("T")[0]]: {
//                           selected: true,
//                           selectedColor: COLORS.primary,
//                         },
//                       }}
//                       theme={{
//                         todayTextColor: COLORS.primary,
//                         selectedDayBackgroundColor: COLORS.primary,
//                         arrowColor: COLORS.primary,
//                       }}
//                     />
//                     <TouchableOpacity
//                       style={styles.cancelButton}
//                       onPress={() => {
//                         Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//                         setShowDatePicker(false);
//                       }}
//                     >
//                       <Text style={styles.cancelButtonText}>Отмена</Text>
//                     </TouchableOpacity>
//                   </View>
//                 </View>
//               </Modal>
//             )}
//           </View>
  
//           <View style={styles.inputContainer}>
//             <Text style={styles.label}>Бюджет (₸)</Text>
//             <TextInput
//               style={styles.input}
//               value={formatBudget(budget)}
//               onChangeText={handleBudgetChange}
//               keyboardType="numeric"
//               placeholder="Введите бюджет..."
//               placeholderTextColor={COLORS.textSecondary}
//             />
//           </View>
  
//           <View style={styles.inputContainer}>
//             <Text style={styles.label}>Количество гостей</Text>
//             <TextInput
//               style={styles.input}
//               value={guestCount}
//               onChangeText={handleGuestCountChange}
//               keyboardType="numeric"
//               placeholder="Введите количество гостей..."
//               placeholderTextColor={COLORS.textSecondary}
//             />
//           </View>
  
//           <View style={styles.budgetInfo}>
//             <Text style={styles.budgetText}>
//               Общая стоимость: {calculateTotalCost.toLocaleString()} ₸
//             </Text>
//             <Text
//               style={[
//                 styles.budgetText,
//                 remainingBudget < 0 && styles.budgetTextNegative,
//               ]}
//             >
//               Остаток бюджета: {remainingBudget.toLocaleString()} ₸
//             </Text>
//           </View>
  
//           <Text style={styles.sectionTitle}>Категории</Text>
//           <FlatList
//             data={[...categories, "Добавить"]}
//             renderItem={renderCategory}
//             keyExtractor={(item) => item}
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             contentContainerStyle={styles.categoryList}
//           />
  
//           <Text style={styles.sectionTitle}>Выбранные элементы</Text>
//           {loading || isLoading ? (
//             <ActivityIndicator size="large" color={COLORS.primary} />
//           ) : filteredData.length === 0 ? (
//             <Text style={styles.emptyText}>Добавьте элементы для мероприятия</Text>
//           ) : (
//             <FlatList
//               data={filteredData}
//               renderItem={renderItem}
//               keyExtractor={(item) => `${item.type}-${item.id}`}
//               contentContainerStyle={styles.itemList}
//             />
//           )}
  
//           <TouchableOpacity
//             style={styles.submitButton}
//             onPress={() => {
//               Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
//               handleSubmit();
//             }}
//           >
//             <LinearGradient
//               colors={[COLORS.buttonGradientStart, COLORS.buttonGradientEnd]}
//               style={styles.submitButtonGradient}
//             >
//               <Text style={styles.submitButtonText}>Создать мероприятие</Text>
//             </LinearGradient>
//           </TouchableOpacity>
//         </ScrollView>
  
//         <AddItemModal
//             visible={addItemModalVisible}
//             onClose={() => setAddItemModalVisible(false)}
//             filteredItems={combinedData}
//             filteredData={filteredData}
//             handleAddItem={handleAddItem}
//             setDetailsModalVisible={setDetailsModalVisible}
//             setSelectedItem={setSelectedItem}
//             quantities={quantities}
//             updateCategories={updateCategories}
//           />
//           <CategoryItemsModal
//             visible={categoryModalVisible}
//             onClose={() => setCategoryModalVisible(false)}
//             categoryItems={selectedCategoryItems}
//             categoryLabel={selectedCategoryLabel}
//             categoryType={selectedCategoryType}
//             filteredData={filteredData}
//             handleAddItem={handleAddItem}
//             handleRemoveItem={handleRemoveItem}
//             setDetailsModalVisible={setDetailsModalVisible}
//             setSelectedItem={setSelectedItem}
//             quantities={quantities}
//             setQuantities={setQuantities}
//             budget={budget}
//             setFilteredData={setFilteredData}
//             setRemainingBudget={setRemainingBudget}
//             updateCategories={updateCategories}
//             guestCount={guestCount}
//             setGuestCount={setGuestCount}
//           />
//           <DetailsModal
//             visible={detailsModalVisible}
//             onClose={() => setDetailsModalVisible(false)}
//             item={selectedItem}
//           />
//       </SafeAreaView>
//     </ErrorBoundary>
//   );
//   };


//   const styles = StyleSheet.create({
//     splashContainer: {
//       flex: 1,
//       backgroundColor: COLORS.background,
//     },
//     scrollContent: {
//       padding: 20,
//       paddingBottom: 100,
//     },
//     headerContainer: {
//       flexDirection: "row",
//       alignItems: "center",
//       marginBottom: 20,
//     },
//     backButton: {
//       padding: 10,
//     },
//     headerText: {
//       fontSize: 24,
//       fontWeight: "bold",
//       color: COLORS.textPrimary,
//       flex: 1,
//       textAlign: "center",
//     },
//     inputContainer: {
//       marginBottom: 20,
//     },
//     label: {
//       fontSize: 16,
//       fontWeight: "600",
//       color: COLORS.textPrimary,
//       marginBottom: 8,
//     },
//     input: {
//       backgroundColor: COLORS.card,
//       borderRadius: 10,
//       padding: 12,
//       fontSize: 16,
//       color: COLORS.textPrimary,
//       borderWidth: 1,
//       borderColor: COLORS.textSecondary,
//     },
//     dateButton: {
//       backgroundColor: COLORS.card,
//       borderRadius: 10,
//       padding: 12,
//       alignItems: "center",
//     },
//     dateText: {
//       fontSize: 16,
//       color: COLORS.textPrimary,
//     },
//     budgetInfo: {
//       flexDirection: "row",
//       justifyContent: "space-between",
//       marginBottom: 20,
//     },
//     budgetText: {
//       fontSize: 16,
//       color: COLORS.textPrimary,
//       fontWeight: "500",
//     },
//     budgetTextNegative: {
//       color: COLORS.error,
//     },
//     sectionTitle: {
//       fontSize: 18,
//       fontWeight: "bold",
//       color: COLORS.textPrimary,
//       marginBottom: 10,
//     },
//     categoryList: {
//       paddingVertical: 10,
//     },
//     categoryRow: {
//       flexDirection: "row",
//       alignItems: "center",
//       marginRight: 10,
//     },
//     categoryButton: {
//       borderRadius: 20,
//       overflow: "hidden",
//     },
//     categoryButtonDisabled: {
//       opacity: 0.5,
//     },
//     categoryButtonGradient: {
//       paddingVertical: 10,
//       paddingHorizontal: 20,
//     },
//     categoryButtonText: {
//       fontSize: 16,
//       color: COLORS.white,
//       fontWeight: "500",
//     },
//     categoryButtonTextDisabled: {
//       color: COLORS.textSecondary,
//     },
//     categoryButtonAdd: {
//       borderRadius: 20,
//       width: 40,
//       height: 40,
//       justifyContent: "center",
//       alignItems: "center",
//       overflow: "hidden",
//     },
//     categoryPlusText: {
//       fontSize: 24,
//       color: COLORS.white,
//       fontWeight: "bold",
//     },
//     removeCategoryButton: {
//       marginLeft: 10,
//     },
//     itemList: {
//       paddingBottom: 20,
//     },
//     emptyText: {
//       fontSize: 16,
//       color: COLORS.textSecondary,
//       textAlign: "center",
//       marginVertical: 20,
//     },
//     submitButton: {
//       marginTop: 20,
//       borderRadius: 10,
//       overflow: "hidden",
//     },
//     submitButtonGradient: {
//       paddingVertical: 15,
//       alignItems: "center",
//     },
//     submitButtonText: {
//       fontSize: 18,
//       color: COLORS.white,
//       fontWeight: "bold",
//     },
//     modalOverlay: {
//       flex: 1,
//       backgroundColor: MODAL_COLORS.overlayBackground,
//       justifyContent: "flex-end",
//     },
//     addModalContainer: {
//       backgroundColor: MODAL_COLORS.cardBackground,
//       borderTopLeftRadius: 20,
//       borderTopRightRadius: 20,
//       padding: 20,
//       maxHeight: SCREEN_HEIGHT * 0.9,
//     },
//     modalHeader: {
//       flexDirection: "row",
//       justifyContent: "space-between",
//       alignItems: "center",
//       marginBottom: 20,
//     },
//     modalTitle: {
//       fontSize: 20,
//       fontWeight: "bold",
//       color: MODAL_COLORS.textPrimary,
//     },
//     modalCloseButton: {
//       padding: 10,
//     },
//     addModalSearchContainer: {
//       flexDirection: "row",
//       alignItems: "center",
//       backgroundColor: MODAL_COLORS.inputBackground,
//       borderRadius: 10,
//       paddingHorizontal: 10,
//       marginBottom: 20,
//       borderWidth: 1,
//       borderColor: MODAL_COLORS.inputBorder,
//     },
//     addModalSearchIcon: {
//       marginRight: 10,
//     },
//     addModalSearchInput: {
//       flex: 1,
//       fontSize: 16,
//       color: MODAL_COLORS.textPrimary,
//       paddingVertical: 10,
//     },
//     addModalClearIcon: {
//       padding: 5,
//     },
//     addModalFilterScroll: {
//       maxHeight: 150,
//       marginBottom: 20,
//     },
//     addModalFilterLabel: {
//       fontSize: 16,
//       fontWeight: "600",
//       color: MODAL_COLORS.textPrimary,
//       marginBottom: 10,
//     },
//     filterButtonBase: {
//       paddingVertical: 8,
//       paddingHorizontal: 15,
//       borderRadius: 20,
//       marginRight: 10,
//       marginBottom: 10,
//     },
//     addModalTypeButton: {
//       backgroundColor: MODAL_COLORS.inactiveFilter,
//     },
//     addModalTypeButtonActive: {
//       backgroundColor: MODAL_COLORS.activeFilter,
//     },
//     addModalTypeButtonText: {
//       color: MODAL_COLORS.inactiveFilterText,
//     },
//     addModalTypeButtonTextActive: {
//       color: MODAL_COLORS.activeFilterText,
//     },
//     addModalDistrictButton: {
//       backgroundColor: MODAL_COLORS.inactiveFilter,
//     },
//     addModalDistrictButtonActive: {
//       backgroundColor: MODAL_COLORS.activeFilter,
//     },
//     addModalDistrictButtonText: {
//       color: MODAL_COLORS.inactiveFilterText,
//     },
//     addModalDistrictButtonTextActive: {
//       color: MODAL_COLORS.activeFilterText,
//     },
//     addModalPriceButton: {
//       backgroundColor: MODAL_COLORS.inactiveFilter,
//     },
//     addModalPriceButtonActive: {
//       backgroundColor: MODAL_COLORS.activeFilter,
//     },
//     addModalPriceButtonText: {
//       color: MODAL_COLORS.inactiveFilterText,
//     },
//     addModalPriceButtonTextActive: {
//       color: MODAL_COLORS.activeFilterText,
//     },
//     filterButtonTextBase: {
//       fontSize: 14,
//       fontWeight: "500",
//     },
//     addModalItemList: {
//       paddingBottom: 20,
//     },
//     addModalScrollView: {
//       maxHeight: SCREEN_HEIGHT * 0.5,
//     },
//     addModalItemCard: {
//       flexDirection: "row",
//       backgroundColor: COLORS.card,
//       borderRadius: 10,
//       marginBottom: 10,
//       padding: 10,
//       alignItems: "center",
//       shadowColor: COLORS.shadow,
//       shadowOffset: { width: 0, height: 2 },
//       shadowOpacity: 0.1,
//       shadowRadius: 4,
//       elevation: 2,
//     },
//     addModalItemContent: {
//       flex: 1,
//       flexDirection: "row",
//       alignItems: "center",
//     },
//     addModalItemText: {
//       fontSize: 16,
//       color: MODAL_COLORS.textPrimary,
//       flex: 1,
//     },
//     addModalItemCount: {
//       fontSize: 14,
//       color: MODAL_COLORS.textSecondary,
//       marginLeft: 10,
//     },
//     addModalEmptyText: {
//       fontSize: 16,
//       color: MODAL_COLORS.textSecondary,
//       textAlign: "center",
//       marginVertical: 20,
//     },
//     detailsIconButton: {
//       padding: 5,
//     },
//     card: {
//       backgroundColor: COLORS.card,
//       borderRadius: 10,
//       padding: 15,
//       marginBottom: 10,
//       shadowColor: COLORS.shadow,
//       shadowOffset: { width: 0, height: 2 },
//       shadowOpacity: 0.1,
//       shadowRadius: 4,
//       elevation: 2,
//     },
//     header: {
//       flexDirection: "row",
//       justifyContent: "space-between",
//       alignItems: "center",
//       marginBottom: 10,
//     },
//     titleText: {
//       fontSize: 16,
//       fontWeight: "600",
//       color: MODAL_COLORS.textPrimary,
//       flex: 1,
//     },
//     actions: {
//       flexDirection: "row",
//     },
//     actionButton: {
//       padding: 5,
//       marginLeft: 10,
//     },
//     controlRow: {
//       flexDirection: "row",
//       alignItems: "center",
//       justifyContent: "space-between",
//     },
//     quantityContainer: {
//       flexDirection: "row",
//       alignItems: "center",
//     },
//     quantityButton: {
//       padding: 5,
//     },
//     totalCost: {
//       fontSize: 16,
//       fontWeight: "500",
//       color: MODAL_COLORS.textPrimary,
//     },
//     selectedItemContainer: {
//       marginBottom: 20,
//     },
//     categoryHeader: {
//       fontSize: 16,
//       fontWeight: "600",
//       color: MODAL_COLORS.textPrimary,
//       marginBottom: 10,
//     },
//     calendarContainer: {
//       backgroundColor: COLORS.card,
//       borderRadius: 10,
//       padding: 20,
//       margin: 20,
//     },
//     cancelButton: {
//       marginTop: 10,
//       padding: 10,
//       alignItems: "center",
//     },
//     cancelButtonText: {
//       fontSize: 16,
//       color: COLORS.primary,
//       fontWeight: "600",
//     },
//     detailsModalContainer: {
//       backgroundColor: MODAL_COLORS.cardBackground,
//       borderRadius: 20,
//       padding: 20,
//       margin: 20,
//       maxHeight: SCREEN_HEIGHT * 0.8,
//     },
//     detailsContent: {
//       paddingBottom: 20,
//     },
//     detailRow: {
//       flexDirection: "row",
//       marginBottom: 10,
//     },
//     detailLabel: {
//       fontSize: 16,
//       fontWeight: "600",
//       color: MODAL_COLORS.textPrimary,
//       width: 120,
//     },
//     detailValue: {
//       fontSize: 16,
//       color: MODAL_COLORS.textPrimary,
//       flex: 1,
//     },
//     websiteButton: {
//       marginTop: 10,
//       backgroundColor: COLORS.primary,
//       borderRadius: 10,
//       padding: 10,
//       alignItems: "center",
//     },
//     websiteButtonText: {
//       fontSize: 16,
//       color: COLORS.white,
//       fontWeight: "600",
//     },
//     errorContainer: {
//       flex: 1,
//       justifyContent: "center",
//       alignItems: "center",
//       backgroundColor: COLORS.background,
//       padding: 20,
//     },
//     errorText: {
//       fontSize: 18,
//       color: COLORS.error,
//       textAlign: "center",
//     },
//   });
  
//   export default CreateTraditionalFamilyEventScreen;




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
  ScrollView,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useDispatch, useSelector } from "react-redux";
import api from "../api/api";
import * as Animatable from "react-native-animatable";
import { Calendar } from "react-native-calendars";
import Icon from "react-native-vector-icons/MaterialIcons";
import Icon2 from "react-native-vector-icons/MaterialCommunityIcons";
import * as Haptics from "expo-haptics";
import * as Linking from "expo-linking";

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
  placeholder: "rgba(255, 255, 255, 0.7)",
};

const MODAL_COLORS = {
  background: "#EDE7D9",
  cardBackground: "#FDFBF5",
  primaryActionStart: COLORS.buttonGradientStart,
  primaryActionEnd: COLORS.buttonGradientEnd,
  textPrimary: "#5A4032",
  textSecondary: "#718096",
  inputBackground: "#FBF9F7",
  inputBorder: "#B0A092",
  activeFilter: COLORS.buttonGradientEnd,
  activeFilterText: COLORS.white,
  inactiveFilter: "#EFEBE4",
  inactiveFilterText: "#5A4032",
  separator: "#DCCFC0",
  shadow: "rgba(0, 0, 0, 0.15)",
  icon: "#5A4032",
  closeButtonColor: "#5A4032",
  overlayBackground: "rgba(45, 55, 72, 0.65)",
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
  "event-category": 13,
};

const typesMapping = [
  { key: "restaurants", costField: "averageCost", type: "restaurant", label: "Ресторан" },
  { key: "hotels", costField: "cost", type: "hotels", label: "Гостиницы" },
  { key: "tamada", costField: "cost", type: "tamada", label: "Ведущие" },
  { key: "programs", costField: "cost", type: "program", label: "Шоу программы" },
  { key: "flowers", costField: "cost", type: "flowers", label: "Цветы" },
  { key: "transport", costField: "cost", type: "transport", label: "Прокат авто" },
  { key: "cakes", costField: "cost", type: "cake", label: "Торты" },
  { key: "alcohol", costField: "cost", type: "alcohol", label: "Алкоголь" },
  { key: "jewelry", costField: "cost", type: "jewelry", label: "Ювелирные изделия" },
  { key: "typographies", costField: "cost", type: "typography", label: "Типографии" },
  { key: "technical-equipment-rentals", costField: "cost", type: "technical-equipment-rental", label: "Аренда технического оснащения" },
  { key: "traditional-gifts", costField: "cost", type: "traditional-gifts", label: "Традиционные подарки" },
  { key: "event-categories", costField: "cost", type: "event-category", label: "Категории мероприятий" },
];

const categoryToTypeMap = {
  "Ресторан": "restaurant",
  "Гостиницы": "hotels",
  "Ведущие": "tamada",
  "Шоу программы": "program",
  "Цветы": "flowers",
  "Прокат авто": "transport",
  "Торты": "cake",
  "Алкоголь": "alcohol",
  "Ювелирные изделия": "jewelry",
  "Типографии": "typography",
  "Аренда технического оснащения": "technical-equipment-rental",
  "Традиционные подарки": "traditional-gifts",
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
          label:
            typesMapping.find((t) => t.type === item.type)?.label || item.type,
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
            <View>
              <View>
                <Text style={styles.addModalFilterLabel}>Тип</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {uniqueTypes.map((typeObj) => (
                    <TouchableOpacity
                      key={typeObj.type}
                      style={[
                        styles.filterButtonBase,
                        selectedTypeFilter === typeObj.type
                          ? styles.addModalTypeButtonActive
                          : styles.addModalTypeButton,
                      ]}
                      onPress={() => setSelectedTypeFilter(typeObj.type)}
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
                  ))}
                </ScrollView>
              </View>
              <View>
                <Text style={styles.addModalFilterLabel}>Район</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {districts.map((district) => (
                    <TouchableOpacity
                      key={district}
                      style={
                        selectedDistrict === district
                          ? [styles.filterButtonBase, styles.addModalDistrictButtonActive]
                          : [styles.filterButtonBase, styles.addModalDistrictButton]
                      }
                      onPress={() => setSelectedDistrict(district)}
                    >
                      <Text
                        style={
                          selectedDistrict === district
                            ? [styles.filterButtonTextBase, styles.addModalDistrictButtonTextActive]
                            : [styles.filterButtonTextBase, styles.addModalDistrictButtonText]
                        }
                      >
                        {district === "all" ? "Все" : district}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              <View>
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
                        costRange === option.value
                          ? styles.addModalPriceButtonActive
                          : styles.addModalPriceButton,
                      ]}
                      onPress={() => setCostRange(option.value)}
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

  const handleAddItem = () => {
    syncItemQuantity("1");
    if ((item.type === "restaurant" || item.type === "hotels") && setGuestCount) {
      setGuestCount(parseInt(inputGuestCount, 10) || 1);
    }
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
                  <Icon2 name="plus"  />
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
                ))}
              </View>
            )}

            {availableItemsForThisCategory.length > 0 && (
              <View>
                <Text style={styles.categoryHeader}>
                  Доступные ({availableItemsForThisCategory.length}):
                </Text>
                {availableItemsForThisCategory.map((item) => (
                  <View key={`${item.type}-${item.id}`}>
                    {renderAvailableItem({ item })}
                  </View>
                ))}
              </View>
            )}

            {selectedItemsForThisCategory.length === 0 &&
              availableItemsForThisCategory.length === 0 && (
                <Text style={styles.addModalEmptyText}>
                  Нет элементов для этой категории
                </Text>
              )}
          </ScrollView>
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
            />
          </View>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleAddCategory}
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
    "Ведущие",
    "Шоу программы",
    "Цветы",
    "Прокат авто",
    "Торты",
    "Алкоголь",
    "Ювелирные изделия",
    "Традиционные подарки",
  ];
  const selectedCategories = route?.params?.selectedCategories || defaultCategories;

  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);

  const [categories, setCategories] = useState(selectedCategories);
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
  const scrollViewRef = useRef(null);

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
    return [
      ...(data.restaurants || []).map((item) => ({ ...item, type: "restaurant" })),
      ...(data.hotels || []).map((item) => ({ ...item, type: "hotels" })),
      ...(data.tamada || []).map((item) => ({ ...item, type: "tamada" })),
      ...(data.programs || []).map((item) => ({ ...item, type: "program" })),
      ...(data.flowers || []).map((item) => ({ ...item, type: "flowers" })),
      ...(data.transport || []).map((item) => ({ ...item, type: "transport" })),
      ...(data.cakes || []).map((item) => ({ ...item, type: "cake" })),
      ...(data.alcohol || []).map((item) => ({ ...item, type: "alcohol" })),
      ...(data.jewelry || []).map((item) => ({ ...item, type: "jewelry" })),
      ...(data.typographies || []).map((item) => ({ ...item, type: "typography" })),
      ...(data["technical-equipment-rentals"] || []).map((item) => ({ ...item, type: "technical-equipment-rental" })),
      ...(data["traditional-gifts"] || []).map((item) => ({ ...item, type: "traditional-gifts" })),
      ...(data["event-categories"] || []).map((item) => ({ ...item, type: "event-category" })),
    ].sort((a, b) => (typeOrder[a.type] || 13) - (typeOrder[b.type] || 13));
  }, [data]);

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
                dataItem.type === "restaurant" || dataItem.type === "hotels"
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
                  item.type === "restaurant" || item.type === "hotels"
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
                  selectedItem.type === "restaurant" || selectedItem.type === "hotels"
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
                  dataItem.type === "restaurant" || dataItem.type === "hotels"
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
                dataItem.type === "restaurant" || dataItem.type === "hotels"
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
          const selectedVenue = suitableVenues[0];
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

        for (const selectedItem of suitableItems) {
          const itemCost = parseFloat(selectedItem[costField]);
          if (itemCost <= remaining) {
            newSelectedItems.push({ ...selectedItem, type, totalCost: itemCost });
            newQuantities[`${type}-${selectedItem.id}`] = "1";
            remaining -= itemCost;
          } else {
            break;
          }
        }

        if (suitableItems.length === 0) {
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

      for (const item of filteredData) {
        const serviceType = item.type.charAt(0).toUpperCase() + item.type.slice(1);
        const quantity =
          item.type === "restaurant" || item.type === "hotels"
            ? parseInt(guestCount, 10)
            : parseInt(quantities[`${item.type}-${item.id}`] || "1");
        await api.addServiceToCategory(
          categoryId,
          { serviceId: item.id, serviceType, quantity },
          token
        );
      }

      alert("Мероприятие успешно создано!");
      setEventName("");
      setEventDate(new Date());
      setBudget("");
      setGuestCount("");
      setFilteredData([]);
      setQuantities({});
      setRemainingBudget(0);
      navigation.goBack();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Ошибка при создании мероприятия:", error);
      alert("Ошибка: " + (error.response?.data?.error || error.message));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const renderCategory = ({ item }) => {
    if (item === "Добавить") {
      return (
        <View style={styles.categoryRow}>
          <TouchableOpacity
            style={styles.categoryButtonAdd}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setAddCategoryModalVisible(true);
            }}
          >
            <LinearGradient
              colors={[COLORS.buttonGradientStart, COLORS.buttonGradientEnd]}
              style={styles.categoryButtonGradient}
            >
              <Text style={styles.categoryPlusText}>+</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      );
    }

    const isDisabled = disabledCategories.includes(item);
    const type = categoryToTypeMap[item];
    const itemsForCategory = filteredData.filter((dataItem) => dataItem.type === type);

    return (
      <View style={styles.categoryRow}>
        <TouchableOpacity
          style={[
            styles.categoryButton,
            isDisabled && styles.categoryButtonDisabled,
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setSelectedCategoryItems(
              combinedData.filter((dataItem) => dataItem.type === type)
            );
            setSelectedCategoryLabel(item);
            setSelectedCategoryType(type);
            setCategoryModalVisible(true);
          }}
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
        >
          <Icon2
            name={isDisabled ? "plus-circle-outline" : "minus-circle-outline"}
            size={24}
            color={isDisabled ? COLORS.accent : COLORS.error}
          />
        </TouchableOpacity>
      </View>
    );
  };

  const renderItem = ({ item }) => (
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
                 item.type === "hotels" ? item.name :
                 item.type === "tamada" ? item.name :
                 item.type === "program" ? item.teamName :
                 item.type === "flowers" ? `${item.salonName} - ${item.flowerName}` :
                 item.type === "transport" ? `${item.salonName} - ${item.carName}` :
                 item.type === "cake" ? item.name :
                 item.type === "alcohol" ? `${item.salonName} - ${item.alcoholName}` :
                 item.type === "jewelry" ? `${item.storeName} - ${item.itemName}` :
                 item.type === "traditional-gifts" ? `${item.salonName} - ${item.itemName}` :
                 "Детали"}
              </Text>
              <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
                <Icon name="close" size={24} color={MODAL_COLORS.closeButtonColor} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.detailsContent}>
              {renderDetailRow("Тип", typeToCategoryMap[item.type])}
              {renderDetailRow("Адрес", item.address)}
              {renderDetailRow("Телефон", item.phone)}
              {renderDetailRow("Кухня", item.cuisine)}
              {renderDetailRow("Вместимость", item.capacity)}
              {renderDetailRow("Категория", item.category)}
              {renderDetailRow("Бренд", item.brand)}
              {renderDetailRow("Пол", item.gender)}
              {renderDetailRow("Портфолио", item.portfolio)}
              {renderDetailRow("Тип торта", item.cakeType)}
              {renderDetailRow("Тип цветов", item.flowerType)}
              {renderDetailRow("Материал", item.material)}
              {renderDetailRow("Район", item.district)}
              {renderDetailRow(
                "Стоимость",
                `${(item.type === "restaurant" ? item.averageCost : item.cost).toLocaleString()} ₸`
              )}
              {item.website && (
                <TouchableOpacity
                  style={styles.websiteButton}
                  onPress={() => handleOpenLink(item.website)}
                >
                  <Text style={styles.websiteButtonText}>Открыть сайт</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.splashContainer}>
        <ScrollView ref={scrollViewRef} contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <AntDesign name="arrowleft" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerText}>Создать мероприятие</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Название мероприятия</Text>
            <TextInput
              style={styles.input}
              value={eventName}
              onChangeText={setEventName}
              placeholder="Введите название..."
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Дата мероприятия</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setShowDatePicker(true);
              }}



          {showDatePicker && (
            <Modal
              visible={showDatePicker}
              transparent
              animationType="slide"
              onRequestClose={() => setShowDatePicker(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.calendarModalContainer}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Выберите дату</Text>
                    <TouchableOpacity
                      style={styles.modalCloseButton}
                      onPress={() => setShowDatePicker(false)}
                    >
                      <Icon
                        name="close"
                        size={24}
                        color={MODAL_COLORS.closeButtonColor}
                      />
                    </TouchableOpacity>
                  </View>
                  <Calendar
                    onDayPress={(day) => {
                      const selectedDate = new Date(day.dateString);
                      if (!blockedDays[day.dateString]) {
                        setEventDate(selectedDate);
                        setShowDatePicker(false);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      } else {
                        alert("Эта дата заблокирована.");
                      }
                    }}
                    markedDates={{
                      ...blockedDays,
                      [eventDate.toISOString().split("T")[0]]: {
                        selected: true,
                        selectedColor: COLORS.primary,
                      },
                    }}
                    minDate={new Date()}
                    theme={{
                      selectedDayBackgroundColor: COLORS.primary,
                      todayTextColor: COLORS.accent,
                      arrowColor: COLORS.textPrimary,
                      monthTextColor: COLORS.textPrimary,
                      textDayFontWeight: "400",
                      textMonthFontWeight: "600",
                      textDayHeaderFontWeight: "500",
                    }}
                  />
                </View>
              </View>
            </Modal>
          )}
<SafeAreaView>
<View>

           <View style={styles.inputContainer} >
           
            <Text style={styles.label}>Бюджет (₸)</Text>
            <TextInput
              style={styles.input}
              value={formatBudget(budget)}
              onChangeText={handleBudgetChange}
              keyboardType="numeric"
              placeholder="Введите бюджет..."
              placeholderTextColor={COLORS.textSecondary}
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
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>

          <View style={styles.categoriesContainer}>
            <Text style={styles.sectionTitle}>Категории</Text>
            <FlatList
              data={[...categories, "Добавить"]}
              renderItem={renderCategory}
              keyExtractor={(item) => item}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesList}
            />
          </View>

          <View style={styles.itemsContainer}>
            <Text style={styles.sectionTitle}>
              Выбранные элементы ({filteredData.length})
            </Text>
            {isLoading ? (
              <ActivityIndicator size="large" color={COLORS.primary} />
            ) : filteredData.length === 0 ? (
              <Text style={styles.emptyText}>
                Добавьте элементы, чтобы начать планирование
              </Text>
            ) : (
              <FlatList
                data={filteredData}
                renderItem={renderItem}
                keyExtractor={(item) => `${item.type}-${item.id}`}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.itemsList}
              />
            )}
          </View>

          <View style={styles.summaryContainer}>
            <Text style={styles.summaryText}>
              Итого: {calculateTotalCost.toLocaleString()} ₸
            </Text>
            <Text
              style={[
                styles.summaryText,
                remainingBudget < 0 && styles.summaryTextError,
              ]}
            >
              Остаток: {remainingBudget.toLocaleString()} ₸
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
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
        </ScrollView>

        <TouchableOpacity
          style={styles.addItemButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setAddItemModalVisible(true);
          }}
        >
          <LinearGradient
            colors={[COLORS.buttonGradientStart, COLORS.buttonGradientEnd]}
            style={styles.addItemButtonGradient}
          >
            <Icon name="add" size={24} color={COLORS.white} />
          </LinearGradient>
        </TouchableOpacity>

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

        <AddCategoryModal
          visible={addCategoryModalVisible}
          onClose={() => setAddCategoryModalVisible(false)}
          onAddCategory={handleAddCategory}
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
  splashContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    padding: 10,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginLeft: 10,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: MODAL_COLORS.inputBackground,
    borderWidth: 1,
    borderColor: MODAL_COLORS.inputBorder,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  dateButton: {
    backgroundColor: MODAL_COLORS.inputBackground,
    borderWidth: 1,
    borderColor: MODAL_COLORS.inputBorder,
    borderRadius: 10,
    padding: 12,
    justifyContent: "center",
  },
  dateText: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  categoriesList: {
    paddingVertical: 5,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  categoryButton: {
    borderRadius: 20,
    overflow: "hidden",
  },
  categoryButtonDisabled: {
    opacity: 0.6,
  },
  categoryButtonGradient: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.white,
  },
  categoryButtonTextDisabled: {
    color: COLORS.white,
    opacity: 0.8,
  },
  categoryButtonAdd: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  categoryPlusText: {
    fontSize: 24,
    fontWeight: "600",
    color: COLORS.white,
  },
  removeCategoryButton: {
    marginLeft: 8,
  },
  itemsContainer: {
    marginBottom: 20,
  },
  itemsList: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: 10,
  },
  actions: {
    flexDirection: "row",
  },
  actionButton: {
    padding: 8,
  },
  controlRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    justifyContent: "space-between",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    padding: 8,
    backgroundColor: MODAL_COLORS.inputBackground,
    borderWidth: 1,
    borderColor: MODAL_COLORS.inputBorder,
    borderRadius: 8,
  },
  totalCost: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  summaryText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  summaryTextError: {
    color: COLORS.error,
  },
  submitButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 20,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonGradient: {
    paddingVertical: 15,
    alignItems: "center",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.white,
  },
  addItemButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  addItemButtonGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: MODAL_COLORS.overlayBackground,
    justifyContent: "flex-end",
  },
  addModalContainer: {
    backgroundColor: MODAL_COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: SCREEN_HEIGHT * 0.9,
  },
  calendarModalContainer: {
    backgroundColor: MODAL_COLORS.background,
    borderRadius: 20,
    padding: 20,
    margin: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: MODAL_COLORS.textPrimary,
  },
  modalCloseButton: {
    padding: 10,
  },
  addModalSearchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MODAL_COLORS.inputBackground,
    borderWidth: 1,
    borderColor: MODAL_COLORS.inputBorder,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
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
    padding: 5,
  },
  addModalFilterScroll: {
    maxHeight: 150,
    marginBottom: 15,
  },
  addModalFilterLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: MODAL_COLORS.textPrimary,
    marginBottom: 10,
    marginTop: 10,
  },
  filterButtonBase: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: MODAL_COLORS.inputBorder,
  },
  addModalTypeButton: {
    backgroundColor: MODAL_COLORS.inactiveFilter,
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
  filterButtonTextBase: {
    fontSize: 14,
    fontWeight: "600",
  },
  addModalItemList: {
    paddingBottom: 20,
  },
  addModalItemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MODAL_COLORS.cardBackground,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: MODAL_COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  addModalItemContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
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
  addModalEmptyText: {
    fontSize: 16,
    color: MODAL_COLORS.textSecondary,
    textAlign: "center",
    marginTop: 20,
  },
  addModalScrollView: {
    maxHeight: SCREEN_HEIGHT * 0.5,
  },
  detailsModalContainer: {
    backgroundColor: MODAL_COLORS.background,
    borderRadius: 20,
    padding: 20,
    margin: 20,
    maxHeight: SCREEN_HEIGHT * 0.8,
  },
  detailsContent: {
    paddingBottom: 20,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: MODAL_COLORS.textPrimary,
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    color: MODAL_COLORS.textPrimary,
    flex: 2,
    textAlign: "right",
  },
  websiteButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    marginTop: 10,
  },
  websiteButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.white,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: COLORS.error,
    textAlign: "center",
  },
  selectedItemContainer: {
    marginBottom: 20,
  },
  categoryHeader: {
    fontSize: 16,
    fontWeight: "600",
    color: MODAL_COLORS.textPrimary,
    marginBottom: 10,
  },
});

export default CreateTraditionalFamilyEventScreen;