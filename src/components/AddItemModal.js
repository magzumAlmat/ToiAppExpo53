// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   TextInput,
//   FlatList,
//   Modal,
//   StyleSheet,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import * as Animatable from 'react-native-animatable';
// import { COLORS } from '../constants/colors';

// const AddItemModal = ({ visible, onClose, data, onAddItem, filteredData }) => {
//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedTypeFilter, setSelectedTypeFilter] = useState('all');
//   const [selectedDistrict, setSelectedDistrict] = useState('all');
//   const [costRange, setCostRange] = useState('all');

//   const combinedData = [
//     ...data.restaurants.map((item) => ({ ...item, type: 'restaurant' })),
//     ...data.clothing.map((item) => ({ ...item, type: 'clothing' })),
//     ...data.tamada.map((item) => ({ ...item, type: 'tamada' })),
//     ...data.programs.map((item) => ({ ...item, type: 'program' })),
//     ...data.traditionalGifts.map((item) => ({ ...item, type: 'traditionalGift' })),
//     ...data.flowers.map((item) => ({ ...item, type: 'flowers' })),
//     ...data.cakes.map((item) => ({ ...item, type: 'cake' })),
//     ...data.alcohol.map((item) => ({ ...item, type: 'alcohol' })),
//     ...data.transport.map((item) => ({ ...item, type: 'transport' })),
//     ...data.goods.map((item) => ({ ...item, type: 'goods' })),
//   ].filter((item) => item.type !== 'goods' || item.category !== 'Прочее');

//   const typesMapping = [
//     { key: 'clothing', costField: 'cost', type: 'clothing', label: 'Одежда' },
//     { key: 'tamada', costField: 'cost', type: 'tamada', label: 'Тамада' },
//     { key: 'programs', costField: 'cost', type: 'program', label: 'Программа' },
//     { key: 'traditionalGifts', costField: 'cost', type: 'traditionalGift', label: 'Традиционные подарки' },
//     { key: 'flowers', costField: 'cost', type: 'flowers', label: 'Цветы' },
//     { key: 'cakes', costField: 'cost', type: 'cake', label: 'Торты' },
//     { key: 'alcohol', costField: 'cost', type: 'alcohol', label: 'Алкоголь' },
//     { key: 'transport', costField: 'cost', type: 'transport', label: 'Транспорт' },
//     { key: 'restaurants', costField: 'averageCost', type: 'restaurant', label: 'Ресторан' },
//   ];

//   const allTypes = [
//     { type: 'all', label: 'Все' },
//     ...combinedData.map((item) => ({
//       type: item.type,
//       label: typesMapping.find((t) => t.type === item.type)?.label || item.type,
//     })),
//   ];

//   const uniqueTypes = Array.from(new Set(allTypes.map((t) => t.type))).map((type) =>
//     allTypes.find((t) => t.type === type)
//   );

//   const districts = ['all', ...new Set(combinedData.map((item) => item.district).filter(Boolean))];

//   const getFilteredData = () => {
//     let result = combinedData;

//     if (searchQuery) {
//       result = result.filter((item) => {
//         const fieldsToSearch = [
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
//         ].filter(Boolean);

//         return fieldsToSearch.some((field) =>
//           field.toLowerCase().includes(searchQuery.toLowerCase())
//         );
//       });
//     }

//     if (selectedTypeFilter !== 'all') {
//       result = result.filter((item) => item.type === selectedTypeFilter);
//     }

//     if (selectedDistrict !== 'all') {
//       result = result.filter((item) => item.district === selectedDistrict);
//     }

//     if (costRange !== 'all') {
//       result = result.filter((item) => {
//         const cost = item.averageCost || item.cost;
//         if (costRange === '0-10000') return cost <= 10000;
//         if (costRange === '10000-50000') return cost > 10000 && cost <= 50000;
//         if (costRange === '50000+') return cost > 50000;
//         return true;
//       });
//     }

//     return result;
//   };

//   const filteredItems = getFilteredData();

//   const renderItem = ({ item }) => {
//     const isSelected = filteredData.some(
//       (selectedItem) => `${selectedItem.type}-${selectedItem.id}` === `${item.type}-${item.id}`
//     );

//     if (isSelected || (item.type === 'goods' && item.category === 'Прочее')) return null;

//     const cost = item.type === 'restaurant' ? item.averageCost : item.cost;
//     let title;
//     switch (item.type) {
//       case 'restaurant':
//         title = `Ресторан: ${item.name} (${cost} ₸)`;
//         break;
//       case 'clothing':
//         title = `Одежда: ${item.storeName} - ${item.itemName} (${cost} ₸)`;
//         break;
//       case 'flowers':
//         title = `Цветы: ${item.salonName} - ${item.flowerName} (${cost} ₸)`;
//         break;
//       case 'cake':
//         title = `Торты: ${item.name} (${cost} ₸)`;
//         break;
//       case 'alcohol':
//         title = `Алкоголь: ${item.salonName} - ${item.alcoholName} (${cost} ₸)`;
//         break;
//       case 'program':
//         title = `Программа: ${item.teamName} (${cost} ₸)`;
//         break;
//       case 'tamada':
//         title = `Тамада: ${item.name} (${cost} ₸)`;
//         break;
//       case 'traditionalGift':
//         title = `Традиц. подарки: ${item.salonName} - ${item.itemName} (${cost} ₸)`;
//         break;
//       case 'transport':
//         title = `Транспорт: ${item.salonName} - ${item.carName} (${cost} ₸)`;
//         break;
//       case 'goods':
//         title = `Товар: ${item.item_name} (${cost} ₸)`;
//         break;
//       default:
//         title = 'Неизвестный элемент';
//     }

//     return (
//       <TouchableOpacity style={styles.addItemCard} onPress={() => onAddItem(item)}>
//         <Text style={styles.addItemText}>{title}</Text>
//       </TouchableOpacity>
//     );
//   };

//   return (
//     <Modal visible={visible} transparent animationType="slide">
//       <View style={styles.modalOverlay}>
//         <Animatable.View style={styles.addModalContainer} animation="zoomIn" duration={300}>
//           <View style={styles.addModalHeader}>
//             <Text style={styles.addModalTitle}>Добавить элемент</Text>
//             <TouchableOpacity
//               style={styles.addModalCloseIcon}
//               onPress={() => {
//                 onClose();
//                 setSearchQuery('');
//                 setSelectedTypeFilter('all');
//                 setSelectedDistrict('all');
//                 setCostRange('all');
//               }}
//             >
//               <Icon name="close" size={24} color={COLORS.textSecondary} />
//             </TouchableOpacity>
//           </View>

//           <View style={styles.addModalSearchContainer}>
//             <Icon name="search" size={20} color={COLORS.textSecondary} style={styles.addModalSearchIcon} />
//             <TextInput
//               style={styles.addModalSearchInput}
//               placeholder="Поиск по названию..."
//               value={searchQuery}
//               onChangeText={setSearchQuery}
//             />
//             {searchQuery.length > 0 && (
//               <TouchableOpacity
//                 style={styles.addModalClearIcon}
//                 onPress={() => setSearchQuery('')}
//               >
//                 <Icon name="clear" size={20} color={COLORS.textSecondary} />
//               </TouchableOpacity>
//             )}
//           </View>

//           <View style={styles.addModalFilterContainer}>
//             <View style={styles.addModalTypeFilterContainer}>
//               <Text style={styles.addModalFilterLabel}>Тип</Text>
//               <View style={styles.addModalTypeButtons}>
//                 {uniqueTypes.map((typeObj) => (
//                   <TouchableOpacity
//                     key={typeObj.type}
//                     style={[
//                       styles.addModalTypeButton,
//                       selectedTypeFilter === typeObj.type && styles.addModalTypeButtonActive,
//                     ]}
//                     onPress={() => setSelectedTypeFilter(typeObj.type)}
//                   >
//                     <Text
//                       style={[
//                         styles.addModalTypeButtonText,
//                         selectedTypeFilter === typeObj.type && styles.addModalTypeButtonTextActive,
//                       ]}
//                     >
//                       {typeObj.label}
//                     </Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>
//             </View>

//             <View style={styles.addModalDistrictFilterContainer}>
//               <Text style={styles.addModalFilterLabel}>Район</Text>
//               <View style={styles.addModalDistrictButtons}>
//                 {districts.map((district) => (
//                   <TouchableOpacity
//                     key={district}
//                     style={[
//                       styles.addModalDistrictButton,
//                       selectedDistrict === district && styles.addModalDistrictButtonActive,
//                     ]}
//                     onPress={() => setSelectedDistrict(district)}
//                   >
//                     <Text
//                       style={[
//                         styles.addModalDistrictButtonText,
//                         selectedDistrict === district && styles.addModalDistrictButtonTextActive,
//                       ]}
//                     >
//                       {district === 'all' ? 'Все' : district}
//                     </Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>
//             </View>

//             <View style={styles.addModalPriceFilterContainer}>
//               <Text style={styles.addModalFilterLabel}>Цена</Text>
//               <View style={styles.addModalPriceButtons}>
//                 {[
//                   { label: 'Все', value: 'all' },
//                   { label: '0-10k', value: '0-10000' },
//                   { label: '10k-50k', value: '10000-50000' },
//                   { label: '50k+', value: '50000+' },
//                 ].map((option) => (
//                   <TouchableOpacity
//                     key={option.value}
//                     style={[
//                       styles.addModalPriceButton,
//                       costRange === option.value && styles.addModalPriceButtonActive,
//                     ]}
//                     onPress={() => setCostRange(option.value)}
//                   >
//                     <Text
//                       style={[
//                         styles.addModalPriceButtonText,
//                         costRange === option.value && styles.addModalPriceButtonTextActive,
//                       ]}
//                     >
//                       {option.label}
//                     </Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>
//             </View>
//           </View>

//           <FlatList
//             data={filteredItems}
//             renderItem={renderItem}
//             keyExtractor={(item) => `${item.type}-${item.id}`}
//             contentContainerStyle={styles.addModalItemList}
//             ListEmptyComponent={<Text style={styles.addModalEmptyText}>Ничего не найдено</Text>}
//           />
//         </Animatable.View>
//       </View>
//     </Modal>
//   );
// };

// const styles = StyleSheet.create({
//   modalOverlay: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0, 0, 0, 0.6)',
//   },
//   addModalContainer: {
//     width: '92%',
//     maxHeight: '80%',
//     backgroundColor: COLORS.card,
//     borderRadius: 20,
//     padding: 16,
//     shadowColor: COLORS.shadow,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.2,
//     shadowRadius: 8,
//     elevation: 6,
//   },
//   addModalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   addModalTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: COLORS.textPrimary,
//     flex: 1,
//     textAlign: 'center',
//   },
//   addModalCloseIcon: {
//     padding: 6,
//     borderRadius: 20,
//     backgroundColor: '#F7FAFC',
//   },
//   addModalSearchContainer: {
//     position: 'relative',
//     marginBottom: 12,
//   },
//   addModalSearchInput: {
//     height: 40,
//     borderWidth: 1,
//     borderColor: '#E2E8F0',
//     borderRadius: 10,
//     paddingHorizontal: 36,
//     fontSize: 14,
//     color: COLORS.textPrimary,
//     backgroundColor: '#F7FAFC',
//   },
//   addModalSearchIcon: {
//     position: 'absolute',
//     left: 10,
//     top: 10,
//     zIndex: 1,
//   },
//   addModalClearIcon: {
//     position: 'absolute',
//     right: 10,
//     top: 10,
//     zIndex: 1,
//   },
//   addModalFilterContainer: {
//     marginBottom: 12,
//   },
//   addModalTypeFilterContainer: {
//     marginBottom: 10,
//   },
//   addModalTypeButtons: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 6,
//   },
//   addModalTypeButton: {
//     paddingVertical: 6,
//     paddingHorizontal: 10,
//     borderRadius: 6,
//     borderWidth: 1,
//     borderColor: '#E2E8F0',
//     backgroundColor: '#F7FAFC',
//   },
//   addModalTypeButtonActive: {
//     backgroundColor: COLORS.accent,
//     borderColor: COLORS.accent,
//   },
//   addModalTypeButtonText: {
//     fontSize: 12,
//     color: COLORS.textPrimary,
//     fontWeight: '500',
//   },
//   addModalTypeButtonTextActive: {
//     color: '#FFFFFF',
//   },
//   addModalDistrictFilterContainer: {
//     marginBottom: 10,
//   },
//   addModalDistrictButtons: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 6,
//   },
//   addModalDistrictButton: {
//     paddingVertical: 6,
//     paddingHorizontal: 10,
//     borderRadius: 6,
//     borderWidth: 1,
//     borderColor: '#E2E8F0',
//     backgroundColor: '#F7FAFC',
//   },
//   addModalDistrictButtonActive: {
//     backgroundColor: COLORS.accent,
//     borderColor: COLORS.accent,
//   },
//   addModalDistrictButtonText: {
//     fontSize: 12,
//     color: COLORS.textPrimary,
//     fontWeight: '500',
//   },
//   addModalDistrictButtonTextActive: {
//     color: '#FFFFFF',
//   },
//   addModalPriceFilterContainer: {
//     marginBottom: 12,
//   },
//   addModalPriceButtons: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 6,
//   },
//   addModalPriceButton: {
//     paddingVertical: 6,
//     paddingHorizontal: 10,
//     borderRadius: 6,
//     borderWidth: 1,
//     borderColor: '#E2E8F0',
//     backgroundColor: '#F7FAFC',
//   },
//   addModalPriceButtonActive: {
//     backgroundColor: COLORS.accent,
//     borderColor: COLORS.accent,
//   },
//   addModalPriceButtonText: {
//     fontSize: 12,
//     color: COLORS.textPrimary,
//     fontWeight: '500',
//   },
//   addModalPriceButtonTextActive: {
//     color: '#FFFFFF',
//   },
//   addModalItemList: {
//     flexGrow: 1,
//     paddingBottom: 12,
//   },
//   addItemCard: {
//     backgroundColor: COLORS.card,
//     borderRadius: 10,
//     padding: 12,
//     marginBottom: 8,
//   },
//   addItemText: {
//     fontSize: 14,
//     color: COLORS.textPrimary,
//   },
//   addModalEmptyText: {
//     fontSize: 14,
//     color: COLORS.textSecondary,
//     textAlign: 'center',
//     paddingVertical: 16,
//   },
// });

// export default AddItemModal;



import React, { useState, useMemo, useCallback } from 'react';
import {
  Modal,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';
import {  typesMapping, typeOrder, SCREEN_HEIGHT } from "../components/ConstantsComponent"; // Added SCREEN_HEIGHT 
// const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [costRange, setCostRange] = useState('all');

  const uniqueTypes = useMemo(() => {
    const types = [
      { type: 'all', label: 'Все' },
      ...filteredItems
        .map((item) => ({
          type: item.type,
          label: typesMapping.find((t) => t.type === item.type)?.label || item.type,
        }))
        .filter((value, index, self) => self.findIndex((t) => t.type === value.type) === index)
        .sort((a, b) => (typeOrder[a.type] || 11) - (typeOrder[b.type] || 11)),
    ];
    return types;
  }, [filteredItems]);

  const districts = useMemo(() => [
    'all',
    ...new Set(filteredItems.map((item) => String(item.district)).filter(Boolean)),
  ], [filteredItems]);

  const filteredDataMemo = useMemo(() => {
    let result = filteredItems;
    if (searchQuery) {
      result = result.filter((item) =>
        [item.name, item.itemName, item.flowerName, item.alcoholName, item.carName, item.teamName, item.salonName, item.storeName, item.address, item.phone, item.cuisine, item.category, item.brand, item.gender, item.portfolio, item.cakeType, item.flowerType, item.material, item.type]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    if (selectedTypeFilter !== 'all') result = result.filter((item) => item.type === selectedTypeFilter);
    if (selectedDistrict !== 'all') result = result.filter((item) => String(item.district) === selectedDistrict);
    if (costRange !== 'all') {
      result = result.filter((item) => {
        const cost = item.averageCost || item.cost;
        return costRange === '0-10000' ? cost <= 10000 :
               costRange === '10000-50000' ? cost > 10000 && cost <= 50000 :
               costRange === '50000+' ? cost > 50000 : true;
      });
    }
    return result.sort((a, b) => (typeOrder[a.type] || 11) - (typeOrder[b.type] || 11));
  }, [filteredItems, searchQuery, selectedTypeFilter, selectedDistrict, costRange]);

  const renderAddItem = useCallback(({ item }) => {
    const count = filteredData.filter((selectedItem) => `${selectedItem.type}-${selectedItem.id}` === `${item.type}-${item.id}`).length;
    if (item.type === 'goods' && item.category === 'Прочее') return null;
    const cost = item.type === 'restaurant' ? item.averageCost : item.cost;
    const title = {
      restaurant: `Ресторан: ${item.name} (${cost} ₸)`,
      clothing: `Одежда: ${item.storeName} - ${item.itemName} (${cost} ₸)`,
      flowers: `Цветы: ${item.salonName} - ${item.flowerName} (${cost} ₸)`,
      cake: `Торты: ${item.name} (${cost} ₸)`,
      alcohol: `Алкоголь: ${item.salonName} - ${item.alcoholName} (${cost} ₸)`,
      program: `Программа: ${item.teamName} (${cost} ₸)`,
      tamada: `Тамада: ${item.name} (${cost} ₸)`,
      traditionalGift: `Традиц. подарки: ${item.salonName} - ${item.itemName} (${cost} ₸)`,
      transport: `Транспорт: ${item.salonName} - ${item.carName} (${cost} ₸)`,
      goods: `Товар: ${item.item_name} (${cost} ₸)`,
      jewelry: `Ювелирные изделия: ${item.storeName} - ${item.itemName} (${cost} ₸)`,
    }[item.type] || 'Неизвестный элемент';

    return (
      <TouchableOpacity
        style={styles.itemCard}
        onPress={() => {
          handleAddItem(item);
          const category = typeToCategoryMap[item.type];
          if (category) updateCategories(category);
        }}
        disabled={!!filteredData.find((i) => `${i.type}-${i.id}` === `${item.type}-${item.id}`)}
      >
        <View style={styles.itemContent}>
          <Text style={styles.itemName} numberOfLines={1}>{title}</Text>
          {count > 0 && <Text style={styles.itemCount}>×{count}</Text>}
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => { setSelectedItem(item); setDetailsModalVisible(true); onClose(); }}>
          <Ionicons name="information-circle" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }, [filteredData, handleAddItem, setDetailsModalVisible, setSelectedItem, onClose, updateCategories]);

  const closeModal = () => {
    setSearchQuery('');
    setSelectedTypeFilter('all');
    setSelectedDistrict('all');
    setCostRange('all');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={closeModal}>
      <SafeAreaView style={styles.container}>
        <Animated.View entering={SlideInDown} exiting={SlideOutDown} style={styles.modalContainer}>
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Добавить элемент</Text>
            <TouchableOpacity onPress={closeModal} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={COLORS.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Поиск по названию..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={COLORS.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Тип</Text>
              {uniqueTypes.map((typeObj) => (
                <TouchableOpacity
                  key={typeObj.type}
                  style={[styles.filterPill, selectedTypeFilter === typeObj.type && styles.activePill]}
                  onPress={() => setSelectedTypeFilter(typeObj.type)}
                >
                  <Text style={[styles.filterPillText, selectedTypeFilter === typeObj.type && styles.activePillText]}>{typeObj.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.filterDivider} />
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Район</Text>
              {districts.map((district) => (
                <TouchableOpacity
                  key={district}
                  style={[styles.filterPill, selectedDistrict === district && styles.activePill]}
                  onPress={() => setSelectedDistrict(district)}
                >
                  <Text style={[styles.filterPillText, selectedDistrict === district && styles.activePillText]}>{district === 'all' ? 'Все' : district}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.filterDivider} />
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Цена</Text>
              {[{ label: 'Все', value: 'all' }, { label: '0-10k', value: '0-10000' }, { label: '10k-50k', value: '10000-50000' }, { label: '50k+', value: '50000+' }].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.filterPill, costRange === option.value && styles.activePill]}
                  onPress={() => setCostRange(option.value)}
                >
                  <Text style={[styles.filterPillText, costRange === option.value && styles.activePillText]}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          <FlatList
            data={filteredDataMemo}
            renderItem={renderAddItem}
            keyExtractor={(item) => `${item.type}-${item.id}`}
            numColumns={2}
            contentContainerStyle={styles.scrollContent}
            ListEmptyComponent={<View style={styles.emptyState}><Ionicons name="sad-outline" size={40} color={COLORS.textSecondary} style={styles.emptyStateIcon} /><Text style={styles.emptyStateText}>Ничего не найдено</Text><Text style={styles.emptyStateSubText}>Попробуйте изменить фильтры или поиск</Text></View>}
          />
        </Animated.View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = {
  container: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  modalContainer: {  backgroundColor: COLORS.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden' },
  handleContainer: { alignItems: 'center', paddingVertical: 8 },
  handle: { width: 40, height: 5, backgroundColor: COLORS.textSecondary, borderRadius: 2.5 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.cardBackground, borderRadius: 12, paddingHorizontal: 12, margin: 16, borderWidth: 1, borderColor: COLORS.border },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16, color: COLORS.text, paddingVertical: 12 },
  filterContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 8 },
  filterSection: { marginRight: 16 },
  filterLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  filterPill: { backgroundColor: COLORS.cardBackground, borderRadius: 16, paddingVertical: 6, paddingHorizontal: 12, marginRight: 8, borderWidth: 1, borderColor: COLORS.border },
  activePill: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterPillText: { fontSize: 14, color: COLORS.text },
  activePillText: { color: COLORS.white },
  filterDivider: { width: 1, height: 24, backgroundColor: COLORS.border, marginHorizontal: 16 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  itemCard: { width: '48%', backgroundColor: COLORS.card, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border, marginBottom: 16 },
  itemContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12 },
  itemName: { fontSize: 16, fontWeight: '600', color: COLORS.text, flex: 1 },
  itemCount: { fontSize: 14, color: COLORS.textSecondary },
  addButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 32 },
  emptyStateIcon: { marginBottom: 16 },
  emptyStateText: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  emptyStateSubText: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center' },
};

export default AddItemModal;