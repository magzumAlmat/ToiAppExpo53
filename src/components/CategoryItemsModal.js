import React, { useCallback } from 'react';
import {
  Modal,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';
import SelectedItem from './SelectedItem';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

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
}) => {
  const selectedItems = filteredData.filter((item) => item.type === categoryType).sort((a, b) => (typeOrder[a.type] || 11) - (typeOrder[b.type] || 11));
  const sortedCategoryItems = [...categoryItems].sort((a, b) => (typeOrder[a.type] || 11) - (typeOrder[b.type] || 11));

  const renderCategoryItem = useCallback(({ item }) => {
    const isSelected = selectedItems.some((selected) => `${selected.type}-${selected.id}` === `${item.type}-${item.id}`);
    const count = selectedItems.filter((selected) => `${selected.type}-${selected.id}` === `${item.type}-${item.id}`).length;
    const cost = item.type === 'restaurant' ? item.averageCost : item.cost;
    const title = {
      restaurant: `${item.name} (${cost} ₸)`,
      clothing: `${item.storeName} - ${item.itemName} (${cost} ₸)`,
      flowers: `${item.salonName} - ${item.flowerName} (${cost} ₸)`,
      cake: `${item.name} (${cost} ₸)`,
      alcohol: `${item.salonName} - ${item.alcoholName} (${cost} ₸)`,
      program: `${item.teamName} (${cost} ₸)`,
      tamada: `${item.name} (${cost} ₸)`,
      traditionalGift: `${item.salonName} - ${item.itemName} (${cost} ₸)`,
      transport: `${item.salonName} - ${item.carName} (${cost} ₸)`,
      goods: `${item.item_name} (${cost} ₸)`,
      jewelry: `${item.storeName} - ${item.itemName} (${cost} ₸)`,
    }[item.type] || 'Неизвестный элемент';

    return (
      <TouchableOpacity
        style={[styles.itemCard, isSelected && styles.selectedItemCard]}
        onPress={() => {
          if (!isSelected) {
            if (item.type === 'restaurant' && guestCount) {
              const totalGuests = parseInt(guestCount, 10);
              if (totalGuests > item.capacity) {
                alert(`Этот ресторан не может вместить ${totalGuests} гостей. Максимальная вместимость: ${item.capacity}.`);
                return;
              }
            }
            handleAddItem(item);
            const category = typeToCategoryMap[item.type];
            if (category) updateCategories(category);
          }
        }}
        disabled={isSelected}
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
  }, [handleAddItem, setDetailsModalVisible, setSelectedItem, onClose, selectedItems, updateCategories, guestCount]);

  const handleClose = () => onClose();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <SafeAreaView style={styles.container}>
        <Animated.View entering={SlideInDown} exiting={SlideOutDown} style={styles.modalContainer}>
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{categoryLabel}</Text>
            <TouchableOpacity onPress={handleClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
          {selectedItems.length > 0 && (
            <View style={styles.selectedItemsSection}>
              <Text style={styles.sectionTitle}>Выбранные элементы ({selectedItems.length})</Text>
              <FlatList
                data={selectedItems}
                renderItem={({ item }) => (
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
                  />
                )}
                keyExtractor={(item) => `${item.type}-${item.id}`}
                style={styles.selectedItemsList}
              />
            </View>
          )}
          <FlatList
            data={sortedCategoryItems}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => `${item.type}-${item.id}`}
            numColumns={2}
            contentContainerStyle={styles.scrollContent}
            ListEmptyComponent={<View style={styles.emptyState}><Ionicons name="sad-outline" size={40} color={COLORS.textSecondary} style={styles.emptyStateIcon} /><Text style={styles.emptyStateText}>Элементы не найдены</Text></View>}
          />
        </Animated.View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = {
  container: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  modalContainer: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT * 0.95, backgroundColor: COLORS.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden' },
  handleContainer: { alignItems: 'center', paddingVertical: 8 },
  handle: { width: 40, height: 5, backgroundColor: COLORS.textSecondary, borderRadius: 2.5 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  selectedItemsSection: { marginBottom: 24, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  selectedItemsList: { marginBottom: 16 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  itemCard: { width: '48%', backgroundColor: COLORS.card, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border, marginBottom: 16 },
  selectedItemCard: { borderColor: COLORS.primary, borderWidth: 2 },
  itemContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12 },
  itemName: { fontSize: 16, fontWeight: '600', color: COLORS.text, flex: 1 },
  itemCount: { fontSize: 14, color: COLORS.textSecondary },
  addButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 32 },
  emptyStateIcon: { marginBottom: 16 },
  emptyStateText: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
};

export default CategoryItemsModal;