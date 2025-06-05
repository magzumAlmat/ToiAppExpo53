// import React, {
//   useState,
//   useRef,
//   useEffect,
//   useCallback,
//   useMemo,
// } from "react";

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
// // import Icon from "react-native-vector-icons/MaterialIcons";
// import AntDesign from "@expo/vector-icons/AntDesign";
// import { useDispatch, useSelector } from "react-redux";
// import api from "../api/api";
// import * as Animatable from "react-native-animatable";
// import { Calendar } from "react-native-calendars";
// import Icon from "react-native-vector-icons/MaterialIcons";
// import Icon2 from "react-native-vector-icons/MaterialCommunityIcons";
// import * as Haptics from "expo-haptics";
// import * as Linking from 'expo-linking';
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
// };

// const typeOrder = {
//   restaurant: 1,
//   clothing: 2,
//   tamada: 3,
//   program: 4,
//   traditionalGift: 5,
//   flowers: 6,
//   transport: 7,
//   cake: 8,
//   alcohol: 9,
//   goods: 10,
//   jewelry: 11,
// };

// const typesMapping = [
//   { key: "clothing", costField: "cost", type: "clothing", label: "Одежда" },
//   { key: "tamada", costField: "cost", type: "tamada", label: "Тамада" },
//   { key: "programs", costField: "cost", type: "program", label: "Программа" },
//   {
//     key: "traditionalGifts",
//     costField: "cost",
//     type: "traditionalGift",
//     label: "Традиционные подарки",
//   },
//   { key: "flowers", costField: "cost", type: "flowers", label: "Цветы" },
//   { key: "cakes", costField: "cost", type: "cake", label: "Торты" },
//   { key: "alcohol", costField: "cost", type: "alcohol", label: "Алкоголь" },
//   {
//     key: "transport",
//     costField: "cost",
//     type: "transport",
//     label: "Транспорт",
//   },
//   {
//     key: "restaurants",
//     costField: "averageCost",
//     type: "restaurant",
//     label: "Ресторан",
//   },
//   {
//     key: "jewelry",
//     costField: "cost",
//     type: "jewelry",
//     label: "Ювелирные изделия",
//   },
// ];

// const categoryToTypeMap = {
//   Ведущий: "tamada",
//   Ресторан: "restaurant",
//   Алкоголь: "alcohol",
//   "Шоу программа": "program",
//   "Ювелирные изделия": "jewelry",
//   "Традиционные подарки": "traditionalGift",
//   "Свадебный салон": "clothing",
//   "Прокат авто": "transport",
//   Торты: "cake",
//   Цветы: "flowers",
//   // 'Фото видео съемка':''
//   // 'Оформление'
//   // 'Продукты'
//   // 'Прочее'
// };

// const typeToCategoryMap = Object.fromEntries(
//   Object.entries(categoryToTypeMap).map(([category, type]) => [type, category])
// );

// // Модальное окно для добавления элементов
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
//         .sort((a, b) => (typeOrder[a.type] || 11) - (typeOrder[b.type] || 11)),
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
//       (a, b) => (typeOrder[a.type] || 11) - (typeOrder[b.type] || 11)
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
//       const count = filteredData.filter(
//         (selectedItem) =>
//           `${selectedItem.type}-${selectedItem.id}` ===
//           `${item.type}-${item.id}`
//       ).length;
//       if (item.type === "goods" && item.category === "Прочее") return null;
//       const cost = item.type === "restaurant" ? item.averageCost : item.cost;
//       let title;
//       switch (item.type) {
//         case "restaurant":
//           title = `Ресторан: ${item.name} (${cost} ₸)`;
//           break;
//         case "clothing":
//           title = `Одежда: ${item.storeName} - ${item.itemName} (${cost} ₸)`;
//           break;
//         case "flowers":
//           title = `Цветы: ${item.salonName} - ${item.flowerName} (${cost} ₸)`;
//           break;
//         case "cake":
//           title = `Торты: ${item.name} (${cost} ₸)`;
//           break;
//         case "alcohol":
//           title = `Алкоголь: ${item.salonName} - ${item.alcoholName} (${cost} ₸)`;
//           break;
//         case "program":
//           title = `Программа: ${item.teamName} (${cost} ₸)`;
//           break;
//         case "tamada":
//           title = `Тамада: ${item.name} (${cost} ₸)`;
//           break;
//         case "traditionalGift":
//           title = `Традиц. подарки: ${item.salonName} - ${item.itemName} (${cost} ₸)`;
//           break;
//         case "transport":
//           title = `Транспорт: ${item.salonName} - ${item.carName} (${cost} ₸)`;
//           break;
//         case "goods":
//           title = `Товар: ${item.item_name} (${cost} ₸)`;
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
//             style={[styles.modalButton2, styles.confirmButton]}
//             onPress={() => {
//               setSelectedItem(item);
//               setDetailsModalVisible(true);
//               onClose();
//             }}
//           >
//             {/* <Text style={styles.addModalDetailsButtonText}>Подробнее</Text> */}
//             <Icon
//               name="search"
//               size={15}
//               color={COLORS.white}
//               style={styles.buttonIcon}
//             />
//           </TouchableOpacity>

//           {/* <TouchableOpacity
//                             style={[styles.modalButton2, styles.confirmButton]}
//                             onPress={()=>handleDetailsPress()}
//                           >
//                             <Icon
//                               name="search"
//                               size={20}
//                               color={COLORS.white}
//                               style={styles.buttonIcon}
//                             />
//                             <Text></Text>
//                             <Text style={styles.modalButtonText}>Подробнее</Text>
//                           </TouchableOpacity> */}
//         </View>
//       );
//     },
//     [
//       filteredData,
//       handleAddItem,
//       setDetailsModalVisible,
//       setSelectedItem,
//       onClose,
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
//           <View style={styles.addModalHeader}>
//             <Text style={styles.addModalTitle}>Добавить элемент</Text>
//             <TouchableOpacity
//               style={styles.addModalCloseIcon}
//               onPress={closeModal}
//             >
//               <Icon name="close" size={24} color={COLORS.textSecondary} />
//             </TouchableOpacity>
//           </View>

//           <View style={styles.addModalSearchContainer}>
//             <Icon
//               name="search"
//               size={20}
//               color={COLORS.textSecondary}
//               style={styles.addModalSearchIcon}
//             />
//             <TextInput
//               style={styles.addModalSearchInput}
//               placeholder="Поиск по названию..."
//               value={searchQuery}
//               onChangeText={setSearchQuery}
//             />
//             {searchQuery.length > 0 && (
//               <TouchableOpacity
//                 style={styles.addModalClearIcon}
//                 onPress={() => setSearchQuery("")}
//               >
//                 <Icon name="clear" size={20} color={COLORS.textSecondary} />
//               </TouchableOpacity>
//             )}
//           </View>

//           <ScrollView
//             style={styles.addModalFilterScroll}
//             showsVerticalScrollIndicator={false}
//           >
//             <View style={styles.addModalFilterContainer}>
//               <View style={styles.addModalTypeFilterContainer}>
//                 <Text style={styles.addModalFilterLabel}>Тип</Text>
//                 <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//                   {uniqueTypes.map((typeObj) => (
//                     <TouchableOpacity
//                       key={typeObj.type}
//                       style={[
//                         styles.addModalTypeButton,
//                         selectedTypeFilter === typeObj.type &&
//                           styles.addModalTypeButtonActive,
//                       ]}
//                       onPress={() => setSelectedTypeFilter(typeObj.type)}
//                     >
//                       <Text
//                         style={[
//                           styles.addModalTypeButtonText,
//                           selectedTypeFilter === typeObj.type &&
//                             styles.addModalTypeButtonTextActive,
//                         ]}
//                       >
//                         {typeObj.label}
//                       </Text>
//                     </TouchableOpacity>
//                   ))}
//                 </ScrollView>
//               </View>
//               <View style={styles.addModalDistrictFilterContainer}>
//                 <Text style={styles.addModalFilterLabel}>Район</Text>
//                 <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//                   {districts.map((district) => (
//                     <TouchableOpacity
//                       key={district}
//                       style={[
//                         styles.addModalDistrictButton,
//                         selectedDistrict === district &&
//                           styles.addModalDistrictButtonActive,
//                       ]}
//                       onPress={() => setSelectedDistrict(district)}
//                     >
//                       <Text
//                         style={[
//                           styles.addModalDistrictButtonText,
//                           selectedDistrict === district &&
//                             styles.addModalDistrictButtonTextActive,
//                         ]}
//                       >
//                         {district === "all" ? "Все" : district}
//                       </Text>
//                     </TouchableOpacity>
//                   ))}
//                 </ScrollView>
//               </View>
//               <View style={styles.addModalPriceFilterContainer}>
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
//                         styles.addModalPriceButton,
//                         costRange === option.value &&
//                           styles.addModalPriceButtonActive,
//                       ]}
//                       onPress={() => setCostRange(option.value)}
//                     >
//                       <Text
//                         style={[
//                           styles.addModalPriceButtonText,
//                           costRange === option.value &&
//                             styles.addModalPriceButtonTextActive,
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

// // Компонент для отображения выбранного элемента
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
//   guestCount: initialGuestCount,
//   setGuestCount,
// }) => {
//   const itemKey = `${item.type}-${item.id}`;
//   const [inputQuantity, setInputQuantity] = useState(
//     quantities[itemKey] || "1"
//   );
//   const [inputGuestCount, setInputGuestCount] = useState(
//     initialGuestCount?.toString() || "1"
//   );
//   const isSelected = !!quantities[itemKey];

//   useEffect(() => {
//     setInputQuantity(quantities[itemKey] || "1");
//   }, [quantities[itemKey]]);

//   useEffect(() => {
//     setInputGuestCount(initialGuestCount?.toString() || "1");
//   }, [initialGuestCount]);

//   const cost = item.type === "restaurant" ? item.averageCost : item.cost;
//   const parsedGuestCount = parseInt(inputGuestCount, 10) || 1;
//   const parsedQuantity = parseInt(inputQuantity, 10) || 1;

//   const totalCost =
//     item.type === "restaurant"
//       ? cost * parsedGuestCount
//       : cost * parsedQuantity;

//   const syncQuantity = (value, guestCountValue = inputGuestCount) => {
//     let newQuantity = value === "" ? "1" : value;
//     let quantityForCalc = parseInt(newQuantity, 10) || 1;
//     let parsedGuestCount = parseInt(guestCountValue, 10) || 1;

//     if (item.type === "restaurant" && parsedGuestCount > 0) {
//       if (parsedGuestCount > item.capacity) {
//         parsedGuestCount = item.capacity;
//         guestCountValue = parsedGuestCount.toString();
//         setInputGuestCount(guestCountValue);
//         if (setGuestCount) {
//           setGuestCount(parsedGuestCount);
//         }
//         alert(
//           "Вместимость превышена",
//           `Максимальная вместимость ресторана: ${item.capacity} гостей.`
//         );
//       }
//     }

//     setInputQuantity(newQuantity);

//     setQuantities((prevQuantities) => {
//       const updatedQuantities = { ...prevQuantities, [itemKey]: newQuantity };

//       const updatedFilteredData = filteredData.map((dataItem) => {
//         if (`${dataItem.type}-${dataItem.id}` === itemKey) {
//           const itemTotalCost =
//             dataItem.type === "restaurant"
//               ? dataItem.averageCost * parsedGuestCount
//               : dataItem.cost * quantityForCalc;
//           return { ...dataItem, totalCost: itemTotalCost };
//         }
//         return dataItem;
//       });
//       setFilteredData(updatedFilteredData);

//       const totalSpent = updatedFilteredData.reduce((sum, dataItem) => {
//         const key = `${dataItem.type}-${dataItem.id}`;
//         const itemQuantity =
//           dataItem.type === "restaurant"
//             ? parseInt(guestCountValue, 10) || 1
//             : parseInt(updatedQuantities[key], 10) || 1;
//         const itemCost =
//           dataItem.type === "restaurant" ? dataItem.averageCost : dataItem.cost;
//         return sum + itemCost * itemQuantity;
//       }, 0);
//       setRemainingBudget(parseFloat(budget) - totalSpent);

//       return updatedQuantities;
//     });
//   };

//   const handleAddItem = () => {
//     syncQuantity("1");
//   };

//   const handleQuantityChange = (value) => {
//     const filteredValue = value.replace(/[^0-9]/g, "");
//     setInputQuantity(filteredValue);
//   };

//   const handleGuestCountChange = (value) => {
//     const filteredValue = value.replace(/[^0-9]/g, "");
//     setInputGuestCount(filteredValue);
//     if (setGuestCount) {
//       setGuestCount(filteredValue === "" ? 1 : parseInt(filteredValue, 10));
//     }
//   };

//   const incrementQuantity = () => {
//     const currentQuantity = parseInt(inputQuantity, 10) || 1;
//     const newQuantity = (currentQuantity + 1).toString();
//     syncQuantity(newQuantity);
//   };

//   const decrementQuantity = () => {
//     const currentQuantity = parseInt(inputQuantity, 10) || 1;
//     if (currentQuantity > 1) {
//       const newQuantity = (currentQuantity - 1).toString();
//       syncQuantity(newQuantity);
//     }
//   };

//   const incrementGuestCount = () => {
//     const currentGuestCount = parseInt(inputGuestCount, 10) || 1;
//     const newGuestCount = (currentGuestCount + 1).toString();
//     setInputGuestCount(newGuestCount);
//     if (setGuestCount) {
//       setGuestCount(parseInt(newGuestCount, 10));
//     }
//     syncQuantity(inputQuantity, newGuestCount);
//   };

//   const decrementGuestCount = () => {
//     const currentGuestCount = parseInt(inputGuestCount, 10) || 1;
//     if (currentGuestCount > 1) {
//       const newGuestCount = (currentGuestCount - 1).toString();
//       setInputGuestCount(newGuestCount);
//       if (setGuestCount) {
//         setGuestCount(parseInt(newGuestCount, 10));
//       }
//       syncQuantity(inputQuantity, newGuestCount);
//     }
//   };

//   const handleBlur = () => {
//     if (inputQuantity === "" || !inputQuantity) {
//       setInputQuantity("1");
//       syncQuantity("1");
//     } else {
//       syncQuantity(inputQuantity);
//     }
//   };

//   const handleGuestCountBlur = () => {
//     if (inputGuestCount === "" || !inputGuestCount) {
//       setInputGuestCount("1");
//       if (setGuestCount) {
//         setGuestCount(1);
//       }
//       syncQuantity(inputQuantity, "1");
//     } else {
//       syncQuantity(inputQuantity, inputGuestCount);
//     }
//   };

//   let title;
//   switch (item.type) {
//     case "restaurant":
//       title = `${item.name} (${cost} ₸/гость, Вместимость: ${item.capacity})`;
//       break;
//     case "clothing":
//       title = `${item.storeName} - ${item.itemName} (${cost} ₸)`;
//       break;
//     case "flowers":
//       title = `${item.salonName} - ${item.flowerName} (${cost} ₸)`;
//       break;
//     case "cake":
//       title = `${item.name} (${cost} ₸)`;
//       break;
//     case "alcohol":
//       title = `${item.salonName} - ${item.alcoholName} (${cost} ₸)`;
//       break;
//     case "program":
//       title = `${item.teamName} (${cost} ₸)`;
//       break;
//     case "tamada":
//       title = `${item.name} (${cost} ₸)`;
//       break;
//     case "traditionalGift":
//       title = `${item.salonName} - ${item.itemName} (${cost} ₸)`;
//       break;
//     case "transport":
//       title = `${item.salonName} - ${item.carName} (${cost} ₸)`;
//       break;
//     case "goods":
//       title = `${item.item_name} (${cost} ₸)`;
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
//           {!isSelected && (
//             <TouchableOpacity
//               style={styles.actionButton}
//               onPress={handleAddItem}
//             >
//               <Icon name="plus-circle" size={24} color="#26A69A" />
//             </TouchableOpacity>
//           )}
//           <TouchableOpacity
//             style={styles.quantityButton}
//             onPress={() => handleRemoveItem(item)}
//           >
//             <Icon2 name="trash-can" size={18} color="#0000000" />
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={styles.actionButton}
//             onPress={() => {
//               setSelectedItem(item);
//               setDetailsModalVisible(true);
//               onClose();
//             }}
//           >
//             <Icon2 name="magnify" size={24} color="#0288D1" />
//           </TouchableOpacity>
//         </View>
//       </View>
//       {isSelected && (
//         <>
//           {item.type === "restaurant" ? (
//             <View style={styles.controlRow}>
//               <Text style={styles.label}>Гостей</Text>
//               <View style={styles.quantityContainer}>
//                 <TouchableOpacity
//                   style={styles.quantityButton}
//                   onPress={decrementGuestCount}
//                 >
//                   <Icon2 name="minus" size={18} color="#0288D1" />
//                 </TouchableOpacity>
//                 <TextInput
//                   style={styles.input}
//                   value={inputGuestCount}
//                   onChangeText={handleGuestCountChange}
//                   onBlur={handleGuestCountBlur}
//                   keyboardType="numeric"
//                   placeholder="1"
//                   placeholderTextColor="#B0BEC5"
//                   textAlign="center"
//                 />
//                 <TouchableOpacity
//                   style={styles.quantityButton}
//                   onPress={incrementGuestCount}
//                 >
//                   <Icon2 name="plus" size={18} color="#0288D1" />
//                 </TouchableOpacity>
//               </View>
//               <Text style={styles.totalCost}>
//                 {totalCost.toLocaleString()} ₸
//               </Text>
//             </View>
//           ) : (
//             <>
//               <View style={styles.controlRow}>
//                 <Text style={styles.label}>Количество </Text>
//                 <View style={styles.quantityContainer}>
//                   <TouchableOpacity
//                     style={styles.quantityButton}
//                     onPress={decrementQuantity}
//                   >
//                     <Icon2 name="minus" size={18} color="#0288D1" />
//                   </TouchableOpacity>
//                   <TextInput
//                     style={styles.input}
//                     value={inputQuantity}
//                     onChangeText={handleQuantityChange}
//                     onBlur={handleBlur}
//                     keyboardType="numeric"
//                     placeholder="1"
//                     placeholderTextColor="#B0BEC5"
//                     textAlign="center"
//                   />
//                   <TouchableOpacity
//                     style={styles.quantityButton}
//                     onPress={incrementQuantity}
//                   >
//                     <Icon2 name="plus" size={18} color="#0288D1" />
//                   </TouchableOpacity>
//                 </View>
//               </View>
//               <View style={styles.totalCost}>
//                 <Text>{totalCost.toLocaleString()} ₸</Text>
//               </View>
//             </>
//           )}
//         </>
//       )}
//     </View>
//   );
// };

// // Модальное окно для отображения элементов категории
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
//   guestCount, // Новый проп
// }) => {
//   const selectedItems = filteredData
//     .filter((item) => item.type === categoryType)
//     .sort((a, b) => (typeOrder[a.type] || 11) - (typeOrder[b.type] || 11));

//   const sortedCategoryItems = [...categoryItems].sort((a, b) => {
//     return (typeOrder[a.type] || 11) - (typeOrder[b.type] || 11);
//   });

//   const renderCategoryItem = useCallback(
//     ({ item }) => {
//       const isSelected = selectedItems.some(
//         (selected) =>
//           `${selected.type}-${selected.id}` === `${item.type}-${item.id}`
//       );
//       const count = selectedItems.filter(
//         (selected) =>
//           `${selected.type}-${selected.id}` === `${item.type}-${item.id}`
//       ).length;
//       const cost = item.type === "restaurant" ? item.averageCost : item.cost;
//       let title;
//       switch (item.type) {
//         case "restaurant":
//           title = `${item.name} (${cost} ₸)`;
//           break;
//         case "clothing":
//           title = `${item.storeName} - ${item.itemName} (${cost} ₸)`;
//           break;
//         case "flowers":
//           title = `${item.salonName} - ${item.flowerName} (${cost} ₸)`;
//           break;
//         case "cake":
//           title = `${item.name} (${cost} ₸)`;
//           break;
//         case "alcohol":
//           title = `${item.salonName} - ${item.alcoholName} (${cost} ₸)`;
//           break;
//         case "program":
//           title = `${item.teamName} (${cost} ₸)`;
//           break;
//         case "tamada":
//           title = `${item.name} (${cost} ₸)`;
//           break;
//         case "traditionalGift":
//           title = `${item.salonName} - ${item.itemName} (${cost} ₸)`;
//           break;
//         case "transport":
//           title = `${item.salonName} - ${item.carName} (${cost} ₸)`;
//           break;
//         case "goods":
//           title = `${item.item_name} (${cost} ₸)`;
//           break;
//         case "jewelry":
//           title = `${item.storeName} - ${item.itemName} (${cost} ₸)`;
//           break;
//         default:
//           title = "Неизвестный элемент";
//       }
//       return (
        

//         <View style={styles.addModalItemCard}>
//           <View
//             style={[
//               styles.addModalItemContent,
//               isSelected && styles.disabledItemContent,
//             ]}
//           >
//             <TouchableOpacity
//               style={[
//                 styles.addModalItemContent,
//                 isSelected && styles.disabledItemContent,
//               ]}
//               onPress={() => {
//                 if (!isSelected) {
//                   // Проверка capacity перед добавлением
//                   if (item.type === "restaurant" && guestCount) {
//                     const totalGuests = parseInt(guestCount, 10);
//                     if (totalGuests > item.capacity) {
//                       alert(
//                         `Этот ресторан не может вместить ${totalGuests} гостей. Максимальная вместимость: ${item.capacity}.`
//                       );
//                       return;
//                     }
//                   }
//                   handleAddItem(item);
//                   const category = typeToCategoryMap[item.type];
//                   if (category) {
//                     updateCategories(category);
//                   }
//                 }
//               }}
//               disabled={isSelected}
//             >
//               <Text
//                 style={styles.addModalItemText}
//                 numberOfLines={1}
//                 ellipsizeMode="tail"
//               >
//                 <Icon2
//                   name="plus"
//                   size={24}
//                   color="#0288D1"
//                   style={{ marginTop: "50%" }}
//                 />
//                 {title}
//               </Text>

//               {count > 0 && (
//                 <Text style={styles.addModalItemCount}>Добавлено: {count}</Text>
//               )}
//             </TouchableOpacity>
//           </View>
//           <View style={styles.actions}>
//             {/* <TouchableOpacity
//             style={[styles.actionButton, isSelected && styles.disabledActionButton]}
//             onPress={handleSelectItem}
//             disabled={isSelected}
//           >
//             <Icon name="plus-circle" size={24} color={isSelected ? "#B0BEC5" : "#26A69A"} />
//           </TouchableOpacity> */}

//             <TouchableOpacity
//               style={styles.actionButton}
//               onPress={() => {
//                 setSelectedItem(item);
//                 setDetailsModalVisible(true);
//                 onClose();
//               }}
//             >
//               <Icon2 name="magnify" size={24} color="#0288D1" />
//             </TouchableOpacity>
//           </View>
//         </View>
//       );
//     },
//     [
//       handleAddItem,
//       setDetailsModalVisible,
//       setSelectedItem,
//       onClose,
//       selectedItems,
//       updateCategories,
//       guestCount, // Добавляем в зависимости
//     ]
//   );

//   const handleClose = () => {
//     onClose();
//   };

//   return (
   
//     <Modal
//       visible={visible}
//       transparent
//       animationType="slide" // Плавное появление снизу
//       onRequestClose={handleClose}
//     >
//       <SafeAreaView style={styles.modalOverlay}>
//         <View style={styles.addModalContainer}>
//           {/* Заголовок и кнопка закрытия */}
//           <View style={styles.addModalHeader}>
//             <Text style={styles.addModalTitle}>{categoryLabel}</Text>
//             <TouchableOpacity
//               style={styles.addModalCloseIcon}
//               onPress={handleClose}
//               accessible
//               accessibilityLabel="Закрыть модальное окно"
//             >
//               <Icon name="close" size={28} color={COLORS.textSecondary} />
//             </TouchableOpacity>
//           </View>

//           <ScrollView contentContainerStyle={styles.addModalItemList}>
//             {selectedItems.length > 0 && (
//               <View style={styles.selectedItemContainer}>
//                 <Text style={styles.categoryHeader}>
//                   Выбранные элементы ({selectedItems.length}):
//                 </Text>
//                 {selectedItems.map((item) => (
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
//                   />
//                 ))}
//               </View>
//             )}

//             {/* Секция доступных элементов */}
//             {sortedCategoryItems.length > 0 ? (
//               sortedCategoryItems.map((item) => (
//                 <View
//                   key={`${item.type}-${item.id}`}
//                   style={styles.itemWrapper}
//                 >
//                   {renderCategoryItem({ item })}
//                 </View>
//               ))
//             ) : (
//               <Text style={styles.addModalEmptyText}>Элементы не найдены</Text>
//             )}
//           </ScrollView>
//         </View>
//       </SafeAreaView>
//     </Modal>
//   );
// };

// // Главный экран

// const CreateEventScreen = ({ navigation, route }) => {
//   const selectedCategories = route?.params?.selectedCategories || [];

//   const dispatch = useDispatch();
//   const { token, user } = useSelector((state) => state.auth);

//   const [categories, setCategories] = useState(selectedCategories);
//   const [disabledCategories, setDisabledCategories] = useState([]);
//   const [data, setData] = useState({
//     restaurants: [],
//     clothing: [],
//     tamada: [],
//     programs: [],
//     traditionalGifts: [],
//     flowers: [],
//     cakes: [],
//     alcohol: [],
//     transport: [],
//     goods: [],
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
//   const [weddingName, setWeddingName] = useState("");
//   const [weddingDate, setWeddingDate] = useState(new Date());
//   const [showDatePicker, setShowDatePicker] = useState(false);
//   const [shouldFilter, setShouldFilter] = useState(false);
//   const [blockedDays, setBlockedDays] = useState({});
//   const scrollViewRef = useRef(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const updateCategories = useCallback((newCategory) => {
//     setCategories((prevCategories) => {
//       if (!prevCategories.includes(newCategory)) {
//         return [...prevCategories, newCategory];
//       }
//       return prevCategories;
//     });
//   }, []);

  

//   const handleRemoveCategory = useCallback(
//     (category) => {
//       setDisabledCategories((prev) => {
//         if (prev.includes(category)) {
//           // Разблокировка категории
//           const updatedDisabledCategories = prev.filter(
//             (cat) => cat !== category
//           );
//           const type = categoryToTypeMap[category];
//           if (type) {
//             // Получаем элементы для разблокированной категории
//             const itemsToAdd = combinedData.filter(
//               (item) => item.type === type
//             );

//             // Фильтруем элементы с учётом бюджета и количества гостей
//             let remaining = parseFloat(budget) || 0;
//             const currentTotalSpent = filteredData.reduce((sum, dataItem) => {
//               const key = `${dataItem.type}-${dataItem.id}`;
//               const itemQuantity =
//                 dataItem.type === "restaurant"
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
//                   item.type === "restaurant"
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

//             // Добавляем не более 2 элементов из категории
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
//                   selectedItem.type === "restaurant"
//                     ? parseInt(guestCount, 10) || 1
//                     : 1;
//                 const totalCost = cost * effectiveQuantity;
//                 selectedItemsToAdd.push({ ...selectedItem, totalCost });
//                 remaining -= totalCost;
//               }
//             }

//             // Обновляем filteredData, добавляя новые элементы
//             setFilteredData((prevData) => {
//               const updatedData = [...prevData, ...selectedItemsToAdd].sort(
//                 (a, b) => (typeOrder[a.type] || 11) - (typeOrder[b.type] || 11)
//               );

//               // Обновляем quantities для новых элементов
//               setQuantities((prevQuantities) => ({
//                 ...prevQuantities,
//                 ...selectedItemsToAdd.reduce((acc, item) => {
//                   const itemKey = `${item.type}-${item.id}`;
//                   return { ...acc, [itemKey]: "1" };
//                 }, {}),
//               }));

//               // Пересчитываем оставшийся бюджет
//               const totalSpent = updatedData.reduce((sum, dataItem) => {
//                 const key = `${dataItem.type}-${dataItem.id}`;
//                 const itemQuantity =
//                   dataItem.type === "restaurant"
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
//           // Блокировка категории
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
//                 dataItem.type === "restaurant"
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
//         api.getRestaurants(),
//         api.getClothing(),
//         api.getTamada(),
//         api.getPrograms(),
//         api.getTraditionalGifts(),
//         api.getFlowers(),
//         api.getCakes(),
//         api.getAlcohol(),
//         api.getTransport(),
//         api.getGoods(token),
//         api.getTJewelry(),
//       ]);

//       const userData = responses.map((response) => response.data);

//       const newData = {
//         restaurants: userData[0] || [],
//         clothing: userData[1] || [],
//         tamada: userData[2] || [],
//         programs: userData[3] || [],
//         traditionalGifts: userData[4] || [],
//         flowers: userData[5] || [],
//         cakes: userData[6] || [],
//         alcohol: userData[7] || [],
//         transport: userData[8] || [],
//         goods: userData[9] || [],
//         jewelry: userData[10] || [],
//       };

//       console.log("JEWELRY=  ", newData[10]);
//       setData(newData);
//     } catch (error) {
//       console.error("Ошибка загрузки данных:", error);
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
//   }, [navigation, token, user]);

//   const formatBudget = (input) => {
//     // Удаляем все нечисловые символы
//     const cleaned = input.replace(/[^\d]/g, "");
//     // Форматируем с пробелами каждые 3 цифры с конца
//     const formatted =
//       cleaned
//         .split("")
//         .reverse()
//         .join("")
//         .match(/.{1,3}/g)
//         ?.join(" ")
//         .split("")
//         .reverse()
//         .join("") || cleaned;
//     return formatted;
//   };

//   // const handleBudgetChange = (value) => {
//   //   const filteredValue = value.replace(/[^0-9]/g, "");
//   //   if (filteredValue === "" || parseFloat(filteredValue) >= 0) {
//   //     const formattedBudget = formatBudget(filteredValue);
//   //     console.log('FILTERED VALUE= ',filteredValue,'BUDGET= ',formattedBudget)
//   //     // setBudget(fil);

//   //     setBudget(filteredValue);
//   //     setShouldFilter(true);
//   //   }
//   // };

//   const handleBudgetChange = (value) => {
//     // Удаляем все нечисловые символы
//     const filteredValue = value.replace(/[^0-9]/g, "");
//     if (filteredValue === "" || parseFloat(filteredValue) >= 0) {
//       // Сохраняем чистое число без пробелов
//       setBudget(filteredValue);
//       setShouldFilter(true);
//       console.log("FILTERED VALUE=", filteredValue, "BUDGET=", filteredValue);
//     }
//   };

//   const handleGuestCountChange = (value) => {
//     const filteredValue = value.replace(/[^0-9]/g, "");
//     if (filteredValue === "" || parseFloat(filteredValue) >= 0) {
//       setGuestCount(filteredValue);
//       setShouldFilter(true);
//     }
//   };

  


//   const filterDataByBudget = useCallback(() => {
//     console.log("filterDataByBudget Стартанул");
//     setIsLoading(true);
  
//     setTimeout(() => {
//       if (!budget || isNaN(budget) || parseFloat(budget) <= 0) {
//         alert("Пожалуйста, введите корректную сумму бюджета");
//         setIsLoading(false);
//         return;
//       }
  
//       if (!guestCount || isNaN(guestCount) || parseFloat(guestCount) <= 0) {
//         alert("Пожалуйста, введите корректное количество гостей");
//         setIsLoading(false);
//         return;
//       }
  
//       const budgetValue = parseFloat(budget);
//       const guests = parseFloat(guestCount);
//       let remaining = budgetValue;
//       const selectedItems = [];
  
//       // Получаем все активные категории (не отключённые)
//       const allowedTypes = categories
//         .filter((category) => !disabledCategories.includes(category))
//         .map((category) => categoryToTypeMap[category])
//         .filter((type) => type);
  
//       // Определяем все типы, которые нужно обработать
//       const typesToProcess = [
//         { key: "restaurants", costField: "averageCost", type: "restaurant" },
//         { key: "clothing", costField: "cost", type: "clothing" },
//         { key: "tamada", costField: "cost", type: "tamada" },
//         { key: "programs", costField: "cost", type: "program" },
//         { key: "traditionalGifts", costField: "cost", type: "traditionalGift" },
//         { key: "flowers", costField: "cost", type: "flowers" },
//         { key: "cakes", costField: "cost", type: "cake" },
//         { key: "alcohol", costField: "cost", type: "alcohol" },
//         { key: "transport", costField: "cost", type: "transport" },
//         { key: "jewelry", costField: "cost", type: "jewelry" },
//       ].filter(({ type }) => allowedTypes.includes(type));
  
//       // Обрабатываем каждый тип
//       for (const { key, costField, type } of typesToProcess) {
//         let items = data[key] || [];
  
//         // Специальная обработка для ресторанов
//         if (type === "restaurant") {
//           items = items.filter(
//             (restaurant) => parseFloat(restaurant.capacity) >= guests
//           );
  
//           if (items.length === 0) {
//             alert(
//               "Нет ресторанов с достаточной вместимостью для указанного количества гостей"
//             );
//             continue;
//           }
  
//           // Учитываем стоимость ресторана на основе количества гостей
//           const sortedItems = items
//             .filter((item) => parseFloat(item[costField]) * guests <= remaining)
//             .sort(
//               (a, b) => parseFloat(a[costField]) - parseFloat(b[costField])
//             );
  
//           if (sortedItems.length === 0) {
//             alert(`Нет ресторанов, подходящих под ваш бюджет (${remaining} тг)`);
//             continue;
//           }
  
//           // Выбираем только один ресторан (например, медианный по стоимости)
//           const selectedItem = sortedItems[Math.floor(sortedItems.length / 2)];
//           const itemCost = parseFloat(selectedItem[costField]) * guests;
//           selectedItems.push({
//             ...selectedItem,
//             type,
//             totalCost: itemCost,
//           });
//           remaining -= itemCost;
//         } else {
//           // Обработка остальных категорий
//           const sortedItems = items
//             .filter((item) => parseFloat(item[costField]) <= remaining)
//             .sort(
//               (a, b) => parseFloat(a[costField]) - parseFloat(b[costField])
//             );
  
//           if (sortedItems.length > 0) {
//             // Выбираем только один элемент из категории
//             const selectedItem = sortedItems[0]; // Берем первый (самый дешевый) или можно выбрать по другому критерию
//             if (selectedItem) {
//               const cost = parseFloat(selectedItem[costField]);
//               if (cost <= remaining) {
//                 selectedItems.push({
//                   ...selectedItem,
//                   type,
//                   totalCost: cost,
//                 });
//                 remaining -= cost;
//               }
//             }
//           }
//         }
//       }
  
//       if (selectedItems.length === 0) {
//         alert("Нет элементов, подходящих под ваш бюджет и количество гостей");
//         setIsLoading(false);
//         return;
//       }
  
//       const sortedSelectedItems = [...selectedItems].sort((a, b) => {
//         return (typeOrder[a.type] || 11) - (typeOrder[b.type] || 11);
//       });
  
//       setFilteredData(sortedSelectedItems);
//       setRemainingBudget(remaining);
//       setQuantities(
//         sortedSelectedItems.reduce((acc, item) => {
//           const itemKey = `${item.type}-${item.id}`;
//           return { ...acc, [itemKey]: "1" };
//         }, {})
//       );
  
//       setIsLoading(false);
//     }, 150);
//   }, [budget, guestCount, data, categories, disabledCategories]);


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
//   }, [budget, guestCount, filterDataByBudget, shouldFilter]);

//   const handleAddItem = useCallback(
//     (item) => {
//       const itemKey = `${item.type}-${item.id}`;
//       const cost = item.type === "restaurant" ? item.averageCost : item.cost;

//       // Проверка количества гостей перед добавлением ресторана
//       if (item.type === "restaurant" && !guestCount) {
//         alert(
//           "Пожалуйста, укажите количество гостей перед добавлением ресторана."
//         );
//         return;
//       }

//       // Проверка capacity для ресторанов
//       if (item.type === "restaurant" && guestCount) {
//         const totalGuests = parseInt(guestCount, 10);
//         if (totalGuests > item.capacity) {
//           alert(
//             `Этот ресторан не может вместить ${totalGuests} гостей. Максимальная вместимость: ${item.capacity}.`
//           );
//           return;
//         }
//       }

//       setFilteredData((prev) => {
//         const existingItemIndex = prev.findIndex(
//           (i) => `${i.type}-${i.id}` === itemKey
//         );
//         let updatedData;
//         let newQuantity;

//         if (existingItemIndex !== -1) {
//           const currentQuantity =
//             quantities[itemKey] === "" ? "1" : quantities[itemKey] || "1";
//           newQuantity = (parseInt(currentQuantity) + 1).toString();

//           // Для ресторанов не увеличиваем количество, так как используется guestCount
//           if (item.type === "restaurant") {
//             alert("Вы можете выбрать только один ресторан.");
//             return prev;
//           }

//           updatedData = [...prev];
//           updatedData[existingItemIndex] = {
//             ...updatedData[existingItemIndex],
//             totalCost: cost * parseInt(newQuantity),
//           };
//         } else {
//           newQuantity = "1";
//           const effectiveQuantity =
//             item.type === "restaurant" ? parseInt(guestCount, 10) || 1 : 1;
//           const totalCost = cost * effectiveQuantity;
//           const newItem = { ...item, totalCost };
//           updatedData = [...prev, newItem];
//         }

//         setQuantities((prevQuantities) => ({
//           ...prevQuantities,
//           [itemKey]: newQuantity,
//         }));

//         const totalSpent = updatedData.reduce((sum, dataItem) => {
//           const key = `${dataItem.type}-${dataItem.id}`;
//           const itemQuantity =
//             dataItem.type === "restaurant"
//               ? parseInt(guestCount, 10) || 1
//               : parseInt(quantities[key] || "1");
//           const itemCost =
//             dataItem.type === "restaurant"
//               ? dataItem.averageCost
//               : dataItem.cost;
//           return sum + itemCost * itemQuantity;
//         }, 0);

//         setRemainingBudget(parseFloat(budget) - totalSpent);
//         return updatedData.sort(
//           (a, b) => (typeOrder[a.type] || 11) - (typeOrder[b.type] || 11)
//         );
//       });

//       setCategoryModalVisible(false);
//     },
//     [quantities, budget, guestCount, setCategoryModalVisible]
//   );

//   const handleRemoveItem = useCallback(
//     (item) => {
//       const itemKey = `${item.type}-${item.id}`;

//       setFilteredData((prev) => {
//         const updatedData = prev.filter((i) => `${i.type}-${i.id}` !== itemKey);

//         setQuantities((prevQuantities) => {
//           const updatedQuantities = { ...prevQuantities };
//           delete updatedQuantities[itemKey];
//           return updatedQuantities;
//         });

//         const totalSpent = updatedData.reduce((sum, dataItem) => {
//           const key = `${dataItem.type}-${dataItem.id}`;
//           const itemQuantity =
//             dataItem.type === "restaurant"
//               ? parseInt(guestCount, 10) || 1
//               : parseInt(quantities[key] || "1");
//           const itemCost =
//             dataItem.type === "restaurant"
//               ? dataItem.averageCost
//               : dataItem.cost;
//           return sum + itemCost * itemQuantity;
//         }, 0);

//         setRemainingBudget(parseFloat(budget) - totalSpent);
//         return updatedData.sort(
//           (a, b) => (typeOrder[a.type] || 11) - (typeOrder[b.type] || 11)
//         );
//       });
//     },
//     [quantities, budget, guestCount]
//   );

//   const calculateTotalCost = () => {
//     return filteredData.reduce((sum, item) => {
//       const quantity = parseInt(quantities[`${item.type}-${item.id}`] || "1");
//       const cost = item.type === "restaurant" ? item.averageCost : item.cost;
//       const effectiveQuantity =
//         item.type === "restaurant" ? parseInt(guestCount, 10) || 1 : quantity;
//       return sum + cost * effectiveQuantity;
//     }, 0);
//   };

//   useEffect(() => {
//     fetchAllBlockedDays();
//   }, []);

//   const fetchAllBlockedDays = async () => {
//     try {
//       const response = await api.fetchAllBlockDays();
//       console.log("Ответ API fetchAllBlockDays:", response.data);
//       const blockedDays = {};
//       response.data.forEach((entry) => {
//         const { date, restaurantId, restaurantName } = entry;
//         if (!blockedDays[date]) {
//           blockedDays[date] = {
//             marked: true,
//             dots: [],
//           };
//         }
//         blockedDays[date].dots.push({
//           restaurantId,
//           restaurantName,
//         });
//       });
//       console.log("Сформированные blockedDays:", blockedDays);
//       setBlockedDays(blockedDays);
//     } catch (error) {
//       console.error("Ошибка загрузки заблокированных дней:", error.message);
//     }
//   };

  

//   const handleSubmit = async () => {
//     // Валидация базовых полей
//     if (!weddingName.trim()) {
//       alert("Пожалуйста, укажите название свадьбы");
//       return;
//     }
//     if (!filteredData.length) {
//       alert("Пожалуйста, выберите хотя бы один элемент для свадьбы");
//       return;
//     }
//     if (!user?.id || !token) {
//       alert("Ошибка авторизации. Пожалуйста, войдите в систему.");
//       navigation.navigate("Login");
//       return;
//     }

//     // Формирование строки даты
//     const dateString = weddingDate.toISOString().split("T")[0];

//     // Проверка, есть ли ресторан в filteredData
//     const restaurantItem = filteredData.find(
//       (item) => item.type === "restaurant"
//     );
//     if (restaurantItem) {
//       // Проверка, заблокирована ли дата для этого ресторана
//       if (blockedDays[dateString]) {
//         const isRestaurantBlocked = blockedDays[dateString].dots.some(
//           (dot) => dot.restaurantId === restaurantItem.id
//         );
//         if (isRestaurantBlocked) {
//           alert(
//             ` Дата ${dateString} уже забронирована для ресторана ${restaurantItem.name}. Пожалуйста, выберите другую дату.`
//           );
//           return;
//         }
//       }
//     }

//     // Формирование данных для отправки
//     const weddingData = {
//       name: weddingName.trim(),
//       date: dateString,
//       host_id: user.id,
//       items: filteredData.map((item) => {
//         const quantity = parseInt(quantities[`${item.type}-${item.id}`] || "1");
//         const effectiveQuantity =
//           item.type === "restaurant" ? parseInt(guestCount, 10) || 1 : quantity;
//         const cost = item.type === "restaurant" ? item.averageCost : item.cost;
//         return {
//           id: item.id,
//           type: item.type,
//           quantity: effectiveQuantity,
//           totalCost: cost * effectiveQuantity,
//         };
//       }),
//     };

//     // Отправка данных на сервер
//     try {
//       await api.createWedding(weddingData, token);
//       alert("Свадьба успешно создана!");
//       setModalVisible(false);
//       setWeddingName("");
//       setWeddingDate(new Date());
//       setShowDatePicker(false);
//       setFilteredData([]);
//       setQuantities({});
//       setBudget("");
//       setGuestCount("");
//       setRemainingBudget(0);
//     } catch (error) {
//       console.error("Ошибка при создании свадьбы:", error);
//       alert("Ошибка: " + (error.response?.data?.error || error.message));
//     }
//   };

//   const onDateChange = (day) => {
//     setWeddingDate(new Date(day.timestamp));
//     setShowDatePicker(false);
//   };

//   const combinedData = useMemo(() => {
//     const dataArray = [
//       ...data.restaurants.map((item) => ({ ...item, type: "restaurant" })),
//       ...data.clothing.map((item) => ({ ...item, type: "clothing" })),
//       ...data.tamada.map((item) => ({ ...item, type: "tamada" })),
//       ...data.programs.map((item) => ({ ...item, type: "program" })),
//       ...data.traditionalGifts.map((item) => ({
//         ...item,
//         type: "traditionalGift",
//       })),
//       ...data.flowers.map((item) => ({ ...item, type: "flowers" })),
//       ...data.cakes.map((item) => ({ ...item, type: "cake" })),
//       ...data.alcohol.map((item) => ({ ...item, type: "alcohol" })),
//       ...data.transport.map((item) => ({ ...item, type: "transport" })),
//       ...data.goods.map((item) => ({ ...item, type: "goods" })),
//       ...data.jewelry.map((item) => ({ ...item, type: "jewelry" })),
//     ].filter((item) => item.type !== "goods" || item.category !== "Прочее");
//     return dataArray.sort(
//       (a, b) => (typeOrder[a.type] || 11) - (typeOrder[b.type] || 11)
//     );
//   }, [data]);

//   const handleCategoryPress = (category) => {
//     const type = categoryToTypeMap[category];
//     if (!type) return;
//     const items = combinedData.filter((item) => item.type === type);
//     setSelectedCategoryItems(items);
//     setSelectedCategoryLabel(category);
//     setSelectedCategoryType(type);
//     setCategoryModalVisible(true);
//   };

//   const handleCloseCategoryModal = () => {
//     setCategoryModalVisible(false);
//     setSelectedCategoryItems([]);
//     setSelectedCategoryLabel("");
//     setSelectedCategoryType("");
//   };

//   const sortedCategories = [...categories].sort((a, b) => {
//     const typeA = categoryToTypeMap[a];
//     const typeB = categoryToTypeMap[b];
//     return (typeOrder[typeA] || 11) - (typeOrder[typeB] || 11);
//   });

  
//   const renderCategory = (item) => {
//     if (item === "Добавить") {
//       return (
//         <View style={styles.categoryRow}>
//           <TouchableOpacity
//             style={styles.categoryButton}
//             onPress={() => setAddItemModalVisible(true)}
//           >
//             <LinearGradient
//               colors={[COLORS.buttonGradientStart, COLORS.buttonGradientEnd]}
//               style={styles.categoryButtonGradient}
//             >
//               <View style={{ flexDirection: "row", alignItems: "center" }}>
//                 <Text style={styles.categoryPlusText}>+</Text>
//               </View>
//             </LinearGradient>
//           </TouchableOpacity>
//         </View>
//       );
//     }

//     const isDisabled = disabledCategories.includes(item);

//     // 'Шоу программа': "program",

//     // 'Традиционные подарки': "traditionalGift",

//     // Маппинг категорий на изображения для активного и неактивного состояния
//     const categoryIcons = {
//       Цветы: {
//         on: require("../../assets/cvetyOn.png"),
//         off: require("../../assets/cvetyOff.png"),
//       },
//       "Прокат авто": {
//         on: require("../../assets/prokatAvtoOn.png"),
//         off: require("../../assets/prokatAutooff.png"),
//       },
//       "Шоу программа": {
//         on: require("../../assets/show.png"),
//         off: require("../../assets/showTurnOff.png"),
//       },
//       Ресторан: {
//         on: require("../../assets/restaurantOn.png"),
//         off: require("../../assets/restaurantTurnOff.png"),
//       },

//       Ведущий: {
//         on: require("../../assets/vedushieOn.png"),
//         off: require("../../assets/vedushieOff.png"),
//       },
//       "Традиционные подарки": {
//         on: require("../../assets/tradGiftsOn.png"),
//         off: require("../../assets/tradGifts.png"),
//       },


//       "Свадебный салон": {
//         on: require("../../assets/svadebnyisalon.png"),
//         off: require("../../assets/svadeblyisalonOff.png"),
//       },
//       Алкоголь: {
//         on: require("../../assets/alcoholOn.png"),
//         off: require("../../assets/alcoholOff.png"),
//       },
//       "Ювелирные изделия": {
//         on: require("../../assets/uvizdeliyaOn.png"),
//         off: require("../../assets/uvIzdeliyaOff.png"),
//       },
//       Торты: {
//         on: require("../../assets/torty.png"),
//         off: require("../../assets/tortyTurnOff.png"),
//       },
//       // Добавьте другие категории, если нужно
//     };

//     // Иконка для категории внутри кнопки
//     const categoryIcon =
//       categoryIcons[item]?.on || require("../../assets/join.png"); // Иконка по умолчанию, если не найдена

//     return (
//       <View style={styles.categoryRow}>
//         <TouchableOpacity
//           style={styles.removeCategoryButton}
//           onPress={() => handleRemoveCategory(item)}
//         >
//           <Image
//             source={
//               isDisabled ? categoryIcons[item]?.on : categoryIcons[item]?.off
//             }
//             style={{ width: 60, height: 70 }} // Настройте размер под ваши нужды
//           />
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[
//             styles.categoryButton,
//             isDisabled && styles.disabledCategoryButton,
//           ]}
//           onPress={() => {
//             if (!isDisabled) {
//               handleCategoryPress(item);
//             }
//           }}
//           disabled={isDisabled}
//         >
//           <LinearGradient
//             colors={[COLORS.buttonGradientStart, COLORS.buttonGradientEnd]}
//             style={styles.categoryButtonGradient}
//           >
//             <View style={{ flexDirection: "row", alignItems: "center" }}>
//               {/* <Image
//                 source={categoryIcon}
//                 style={{ width: 20, height: 20, marginRight: 10 }} // Настройте размер и отступ
//               /> */}
//               <Icon
//                 name={
//                   item === "Ресторан"
//                     ? "restaurant"
//                     : item === "Прокат авто"
//                     ? "directions-car"
//                     : item === "Фото-видео съёмка"
//                     ? "camera-alt"
//                     : item === "Ведущий"
//                     ? "mic"
//                     : item === "Традиционные подарки"
//                     ? "card-giftcard"
//                     : item === "Свадебный салон"
//                     ? "store"
//                     : item === "Алкоголь"
//                     ? "local-drink"
//                     : item === "Ювелирные изделия"
//                     ? "diamond"
//                     : item === "Торты"
//                     ? "cake"
//                     : "category"
//                 }
//                 size={20}
//                 color={COLORS.white}
//                 style={{ marginRight: 10 }}
//               />
//               <Text style={styles.categoryText}>{item}</Text>
//             </View>
//           </LinearGradient>
//         </TouchableOpacity>
//       </View>
//     );
//   };

//   const handleDetailsPress = () => {
//     setDetailsModalVisible(false); // Закрываем модальное окно
//     setSelectedItem(null); // Сбрасываем выбранный элемент
//     navigation.navigate("Details", { item: selectedItem }); // Переходим на DetailsScreen
//   };

//   const handleGoBack = () => {
//     navigation.navigate("BeforeHomeScreen", {
//       selectedCategories: categories,
//     });
//   };

 

//   const handleSubmitEditing = () => {
//     // Действие при нажатии кнопки "Готово" на клавиатуре
//     // Например, можно вызвать handleSubmit или просто закрыть клавиатуру
//     // Keyboard.dismiss(); // Если нужно закрыть клавиатуру
//   };

//   return (
//     <>
//       <LinearGradient
//         colors={["#F1EBDD", "#897066"]}
//         start={{ x: 0, y: 1 }}
//         end={{ x: 0, y: 0 }}
//         style={styles.splashContainer}
//       >
//         <TouchableOpacity
//           style={{ marginTop: "15%", marginLeft: "2%" }}
//           onPress={() => navigation.goBack()}
//         >
//           <AntDesign name="left" size={24} color="black" />
//         </TouchableOpacity>

//         <View style={styles.logoContainer}>
//           <Image
//             source={require("../../assets/kazanRevert.png")}
//             style={styles.potIcon}
//             resizeMode="contain"
//           />
//         </View>

//         <Image
//           source={require("../../assets/footer.png")}
//           style={styles.topPatternContainer}
//         />

//         <View style={styles.headerContainer}>
//           <View style={styles.budgetContainer}>
//             <View style={styles.categoryItemAdd}>
//               {renderCategory("Добавить")}
//             </View>
//             {/* <TextInput
//       style={styles.budgetInput}
//       placeholder="Бюджет (т)"
//       value={budget}
//       onChangeText={handleBudgetChange}
      
//       placeholderTextColor="#FFF"
//       keyboardType="phone-pad"
//       maxLength={18}
//       returnKeyType="done"
//       onSubmitEditing={handleSubmitEditing}
//     /> */}

//             <TextInput
//               style={styles.budgetInput}
//               placeholder="Бюджет (т)"
//               value={formatBudget(budget)} // Отображаем число с пробелами
//               onChangeText={handleBudgetChange}
//               keyboardType="numeric" // Используем numeric вместо phone-pad
//               maxLength={18}
//               returnKeyType="done"
//               onSubmitEditing={handleSubmitEditing}
//             />

//             <TextInput
//               style={styles.guestInput}
//               placeholder="Гостей"
//               value={guestCount}
//               onChangeText={handleGuestCountChange}
//               placeholderTextColor={COLORS.placeholder}
//               keyboardType="phone-pad"
//               maxLength={18}
//               returnKeyType="done"
//               onSubmitEditing={handleSubmitEditing}
//             />
//           </View>

       

//           <Modal
//             animationType="fade"
//             transparent={true}
//             visible={isLoading}
//             onRequestClose={() => {}} // Блокируем закрытие
//           >
//             <View style={styles.loaderOverlay}>
//               <View style={styles.loaderContainer}>
//                 <ActivityIndicator size="large" color={COLORS.primary} />
//                 <Text style={styles.loaderText}>Загрузка...</Text>
//               </View>
//             </View>
//           </Modal>
//         </View>

//         <View style={styles.listContainer}>
//           {loading ? (
//             <ActivityIndicator size="large" color={COLORS.primary} />
//           ) : (
//             <ScrollView
//               ref={scrollViewRef}
//               style={styles.scrollView}
//               showsVerticalScrollIndicator={false}
//             >
//               <View style={styles.categoryGrid}>
//                 {sortedCategories.map((item, index) => (
//                   <View key={index} style={styles.categoryItem}>
//                     {renderCategory(item)}
//                   </View>
//                 ))}
//               </View>
//               <View style={styles.bottomPadding} />
//             </ScrollView>
//           )}
//         </View>

//         <View style={styles.bottomContainer}>
//           <TouchableOpacity
//             style={styles.nextButton}
//             onPress={() => setModalVisible(true)}
//           >
//             <Image
//               source={require("../../assets/next.png")}
//               style={styles.potIcon3}
//               resizeMode="contain"
//             />
//           </TouchableOpacity>
//         </View>

//         <AddItemModal
//           visible={addItemModalVisible}
//           onClose={() => setAddItemModalVisible(false)}
//           filteredItems={combinedData}
//           filteredData={filteredData}
//           handleAddItem={handleAddItem}
//           setDetailsModalVisible={setDetailsModalVisible}
//           setSelectedItem={setSelectedItem}
//           quantities={quantities}
//           updateCategories={updateCategories}
//         />

//         <CategoryItemsModal
//           visible={categoryModalVisible}
//           onClose={handleCloseCategoryModal}
//           categoryItems={selectedCategoryItems}
//           categoryLabel={selectedCategoryLabel}
//           categoryType={selectedCategoryType}
//           filteredData={filteredData}
//           handleAddItem={handleAddItem}
//           handleRemoveItem={handleRemoveItem}
//           setDetailsModalVisible={setDetailsModalVisible}
//           setSelectedItem={setSelectedItem}
//           quantities={quantities}
//           setQuantities={setQuantities}
//           budget={budget}
//           setFilteredData={setFilteredData}
//           setRemainingBudget={setRemainingBudget}
//           updateCategories={updateCategories}
//           guestCount={guestCount}
//         />

//         <Modal
//           visible={detailsModalVisible}
//           transparent
//           animationType="fade"
//           onRequestClose={() => {
//             setDetailsModalVisible(false);
//             setSelectedItem(null);
//           }}
//         >
//           <SafeAreaView style={styles.modalOverlay}>
//             <Animatable.View
//               style={styles.detailsModalContainer}
//               animation="zoomIn"
//               duration={300}
//             >
//               <View style={styles.detailsModalHeader}>
//                 <Text style={styles.detailsModalTitle}>Подробности</Text>

//                 <TouchableOpacity
//                   style={styles.detailsModalCloseIcon}
//                   onPress={() => {
//                     setDetailsModalVisible(false);
//                     setSelectedItem(null);
//                   }}
//                 >
//                   <Icon name="close" size={24} color={COLORS.textSecondary} />
//                 </TouchableOpacity>
//               </View>

//               {selectedItem ? (
//                 <View style={styles.detailsModalContent}>
//                   {console.log("Selected ITEM= ", selectedItem)}
//                   {(() => {
//                     switch (selectedItem.type) {
//                       case "restaurant":
//                         return (
//                           <>
//                             {/* <Text style={styles.detailsModalText}>
//                               Тип: Ресторан
//                             </Text> */}
//                             <Text style={styles.detailsModalText}>
//                               Наименование: {selectedItem.name}
//                             </Text>
//                             <Text style={styles.detailsModalText}>
//                               Вместимость: {selectedItem.capacity}
//                             </Text>
//                             <Text></Text>
//                             {/* <Text style={styles.detailsModalText}>
//                               Кухня: {selectedItem.cuisine}
//                             </Text>
//                             <Text style={styles.detailsModalText}>
//                               Средний чек: {selectedItem.averageCost} ₸
//                             </Text>
//                             <Text style={styles.detailsModalText}>
//                               Адрес: {selectedItem.address || "Не указан"}
//                             </Text> */}
//                             {/* <TouchableOpacity
//                                   style={styles.detailsButton}
//                                   onPress={()=>handleDetailsPress()}
//                                 >

//                           <Text style={styles.detailsButtonText}>Подробнее</Text>

//                           </TouchableOpacity> */}

//                             <TouchableOpacity
//                               style={[
//                                 styles.modalButton2,
//                                 styles.confirmButton,
//                               ]}
//                               onPress={() => handleDetailsPress()}
//                             >
//                               <Icon
//                                 name="search"
//                                 size={20}
//                                 color={COLORS.white}
//                                 style={styles.buttonIcon}
//                               />
//                               <Text></Text>
//                               <Text style={styles.modalButtonText}>
//                                 Подробнее
//                               </Text>
//                             </TouchableOpacity>
//                           </>
//                         );
//                       case "clothing":
//                         return (
//                           <>
//                             {/* <Text style={styles.detailsModalText}>
//                               Тип: Одежда
//                             </Text>
//                             <Text style={styles.detailsModalText}>
//                               Магазин: {selectedItem.storeName}
//                             </Text> */}
//                             <Text style={styles.detailsModalText}>
//                               Товар: {selectedItem.itemName}
//                             </Text>
//                             <Text style={styles.detailsModalText}>
//                               Пол: {selectedItem.gender}
//                             </Text>
//                             <Text style={styles.detailsModalText}>
//                               Стоимость: {selectedItem.cost} ₸
//                             </Text>
//                             <Text></Text>
//                             {/* <Text style={styles.detailsModalText}>
//                               Адрес: {selectedItem.address}
//                             </Text> */}
//                             {/* <TouchableOpacity
//                                   style={styles.detailsButton}
//                                   onPress={()=>handleDetailsPress()}
//                                 >

//                           <Text style={styles.detailsButtonText}>Подробнее</Text>
//                         </TouchableOpacity> */}

//                             <TouchableOpacity
//                               style={[
//                                 styles.modalButton2,
//                                 styles.confirmButton,
//                               ]}
//                               onPress={() => handleDetailsPress()}
//                             >
//                               <Icon
//                                 name="search"
//                                 size={20}
//                                 color={COLORS.white}
//                                 style={styles.buttonIcon}
//                               />
//                               <Text></Text>
//                               <Text style={styles.modalButtonText}>
//                                 Подробнее
//                               </Text>
//                             </TouchableOpacity>
//                           </>
//                         );
//                       case "flowers":
//                         return (
//                           <>
//                             {/* <Text style={styles.detailsModalText}>
//                               Тип: Цветы
//                             </Text> */}
//                             {/* <Text style={styles.detailsModalText}>
//                               Салон: {selectedItem.salonName}
//                             </Text> */}
//                             <Text style={styles.detailsModalText}>
//                               Цветы: {selectedItem.flowerName}
//                             </Text>
//                             <Text style={styles.detailsModalText}>
//                               Тип цветов: {selectedItem.flowerType}
//                             </Text>
//                             <Text style={styles.detailsModalText}>
//                               Стоимость: {selectedItem.cost} ₸
//                             </Text>
//                             <Text></Text>
//                             {/* <Text style={styles.detailsModalText}>
//                               Адрес: {selectedItem.address}
//                             </Text> */}
//                             {/* <TouchableOpacity
//                                   style={styles.detailsButton}
//                                   onPress={()=>handleDetailsPress()}
//                                 >

//                           <Text style={styles.detailsButtonText}>Подробнее</Text>
//                         </TouchableOpacity> */}

//                             <TouchableOpacity
//                               style={[
//                                 styles.modalButton2,
//                                 styles.confirmButton,
//                               ]}
//                               onPress={() => handleDetailsPress()}
//                             >
//                               <Icon
//                                 name="search"
//                                 size={20}
//                                 color={COLORS.white}
//                                 style={styles.buttonIcon}
//                               />
//                               <Text></Text>
//                               <Text style={styles.modalButtonText}>
//                                 Подробнее
//                               </Text>
//                             </TouchableOpacity>
//                           </>
//                         );
//                       case "cake":
//                         return (
//                           <>
//                             {/* <Text style={styles.detailsModalText}>
//                               Тип: Торты
//                             </Text> */}
//                             {/* <Text style={styles.detailsModalText}>
//                               Название: {selectedItem.name}
//                             </Text> */}
//                             <Text style={styles.detailsModalText}>
//                               Тип торта: {selectedItem.cakeType}
//                             </Text>
//                             <Text style={styles.detailsModalText}>
//                               Стоимость: {selectedItem.cost} ₸
//                             </Text>

//                             <Text></Text>
//                             {/* <Text style={styles.detailsModalText}>
//                               Адрес: {selectedItem.address}
//                             </Text> */}
//                             {/* <TouchableOpacity
//                                   style={styles.detailsButton}
//                                   onPress={()=>handleDetailsPress()}
//                                 >

//                           <Text style={styles.detailsButtonText}>Подробнее</Text>
//                         </TouchableOpacity> */}

//                             <TouchableOpacity
//                               style={[
//                                 styles.modalButton2,
//                                 styles.confirmButton,
//                               ]}
//                               onPress={() => handleDetailsPress()}
//                             >
//                               <Icon
//                                 name="search"
//                                 size={20}
//                                 color={COLORS.white}
//                                 style={styles.buttonIcon}
//                               />
//                               <Text></Text>
//                               <Text style={styles.modalButtonText}>
//                                 Подробнее
//                               </Text>
//                             </TouchableOpacity>
//                           </>
//                         );
//                       case "alcohol":
//                         return (
//                           <>
//                             <Text style={styles.detailsModalText}>
//                               Тип: Алкоголь
//                             </Text>
//                             {/* <Text style={styles.detailsModalText}>
//                               Салон: {selectedItem.salonName}
//                             </Text> */}
//                             <Text style={styles.detailsModalText}>
//                               Напиток: {selectedItem.alcoholName}
//                             </Text>
//                             {/* <Text style={styles.detailsModalText}>
//                               Категория: {selectedItem.category}
//                             </Text> */}
//                             <Text style={styles.detailsModalText}>
//                               Стоимость: {selectedItem.cost} ₸
//                             </Text>
//                             {/* <Text style={styles.detailsModalText}>
//                               Адрес: {selectedItem.address}
//                             </Text> */}

//                             {/* <TouchableOpacity
//                                   style={styles.detailsButton}
//                                   onPress={()=>handleDetailsPress()}
//                                 >

//                           <Text style={styles.detailsButtonText}>Подробнее</Text>
//                         </TouchableOpacity> */}
//                             <TouchableOpacity
//                               style={[
//                                 styles.modalButton2,
//                                 styles.confirmButton,
//                               ]}
//                               onPress={() => handleDetailsPress()}
//                             >
//                               <Icon
//                                 name="search"
//                                 size={20}
//                                 color={COLORS.white}
//                                 style={styles.buttonIcon}
//                               />
//                               <Text></Text>
//                               <Text style={styles.modalButtonText}>
//                                 Подробнее
//                               </Text>
//                             </TouchableOpacity>
//                           </>
//                         );
//                       case "program":
//                         return (
//                           <>
//                             {/* <Text style={styles.detailsModalText}>
//                               Тип: Программа
//                             </Text> */}
//                             <Text style={styles.detailsModalText}>
//                               Команда: {selectedItem.teamName}
//                             </Text>
//                             <Text style={styles.detailsModalText}>
//                               Тип программы: {selectedItem.type}
//                             </Text>
//                             <Text style={styles.detailsModalText}>
//                               Стоимость: {selectedItem.cost} ₸
//                             </Text>

//                             <Text></Text>
//                             {/* <TouchableOpacity
//                                   style={styles.detailsButton}
//                                   onPress={()=>handleDetailsPress()}
//                                 >

//                           <Text style={styles.detailsButtonText}>Подробнее</Text>
//                         </TouchableOpacity> */}

//                             <TouchableOpacity
//                               style={[
//                                 styles.modalButton2,
//                                 styles.confirmButton,
//                               ]}
//                               onPress={() => handleDetailsPress()}
//                             >
//                               <Icon
//                                 name="search"
//                                 size={20}
//                                 color={COLORS.white}
//                                 style={styles.buttonIcon}
//                               />
//                               <Text></Text>
//                               <Text style={styles.modalButtonText}>
//                                 Подробнее
//                               </Text>
//                             </TouchableOpacity>
//                           </>
//                         );
//                       case "tamada":
//                         return (
//                           <>
//                             <Text style={styles.detailsModalText}>
//                               Тип: Тамада
//                             </Text>
//                             <Text style={styles.detailsModalText}>
//                               Имя: {selectedItem.name}
//                             </Text>
//                             <Text style={styles.detailsModalText}>
//                               О себе: {selectedItem.portfolio}
//                             </Text>
//                              <TouchableOpacity onPress={()=>{
//                                           const url = selectedItem.portfolio;
//                                           Linking.openURL(url);
//                                         }}>
//                                           <Text>Открыть в ссылку</Text>
//                               </TouchableOpacity>

//                               <Text></Text>

//                             <Text style={styles.detailsModalText}>
//                               Стоимость: {selectedItem.cost} ₸
//                             </Text>
//                             <Text></Text>
//                             {/* <TouchableOpacity
//                                   style={styles.detailsButton}
//                                   onPress={()=>handleDetailsPress()}
//                                 >

//                           <Text style={styles.detailsButtonText}>Подробнее</Text>
//                         </TouchableOpacity> */}
//                             <TouchableOpacity
//                               style={[
//                                 styles.modalButton2,
//                                 styles.confirmButton,
//                               ]}
//                               onPress={() => handleDetailsPress()}
//                             >
//                               <Icon
//                                 name="search"
//                                 size={20}
//                                 color={COLORS.white}
//                                 style={styles.buttonIcon}
//                               />
//                               <Text></Text>
//                               <Text style={styles.modalButtonText}>
//                                 Подробнее
//                               </Text>
//                             </TouchableOpacity>
//                           </>
//                         );
//                       case "traditionalGift":
//                         return (
//                           <>
//                             {/* <Text style={styles.detailsModalText}>
//                               Тип: Традиционные подарки
//                             </Text>
//                             <Text style={styles.detailsModalText}>
//                               Салон: {selectedItem.salonName}
//                             </Text> */}
//                             <Text style={styles.detailsModalText}>
//                               Товар: {selectedItem.itemName}
//                             </Text>
//                             {/* <Text style={styles.detailsModalText}>
//                               Тип: {selectedItem.type}
//                             </Text> */}
//                             <Text style={styles.detailsModalText}>
//                               Стоимость: {selectedItem.cost} ₸
//                             </Text>
//                             {/* <Text style={styles.detailsModalText}>
//                               Адрес: {selectedItem.address}
//                             </Text> */}
//                             <Text></Text>
//                             {/* <TouchableOpacity
//                                   style={styles.detailsButton}
//                                   onPress={()=>handleDetailsPress()}
//                                 >

//                           <Text style={styles.detailsButtonText}>Подробнее</Text>
//                         </TouchableOpacity> */}
//                             <TouchableOpacity
//                               style={[
//                                 styles.modalButton2,
//                                 styles.confirmButton,
//                               ]}
//                               onPress={() => handleDetailsPress()}
//                             >
//                               <Icon
//                                 name="search"
//                                 size={20}
//                                 color={COLORS.white}
//                                 style={styles.buttonIcon}
//                               />
//                               <Text></Text>
//                               <Text style={styles.modalButtonText}>
//                                 Подробнее
//                               </Text>
//                             </TouchableOpacity>
//                           </>
//                         );
//                       case "transport":
//                         return (
//                           <>
//                             {/* <Text style={styles.detailsModalText}>
//                               Тип: Транспорт
//                             </Text>
//                             <Text style={styles.detailsModalText}>
//                               Салон: {selectedItem.salonName}
//                             </Text> */}
//                             <Text style={styles.detailsModalText}>
//                               Авто: {selectedItem.carName}
//                             </Text>
//                             <Text style={styles.detailsModalText}>
//                               Марка: {selectedItem.brand}
//                             </Text>
//                             <Text style={styles.detailsModalText}>
//                               Цвет: {selectedItem.color}
//                             </Text>
//                             {/* <Text style={styles.detailsModalText}>
//                               Телефон: {selectedItem.phone}
//                             </Text>
//                             <Text style={styles.detailsModalText}>
//                               Район: {selectedItem.district}
//                             </Text> */}
//                             <Text style={styles.detailsModalText}>
//                               Стоимость: {selectedItem.cost} ₸
//                             </Text>
//                             {/* <Text style={styles.detailsModalText}>
//                               Адрес: {selectedItem.address}
//                             </Text> */}
//                             <Text></Text>
//                             {/* <TouchableOpacity
//                                   style={styles.detailsButton}
//                                   onPress={()=>handleDetailsPress()}
//                                 >

//                           <Text style={styles.detailsButtonText}>Подробнее</Text>
//                         </TouchableOpacity> */}
//                             <TouchableOpacity
//                               style={[
//                                 styles.modalButton2,
//                                 styles.confirmButton,
//                               ]}
//                               onPress={() => handleDetailsPress()}
//                             >
//                               <Icon
//                                 name="search"
//                                 size={20}
//                                 color={COLORS.white}
//                                 style={styles.buttonIcon}
//                               />
//                               <Text></Text>
//                               <Text style={styles.modalButtonText}>
//                                 Подробнее
//                               </Text>
//                             </TouchableOpacity>
//                           </>
//                         );
//                       case "goods":
//                         return (
//                           <>
//                             <Text style={styles.detailsModalText}>
//                               Тип: Товар
//                             </Text>
//                             <Text style={styles.detailsModalText}>
//                               Название: {selectedItem.item_name}
//                             </Text>
//                             <Text style={styles.detailsModalText}>
//                               Описание:{" "}
//                               {selectedItem.description || "Не указано"}
//                             </Text>
//                             <Text style={styles.detailsModalText}>
//                               Стоимость: {selectedItem.cost} ₸
//                             </Text>
//                              <TouchableOpacity onPress={()=>{
//                                                                                  const url = selectedItem.goodLink
//                                                                                  Linking.openURL(url);
//                                                                                }}>
//                                                                                  <Text>Открыть ссылку</Text>
//                                                                      </TouchableOpacity>

//                             <Text></Text>
//                             {/* <TouchableOpacity
//                                   style={styles.detailsButton}
//                                   onPress={()=>handleDetailsPress()}
//                                 >

//                           <Text style={styles.detailsButtonText}>Подробнее</Text>
//                         </TouchableOpacity> */}
//                             <TouchableOpacity
//                               style={[
//                                 styles.modalButton2,
//                                 styles.confirmButton,
//                               ]}
//                               onPress={() => handleDetailsPress()}
//                             >
//                               <Icon
//                                 name="search"
//                                 size={20}
//                                 color={COLORS.white}
//                                 style={styles.buttonIcon}
//                               />
//                               <Text></Text>
//                               <Text style={styles.modalButtonText}>
//                                 Подробнее
//                               </Text>
//                             </TouchableOpacity>
//                           </>
//                         );
//                       case "jewelry":
//                         return (
//                           <>
//                             {/* <Text style={styles.detailsModalText}>
//                               Тип: Ювелирные изделия
//                             </Text>
//                             <Text style={styles.detailsModalText}>
//                               Магазин: {selectedItem.storeName}
//                             </Text> */}
//                             <Text style={styles.detailsModalText}>
//                               Товар: {selectedItem.itemName}
//                             </Text>
//                             <Text style={styles.detailsModalText}>
//                               Материал: {selectedItem.material}
//                             </Text>
//                             <Text style={styles.detailsModalText}>
//                               Стоимость: {selectedItem.cost} ₸
//                             </Text>
//                             <Text></Text>
//                             {/* <TouchableOpacity
//                                   style={styles.detailsButton}
//                                   onPress={()=>handleDetailsPress()}
//                                 >

//                           <Text style={styles.detailsButtonText}>Подробнее</Text>
//                         </TouchableOpacity> */}
//                             <TouchableOpacity
//                               style={[
//                                 styles.modalButton2,
//                                 styles.confirmButton,
//                               ]}
//                               onPress={() => handleDetailsPress()}
//                             >
//                               <Icon
//                                 name="search"
//                                 size={20}
//                                 color={COLORS.white}
//                                 style={styles.buttonIcon}
//                               />
//                               <Text></Text>
//                               <Text style={styles.modalButtonText}>
//                                 Подробнее
//                               </Text>
//                             </TouchableOpacity>
//                           </>
//                         );
//                       default:
//                         return (
//                           <Text style={styles.detailsModalText}>
//                             Неизвестный тип
//                           </Text>
//                         );
//                     }
//                   })()}
//                 </View>
//               ) : (
//                 <Text style={styles.detailsModalText}>
//                   Нет данных для отображения
//                 </Text>
//               )}
//             </Animatable.View>
//           </SafeAreaView>
//         </Modal>

//         <Modal
//           animationType="slide"
//           transparent={true}
//           visible={modalVisible}
//           onRequestClose={() => {
//             setModalVisible(false);
//             setWeddingName("");
//             setWeddingDate(new Date());
//             setShowDatePicker(false);
//           }}
//         >
//           <SafeAreaView style={styles.modalOverlay}>
//             <Animatable.View
//               style={styles.modalContent}
//               animation="zoomIn"
//               duration={300}
//             >
//               <ScrollView contentContainerStyle={styles.scrollViewContent}>
//                 <View style={styles.modalHeader}>
//                   <Text style={styles.modalTitle}>
//                     Создание мероприятия "Свадьба"
//                   </Text>

//                   <TouchableOpacity
//                     style={styles.addModalCloseIcon}
//                     onPress={() => {
//                       setModalVisible(false);
//                       setWeddingName("");
//                       setWeddingDate(new Date());
//                       setShowDatePicker(false);
//                     }}
//                   >
//                     <Icon name="close" size={30} color={COLORS.textSecondary} />
//                   </TouchableOpacity>

//                   <TouchableOpacity
//                     onPress={() => {
//                       setModalVisible(false);
//                       setWeddingName("");
//                       setWeddingDate(new Date());
//                       setShowDatePicker(false);
//                     }}
//                   >
//                     {/* 
//             <Text> <Icon
//               name="check"
//               size={20}
//               color={COLORS.white}
//               style={styles.buttonIcon}
//             /></Text>  */}

//                     {/* <Image
//                 source={require("../../assets/close.png")}
//                 style={styles.potIcon2}
//                 resizeMode="contain"
//               />  */}

//                     {/* <Icon name="close" size={24} color={COLORS.textSecondary} style={styles.detailsModalCloseIcon} /> 
                          
//             <Icon name="close" size={24} color={COLORS.textSecondary}  /> */}
//                   </TouchableOpacity>
//                 </View>

//                 <View style={styles.inputContainer}>
//                   <Icon
//                     name="event-note"
//                     size={20}
//                     color={COLORS.textSecondary}
//                     style={styles.inputIcon}
//                   />
//                   <TextInput
//                     style={styles.input}
//                     placeholder="Имя свадьбы (например, Свадьба Ивана и Марии)"
//                     value={weddingName}
//                     onChangeText={setWeddingName}
//                     placeholderTextColor={COLORS.textSecondary}
//                   />
//                 </View>
//                 <TouchableOpacity
//                   style={styles.dateButton}
//                   onPress={() => setShowDatePicker(true)}
//                 >
//                   <Icon
//                     name="calendar-today"
//                     size={20}
//                     color={COLORS.secondary}
//                     style={styles.buttonIcon}
//                   />
//                   <Text style={styles.dateButtonText}>
//                     {weddingDate.toLocaleDateString("ru-RU") ||
//                       "Выберите дату свадьбы"}
//                   </Text>
//                 </TouchableOpacity>
//                 {showDatePicker && (
//                   <Calendar
//                     style={styles.calendar}
//                     current={weddingDate.toISOString().split("T")[0]}
//                     onDayPress={onDateChange}
//                     minDate={new Date().toISOString().split("T")[0]}
//                     theme={{
//                       selectedDayBackgroundColor: COLORS.primary,
//                       todayTextColor: COLORS.accent,
//                       arrowColor: COLORS.secondary,
//                       textDayFontSize: 16,
//                       textMonthFontSize: 18,
//                       textDayHeaderFontSize: 14,
//                     }}
//                   />
//                 )}
//                 <Text style={styles.subtitle}>Выбранные элементы:</Text>
//                 <View style={styles.itemsContainer}>
//                   {filteredData.length > 0 ? (
//                     Object.entries(
//                       filteredData.reduce((acc, item) => {
//                         const type = item.type;
//                         if (!acc[type]) acc[type] = [];
//                         acc[type].push(item);
//                         return acc;
//                       }, {})
//                     )
//                       .sort(
//                         ([typeA], [typeB]) =>
//                           (typeOrder[typeA] || 11) - (typeOrder[typeB] || 11)
//                       )
//                       .map(([type, items]) => (
//                         <View key={type}>
//                           <Text style={styles.categoryHeader}>
//                             {typesMapping.find((t) => t.type === type)?.label ||
//                               type}{" "}
//                             ({items.length})
//                           </Text>
//                           {items.map((item) => {
//                             const quantity = parseInt(
//                               quantities[`${item.type}-${item.id}`] || "1"
//                             );
//                             const cost =
//                               item.type === "restaurant"
//                                 ? item.averageCost
//                                 : item.cost;
//                             const effectiveQuantity =
//                               item.type === "restaurant"
//                                 ? parseInt(guestCount, 10) || 1
//                                 : quantity;
//                             const totalItemCost = cost * effectiveQuantity;
//                             return (
//                               <View
//                                 key={`${item.type}-${item.id}`}
//                                 style={styles.itemContainer}
//                               >
//                                 <Icon
//                                   name={
//                                     item.type === "restaurant"
//                                       ? "restaurant"
//                                       : item.type === "clothing"
//                                       ? "store"
//                                       : item.type === "tamada"
//                                       ? "mic"
//                                       : item.type === "program"
//                                       ? "event"
//                                       : item.type === "traditionalGift"
//                                       ? "card-giftcard"
//                                       : item.type === "flowers"
//                                       ? "local-florist"
//                                       : item.type === "cake"
//                                       ? "cake"
//                                       : item.type === "alcohol"
//                                       ? "local-drink"
//                                       : item.type === "transport"
//                                       ? "directions-car"
//                                       : item.type === "jewelry"
//                                       ? "diamond"
//                                       : "shopping-bag"
//                                   }
//                                   size={18}
//                                   color={COLORS.primary}
//                                   style={styles.itemIcon}
//                                 />
//                                 <Text style={styles.itemText}>
//                                   {(() => {
//                                     switch (item.type) {
//                                       case "restaurant":
//                                         return `${item.name} (${item.cuisine}) - ${cost} тг x ${effectiveQuantity} гостей = ${totalItemCost} тг`;
//                                       case "clothing":
//                                         return `${item.itemName} (${item.storeName}) - ${cost} тг x ${effectiveQuantity} = ${totalItemCost} тг`;
//                                       case "tamada":
//                                         return `${item.name} - ${cost} тг x ${effectiveQuantity} = ${totalItemCost} тг`;
//                                       case "program":
//                                         return `${item.teamName} - ${cost} тг x ${effectiveQuantity} = ${totalItemCost} тг`;
//                                       case "traditionalGift":
//                                         return `${item.itemName} (${
//                                           item.salonName || "Не указано"
//                                         }) - ${cost} тг x ${effectiveQuantity} = ${totalItemCost} тг`; // Fixed typo here
//                                       case "flowers":
//                                         return `${item.flowerName} (${item.flowerType}) - ${cost} тг x ${effectiveQuantity} = ${totalItemCost} тг`;
//                                       case "cake":
//                                         return `${item.name} (${item.cakeType}) - ${cost} тг x ${effectiveQuantity} = ${totalItemCost} тг`;
//                                       case "alcohol":
//                                         return `${item.alcoholName} (${item.category}) - ${cost} тг x ${effectiveQuantity} = ${totalItemCost} тг`;
//                                       case "transport":
//                                         return `${item.carName} (${item.brand}) - ${cost} тг x ${effectiveQuantity} = ${totalItemCost} тг`;
//                                       case "goods":
//                                         return `${item.item_name} - ${cost} тг x ${effectiveQuantity} = ${totalItemCost} тг`;
//                                       case "jewelry":
//                                         return `${item.itemName} (${item.storeName}) - ${cost} тг x ${effectiveQuantity} = ${totalItemCost} тг`;
//                                       default:
//                                         return "Неизвестный элемент";
//                                     }
//                                   })()}
//                                 </Text>
//                               </View>
//                             );
//                           })}
//                         </View>
//                       ))
//                   ) : (
//                     <Text style={styles.noItems}>
//                       Выберите элементы для свадьбы
//                     </Text>
//                   )}
//                 </View>
//                 <View style={styles.totalContainer}>
//                   <Text style={styles.totalText}>
//                     Общая стоимость:{" "}
//                     {calculateTotalCost().toLocaleString("ru-RU")} тг
//                   </Text>
//                 </View>

//                 <Text style={styles.totalText}>
//                   {filteredData.length > 0
//                     ? `Ваш бюджет (${parseFloat(budget).toLocaleString(
//                         "ru-RU"
//                       )} ₸)`
//                     : " "}
//                 </Text>

//                 {filteredData.length > 0 && (
//                   <Text
//                     style={[
//                       styles.budgetInfo,
//                       remainingBudget < 0 && styles.budgetError,
//                     ]}
//                   >
//                     Остаток: {remainingBudget.toLocaleString("ru-RU")} ₸{" "}
//                     {remainingBudget < 0 && "(превышение)"}
//                   </Text>
//                 )}
//                 <Text></Text>

//                 <View style={styles.modalButtonContainer}>
//                   <TouchableOpacity
//                     style={[styles.modalButton, styles.confirmButton]}
//                     onPress={handleSubmit}
//                   >
//                     <Icon
//                       name="check"
//                       size={20}
//                       color={COLORS.white}
//                       style={styles.buttonIcon}
//                     />
//                     <Text style={styles.modalButtonText}>Создать свадьбу</Text>
//                   </TouchableOpacity>
               
//                 </View>
//               </ScrollView>
//             </Animatable.View>
//           </SafeAreaView>
//         </Modal>
//       </LinearGradient>
//     </>
//   );
// };

// const styles = StyleSheet.create({
//   loaderOverlay: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "rgba(0, 0, 0, 0.6)", // Полупрозрачный фон
//   },
//   loaderContainer: {
//     backgroundColor: COLORS.card,
//     borderRadius: 15,
//     padding: 20,
//     alignItems: "center",
//     shadowColor: COLORS.shadow,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 5,
//   },
//   loaderText: {
//     marginTop: 10,
//     fontSize: 16,
//     color: COLORS.textPrimary,
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
//     marginBottom: "10$",
//   },
//   categoryButton: {
//     flex: 1,
//     height: 50,
//     borderRadius: 10,
//     overflow: "hidden",
//     shadowColor: COLORS.shadow,
//     shadowOffset: { width: 0, height: 5 },
//     shadowOpacity: 0.5,
//     shadowRadius: 8,
//     elevation: 5,
//     marginVertical: 2,
//     width: 20, // Уменьшаем ширину кнопки, так как теперь только "+"
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
//     fontSize: 24, // Увеличиваем размер символа "+"
//     color: COLORS.white,
//     fontWeight: "bold",
//   },
//   // Удаляем или оставляем categoryText, если он используется в других местах
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
//   // headerContainer: {
//   //   paddingHorizontal: 20,
//   //   backgroundColor: "transparent",
//   //   flexDirection: "row",
//   //   justifyContent: "space-between",
//   //   alignItems: "center",
//   // },
//   // budgetContainer: { flexDirection: "row", alignItems: "center" },
//   // budgetInput: {
//   //   backgroundColor: "rgba(255, 255, 255, 0.2)",
//   //   color: "#FFF",
//   //   paddingVertical: 8,
//   //   paddingHorizontal: 15,
//   //   borderRadius: 20,
//   //   marginRight: 10,
//   //   width: 120,
//   //   fontSize: 16,
//   // },
//   // guestInput: {
//   //   backgroundColor: "rgba(255, 255, 255, 0.2)",
//   //   color: "#FFF",
//   //   paddingVertical: 8,
//   //   paddingHorizontal: 15,
//   //   borderRadius: 20,
//   //   width: 80,
//   //   fontSize: 16,
//   // },

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
//   categoryItemAdd: {
//     width: "20%", // Adjusted width for the Add button
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
//     flex: 1,
//     backgroundColor: "rgba(255, 255, 255, 0.2)",
//     borderRadius: 10,
//     padding: 10,
//     color: COLORS.white,
//     fontSize: 16,
//   },

//   logoContainer: { alignItems: "center", marginVertical: 0, marginTop: "0%", },
//   potIcon: { width: 150, height: 150 },
//   potIcon2: { width: 50, height: 50 },
//   potIcon3: { width: 70, height: 70, zIndex: 3 },
//   listContainer: { flex: 1, paddingHorizontal: 20 },
//   scrollView: { flex: 1 },
//   categoryGrid: {
//     flexDirection: "column",
//     alignItems: "center",
//   },
//   categoryItem: {
//     width: "100%",
//     padding: 2,
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   categoryItem2: {
//     width: "35%",
//     // padding: 2,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   // categoryRow: {
//   //   flexDirection: "row",
//   //   alignItems: "center",
//   //   width: "100%",
//   //   marginVertical: 0,

//   // },
//   // removeCategoryButton: {
//   //   padding: 0,
//   //   marginRight: 10,
//   //   marginTop:20
//   // },

//   categoryRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 10,
//   },
//   removeCategoryButton: {
//     marginRight: 10,
//   },

//   categoryButtonGradient: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     borderWidth: 2,
//     borderColor: "#5A4032",
//     borderRadius: 10,
//   },
//   categoryText: {
//     fontSize: 16,
//     color: COLORS.white,
//     fontWeight: "600",
//     textAlign: "center",
//     paddingHorizontal: 10,
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
//   nextButtonText: {
//     fontSize: 18,
//     color: COLORS.white,
//     fontWeight: "600",
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0, 0, 0, 0.5)",
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   addModalContainer: {
//     backgroundColor: COLORS.card,
//     borderRadius: 20,
//     width: "90%",
//     maxHeight: SCREEN_HEIGHT * 0.8,
//     padding: 20,
//     shadowColor: COLORS.shadow,
//     shadowOffset: { width: 0, height: 5 },
//     shadowOpacity: 0.3,
//     shadowRadius: 10,
//     elevation: 5,
//     flex: 1,
//   },
//   addModalHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 15,
//   },
//   addModalTitle: { fontSize: 20, fontWeight: "600", color: COLORS.textPrimary },
  
//   addModalCloseIcon: {  
//      color: COLORS.white,
//     fontSize: 16,
//     fontWeight: '600',},

//   // closeButtonText: {
  
//   // },

//   addModalSearchContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#F7F7F7",
//     borderRadius: 10,
//     paddingHorizontal: 15,
//     marginBottom: 15,
//   },
//   addModalSearchIcon: { marginRight: 10 },
//   addModalSearchInput: {
//     flex: 1,
//     paddingVertical: 10,
//     fontSize: 16,
//     color: COLORS.textPrimary,
//   },
//   addModalClearIcon: { padding: 5 },
//   addModalFilterScroll: { maxHeight: SCREEN_HEIGHT * 0.2, marginBottom: 15 },
//   addModalFilterContainer: { paddingBottom: 10 },
//   addModalFilterLabel: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: COLORS.textPrimary,
//     marginBottom: 10,
//   },
//   addModalTypeFilterContainer: { marginBottom: 15 },
//   addModalTypeButtons: { flexDirection: "row", flexWrap: "wrap" },
//   addModalTypeButton: {
//     backgroundColor: "#F7F7F7",
//     paddingVertical: 8,
//     paddingHorizontal: 15,
//     borderRadius: 20,
//     marginRight: 10,
//     marginBottom: 10,
//   },
//   addModalTypeButtonActive: { backgroundColor: COLORS.primary },
//   addModalTypeButtonText: { fontSize: 14, color: COLORS.textPrimary },
//   addModalTypeButtonTextActive: { color: COLORS.white },
//   addModalDistrictFilterContainer: { marginBottom: 15 },
//   addModalDistrictButtons: { flexDirection: "row", flexWrap: "wrap" },
//   addModalDistrictButton: {
//     backgroundColor: "#F7F7F7",
//     paddingVertical: 8,
//     paddingHorizontal: 15,
//     borderRadius: 20,
//     marginRight: 10,
//     marginBottom: 10,
//   },
//   addModalDistrictButtonActive: { backgroundColor: COLORS.primary },
//   addModalDistrictButtonText: { fontSize: 14, color: COLORS.textPrimary },
//   addModalDistrictButtonTextActive: { color: COLORS.white },
//   addModalPriceFilterContainer: { marginBottom: 15 },
//   addModalPriceButtons: { flexDirection: "row", flexWrap: "wrap" },
//   addModalPriceButton: {
//     backgroundColor: "#F7F7F7",
//     paddingVertical: 8,
//     paddingHorizontal: 15,
//     borderRadius: 20,
//     marginRight: 10,
//     marginBottom: 10,
//   },
//   addModalPriceButtonActive: { backgroundColor: COLORS.primary },
//   addModalPriceButtonText: { fontSize: 14, color: COLORS.textPrimary },
//   addModalPriceButtonTextActive: { color: COLORS.white },
//   addModalScrollView: { flex: 1, minHeight: 100 },
//   addModalItemList: { paddingBottom: 20, flexGrow: 1 },

//   addModalItemCard: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#FFFFFF",
//     borderRadius: 12,
//     padding: 16,
//     marginVertical: 8,
//     marginHorizontal: 16,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 3,
//   },
//   addModalItemContent: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingRight: 12,
//   },
//   disabledItemContent: {
//     opacity: 0.6,
//   },
//   addModalItemText: {
//     fontSize: 15,
//     fontWeight: "500",
//     color: "#1A1A1A",
//     flex: 1,
//     marginRight: 8,
//   },
//   addModalItemCount: {
//     fontSize: 13,
//     fontWeight: "400",
//     color: "#4B5563",
//   },
//   actions: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   actionButton: {
//     padding: 8,
//     borderRadius: 8,
//     backgroundColor: "#F1F5F9",
//     marginLeft: 8,
//   },
//   disabledActionButton: {
//     backgroundColor: "#F1F5F9",
//     opacity: 0.6,
//   },

//   card: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 16,
//     padding: 20,
//     marginVertical: 12,
//     marginHorizontal: 16,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.08,
//     shadowRadius: 12,
//     elevation: 5,
//   },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "flex-start",
//     marginBottom: 16,
//   },
//   titleText: {
//     fontSize: 17,
//     fontWeight: "600",
//     color: "#1A1A1A",
//     flex: 1,
//     lineHeight: 24,
//   },
//   actions: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   actionButton: {
//     padding: 10,
//     borderRadius: 10,
//     backgroundColor: "#F1F5F9",
//     marginLeft: 8,
//   },
//   controlRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginBottom: 16,
//     paddingHorizontal: 4,
//     fontSize: 10,
//   },
//   label: {
//     fontSize: 15,
//     fontWeight: "500",
//     color: "#4B5563",
//     marginRight: 12,
//   },
//   quantityContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#F8FAFC",
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: "#E5E7EB",
//     paddingHorizontal: 4,
//     flex: 1,
//   },
//   quantityButton: {
//     padding: 10,
//     paddingHorizontal: 1,
//   },
//   input: {
//     width: 56,
//     height: 40,
//     fontSize: 15,
//     fontWeight: "500",
//     color: "#1A1A1A",
//     textAlign: "center",
//     backgroundColor: "#FFFFFF",
//     borderRadius: 8,
//     marginHorizontal: 4,
//   },
//   totalCost: {
//     flexDirection: "start",
//     alignItems: "center",
//     fontSize: 15,
//     fontWeight: "600",
//     color: "#26A69A",
//     marginLeft: 12,
//   },

//   selectedItemCard: { backgroundColor: "#E6F0FA" },
//   addModalItemContent: { flex: 1, paddingRight: 10 },
//   disabledItemContent: { opacity: 0.5 },
//   addModalItemText: {
//     fontSize: 16,
//     color: COLORS.textPrimary,
//     flex: 1,
//   },
//   addModalItemCount: {
//     fontSize: 14,
//     color: COLORS.primary,
//     marginLeft: 10,
//   },
//   addModalDetailsButton: {
//     backgroundColor: COLORS.secondary,
//     paddingVertical: 8,
//     paddingHorizontal: 15,
//     borderRadius: 10,
//   },
//   addModalDetailsButtonText: {
//     fontSize: 14,
//     color: COLORS.white,
//     fontWeight: "600",
//   },
//   addModalEmptyText: {
//     fontSize: 16,
//     color: COLORS.textSecondary,
//     textAlign: "center",
//     marginTop: 20,
//   },
//   selectedItemContainer: {
//     marginBottom: 20,
//   },
//   categoryHeader: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: COLORS.textPrimary,
//     marginBottom: 10,
//   },
//   // quantityContainer: {
//   //   flexDirection: "row",
//   //   alignItems: "center",
//   //   marginTop: 10,
//   // },
//   quantityLabel: {
//     fontSize: 14,
//     color: COLORS.textPrimary,
//     marginRight: 10,
//   },
//   quantityInput: {
//     width: 50,
//     height: 30,
//     borderWidth: 1,
//     borderColor: COLORS.textSecondary,
//     borderRadius: 5,
//     textAlign: "center",
//     marginHorizontal: 10,
//     fontSize: 14,
//     color: COLORS.textPrimary,
//   },
//   totalCostText: {
//     fontSize: 14,
//     color: COLORS.textPrimary,
//     marginLeft: 10,
//   },
//   removeButton: {
//     backgroundColor: COLORS.error,
//     // paddingVertical: 8,
//     // paddingHorizontal: 75,
//     borderRadius: 10,
//     // marginLeft:'40%'
//   },
//   removeButtonText: {
//     fontSize: 14,
//     color: COLORS.white,
//     fontWeight: "600",
//   },
//   detailsModalContainer: {
//     backgroundColor: COLORS.card,
//     borderRadius: 20,
//     width: "90%",
//     padding: 20,
//     shadowColor: COLORS.shadow,
//     shadowOffset: { width: 0, height: 5 },
//     shadowOpacity: 0.3,
//     shadowRadius: 10,
//     elevation: 5,
//   },
//   detailsModalHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 15,
//   },
//   detailsModalTitle: {
//     fontSize: 20,
//     fontWeight: "600",
//     color: COLORS.textPrimary,
//   },
//   detailsModalCloseIcon: { padding: 5 },

//   detailsModalContent: {
//     marginBottom: 20,
//   },
//   detailsModalText: {
//     fontSize: 16,
//     color: COLORS.textPrimary,
//     marginBottom: 10,
//   },
//   modalContent: {
//     backgroundColor: COLORS.card,
//     borderRadius: 20,
//     width: "90%",
//     maxHeight: SCREEN_HEIGHT * 0.8,
//     padding: 20,
//     shadowColor: COLORS.shadow,
//     shadowOffset: { width: 0, height: 5 },
//     shadowOpacity: 0.3,
//     shadowRadius: 10,
//     elevation: 5,
//   },
//   scrollViewContent: {
//     paddingBottom: 20,
//   },
//   modalHeader: {
//     flexDirection: "row",
//     alignItems: "space-between",
//     marginBottom: 20,
//     marginTop: 10,
//     justifyContent: "center",
//   },
//   modalTitle: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: COLORS.textPrimary,
//   },
//   inputContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#F7F7F7",
//     borderRadius: 10,
//     paddingHorizontal: 15,
//     marginBottom: 15,
//   },
//   inputIcon: { marginRight: 10 },
//   input: {
//     flex: 1,
//     paddingVertical: 10,
//     fontSize: 16,
//     color: COLORS.textPrimary,
//   },
//   dateButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#F7F7F7",
//     borderRadius: 10,
//     padding: 15,
//     marginBottom: 15,
//   },
//   buttonIcon: { marginRight: 10 },
//   dateButtonText: {
//     fontSize: 16,
//     color: COLORS.textPrimary,
//   },
//   calendar: {
//     borderRadius: 10,
//     marginBottom: 15,
//   },
//   subtitle: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: COLORS.textPrimary,
//     marginBottom: 10,
//   },
//   itemsContainer: {
//     marginBottom: 20,
//   },
//   itemContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#F7F7F7",
//     borderRadius: 10,
//     padding: 10,
//     marginBottom: 10,
//   },
//   itemIcon: { marginRight: 10 },
//   itemText: {
//     fontSize: 16,
//     color: COLORS.textPrimary,
//     flex: 1,
//   },
//   noItems: {
//     fontSize: 16,
//     color: COLORS.textSecondary,
//     textAlign: "center",
//   },
//   totalContainer: {
//     marginBottom: 10,
//   },
//   totalText: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: COLORS.textPrimary,
//   },
//   budgetInfo: {
//     fontSize: 16,
//     color: COLORS.textPrimary,
//   },
//   budgetError: {
//     color: COLORS.error,
//   },
//   modalButtonContainer: {
//     flexDirection: "row",
//     justifyContent: "center",
//     marginTop: 20,
//   },
//   modalButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     borderRadius: 10,
//     marginHorizontal: 10,
//   },
//   modalButton2: {
//     flexDirection: "row",
//     alignItems: "left",
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     borderRadius: 10,
//     marginHorizontal: 20,
//   },
//   confirmButton: {
//     backgroundColor: COLORS.primary,
//   },
//   modalButtonText: {
//     fontSize: 16,
//     color: COLORS.white,
//     fontWeight: "600",
//     marginLeft: 5,
//   },
// });

// export default CreateEventScreen;







// // import React, {
// //   useState,
// //   useRef,
// //   useEffect,
// //   useCallback,
// //   useMemo,
// // } from "react";
// // import {
// //   View,
// //   Image,
// //   StyleSheet,
// //   TouchableOpacity,
// //   Text,
// //   Dimensions,
// //   FlatList,
// //   Modal,
// //   TextInput,
// //   ActivityIndicator,
// //   ScrollView,
// //   SafeAreaView,
// //   Keyboard,
// //   Platform,
// //   Alert,
// // } from "react-native";
// // import { LinearGradient } from "expo-linear-gradient";
// // import AntDesign from "@expo/vector-icons/AntDesign";
// // import { useDispatch, useSelector } from "react-redux";
// // import api from "../api/api"; // Replace with your correct path to api.js
// // import { debounce } from "lodash"; // Added for debouncing
// // import * as Haptics from "expo-haptics";
// // import * as Linking from "expo-linking";
// // import { Calendar } from "react-native-calendars";
// // import Icon from "react-native-vector-icons/MaterialIcons";
// // import IconMCI from "react-native-vector-icons/MaterialCommunityIcons";

// // // Replace with your correct path to theme.js
// // import { COLORS, SIZES, FONTS } from "../constants/theme";

// // const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

// // // --- Constants and Mappings ---
// // const typeOrder = {
// //   restaurant: 1,
// //   clothing: 2,
// //   tamada: 3,
// //   program: 4,
// //   traditionalGift: 5,
// //   flowers: 6,
// //   transport: 7,
// //   cake: 8,
// //   alcohol: 9,
// //   goods: 10,
// //   jewelry: 11,
// // };

// // const typesMapping = [
// //   { key: "clothing", costField: "cost", type: "clothing", label: "Свадебный салон" },
// //   { key: "tamada", costField: "cost", type: "tamada", label: "Ведущий" },
// //   { key: "programs", costField: "cost", type: "program", label: "Шоу программа" },
// //   { key: "traditionalGifts", costField: "cost", type: "traditionalGift", label: "Традиционные подарки" },
// //   { key: "flowers", costField: "cost", type: "flowers", label: "Цветы" },
// //   { key: "cakes", costField: "cost", type: "cake", label: "Торты" },
// //   { key: "alcohol", costField: "cost", type: "alcohol", label: "Алкоголь" },
// //   { key: "transport", costField: "cost", type: "transport", label: "Прокат авто" },
// //   { key: "restaurants", costField: "averageCost", type: "restaurant", label: "Ресторан" },
// //   { key: "jewelry", costField: "cost", type: "jewelry", label: "Ювелирные изделия" },
// //   { key: "goods", costField: "cost", type: "goods", label: "Товары" },
// // ];

// // const categoryToTypeMap = {
// //   Ведущий: "tamada",
// //   Ресторан: "restaurant",
// //   Алкоголь: "alcohol",
// //   "Шоу программа": "program",
// //   "Ювелирные изделия": "jewelry",
// //   "Традиционные подарки": "traditionalGift",
// //   "Свадебный салон": "clothing",
// //   "Прокат авто": "transport",
// //   Торты: "cake",
// //   Цветы: "flowers",
// // };

// // const typeToCategoryMap = Object.fromEntries(
// //   Object.entries(categoryToTypeMap).map(([category, type]) => [type, category])
// // );

// // const getItemDisplayTitle = (item, forQuickDetails = false) => {
// //   if (!item) return "Нет данных";
// //   const cost = item.type === "restaurant" ? item.averageCost : item.cost;
// //   const costString = cost !== undefined && cost !== null ? ` (${cost} ₸)` : " (Цена не указана)";

// //   if (forQuickDetails) {
// //     return (
// //       item.name ||
// //       item.itemName ||
// //       item.storeName ||
// //       item.salonName ||
// //       item.teamName ||
// //       item.item_name ||
// //       "N/A"
// //     );
// //   }
// //   let baseName =
// //     item.name ||
// //     item.itemName ||
// //     item.teamName ||
// //     item.item_name ||
// //     "Не указано";
// //   if (item.type === "clothing" || item.type === "jewelry" || item.type === "traditionalGift") {
// //     baseName = `${item.storeName || item.salonName || "Магазин не указан"} - ${
// //       item.itemName || "Товар не указан"
// //     }`;
// //   } else if (item.type === "flowers") {
// //     baseName = `${item.salonName || "Салон не указан"} - ${
// //       item.flowerName || "Цветы не указаны"
// //     }`;
// //   } else if (item.type === "alcohol") {
// //     baseName = `${item.salonName || "Магазин не указан"} - ${
// //       item.alcoholName || "Напиток не указан"
// //     }`;
// //   } else if (item.type === "transport") {
// //     baseName = `${item.salonName || "Компания не указана"} - ${
// //       item.carName || "Авто не указано"
// //     }`;
// //   }

// //   const typeLabel = typesMapping.find((t) => t.type === item.type)?.label || item.type || "Категория";
// //   return `${typeLabel}: ${baseName}${costString}`;
// // };

// // // --- Styled Components for Modals ---
// // const ThemedModalHeader = ({ title, onClose }) => (
// //   <View style={modalStyles.header}>
// //     <Text style={modalStyles.title} numberOfLines={1} ellipsizeMode="tail">
// //       {title}
// //     </Text>
// //     <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
// //       <Icon name="close" size={SIZES.h2 + 2} color={COLORS.textSecondary} />
// //     </TouchableOpacity>
// //   </View>
// // );

// // const ThemedModalButton = ({
// //   title,
// //   onPress,
// //   type = "primary",
// //   iconName,
// //   style,
// //   disabled,
// //   textStyle,
// // }) => (
// //   <TouchableOpacity
// //     style={[
// //       modalStyles.buttonBase,
// //       type === "primary"
// //         ? modalStyles.buttonPrimary
// //         : modalStyles.buttonSecondary,
// //       disabled && modalStyles.buttonDisabled,
// //       style,
// //     ]}
// //     onPress={onPress}
// //     disabled={disabled}
// //   >
// //     {iconName && (
// //       <Icon
// //         name={iconName}
// //         size={SIZES.h3}
// //         color={
// //           disabled
// //             ? COLORS.textLight
// //             : type === "primary"
// //             ? COLORS.buttonTextAndIcon
// //             : COLORS.modalButtonSecondaryText
// //         }
// //         style={{ marginRight: SIZES.padding / 2 }}
// //       />
// //     )}
// //     <Text
// //       style={[
// //         type === "primary"
// //           ? modalStyles.buttonPrimaryText
// //           : modalStyles.buttonSecondaryText,
// //         disabled && modalStyles.buttonTextDisabled,
// //         textStyle,
// //       ]}
// //     >
// //       {title}
// //     </Text>
// //   </TouchableOpacity>
// // );

// // const ThemedModalTextInput = (props) => (
// //   <View style={modalStyles.textInputContainer}>
// //     {props.iconName && (
// //       <Icon
// //         name={props.iconName}
// //         size={SIZES.h3}
// //         color={COLORS.textSecondary}
// //         style={modalStyles.textInputIcon}
// //       />
// //     )}
// //     <TextInput
// //       style={modalStyles.textInput}
// //       placeholderTextColor={COLORS.textLight}
// //       {...props}
// //     />
// //   </View>
// // );

// // // --- Modal Components ---

// // // AddItemModal
// // const AddItemModal = ({
// //   visible,
// //   onClose,
// //   filteredItems,
// //   handleAddItem,
// //   setDetailsModalVisible,
// //   setSelectedItem,
// //   updateCategories,
// // }) => {
// //   const [searchQuery, setSearchQuery] = useState("");
// //   const [selectedTypeFilter, setSelectedTypeFilter] = useState("all");
// //   const [selectedDistrict, setSelectedDistrict] = useState("all");
// //   const [selectedCostRange, setSelectedCostRange] = useState("all");

// //   useEffect(() => {
// //     if (visible) {
// //       setSearchQuery("");
// //       setSelectedTypeFilter("all");
// //       setSelectedDistrict("all");
// //       setSelectedCostRange("all");
// //     }
// //   }, [visible]);

// //   const debouncedSearch = useCallback(
// //     debounce((query) => {
// //       setSearchQuery(query);
// //     }, 300),
// //     []
// //   );

// //   const handleSearchChange = (text) => {
// //     debouncedSearch(text);
// //   };

// //   const uniqueTypes = useMemo(() => {
// //     const types = [{ type: "all", label: "Все" }];
// //     const itemTypes = new Set();
// //     if (Array.isArray(filteredItems)) {
// //       filteredItems.forEach((item) => {
// //         if (item && item.type && !itemTypes.has(item.type)) {
// //           const mapping = typesMapping.find((t) => t.type === item.type);
// //           types.push({ type: item.type, label: mapping ? mapping.label : item.type });
// //           itemTypes.add(item.type);
// //         }
// //       });
// //     }
// //     return types.sort((a, b) => (typeOrder[a.type] || 99) - (typeOrder[b.type] || 99));
// //   }, [filteredItems]);

// //   const districts = useMemo(() => {
// //     if (!Array.isArray(filteredItems)) return ["all"];
// //     return ["all", ...new Set(filteredItems.map((item) => item && String(item.district)).filter(Boolean).sort())];
// //   }, [filteredItems]);

// //   const filteredDataMemo = useMemo(() => {
// //     if (!Array.isArray(filteredItems)) return [];
// //     let result = filteredItems;
// //     if (searchQuery) {
// //       const lowerSearchQuery = searchQuery.toLowerCase();
// //       result = result.filter((item) =>
// //         Object.values(item).some((value) =>
// //           String(value).toLowerCase().includes(lowerSearchQuery)
// //         )
// //       );
// //     }
// //     if (selectedTypeFilter !== "all") result = result.filter((item) => item.type === selectedTypeFilter);
// //     if (selectedDistrict !== "all") result = result.filter((item) => String(item.district) === selectedDistrict);
// //     if (selectedCostRange !== "all") {
// //       result = result.filter((item) => {
// //         const cost = item.averageCost || item.cost;
// //         if (cost === undefined || cost === null) return false;
// //         if (selectedCostRange === "0-10000") return cost <= 10000;
// //         if (selectedCostRange === "10000-50000") return cost > 10000 && cost <= 50000;
// //         if (selectedCostRange === "50000+") return cost > 50000;
// //         return true;
// //       });
// //     }
// //     return result.sort((a, b) => (typeOrder[a.type] || 99) - (typeOrder[b.type] || 99));
// //   }, [filteredItems, searchQuery, selectedTypeFilter, selectedDistrict, selectedCostRange]);

// //   const renderAddItem = useCallback(
// //     ({ item }) => {
// //       const displayTitle = getItemDisplayTitle(item);
// //       return (
// //         <View style={modalStyles.listItemContainer}>
// //           <Text style={modalStyles.listItemText} numberOfLines={2}>
// //             {displayTitle}
// //           </Text>
// //           <View style={{ flexDirection: "row", alignItems: "center" }}>
// //             <TouchableOpacity
// //               style={modalStyles.actionButtonSmall}
// //               onPress={() => {
// //                 handleAddItem(item);
// //                 const category = typeToCategoryMap[item.type];
// //                 if (category) updateCategories(category);
// //               }}
// //             >
// //               <Icon name="add-circle-outline" size={SIZES.h2} color={COLORS.primary} />
// //             </TouchableOpacity>
// //             <TouchableOpacity
// //               style={[modalStyles.actionButtonSmall, { marginLeft: SIZES.padding / 2 }]}
// //               onPress={() => {
// //                 setSelectedItem(item);
// //                 setDetailsModalVisible(true);
// //               }}
// //             >
// //               <Icon name="info-outline" size={SIZES.h2} color={COLORS.textSecondary} />
// //             </TouchableOpacity>
// //           </View>
// //         </View>
// //       );
// //     },
// //     [handleAddItem, setSelectedItem, setDetailsModalVisible, updateCategories]
// //   );

// //   const costRanges = [
// //     { label: "Все цены", value: "all" },
// //     { label: "До 10k", value: "0-10000" },
// //     { label: "10k-50k", value: "10000-50000" },
// //     { label: "От 50k", value: "50000+" },
// //   ];

// //   const handleClose = () => {
// //     Keyboard.dismiss(); // Убираем фокус с любых активных полей
// //     onClose(); // Вызываем функцию закрытия из родителя
// //   };

// //   return (
// //     <Modal
// //       visible={visible}
// //       transparent
// //       animationType="slide"
// //       onRequestClose={handleClose} // Принудительное закрытие при нажатии вне модального окна
// //     >
// //       <SafeAreaView style={modalStyles.overlay}>
// //         <View style={[modalStyles.container, { maxHeight: SCREEN_HEIGHT * 0.95 }]}>
// //           <ThemedModalHeader title="Добавить элемент в смету" onClose={handleClose} />
// //           <ThemedModalTextInput
// //             placeholder="Поиск по названию, типу..."
// //             value={searchQuery}
// //             onChangeText={handleSearchChange}
// //             iconName="search"
// //           />
// //           <View style={modalStyles.filterSection}>
// //             <Text style={modalStyles.filterLabel}>Тип:</Text>
// //             <ScrollView
// //               horizontal
// //               showsHorizontalScrollIndicator={false}
// //               style={modalStyles.filterScrollContainer}
// //             >
// //               {uniqueTypes.map((typeObj) => (
// //                 <TouchableOpacity
// //                   key={typeObj.type}
// //                   style={[
// //                     modalStyles.filterButton,
// //                     selectedTypeFilter === typeObj.type && modalStyles.filterButtonActive,
// //                   ]}
// //                   onPress={() => setSelectedTypeFilter(typeObj.type)}
// //                 >
// //                   <Text
// //                     style={[
// //                       modalStyles.filterButtonText,
// //                       selectedTypeFilter === typeObj.type && modalStyles.filterButtonTextActive,
// //                     ]}
// //                   >
// //                     {typeObj.label}
// //                   </Text>
// //                 </TouchableOpacity>
// //               ))}
// //             </ScrollView>
// //             {districts.length > 1 && (
// //               <>
// //                 <Text style={modalStyles.filterLabel}>Район:</Text>
// //                 <ScrollView
// //                   horizontal
// //                   showsHorizontalScrollIndicator={false}
// //                   style={modalStyles.filterScrollContainer}
// //                 >
// //                   {districts.map((district) => (
// //                     <TouchableOpacity
// //                       key={district}
// //                       style={[
// //                         modalStyles.filterButton,
// //                         selectedDistrict === district && modalStyles.filterButtonActive,
// //                       ]}
// //                       onPress={() => setSelectedDistrict(district)}
// //                     >
// //                       <Text
// //                         style={[
// //                           modalStyles.filterButtonText,
// //                           selectedDistrict === district && modalStyles.filterButtonTextActive,
// //                         ]}
// //                       >
// //                         {district === "all" ? "Все районы" : district}
// //                       </Text>
// //                     </TouchableOpacity>
// //                   ))}
// //                 </ScrollView>
// //               </>
// //             )}
// //             <Text style={modalStyles.filterLabel}>Цена:</Text>
// //             <ScrollView
// //               horizontal
// //               showsHorizontalScrollIndicator={false}
// //               style={modalStyles.filterScrollContainer}
// //             >
// //               {costRanges.map((option) => (
// //                 <TouchableOpacity
// //                   key={option.value}
// //                   style={[
// //                     modalStyles.filterButton,
// //                     selectedCostRange === option.value && modalStyles.filterButtonActive,
// //                   ]}
// //                   onPress={() => setSelectedCostRange(option.value)}
// //                 >
// //                   <Text
// //                     style={[
// //                       modalStyles.filterButtonText,
// //                       selectedCostRange === option.value && modalStyles.filterButtonTextActive,
// //                     ]}
// //                   >
// //                     {option.label}
// //                   </Text>
// //                 </TouchableOpacity>
// //               ))}
// //             </ScrollView>
// //           </View>
// //           <FlatList
// //             data={filteredDataMemo}
// //             renderItem={renderAddItem}
// //             keyExtractor={(item, index) => `${item.type}-${item.id}-${index}`}
// //             ListEmptyComponent={<Text style={modalStyles.emptyListText}>Ничего не найдено</Text>}
// //             contentContainerStyle={{ paddingBottom: SIZES.padding }}
// //             initialNumToRender={10}
// //             windowSize={5}
// //             removeClippedSubviews={true}
// //           />
// //         </View>
// //       </SafeAreaView>
// //     </Modal>
// //   );
// // };

// // // SelectedItem (for CategoryItemsModal)
// // const SelectedItem = ({
// //   item,
// //   quantities,
// //   setQuantities,
// //   filteredData,
// //   setFilteredData,
// //   budget,
// //   handleRemoveItem,
// //   setDetailsModalVisible,
// //   setSelectedItem,
// //   guestCount,
// // }) => {
// //   const itemKey = `${item.type}-${item.id}`;
// //   const [inputQuantity, setInputQuantity] = useState(String(quantities[itemKey] || "1"));
// //   const [inputGuestCount, setInputGuestCount] = useState(String(guestCount || "1"));

// //   useEffect(() => {
// //     setInputQuantity(String(quantities[itemKey] || "1"));
// //   }, [quantities, itemKey]);
// //   useEffect(() => {
// //     setInputGuestCount(String(guestCount || "1"));
// //   }, [guestCount]);

// //   const cost = item.type === "restaurant" ? item.averageCost : item.cost;

// //   const parsedGuestCount = parseInt(inputGuestCount, 10) || 1;
// //   const parsedQuantity = parseInt(inputQuantity, 10) || 1;
// //   const totalCost = item.type === "restaurant" ? cost * parsedGuestCount : cost * parsedQuantity;

// //   const syncQuantity = (newQtyValue, newGuestCountValue = inputGuestCount) => {
// //     let currentQtyStr = String(newQtyValue === "" || newQtyValue === undefined ? "1" : newQtyValue);
// //     let currentGuestsStr = String(
// //       newGuestCountValue === "" || newGuestCountValue === undefined ? "1" : newGuestCountValue
// //     );

// //     if (item.type === "restaurant") {
// //       const numGuests = parseInt(currentGuestsStr, 10);
// //       if (numGuests > item.capacity) {
// //         Alert.alert("Внимание", `Максимальная вместимость ресторана: ${item.capacity} гостей.`);
// //         currentGuestsStr = String(item.capacity);
// //       }
// //       setInputGuestCount(currentGuestsStr);
// //     } else {
// //       setInputQuantity(currentQtyStr);
// //     }

// //     setQuantities((prevQtys) => ({ ...prevQtys, [itemKey]: item.type === "restaurant" ? "1" : currentQtyStr }));

// //     setFilteredData((prevEventItems) =>
// //       prevEventItems.map((eventItem) => {
// //         if (`${eventItem.type}-${eventItem.id}` === itemKey) {
// //           const itemTotalCost =
// //             eventItem.type === "restaurant"
// //               ? eventItem.averageCost * (parseInt(currentGuestsStr, 10) || 1)
// //               : eventItem.cost * (parseInt(currentQtyStr, 10) || 1);
// //           return { ...eventItem, calculatedTotalCost: itemTotalCost };
// //         }
// //         return eventItem;
// //       })
// //     );
// //   };

// //   const handleQuantityChange = (value) => {
// //     const filteredValue = value.replace(/[^0-9]/g, "");
// //     if (item.type !== "restaurant") setInputQuantity(filteredValue);
// //   };
// //   const handleQuantityBlur = () => {
// //     if (item.type !== "restaurant") syncQuantity(inputQuantity);
// //   };

// //   const incrementQuantity = () => {
// //     if (item.type !== "restaurant") syncQuantity((parseInt(inputQuantity, 10) || 0) + 1);
// //   };
// //   const decrementQuantity = () => {
// //     if (item.type !== "restaurant") {
// //       const current = parseInt(inputQuantity, 10) || 1;
// //       if (current > 1) syncQuantity(current - 1);
// //     }
// //   };

// //   const displayTitle = getItemDisplayTitle(item, true);

// //   return (
// //     <View style={styles.selectedItemCard}>
// //       <View style={styles.selectedItemHeader}>
// //         <Text style={styles.selectedItemTitleText} numberOfLines={1}>
// //           {displayTitle}
// //         </Text>
// //         <View style={styles.selectedItemActions}>
// //           <TouchableOpacity
// //             style={styles.selectedItemActionButton}
// //             onPress={() => handleRemoveItem(item)}
// //           >
// //             <IconMCI name="trash-can-outline" size={SIZES.h2 * 0.9} color={COLORS.error} />
// //           </TouchableOpacity>
// //           <TouchableOpacity
// //             style={styles.selectedItemActionButton}
// //             onPress={() => {
// //               setSelectedItem(item);
// //               setDetailsModalVisible(true);
// //             }}
// //           >
// //             <Icon name="info-outline" size={SIZES.h2 * 0.9} color={COLORS.textSecondary} />
// //           </TouchableOpacity>
// //         </View>
// //       </View>
// //       {item.type === "restaurant" ? (
// //         <View style={styles.selectedItemControlRow}>
// //           <Text style={styles.selectedItemLabel}>Гостей (из сметы):</Text>
// //           <Text style={styles.selectedItemInput}>{inputGuestCount}</Text>
// //           <Text style={styles.selectedItemTotalCost}>{(cost * parsedGuestCount).toLocaleString()} ₸</Text>
// //         </View>
// //       ) : (
// //         <View style={styles.selectedItemControlRow}>
// //           <Text style={styles.selectedItemLabel}>Кол-во:</Text>
// //           <View style={styles.selectedItemQuantityContainer}>
// //             <TouchableOpacity
// //               style={styles.selectedItemQuantityButton}
// //               onPress={decrementQuantity}
// //             >
// //               <IconMCI name="minus" size={SIZES.body * 1.1} color={COLORS.primary} />
// //             </TouchableOpacity>
// //             <TextInput
// //               style={styles.selectedItemInput}
// //               value={inputQuantity}
// //               onChangeText={handleQuantityChange}
// //               onBlur={handleQuantityBlur}
// //               keyboardType="numeric"
// //               textAlign="center"
// //             />
// //             <TouchableOpacity
// //               style={styles.selectedItemQuantityButton}
// //               onPress={incrementQuantity}
// //             >
// //               <IconMCI name="plus" size={SIZES.body * 1.1} color={COLORS.primary} />
// //             </TouchableOpacity>
// //           </View>
// //           <Text style={styles.selectedItemTotalCost}>{totalCost.toLocaleString()} ₸</Text>
// //         </View>
// //       )}
// //     </View>
// //   );
// // };

// // // CategoryItemsModal
// // const CategoryItemsModal = ({
// //   visible,
// //   onClose,
// //   categoryItems,
// //   categoryLabel,
// //   filteredData,
// //   handleAddItem,
// //   handleRemoveItem,
// //   setDetailsModalVisible,
// //   setSelectedItem,
// //   quantities,
// //   setQuantities,
// //   budget,
// //   setFilteredData,
// //   updateCategories,
// //   guestCount,
// // }) => {
// //   const itemsAlreadySelectedFromThisCategory = useMemo(
// //     () => filteredData.filter((fi) => fi.type === categoryItems[0]?.type),
// //     [filteredData, categoryItems]
// //   );

// //   const itemsAvailableToSelect = useMemo(
// //     () =>
// //       categoryItems.filter(
// //         (ci) => !itemsAlreadySelectedFromThisCategory.some((sItem) => sItem.id === ci.id)
// //       ),
// //     [categoryItems, itemsAlreadySelectedFromThisCategory]
// //   );

// //   useEffect(() => {
// //     if (visible) {
// //       // No state reset needed here
// //     }
// //   }, [visible]);

// //   const renderAvailableItem = useCallback(
// //     ({ item }) => {
// //       const displayTitle = getItemDisplayTitle(item);
// //       return (
// //         <View style={modalStyles.listItemContainer}>
// //           <Text style={modalStyles.listItemText} numberOfLines={1}>
// //             {displayTitle}
// //           </Text>
// //           <View style={{ flexDirection: "row", alignItems: "center" }}>
// //             <TouchableOpacity
// //               style={modalStyles.actionButtonSmall}
// //               onPress={() => {
// //                 if (
// //                   item.type === "restaurant" &&
// //                   guestCount &&
// //                   item.capacity &&
// //                   parseInt(guestCount, 10) > item.capacity
// //                 ) {
// //                   Alert.alert(
// //                     "Внимание",
// //                     `Максимальная вместимость ресторана ${item.name}: ${item.capacity} гостей.`
// //                   );
// //                   return;
// //                 }
// //                 handleAddItem(item);
// //                 const category = typeToCategoryMap[item.type];
// //                 if (category) updateCategories(category);
// //               }}
// //             >
// //               <Icon name="add" size={SIZES.h2} color={COLORS.primary} />
// //             </TouchableOpacity>
// //             <TouchableOpacity
// //               style={[modalStyles.actionButtonSmall, { marginLeft: SIZES.padding / 2 }]}
// //               onPress={() => {
// //                 setSelectedItem(item);
// //                 setDetailsModalVisible(true);
// //               }}
// //             >
// //               <Icon name="info-outline" size={SIZES.h2} color={COLORS.textSecondary} />
// //             </TouchableOpacity>
// //           </View>
// //         </View>
// //       );
// //     },
// //     [handleAddItem, setSelectedItem, setDetailsModalVisible, updateCategories, guestCount]
// //   );

// //   const handleClose = () => {
// //     Keyboard.dismiss();
// //     onClose();
// //   };

// //   return (
// //     <Modal
// //       visible={visible}
// //       transparent
// //       animationType="slide"
// //       onRequestClose={handleClose}
// //     >
// //       <SafeAreaView style={modalStyles.overlay}>
// //         <View style={[modalStyles.container, { maxHeight: SCREEN_HEIGHT * 0.9 }]}>
// //           <ThemedModalHeader
// //             title={categoryLabel || "Элементы категории"}
// //             onClose={handleClose}
// //           />
// //           {itemsAlreadySelectedFromThisCategory.length > 0 && (
// //             <>
// //               <Text style={modalStyles.subHeader}>
// //                 Выбрано в этой категории ({itemsAlreadySelectedFromThisCategory.length}):
// //               </Text>
// //               <FlatList
// //                 data={itemsAlreadySelectedFromThisCategory}
// //                 renderItem={({ item }) => (
// //                   <SelectedItem
// //                     item={item}
// //                     quantities={quantities}
// //                     setQuantities={setQuantities}
// //                     filteredData={filteredData}
// //                     setFilteredData={setFilteredData}
// //                     budget={budget}
// //                     handleRemoveItem={handleRemoveItem}
// //                     setDetailsModalVisible={setDetailsModalVisible}
// //                     setSelectedItem={setSelectedItem}
// //                     guestCount={guestCount}
// //                   />
// //                 )}
// //                 keyExtractor={(item) => `${item.type}-${item.id}-selectedCat`}
// //                 style={{ maxHeight: SCREEN_HEIGHT * 0.3, marginBottom: SIZES.padding / 2 }}
// //                 initialNumToRender={5}
// //                 windowSize={3}
// //                 removeClippedSubviews={true}
// //               />
// //               <View style={modalStyles.separatorThick} />
// //             </>
// //           )}
// //           <Text style={modalStyles.subHeader}>
// //             Доступно для выбора ({itemsAvailableToSelect.length}):
// //           </Text>
// //           <FlatList
// //             data={itemsAvailableToSelect}
// //             renderItem={renderAvailableItem}
// //             keyExtractor={(item) => `${item.type}-${item.id}-availableCat`}
// //             ListEmptyComponent={
// //               <Text style={modalStyles.emptyListText}>
// //                 Все доступные элементы из этой категории выбраны или отсутствуют.
// //               </Text>
// //             }
// //             contentContainerStyle={{ paddingBottom: SIZES.padding }}
// //             initialNumToRender={10}
// //             windowSize={5}
// //             removeClippedSubviews={true}
// //           />
// //         </View>
// //       </SafeAreaView>
// //     </Modal>
// //   );
// // };

// // // QuickDetailsModal
// // const QuickDetailsModal = ({ visible, onClose, selectedItem, onNavigateToDetails }) => {
// //   useEffect(() => {
// //     if (visible) {
// //       // No state reset needed here
// //     }
// //   }, [visible]);

// //   if (!selectedItem) return null;

// //   const renderItemDetails = () => {
// //     const detailsToRender = [];
// //     const DetailRow = ({ label, value }) =>
// //       value || value === 0 ? (
// //         <View style={modalStyles.detailRow}>
// //           <Text style={modalStyles.detailLabel}>{label}:</Text>
// //           <Text style={modalStyles.detailValue} numberOfLines={3}>
// //             {value}
// //           </Text>
// //         </View>
// //       ) : null;

// //     detailsToRender.push(
// //       <DetailRow
// //         key="q_title"
// //         label="Название"
// //         value={getItemDisplayTitle(selectedItem, true)}
// //       />
// //     );
// //     detailsToRender.push(
// //       <DetailRow
// //         key="q_cost"
// //         label="Стоимость"
// //         value={`${selectedItem.cost || selectedItem.averageCost || "N/A"} ₸`}
// //       />
// //     );

// //     switch (selectedItem.type) {
// //       case "restaurant":
// //         detailsToRender.push(<DetailRow key="q_capacity" label="Вместимость" value={selectedItem.capacity} />);
// //         detailsToRender.push(<DetailRow key="q_cuisine" label="Кухня" value={selectedItem.cuisine} />);
// //         detailsToRender.push(<DetailRow key="q_address" label="Адрес" value={selectedItem.address} />);
// //         break;
// //       case "clothing":
// //         detailsToRender.push(<DetailRow key="q_gender" label="Пол" value={selectedItem.gender} />);
// //         detailsToRender.push(<DetailRow key="q_store" label="Магазин" value={selectedItem.storeName} />);
// //         detailsToRender.push(<DetailRow key="q_address" label="Адрес" value={selectedItem.address} />);
// //         break;
// //       case "tamada":
// //         detailsToRender.push(<DetailRow key="q_portfolio" label="О себе" value={selectedItem.portfolio} />);
// //         break;
// //       case "flowers":
// //         detailsToRender.push(<DetailRow key="q_salon" label="Салон" value={selectedItem.salonName} />);
// //         detailsToRender.push(<DetailRow key="q_flower_name" label="Название" value={selectedItem.flowerName} />);
// //         detailsToRender.push(<DetailRow key="q_flower_type" label="Тип цветов" value={selectedItem.flowerType} />);
// //         detailsToRender.push(<DetailRow key="q_address" label="Адрес" value={selectedItem.address} />);
// //         break;
// //       case "cake":
// //         detailsToRender.push(<DetailRow key="q_cake_type" label="Тип торта" value={selectedItem.cakeType} />);
// //         detailsToRender.push(<DetailRow key="q_address" label="Адрес" value={selectedItem.address} />);
// //         break;
// //       case "alcohol":
// //         detailsToRender.push(<DetailRow key="q_salon" label="Салон" value={selectedItem.salonName} />);
// //         detailsToRender.push(<DetailRow key="q_drink_name" label="Напиток" value={selectedItem.alcoholName} />);
// //         detailsToRender.push(<DetailRow key="q_category" label="Категория" value={selectedItem.category} />);
// //         detailsToRender.push(<DetailRow key="q_address" label="Адрес" value={selectedItem.address} />);
// //         break;
// //       case "program":
// //         detailsToRender.push(<DetailRow key="q_team" label="Команда" value={selectedItem.teamName} />);
// //         detailsToRender.push(<DetailRow key="q_program_type" label="Тип программы" value={selectedItem.type} />);
// //         break;
// //       case "traditionalGift":
// //         detailsToRender.push(<DetailRow key="q_salon" label="Салон" value={selectedItem.salonName} />);
// //         detailsToRender.push(<DetailRow key="q_item_name" label="Товар" value={selectedItem.itemName} />);
// //         detailsToRender.push(<DetailRow key="q_address" label="Адрес" value={selectedItem.address} />);
// //         break;
// //       case "transport":
// //         detailsToRender.push(<DetailRow key="q_salon" label="Салон" value={selectedItem.salonName} />);
// //         detailsToRender.push(<DetailRow key="q_car_name" label="Авто" value={selectedItem.carName} />);
// //         detailsToRender.push(<DetailRow key="q_brand" label="Марка" value={selectedItem.brand} />);
// //         detailsToRender.push(<DetailRow key="q_color" label="Цвет" value={selectedItem.color} />);
// //         detailsToRender.push(<DetailRow key="q_phone" label="Телефон" value={selectedItem.phone} />);
// //         detailsToRender.push(<DetailRow key="q_district" label="Район" value={selectedItem.district} />);
// //         detailsToRender.push(<DetailRow key="q_address" label="Адрес" value={selectedItem.address} />);
// //         break;
// //       case "goods":
// //         detailsToRender.push(<DetailRow key="q_item_name" label="Название" value={selectedItem.item_name} />);
// //         detailsToRender.push(<DetailRow key="q_description" label="Описание" value={selectedItem.description} />);
// //         break;
// //       case "jewelry":
// //         detailsToRender.push(<DetailRow key="q_store" label="Магазин" value={selectedItem.storeName} />);
// //         detailsToRender.push(<DetailRow key="q_item_name" label="Товар" value={selectedItem.itemName} />);
// //         detailsToRender.push(<DetailRow key="q_material" label="Материал" value={selectedItem.material} />);
// //         break;
// //       default:
// //         detailsToRender.push(
// //           <DetailRow
// //             key="q_type_default"
// //             label="Тип"
// //             value={typesMapping.find((t) => t.type === selectedItem.type)?.label || selectedItem.type}
// //           />
// //         );
// //     }
// //     return detailsToRender;
// //   };

// //   const handleClose = () => {
// //     Keyboard.dismiss();
// //     onClose();
// //     setSelectedItem(null); // Очищаем выбранный элемент при закрытии
// //   };

// //   return (
// //     <Modal
// //       visible={visible}
// //       transparent
// //       animationType="fade"
// //       onRequestClose={handleClose}
// //     >
// //       <SafeAreaView style={modalStyles.overlay}>
// //         <View
// //           style={[modalStyles.container, { maxHeight: SCREEN_HEIGHT * 0.6, justifyContent: "space-between" }]}
// //         >
// //           <View>
// //             <ThemedModalHeader title="Краткая информация" onClose={handleClose} />
// //             <ScrollView
// //               showsVerticalScrollIndicator={false}
// //               contentContainerStyle={{ paddingBottom: SIZES.padding }}
// //             >
// //               {renderItemDetails()}
// //               {selectedItem?.portfolio && selectedItem.type === "tamada" && (
// //                 <ThemedModalButton
// //                   title="Посмотреть портфолио"
// //                   onPress={() => Linking.openURL(selectedItem.portfolio)}
// //                   type="secondary"
// //                   iconName="link"
// //                   style={{ marginTop: SIZES.padding / 2 }}
// //                 />
// //               )}
// //               {selectedItem?.goodLink && selectedItem.type === "goods" && (
// //                 <ThemedModalButton
// //                   title="Перейти к товару"
// //                   onPress={() => Linking.openURL(selectedItem.goodLink)}
// //                   type="secondary"
// //                   iconName="link"
// //                   style={{ marginTop: SIZES.padding / 2 }}
// //                 />
// //               )}
// //             </ScrollView>
// //           </View>
// //           <ThemedModalButton
// //             title="Перейти к подробностям"
// //             onPress={() => {
// //               handleClose();
// //               onNavigateToDetails();
// //             }}
// //             iconName="arrow-forward"
// //             style={{ marginTop: SIZES.padding }}
// //           />
// //         </View>
// //       </SafeAreaView>
// //     </Modal>
// //   );
// // };
// // // CreateWeddingModal
// // const CreateWeddingModal = ({
// //   visible,
// //   onClose,
// //   weddingName,
// //   setWeddingName,
// //   weddingDate,
// //   setWeddingDate, // Accept the prop
// //   onDateChange,
// //   showDatePicker,
// //   setShowDatePicker,
// //   handleSubmit,
// //   calculateTotalCost,
// //   filteredData,
// //   budget,
// //   remainingBudget,
// //   guestCount,
// //   quantities,
// //   typesMapping,
// //   typeOrder,
// // }) => {
// //   useEffect(() => {
// //     if (visible) {
// //       // No state reset needed here, handled by parent
// //     }
// //   }, [visible]);

// //   const totalCostValue = calculateTotalCost();
// //   const budgetValue = parseFloat(budget);

// //   const handleClose = () => {
// //     Keyboard.dismiss();
// //     onClose();
// //     setWeddingName(""); // Use prop to reset
// //     setWeddingDate(new Date()); // Use prop to reset
// //     setShowDatePicker(false);
// //   };

// //   // Ensure onDateChange uses setWeddingDate
// //   const handleDateChange = (day) => {
// //     setWeddingDate(new Date(day.timestamp)); // Update using the prop
// //     setShowDatePicker(false); // Hide date picker after selection
// //   };

// //   return (
// //     <Modal
// //       visible={visible}
// //       transparent
// //       animationType="slide"
// //       onRequestClose={handleClose}
// //     >
// //       <SafeAreaView style={modalStyles.overlay}>
// //         <View style={[modalStyles.container, { maxHeight: SCREEN_HEIGHT * 0.9 }]}>
// //           <ThemedModalHeader
// //             title='Создание мероприятия "Свадьба"'
// //             onClose={handleClose}
// //           />
// //           <ScrollView
// //             showsVerticalScrollIndicator={false}
// //             contentContainerStyle={{ paddingBottom: SIZES.padding }}
// //           >
// //             <ThemedModalTextInput
// //               placeholder="Название мероприятия..."
// //               value={weddingName}
// //               onChangeText={setWeddingName}
// //               iconName="event-note"
// //             />
// //             <TouchableOpacity
// //               style={modalStyles.datePickerButton}
// //               onPress={() => setShowDatePicker(true)}
// //             >
// //               <Icon
// //                 name="calendar-today"
// //                 size={SIZES.h3}
// //                 color={COLORS.textSecondary}
// //                 style={{ marginRight: SIZES.padding / 2 }}
// //               />
// //               <Text style={modalStyles.datePickerButtonText}>
// //                 {weddingDate.toLocaleDateString("ru-RU") || "Выберите дату"}
// //               </Text>
// //             </TouchableOpacity>
// //             {showDatePicker && (
// //               <Calendar
// //                 style={modalStyles.calendar}
// //                 current={weddingDate.toISOString().split("T")[0]}
// //                 onDayPress={handleDateChange} // Use the new handler
// //                 minDate={new Date().toISOString().split("T")[0]}
// //                 theme={{
// //                   backgroundColor: COLORS.modalContentBackground,
// //                   calendarBackground: COLORS.modalContentBackground,
// //                   textSectionTitleColor: COLORS.textSecondary,
// //                   selectedDayBackgroundColor: COLORS.primary,
// //                   selectedDayTextColor: COLORS.white,
// //                   todayTextColor: COLORS.accent,
// //                   dayTextColor: COLORS.textPrimary,
// //                   textDisabledColor: COLORS.textLight,
// //                   dotColor: COLORS.primary,
// //                   selectedDotColor: COLORS.white,
// //                   arrowColor: COLORS.primary,
// //                   monthTextColor: COLORS.textPrimary,
// //                   indicatorColor: COLORS.primary,
// //                   textDayFontFamily: FONTS.bodyRegular.fontFamily,
// //                   textMonthFontFamily: FONTS.h3.fontFamily,
// //                   textDayHeaderFontFamily: FONTS.caption.fontFamily,
// //                   textDayFontSize: SIZES.body * 0.9,
// //                   textMonthFontSize: SIZES.h3 * 0.9,
// //                   textDayHeaderFontSize: SIZES.caption * 0.9,
// //                 }}
// //               />
// //             )}
// //             <Text style={modalStyles.subHeader}>
// //               Выбранные элементы ({filteredData.length}):
// //             </Text>
// //             {filteredData.length > 0 ? (
// //               Object.entries(
// //                 filteredData.reduce((acc, item) => {
// //                   acc[item.type] = acc[item.type] || [];
// //                   acc[item.type].push(item);
// //                   return acc;
// //                 }, {})
// //               )
// //                 .sort(([typeA], [typeB]) => (typeOrder[typeA] || 99) - (typeOrder[typeB] || 99))
// //                 .map(([type, items]) => (
// //                   <View key={type} style={modalStyles.itemGroup}>
// //                     <Text style={modalStyles.itemGroupTitle}>
// //                       {typesMapping.find((t) => t.type === type)?.label || type} ({items.length})
// //                     </Text>
// //                     {items.map((item) => {
// //                       const itemShortTitle = getItemDisplayTitle(item, true);
// //                       const quantity = parseInt(quantities[`${item.type}-${item.id}`] || "1");
// //                       const cost = item.type === "restaurant" ? item.averageCost : item.cost;
// //                       const effectiveQuantity =
// //                         item.type === "restaurant" ? parseInt(guestCount, 10) || 1 : quantity;
// //                       const totalItemCost = (parseFloat(cost) || 0) * effectiveQuantity;
// //                       return (
// //                         <View key={`${item.type}-${item.id}`} style={modalStyles.summaryItem}>
// //                           <Text style={modalStyles.summaryItemText} numberOfLines={1}>
// //                             {itemShortTitle} - {effectiveQuantity} шт. = {totalItemCost.toLocaleString()} ₸
// //                           </Text>
// //                         </View>
// //                       );
// //                     })}
// //                   </View>
// //                 ))
// //             ) : (
// //               <Text style={modalStyles.emptyListText}>Нет выбранных элементов</Text>
// //             )}
// //             <View style={modalStyles.separatorThick} />
// //             <Text style={modalStyles.totalSummaryText}>
// //               Общая стоимость:{" "}
// //               {typeof totalCostValue === "number" && !isNaN(totalCostValue)
// //                 ? totalCostValue.toLocaleString("ru-RU")
// //                 : "0"}{" "}
// //               ₸
// //             </Text>
// //             {typeof budgetValue === "number" &&
// //               !isNaN(budgetValue) &&
// //               budgetValue > 0 && (
// //                 <>
// //                   <Text style={modalStyles.totalSummaryText}>
// //                     Бюджет: {budgetValue.toLocaleString("ru-RU")} ₸
// //                   </Text>
// //                   <Text
// //                     style={[
// //                       modalStyles.totalSummaryText,
// //                       typeof remainingBudget === "number" &&
// //                         !isNaN(remainingBudget) &&
// //                         remainingBudget < 0 && { color: COLORS.error },
// //                     ]}
// //                   >
// //                     Остаток:{" "}
// //                     {typeof remainingBudget === "number" && !isNaN(remainingBudget)
// //                       ? remainingBudget.toLocaleString("ru-RU")
// //                       : "0"}{" "}
// //                     ₸{" "}
// //                     {typeof remainingBudget === "number" &&
// //                       !isNaN(remainingBudget) &&
// //                       remainingBudget < 0 &&
// //                       " (превышение)"}
// //                   </Text>
// //                 </>
// //               )}
// //             <ThemedModalButton
// //               title="Создать мероприятие"
// //               onPress={handleSubmit}
// //               iconName="check-circle"
// //               style={{ marginTop: SIZES.padding * 1.5 }}
// //             />
// //           </ScrollView>
// //         </View>
// //       </SafeAreaView>
// //     </Modal>
// //   );
// // };

// // // --- Main Screen: CreateEventScreen ---
// // const CreateEventScreen = ({ navigation, route }) => {
// //   const selectedCategoriesFromRoute = route?.params?.selectedCategories || [];
// //   const dispatch = useDispatch();
// //   const { token, user } = useSelector((state) => state.auth);

// //   const [categories, setCategories] = useState(selectedCategoriesFromRoute);
// //   const [disabledCategories, setDisabledCategories] = useState([]);
// //   const [allFetchedData, setAllFetchedData] = useState({
// //     restaurants: [],
// //     clothing: [],
// //     tamada: [],
// //     programs: [],
// //     traditionalGifts: [],
// //     flowers: [],
// //     cakes: [],
// //     alcohol: [],
// //     transport: [],
// //     goods: [],
// //     jewelry: [],
// //   });
// //   const [filteredEventItems, setFilteredEventItems] = useState([]);
// //   const [itemQuantities, setItemQuantities] = useState({});
// //   const [budget, setBudget] = useState("");
// //   const [guestCount, setGuestCount] = useState("");

// //   const [isDataLoading, setIsDataLoading] = useState(true);
// //   const [isProcessingAction, setIsProcessingAction] = useState(false);

// //   const [addItemModalVisible, setAddItemModalVisible] = useState(false);
// //   const [categoryItemsModalVisible, setCategoryItemsModalVisible] = useState(false);
// //   const [quickDetailsModalVisible, setQuickDetailsModalVisible] = useState(false);
// //   const [createWeddingModalVisible, setCreateWeddingModalVisible] = useState(false);

// //   const [currentCategoryItems, setCurrentCategoryItems] = useState([]);
// //   const [currentCategoryLabel, setCurrentCategoryLabel] = useState("");
// //   const [selectedItemForQuickDetails, setSelectedItemForQuickDetails] = useState(null);

// //   const [weddingName, setWeddingName] = useState("");
// //   const [weddingDate, setWeddingDate] = useState(new Date());
// //   const [showDatePicker, setShowDatePicker] = useState(false);

// //   const [shouldAutoFilter, setShouldAutoFilter] = useState(false);
// //   const [blockedDays, setBlockedDays] = useState({});
// //   const scrollViewRef = useRef(null);

// //   const calculateTotalCost = useCallback(() => {
// //     if (!filteredEventItems || filteredEventItems.length === 0) return 0;
// //     return filteredEventItems.reduce((sum, item) => {
// //       const key = `${item.type}-${item.id}`;
// //       const rawQuantity = itemQuantities[key];
// //       const quantity =
// //         item.type === "restaurant"
// //           ? parseInt(guestCount, 10) || 1
// //           : parseInt(rawQuantity, 10) || 1;
// //       const rawCost = item.type === "restaurant" ? item.averageCost : item.cost;
// //       const cost = parseFloat(rawCost) || 0;
// //       return sum + cost * quantity;
// //     }, 0);
// //   }, [filteredEventItems, itemQuantities, guestCount]);

// //   const remainingBudget = useMemo(() => {
// //     const numBudget = parseFloat(budget);
// //     if (isNaN(numBudget)) return 0;
// //     const totalSpent = calculateTotalCost();
// //     return numBudget - totalSpent;
// //   }, [budget, calculateTotalCost]);

// //   const updateCategories = useCallback((newCategory) => {
// //     setCategories((prev) => (prev.includes(newCategory) ? prev : [...prev, newCategory]));
// //   }, []);

// //   const combinedAllData = useMemo(() => {
// //     const dataArray = [];
// //     for (const key in allFetchedData) {
// //       if (Array.isArray(allFetchedData[key])) {
// //         allFetchedData[key].forEach((item) => {
// //           const type = typesMapping.find((t) => t.key === key)?.type || key.replace(/s$/, "");
// //           if (type) {
// //             dataArray.push({ ...item, type });
// //           }
// //         });
// //       }
// //     }
// //     return dataArray
// //       .filter((item) => !(item.type === "goods" && item.category === "Прочее"))
// //       .sort((a, b) => (typeOrder[a.type] || 99) - (typeOrder[b.type] || 99))
// //       .slice(0, 100); // Limit to 100 items for performance
// //   }, [allFetchedData]);

// //   const handleRemoveCategory = useCallback(
// //     (category) => {
// //       setIsProcessingAction(true);
// //       Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
// //       setDisabledCategories((prevDisabled) => {
// //         const type = categoryToTypeMap[category];
// //         if (prevDisabled.includes(category)) {
// //           return prevDisabled.filter((cat) => cat !== category);
// //         } else {
// //           if (type) {
// //             setFilteredEventItems((currentItems) =>
// //               currentItems.filter((item) => item.type !== type)
// //             );
// //             setItemQuantities((currentQtys) => {
// //               const newQtys = { ...currentQtys };
// //               Object.keys(newQtys).forEach((itemKey) => {
// //                 const [itemType] = itemKey.split("-");
// //                 if (itemType === type) {
// //                   delete newQtys[itemKey];
// //                 }
// //               });
// //               return newQtys;
// //             });
// //           }
// //           return [...prevDisabled, category];
// //         }
// //       });
// //       setTimeout(() => setIsProcessingAction(false), 150);
// //     },
// //     [itemQuantities, budget, guestCount, combinedAllData, filteredEventItems, setIsProcessingAction]
// //   );

// //   useEffect(() => {
// //     const fetchData = async () => {
// //       if (!token || !user?.id) {
// //         navigation.navigate("Login");
// //         return;
// //       }
// //       setIsDataLoading(true);
// //       try {
// //         const responses = await Promise.all([
// //           api.getRestaurants(),
// //           api.getClothing(),
// //           api.getTamada(),
// //           api.getPrograms(),
// //           api.getTraditionalGifts(),
// //           api.getFlowers(),
// //           api.getCakes(),
// //           api.getAlcohol(),
// //           api.getTransport(),
// //           api.getGoods(token),
// //           api.getTJewelry(),
// //         ]);
// //         const [
// //           restaurants,
// //           clothing,
// //           tamada,
// //           programs,
// //           traditionalGifts,
// //           flowers,
// //           cakes,
// //           alcohol,
// //           transport,
// //           goods,
// //           jewelry,
// //         ] = responses.map((res) => res.data || []);
// //         setAllFetchedData({
// //           restaurants,
// //           clothing,
// //           tamada,
// //           programs,
// //           traditionalGifts,
// //           flowers,
// //           cakes,
// //           alcohol,
// //           transport,
// //           goods,
// //           jewelry,
// //         });
// //       } catch (error) {
// //         console.error("Ошибка загрузки данных:", error);
// //         Alert.alert("Ошибка", "Не удалось загрузить данные. Попробуйте позже.");
// //       } finally {
// //         setIsDataLoading(false);
// //       }
// //     };
// //     fetchData();
// //   }, [token, user, navigation]);

// //   useEffect(() => {
// //     const unsubscribe = navigation.addListener("focus", () => {
// //       fetchAllBlockedDays();
// //     });
// //     return unsubscribe;
// //   }, [navigation]);

// //   const formatBudget = (input) => input.replace(/[^\d]/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, " ");
// //   const handleBudgetChange = (value) => {
// //     const numValue = value.replace(/[^\d]/g, "");
// //     setBudget(numValue);
// //     setShouldAutoFilter(true);
// //   };
// //   const handleGuestCountChange = (value) => {
// //     setGuestCount(value.replace(/[^0-9]/g, ""));
// //     setShouldAutoFilter(true);
// //   };

// //   const filterDataByBudget = useCallback(() => {
// //     if (!budget || isNaN(parseFloat(budget)) || parseFloat(budget) <= 0) {
// //       Alert.alert("Внимание", "Пожалуйста, введите корректную сумму бюджета.");
// //       return;
// //     }
// //     if (!guestCount || isNaN(parseFloat(guestCount)) || parseFloat(guestCount) <= 0) {
// //       Alert.alert("Внимание", "Пожалуйста, введите корректное количество гостей.");
// //       return;
// //     }
// //     setIsProcessingAction(true);
// //     const budgetValue = parseFloat(budget);
// //     const guests = parseInt(guestCount, 10);
// //     let remaining = budgetValue;
// //     const selectedItemsForFilter = [];
// //     const tempQuantities = {};

// //     const activeCategories = categories.filter((cat) => !disabledCategories.includes(cat));
// //     const typesToProcess = activeCategories.map((cat) => categoryToTypeMap[cat]).filter(Boolean);

// //     const restaurantType = typesToProcess.find((type) => type === "restaurant");
// //     if (restaurantType) {
// //       const availableRestaurants = (allFetchedData.restaurants || [])
// //         .filter((r) => r.capacity >= guests && r.averageCost * guests <= remaining);
// //       if (availableRestaurants.length > 0) {
// //         const sortedRestaurants = [...availableRestaurants].sort((a, b) => a.averageCost - b.averageCost);
// //         const chosenRestaurant = sortedRestaurants[Math.floor(sortedRestaurants.length / 2)];
// //         if (chosenRestaurant) {
// //           const cost = chosenRestaurant.averageCost * guests;
// //           selectedItemsForFilter.push({
// //             ...chosenRestaurant,
// //             type: "restaurant",
// //             calculatedTotalCost: cost,
// //           });
// //           tempQuantities[`restaurant-${chosenRestaurant.id}`] = "1";
// //           remaining -= cost;
// //         }
// //       }
// //     }

// //     typesToProcess
// //       .filter((type) => type !== "restaurant")
// //       .forEach((type) => {
// //         const itemsOfType = combinedAllData.filter((item) => item.type === type);
// //         if (itemsOfType.length > 0) {
// //           const affordableItems = itemsOfType
// //             .filter((item) => (item.cost || 0) <= remaining)
// //             .sort((a, b) => (a.cost || 0) - (b.cost || 0));
// //           if (affordableItems.length > 0) {
// //             const chosenItem = affordableItems[0];
// //             selectedItemsForFilter.push({ ...chosenItem, calculatedTotalCost: chosenItem.cost });
// //             tempQuantities[`${chosenItem.type}-${chosenItem.id}`] = "1";
// //             remaining -= chosenItem.cost;
// //           }
// //         }
// //       });

// //     setFilteredEventItems(
// //       selectedItemsForFilter.sort((a, b) => (typeOrder[a.type] || 99) - (typeOrder[b.type] || 99))
// //     );
// //     setItemQuantities(tempQuantities);
// //     Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
// //     setIsProcessingAction(false);
// //   }, [
// //     budget,
// //     guestCount,
// //     allFetchedData,
// //     categories,
// //     disabledCategories,
// //     combinedAllData,
// //     setIsProcessingAction,
// //   ]);

// //   useEffect(() => {
// //     if (shouldAutoFilter && budget && guestCount && !isNaN(parseFloat(budget)) && !isNaN(parseFloat(guestCount))) {
// //       filterDataByBudget();
// //       setShouldAutoFilter(false);
// //     }
// //   }, [budget, guestCount, filterDataByBudget, shouldAutoFilter]);

// //   const handleAddItem = useCallback(
// //     (itemToAdd) => {
// //       Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
// //       setFilteredEventItems((prevItems) => {
// //         const itemKey = `${itemToAdd.type}-${itemToAdd.id}`;
// //         if (itemToAdd.type === "restaurant") {
// //           if (
// //             guestCount &&
// //             itemToAdd.capacity &&
// //             parseInt(guestCount, 10) > itemToAdd.capacity
// //           ) {
// //             Alert.alert(
// //               "Внимание",
// //               `Максимальная вместимость ресторана ${itemToAdd.name}: ${itemToAdd.capacity} гостей.`
// //             );
// //             return prevItems;
// //           }
// //           const existingRestaurant = prevItems.find((i) => i.type === "restaurant");
// //           if (existingRestaurant && existingRestaurant.id !== itemToAdd.id) {
// //             Alert.alert(
// //               "Внимание",
// //               "Можно выбрать только один ресторан. Удалите предыдущий, чтобы добавить новый."
// //             );
// //             return prevItems;
// //           }
// //           if (existingRestaurant && existingRestaurant.id === itemToAdd.id) return prevItems;
// //           const newItems = prevItems.filter((i) => i.type !== "restaurant");
// //           setItemQuantities((prevQ) => ({ ...prevQ, [itemKey]: "1" }));
// //           return [...newItems, itemToAdd].sort(
// //             (a, b) => (typeOrder[a.type] || 99) - (typeOrder[b.type] || 99)
// //           );
// //         } else {
// //           const existingItemIndex = prevItems.findIndex(
// //             (i) => `${i.type}-${i.id}` === itemKey
// //           );
// //           if (existingItemIndex !== -1) {
// //             Alert.alert(
// //               "Информация",
// //               "Этот элемент уже добавлен. Вы можете изменить количество в списке выбранных (в модальном окне категории)."
// //             );
// //             return prevItems;
// //           } else {
// //             setItemQuantities((prevQ) => ({ ...prevQ, [itemKey]: "1" }));
// //             return [...prevItems, itemToAdd].sort(
// //               (a, b) => (typeOrder[a.type] || 99) - (typeOrder[b.type] || 99)
// //             );
// //           }
// //         }
// //       });
// //       setAddItemModalVisible(false);
// //       setCategoryItemsModalVisible(false);
// //     },
// //     [guestCount, typeOrder]
// //   );

// //   const handleRemoveItem = useCallback(
// //     (itemToRemove) => {
// //       Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
// //       setFilteredEventItems((prev) =>
// //         prev.filter((i) => `${i.type}-${i.id}` !== `${itemToRemove.type}-${itemToRemove.id}`)
// //       );
// //       setItemQuantities((prevQ) => {
// //         const newQ = { ...prevQ };
// //         delete newQ[`${itemToRemove.type}-${itemToRemove.id}`];
// //         return newQ;
// //       });
// //     },
// //     []
// //   );

// //   useEffect(() => {
// //     fetchAllBlockedDays();
// //   }, []);

// //   const fetchAllBlockedDays = async () => {
// //     try {
// //       const response = await api.fetchAllBlockDays();
// //       const blocked = {};
// //       (response.data || []).forEach((entry) => {
// //         if (!blocked[entry.date]) blocked[entry.date] = { marked: true, dots: [] };
// //         blocked[entry.date].dots.push({
// //           restaurantId: entry.restaurantId,
// //           restaurantName: entry.restaurantName,
// //         });
// //       });
// //       setBlockedDays(blocked);
// //     } catch (error) {
// //       console.error("Ошибка загрузки заблокированных дней:", error.message);
// //     }
// //   };

// //   const handleSubmitWedding = async () => {
// //     if (!weddingName.trim()) {
// //       Alert.alert("Ошибка", "Пожалуйста, укажите название мероприятия.");
// //       return;
// //     }
// //     if (filteredEventItems.length === 0) {
// //       Alert.alert("Ошибка", "Пожалуйста, выберите хотя бы один элемент для мероприятия.");
// //       return;
// //     }
// //     if (!user?.id || !token) {
// //       Alert.alert("Ошибка", "Ошибка авторизации. Пожалуйста, войдите в систему.");
// //       navigation.navigate("Login");
// //       return;
// //     }

// //     const dateString = weddingDate.toISOString().split("T")[0];
// //     const restaurantItem = filteredEventItems.find((item) => item.type === "restaurant");
// //     if (
// //       restaurantItem &&
// //       blockedDays[dateString]?.dots.some((dot) => dot.restaurantId === restaurantItem.id)
// //     ) {
// //       Alert.alert(
// //         "Ошибка",
// //         `Дата ${dateString} уже забронирована для ресторана ${restaurantItem.name}. Пожалуйста, выберите другую дату.`
// //       );
// //       return;
// //     }
// //     setIsProcessingAction(true);
// //     const weddingData = {
// //       name: weddingName.trim(),
// //       date: dateString,
// //       host_id: user.id,
// //       items: filteredEventItems.map((item) => {
// //         const key = `${item.type}-${item.id}`;
// //         const quantity =
// //           item.type === "restaurant"
// //             ? parseInt(guestCount, 10) || 1
// //             : parseInt(itemQuantities[key], 10) || 1;
// //         const cost = item.type === "restaurant" ? item.averageCost : item.cost;
// //         return { id: item.id, type: item.type, quantity, totalCost: (parseFloat(cost) || 0) * quantity };
// //       }),
// //     };
// //     try {
// //       await api.createWedding(weddingData, token);
// //       Alert.alert("Успех!", "Мероприятие успешно создано!");
// //       setCreateWeddingModalVisible(false);
// //       setWeddingName("");
// //       setWeddingDate(new Date());
// //       setShowDatePicker(false);
// //       setFilteredEventItems([]);
// //       setItemQuantities({});
// //       setBudget("");
// //       setGuestCount("");
// //       Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
// //     } catch (error) {
// //       console.error("Ошибка при создании свадьбы:", error);
// //       Alert.alert(
// //         "Ошибка",
// //         error.response?.data?.error || error.message || "Не удалось создать мероприятие."
// //       );
// //     } finally {
// //       setIsProcessingAction(false);
// //     }
// //   };

// //   const onWeddingDateChange = (day) => {
// //     setWeddingDate(new Date(day.timestamp));
// //     setShowDatePicker(false);
// //     setWeddingDate(new Date(day.timestamp));
// //   };

// //   const handleCategoryPress = (category) => {
// //     const type = categoryToTypeMap[category];
// //     if (!type) return;
// //     const items = combinedAllData.filter((item) => item.type === type);
// //     setCurrentCategoryItems(items);
// //     setCurrentCategoryLabel(category);
// //     setCategoryItemsModalVisible(true);
// //   };

// //   const sortedActiveCategories = useMemo(() => {
// //     return [...categories].sort(
// //       (a, b) => (typeOrder[categoryToTypeMap[a]] || 99) - (typeOrder[categoryToTypeMap[b]] || 99)
// //     );
// //   }, [categories]);

// //   const renderCategory = (categoryName) => {
// //     const categoryIconsAssetPath = "../../assets/"; // Replace with your correct path
// //     const iconMap = {
// //       Цветы: { on: require(`${categoryIconsAssetPath}cvetyOn.png`), off: require(`${categoryIconsAssetPath}cvetyOff.png`) },
// //       "Прокат авто": { on: require(`${categoryIconsAssetPath}prokatAvtoOn.png`), off: require(`${categoryIconsAssetPath}prokatAutooff.png`) },
// //       Ресторан: { on: require(`${categoryIconsAssetPath}restaurantOn.png`), off: require(`${categoryIconsAssetPath}restaurantTurnOff.png`) },
// //       Ведущий: { on: require(`${categoryIconsAssetPath}vedushieOn.png`), off: require(`${categoryIconsAssetPath}vedushieOff.png`) },
// //       "Шоу программа": { on: require(`${categoryIconsAssetPath}show.png`), off: require(`${categoryIconsAssetPath}showTurnOff.png`) },
// //       "Свадебный салон": { on: require(`${categoryIconsAssetPath}svadebnyisalon.png`), off: require(`${categoryIconsAssetPath}svadeblyisalonOff.png`) },
// //       "Традиционные подарки": { on: require(`${categoryIconsAssetPath}tradGiftsOn.png`), off: require(`${categoryIconsAssetPath}tradGifts.png`) },
// //       Алкоголь: { on: require(`${categoryIconsAssetPath}alcoholOn.png`), off: require(`${categoryIconsAssetPath}alcoholOff.png`) },
// //       "Ювелирные изделия": { on: require(`${categoryIconsAssetPath}uvizdeliyaOn.png`), off: require(`${categoryIconsAssetPath}uvIzdeliyaOff.png`) },
// //       Торты: { on: require(`${categoryIconsAssetPath}torty.png`), off: require(`${categoryIconsAssetPath}tortyTurnOff.png`) },
// //     };

// //     if (categoryName === "Добавить") {
// //       return (
// //         <TouchableOpacity
// //           style={styles.addCategoryButton}
// //           onPress={() => setAddItemModalVisible(true)}
// //         >
// //           <Icon name="add" size={SIZES.h1 * 0.8} color={COLORS.buttonBorderColor} />
// //         </TouchableOpacity>
// //       );
// //     }
// //     const isDisabled = disabledCategories.includes(categoryName);
// //     const defaultIcon = require(`${categoryIconsAssetPath}join.png`); // Default icon
// //     const iconSource = isDisabled
// //       ? iconMap[categoryName]?.on || defaultIcon
// //       : iconMap[categoryName]?.off || defaultIcon;

// //     return (
// //       <>
// //         <TouchableOpacity
// //           style={styles.categoryIconTouchable}
// //           onPress={() => handleRemoveCategory(categoryName)}
// //         >
// //           <Image
// //             source={iconSource}
// //             style={styles.categoryIconImage}
// //             resizeMode="contain"
// //           />
// //         </TouchableOpacity>
// //         <TouchableOpacity
// //           style={[styles.categoryMainButton, isDisabled && styles.categoryButtonDisabled]}
// //           onPress={() => !isDisabled && handleCategoryPress(categoryName)}
// //           disabled={isDisabled}
// //         >
// //           <LinearGradient
// //             colors={[COLORS.buttonGradientStart, COLORS.buttonGradientEnd]}
// //             style={styles.categoryMainButtonGradient}
// //           >
// //             <Text style={styles.categoryMainButtonText}>{categoryName}</Text>
// //           </LinearGradient>
// //         </TouchableOpacity>
// //       </>
// //     );
// //   };

// //   const handleNavigateToFullDetails = () => {
// //     if (selectedItemForQuickDetails) {
// //       navigation.navigate("Details", { item: selectedItemForQuickDetails });
// //       setQuickDetailsModalVisible(false);
// //       setSelectedItemForQuickDetails(null);
// //     }
// //   };
// //   const handleSubmitEditingBudgetOrGuests = () => {
// //     Keyboard.dismiss();
// //     if (budget && guestCount) setShouldAutoFilter(true);
// //   };

// //   return (
// //     <>
// //       <LinearGradient
// //         colors={[
// //           COLORS.screenBackgroundGradientStart,
// //           COLORS.screenBackgroundGradientEnd,
// //         ]}
// //         style={styles.screenContainer}
// //       >
// //         <SafeAreaView
// //           style={{ flex: 1, paddingTop: Platform.OS === "android" ? SIZES.padding * 1.5 : 0 }}
// //         >
// //           <TouchableOpacity
// //             style={styles.backButton}
// //             onPress={() => navigation.goBack()}
// //           >
// //             <AntDesign name="left" size={SIZES.h2} color={COLORS.textPrimary} />
// //           </TouchableOpacity>
// //           <View style={styles.logoContainer}>
// //             <Image
// //               source={require("../../assets/kazanRevert.png")}
// //               style={styles.logoIcon}
// //               resizeMode="contain"
// //             />
// //           </View>
// //           <Image
// //             source={require("../../assets/footer.png")}
// //             style={styles.footerPatternImage}
// //           />

// //           <View style={styles.topControlsBar}>
// //             <View style={styles.addCategoryButtonContainer}>
// //               {renderCategory("Добавить")}
// //             </View>
// //             <TextInput
// //               style={styles.budgetGuestInput}
// //               placeholder="Бюджет (т)"
// //               value={formatBudget(budget)}
// //               onChangeText={handleBudgetChange}
// //               placeholderTextColor={COLORS.textLight}
// //               keyboardType="numeric"
// //               maxLength={18}
// //               returnKeyType="next"
// //               onSubmitEditing={handleSubmitEditingBudgetOrGuests}
// //               blurOnSubmit={false}
// //             />
// //             <TextInput
// //               style={[
// //                 styles.budgetGuestInput,
// //                 { width: SCREEN_WIDTH * 0.28, marginLeft: SIZES.padding / 2 },
// //               ]}
// //               placeholder="Гостей"
// //               value={guestCount}
// //               onChangeText={handleGuestCountChange}
// //               placeholderTextColor={COLORS.textLight}
// //               keyboardType="numeric"
// //               maxLength={4}
// //               returnKeyType="done"
// //               onSubmitEditing={handleSubmitEditingBudgetOrGuests}
// //             />
// //           </View>

// //           <View style={styles.categoriesListArea}>
// //             {isDataLoading ? (
// //               <ActivityIndicator
// //                 size="large"
// //                 color={COLORS.primary}
// //                 style={{ flex: 1 }}
// //               />
// //             ) : (
// //               <ScrollView
// //                 ref={scrollViewRef}
// //                 showsVerticalScrollIndicator={false}
// //                 contentContainerStyle={{ paddingBottom: SIZES.padding * 7 }}
// //               >
// //                 {sortedActiveCategories.map((categoryName, index) => (
// //                   <View key={index} style={styles.categoryRowItem}>
// //                     {renderCategory(categoryName)}
// //                   </View>
// //                 ))}
// //               </ScrollView>
// //             )}
// //           </View>
// //           <View style={styles.nextButtonFooterArea}>
// //             <TouchableOpacity
// //               style={styles.nextActionButton}
// //               onPress={() => setCreateWeddingModalVisible(true)}
// //             >
// //               <Image
// //                 source={require("../../assets/next.png")}
// //                 style={styles.nextActionButtonIcon}
// //                 resizeMode="contain"
// //               />
// //             </TouchableOpacity>
// //           </View>
// //         </SafeAreaView>
// //       </LinearGradient>
// //       {/* Modals */}
// //       <AddItemModal
// //         visible={addItemModalVisible}
// //         onClose={() => setAddItemModalVisible(false)}
// //         filteredItems={combinedAllData}
// //         handleAddItem={handleAddItem}
// //         setDetailsModalVisible={setQuickDetailsModalVisible}
// //         setSelectedItem={setSelectedItemForQuickDetails}
// //         updateCategories={updateCategories}
// //       />
// //       <CategoryItemsModal
// //         visible={categoryItemsModalVisible}
// //         onClose={() => setCategoryItemsModalVisible(false)}
// //         categoryItems={currentCategoryItems}
// //         categoryLabel={currentCategoryLabel}
// //         filteredData={filteredEventItems}
// //         handleAddItem={handleAddItem}
// //         handleRemoveItem={handleRemoveItem}
// //         setDetailsModalVisible={setQuickDetailsModalVisible}
// //         setSelectedItem={setSelectedItemForQuickDetails}
// //         quantities={itemQuantities}
// //         setQuantities={setItemQuantities}
// //         budget={budget}
// //         setFilteredData={setFilteredEventItems}
// //         updateCategories={updateCategories}
// //         guestCount={guestCount}
// //       />
// //       <QuickDetailsModal
// //         visible={quickDetailsModalVisible}
// //         onClose={() => {
// //           setQuickDetailsModalVisible(false);
// //           setSelectedItemForQuickDetails(null);
// //         }}
// //         selectedItem={selectedItemForQuickDetails}
// //         onNavigateToDetails={handleNavigateToFullDetails}
// //       />
// //    <CreateWeddingModal
// //   visible={createWeddingModalVisible}
// //   onClose={() => {
// //     setCreateWeddingModalVisible(false);
// //     setWeddingName("");
// //     setWeddingDate(new Date()); // Reset here is fine, but also pass setWeddingDate
// //     setShowDatePicker(false);
// //   }}
// //   weddingName={weddingName}
// //   setWeddingName={setWeddingName}
// //   weddingDate={weddingDate}
// //   setWeddingDate={setWeddingDate} // Add this prop
// //   onDateChange={onWeddingDateChange}
// //   showDatePicker={showDatePicker}
// //   setShowDatePicker={setShowDatePicker}
// //   handleSubmit={handleSubmitWedding}
// //   calculateTotalCost={calculateTotalCost}
// //   filteredData={filteredEventItems}
// //   budget={budget}
// //   remainingBudget={remainingBudget}
// //   guestCount={guestCount}
// //   quantities={itemQuantities}
// //   typesMapping={typesMapping}
// //   typeOrder={typeOrder}
// // />
// //       <Modal transparent visible={isProcessingAction} onRequestClose={() => {}}>
// //         <View style={styles.processingLoaderOverlay}>
// //           <ActivityIndicator size="large" color={COLORS.primary} />
// //           <Text style={styles.processingLoaderText}>Обработка...</Text>
// //         </View>
// //       </Modal>
// //     </>
// //   );
// // };



// // // --- Styles (continued from where it was cut off) ---
// // const styles = StyleSheet.create({
// //   screenContainer: { flex: 1 },
// //   backButton: {
// //     position: "absolute",
// //     top: Platform.OS === "android" ? SIZES.padding : SIZES.padding * 2.5,
// //     left: SIZES.padding,
// //     zIndex: 10,
// //     padding: SIZES.padding / 2,
// //   },
// //   logoContainer: {
// //     alignItems: "center",
// //     marginTop: SIZES.padding * (Platform.OS === "android" ? 0.5 : 1.5),
// //     marginBottom: SIZES.padding / 2,
// //   },
// //   logoIcon: { width: SCREEN_WIDTH * 0.3, height: SCREEN_WIDTH * 0.3 * 0.65 },
// //   footerPatternImage: {
// //     position: "absolute",
// //     bottom: 0,
// //     width: "100%",
// //     height: SCREEN_HEIGHT * 0.15,
// //     zIndex: 0,
// //     opacity: 0.9,
// //   },
// //   topControlsBar: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     paddingHorizontal: SIZES.padding,
// //     marginTop: SIZES.padding / 2,
// //     marginBottom: SIZES.padding * 1.2,
// //     zIndex: 2,
// //   },
// //   addCategoryButtonContainer: { marginRight: SIZES.padding / 1.5 },
// //   addCategoryButton: {
// //     width: SIZES.buttonHeight * 0.9,
// //     height: SIZES.buttonHeight * 0.9,
// //     borderRadius: SIZES.radius * 0.8,
// //     backgroundColor: COLORS.cardBackground,
// //     justifyContent: "center",
// //     alignItems: "center",
// //     borderWidth: 1,
// //     borderColor: COLORS.buttonBorderColor,
// //     shadowColor: COLORS.shadowColor,
// //     shadowOffset: { width: 0, height: 1 },
// //     shadowOpacity: 0.15,
// //     shadowRadius: 2,
// //     elevation: 2,
// //   },
// //   budgetGuestInput: {
// //     flex: 1,
// //     height: SIZES.buttonHeight * 0.9,
// //     backgroundColor: COLORS.cardBackground,
// //     borderRadius: SIZES.radius * 0.8,
// //     paddingHorizontal: SIZES.padding,
// //     ...FONTS.bodyRegular,
// //     color: COLORS.textPrimary,
// //     borderWidth: 1,
// //     borderColor: COLORS.buttonBorderColor,
// //     shadowColor: COLORS.shadowColor,
// //     shadowOffset: { width: 0, height: 1 },
// //     shadowOpacity: 0.1,
// //     shadowRadius: 2,
// //     elevation: 2,
// //   },
// //   categoriesListArea: { flex: 1, paddingHorizontal: SIZES.padding, zIndex: 1 },
// //   categoryRowItem: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     marginBottom: SIZES.padding * 0.8,
// //   },
// //   categoryIconTouchable: {
// //     width: SIZES.buttonHeight * 1.1,
// //     height: SIZES.buttonHeight * 1.1,
// //     borderRadius: (SIZES.buttonHeight * 1.1) / 2,
// //     backgroundColor: COLORS.cardBackground,
// //     justifyContent: "center",
// //     alignItems: "center",
// //     marginRight: SIZES.padding * 0.8,
// //     borderWidth: 1,
// //     borderColor: COLORS.buttonBorderColor,
// //     shadowColor: COLORS.shadowColor,
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.15,
// //     shadowRadius: 3,
// //     elevation: 3,
// //   },
// //   categoryIconImage: { width: "65%", height: "65%" },
// //   categoryMainButton: {
// //     flex: 1,
// //     height: SIZES.buttonHeight,
// //     borderRadius: SIZES.radius,
// //     overflow: "hidden",
// //     shadowColor: COLORS.shadowColor,
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.2,
// //     shadowRadius: 4,
// //     elevation: 4,
// //   },
// //   categoryMainButtonGradient: {
// //     flex: 1,
// //     flexDirection: "row",
// //     alignItems: "center",
// //     justifyContent: "center",
// //     paddingHorizontal: SIZES.padding,
// //     borderWidth: 1.5,
// //     borderColor: COLORS.buttonBorderColor,
// //     borderRadius: SIZES.radius,
// //   },
// //   categoryMainButtonText: { ...FONTS.bodyBold, color: COLORS.buttonTextAndIcon },
// //   categoryButtonDisabled: { opacity: 0.5 },
// //   nextButtonFooterArea: {
// //     paddingVertical: SIZES.padding * 1.5,
// //     alignItems: "center",
// //     zIndex: 5,
// //     backgroundColor: "transparent",
// //   },
// //   nextActionButton: {
// //     width: SIZES.buttonHeight * 1.4,
// //     height: SIZES.buttonHeight * 1.4,
// //     borderRadius: (SIZES.buttonHeight * 1.4) / 2,
// //     backgroundColor: COLORS.accent,
// //     justifyContent: "center",
// //     alignItems: "center",
// //     borderWidth: 2,
// //     borderColor: COLORS.buttonBorderColor,
// //     shadowColor: COLORS.shadowColor,
// //     shadowOffset: { width: 0, height: 3 },
// //     shadowOpacity: 0.25,
// //     shadowRadius: 5,
// //     elevation: 7,
// //   },
// //   nextActionButtonIcon: { width: "55%", height: "55%", tintColor: COLORS.buttonTextAndIcon },
// //   processingLoaderOverlay: {
// //     flex: 1,
// //     justifyContent: "center",
// //     alignItems: "center",
// //     backgroundColor: COLORS.modalOverlayBackground,
// //   },
// //   processingLoaderText: { ...FONTS.bodyRegular, color: COLORS.white, marginTop: SIZES.padding / 2 },
// //   selectedItemCard: {
// //     backgroundColor: COLORS.cardBackground,
// //     borderRadius: SIZES.radius,
// //     padding: SIZES.padding,
// //     marginVertical: SIZES.padding / 2,
// //     borderWidth: 1,
// //     borderColor: COLORS.cardBorderColor,
// //   },
// //   selectedItemHeader: {
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     alignItems: "flex-start",
// //     marginBottom: SIZES.padding / 1.5,
// //   },
// //   selectedItemTitleText: {
// //     ...FONTS.bodyBold,
// //     color: COLORS.textPrimary,
// //     flex: 1,
// //     marginRight: SIZES.padding / 2,
// //   },
// //   selectedItemActions: { flexDirection: "row", alignItems: "center" },
// //   selectedItemActionButton: { padding: SIZES.padding / 2.5, marginLeft: SIZES.padding / 3 },
// //   selectedItemControlRow: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     justifyContent: "space-between",
// //     marginTop: SIZES.padding / 1.5,
// //   },
// //   selectedItemLabel: {
// //     ...FONTS.caption,
// //     color: COLORS.textSecondary,
// //     marginRight: SIZES.padding / 2,
// //   },
// //   selectedItemQuantityContainer: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     backgroundColor: COLORS.white,
// //     borderRadius: SIZES.radius / 2,
// //     borderWidth: 1,
// //     borderColor: COLORS.cardBorderColor,
// //   },
// //   selectedItemQuantityButton: {
// //     width: 30,
// //     height: 30,
// //     justifyContent: "center",
// //     alignItems: "center",
// //   },
// //   selectedItemInput: {
// //     width: 40,
// //     height: 30,
// //     textAlign: "center",
// //     ...FONTS.bodyRegular,
// //     color: COLORS.textPrimary,
// //   },
// //   selectedItemTotalCost: { ...FONTS.bodyBold, color: COLORS.textPrimary },
// // });

// // // --- Modal Styles ---
// // const modalStyles = StyleSheet.create({
// //   overlay: {
// //     flex: 1,
// //     backgroundColor: COLORS.modalOverlayBackground,
// //     justifyContent: "center",
// //     alignItems: "center",
// //   },
// //   container: {
// //     width: SCREEN_WIDTH * 0.9,
// //     backgroundColor: COLORS.modalContentBackground,
// //     borderRadius: SIZES.radius,
// //     padding: SIZES.padding,
// //     shadowColor: COLORS.shadowColor,
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.25,
// //     shadowRadius: 3.84,
// //     elevation: 5,
// //   },
// //   header: {
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     alignItems: "center",
// //     marginBottom: SIZES.padding,
// //   },
// //   title: { ...FONTS.h3, color: COLORS.textPrimary, flex: 1 },
// //   closeButton: { padding: SIZES.padding / 2 },
// //   textInputContainer: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     backgroundColor: COLORS.cardBackground,
// //     borderRadius: SIZES.radius / 2,
// //     borderWidth: 1,
// //     borderColor: COLORS.cardBorderColor,
// //     marginBottom: SIZES.padding,
// //     paddingHorizontal: SIZES.padding / 2,
// //   },
// //   textInputIcon: { marginRight: SIZES.padding / 2 },
// //   textInput: {
// //     flex: 1,
// //     height: SIZES.inputHeight,
// //     ...FONTS.bodyRegular,
// //     color: COLORS.textPrimary,
// //   },
// //   filterSection: { marginBottom: SIZES.padding },
// //   filterLabel: { ...FONTS.caption, color: COLORS.textSecondary, marginBottom: SIZES.padding / 2 },
// //   filterScrollContainer: { flexDirection: "row", marginBottom: SIZES.padding },
// //   filterButton: {
// //     paddingVertical: SIZES.padding / 2,
// //     paddingHorizontal: SIZES.padding,
// //     backgroundColor: COLORS.cardBackground,
// //     borderRadius: SIZES.radius / 2,
// //     marginRight: SIZES.padding / 2,
// //     borderWidth: 1,
// //     borderColor: COLORS.cardBorderColor,
// //   },
// //   filterButtonActive: { backgroundColor: COLORS.primaryLight },
// //   filterButtonText: { ...FONTS.caption, color: COLORS.textSecondary },
// //   filterButtonTextActive: { ...FONTS.caption, color: COLORS.buttonTextAndIcon },
// //   listItemContainer: {
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     alignItems: "center",
// //     paddingVertical: SIZES.padding / 1.5,
// //     borderBottomWidth: 1,
// //     borderBottomColor: COLORS.cardBorderColor,
// //   },
// //   listItemText: { ...FONTS.bodyRegular, color: COLORS.textPrimary, flex: 1, marginRight: SIZES.padding },
// //   actionButtonSmall: {
// //     padding: SIZES.padding / 2,
// //     borderRadius: SIZES.radius / 2,
// //     backgroundColor: COLORS.cardBackground,
// //     borderWidth: 1,
// //     borderColor: COLORS.cardBorderColor,
// //   },
// //   emptyListText: { ...FONTS.bodyRegular, color: COLORS.textLight, textAlign: "center", padding: SIZES.padding },
// //   subHeader: { ...FONTS.h4, color: COLORS.textPrimary, marginTop: SIZES.padding, marginBottom: SIZES.padding / 2 },
// //   separatorThick: { height: 1, backgroundColor: COLORS.cardBorderColor, marginVertical: SIZES.padding },
// //   detailRow: { flexDirection: "row", marginBottom: SIZES.padding / 2 },
// //   detailLabel: { ...FONTS.caption, color: COLORS.textSecondary, width: "30%" },
// //   detailValue: { ...FONTS.bodyRegular, color: COLORS.textPrimary, flex: 1 },
// //   buttonBase: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     justifyContent: "center",
// //     paddingVertical: SIZES.padding / 1.5,
// //     paddingHorizontal: SIZES.padding,
// //     borderRadius: SIZES.radius,
// //     marginVertical: SIZES.padding / 2,
// //   },
// //   buttonPrimary: { backgroundColor: COLORS.primary },
// //   buttonSecondary: { backgroundColor: COLORS.cardBackground, borderWidth: 1, borderColor: COLORS.cardBorderColor },
// //   buttonDisabled: { opacity: 0.5 },
// //   buttonPrimaryText: { ...FONTS.bodyBold, color: COLORS.buttonTextAndIcon },
// //   buttonSecondaryText: { ...FONTS.bodyBold, color: COLORS.modalButtonSecondaryText },
// //   buttonTextDisabled: { color: COLORS.textLight },
// //   datePickerButton: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     backgroundColor: COLORS.cardBackground,
// //     borderRadius: SIZES.radius / 2,
// //     padding: SIZES.padding,
// //     marginBottom: SIZES.padding,
// //     borderWidth: 1,
// //     borderColor: COLORS.cardBorderColor,
// //   },
// //   datePickerButtonText: { ...FONTS.bodyRegular, color: COLORS.textPrimary, flex: 1 },
// //   calendar: { marginBottom: SIZES.padding },
// //   itemGroup: { marginBottom: SIZES.padding },
// //   itemGroupTitle: { ...FONTS.h4, color: COLORS.textPrimary },
// //   summaryItem: { paddingVertical: SIZES.padding / 2 },
// //   summaryItemText: { ...FONTS.bodyRegular, color: COLORS.textPrimary },
// //   totalSummaryText: { ...FONTS.h4, color: COLORS.textPrimary, marginTop: SIZES.padding / 2 },
// // });

// // // --- Export ---
// // export default CreateEventScreen;